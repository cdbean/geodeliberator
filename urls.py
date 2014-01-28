from django.conf.urls.defaults import *
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
import os
import views

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
#from django.contrib.gis import admin
admin.autodiscover()

urlpatterns = staticfiles_urlpatterns()

urlpatterns += patterns('',
    (r'^api/', include('api.urls')),
    (r'^geodeliberator/user/', include('users.urls')),
    url(r'^geodeliberator$', views.index, name='index'),
    url(r'^posts', include('posts.urls')),
    #url(r'^geodeliberator/$', views.index, name='index'),
    url(r'^nltk', include('nltk.urls')),
    url(r'^$', views.index, name='index'),
    url(r'^geodeliberator/dash_board', include('api.urls')),
                        
    # Uncomment the admin/doc line below and add 'django.contrib.admindocs' 
    # to INSTALLED_APPS to enable admin documentation:
    # (r'^admin/doc/', include('django.contrib.admindocs.urls')),
    # Uncomment the next line to enable the admin:
    (r'^admin/', include(admin.site.urls)),
)
