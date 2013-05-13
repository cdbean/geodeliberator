from django.contrib.gis.db import models
from django.contrib.auth.models import User
from api.models import Annotation

# Create your models here.
class Route(models.Model):
    VISIBILITY_CHOICES = (
	('everyone', 'everyone'),
	('group', 'group members'),
	('registered', 'registered users'),
	('self', 'myself'),
    )
    user    = models.ForeignKey(User)
    shape   = models.LineStringField()
    visibility = models.CharField(max_length=10, choices=VISIBILITY_CHOICES, default='everyone')
    objects = models.GeoManager()

    # about the questionnaire
    transport	= models.CharField(max_length=10, null=True) # walk or bike
    reasons	= models.CharField(max_length=300, null=True)
    pathType	= models.CharField(max_length=20, null=True)
    pathCondition = models.IntegerField(null=True) # overall rating
    easeGoing	= models.IntegerField(null=True)
    easeCrossing    = models.IntegerField(null=True)
    detour    = models.CharField(max_length=10, null=True)
    safetyChoices = models.CharField(max_length=300, null=True)
    driverBehaviors  = models.CharField(max_length=300, null=True)
    groceryFrequency	= models.IntegerField(null=True)
    funFrequency    = models.IntegerField(null=True)
    exerciseFrequency	= models.IntegerField(null=True)
    encourageMethods	= models.CharField(max_length=300, null=True)


    class Meta:
	db_table = 'questionnaire_route'
    def __unicode__(self):
	return str(self.id)

class RouteSegment(models.Model):
    route   = models.ForeignKey(Route)
    shape   = models.LineStringField()
    objects = models.GeoManager()

    class Meta:
	db_table = 'questionnaire_routesegment'
    def __unicode__(self):
	return str(self.id)

# a class extended from api.Annotation
class MarkAnnotation(models.Model):
    # mark type
    TYPE_CHOICES = (
	('landscape', 'beautiful landscape'),
	('noise', 'noise'),
	('stop', 'stop'),
	('smell', 'smell'),
	('traffic', 'too much traffic'),
	('litter', 'litter/trash'),
	('disturbing', 'people/animal disturbing'),
	('safety', 'safety concern'),
	('lighting', 'lighting'),
	('question', 'question'),
	('exclamation', 'other categories')
    ) # etc
    PROCON_CHOICES = (
	('pro', 'pro'),
	('con', 'con')
    )
#    user	= models.ForeignKey(User)
    annotation	= models.OneToOneField(Annotation) # extend from Annotation
    markType	= models.CharField(max_length=10)
    route	= models.ForeignKey(Route)
    route_seg	= models.ForeignKey(RouteSegment, default=route)
    procon	= models.CharField(max_length=3, choices=PROCON_CHOICES, default='con')
   # comment	= models.TextField(null=True, blank=True)
   # user	= models.ForeignKey(User)
   # created_at	= models.DateTimeField(verbose_name='date created')


    class Meta:
	db_table = 'questionnaire_annotation'
    def __unicode__(self):
	return str(self.id)


    
