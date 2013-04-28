from django.conf.urls.defaults import *

from views import * 

urlpatterns = patterns('',
    url(r'^$', index),
    url(r'^marker$', saveMarker),
    url(r'^route$', saveRoute),
    url(r'^markers$', loadMarkers),
    url(r'^routes$', loadRoutes),
    url(r'^questions/(\d+)/(\d{1})$', loadQuestions),
    url(r'^(\d+)/visibility$', setVisibility),
    url(r'^(\d+)/delete$', deleteRoute),
)

 
