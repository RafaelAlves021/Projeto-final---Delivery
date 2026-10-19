from django.urls import path
from django.contrib.auth.views import LogoutView
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('produto/<slug:slug>/', views.detalhe_produto, name='detalhe_produto'),
    path('cardapio/', views.home, name='cardapio'),
    path('carrinho/', views.carrinho, name='carrinho'),
    path('checkout/', views.checkout, name='checkout'),
    
    # Rotas de Autenticação para satisfazer o template:
    path('login/', views.LoginComMensagem.as_view(), name='login'),
    path('logout/', LogoutView.as_view(next_page='home'), name='logout'),
    path('cadastro/', views.cadastro, name='cadastro'),
]