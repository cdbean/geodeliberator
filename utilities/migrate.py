"""
migrate.py

Created by Bo Yu on 2010-08-24.
Migrate data from the old Geodeliberator database
"""

import sys
import os
import psycopg2


sys.path.append('/Users/bohr/Work/Research/geodeliberator')

from django.core.management import setup_environ
import settings
setup_environ(settings)

from django.contrib.auth.models import User
from geodeliberator.geoannotator.models import *

from django.contrib.gis.geos import *

DATABASE_HOST = 'localhost'
DATABASE_PORT = '5432'
DATABASE_NAME = 'smokefreecampus'
DATABASE_USER = 'postgres'
DATABASE_PASSWORD = '309ist'

# the groups that are migrated
GROUP_LIST = "'25','29'"
#GROUP_LIST = ''

SRID = '900913'

def migrate_users():
    try:
        dsn = 'host=%s port=%s dbname=%s user=%s password=%s' % (DATABASE_HOST, DATABASE_PORT, DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD)        
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor()
        print "importing Users"
        SQL = '''SELECT * FROM users'''
        cursor.execute(SQL)
        results = cursor.fetchall()
        for result in results:
            print "importing: " + result[1] + ", " + result[1]+'@test.com'  + ", " + result[2]
            user = User.objects.create_user(str(result[1]).lower(), str(result[1]).lower()+'@test.com', result[2])
            user.save()
        cursor.close()
        conn.close()    
    except Exception, e:
        raise e	

def migrate_forums():
    try:
        dsn = 'host=%s port=%s dbname=%s user=%s password=%s' % (DATABASE_HOST, DATABASE_PORT, DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD)        
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor()
        # step 1: import forums
        print "importing Forums"
        if GROUP_LIST:
            SQL = '''SELECT * FROM groups WHERE group_id in (%s)''' % (GROUP_LIST,)
        else:
            SQL = '''SELECT * FROM groups'''
        cursor.execute(SQL)
        results = cursor.fetchall()
        for result in results:
            print "importing: " + result[1] + ", " + result[3]
            group_id = result[0]
            forum = Forum.objects.create(name=result[1],description=result[2],scope=result[3], contextmap=result[4])
            participants = get_participants(group_id)
            for participant in participants:
                print participant[0]
                user = User.objects.get(username=participant[0])
                membership = Membership.objects.create(user=user, forum=forum, role=participant[1])
                membership.save()
        cursor.close()
        conn.close()    
    except Exception, e:
        raise e	

def migrate_annotations():
    """docstring for migrate_annotations"""
    try:
        dsn = 'host=%s port=%s dbname=%s user=%s password=%s' % (DATABASE_HOST, DATABASE_PORT, DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD)        
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor()
        print "importing Annotations"
        if GROUP_LIST:
            SQL = '''SELECT annotations.annotation_id, annotations.sharelevel, annotations.timecreated, annotations.comment, annotations.contextmap, annotations.issue, users.username, groups.groupname FROM annotations, users, groups WHERE annotations.group_id = groups.group_id AND annotations.user_id = users.user_id AND annotations.group_id in (%s)''' % (GROUP_LIST,)
        else:
            SQL = '''SELECT annotations.annotation_id, annotations.sharelevel, annotations.timecreated, annotations.comment, annotations.contextmap, annotations.issue, users.username, groups.groupname FROM annotations, users, groups WHERE annotations.group_id = groups.group_id AND annotations.user_id = users.user_id'''        
        cursor.execute(SQL)
        results = cursor.fetchall()
        Annotation.objects.all().delete()
        for result in results:
            print "importing: annotation " + str(result[0])
            author = User.objects.get(username=result[6])
            forum = Forum.objects.get(name=result[7])
            
            annotation = Annotation.objects.create(annotation_id=result[0], content=result[3], contextmap=result[4], created_at=result[2], updated_at=result[2], author=author, forum=forum)
            if result[1] == 0:
                annotation.sharelevel = 'everyone'
            elif result[1] == 1:
                annotation.sharelevel = 'member'
            elif result[1] == 2:
                annotation.sharelevel = 'user'
            elif result[1] == 3:
                annotation.sharelevel = 'author'
            if result[5] == True:
                annotation.content_type = 'decision'
            else:
                annotation.content_type = 'comment'
            annotation.save() 
        cursor.close()
        conn.close()    
    except Exception, e:
        raise e	
    
