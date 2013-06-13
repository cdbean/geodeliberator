from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db.models import Q
from django.db.models import Count
from django.contrib.gis.geos import *

from dateutil import parser

from api.models import *

import json

def api_user(request):
    response = {}
    userId = int(request.REQUEST.get('userId', '0'))
    if userId > 0:
        try:
            user = User.objects.get(id=userId)
            role = Membership.objects.filter(user_id=userId);
            #print 'about to print the role!!!!!!!!!'
            #print role[0].role
            response["id"] = str(user.id)
            response["userName"] = user.username
            response["email"] = user.email
            response["first_name"] = user.first_name
            response["last_name"] = user.last_name
            response["role"] = role[0].role
        except User.DoesNotExist:
            response["id"] = '-1'
            response["userName"] = 'DoesNotExist'
    else:
        response["id"] = '0'
        response["userName"] = 'Guest'
    return HttpResponse(json.dumps(response), mimetype='application/json')

def api_forum(request):
    response = {}
    forumId = int(request.REQUEST.get('forumId', '0')) or int(request.REQUEST.get('groupId', '0'))
    if forumId > 0:
        try:
            forum = Forum.objects.get(id=forumId)
            response["id"] = str(forum.id)
            response["name"] = str(forum.name)
            print "forum's name is: "+str(forum.name)
            response["description"] = forum.description
            response["scope"] = forum.scope
            response["contextmap"] = forum.contextmap
        except Forum.DoesNotExist:
            pass
    return HttpResponse(json.dumps(response), mimetype='application/json')

def api_forums(request):
    response = {}
    userId = int(request.REQUEST.get('userId', '0'))
    if userId > 0:
        try:
            user = User.objects.get(id=userId)
            # participating forums
            response["participating"] = []
            for forum in user.joined_forums.all():
                role = Membership.objects.get(user_id=userId, forum=forum.id);
                print "the role in api_forums is: "+role.role
                forum_info = {}
                forum_info["id"] = str(forum.id)
                forum_info["name"] = forum.name
                forum_info["role"] = role.role
                #print '!!!!!!!!!!!!the role of user of forum is: '+forum.role
                response["participating"].append(forum_info)
        except User.DoesNotExist:
            pass
    # public forums        
    response["public"] = []    
    
    for forum in Forum.objects.filter(scope='public'):
        forum_info = {}
        forum_info["id"] = str(forum.id)
        forum_info["name"] = forum.name
        if userId <= 0 or userId not in forum.members.values_list('id', flat=True):
            response["public"].append(forum_info)    
    return HttpResponse(json.dumps(response), mimetype='application/json')

def api_userlist(request):
    response = {}
    userId = int(request.REQUEST.get('userId', '0'))    #need verify the user. latter.
    #print '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!the user ID is: ' + str(userId)
    current_forumId= int(request.REQUEST.get('forumId', '0'))
    #print '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!current_forumId is: '+str(current_forumId)
    #current_forumId = 1 #this need to be deleted.
    response["user_list"] = []
    for user in Membership.objects.filter(forum=current_forumId):
        user_info = {}
        user_info["id"] = str(user.user.id)
        user_info["name"] = str(user.user)
        user_info["role"] = str(user.role)
        #print '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!role is: '+str(user.role)
        response["user_list"].append(user_info)    
    
    return HttpResponse(json.dumps(response), mimetype='application/json')

def api_authentication(request):
    response = {}
    username = str(request.REQUEST.get('userName', ''))
    password = str(request.REQUEST.get('password', ''))
    user = authenticate(username=username, password=password)
    if user is not None:
        if user.is_active:
            response["success"] = True
            response["data"] = {"userId": user.id, "userName": user.username}
        else:
            response["success"] = False
            response["data"] = {"userId": user.id, "userName": user.username}
            response["errors"] = {"reason": "Your account has been disabled!"}
    else:
        response["success"] = False
        response["errors"] = {"reason": "Your username and password were incorrect."}
    return HttpResponse(json.dumps(response), mimetype='application/json')

