from django.urls import path
from django.views.generic import TemplateView

from . import views


urlpatterns = [
    # Página inicial da BURGA RUA
    path('', views.home, name='home'),
    path('produto/<slug:slug>/', views.detalhe_produto, name='detalhe_produto'),
    path('cardapio/', views.home, name='cardapio'),
    path('checkout/', TemplateView.as_view(template_name='pedidos/home.html'), name='checkout'),
    path('login/', TemplateView.as_view(template_name='pedidos/home.html'), name='login'),
]
