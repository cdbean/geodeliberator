# revised 1/7/2014

from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db.models import Q
from django.db.models import Count
from django.contrib.gis.geos import *
from pprint import pprint
from dateutil import parser
from django.shortcuts import render, redirect
from api.models import *
import re
import json

def api_dash_board(request):
    response = {}
    print "dashboard"
    return render(request, 'dashboard.html', response)



def api_maintenance(request):
    #print "api_maintenance"
    response = {}
    print "maintenanace"
    if 'forumId' in request.POST:

        #print request.POST       
        search_forum = int(13)   #later to be changed of getting information for request
        annotations = Annotation.objects.filter(forum=search_forum) # note this is not very true, we need apply the forum object but not the id.
        #however this works for now so we will leave it here till next revision.
        detailed_info= False
        print request.POST       
        search_forum = int(1)   #later to be changed of getting information for request
        annotations = Annotation.objects.filter(forum=search_forum)
        detailed_info= True
        #print len(annotations)
        #print "apply regular expression"
        for annotation in annotations:
            m = re.findall("id=\"ref-an(\d+)",annotation.content)
            #note above line, initially I used search but only the first match returned. then I switch to findall.
            if m:
                #print len(m)
                information = 'Current Annotation Id is: '
                information +=str(annotation.id)
                information +='. '
                for n in m:
                    if detailed_info:
                        print (information+"AN id is: "+n)
                    theme_references = ThemeReference.objects.filter(target=annotation.id,source = n)
                    if theme_references:
                        for theme in theme_references:
                            if detailed_info:
                                print ("Exist reference target :  "+str(theme.target) + " and source is: "+str(theme.source))
                    else:
                        if detailed_info:
                            print "Error! Reference in content but not found in table, may be an error!"
                            print ("Try to Retrieve annotation with ID: " + str(n))
                            try:
                                source_annotation = Annotation.objects.get(id=int(n))
                                if detailed_info:
                                    print ("!Success with ID: " + str(source_annotation.id))
                                ThemeReference(source =source_annotation, target = annotation).save()
                                if detailed_info:
                                    print "The missing relationship has been added to the database."
                            except :
                                if detailed_info:
                                    print "Retieve failed, annotation not exist"

                        #ThemeReference(source =n, target = annotation).save
                        #print "The missing relationship has been added to the database."
        
        #print "Operation is Done."
        response["message"] = "Success!" # add more information for the message label.
        return render(request,'dashboard.html',response)
    else :
        return render(request,'dashboard.html')

def api_user(request):
    response = {}
    userId = int(request.REQUEST.get('userId', '0'))
    if userId > 0:
        try:
            user = User.objects.get(id=userId)
            role = Membership.objects.filter(user=user);
            #print 'role is: ',role[0].role
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
            response["description"] = forum.description
            response["contextmap"] = forum.contextmap
        except Forum.DoesNotExist:
            print "Forum does not exist", request.REQUEST
    return HttpResponse(json.dumps(response), mimetype='application/json')

def api_forums(request):
# adaptation done
    response = {}
    userId = int(request.REQUEST.get('userId', '0'))
    if userId > 0:
        try:
            user = User.objects.get(id=userId)
            # participating forums
            response["participating"] = []
            for forum in user.joined_forums.all():
                role = Membership.objects.get(user=userId, forum=forum.id);
                forum_info = {}
                forum_info["id"] = str(forum.id)
                forum_info["name"] = forum.name
                forum_info["role"] = role.role
                response["participating"].append(forum_info)
        except User.DoesNotExist:
            print "User not exist", request.REQUEST
    # now we assume everyone participate in all forums    
    response["public"] = []    
    for forum in Forum.objects.all():
        forum_info = {}
        forum_info["id"] = str(forum.id)
        forum_info["name"] = forum.name
        if userId <= 0 or userId not in forum.members.values_list('id', flat=True):
            response["public"].append(forum_info)  
    return HttpResponse(json.dumps(response), mimetype='application/json')

