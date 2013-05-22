from django.conf.urls.defaults import *

from views import * 

urlpatterns = patterns('',
    url(r'^$', index),
    url(r'^marker$', saveMarker),
    url(r'^comments/(\d+)$', getComments),
    url(r'^route$', saveRoute),
    url(r'^markers$', loadMarkers),
    url(r'^marker/(\d+)/update$$', updateMarker),
    url(r'^routes$', loadRoutes),
    url(r'^questions/(\d+)/(\d{1})$', loadQuestions),
    url(r'^route/summary$', loadRouteSummary),
    url(r'^(\d+)/visibility$', setVisibility),
    url(r'^route/(\d+)/delete$', deleteRoute),
    url(r'^marker/(\d+)/delete$', deleteMarker),
)

 
