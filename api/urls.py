from django.conf.urls.defaults import *

from views import * 
from maintenance import *

urlpatterns = patterns('',
    url(r'^user/$', api_user, name='api_user'),
    url(r'^userlist/$', api_userlist, name='api_userlist'),
    url(r'^forum/$', api_forum, name='api_forum'), 
    url(r'^foruminfo/$', api_foruminfo, name='api_foruminfo'),    
    url(r'^forums/$', api_forums, name='api_forums'),    
    url(r'^authentication/$', api_authentication, name='api_authentication'),        
    url(r'^annotations/$', api_annotations, name='api_annotations'),   
    url(r'^annotation/$', api_annotation, name='api_annotation'),
    url(r'^code/$', api_code, name='api_code'),
    url(r'^codescheme/$', api_codescheme, name='api_codescheme'),
    url(r'^map/$', api_map, name='api_map'),   
    url(r'^timeline/$', api_timeline, name='api_timeline'),   
    url(r'^threads/$', api_threads, name='api_threads'),   
    # urls for compability support with previous version
    url(r'^User/$', api_user, name='api_user'),
    url(r'^Group/$', api_forum, name='api_forum'),    
    url(r'^Groups/$', api_forums, name='api_forums'),        
    url(r'^Login/$', api_authentication, name='api_authentication'),        
    url(r'^Annotations/$', api_annotations, name='api_annotations'),                
    url(r'^Annotation/$', api_annotation, name='api_annotation'),   
    url(r'^Map/$', api_map, name='api_map'),   
    url(r'^Timeline/$', api_timeline, name='api_timeline'),
    url(r'^Threads/$', api_threads, name='api_threads'),
    # below is the maintenance functions
    url(r'^maintenance$', api_maintenance, name = 'api_dash_board'),
    url(r'^/$', api_maintenance, name = 'api_dash_board'),

    url(r'^claims/$', api_claims, name='api_claims'),   
    url(r'^claim/$', api_claim, name='api_claim'),
    
)