def api_userlist(request):
    response = {}
    userId = int(request.REQUEST.get('userId', '0'))    #need verify the user. latter.
    current_forumId= int(request.REQUEST.get('forumId', '0'))
    response["user_list"] = []
    for user in Membership.objects.filter(forum=current_forumId):
        user_info = {}
        user_info["id"] = str(user.user.id)
        user_info["name"] = str(user.user)
        user_info["role"] = str(user.role)
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
    response = {}
    forumId = int(request.REQUEST.get('forumId', '0')) or int(request.REQUEST.get('groupId', '0'))
    if forumId > 0:
        try:
            newinfo = str(request.REQUEST.get('newinfo', '0'))
            forum = Forum.objects.get(id=forumId)
            forum.description=newinfo
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
    footprintId = int(request.REQUEST.get('planId', '0'))
    # ownerOnly = str(request.REQUEST.get('ownerOnly', 'false')).lower()
    # startDate = str(request.REQUEST.get('startDate', ''))
    # endDate = str(request.REQUEST.get('endDate', ''))
    # bbox = str(request.REQUEST.get('bbox', ''))
    if footprintId > 0:
        annotations_q = PostReferPlan.objects.filter(plan=footprintId).values('post').query
        annotations = Post.objects.filter(id__in=annotations_q)
    #    annotations = Plan.objects.get(id=footprintId).referred_annotations
    # elif len(bbox) > 0:
    #     bbox_poly = Polygon.from_bbox(bbox.split(','))
    #     footprints = Footprint.objects.filter(Q(shape__within=bbox_poly) | Q(shape__overlaps=bbox_poly))
    #     inner_q = GeoReference.objects.filter(footprint__in=footprints).values('annotation').query
    #     annotations = Annotation.objects.filter(id__in=inner_q)
    else:
        annotations = Post.objects.all()

    if forumId > 0:
        annotations = annotations.filter(forum=forumId)
    # if ownerOnly == 'true' and userId > 0:
    #     annotations = annotations.filter(author=userId)
    # if len(startDate) > 0:
    #     annotations = annotations.filter(created_at__gte=parser.parse(startDate))
    # if len(endDate) > 0:
    #     annotations = annotations.exclude(created_at__gte=parser.parse(endDate))
    annotations = annotations.order_by('-created_at')
    response['totalCount'] = annotations.count()
    
    if limit > -1:
        annotations = annotations[start:start+limit]
    response['annotations'] = []
    for annotation in annotations:
        annotation_info = {}
        annotation_info['id'] = str(annotation.id)
        annotation_info['rating'] = annotation.rating
        annotation_info['forumId'] = str(annotation.forum.id)
        annotation_info['userId'] = str(annotation.author.id)
        annotation_info['userName'] = annotation.author.username
        annotation_info['subject'] = annotation.subject
        annotation_info['clicktime'] = annotation.clicktime
        annotation_info['timeLastReplied'] = annotation.lastreplied_at
        annotation_info['timeCreated'] = annotation.created_at.ctime()
        annotation_info['timeUpdated'] = annotation.updated_at.ctime()
        annotation_info['excerpt'] = annotation.get_excerpt(10)
        annotation_info['content'] = annotation.content        
        response['annotations'].append(annotation_info)
    return HttpResponse(json.dumps(response), mimetype='application/json')

def api_claim(request):
    response = {}
    claimId = request.REQUEST.get('id')
    content = request.REQUEST.get('content')
    if int(claimId) <= 0:
        # a new claim is to be added to the databse
        response = add_claim(True, request)
    if int(claimId) > 0:
        if len(content) == 0:
            # delete a claim
            try:
                claim = Claim.objects.get(id=claimId)
                claim.delete();
                response['success'] = True
            except Exception as e:
                print e
                response['success'] = False
                response['errors'] = {'reason', e}
            return HttpResponse(json.dumps(response), mimetype='application/json')
        else:
            # edit an existing claim
            response = add_claim(False, request)
    return HttpResponse(json.dumps(response), mimetype='application/json')


