from django.shortcuts import render, Http404, redirect
from django.contrib import messages
from .forms import RegistrationForm, UserUpdateForm, PerfilUpdateForm
from django.contrib.auth.decorators import login_required
from .models import Perfil

# Mock de dados simulando o retorno do banco de dados (Models)
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
        'badge': 'Mais vendido'
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
        'badge': "Chef's Choice"
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
        'badge': ''
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
        'badge': 'Novidade'
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
        'badge': ''
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
        'badge': ''
    }
]

def home(request):
    return render(request, 'pedidos/home.html', {'produtos': PRODUTOS_MOCK})

def detalhe_produto(request, slug):
    produto = next((p for p in PRODUTOS_MOCK if p['slug'] == slug), None)
    if not produto:
        raise Http404("Produto não encontrado")
    return render(request, 'pedidos/detalhe_produto.html', {'produto': produto})



def register(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Conta criada com sucesso! Faça seu login.')
            return redirect('login')  # Redireciona para a tela de login
    else:
        form = RegistrationForm()
    
    return render(request, 'usuarios/register.html', {'form': form})


@login_required
def perfil_view(request):
    # Garante que o perfil existe caso o utilizador seja antigo
    perfil, created = Perfil.objects.get_or_create(user=request.user)

    if request.method == 'POST':
        user_form = UserUpdateForm(request.POST, instance=request.user)
        perfil_form = PerfilUpdateForm(request.POST, instance=perfil)
        
        if user_form.is_valid() and perfil_form.is_valid():
            user_form.save()
            perfil_form.save()
            messages.success(request, 'Perfil atualizado com sucesso!')
            return redirect('perfil')
    else:
        user_form = UserUpdateForm(instance=request.user)
        perfil_form = PerfilUpdateForm(instance=perfil)

    context = {
        'user_form': user_form,
        'perfil_form': perfil_form,
    }
    return render(request, 'registration/perfil.html', context)