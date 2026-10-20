from django.urls import path
from django.contrib.auth.views import LoginView, LogoutView

from . import views


urlpatterns = [
    path('', views.home, name='home'),
    path('cardapio/', views.home, name='cardapio'),
    path('produto/<slug:slug>/', views.detalhe_produto, name='detalhe_produto'),
    path('carrinho/', views.carrinho, name='carrinho'),
    path('checkout/', views.checkout, name='checkout'),
    path('cadastro/', views.cadastro, name='cadastro'),
    path('perfil/', views.perfil, name='perfil'),  # <-- A ROTA NOVA AQUI
    path(
        'login/',
        LoginView.as_view(template_name='login.html'),
        name='login',
    ),
    path(
        'logout/',
        LogoutView.as_view(next_page='home'),
        name='logout',
    ),
]