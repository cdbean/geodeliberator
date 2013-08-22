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
    # Example:
    # (r'^geodeliberator/', include('geodeliberator.foo.urls')),
    (r'^api/', include('api.urls')),
    (r'^geodeliberator/user/', include('users.urls')),
    url(r'^geodeliberator$', views.index, name='index'),
    #url(r'^geodeliberator/$', views.index, name='index'),
<<<<<<< HEAD
<<<<<<< HEAD
    #url(r'^nltk', include('nltk.urls')),
=======
    
>>>>>>> parent of da4f324... maintenance webpage
=======
    
>>>>>>> parent of da4f324... maintenance webpage
    url(r'^$', views.index, name='index'),
    #url(r'^geodeliberator/dash_board', views.admin_dashboard, name='dashboard'),
    url(r'^geodeliberator/dash_board', include('api.urls')),
                        
    # Uncomment the admin/doc line below and add 'django.contrib.admindocs' 
    # to INSTALLED_APPS to enable admin documentation:
    # (r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    (r'^admin/', include(admin.site.urls)),
    # (r'^geodeliberator_service/', include('geodeliberator.geodeliberator_service.urls')),
)

#urlpatterns += patterns('',(r'^admin_media/(.*)', 'django.views.static.serve', {'document_root': os.path.join(django.__path__[0],'contrib/admin/media/')}),)

#if settings.DEBUG:
#    urlpatterns += patterns('',
#        (r'^/(.*)', 'django.views.static.serve', {'document_root': os.path.join(os.path.abspath(os.path.dirname(__file__)), 'geodeliberator_client')}),
#)