def add_claim(new, request):
    response = {}
    content = request.REQUEST.get('content')
    claimId = request.REQUEST.get('id')
    userId = request.REQUEST.get('userId')
    forumId = request.REQUEST.get('forumId')
    timeCreated = request.REQUEST.get('timeCreated')
    timeUpdated = request.REQUEST.get('timeUpdated')
    postref = request.POST.getlist('postref')
    claimref = request.POST.getlist('claimref')
    planref = request.POST.getlist('planref')
    optionref = request.POST.getlist('optionref')
    issueref = request.POST.getlist('issueref')
    valueref = request.POST.getlist('valueref')

    author = User.objects.get(id=int(userId))
    forum = Forum.objects.get(id=int(forumId))
    newClaim = None
    try:
        if new:
            newClaim = Claim(content=content, author=author, forum=forum, created_at=parser.parse(timeCreated), updated_at=parser.parse(timeUpdated))
            newClaim.save()
        else:
            claim = Claim.objects.get(id=claimId)
            timeCreated = claim.created_at
            claim.delete();
            newClaim = Claim(id=claimId, content=content, author=author, forum=forum, created_at=timeCreated, updated_at=parser.parse(timeUpdated))
        # deal with references first
        for postref_id in postref:
            if postref_id == '':
                break
            source = Post.objects.get(id=int(postref_id))
            PostExpressClaim.objects.create(post=source, claim=newClaim)
        for claimref_id in claimref:
            if claimref_id == '':
                break
            source = Claim.objects.get(id=int(claimref_id))
            ClaimReferClaim.objects.create(source=source, target=newClaim)
        for planref_id in planref:
            if planref_id == '':
                break
            source = Plan.objects.get(id=int(planref_id))
            ClaimReferPlan.objects.create(plan=source, claim=newClaim)
        for optionref_id in optionref:
            if optionref_id == '':
                break
            source = Option.objects.get(id=int(optionref_id))
            ClaimReferOption.objects.create(option=source, claim=newClaim)
        for issueref_id in issueref:
            if issueref_id == '':
                break
            source = Issue.objects.get(id=int(issueref_id))
            ClaimReferIssue.objects.create(issue=source, claim=newClaim)
        for valueref_id in valueref:
            if valueref_id == '':
                break
            source = Value.objects.get(id=int(valueref_id))
            ClaimExpressValue.objects.create(value=source, claim=newClaim)
        # add the new claim
        newClaim.save()
        response['success'] = True
        return response
    except Exception as e:
        # rollback the claim adding
        newClaim.delete();
        response['success'] = False
        response['errors'] = {'reason', e}
    return response


def api_claims(request):
    response = {}
    userId = int(request.REQUEST.get('userId', '0'))
    forumId = int(request.REQUEST.get('forumId', '0')) or int(request.REQUEST.get('groupId', '0'))

    claims = Claim.objects.all()

    if forumId > 0:
        claims = claims.filter(forum=forumId)
    response['totalCount'] = claims.count()
    response['claims'] = []
    for claim in claims:
        claim_info = {}
        claim_info['id'] = str(claim.id)
        claim_info['forumId'] = str(claim.forum.id)
        claim_info['userId'] = str(claim.author.id)
        claim_info['userName'] = claim.author.username
        claim_info['content'] = claim.content
        claim_info['timeCreated'] = claim.created_at.ctime()
        claim_info['timeUpdated'] = claim.updated_at.ctime()
        claim_info['content'] = claim.content
        claim_info['excerpt'] = claim.get_excerpt(10)

        # get the posts that express it
        claim_info['postref'] = []
        postrefs = PostExpressClaim.objects.filter(claim=claim.id)
        for postref in postrefs:   
            claim_info['postref'].append(postref.post.id)

        # get the claims, issues, options, plans that it refers to
        # "claimRef" is all the posts that I cited
        # "source" is cited by "target". "source id" is smaller than "target id"
        claim_info['claimref'] = []
        claimrefs = ClaimReferClaim.objects.filter(target=claim.id)
        for claimref in claimrefs:   
            response['claimref'].append(claimref.source.id)

        claim_info['issueref'] = []
        issuerefs = ClaimReferIssue.objects.filter(claim=claim.id)
        for issueref in issuerefs:   
            claim_info['issueref'].append(issueref.issue.id)

        claim_info['optionref'] = []
        optionrefs = ClaimReferOption.objects.filter(claim=claim.id)
        for optionref in optionrefs:   
            claim_info['optionref'].append(optionref.option.id)

        claim_info['planref'] = []
        planrefs = ClaimReferPlan.objects.filter(claim=claim.id)
        for planref in planrefs:   
            claim_info['planref'].append(planref.plan.id)

        claim_info['valueref'] = []
        valuerefs = ClaimExpressValue.objects.filter(claim=claim.id)
        for valueref in valuerefs:
            claim_info['valueref'].append(valueref.value.id)

        response['claims'].append(claim_info)
    return HttpResponse(json.dumps(response), mimetype='application/json')

def api_values(request):
    response = {}
    values = Value.objects.all()

    response['totalCount'] = values.count()
    response['values'] = []
    for value in values:
        value_info = {}
        value_info['id'] = str(value.id)
        value_info['content'] = value.content
        response['values'].append(value_info)
    return HttpResponse(json.dumps(response), mimetype='application/json')

