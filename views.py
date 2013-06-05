from django.shortcuts import render, redirect

def index(request):
    response = {}
    if request.user.is_authenticated():
	response['userId'] = request.user.id
	return render(request, 'index.html', response)
    return redirect('/geodeliberator/user/login')
