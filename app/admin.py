from django.contrib import admin
from .models import Categoria, Produto, Pedido, ItemPedido

# Permite ver e adicionar os itens do pedido diretamente dentro da página do Pedido
class ItemPedidoInline(admin.TabularInline):
    model = ItemPedido
    extra = 1


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'ordem_exibicao', 'ativo')
    list_filter = ('ativo',)
    search_fields = ('nome',)
    prepopulated_fields = {'slug': ('nome',)}


@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'categoria', 'preco', 'preco_promocional', 'disponivel', 'criado_em')
    list_filter = ('categoria', 'disponivel')
    search_fields = ('nome', 'descricao')
    prepopulated_fields = {'slug': ('nome',)}


@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ('codigo_pedido', 'cliente', 'status', 'valor_total', 'criado_em')
    list_filter = ('status', 'criado_em')
    search_fields = ('codigo_pedido', 'cliente__username', 'endereco_entrega')
    inlines = [ItemPedidoInline]