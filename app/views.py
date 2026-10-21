from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import LoginView
from django.contrib.messages.views import SuccessMessageMixin

from .models import Produto, Categoria
from .forms import CadastroForm, EditarPerfilForm


class LoginComMensagem(SuccessMessageMixin, LoginView):
    template_name = 'registration/login.html'
    success_message = "Login realizado com sucesso!"


def home(request):
    """Página inicial: exibe o cardápio vindo do banco."""
    return cardapio_view(request)


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

    # Tenta renderizar pedidos/home.html ou app/cardapio.html
    return render(request, 'pedidos/home.html', contexto)


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

    return render(request, 'pedidos/detalhe_produto.html', contexto)


def carrinho(request):
    """Página do carrinho (itens vêm do localStorage via JS)."""
    return render(request, 'pedidos/carrinho.html')


def checkout(request):
    """Página de checkout."""
    return render(request, 'pedidos/checkout.html')


def cadastro(request):
    """Cadastro de novo usuário."""
    if request.user.is_authenticated:
        return redirect('home')

    if request.method == 'POST':
        form = CadastroForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(
                request,
                "Cadastro realizado! Faça login para continuar.",
            )
            return redirect('login')
    else:
        form = CadastroForm()

    return render(request, 'registration/cadastro.html', {'form': form})


@login_required
def perfil(request):
    """Permite que o usuário logado edite seus próprios dados."""
    if request.method == 'POST':
        form = EditarPerfilForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Seus dados foram atualizados com sucesso!')
            return redirect('perfil')
    else:
        form = EditarPerfilForm(instance=request.user)
    
    return render(request, 'pedidos/perfil.html', {'form': form})