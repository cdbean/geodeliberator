# Create your views here.
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db.models import Q
from django.db.models import Count
from django.contrib.gis.geos import *
from django.contrib.gis.gdal import SpatialReference, CoordTransform
from django.shortcuts import render, redirect
from django.template import RequestContext

from questionnaire.geoutil import *
from questionnaire.models import *
from geodeliberator.api.models import *

from dateutil import parser
from itertools import chain
import json
import geoutil

def index(request):
    response = {}
    if request.user.is_authenticated():
	response['userId'] = request.user.id
	return render(request, 'questionnaire.html', response)
    else:
	return redirect('/user/login')

def saveMarker(request):
    response = {}
    markannotations = json.loads(request.REQUEST.get('markannotations', None))
    if markannotations == None:
	response['id'] = '0'
    else:
	for markannotation in markannotations:
	    annotation_info = markannotation['annotation']
	    # footprint
	    footprint_info = annotation_info['footprints'][0]
	    footprint = Footprint(created_at=parser.parse(annotation_info["timeCreated"]), shape=GEOSGeometry('SRID=%s;%s' % (footprint_info["srid"], footprint_info["shape"])) )
	    footprint.save()

	    author	= User.objects.get(id=int(annotation_info['userId']))
	    forum = Forum.objects.get(id=int(annotation_info['forumId']))
	    procon	= annotation_info.get('procon', 'con')
	    annotation = Annotation(content=annotation_info["content"], author=author, forum=forum, sharelevel=annotation_info["shareLevel"], created_at=parser.parse(annotation_info["timeCreated"]), updated_at=parser.parse(annotation_info["timeCreated"]), contextmap=annotation_info["contextMap"])
	    annotation.save()
	    GeoReference.objects.create(footprint=footprint, annotation=annotation)
	    
	    marktype = markannotation['markertype']
	    try:
		route	= Route.objects.get(id=int(markannotation['routeId']))
		# find the nearest route segment from the marker
		route_seg   = RouteSegment.objects.filter(route=route).distance(footprint.shape).order_by('distance')[0]

		marker = MarkAnnotation(procon=procon, annotation=annotation, markType=marktype,route=route, route_seg=route_seg)
		marker.save()
	    except Exception as e:
		print e
	    response['id'] = str(marker.id);

	    if marktype == 'stop':
		# split route 
		import shapely
		import django
		routeSeg_info = {}
		try:
		    # line_locate_point (line, point)
		    # line: shapely.geometry.LineString, almost equal to django.contrib.gis.geos.LineString
		    # point: shapely.geometry.Point, has to explicitly cast from django...Point
		    # return: result[3]
		    # result[0]: the split point
		    # result[1]: point 'before' the split point
		    # result[2]: point 'after' the split point
		    trans = CoordTransform(SpatialReference(900913), SpatialReference(4326))
		    footprint.shape.transform(trans) # transform footprint from 900913 to 4326
		    result = geoutil.line_locate_point(route_seg.shape, shapely.geometry.Point(footprint.shape))
		    # split original route segment
		    index_a = route_seg.shape.coords.index((result[1].x, result[1].y))
		    index_a = index_a + 1
		    index_b = route_seg.shape.coords.index((result[2].x, result[2].y))

		    route_seg_a_list = list(route_seg.shape.coords[:index_a])
		    route_seg_a_list.append((result[0].x, result[0].y))
		    route_seg_b_list = list(route_seg.shape.coords[index_b:])
		    route_seg_b_list.insert(0, (result[0].x, result[0].y))
		    route_seg_a = django.contrib.gis.geos.LineString(route_seg_a_list)
		    route_seg_b = django.contrib.gis.geos.LineString(route_seg_b_list)
		    routeA = RouteSegment.objects.create(route=route, shape=route_seg_a)
		    routeB = RouteSegment.objects.create(route=route, shape=route_seg_b)

		    routeSeg_info['ori_route_id'] = route_seg.id
		    routeSeg_info['routeA_id'] = routeA.id
		    routeSeg_info['routeB_id'] = routeB.id
		    routeSeg_info['routeA_shape'] = routeA.shape.wkt
		    routeSeg_info['routeB_shape'] = routeB.shape.wkt
		    response['route'] = routeSeg_info

		    # update all markers that is referenced to this route segment
		    route_markers = MarkAnnotation.objects.filter(route_seg=route_seg)
		    for rm in route_markers:
			if routeA.shape.distance(rm.annotation.footprints.all()[0].shape) > routeB.shape.distance(rm.annotation.footprints.all()[0].shape):
			    rm.route_seg = routeB
			else:
			    rm.route_seg = routeA
			rm.save()

		    route_seg.delete()
		except Exception as e:
		    print e
    return HttpResponse(json.dumps(response), mimetype='application/json')

