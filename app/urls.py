
from django.urls import path
from django.views.generic import TemplateView

from . import views


urlpatterns = [
    # Página inicial da BURGA RUA
    path('', views.home, name='home'),

    # Cardápio conectado ao banco de dados
    path(
        'cardapio/',
        views.cardapio_view,
        name='cardapio',
    ),

    # Detalhes de cada produto
    path(
        'produto/<slug:slug>/',
        views.detalhe_produto,
        name='detalhe_produto',
    ),

    # Rotas provisórias do projeto
    path(
        'checkout/',
        TemplateView.as_view(
            template_name='pedidos/home.html',
        ),
        name='checkout',
    ),
    path(
        'login/',
        TemplateView.as_view(
            template_name='pedidos/home.html',
        ),
        name='login',
    ),
    path(
        'cadastro/',
        TemplateView.as_view(
            template_name='pedidos/home.html',
        ),
        name='cadastro',
    ),
]
