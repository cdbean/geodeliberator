from django.contrib.gis.db import models
from django.contrib.auth.models import User
import unicodedata
from BeautifulSoup import BeautifulSoup
import HTMLParser
# Create your models here.
class Forum(models.Model):
    SCOPE_CHOICES = (
        ('public', 'Public'),
        ('private', 'Private'),
    )
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    scope = models.CharField(max_length=10, choices=SCOPE_CHOICES)
    contextmap = models.TextField()
    members = models.ManyToManyField(User, related_name='joined_forums', through='Membership')
    
    class Meta:
        db_table = 'geoannotator_forum'

    def __unicode__(self):
        return self.name

    
class Membership(models.Model):
    ROLE_CHOICES = (
        ('creator', 'Creator'),
        ('moderator', 'Moderator'),
        ('member', 'Member'),
        ('admin','Admin'),
        ('facilitator','Facilitator')
        
    )
    user = models.ForeignKey(User)
    forum = models.ForeignKey(Forum)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES) 

    class Meta:
        db_table = 'geoannotator_membership'

class Footprint(models.Model):
    footprint_id = models.IntegerField(null=True)
    created_at = models.DateTimeField(verbose_name='date created')
    name = models.CharField(max_length=100, null=True)
    # GeoDjango-specific: a geometry field (GeometryField), and
    # overriding the default manager with a GeoManager instance.
    shape = models.GeometryField(null=True)
    objects = models.GeoManager()
    def _get_geom_type(self):
        return self.shape.geom_type
    geom_type = property(_get_geom_type)

    class Meta:
        get_latest_by = 'created_at'
        ordering = ('-created_at',)
        db_table = 'geoannotator_footprint'
    
    def __unicode__(self):
        return str(self.id)

class Annotation(models.Model):
    SHARE_LEVELS = (
        ('everyone', 'Everyone'),
        ('member', 'Forum Members'),
        ('user', 'Registered Users'),
        ('author', 'Author Only'),
    )
    TYPE_CHOICES = (
        ('decision', 'Decision'),
        ('alternative', 'Alternative'),
        ('comment', 'Comment'),
    )
    annotation_id = models.IntegerField(null=True)
    content = models.TextField()
    author = models.ForeignKey(User)
    forum =  models.ForeignKey(Forum)
    contextmap = models.TextField()
    created_at = models.DateTimeField(verbose_name='date created')
    updated_at = models.DateTimeField(verbose_name='date updated')
    sharelevel = models.CharField(max_length=10, choices=SHARE_LEVELS)
    content_type = models.CharField(max_length=20, choices=TYPE_CHOICES, verbose_name="content type", null=True)
    footprints = models.ManyToManyField(Footprint, related_name='referred_annotations', through='GeoReference')
    references = models.ManyToManyField("self", symmetrical=False, related_name='referred_annotations', through='ThemeReference')
    class Meta:
        get_latest_by = 'created_at'
        ordering = ('-created_at',)
        db_table = 'geoannotator_annotation'


    def get_excerpt(self, limit):
        #strs=self.content.encode('ascii','ignore')
        #strs.replace('&nbsp;',' ')
        return ' '.join((''.join(BeautifulSoup(self.content).findAll(text=True))).split(' ')[:limit])                       
    
    def __unicode__(self):
        return str(self.id)

class ThemeReference(models.Model):
    RELATION_CHOICES = (
        ('for', 'For'),
        ('against', 'Against'),
    )
    source = models.ForeignKey(Annotation, related_name='source_themereference_set')
    target = models.ForeignKey(Annotation, related_name='target_themereference_set')
    alias = models.CharField(max_length=100, null=True)
    relation = models.CharField(max_length=20, choices=RELATION_CHOICES, null=True)

    class Meta:
        db_table = 'geoannotator_themereference'

    
class GeoReference(models.Model):
    annotation = models.ForeignKey(Annotation)
    footprint = models.ForeignKey(Footprint)
    alias = models.CharField(max_length=100, null=True)

    class Meta:
        db_table = 'geoannotator_georeference'