def api_foruminfo(request):
    #print "api_foruminfo inside"
    response = {}
    forumId = int(request.REQUEST.get('forumId', '0')) or int(request.REQUEST.get('groupId', '0'))
    #print "Forum Id is: " + str(forumId)
    if forumId > 0:
        try:
            newinfo = str(request.REQUEST.get('newinfo', '0'))
            #print "new info is: " + newinfo
            forum = Forum.objects.get(id=forumId)
            print str(forum.description)
            forum.description=newinfo
            print str(forum.description)
            forum.save()
            response["success"] = True
        except Forum.DoesNotExist:
            pass
    return HttpResponse(json.dumps(response), mimetype='application/json')
        

def api_annotations(request):
    response = {}
    userId = int(request.REQUEST.get('userId', '0'))
    forumId = int(request.REQUEST.get('forumId', '0')) or int(request.REQUEST.get('groupId', '0'))
    start = int(request.REQUEST.get('start', '0'))
    limit = int(request.REQUEST.get('limit', '-1'))
    footprintId = int(request.REQUEST.get('footprintId', '0'))
    ownerOnly = str(request.REQUEST.get('ownerOnly', 'false')).lower()
    startDate = str(request.REQUEST.get('startDate', ''))
    endDate = str(request.REQUEST.get('endDate', ''))
    bbox = str(request.REQUEST.get('bbox', ''))

    if footprintId > 0:
        annotations = Footprint.objects.get(id=footprintId).referred_annotations
    elif len(bbox) > 0:
        bbox_poly = Polygon.from_bbox(bbox.split(','))
        footprints = Footprint.objects.filter(Q(shape__within=bbox_poly) | Q(shape__overlaps=bbox_poly))
        inner_q = GeoReference.objects.filter(footprint__in=footprints).values('annotation').query
        annotations = Annotation.objects.filter(id__in=inner_q)
    else:
        annotations = Annotation.objects.all()
         
    if forumId > 0:
        annotations = annotations.filter(forum=forumId)
    if ownerOnly == 'true' and userId > 0:
        annotations = annotations.filter(author=userId)
    if len(startDate) > 0:
        annotations = annotations.filter(created_at__gte=parser.parse(startDate))
    if len(endDate) > 0:
        annotations = annotations.exclude(created_at__gte=parser.parse(endDate))
    
    annotations = annotations.order_by('-created_at')
    response['totalCount'] = annotations.count()
    
    if limit > -1:
        annotations = annotations[start:start+limit]
    response['annotations'] = []
    for annotation in annotations:
        annotation_info = {}
        annotation_info['id'] = str(annotation.id)
        annotation_info['type'] = annotation.content_type
        annotation_info['forumId'] = str(annotation.forum.id)
        annotation_info['userId'] = str(annotation.author.id)
        annotation_info['userName'] = annotation.author.username
        annotation_info['shareLevel'] = annotation.sharelevel
        annotation_info['timeCreated'] = annotation.created_at.ctime()
        annotation_info['timeUpdated'] = annotation.updated_at.ctime()
        annotation_info['excerpt'] = annotation.get_excerpt(10)
        annotation_info['content'] = annotation.content        
        response['annotations'].append(annotation_info)
    return HttpResponse(json.dumps(response), mimetype='application/json')

def api_annotation(request):
    response = {}
    userId = int(request.REQUEST.get('userId', '0'))
    forumId = int(request.REQUEST.get('forumId', '0')) or int(request.REQUEST.get('groupId', '0'))
    annotationId = int(request.REQUEST.get('annotationId', '0'))
    deleteId = int(request.REQUEST.get('delete', '0'))
    new = request.REQUEST.get('new', '')
    if len(new) > 0:
        try:
            annotation_info = json.loads(new)
            response = add_annotation(annotation_info)
        except Exception, e:
            print e.message
            raise e
    elif deleteId > 0:
        response = delete_annotation(deleteId)
    elif annotationId > 0:
        response = get_annotation(annotationId)
    return HttpResponse(json.dumps(response), mimetype='application/json')