def api_code(request):
    response = {}
    # print request.REQUEST
    annotationId = int(request.REQUEST.get('annotationId', '0'))
    deleteCodeId = int(request.REQUEST.get('delete', '0'))
    if request.REQUEST.get('classification', 'null') != 'null': # add a code
        try:
            classification = str(request.REQUEST.get('classification', 'None'))
            description = str(request.REQUEST.get('description', ''))
            comment = str(request.REQUEST.get('comment', ''))
            id = int(request.REQUEST.get('id', '0'))
            if len(comment) == 0:
                comment = ''
            if len(description) == 0:
                description = ''
            code = Code(classification=classification, description=description, comment=comment)
            code.annotation = Annotation.objects.get(id=annotationId)
            code.save()
            response["success"] = True
        except Exception as e:
            response["success"] = False
            response["errors"] = {"reason", e}
    elif deleteCodeId > 0: # delete a code
        try:
            code = Code.objects.get(id=deleteCodeId)
            code.delete()
            response["success"] = True
        except Code.DoesNotExist:
            response["success"] = False
            response["errors"] = {"reason" : "The code does not exist!"}
    else: # fetch a code
        try:
            code = Code.objects.get(annotation=annotationId)
            response['id'] = str(code.id)
            response['classification'] = code.classification
            response['description'] = code.description
            response['comment'] = code.comment
            response['annotationId'] = code.annotation.id
            response["success"] = True
        except Exception as e:
            response["success"] = True
            pass
    return HttpResponse(json.dumps(response), mimetype='application/json')

def api_codescheme(request):
    response = {}
    try:
        code_schemes = CodeScheme.objects.all()
        response['codescheme'] = []
        for code_scheme in code_schemes:
            code_scheme_entry = {}
            code_scheme_entry['id'] = str(code_scheme.id)
            code_scheme_entry['classification'] = str(code_scheme.classification)
            code_scheme_entry['description'] = str(code_scheme.description)
            response['codescheme'].append(code_scheme_entry)

        
    except Exception as e:
        print e
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
        # print annotation_info
        author = User.objects.get(id=int(annotation_info['userId']))
        forum = Forum.objects.get(id=int(annotation_info['forumId']))
        annotation = Post(content=annotation_info["content"], clicktime=0, author=author, forum=forum, created_at=parser.parse(annotation_info["timeCreated"]), updated_at=parser.parse(annotation_info["timeCreated"]))
        annotation.save()
        content = annotation.content;
        #for issueref_id in annotation_info["issueref"]:
        for postref_id in annotation_info["postref"]:
            source = Post.objects.get(id=int(postref_id))
            PostReferPost.objects.create(source=source, target=annotation)
        for planref_info in annotation_info["planref"]:
            if int(planref_info["id"]) > 0: # old plan is referred
                plan = Plan.objects.get(id=int(planref_info["id"]))
                PostReferPlan.objects.create(plan=plan, post=annotation)
            elif len(planref_info["shape"]) > 0: # new plan is created
                plan = Plan(is_active=True, created_at=parser.parse(annotation_info["timeCreated"]), shape=GEOSGeometry('SRID=%s;%s' % (planref_info["srid"], planref_info["shape"])))
                plan.save()
                PostReferPlan.objects.create(plan=plan, post=annotation)
                # replace temporary plan ids
                content = content.replace("PLAN-"+str(-int(planref_info["id"])), "PLAN"+str(plan.id))
                #content = content.replace("FP-"+str(-int(planref_info["id"])), "fp"+str(plan.id))
                #content = content.replace("Fp-"+str(-int(planref_info["id"])), "fp"+str(plan.id))
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
        

