from django.contrib.gis.db import models
from django.contrib.auth.models import User
from api.models import Annotation

# Create your models here.
class Route(models.Model):
    user    = models.ForeignKey(User)
    rate    = models.IntegerField()
    shape   = models.LineStringField()
    objects = models.GeoManager()

    class Meta:
	db_table = 'questionnaire_route'

# a class extended from api.Annotation
class MarkAnnotation(models.Model):
    TYPE_CHOICES = (
	('landscape', 'beautiful landscape'),
	('noise', 'noise'),
    )
    annotation	= models.OneToOneField(Annotation) # extend from Annotation
    type	= models.CharField(max_length=10, choices=TYPE_CHOICES)
    reference	= models.ForeignKey(Route)

    class Meta:
	db_table = 'questionnaire_annotation'


    
