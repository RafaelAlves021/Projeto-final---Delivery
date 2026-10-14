
from django.shortcuts import render
from django.http import Http404

from .models import Produto, Categoria


# Produtos temporários utilizados na página inicial e nos detalhes.
# Posteriormente, podemos substituir esses dados pela consulta ao banco.
PRODUTOS_MOCK = [
    {
        'id': 1,
        'slug': 'smash-classico-duplo',
        'nome': 'Smash Clássico Duplo',
        'categoria': 'burgers',
        'preco': '29,90',
        'preco_float': 29.90,
        'descricao': 'Dois ultra smash 90g de carne 100% Angus, american cheese derretido, cebola chapeada e molho artesanal no pão brioche.',
        'imagem_url': 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
        'badge': 'Mais vendido',
    },
    {
        'id': 2,
        'slug': 'bacon-melt-trufado',
        'nome': 'Bacon Melt Trufado',
        'categoria': 'burgers',
        'preco': '36,50',
        'preco_float': 36.50,
        'descricao': 'Blend Angus 160g, bacon crocante em tiras artesanais defumadas na macieira, creme de queijo trufado e brioche selado na manteiga.',
        'imagem_url': 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&auto=format&fit=crop&q=80',
        'badge': "Chef's Choice",
    },
    {
        'id': 3,
        'slug': 'batata-rustica-alecrim',
        'nome': 'Batata Rústica com Alecrim',
        'categoria': 'batatas',
        'preco': '19,00',
        'preco_float': 19.00,
        'descricao': 'Batatas especiais cortadas com casca, temperadas com flor de sal, alecrim fresco e acompanhadas de maionese verde da casa.',
        'imagem_url': 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80',
        'badge': '',
    },
    {
        'id': 4,
        'slug': 'crispy-chicken-spicy',
        'nome': 'Crispy Chicken Spicy',
        'categoria': 'frango',
        'preco': '28,00',
        'preco_float': 28.00,
        'descricao': 'Sobrecoxa marinada no buttermilk e frita com casquinha crocante, salada coleslaw cremosa e molho picante suave.',
        'imagem_url': 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80',
        'badge': 'Novidade',
    },
    {
        'id': 5,
        'slug': 'pink-lemonade-500ml',
        'nome': 'Pink Lemonade 500ml',
        'categoria': 'bebidas',
        'preco': '12,00',
        'preco_float': 12.00,
        'descricao': 'Limonada natural extraída na hora, infusão artesanal de frutas vermelhas silvestres e folhas frescas de hortelã.',
        'imagem_url': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
        'badge': '',
    },
    {
        'id': 6,
        'slug': 'cheesecake-new-york',
        'nome': 'Cheesecake New York',
        'categoria': 'sobremesas',
        'preco': '18,50',
        'preco_float': 18.50,
        'descricao': 'Massa crocante amanteigada de biscoito, creme de queijo aveludado e redução artesanal de framboesas e amoras.',
        'imagem_url': 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80',
        'badge': '',
    },
]


def home(request):
    """Exibe a página inicial com os produtos temporários."""
    return render(
        request,
        'pedidos/home.html',
        {'produtos': PRODUTOS_MOCK},
    )


def detalhe_produto(request, slug):
    """Exibe os detalhes de um produto pelo slug."""
    produto = next(
        (item for item in PRODUTOS_MOCK if item['slug'] == slug),
        None,
    )

    if produto is None:
        raise Http404('Produto não encontrado')

    return render(
        request,
        'pedidos/detalhe_produto.html',
        {'produto': produto},
    )


def cardapio_view(request):
    """Exibe categorias e produtos ativos cadastrados no banco."""
    categorias = Categoria.objects.filter(ativo=True)

    produtos = Produto.objects.filter(
        disponivel=True,
        categoria__ativo=True,
    ).select_related('categoria')

    contexto = {
        'categorias': categorias,
        'produtos': produtos,
    }

    return render(request, 'app/cardapio.html', contexto)
