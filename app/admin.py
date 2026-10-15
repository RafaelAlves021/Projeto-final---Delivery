
from django.contrib import admin
from .models import Categoria, Produto, Pedido, ItemPedido


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ("nome", "slug", "ordem_exibicao", "ativo")
    list_editable = ("ordem_exibicao", "ativo")
    prepopulated_fields = {"slug": ("nome",)}
    search_fields = ("nome",)


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


class ItemPedidoInline(admin.TabularInline):
    model = ItemPedido
    extra = 0


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
    list_display = ("pedido", "produto", "quantidade", "preco_unitario")
