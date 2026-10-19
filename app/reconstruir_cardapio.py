import os
import sys
from pathlib import Path
from decimal import Decimal

import django

RAIZ_PROJETO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ_PROJETO))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.db import transaction
from app.models import (
    Categoria,
    Produto,
    Ingrediente,
    Adicional,
    Molho,
    ProdutoIngrediente,
    ProdutoAdicional,
    ProdutoMolho,
)


# Os seis produtos atuais serão preservados.
# Estes são os 45 novos itens para chegar a 51.

NOVOS_PRODUTOS = [
    # HAMBÚRGUERES — 13 novos
    ("rua-classico", "Rua Clássico", "burgers", "27.90",
     "Hambúrguer artesanal, queijo derretido, alface, tomate e molho da casa."),
    ("cheddar-bacon", "Cheddar Bacon", "burgers", "34.90",
     "Blend bovino, cheddar cremoso, bacon crocante e pão brioche."),
    ("barbecue-smash", "Barbecue Smash", "burgers", "31.90",
     "Smash bovino, queijo, cebola caramelizada e molho barbecue."),
    ("duplo-cheddar", "Duplo Cheddar", "burgers", "35.90",
     "Dois discos de carne, cheddar, picles e molho especial."),
    ("smash-picles", "Smash Picles", "burgers", "28.90",
     "Smash bovino, queijo, picles crocantes e molho da casa."),
    ("triplo-rua", "Triplo Rua", "burgers", "42.90",
     "Três discos de carne, queijo derretido e molho especial."),
    ("crispy-burger", "Crispy Burger", "burgers", "32.90",
     "Hambúrguer com cebola crocante, queijo e molho defumado."),
    ("jalapeno-burger", "Jalapeño Burger", "burgers", "34.50",
     "Blend bovino, queijo, jalapeño e molho levemente picante."),
    ("onion-burger", "Onion Burger", "burgers", "30.90",
     "Hambúrguer artesanal com cebola grelhada e queijo."),
    ("melt-duplo", "Melt Duplo", "burgers", "37.90",
     "Dois discos de carne, queijo cremoso e brioche tostado."),
    ("frango-burger-rua", "Chicken Burger Rua", "burgers", "29.90",
     "Frango crocante, alface fresca e maionese temperada."),
    ("cheese-salada", "Cheese Salada", "burgers", "28.50",
     "Hambúrguer, queijo, alface, tomate e molho especial."),
    ("bacon-cebola", "Bacon e Cebola", "burgers", "33.90",
     "Blend bovino, bacon, cebola caramelizada e queijo."),

    # ACOMPANHAMENTOS — 9 novos
    ("batata-cheddar", "Batata com Cheddar", "batatas", "24.90",
     "Batatas crocantes cobertas com cheddar cremoso."),
    ("batata-bacon", "Batata com Bacon", "batatas", "26.90",
     "Porção de batatas com bacon crocante."),
    ("batata-cheddar-bacon", "Batata Cheddar e Bacon", "batatas", "29.90",
     "Batatas crocantes, cheddar e bacon."),
    ("onion-rings", "Onion Rings", "batatas", "22.90",
     "Anéis de cebola empanados e crocantes."),
    ("nuggets-6", "Nuggets — 6 unidades", "batatas", "17.90",
     "Seis unidades de frango empanado e crocante."),
    ("nuggets-10", "Nuggets — 10 unidades", "batatas", "24.90",
     "Dez unidades de frango empanado e crocante."),
    ("batata-canoinha", "Batata Canoinha", "batatas", "21.90",
     "Batatas em formato canoa, temperadas e crocantes."),
    ("polenta-crocante", "Polenta Crocante", "batatas", "19.90",
     "Porção de polenta dourada e crocante."),
    ("mix-fritas", "Mix de Fritas", "batatas", "27.90",
     "Porção para compartilhar com batatas e onion rings."),

    # FRANGO — 7 novos
    ("crispy-chicken-classico", "Crispy Chicken Clássico", "frango", "27.90",
     "Frango crocante, alface e maionese especial no brioche."),
    ("chicken-cheddar", "Chicken Cheddar", "frango", "30.90",
     "Frango empanado com cheddar cremoso."),
    ("chicken-bacon", "Chicken Bacon", "frango", "32.90",
     "Frango crocante, bacon e queijo derretido."),
    ("chicken-bbq", "Chicken BBQ", "frango", "29.90",
     "Frango empanado com molho barbecue."),
    ("tiras-frango-6", "Tiras de Frango — 6 unidades", "frango", "25.90",
     "Tiras de frango empanadas, servidas crocantes."),
    ("tiras-frango-10", "Tiras de Frango — 10 unidades", "frango", "34.90",
     "Dez tiras de frango empanadas para compartilhar."),
    ("chicken-spicy-duplo", "Chicken Spicy Duplo", "frango", "34.90",
     "Frango crocante em dose dupla com molho picante."),

    # BEBIDAS — 9 novos
    ("cola-lata", "Refrigerante Cola 350ml", "bebidas", "6.00",
     "Refrigerante de cola em lata de 350ml."),
    ("cola-zero-lata", "Cola Zero 350ml", "bebidas", "6.00",
     "Refrigerante de cola sem açúcar em lata de 350ml."),
    ("guarana-lata", "Guaraná 350ml", "bebidas", "6.00",
     "Refrigerante de guaraná em lata de 350ml."),
    ("laranja-lata", "Refrigerante de Laranja 350ml", "bebidas", "6.00",
     "Refrigerante sabor laranja em lata de 350ml."),
    ("agua-sem-gas", "Água Mineral 500ml", "bebidas", "4.00",
     "Água mineral sem gás, garrafa de 500ml."),
    ("agua-com-gas", "Água com Gás 500ml", "bebidas", "4.50",
     "Água mineral com gás, garrafa de 500ml."),
    ("cha-pessego", "Chá Gelado de Pêssego", "bebidas", "8.90",
     "Chá gelado sabor pêssego."),
    ("limonada-natural", "Limonada Natural", "bebidas", "9.90",
     "Limonada preparada com limão e gelo."),
    ("milkshake-chocolate", "Milkshake de Chocolate", "bebidas", "18.90",
     "Milkshake cremoso sabor chocolate."),

    # SOBREMESAS — 7 novos
    ("brownie-chocolate", "Brownie de Chocolate", "sobremesas", "12.90",
     "Brownie de chocolate com interior macio."),
    ("cookie-chocolate", "Cookie de Chocolate", "sobremesas", "9.90",
     "Cookie assado com gotas de chocolate."),
    ("cookie-duplo-chocolate", "Cookie Duplo Chocolate", "sobremesas", "11.90",
     "Cookie com massa e gotas de chocolate."),
    ("pudim-leite", "Pudim de Leite", "sobremesas", "10.90",
     "Pudim de leite condensado com calda de caramelo."),
    ("churros-doce-leite", "Churros com Doce de Leite", "sobremesas", "14.90",
     "Churros polvilhados com açúcar e canela."),
    ("sundae-chocolate", "Sundae de Chocolate", "sobremesas", "12.90",
     "Sobremesa gelada com calda de chocolate."),
    ("mousse-maracuja", "Mousse de Maracujá", "sobremesas", "10.90",
     "Mousse cremosa de maracujá."),
]


