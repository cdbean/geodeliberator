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

    list_display = ('name',)
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

class PostAdmin(admin.ModelAdmin):

    """
    Class for specifiying the options for administering the
    geodeliberator.geoannotator.models Post model via the Django admin.
    """

    list_display = ('id', 'author', 'plan', 'updated_at')
    radio_fields = {'sharelevel': admin.HORIZONTAL, 'content_type': admin.HORIZONTAL}
    search_fields = ('content',)
    #exclude = ('members',)
    def queryset(self, request):
        """
        Return the queryset to use in the admin list view.  Superusers
        can see all forums, other users can see all the forums they create or moderate.
        """
        if request.user.is_superuser:
            return Annotation.objects.all()
        return Annotation.objects.filter(forum__in=Membership.objects.filter(user=request.user).filter(Q(role='creator') | Q(role='moderator')).values('forum'))

admin.site.register(Forum, ForumAdmin)
