
from django.contrib import admin

from .models import (
    Categoria,
    Produto,
    Pedido,
    ItemPedido,
    Ingrediente,
    Adicional,
    Molho,
    ProdutoIngrediente,
    ProdutoAdicional,
    ProdutoMolho,
)


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ("nome", "slug", "ordem_exibicao", "ativo")
    list_editable = ("ordem_exibicao", "ativo")
    prepopulated_fields = {"slug": ("nome",)}
    search_fields = ("nome",)
    list_filter = ("ativo",)


class ProdutoIngredienteInline(admin.TabularInline):
    model = ProdutoIngrediente
    extra = 1
    autocomplete_fields = ("ingrediente",)


class ProdutoAdicionalInline(admin.TabularInline):
    model = ProdutoAdicional
    extra = 1
    autocomplete_fields = ("adicional",)


class ProdutoMolhoInline(admin.TabularInline):
    model = ProdutoMolho
    extra = 1
    autocomplete_fields = ("molho",)


@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    list_display = (
        "nome",
        "categoria",
        "preco",
        "preco_promocional",
        "disponivel",
    )
    list_filter = ("categoria", "disponivel")
    list_editable = ("preco", "disponivel")
    prepopulated_fields = {"slug": ("nome",)}
    search_fields = ("nome", "descricao")
    inlines = [
        ProdutoIngredienteInline,
        ProdutoAdicionalInline,
        ProdutoMolhoInline,
    ]


@admin.register(Ingrediente)
class IngredienteAdmin(admin.ModelAdmin):
    list_display = ("nome", "descricao", "ativo")
    list_filter = ("ativo",)
    list_editable = ("ativo",)
    search_fields = ("nome", "descricao")


@admin.register(Adicional)
class AdicionalAdmin(admin.ModelAdmin):
    list_display = ("nome", "preco", "ativo")
    list_filter = ("ativo",)
    list_editable = ("preco", "ativo")
    search_fields = ("nome", "descricao")


@admin.register(Molho)
class MolhoAdmin(admin.ModelAdmin):
    list_display = ("nome", "preco", "ativo")
    list_filter = ("ativo",)
    list_editable = ("preco", "ativo")
    search_fields = ("nome", "descricao")


class ItemPedidoInline(admin.TabularInline):
    model = ItemPedido
    extra = 0
    readonly_fields = ("personalizacao",)


@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = (
        "codigo_pedido",
        "cliente",
        "status",
        "valor_total",
        "criado_em",
    )
    list_filter = ("status", "criado_em")
    search_fields = ("codigo_pedido", "cliente__username")
    inlines = [ItemPedidoInline]


@admin.register(ItemPedido)
class ItemPedidoAdmin(admin.ModelAdmin):
    list_display = (
        "pedido",
        "produto",
        "quantidade",
        "preco_unitario",
    )
    readonly_fields = ("personalizacao",)
