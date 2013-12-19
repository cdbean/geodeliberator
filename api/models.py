# models.py
# databaase scheme definition
# yt revised on 12/4/2013

from django.contrib.gis.db import models
from django.contrib.auth.models import User
import unicodedata
from BeautifulSoup import BeautifulSoup
import HTMLParser

class Forum(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    members = models.ManyToManyField(User, related_name='joined_forums', through='Membership')
    contextmap = models.TextField()

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

class Issue(models.Model):
    name = models.CharField(max_length=100, unique=True, null=True)
    description = models.TextField(null=True)
    is_active = models.BooleanField()
    created_at = models.DateTimeField(verbose_name='date created')
    forum = models.ForeignKey(Forum, null=True)
    proposer = models.ForeignKey(User, null=True)

    class Meta:
        db_table = 'geoannotator_issue'

class Option(models.Model):
    name = models.CharField(max_length=100, unique=True, null=True)
    description = models.TextField(null=True)
    is_active = models.BooleanField()
    created_at = models.DateTimeField(verbose_name='date created')
    issue = models.ForeignKey(Issue, null=True)
    proposer = models.ForeignKey(User, null=True)

    class Meta:
        db_table = 'geoannotator_option'

class Plan(models.Model):
    name = models.CharField(max_length=100, unique=True, null=True)
    description = models.TextField(null=True)
    is_active = models.BooleanField()
    created_at = models.DateTimeField(verbose_name='date created')
    option = models.ForeignKey(Option, null=True) # fix me
    proposer = models.ForeignKey(User, null=True)
    
    shape = models.GeometryField(null=True)
    objects = models.GeoManager()
    def _get_geom_type(self):
        return self.shape.geom_type
    geom_type = property(_get_geom_type)

    class Meta:
        get_latest_by = 'created_at'
        ordering = ('-created_at',)
        db_table = 'geoannotator_plan'
    
    def __unicode__(self):
        return str(self.id)

class Claim(models.Model):
    content = models.TextField()
    value = models.ForeignKey('Value', null = True) # change to n-to-n relation!
    created_at = models.DateTimeField(verbose_name='date created')
    author = models.ForeignKey(User)
    forum = models.ForeignKey(Forum)

    issue = models.ManyToManyField(Issue, related_name='claim_refer_issue', through='ClaimReferIssue')
    option = models.ManyToManyField(Option, related_name='claim_refer_option', through='ClaimReferOption')
    plans = models.ManyToManyField(Plan, related_name='claim_refer_plan', through='ClaimReferPlan')
    reference = models.ManyToManyField("self", symmetrical=False, related_name='claim_refer_claim', through='ClaimReferClaim')

    class Meta:
        db_table = 'geoannotator_claim'

    def get_excerpt(self, limit):
        return ' '.join((''.join(BeautifulSoup(self.content).findAll(text=True))).split(' ')[:limit]) 

class Post(models.Model):
    content = models.TextField()
    rating = models.IntegerField(null=True)
    subject = models.CharField(max_length = 100, null = True)
    clicktime = models.IntegerField()
    author = models.ForeignKey(User)
    created_at = models.DateTimeField(verbose_name='date created')
    updated_at = models.DateTimeField(verbose_name='date updated')
    lastreplied_at = models.DateTimeField(null=True, verbose_name='date last replied')

    issue = models.ManyToManyField(Issue, related_name='post_refer_issue', through='PostReferIssue')
    option = models.ManyToManyField(Option, related_name='post_refer_option', through='PostReferOption')
    plans = models.ManyToManyField(Plan, related_name='post_refer_plan', through='PostReferPlan')
    forum = models.ForeignKey(Forum)

    reference = models.ManyToManyField("self", symmetrical=False, related_name='post_refer_post', through='PostReferPost')
    replyto = models.ForeignKey("self", related_name='post_reply_post', null=True)
    claims = models.ManyToManyField(Claim, related_name='post_express_claim', through='PostExpressClaim')

    class Meta:
        get_latest_by = 'created_at'
        ordering = ('-created_at',)
        db_table = 'geoannotator_post'


    def get_excerpt(self, limit):
        #strs=self.content.encode('ascii','ignore')
        #strs.replace('&nbsp;',' ')
        return ' '.join((''.join(BeautifulSoup(self.content).findAll(text=True))).split(' ')[:limit])                       
    
    def __unicode__(self):
        return str(self.id)

class Code(models.Model):
    classification = models.CharField(null=False, max_length=100)
    description = models.CharField(max_length=2000)
    comment = models.CharField(max_length=2000) 
    post = models.ForeignKey(Post)
    author = models.ForeignKey(User)
    class Meta:
        db_table = 'geoannotator_code'

class Value(models.Model):
    content = models.TextField()
    class Meta:
        db_table = 'geoannotator_value'
        
class Data(models.Model):
    DATATYPE_CHOICES = (
        ('quotation', 'Quotation'),
        ('reasoning', 'Reasoning'),
        ('statistics', 'Statistics'),
        ('example', 'Example'),
        ('experience', 'Experience'),
    )
    datatype = models.CharField(max_length=50, choices=DATATYPE_CHOICES)
    content = models.TextField()
    claim = models.ForeignKey(Claim)
    class Meta:
        db_table = 'geoannotator_data'

class ClaimReferClaim(models.Model):
    source = models.ForeignKey(Claim, related_name='source_claimreferclaim')
    target = models.ForeignKey(Claim, related_name='target_claimreferclaim')
    refertype = models.CharField(null=True, max_length=1000)

    class Meta:
        db_table = 'geoannotator_claimreferclaim'

class PostExpressClaim(models.Model):
    post = models.ForeignKey(Post)
    claim = models.ForeignKey(Claim)
    warrant = models.CharField(null=True, max_length=1000)

    class Meta:
        db_table = 'geoannotator_postexpressclaim'

class PostReferPost(models.Model):
    source = models.ForeignKey(Post, related_name='source_postreferpost')
    target = models.ForeignKey(Post, related_name='target_postreferpost')

    class Meta:
        db_table = 'geoannotator_postreferpost'

class PostReferPlan(models.Model):
    post = models.ForeignKey(Post)
    plan = models.ForeignKey(Plan)

    class Meta:
        db_table = 'geoannotator_postreferplan'

class PostReferOption(models.Model):
    post = models.ForeignKey(Post)
    option = models.ForeignKey(Option)

    class Meta:
        db_table = 'geoannotator_postreferoption'

class PostReferIssue(models.Model):
    post = models.ForeignKey(Post)
    issue = models.ForeignKey(Issue)

    class Meta:
        db_table = 'geoannotator_postreferissue'

class ClaimReferPlan(models.Model):
    claim = models.ForeignKey(Claim)
    plan = models.ForeignKey(Plan)

    class Meta:
        db_table = 'geoannotator_claimreferplan'

class ClaimReferOption(models.Model):
    claim = models.ForeignKey(Claim)
    option = models.ForeignKey(Option)

    class Meta:
        db_table = 'geoannotator_claimreferoption'

class ClaimReferIssue(models.Model):
    claim = models.ForeignKey(Claim)
    issue = models.ForeignKey(Issue)

    class Meta:
        db_table = 'geoannotator_claimreferissue'