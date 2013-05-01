# Create your views here.
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout

from api.models import Forum, Membership
import json

def login_user(request):
    response	= {}
    if request.method == 'GET':
	return render(request, 'login.html')
    if request.method == 'POST':
	username	= request.POST.get('username', '')
	pwd		= request.POST.get('pwd', '')
	user = authenticate(username=username, password=pwd)
	if user is not None:
	    response["success"] = True
	    response["userId"] = user.id
	    response['userName'] = user.username
	    print 'about to log'
	    login(request, user)
	    print 'user logged in'
	else:
	    response["success"] = False
	    response["errors"] = {"reason": "Your username and password were incorrect."}
	return redirect('/questionnaire')

def register(request):
    response	= {}
    if request.method == 'POST':
	username	= request.POST.get('registerName', None)
	pwd		= request.POST.get('registerPwd', None)
	email	= request.POST.get('email', None)
	forumList	= request.POST.getlist('forumList', [])

	forums	= []
	for fo in forumList:
	    try:
		forum   = Forum.objects.get(name=fo)
		forums.append(forum)
	    except Forum.DoesNotExist:
		continue
	if username and pwd and email and len(forums) != 0:
	    try:
		user = User.objects.create_user(username=username, password=pwd)
		if True:
		    for forum in forums:
			Membership.objects.create(user=user, forum=forum, role='member')
			response["data"] = {"userId": user.id, "userName": user.username}
		    response['success'] = True
		    user.is_active = True
		    user.save()
		    print 'is anonymous: ', user.is_anonymous()
		    print username, pwd
		    user = authenticate(username=username, password=pwd)
		    if user is not None:
			login(request, user)
		    else:
			print 'User not authenticated'
		    print 'User created!'
		    return redirect('/questionnaire')
		else:
		    response['success'] = False
		    response["error"] = {"User existed"}
	    except Exception as e:
		print 'Failure in creating user'
		print e
	else:
	    response['success'] = False
	    response['error'] = 'Required information missing'

    return redirect('./login')

def logout_user(request):
    try:
	logout(request)
    except Exception as e:
	print e
    return redirect('./login')


