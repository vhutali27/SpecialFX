from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='SpecialFX'), # '' => homepage
    path('about/', views.about, name='SpecialFX-about'),
]
