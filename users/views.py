# Create your views here.
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout

import smtplib
from email.MIMEMultipart import MIMEMultipart
from email.MIMEBase import MIMEBase
from email.MIMEText import MIMEText
from email import Encoders
import thread

import datetime

from api.models import Forum, Membership
import json
from geodeliberator.settings import SYS_MAIL_USER, SYS_MAIL_PSW

from users.models import *

def mail(to, subject, text):
    """
    summary:
        util function, send a mail to corresponding user
    """
    try:
	msg = MIMEMultipart()
    
	msg['From'] = SYS_MAIL_USER
	msg['To'] = to
	msg['Subject'] = subject
    
	msg.attach(MIMEText(text))
    
	mailServer = smtplib.SMTP("smtp.gmail.com", 25)
	mailServer.ehlo()
	mailServer.starttls()
	mailServer.ehlo()
	mailServer.login(SYS_MAIL_USER, SYS_MAIL_PSW)
	mailServer.sendmail(SYS_MAIL_USER, to, msg.as_string())
	# Should be mailServer.quit(), but that crashes...
	mailServer.close()
	print "Registration mail sent"
    except Exception as e:
	print e

def login_user(request):
    response	= {}
    if request.method == 'GET':
	return render(request, 'login.html')
    if request.method == 'POST':
	username	= request.POST.get('username', '')
	pwd		= request.POST.get('pwd', '')
	response['username'] = username
	user = authenticate(username=username, password=pwd)
	if user is not None:
	    response["success"] = True
	    response["userId"] = user.id
	    response['userName'] = user.username
	    login(request, user)
	else:
	    response["success"] = False
	    response["error"] = "Username and password don't match!"
	    print response
	    return render(request, 'login.html', response)
	return redirect('/questionnaire')


def register(request):
    response	= {}
    if request.method == 'POST':
	username	= request.POST.get('registerName', None)
	pwd		= request.POST.get('registerPwd', None)
	email	= request.POST.get('email', None)
	firstName	= request.POST.get('firstName', None)
	lastName	= request.POST.get('lastName', None)
	gender		= request.POST.get('gender', None)
	print gender
	birthday	= request.POST.get('birthday', '')
	print birthday
	org		= request.POST.get('org', None)
	occupation	= request.POST.get('occupation', '')
	forumList	= request.POST.getlist('forumList', [])
	response['registerName'] = username
	response['email'] = email
	response['firstName'] = firstName
	response['lastName'] = lastName
	response['gender'] = gender
	response['birthday'] = birthday
	response['org'] = org
	response['occupation'] = occupation

	forums	= []
	for fo in forumList:
	    try:
		forum   = Forum.objects.get(name=fo)
		forums.append(forum)
	    except Forum.DoesNotExist:
		continue
	if username and pwd and email and firstName and lastName and org and gender and len(forums) != 0:
	    try:
		user = User.objects.create_user(username=username, password=pwd)
		for forum in forums:
		    Membership.objects.create(user=user, forum=forum, role='member')
		    response["data"] = {"userId": user.id, "userName": user.username}
		response['success'] = True
		user.is_active = True
		user.save()
		
		if birthday != '':
		    birthday = datetime.datetime.strptime(birthday, '%m/%d/%Y')

		try:
		    userProfile = UserProfile.objects.create(user=user, gender=gender, birthday=birthday, firstName=firstName, lastName=lastName, org=org, occupation=occupation)
		    userProfile.save()
		except Exception as e: 
		    print e

		try:
		    email_text = """
			Dear %s,
			    Welcome to Geodeliberator. Below is your account info:
			    User name:  %s
			    Password:   %s
			    Email:	%s
			    First name:	%s
			    Last name:  %s
			    Organization:	%s
			    Occupation:	%s
			    Birthday:   %s
		    """ % (username, username, pwd, email, firstName, lastName, org, occupation, birthday)

		    thread.start_new_thread(mail, (email, 'Welcome to GeoDeliberator [Do not reply]', email_text))
		except Exception as e:
		    print e
		
		print 'is anonymous: ', user.is_anonymous()
		user = authenticate(username=username, password=pwd)
		if user is not None:
		    login(request, user)
		    return redirect('/questionnaire')
		else:
		    response['success'] = False
		    response['error'] = 'User authentication failed!'
	    except Exception as e:
		response['success'] = False
		response['error'] = 'User existed!'
	else:
	    response['success'] = False
	    response['error'] = 'Required information missing'

    print response
    return render(request, "login.html", response)

def logout_user(request):
    try:
	logout(request)
	print 'log out user'
    except Exception as e:
	print e
    return redirect('/user/login')