def add_annotation(annotation_info):
    response = {}
    if int(annotation_info['id']) <= 0:
        # new annotation
        author = User.objects.get(id=int(annotation_info['userId']))
        forum = Forum.objects.get(id=int(annotation_info['forumId']))
        
        annotation = Annotation(content=annotation_info["content"], author=author, forum=forum, sharelevel=annotation_info["shareLevel"], created_at=parser.parse(annotation_info["timeCreated"]), updated_at=parser.parse(annotation_info["timeCreated"]), contextmap=annotation_info["contextMap"])
        annotation.save()
        print 'int(annotation_info.id)'        
    
        content = annotation.content;
        for reference_id in annotation_info["references"]:
            source = Annotation.objects.get(id=int(reference_id))
            ThemeReference.objects.create(source=source, target=annotation)
        for footprint_info in annotation_info["footprints"]:
            if int(footprint_info["id"]) > 0:
                footprint = Footprint.objects.get(id=int(footprint_info["id"]))
                GeoReference.objects.create(footprint=footprint, annotation=annotation)
            elif len(footprint_info["shape"]) > 0:
                footprint = Footprint.objects.create(created_at=parser.parse(annotation_info["timeCreated"]), shape=GEOSGeometry('SRID=%s;%s' % (footprint_info["srid"], footprint_info["shape"])) )
                GeoReference.objects.create(footprint=footprint, annotation=annotation)
                # replace temporary footprint ids
                content = content.replace("fp-"+str(-int(footprint_info["id"])), "fp"+str(footprint.id))
                content = content.replace("FP-"+str(-int(footprint_info["id"])), "fp"+str(footprint.id))
                content = content.replace("Fp-"+str(-int(footprint_info["id"])), "fp"+str(footprint.id))
        annotation.content = content;
        annotation.save()
    else:
        # edit existing annotation
        annotation = Annotation.objects.get(id=int(annotation_info['id']))
        author = User.objects.get(id=int(annotation_info['userId']))
        forum = Forum.objects.get(id=int(annotation_info['forumId']))
        annotation.content = annotation_info["content"]
        annotation.author = author
        annotation.forum = forum
        annotation.sharelevel = annotation_info["shareLevel"]; 
        annotation.updated_at = parser.parse(annotation_info["timeCreated"]); 
        annotation.contextmap = annotation_info["contextMap"];
        content = annotation.content
        for reference_id in annotation_info["references"]:
            source = Annotation.objects.get(id=int(reference_id))
            if not ThemeReference.objects.filter(source=source).filter(target=annotation).exists():
                ThemeReference.objects.create(source=source, target=annotation)
        for footprint_info in annotation_info["footprints"]:
            if int(footprint_info["id"]) > 0:
                footprint = Footprint.objects.get(id=int(footprint_info["id"]))
                if not GeoReference.objects.filter(footprint=footprint).filter(annotation=annotation).exists():
                    GeoReference.objects.create(footprint=footprint, annotation=annotation)
            elif len(footprint_info["shape"]) > 0:
                footprint = Footprint.objects.create(created_at=parser.parse(annotation_info["timeCreated"]), shape=GEOSGeometry('SRID=%s;%s' % (footprint_info["srid"], footprint_info["shape"])) )
                GeoReference.objects.create(footprint=footprint, annotation=annotation)
                # replace temporary footprint ids
                content = content.replace("fp-"+str(-int(footprint_info["id"])), "fp"+str(footprint.id))
                content = content.replace("FP-"+str(-int(footprint_info["id"])), "fp"+str(footprint.id))
                content = content.replace("Fp-"+str(-int(footprint_info["id"])), "fp"+str(footprint.id))
        annotation.content = content;
        annotation.save()
    response["success"] = True
    response["data"] = {"id": annotation.id}
    return response
    
def delete_annotation(annotation_id):
    response = {}
    try:
        annotation = Annotation.objects.get(id=annotation_id)
        annotation.delete()
        response["success"] = True
    except Annotation.DoesNotExist:
        response["success"] = False
        response["errors"] = {"reason": "The annotation does not exist!"}
    return response
        
