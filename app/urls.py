
from django.urls import path
from . import views

urlpatterns = [
    path('', views.cardapio_view, name='cardapio'),
]
