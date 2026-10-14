from django.shortcuts import render
from .models import Produto, Categoria


def cardapio_view(request):
    categorias = Categoria.objects.filter(ativo=True)
    produtos = Produto.objects.filter(
        disponivel=True,
        categoria__ativo=True
    ).select_related('categoria')

    contexto = {
        'categorias': categorias,
        'produtos': produtos,
    }

    return render(request, 'app/cardapio.html', contexto)
