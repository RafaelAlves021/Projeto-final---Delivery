from django.db import models
from django.contrib.auth.models import User

# 1. Tabela de Categorias (ex: Hambúrgueres, Bebidas, Sobremesas)
class Categoria(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    ordem_exibicao = models.PositiveIntegerField(default=0)
    ativo = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Categoria'
        verbose_name_plural = 'Categorias'
        ordering = ['ordem_exibicao', 'nome']

    def __str__(self):
        return self.nome


# 2. Tabela de Produtos/Pratos do cardápio
class Produto(models.Model):
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='produtos')
    nome = models.CharField(max_length=150)
    slug = models.SlugField(max_length=150, unique=True)
    descricao = models.TextField(blank=True)
    preco = models.DecimalField(max_digits=8, decimal_places=2)
    preco_promocional = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    imagem = models.ImageField(upload_to='produtos/', null=True, blank=True)
    disponivel = models.BooleanField(default=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Produto'
        verbose_name_plural = 'Produtos'
        ordering = ['nome']

    def __str__(self):
        return self.nome


# 3. Tabela do Pedido principal
class Pedido(models.Model):
    STATUS_CHOICES = [
        ('CRIADO', 'Criado'),
        ('EM_PREPARO', 'Em Preparo'),
        ('EM_ROTA', 'Saiu para Entrega'),
        ('CONCLUIDO', 'Concluído'),
        ('CANCELADO', 'Cancelado'),
    ]

    cliente = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pedidos')
    codigo_pedido = models.CharField(max_length=20, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='CRIADO')
    endereco_entrega = models.CharField(max_length=255)
    telefone_contato = models.CharField(max_length=20)
    observacao = models.TextField(blank=True)
    subtotal = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    taxa_entrega = models.DecimalField(max_digits=6, decimal_places=2, default=5.00)
    valor_total = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Pedido'
        verbose_name_plural = 'Pedidos'
        ordering = ['-criado_em']

    def __str__(self):
        return f"Pedido {self.codigo_pedido} - {self.cliente.username}"


# 4. Tabela dos itens individuais dentro de um pedido
class ItemPedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='itens')
    produto = models.ForeignKey(Produto, on_delete=models.PROTECT)
    quantidade = models.PositiveIntegerField(default=1)
    preco_unitario = models.DecimalField(max_digits=8, decimal_places=2)
    observacoes = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.quantidade}x {self.produto.nome}"