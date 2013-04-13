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
import json
import geoutil

def index(request):
    return render(request, 'questionnaire.html')

def saveMarker(request):
    response = {}
    markannotation = json.loads(request.REQUEST.get('markannotation', None))
    if markannotation == None:
	response['id'] = '0'
    else:
	annotation_info = markannotation['annotation']
	print 'markannotation: ', markannotation
	# footprint
	footprint_info = annotation_info['footprints'][0]
	footprint = Footprint(created_at=parser.parse(annotation_info["timeCreated"]), shape=GEOSGeometry('SRID=%s;%s' % (footprint_info["srid"], footprint_info["shape"])) )
	footprint.save()

	author	= User.objects.get(id=int(annotation_info['userId']))
        forum = Forum.objects.get(id=int(annotation_info['forumId']))
        annotation = Annotation(content=annotation_info["content"], author=author, forum=forum, sharelevel=annotation_info["shareLevel"], created_at=parser.parse(annotation_info["timeCreated"]), updated_at=parser.parse(annotation_info["timeCreated"]), contextmap=annotation_info["contextMap"])
        annotation.save()
	GeoReference.objects.create(footprint=footprint, annotation=annotation)
	
	marktype = markannotation['markertype']
	try:
	    route	= Route.objects.get(id=int(markannotation['routeId']))
	    # find the nearest route segment from the marker
	    route_seg   = RouteSegment.objects.filter(route=route).distance(footprint.shape).order_by('distance')[0]

	    print 'annotation: ', annotation, ' type: ', marktype
	    print 'route: ', route, 'route_seg: ', route_seg
	    marker = MarkAnnotation(annotation=annotation, markType=marktype,route=route, route_seg=route_seg)
	    marker.save()
	    print 'marker created: ', marker.id
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
		print 'points on the route: ', (result[1].x, result[1].y), result[2].coords
		print 'route is: ', route_seg.shape.coords
		index_a = route_seg.shape.coords.index((result[1].x, result[1].y))
		index_a = index_a + 1
		index_b = route_seg.shape.coords.index((result[2].x, result[2].y))
		print 'index of the route: ', index_a, index_b

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
    print response
    return HttpResponse(json.dumps(response), mimetype='application/json')

def saveRoute(request):
    response = {}
    route_info = json.loads(request.REQUEST.get('route_info', None))
    print route_info
    if route_info != None:
	user    = User.objects.get(id=int(route_info['userId']))
	# more infor about the route is to be added, i.e. rate, question answers
	try:
	    route = Route(user=user, shape=GEOSGeometry('SRID=%s;%s' % (route_info["srid"], route_info["shape"])))
	    route.save()
	    route_seg = RouteSegment(route=route, shape=GEOSGeometry('SRID=%s;%s' % (route_info["srid"], route_info["shape"])))
	    route_seg.save()
	except Exception as e:
	    print e

	response['id']  = str(route.id)
    else:
	response['id'] = '0'
    return HttpResponse(json.dumps(response), mimetype='application/json')

def loadRoutes(request):
    response = {}
    response['route_segs'] = []
    userId = int(request.REQUEST.get('userId', '0'))
    user = User.objects.get(id=userId)
    # todo: what if there are multiple routes created by one user?
    try:
	route = Route.objects.filter(user=user).order_by('-id')[0]
	response['route_id'] = str(route.id)
	route_segs = RouteSegment.objects.filter(route=route)
	for seg in route_segs:
	    route_seg_info = {}
	    route_seg_info['id'] = str(seg.id)
	    route_seg_info['shape'] = seg.shape.wkt
	    route_seg_info['srid'] = seg.shape.srid
	    response['route_segs'].append(route_seg_info)
    except Route.DoesNotExist:
	response['route_id'] = '0'
    except Exception as e:
	response['route_id'] = '0'
	print e

    return HttpResponse(json.dumps(response), mimetype='application/json')

def loadMarkers(request):
    response = {}
    response['markannotations'] = []
    userId = int(request.REQUEST.get('userId', '0'))
    routeId = int(request.REQUEST.get('routeId', '0'))
    user = User.objects.get(id=userId)

    try:
	route = Route.objects.get(id=routeId)
	markannotations = MarkAnnotation.objects.filter(route=route)
	print markannotations
	for ma in markannotations:
	    ma_info = {}
	    ma_info['id'] = str(ma.id)
	    ma_info['markType'] = str(ma.markType)
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
    try:
	route = Route.objects.get(id=route_id)
    except Route.DoesNotExist:
	return HttpResponse('null') 
    else:
	if request.method == 'GET':
	    return render(request, 'questions.html', {'step': step, 'WalkOrBike': route.transport})
	if request.method == 'POST':
	    nextStep = str(int(step) + 1)
	    if step == '0':
		route.transport = request.POST.get('WalkOrBike', 'Walk')
		route.save()
		return redirect('/questionnaire/questions/{0}/{1}'.format(route_id, nextStep))
	    elif step == '1':
		route.pathType		= request.POST.get('pathType', '')
		route.pathCondition	= request.POST.get('pathCondition', 0)
		route.easeGoing		= request.POST.get('easeGoing', 0)
		route.easeCrossing	= request.POST.get('easeCrossing', 0)
		route.save()
		return render(request, 'questions.html', 
			{'step': nextStep, 'WalkOrBike': route.transport})
	    elif step == '2':
		# use special character to split multiple choices
		safetyChoices		= '@'.join(request.POST.get('safetyChoices', []))
		safetyChoices	= safetyChoices + '@' + request.POST.get('safetyChoicesText', '')
		driverBehavior		= '@'.join(request.POST.get('driverBehavior', []))
		driverBehavior		= driverBehavior + '@' + request.POST.get('driverBehaviorText', '')
		
		route.safetyChoices	= safetyChoices
		route.driverBehavior	= driverBehavior
		route.save()
		return render(request, 'questions.html', 
			{'step': nextStep, 'WalkOrBike': route.transport})
	    elif step == '3':
		encourageMethods	= '@'.join(request.POST.get('encourageMethods', []))
		encourageMethods	= encourageMethods + '@' + request.POST.get('encourageMethodsText', '')

		route.groceryFrequency	= request.POST.get('groceryFrequency', 0)
		route.funFrequency	= request.POST.get('funFrequency', 0)
		route.exerciseFrequency	= request.POST.get('exerciseFrequency', 0)
		route.encourageMethods	= encourageMethods		
		route.save()
		return render(request, 'questions.html', 
			{'step': nextStep, 'WalkOrBike': route.transport})