def saveRoute(request):
    response = {}
    route_info = json.loads(request.REQUEST.get('route_info', None))
    if route_info != None:
	user    = User.objects.get(id=int(route_info['userId']))
	# more infor about the route is to be added, i.e. rate, question answers
	try:
	    route = Route(user=user, shape=GEOSGeometry('SRID=%s;%s' % (route_info["srid"], route_info["shape"])))
	    route.save()
	    route_seg = RouteSegment(route=route, shape=GEOSGeometry('SRID=%s;%s' % (route_info["srid"], route_info["shape"])))
	    route_seg.save()
	    response['id']  = str(route.id)
	    response['shape'] = route.shape.wkt
	    response['owner'] = {}
	    response['owner']['id'] = route.user.id
	    response['owner']['name'] = route.user.username
	    response['srid'] = route.shape.srid
	    response['visibility'] = route.visibility
	except Exception as e:
	    response['id'] = '0'
	    print e
    else:
	response['id'] = '0'
    return HttpResponse(json.dumps(response), mimetype='application/json')

# todo: query routes by bounding box
def loadRoutes(request):
    response = {}
    response['route_segs'] = []
    response['routes'] = []
    userId = int(request.REQUEST.get('userId', '0'))
    user = User.objects.get(id=userId)
    # todo: what if there are multiple routes created by one user?
    try:
	selfRoutes = Route.objects.filter(user=user)
	otherRoutes = Route.objects.exclude(user=user).filter(visibility='everyone')
	routes = list(chain(selfRoutes, otherRoutes))

	for route in routes:
	    route_info = {}
	    route_info['id'] = str(route.id)
	    route_info['shape'] = route.shape.wkt
	    route_info['srid'] = route.shape.srid
	    route_info['visibility'] = route.visibility
	    route_info['owner'] = {}
	    route_info['owner']['id'] = route.user.id
	    route_info['owner']['name'] = route.user.username
	    route_info['rate'] = route.pathCondition
	    response['routes'].append(route_info)
	
	    route_info['markers'] = []
	    markannotations = MarkAnnotation.objects.filter(route=route)
	    for ma in markannotations:
		ma_info = {}
		ma_info['id'] = str(ma.id)
		ma_info['type'] = str(ma.markType)
		ma_info['route'] = str(ma.route.id)
		ma_info['seg'] = str(ma.route_seg.id)
		annotation = ma.annotation
		ma_info['footprints'] = []
		for fp in annotation.footprints.all():
		    fp_info = {}
		    fp_info['shape'] = fp.shape.wkt
		    fp_info['srid'] = fp.shape.srid
		    ma_info['footprints'].append(fp_info)
		route_info['markers'].append(ma_info)

	    route_segs = RouteSegment.objects.filter(route=route)
	    for seg in route_segs:
		route_seg_info = {}
		route_seg_info['id'] = str(seg.id)
		route_seg_info['shape'] = seg.shape.wkt
		route_seg_info['srid'] = seg.shape.srid
		route_seg_info['ref'] = str(route.id)
		response['route_segs'].append(route_seg_info)
    except Exception as e:
	print e

    return HttpResponse(json.dumps(response), mimetype='application/json')

def loadMarkers(request):
    response = {}
    response['markannotations'] = []
    try:
	userId = int(request.REQUEST.get('userId', '0'))
	routesId = request.REQUEST.get('routesId', [])
	user = User.objects.get(id=userId)
    except Exception as e:
	print e

    try:
	for routeId in routesId:
	    route = Route.objects.get(id=routeId)
	    markannotations = MarkAnnotation.objects.filter(route=route)
	    for ma in markannotations:
		ma_info = {}
		ma_info['id'] = str(ma.id)
		ma_info['markType'] = str(ma.markType)
		ma_info['route'] = str(ma.route.id)
		ma_info['seg'] = str(ma.route_seg.id)
		annotation = ma.annotation
		ma_info['footprints'] = []
		for fp in annotation.footprints.all():
		    fp_info = {}
		    fp_info['shape'] = fp.shape.wkt
		    fp_info['srid'] = fp.shape.srid
		    ma_info['footprints'].append(fp_info)
		response['markannotations'].append(ma_info)
    except Exception as e:
	print e
    return HttpResponse(json.dumps(response), mimetype='application/json')

