from django.urls import path
from django.views.generic import TemplateView

urlpatterns = [
    path('', TemplateView.as_view(template_name='pedidos/home.html'), name='home'),
    path('detalhe/', TemplateView.as_view(template_name='pedidos/detalhe_produto.html'), name='detalhe_teste'),
    
    # Rotas temporárias para resolver os links do template sem dar erro:
    path('cardapio/', TemplateView.as_view(template_name='pedidos/home.html'), name='cardapio'),
    path('checkout/', TemplateView.as_view(template_name='pedidos/home.html'), name='checkout'),
    path('login/', TemplateView.as_view(template_name='pedidos/home.html'), name='login'),
    path('cadastro/', TemplateView.as_view(template_name='pedidos/home.html'), name='cadastro'),
]