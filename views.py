from django.shortcuts import render

def index(request):
    response = {}
    if request.user.is_authenticated():
	response['userId'] = request.user.id
	return render(request, 'index.html', response)
    return render(request, 'index.html')