def get_annotation(postid):
# adaptation done
    postinfo = {}
    try:
        post = Post.objects.get(id=postid)
        postinfo['id'] = str(post.id)
        postinfo['rating'] = post.rating
        postinfo['subject'] = post.subject
        postinfo['clicktime'] = post.clicktime
        postinfo['forumId'] = str(post.forum.id)
        postinfo['userId'] = str(post.author.id)
        postinfo['userName'] = post.author.username
        postinfo['timeCreated'] = post.created_at.ctime()
        postinfo['timeUpdated'] = post.updated_at.ctime()
        postinfo['excerpt'] = post.get_excerpt(10)
        postinfo['content'] = post.content 
        postinfo['replies'] = PostReferPost.objects.filter(source=postid).count()  
        # get references
        postref = PostReferPost.objects.filter(target=postid)
        # postref_q = PostReferPost.objects.filter(target=postid).values('source').query
        # postref = Post.objects.filter(id__in=postref_q)

        # "postref" is all the posts that I cited
        # "source" is cited by "target". "source id" is smaller than "target id"
        postinfo['postref'] = []
        for reference in postref:
            reference_info = {}
            reference_info['id'] = str(reference.source.id)
            reference_info['rating'] = reference.source.rating
            reference_info['subject'] = reference.source.subject
            reference_info['clicktime'] = reference.source.clicktime
            reference_info['forumId'] = str(reference.source.forum.id)
            reference_info['userId'] = str(reference.source.author.id)
            reference_info['userName'] = reference.source.author.username
            reference_info['timeCreated'] = reference.source.created_at.ctime()
            reference_info['timeUpdated'] = reference.source.updated_at.ctime()
            reference_info['excerpt'] = reference.source.get_excerpt(10)
            reference_info['content'] = reference.source.content 
            postinfo['postref'].append(reference_info)
        # get plans
        planref = PostReferPlan.objects.filter(post=postid)
        # planref_q = PostReferPlan.objects.filter(post=postid).values('plan')
        # planref = Plan.objects.filter(id__in=planref_q)
        postinfo['planref'] = []      
        for reference in planref:
            reference_info = {}
            reference_info['id'] = str(reference.plan.id)
            reference_info['name'] = str(reference.plan.name)
            reference_info['description'] = str(reference.plan.description)
            reference_info['is_active'] = str(reference.plan.is_active)
            reference_info['option'] = str(reference.plan.option)
            reference_info['proposer'] = str(reference.plan.proposer)
            reference_info['timeCreated'] = reference.plan.created_at.ctime()
            reference_info['shape'] = reference.plan.shape.wkt
            reference_info['srid'] = reference.plan.shape.srid
            reference_info['type'] = reference.plan.shape.geom_type
            reference_info['refCount'] = reference.plan.post_refer_plan.count()
            postinfo['planref'].append(reference_info)
    except Post.DoesNotExist:
        pass
    return postinfo



def api_map(request):
# adaptation done
    response = {}
    # print request.REQUEST
    userId = int(request.REQUEST.get('userId', '0'))
    forumId = int(request.REQUEST.get('forumId', '0')) or int(request.REQUEST.get('groupId', '0'))
    annotationId = int(request.REQUEST.get('annotationId', '0')) or int(request.REQUEST.get('issueId', '0')) or int(request.REQUEST.get('commentId', '0'))
    # print userId, forumId, annotationId
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
            response["plans"] = []
            posts_q = forum.post_set.values('id').query
            plans_q = PostReferPlan.objects.filter(post__in=posts_q).values('plan').distinct()
            plans = Plan.objects.filter(id__in=plans_q)

            for plan in plans:
                plan_info = {}
                plan_info['id'] = str(plan.id)
                plan_info['name'] = str(plan.name)
                plan_info['timeCreated'] = plan.created_at.ctime()
                plan_info['shape'] = plan.shape.wkt
                plan_info['srid'] = plan.shape.srid
                plan_info['type'] = plan.shape.geom_type
                # plan_info['refCount'] = plan.referred_annotations.count()
                response['plans'].append(plan_info)
        except Forum.DoesNotExist:
            print "Forum not exist"
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
        
        role = Membership.objects.filter(user=Annotation.objects.get(id=annotationId).author.id,forum=forumId)
        #print "annotation author role is:"
        #print role[0].role
        #print "done"
        response['id'] = str(annotation.id)
        response['type'] = annotation.content_type
        response['forumId'] = str(annotation.forum.id)
        response['userId'] = str(annotation.author.id)
        response['userName'] = annotation.author.username
        response['shareLevel'] = annotation.sharelevel
        response['timeCreated'] = annotation.created_at.ctime()
        response['timeUpdated'] = annotation.updated_at.ctime()
        response['excerpt'] = annotation.get_excerpt(10)
        response['current_role'] = role[0].role
        #print response['excerpt']
        #print "current role printing done"

        theme_references = ThemeReference.objects.filter(target=annotationId)
        #print 'theme references : '
        #pprint(theme_references)
        response['parents'] = []
        for reference in theme_references:
            role = Membership.objects.filter(user=reference.source.author.id,forum=forumId)
            #print str(role[0].role)
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
            reference_info['parents_role']=role[0].role
            response['parents'].append(reference_info)
            #print "parents information load success"
        # get children
        theme_references = ThemeReference.objects.filter(source=annotationId)
        response['children'] = []
        for reference in theme_references:
            role = Membership.objects.filter(user=reference.target.author.id,forum=forumId)
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
            reference_info['child_role'] = role[0].role
            response['children'].append(reference_info)
            #print "children information load success"
    except Annotation.DoesNotExist:
        pass       
    return HttpResponse(json.dumps(response), mimetype='application/json')
