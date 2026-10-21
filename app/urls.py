from django.urls import path
from django.contrib.auth.views import LogoutView
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('cardapio/', views.cardapio_view, name='cardapio'),
    path('produto/<slug:slug>/', views.detalhe_produto, name='detalhe_produto'),
    path('carrinho/', views.carrinho, name='carrinho'),
    path('checkout/', views.checkout, name='checkout'),
    path('cadastro/', views.cadastro, name='cadastro'),
    path('perfil/', views.perfil, name='perfil'),
    path('login/', views.LoginComMensagem.as_view(), name='login'),
    path('logout/', LogoutView.as_view(next_page='home'), name='logout'),
]