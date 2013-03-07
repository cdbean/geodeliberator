# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding model 'Forum'
        db.create_table('geoannotator_forum', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(unique=True, max_length=100)),
            ('description', self.gf('django.db.models.fields.TextField')()),
            ('scope', self.gf('django.db.models.fields.CharField')(max_length=10)),
            ('contextmap', self.gf('django.db.models.fields.TextField')()),
        ))
        db.send_create_signal('geoannotator', ['Forum'])

        # Adding model 'Membership'
        db.create_table('geoannotator_membership', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['auth.User'])),
            ('forum', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['geoannotator.Forum'])),
            ('role', self.gf('django.db.models.fields.CharField')(max_length=20)),
        ))
        db.send_create_signal('geoannotator', ['Membership'])

        # Adding model 'Footprint'
        db.create_table('geoannotator_footprint', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('footprint_id', self.gf('django.db.models.fields.IntegerField')(null=True)),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')()),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=100, null=True)),
            ('shape', self.gf('django.contrib.gis.db.models.fields.GeometryField')(null=True)),
        ))
        db.send_create_signal('geoannotator', ['Footprint'])

        # Adding model 'Annotation'
        db.create_table('geoannotator_annotation', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('annotation_id', self.gf('django.db.models.fields.IntegerField')(null=True)),
            ('content', self.gf('django.db.models.fields.TextField')()),
            ('author', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['auth.User'])),
            ('forum', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['geoannotator.Forum'])),
            ('contextmap', self.gf('django.db.models.fields.TextField')()),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')()),
            ('updated_at', self.gf('django.db.models.fields.DateTimeField')()),
            ('sharelevel', self.gf('django.db.models.fields.CharField')(max_length=10)),
            ('content_type', self.gf('django.db.models.fields.CharField')(max_length=20, null=True)),
        ))
        db.send_create_signal('geoannotator', ['Annotation'])

        # Adding model 'ThemeReference'
        db.create_table('geoannotator_themereference', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('source', self.gf('django.db.models.fields.related.ForeignKey')(related_name='source_themereference_set', to=orm['geoannotator.Annotation'])),
            ('target', self.gf('django.db.models.fields.related.ForeignKey')(related_name='target_themereference_set', to=orm['geoannotator.Annotation'])),
            ('alias', self.gf('django.db.models.fields.CharField')(max_length=100, null=True)),
            ('relation', self.gf('django.db.models.fields.CharField')(max_length=20, null=True)),
        ))
        db.send_create_signal('geoannotator', ['ThemeReference'])

        # Adding model 'GeoReference'
        db.create_table('geoannotator_georeference', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('annotation', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['geoannotator.Annotation'])),
            ('footprint', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['geoannotator.Footprint'])),
            ('alias', self.gf('django.db.models.fields.CharField')(max_length=100, null=True)),
        ))
        db.send_create_signal('geoannotator', ['GeoReference'])


    def backwards(self, orm):
        
        # Deleting model 'Forum'
        db.delete_table('geoannotator_forum')

        # Deleting model 'Membership'
        db.delete_table('geoannotator_membership')

        # Deleting model 'Footprint'
        db.delete_table('geoannotator_footprint')

        # Deleting model 'Annotation'
        db.delete_table('geoannotator_annotation')

        # Deleting model 'ThemeReference'
        db.delete_table('geoannotator_themereference')

        # Deleting model 'GeoReference'
        db.delete_table('geoannotator_georeference')


    models = {
        'auth.group': {
            'Meta': {'object_name': 'Group'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        'auth.permission': {
            'Meta': {'unique_together': "(('content_type', 'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['contenttypes.ContentType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True', 'blank': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False', 'blank': 'True'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        'contenttypes.contenttype': {
            'Meta': {'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'geoannotator.annotation': {
            'Meta': {'object_name': 'Annotation'},
            'annotation_id': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'author': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"}),
            'content': ('django.db.models.fields.TextField', [], {}),
            'content_type': ('django.db.models.fields.CharField', [], {'max_length': '20', 'null': 'True'}),
            'contextmap': ('django.db.models.fields.TextField', [], {}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {}),
            'footprints': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'referred_annotations'", 'symmetrical': 'False', 'through': "orm['geoannotator.GeoReference']", 'to': "orm['geoannotator.Footprint']"}),
            'forum': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['geoannotator.Forum']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'references': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'referred_annotations'", 'symmetrical': 'False', 'through': "orm['geoannotator.ThemeReference']", 'to': "orm['geoannotator.Annotation']"}),
            'sharelevel': ('django.db.models.fields.CharField', [], {'max_length': '10'}),
            'updated_at': ('django.db.models.fields.DateTimeField', [], {})
        },
        'geoannotator.footprint': {
            'Meta': {'object_name': 'Footprint'},
            'created_at': ('django.db.models.fields.DateTimeField', [], {}),
            'footprint_id': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True'}),
            'shape': ('django.contrib.gis.db.models.fields.GeometryField', [], {'null': 'True'})
        },
        'geoannotator.forum': {
            'Meta': {'object_name': 'Forum'},
            'contextmap': ('django.db.models.fields.TextField', [], {}),
            'description': ('django.db.models.fields.TextField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'members': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'joined_forums'", 'symmetrical': 'False', 'through': "orm['geoannotator.Membership']", 'to': "orm['auth.User']"}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '100'}),
            'scope': ('django.db.models.fields.CharField', [], {'max_length': '10'})
        },
        'geoannotator.georeference': {
            'Meta': {'object_name': 'GeoReference'},
            'alias': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True'}),
            'annotation': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['geoannotator.Annotation']"}),
            'footprint': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['geoannotator.Footprint']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        'geoannotator.membership': {
            'Meta': {'object_name': 'Membership'},
            'forum': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['geoannotator.Forum']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'role': ('django.db.models.fields.CharField', [], {'max_length': '20'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"})
        },
        'geoannotator.themereference': {
            'Meta': {'object_name': 'ThemeReference'},
            'alias': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'relation': ('django.db.models.fields.CharField', [], {'max_length': '20', 'null': 'True'}),
            'source': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'source_themereference_set'", 'to': "orm['geoannotator.Annotation']"}),
            'target': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'target_themereference_set'", 'to': "orm['geoannotator.Annotation']"})
        }
    }

    complete_apps = ['geoannotator']