# Imagens por categoria. Os produtos novos de cada categoria
# compartilham uma imagem de referência; você pode refiná-las depois.
IMAGENS = {
    "burgers": (
        "https://images.unsplash.com/"
        "photo-1553979459-d2229ba7433b?w=600&auto=format&fit=crop&q=80"
    ),
    "batatas": (
        "https://images.unsplash.com/"
        "photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80"
    ),
    "frango": (
        "https://images.unsplash.com/"
        "photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80"
    ),
    "bebidas": (
        "https://images.unsplash.com/"
        "photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80"
    ),
    "sobremesas": (
        "https://images.unsplash.com/"
        "photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80"
    ),
}


INGREDIENTES = [
    ("Queijo", "Queijo do hambúrguer."),
    ("Bacon", "Bacon crocante."),
    ("Cebola", "Cebola do hambúrguer."),
]

ADICIONAIS = [
    ("Queijo extra", "Uma porção extra de queijo.", "3.00"),
    ("Bacon extra", "Uma porção extra de bacon.", "4.00"),
    ("Cebola extra", "Uma porção extra de cebola.", "1.50"),
]

MOLHOS = [
    ("Maionese da casa", "Maionese especial da casa."),
    ("Molho barbecue", "Molho barbecue."),
    ("Molho especial", "Molho especial da hamburgueria."),
]


