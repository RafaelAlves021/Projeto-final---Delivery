
from django.shortcuts import render, get_object_or_404

from .models import Produto, Categoria


def home(request):
    """Exibe o cardápio cadastrado no banco de dados."""
    return cardapio_view(request)


def detalhe_produto(request, slug):
    """Exibe o produto e suas opções de personalização."""
    produto = get_object_or_404(
        Produto.objects.select_related(
            'categoria'
        ).prefetch_related(
            'ingredientes_configurados__ingrediente',
            'adicionais_disponiveis__adicional',
            'molhos_disponiveis__molho',
        ),
        slug=slug,
        disponivel=True,
        categoria__ativo=True,
    )

    ingredientes = [
        relacao
        for relacao in produto.ingredientes_configurados.all()
        if relacao.ingrediente.ativo
    ]

    adicionais = [
        relacao
        for relacao in produto.adicionais_disponiveis.all()
        if relacao.adicional.ativo
    ]

    molhos = [
        relacao
        for relacao in produto.molhos_disponiveis.all()
        if relacao.molho.ativo
    ]

    contexto = {
        'produto': produto,
        'ingredientes': ingredientes,
        'adicionais': adicionais,
        'molhos': molhos,
    }

    return render(
        request,
        'pedidos/detalhe_produto.html',
        contexto,
    )


def cardapio_view(request):
    """Exibe categorias e produtos ativos cadastrados no banco."""
    categorias = Categoria.objects.filter(
        ativo=True,
    ).order_by(
        'ordem_exibicao',
        'nome',
    )

    produtos = Produto.objects.filter(
        disponivel=True,
        categoria__ativo=True,
    ).select_related(
        'categoria',
    ).order_by(
        'nome',
    )

    contexto = {
        'categorias': categorias,
        'produtos': produtos,
    }

    return render(
        request,
        'app/cardapio.html',
        contexto,
    )
