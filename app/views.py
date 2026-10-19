from django.shortcuts import render, redirect, get_object_or_404, Http404
from django.contrib import messages
from django.contrib.auth.views import LoginView
from django.contrib.messages.views import SuccessMessageMixin

# Imports dos models e formulários da equipe
try:
    from .models import Produto, Categoria
    from .forms import CadastroForm
except ImportError:
    Produto = None
    Categoria = None
    CadastroForm = None


class LoginComMensagem(SuccessMessageMixin, LoginView):
    template_name = 'registration/login.html'
    success_message = "Login realizado com sucesso!"


# Produtos temporários utilizados na página inicial e fallback de desenvolvimento
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
    """Exibe a página inicial com busca e produtos."""
    termo = request.GET.get('busca', '').strip().lower()
    produtos = PRODUTOS_MOCK
    if termo:
        produtos = [
            p for p in PRODUTOS_MOCK
            if termo in p['nome'].lower() or termo in p['descricao'].lower()
        ]
    return render(
        request,
        'pedidos/home.html',
        {'produtos': produtos, 'termo_busca': termo}
    )


def detalhe_produto(request, slug):
    """
    Exibe os detalhes do produto.
    Se o produto existir no banco, traz os dados completos do model.
    Caso contrário, busca no mock para não travar o front-end.
    """
    if Produto:
        try:
            produto = get_object_or_404(
                Produto.objects.select_related('categoria').prefetch_related(
                    'ingredientes_configurados__ingrediente',
                    'adicionais_disponiveis__adicional',
                    'molhos_disponiveis__molho',
                ),
                slug=slug,
                disponivel=True,
                categoria__ativo=True,
            )

            ingredientes = [
                rel for rel in produto.ingredientes_configurados.all()
                if rel.ingrediente.ativo
            ]
            adicionais = [
                rel for rel in produto.adicionais_disponiveis.all()
                if rel.adicional.ativo
            ]
            molhos = [
                rel for rel in produto.molhos_disponiveis.all()
                if rel.molho.ativo
            ]

            return render(
                request,
                'pedidos/detalhe_produto.html',
                {
                    'produto': produto,
                    'ingredientes': ingredientes,
                    'adicionais': adicionais,
                    'molhos': molhos,
                }
            )
        except Exception:
            pass

    # Fallback seguro para o Mock
    produto_mock = next((p for p in PRODUTOS_MOCK if p['slug'] == slug), None)
    if not produto_mock:
        raise Http404("Produto não encontrado")
    return render(request, 'pedidos/detalhe_produto.html', {'produto': produto_mock})


def cardapio_view(request):
    """Exibe categorias e produtos ativos cadastrados no banco."""
    if not Categoria or not Produto:
        return redirect('home')

    categorias = Categoria.objects.filter(ativo=True).order_by('ordem_exibicao', 'nome')
    produtos = Produto.objects.filter(disponivel=True, categoria__ativo=True).select_related('categoria').order_by('nome')

    return render(
        request,
        'app/cardapio.html',
        {'categorias': categorias, 'produtos': produtos}
    )


def carrinho(request):
    """Exibe a sacola/carrinho de compras."""
    return render(request, 'pedidos/carrinho.html')


def checkout(request):
    """Exibe a tela de identificação, endereço e forma de pagamento."""
    return render(request, 'pedidos/checkout.html')


def cadastro(request):
    """Fluxo de cadastro de novos clientes."""
    if request.user.is_authenticated:
        return redirect('home')

    if not CadastroForm:
        return redirect('home')

    if request.method == 'POST':
        form = CadastroForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Cadastro realizado! Faça login para continuar.")
            return redirect('login')
    else:
        form = CadastroForm()

    return render(request, 'registration/cadastro.html', {'form': form})