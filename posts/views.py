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
from random import randint

from HTMLParser import HTMLParser

class MLStripper(HTMLParser):
    def __init__(self):
        self.reset()
        self.fed = []
    def handle_data(self, d):
        self.fed.append(d)
    def get_data(self):
        return ''.join(self.fed)

def strip_tags(html):
    s = MLStripper()
    s.feed(html)
    return s.get_data()

def posts_load(request):
    response = {}
    return render(request, 'posts.html', response)

def posts_fetch(request):
    response = {}
    annotations = Annotation.objects.filter(forum=13).order_by("id") 
    parent_counter = 0
    child_counter = 0
    l=[]

    for annotation in annotations:
        theme_references = ThemeReference.objects.filter(target=annotation.id)
        if theme_references: 
            if theme_references[0].source:
                l.append({"postid":annotation.id,'FolderName':strip_tags(annotation.content),
                          'ParentFolderID':theme_references[0].source.id,'PostAuthor':annotation.author.username})
                #print annotation.author.username

                child_counter+=1            
        else:
            l.append({"postid":annotation.id,"FolderName":strip_tags(annotation.content),
                      "ParentFolderID":-1,'PostAuthor':annotation.author.username})
            parent_counter+=1
    #print "parent_counter: "
    #print parent_counter
    #print "child_counter: "
    #print child_counter
    #print "len of annotations"
    #print len(annotations)
    
    data = {}
    data['postlist'] = l
    jdata = json.dumps(data)
    #print "done"
    return HttpResponse(jdata,content_type="application/json")