def loadQuestions(request, route_id, step):
    res = {}
    res['step'] = step
    try:
	route = Route.objects.get(id=route_id)
	res['WalkOrBike'] = route.transport
	res['reasons'] = route.reasons.split('@')
	res['transport'] = route.transport
	res['pathType']  = route.pathType
	res['pathCondition']  = route.pathCondition
	res['easeGoing']  = route.easeGoing
	res['easeCrossing']  = route.easeCrossing
	res['detour']  = route.detour
	res['safetyChoices']  = route.safetyChoices.split('@')
	res['driverBehaviors']  = route.driverBehaviors.split('@')
	res['groceryFrequency']  = route.groceryFrequency
	res['funFrequency']  = route.funFrequency
	res['exerciseFrequency']  = route.exerciseFrequency
	res['encourageMethods']  = route.encourageMethods.split('@')
    except Route.DoesNotExist:
	return HttpResponse('null') 
    else:
	if request.method == 'GET':
	    return render(request, 'questions.html', res)
	if request.method == 'POST':
	    nextStep = str(int(step) + 1)
	    res['step'] = nextStep
	    if step == '0':
		route.transport = request.POST.get('WalkOrBike', 'Walk')
		route.reasons    = '@'.join(request.POST.getlist('reasons'))
		route.save()
		return redirect('/questionnaire/questions/{0}/{1}'.format(route_id, nextStep))
	    elif step == '1':
		route.pathType		= request.POST.get('pathType', '')
		route.pathCondition	= request.POST.get('pathCondition', 0)
		route.easeGoing		= request.POST.get('easeGoing', 0)
		route.easeCrossing	= request.POST.get('easeCrossing', 0)
		route.detour		= request.POST.get('detour', 'No')
		route.save()
		return render(request, 'questions.html', res) 
	    elif step == '2':
		# use special character to split multiple choices
		safetyChoices		= '@'.join(request.POST.getlist('safetyChoices'))
		safetyChoices	= safetyChoices + '@' + request.POST.get('safetyChoicesText', '')
		driverBehaviors		= '@'.join(request.POST.getlist('driverBehaviors'))
		driverBehaviors		= driverBehaviors + '@' + request.POST.get('driverBehaviorsText', '')
		

		route.safetyChoices	= safetyChoices
		route.driverBehaviors	= driverBehaviors
		route.save()
		return render(request, 'questions.html', res) 
	    elif step == '3':
		encourageMethods	= '@'.join(request.POST.getlist('encourageMethods'))
		encourageMethods	= encourageMethods + '@' + request.POST.get('encourageMethodsText', '')

		route.groceryFrequency	= request.POST.get('groceryFrequency', 0)
		route.funFrequency	= request.POST.get('funFrequency', 0)
		route.exerciseFrequency	= request.POST.get('exerciseFrequency', 0)
		route.encourageMethods	= encourageMethods		
		route.save()
		return render(request, 'questions.html', res) 

def loadRouteSummary(request, routeId):
    res= {}
    try:
	route = Route.objects.get(id=routeId)
    except Route.DoesNotExist:
	res= "Error: Route does not exist!"
    else:
	res['owner']	  = route.user.username
	res['visibility'] = route.visibility
	res['reasons'] = route.reasons.split('@')
	res['transport'] = route.transport
	res['pathType']  = route.pathType
	res['pathCondition']  = route.pathCondition
	res['easeGoing']  = route.easeGoing
	res['easeCrossing']  = route.easeCrossing
	res['detour']  = route.detour
	res['safetyChoices']  = route.safetyChoices.split('@')
	res['driverBehaviors']  = route.driverBehaviors.split('@')
	res['groceryFrequency']  = route.groceryFrequency
	res['funFrequency']  = route.funFrequency
	res['exerciseFrequency']  = route.exerciseFrequency
	res['encourageMethods']  = route.encourageMethods.split('@')

    return render(request, 'routeSummary.html', res)
		

def setVisibility(request, routeId):
    response = {}
    if request.method == 'POST':
	route_id = int(request.POST.get('routeId', '0'))
	user_id  = int(request.POST.get('userId', '0'))
	
	try:
	    user	= User.objects.get(id=user_id)
	    route	= Route.objects.filter(user=user).get(id=route_id)
	    route.visibility = request.POST.get('visibility', 'everyone')
	    route.save()

	except Exception as e:
	    response['error'] = ''
	    print 'Error: set route visibility failed:  ',  e
    return HttpResponse(json.dumps(response), mimetype='application/json')

def deleteRoute(request, routeId):
    response = {}
    if request.method == 'POST':
	route_id = int(request.POST.get('routeId', '0'))
	user_id  = int(request.POST.get('userId', '0'))
	try:
	    user	= User.objects.get(id=user_id)
	    route	= Route.objects.filter(user=user).get(id=route_id)
	    markers	= MarkAnnotation.objects.filter(route=route)
	    route_segs  = RouteSegment.objects.filter(route=route)
	    for seg in route_segs:
		seg.delete()
	    for marker in markers:
		marker.delete()
	    route.delete()
	    response['success'] = True

	except Exception as e:
	    response['success'] = False
	    response['error'] = 'Delete route failed, please try later'
	    print 'Error: delete route failed: ', e
    return HttpResponse(json.dumps(response), mimetype='application/json')