def migrate_footprints():
    try:
        dsn = 'host=%s port=%s dbname=%s user=%s password=%s' % (DATABASE_HOST, DATABASE_PORT, DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD)        
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor()
        print "importing footprints"
        SQL = '''SELECT footprint_id, timecreated, AsText(shape)  FROM footprints'''
        cursor.execute(SQL)
        results = cursor.fetchall()
        for result in results:
            print "importing: footprint" + str(result[2])
            footprint = Footprint.objects.create(footprint_id=result[0], created_at=result[1], shape=None)
            footprint.shape = GEOSGeometry('SRID=%s;%s' % (SRID, result[2])) 
            footprint.save()    
        cursor.close()
        conn.close()    
    except Exception, e:
        raise e	

def migrate_annotation_references():
    try:
        dsn = 'host=%s port=%s dbname=%s user=%s password=%s' % (DATABASE_HOST, DATABASE_PORT, DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD)        
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor()
        print "importing annotation references"
        SQL = '''SELECT * FROM referred_annotations'''
        cursor.execute(SQL)
        results = cursor.fetchall()
        print len(results)
        ThemeReference.objects.all().delete();
        for result in results:
            print "importing: annotation references from " + str(result[0]) + " to " + str(result[1])
            try:
                source = Annotation.objects.get(annotation_id=result[0])
                target = Annotation.objects.get(annotation_id=result[1])
            except Annotation.DoesNotExist:
                print "annotation does not exist!"    
                continue
            if source and target:
                reference = ThemeReference.objects.create(source=source, target=target, alias=result[2])
                reference.save()    
        cursor.close()
        conn.close()
    except Exception, e:
        raise e
        
def migrate_footprint_references():
    try:
        dsn = 'host=%s port=%s dbname=%s user=%s password=%s' % (DATABASE_HOST, DATABASE_PORT, DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD)        
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor()
        print "importing footprint references"
        SQL = '''SELECT * FROM annotation_footprint'''
        cursor.execute(SQL)
        results = cursor.fetchall()
        print len(results)
        GeoReference.objects.all().delete();
        for result in results:
            print "importing: references from annotation " + str(result[0]) + " to footprint " + str(result[1])
            try:
                annotation = Annotation.objects.get(annotation_id=result[0])
                footprint = Footprint.objects.get(footprint_id=result[1])
            except Annotation.DoesNotExist:
                print "annotation does not exist!"    
                continue
            except Footprint.DoesNotExist:
                print "footprint does not exist!"    
                continue
            reference = GeoReference.objects.create(annotation=annotation, footprint=footprint, alias=result[2])
            reference.save()    
        cursor.close()
        conn.close()
    except Exception, e:
        raise e

    
def get_participants(group_id):
    """docstring for get_participants"""
    try:
        dsn = 'host=%s port=%s dbname=%s user=%s password=%s' % (DATABASE_HOST, DATABASE_PORT, DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD)        
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor()
        SQL = '''SELECT users.username, user_role FROM user_group, users WHERE user_group.user_id = users.user_id AND group_id = %s''' % (group_id,)
        cursor.execute(SQL)
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        return results    
    except Exception, e:
        raise e	

def main():
    # step 1: migrate users
    # migrate_users()
    # step 2: migrate forums with membership relationship
    # migrate_forums()
    # step 3: migrate annotations
    # migrate_annotations()
    # step 4: migrate footprints
    # migrate_footprints()
    # step 5: migrate annotation references
    # migrate_annotation_references()
    # step 6: migrate footprint references
    # migrate_footprint_references()
    
if __name__ == '__main__':
	main()