@transaction.atomic
def expandir_cardapio():
    categorias = {
        categoria.slug: categoria
        for categoria in Categoria.objects.filter(
            slug__in=IMAGENS.keys()
        )
    }

    faltantes = set(IMAGENS.keys()) - set(categorias.keys())
    if faltantes:
        raise ValueError(
            "Categorias ausentes: " + ", ".join(sorted(faltantes))
        )

    criados = 0
    atualizados = 0

    for slug, nome, categoria_slug, preco, descricao in NOVOS_PRODUTOS:
        produto, criado = Produto.objects.update_or_create(
            slug=slug,
            defaults={
                "nome": nome,
                "categoria": categorias[categoria_slug],
                "preco": Decimal(preco),
                "descricao": descricao,
                "imagem_url": IMAGENS[categoria_slug],
                "disponivel": True,
            },
        )

        if criado:
            criados += 1
            print(f"CRIADO: {produto.nome}")
        else:
            atualizados += 1
            print(f"ATUALIZADO: {produto.nome}")

    # Garantir que as opções de personalização existam.
    ingredientes = {}
    for nome, descricao in INGREDIENTES:
        ingrediente, _ = Ingrediente.objects.get_or_create(
            nome=nome,
            defaults={"descricao": descricao, "ativo": True},
        )
        ingredientes[nome] = ingrediente

    adicionais = {}
    for nome, descricao, preco in ADICIONAIS:
        adicional, _ = Adicional.objects.get_or_create(
            nome=nome,
            defaults={
                "descricao": descricao,
                "preco": Decimal(preco),
                "ativo": True,
            },
        )
        adicionais[nome] = adicional

    molhos = {}
    for nome, descricao in MOLHOS:
        molho, _ = Molho.objects.get_or_create(
            nome=nome,
            defaults={
                "descricao": descricao,
                "preco": Decimal("0.00"),
                "ativo": True,
            },
        )
        molhos[nome] = molho

    # Vincular ingredientes, adicionais e molhos a todos
    # os produtos da categoria de hambúrgueres.
    hamburgueres = Produto.objects.filter(
        categoria__slug="burgers",
        disponivel=True,
    )

    vinculos_novos = 0

    for produto in hamburgueres:
        for ingrediente in ingredientes.values():
            _, criado = ProdutoIngrediente.objects.get_or_create(
                produto=produto,
                ingrediente=ingrediente,
                defaults={"removivel": True},
            )
            vinculos_novos += int(criado)

        for adicional in adicionais.values():
            _, criado = ProdutoAdicional.objects.get_or_create(
                produto=produto,
                adicional=adicional,
            )
            vinculos_novos += int(criado)

        for molho in molhos.values():
            _, criado = ProdutoMolho.objects.get_or_create(
                produto=produto,
                molho=molho,
            )
            vinculos_novos += int(criado)

    print("\n" + "=" * 45)
    print("EXPANSÃO DO BURGA RUA CONCLUÍDA")
    print(f"Produtos novos criados: {criados}")
    print(f"Produtos existentes atualizados: {atualizados}")
    print(f"Total de produtos no banco: {Produto.objects.count()}")
    print(f"Total de categorias: {Categoria.objects.count()}")
    print(f"Hambúrgueres personalizados: {hamburgueres.count()}")
    print(f"Novos vínculos de personalização: {vinculos_novos}")
    print("=" * 45)


if __name__ == "__main__":
    expandir_cardapio()