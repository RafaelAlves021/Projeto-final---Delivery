from django.urls import path, include
from django.views.generic import TemplateView
from django.contrib.auth import views as auth_views  # <--- ADICIONE ESTA LINHA NO TOPO
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('produto/<slug:slug>/', views.detalhe_produto, name='detalhe_produto'),
    path('cardapio/', views.home, name='cardapio'),
    path('checkout/', TemplateView.as_view(template_name='pedidos/home.html'), name='checkout'),
    path('register/', views.register, name='register'),
    path('login/', auth_views.LoginView.as_view(template_name='registration/login.html',next_page='home'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='home'), name='logout'),
    path('perfil/', views.perfil_view, name='perfil'),
]