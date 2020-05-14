from django.shortcuts import render
from django.http import HttpResponse

def home(request):
    return render(request, 'SpecialFX/main.html')

def about(request):
    return render(request, 'SpecialFX/about.html')