def get_annotation(annotation_id):
    annotation_info = {}
    try:
        annotation = Annotation.objects.get(id=annotation_id)
        annotation_info['id'] = str(annotation.id)
        annotation_info['type'] = annotation.content_type
        annotation_info['forumId'] = str(annotation.forum.id)
        annotation_info['userId'] = str(annotation.author.id)
        annotation_info['userName'] = annotation.author.username
        annotation_info['shareLevel'] = annotation.sharelevel
        annotation_info['timeCreated'] = annotation.created_at.ctime()
        annotation_info['timeUpdated'] = annotation.updated_at.ctime()
        annotation_info['excerpt'] = annotation.get_excerpt(10)
        annotation_info['content'] = annotation.content 
        annotation_info['contextmap'] = annotation.contextmap 
        annotation_info['replies'] = ThemeReference.objects.filter(source=annotation_id).count()  
        # get references
        theme_references = ThemeReference.objects.filter(target=annotation_id)
        annotation_info['references'] = []
        for reference in theme_references:
            reference_info = {}
            reference_info['id'] = str(reference.source.id)
            reference_info['type'] = reference.source.content_type
            reference_info['forumId'] = str(reference.source.forum.id)
            reference_info['userId'] = str(reference.source.author.id)
            reference_info['userName'] = reference.source.author.username
            reference_info['shareLevel'] = reference.source.sharelevel
            reference_info['timeCreated'] = reference.source.created_at.ctime()
            reference_info['timeUpdated'] = reference.source.updated_at.ctime()
            reference_info['excerpt'] = reference.source.get_excerpt(10)
            reference_info['alias'] = reference.alias
            reference_info['relation'] = reference.relation
            annotation_info['references'].append(reference_info)
        # get footprints
        geo_refenreces = GeoReference.objects.filter(annotation=annotation_id)
        annotation_info['footprints'] = []      
        for reference in geo_refenreces:
            reference_info = {}
            reference_info['id'] = str(reference.footprint.id)
            reference_info['name'] = str(reference.footprint.name)
            reference_info['timeCreated'] = reference.footprint.created_at.ctime()
            reference_info['shape'] = reference.footprint.shape.wkt
            reference_info['srid'] = reference.footprint.shape.srid
            reference_info['type'] = reference.footprint.shape.geom_type
            reference_info['refCount'] = reference.footprint.referred_annotations.count()
            reference_info['alias'] = reference.alias
            annotation_info['footprints'].append(reference_info)
    except Annotation.DoesNotExist:
        pass
    return annotation_info

def api_map(request):
    response = {}
    userId = int(request.REQUEST.get('userId', '0'))
    forumId = int(request.REQUEST.get('forumId', '0')) or int(request.REQUEST.get('groupId', '0'))
    annotationId = int(request.REQUEST.get('annotationId', '0')) or int(request.REQUEST.get('issueId', '0')) or int(request.REQUEST.get('commentId', '0'))
    if annotationId > 0:
        try:
            annotation = Annotation.objects.get(id=annotationId)
            response["mapString"] = annotation.contextmap
            response["type"] = annotation.content_type
            response["annotationId"] = annotation.id
            response["footprints"] = []
            for footprint in annotation.footprints.all():
                footprint_info = {}
                footprint_info['id'] = str(footprint.id)
                footprint_info['name'] = str(footprint.name)
                footprint_info['timeCreated'] = footprint.created_at.ctime()
                footprint_info['shape'] = footprint.shape.wkt
                footprint_info['srid'] = footprint.shape.srid
                footprint_info['type'] = footprint.shape.geom_type
                footprint_info['refCount'] = footprint.referred_annotations.count()
                response['footprints'].append(footprint_info)            
        except Annotation.DoesNotExist:
            pass
    elif forumId > 0:
        try:
            forum = Forum.objects.get(id=forumId)
            response["mapString"] = forum.contextmap
            response["type"] = 'group'
            response["forumId"] = str(forum.id)
            response["footprints"] = []
            annotations_q = forum.annotation_set.values('id').query
            footprints_q = GeoReference.objects.filter(annotation__in=annotations_q).values('footprint').distinct()
            footprints = Footprint.objects.filter(id__in=footprints_q)
            for footprint in footprints:
                footprint_info = {}
                footprint_info['id'] = str(footprint.id)
                footprint_info['name'] = str(footprint.name)
                footprint_info['timeCreated'] = footprint.created_at.ctime()
                footprint_info['shape'] = footprint.shape.wkt
                footprint_info['srid'] = footprint.shape.srid
                footprint_info['type'] = footprint.shape.geom_type
                footprint_info['refCount'] = footprint.referred_annotations.count()
                response['footprints'].append(footprint_info)            
        except Forum.DoesNotExist:
            pass
        
    return HttpResponse(json.dumps(response), mimetype='application/json')

