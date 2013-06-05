from django.conf.urls.defaults import *

from views import * 

urlpatterns = patterns('',
    url(r'^login$', login_user),
    url(r'^register$', register),
    url(r'^logout$', logout_user),
)

 
