from django.contrib import admin
#from django.contrib.gis import admin
from django.db.models import Q


from api.models import *

class MembershipInline(admin.TabularInline):
    model = Membership
    extra = 1
    
class ForumAdmin(admin.ModelAdmin):

    """
    Class for specifiying the options for administering the
    geodeliberator.geoannotator.models Forum model via the Django admin.
    """

    list_display = ('name', 'scope')
    list_filter = ('scope',)
    radio_fields = {'scope': admin.HORIZONTAL}
    search_fields = ('name', 'description')
    inlines = (MembershipInline,)
    #exclude = ('members',)
    def queryset(self, request):
        """
        Return the queryset to use in the admin list view.  Superusers
        can see all forums, other users can see all the forums they create or moderate.
        """
        if request.user.is_superuser:
            return Forum.objects.all()
        return Forum.objects.filter(id__in=Membership.objects.filter(user=request.user).filter(Q(role='creator') | Q(role='moderator')).values('forum'))

class AnnotationAdmin(admin.ModelAdmin):

    """
    Class for specifiying the options for administering the
    geodeliberator.geoannotator.models Annotation model via the Django admin.
    """

    list_display = ('id', 'author', 'forum', 'updated_at', 'content_type')
    list_filter = ('forum', 'sharelevel', 'content_type')
    radio_fields = {'sharelevel': admin.HORIZONTAL, 'content_type': admin.HORIZONTAL}
    search_fields = ('content',)
    exclude = ('annotation_id',)
    #exclude = ('members',)
    def queryset(self, request):
        """
        Return the queryset to use in the admin list view.  Superusers
        can see all forums, other users can see all the forums they create or moderate.
        """
        if request.user.is_superuser:
            return Annotation.objects.all()
        return Annotation.objects.filter(forum__in=Membership.objects.filter(user=request.user).filter(Q(role='creator') | Q(role='moderator')).values('forum'))

class ThemeReferenceInline(admin.TabularInline):
    model = ThemeReference
    extra = 1
    fk_name = 'target'

class GeoReferenceInline(admin.TabularInline):
    model = GeoReference
    extra = 1

class AnnotationAdmin(admin.ModelAdmin):

    """
    Class for specifiying the options for administering the
    geodeliberator.geoannotator.models Annotation model via the Django admin.
    """

    list_display = ('id', 'author', 'forum', 'updated_at', 'content_type')
    list_filter = ('forum', 'sharelevel', 'content_type')
    radio_fields = {'sharelevel': admin.HORIZONTAL, 'content_type': admin.HORIZONTAL}
    search_fields = ('content',)
    exclude = ('annotation_id',)
    inlines = (ThemeReferenceInline, GeoReferenceInline)
    def queryset(self, request):
        """
        Return the queryset to use in the admin list view.  Superusers
        can see all forums, other users can see all the forums they create or moderate.
        """
        if request.user.is_superuser:
            return Annotation.objects.all()
        return Annotation.objects.filter(forum__in=Membership.objects.filter(user=request.user).filter(Q(role='creator') | Q(role='moderator')).values('forum'))

class FootprintAdmin(admin.ModelAdmin):
    """
    Class for specifiying the options for administering the
    geodeliberator.geoannotator.models Annotation model via the Django admin.
    """
    list_display = ('id', 'created_at', 'geom_type', 'name')
    #list_filter = ('geom_type',)
    search_fields = ('name',)
    exclude = ('footprint_id',)

class CodeAdmin(admin.ModelAdmin):
    """
    Class for specifiying the options for administering the
    geodeliberator.geoannotator.models Code model via the Django admin.
    """
    list_display = ('id', 'classification', 'description', 'comment')

class CodeSchemeAdmin(admin.ModelAdmin):
    """
    Class for specifiying the options for administering the
    geodeliberator.geoannotator.models CodeScheme model via the Django admin.
    """
    list_display = ('id', 'classification', 'description')


admin.site.register(Forum, ForumAdmin)
admin.site.register(Annotation, AnnotationAdmin)
admin.site.register(Footprint, FootprintAdmin)
admin.site.register(Code, CodeAdmin)
admin.site.register(CodeScheme, CodeSchemeAdmin)