def api_timeline(request):
    response = {}
    userId = int(request.REQUEST.get('userId', '0'))
    forumId = int(request.REQUEST.get('forumId', '0')) or int(request.REQUEST.get('groupId', '0'))    
    unit = request.REQUEST.get('unit', '0')
    startDate = str(request.REQUEST.get('startDate', ''))
    endDate = str(request.REQUEST.get('endDate', ''))

    response["earliestDate"] = Annotation.objects.filter(forum=forumId).order_by('created_at')[0].created_at.ctime()
    response["latestDate"] = Annotation.objects.filter(forum=forumId).order_by('-created_at')[0].created_at.ctime()
    response["timeline"] = []
    
    # Postgres specific
    byunit_select = {unit: "DATE_TRUNC('" + unit + "', created_at)"} 
    annotations = Annotation.objects.filter(forum=forumId)
    if len(startDate) > 0:
        annotations = annotations.filter(created_at__gte=parser.parse(startDate))
    if len(endDate) > 0:
        annotations = annotations.exclude(created_at__gte=parser.parse(endDate))

    items = annotations.extra(select=byunit_select).values(unit).annotate(count=Count('id')).order_by(unit)
    for item in items:
        time_item = {}
        time_item[unit] = item[unit].ctime()
        time_item["count"] = item["count"]
        response["timeline"].append(time_item)
    return HttpResponse(json.dumps(response), mimetype='application/json')

def api_threads(request):
    response = {}
    userId = int(request.REQUEST.get('userId', '0'))
    forumId = int(request.REQUEST.get('forumId', '0')) or int(request.REQUEST.get('groupId', '0'))
    annotationId = int(request.REQUEST.get('annotationId', '0'))
    try:
        annotation = Annotation.objects.get(id=annotationId)
        response['id'] = str(annotation.id)
        response['type'] = annotation.content_type
        response['forumId'] = str(annotation.forum.id)
        response['userId'] = str(annotation.author.id)
        response['userName'] = annotation.author.username
        response['shareLevel'] = annotation.sharelevel
        response['timeCreated'] = annotation.created_at.ctime()
        response['timeUpdated'] = annotation.updated_at.ctime()
        response['excerpt'] = annotation.get_excerpt(10)
        print response['excerpt']
        # get parents
        theme_references = ThemeReference.objects.filter(target=annotationId)
        response['parents'] = []
        for reference in theme_references:
            reference_info = {}
            reference_info['id'] = str(reference.source.id)
            reference_info['type'] = reference.source.content_type
            reference_info['forumId'] = str(reference.source.forum.id)
            reference_info['userId'] = str(reference.source.author.id)
            reference_info['userName'] = reference.source.author.username
            reference_info['shareLevel'] = reference.source.sharelevel
            reference_info['timeCreated'] = reference.source.created_at.ctime()
            reference_info['timeUpdated'] = reference.source.updated_at.ctime()
            reference_info['excerpt'] = reference.source.get_excerpt(10)
            reference_info['alias'] = reference.alias
            reference_info['relation'] = reference.relation
            response['parents'].append(reference_info)
        # get children
        theme_references = ThemeReference.objects.filter(source=annotationId)
        response['children'] = []
        for reference in theme_references:
            reference_info = {}
            reference_info['id'] = str(reference.target.id)
            reference_info['type'] = reference.target.content_type
            reference_info['forumId'] = str(reference.target.forum.id)
            reference_info['userId'] = str(reference.target.author.id)
            reference_info['userName'] = reference.target.author.username
            reference_info['shareLevel'] = reference.target.sharelevel
            reference_info['timeCreated'] = reference.target.created_at.ctime()
            reference_info['timeUpdated'] = reference.target.updated_at.ctime()
            reference_info['excerpt'] = reference.target.get_excerpt(10)
            reference_info['alias'] = reference.alias
            reference_info['relation'] = reference.relation
            response['children'].append(reference_info)
    except Annotation.DoesNotExist:
        pass       
    return HttpResponse(json.dumps(response), mimetype='application/json')
