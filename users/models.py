from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class UserProfile(models.Model):
    user = models.ForeignKey(User)
    gender = models.CharField(default='M', max_length=1, choices=(('M', 'Male'), ('F', 'Femail')))
    birthday = models.DateField(null=True, blank=True)
    firstName = models.CharField(max_length=50)
    lastName = models.CharField(max_length=50)
    org	    = models.CharField(max_length=100)
    occupation = models.CharField(max_length=100, null=True, blank=True)



