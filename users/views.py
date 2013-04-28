# Create your views here.
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

def login(request):
    response	= {}
    username	= request.POST.get('nameInput', '')
    pwd		= request.POST.get('passInput', '')
    user = authenticate(username=id, password=psw)
    if user is not None:
	response["success"] = True
	response["data"] = {"userId": user.id, "userName": user.username}
    else:
        response["success"] = False
        response["errors"] = {"reason": "Your username and password were incorrect."}
    return HttpResponse(json.dumps(response), mimetype='application/json')

def register(request):
    response	= {}
    username	= request.POST.get('username', None)
    pwd		= request.POST.get('pwd', None)
    forumname	= request.POST.get('forum', None)

    forum	= Forum.objects.get(name=forumname)
    if username and pwd and forum:
	user, created = User.objects.get_or_created(username=username, password=pwd)
	if created:
	    Membership.objects.create(user=user, forum=forum, role='member')
	    response['success'] = True
	else:
	    response['success'] = False
	    response['err'] = 'User existed'
    else:
	response['success'] = False
	response['err'] = 'Required information missing'

    return HttpResponse(json.dumps(response), mimetype='application/json')



