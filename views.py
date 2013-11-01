from django.shortcuts import render, redirect
from django.core.urlresolvers import reverse

def index(request):
    response = {}
    if request.user.is_authenticated():
	response['userId'] = request.user.id
	return render(request, 'index.html', response)
    return redirect(reverse('users.views.login_user'))

