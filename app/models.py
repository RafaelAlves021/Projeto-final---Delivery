
from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal


class Categoria(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    ordem_exibicao = models.PositiveIntegerField(default=0)
    ativo = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Categoria"
        verbose_name_plural = "Categorias"
        ordering = ["ordem_exibicao", "nome"]

    def __str__(self):
        return self.nome


class Produto(models.Model):
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.CASCADE,
        related_name="produtos",
    )
    nome = models.CharField(max_length=150)
    slug = models.SlugField(max_length=150, unique=True)
    descricao = models.TextField(blank=True)
    preco = models.DecimalField(max_digits=8, decimal_places=2)
    preco_promocional = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
    )
    imagem = models.ImageField(
        upload_to="produtos/",
        null=True,
        blank=True,
    )
    imagem_url = models.URLField(
        max_length=500,
        blank=True,
        default="",
    )
    disponivel = models.BooleanField(default=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Produto"
        verbose_name_plural = "Produtos"
        ordering = ["nome"]

    @property
    def preco_atual(self):
        if self.preco_promocional is not None:
            return self.preco_promocional
        return self.preco

    def __str__(self):
        return self.nome


class Ingrediente(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    descricao = models.CharField(max_length=255, blank=True)
    ativo = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Ingrediente"
        verbose_name_plural = "Ingredientes"
        ordering = ["nome"]

    def __str__(self):
        return self.nome


class Adicional(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    descricao = models.CharField(max_length=255, blank=True)
    preco = models.DecimalField(max_digits=8, decimal_places=2)
    ativo = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Adicional"
        verbose_name_plural = "Adicionais"
        ordering = ["nome"]

    def __str__(self):
        return f"{self.nome} (+ R$ {self.preco})"


class Molho(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    descricao = models.CharField(max_length=255, blank=True)
    preco = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    ativo = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Molho"
        verbose_name_plural = "Molhos"
        ordering = ["nome"]

    def __str__(self):
        return self.nome


class ProdutoIngrediente(models.Model):
    produto = models.ForeignKey(
        Produto,
        on_delete=models.CASCADE,
        related_name="ingredientes_configurados",
    )
    ingrediente = models.ForeignKey(
        Ingrediente,
        on_delete=models.PROTECT,
        related_name="produtos",
    )
    removivel = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Ingrediente do produto"
        verbose_name_plural = "Ingredientes dos produtos"
        constraints = [
            models.UniqueConstraint(
                fields=["produto", "ingrediente"],
                name="unico_ingrediente_por_produto",
            ),
        ]

    def __str__(self):
        return f"{self.produto.nome} - {self.ingrediente.nome}"


class ProdutoAdicional(models.Model):
    produto = models.ForeignKey(
        Produto,
        on_delete=models.CASCADE,
        related_name="adicionais_disponiveis",
    )
    adicional = models.ForeignKey(
        Adicional,
        on_delete=models.PROTECT,
        related_name="produtos",
    )

    class Meta:
        verbose_name = "Adicional do produto"
        verbose_name_plural = "Adicionais dos produtos"
        constraints = [
            models.UniqueConstraint(
                fields=["produto", "adicional"],
                name="unico_adicional_por_produto",
            ),
        ]

    def __str__(self):
        return f"{self.produto.nome} - {self.adicional.nome}"


class ProdutoMolho(models.Model):
    produto = models.ForeignKey(
        Produto,
        on_delete=models.CASCADE,
        related_name="molhos_disponiveis",
    )
    molho = models.ForeignKey(
        Molho,
        on_delete=models.PROTECT,
        related_name="produtos",
    )

    class Meta:
        verbose_name = "Molho do produto"
        verbose_name_plural = "Molhos dos produtos"
        constraints = [
            models.UniqueConstraint(
                fields=["produto", "molho"],
                name="unico_molho_por_produto",
            ),
        ]

    def __str__(self):
        return f"{self.produto.nome} - {self.molho.nome}"


class Pedido(models.Model):
    STATUS_CHOICES = [
        ("CRIADO", "Criado"),
        ("EM_PREPARO", "Em Preparo"),
        ("EM_ROTA", "Saiu para Entrega"),
        ("CONCLUIDO", "Concluído"),
        ("CANCELADO", "Cancelado"),
    ]

    cliente = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="pedidos",
    )
    codigo_pedido = models.CharField(max_length=20, unique=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="CRIADO",
    )
    endereco_entrega = models.CharField(max_length=255)
    telefone_contato = models.CharField(max_length=20)
    observacao = models.TextField(blank=True)
    subtotal = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    taxa_entrega = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=Decimal("5.00"),
    )
    valor_total = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Pedido"
        verbose_name_plural = "Pedidos"
        ordering = ["-criado_em"]

    def __str__(self):
        return f"Pedido {self.codigo_pedido} - {self.cliente.username}"


class ItemPedido(models.Model):
    pedido = models.ForeignKey(
        Pedido,
        on_delete=models.CASCADE,
        related_name="itens",
    )
    produto = models.ForeignKey(
        Produto,
        on_delete=models.PROTECT,
    )
    quantidade = models.PositiveIntegerField(default=1)
    preco_unitario = models.DecimalField(
        max_digits=8,
        decimal_places=2,
    )
    observacoes = models.CharField(max_length=255, blank=True)

    # Cópias das escolhas feitas no momento do pedido.
    # Preservam o histórico mesmo se o cadastro mudar depois.
    personalizacao = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.quantidade}x {self.produto.nome}"
