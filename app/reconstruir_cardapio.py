
import os
import sys
from pathlib import Path
from decimal import Decimal

import django


# ============================================================
# CONFIGURAÇÃO DO DJANGO
# ============================================================

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


# ============================================================
# CATEGORIAS
# ============================================================

CATEGORIAS = [
    ("Hambúrgueres", "burgers", 1),
    ("Batatas", "batatas", 2),
    ("Frango", "frango", 3),
    ("Bebidas", "bebidas", 4),
    ("Sobremesas", "sobremesas", 5),
]


# ============================================================
# PRODUTOS
# 6 produtos originais + 45 novos = 51 produtos
# ============================================================

PRODUTOS = [
    # HAMBÚRGUERES
    (
        "smash-classico-duplo",
        "Smash Clássico Duplo",
        "burgers",
        "29.90",
        "Dois discos de carne smash, queijo derretido e pão brioche.",
    ),
    (
        "bacon-melt-trufado",
        "Bacon Melt Trufado",
        "burgers",
        "36.50",
        "Hambúrguer artesanal, bacon crocante, queijo e molho trufado.",
    ),
    (
        "rua-classico",
        "Rua Clássico",
        "burgers",
        "27.90",
        "Hambúrguer artesanal, queijo derretido, alface, tomate e molho da casa.",
    ),
    (
        "cheddar-bacon",
        "Cheddar Bacon",
        "burgers",
        "34.90",
        "Blend bovino, cheddar cremoso, bacon crocante e pão brioche.",
    ),
    (
        "barbecue-smash",
        "Barbecue Smash",
        "burgers",
        "31.90",
        "Smash bovino, queijo, cebola caramelizada e molho barbecue.",
    ),
    (
        "duplo-cheddar",
        "Duplo Cheddar",
        "burgers",
        "35.90",
        "Dois discos de carne, cheddar, picles e molho especial.",
    ),
    (
        "smash-picles",
        "Smash Picles",
        "burgers",
        "28.90",
        "Smash bovino, queijo, picles crocantes e molho da casa.",
    ),
    (
        "triplo-rua",
        "Triplo Rua",
        "burgers",
        "42.90",
        "Três discos de carne, queijo derretido e molho especial.",
    ),
    (
        "crispy-burger",
        "Crispy Burger",
        "burgers",
        "32.90",
        "Hambúrguer com cebola crocante, queijo e molho defumado.",
    ),
    (
        "jalapeno-burger",
        "Jalapeño Burger",
        "burgers",
        "34.50",
        "Blend bovino, queijo, jalapeño e molho levemente picante.",
    ),
    (
        "onion-burger",
        "Onion Burger",
        "burgers",
        "30.90",
        "Hambúrguer artesanal com cebola grelhada e queijo.",
    ),
    (
        "melt-duplo",
        "Melt Duplo",
        "burgers",
        "37.90",
        "Dois discos de carne, queijo cremoso e brioche tostado.",
    ),
    (
        "frango-burger-rua",
        "Chicken Burger Rua",
        "burgers",
        "29.90",
        "Frango crocante, alface fresca e maionese temperada.",
    ),
    (
        "cheese-salada",
        "Cheese Salada",
        "burgers",
        "28.50",
        "Hambúrguer, queijo, alface, tomate e molho especial.",
    ),
    (
        "bacon-cebola",
        "Bacon e Cebola",
        "burgers",
        "33.90",
        "Blend bovino, bacon, cebola caramelizada e queijo.",
    ),

    # BATATAS E ACOMPANHAMENTOS
    (
        "batata-rustica-alecrim",
        "Batata Rústica com Alecrim",
        "batatas",
        "19.00",
        "Batatas especiais cortadas com casca e temperadas com alecrim.",
    ),
    (
        "batata-cheddar",
        "Batata com Cheddar",
        "batatas",
        "24.90",
        "Batatas crocantes cobertas com cheddar cremoso.",
    ),
    (
        "batata-bacon",
        "Batata com Bacon",
        "batatas",
        "26.90",
        "Porção de batatas com bacon crocante.",
    ),
    (
        "batata-cheddar-bacon",
        "Batata Cheddar e Bacon",
        "batatas",
        "29.90",
        "Batatas crocantes, cheddar e bacon.",
    ),
    (
        "onion-rings",
        "Onion Rings",
        "batatas",
        "22.90",
        "Anéis de cebola empanados e crocantes.",
    ),
    (
        "nuggets-6",
        "Nuggets — 6 unidades",
        "batatas",
        "17.90",
        "Seis unidades de frango empanado e crocante.",
    ),
    (
        "nuggets-10",
        "Nuggets — 10 unidades",
        "batatas",
        "24.90",
        "Dez unidades de frango empanado e crocante.",
    ),
    (
        "batata-canoinha",
        "Batata Canoinha",
        "batatas",
        "21.90",
        "Batatas em formato canoa, temperadas e crocantes.",
    ),
    (
        "polenta-crocante",
        "Polenta Crocante",
        "batatas",
        "19.90",
        "Porção de polenta dourada e crocante.",
    ),
    (
        "mix-fritas",
        "Mix de Fritas",
        "batatas",
        "27.90",
        "Porção para compartilhar com batatas e onion rings.",
    ),

    # FRANGO
    (
        "crispy-chicken-spicy",
        "Crispy Chicken Spicy",
        "frango",
        "28.00",
        "Frango empanado e crocante com molho picante.",
    ),
    (
        "crispy-chicken-classico",
        "Crispy Chicken Clássico",
        "frango",
        "27.90",
        "Frango crocante, alface e maionese especial no brioche.",
    ),
    (
        "chicken-cheddar",
        "Chicken Cheddar",
        "frango",
        "30.90",
        "Frango empanado com cheddar cremoso.",
    ),
    (
        "chicken-bacon",
        "Chicken Bacon",
        "frango",
        "32.90",
        "Frango crocante, bacon e queijo derretido.",
    ),
    (
        "chicken-bbq",
        "Chicken BBQ",
        "frango",
        "29.90",
        "Frango empanado com molho barbecue.",
    ),
    (
        "tiras-frango-6",
        "Tiras de Frango — 6 unidades",
        "frango",
        "25.90",
        "Tiras de frango empanadas, servidas crocantes.",
    ),
    (
        "tiras-frango-10",
        "Tiras de Frango — 10 unidades",
        "frango",
        "34.90",
        "Dez tiras de frango empanadas para compartilhar.",
    ),
    (
        "chicken-spicy-duplo",
        "Chicken Spicy Duplo",
        "frango",
        "34.90",
        "Frango crocante em dose dupla com molho picante.",
    ),

    # BEBIDAS
    (
        "pink-lemonade-500ml",
        "Pink Lemonade 500 ml",
        "bebidas",
        "12.00",
        "Limonada com frutas vermelhas, servida gelada.",
    ),
    (
        "cola-lata",
        "Refrigerante Cola 350ml",
        "bebidas",
        "6.00",
        "Refrigerante de cola em lata de 350ml.",
    ),
    (
        "cola-zero-lata",
        "Cola Zero 350ml",
        "bebidas",
        "6.00",
        "Refrigerante de cola sem açúcar em lata de 350ml.",
    ),
    (
        "guarana-lata",
        "Guaraná 350ml",
        "bebidas",
        "6.00",
        "Refrigerante de guaraná em lata de 350ml.",
    ),
    (
        "laranja-lata",
        "Refrigerante de Laranja 350ml",
        "bebidas",
        "6.00",
        "Refrigerante sabor laranja em lata de 350ml.",
    ),
    (
        "agua-sem-gas",
        "Água Mineral 500ml",
        "bebidas",
        "4.00",
        "Água mineral sem gás, garrafa de 500ml.",
    ),
    (
        "agua-com-gas",
        "Água com Gás 500ml",
        "bebidas",
        "4.50",
        "Água mineral com gás, garrafa de 500ml.",
    ),
    (
        "cha-pessego",
        "Chá Gelado de Pêssego",
        "bebidas",
        "8.90",
        "Chá gelado sabor pêssego.",
    ),
    (
        "limonada-natural",
        "Limonada Natural",
        "bebidas",
        "9.90",
        "Limonada preparada com limão e gelo.",
    ),
    (
        "milkshake-chocolate",
        "Milkshake de Chocolate",
        "bebidas",
        "18.90",
        "Milkshake cremoso sabor chocolate.",
    ),

    # SOBREMESAS
    (
        "cheesecake-new-york",
        "Cheesecake New York",
        "sobremesas",
        "18.50",
        "Cheesecake cremoso com base amanteigada.",
    ),
    (
        "brownie-chocolate",
        "Brownie de Chocolate",
        "sobremesas",
        "12.90",
        "Brownie de chocolate com interior macio.",
    ),
    (
        "cookie-chocolate",
        "Cookie de Chocolate",
        "sobremesas",
        "9.90",
        "Cookie assado com gotas de chocolate.",
    ),
    (
        "cookie-duplo-chocolate",
        "Cookie Duplo Chocolate",
        "sobremesas",
        "11.90",
        "Cookie com massa e gotas de chocolate.",
    ),
    (
        "pudim-leite",
        "Pudim de Leite",
        "sobremesas",
        "10.90",
        "Pudim de leite condensado com calda de caramelo.",
    ),
    (
        "churros-doce-leite",
        "Churros com Doce de Leite",
        "sobremesas",
        "14.90",
        "Churros polvilhados com açúcar e canela.",
    ),
    (
        "sundae-chocolate",
        "Sundae de Chocolate",
        "sobremesas",
        "12.90",
        "Sobremesa gelada com calda de chocolate.",
    ),
    (
        "mousse-maracuja",
        "Mousse de Maracujá",
        "sobremesas",
        "10.90",
        "Mousse cremosa de maracujá.",
    ),
]


# ============================================================
# IMAGENS INDIVIDUAIS POR PRODUTO
# ============================================================

def imagem_produto(slug, categoria):
    termos = {
        "burgers": "burger",
        "batatas": "frenchfries",
        "frango": "friedchicken",
        "bebidas": "lemonade",
        "sobremesas": "dessert",
    }

    termo = termos.get(categoria, "food")
    numero = sum(ord(caractere) for caractere in slug)

    return (
        f"https://loremflickr.com/600/450/{termo}"
        f"?lock={numero}"
    )


# ============================================================
# OPÇÕES DE PERSONALIZAÇÃO
# ============================================================

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


# ============================================================
# RECONSTRUÇÃO DO CARDÁPIO
# ============================================================

@transaction.atomic
def reconstruir_cardapio():
    print("\n" + "=" * 55)
    print("RECONSTRUINDO O CARDÁPIO DO BURGA RUA")
    print("=" * 55)

    # 1. Criar ou atualizar as categorias.
    categorias = {}

    for nome, slug, ordem in CATEGORIAS:
        categoria, criada = Categoria.objects.update_or_create(
            slug=slug,
            defaults={
                "nome": nome,
                "ordem_exibicao": ordem,
                "ativo": True,
            },
        )

        categorias[slug] = categoria

        if criada:
            print(f"CATEGORIA CRIADA: {nome}")

    # 2. Criar ou atualizar todos os produtos.
    criados = 0
    atualizados = 0

    for slug, nome, categoria_slug, preco, descricao in PRODUTOS:
        produto, criado = Produto.objects.update_or_create(
            slug=slug,
            defaults={
                "nome": nome,
                "categoria": categorias[categoria_slug],
                "preco": Decimal(preco),
                "descricao": descricao,
                "imagem_url": imagem_produto(slug, categoria_slug),
                "disponivel": True,
            },
        )

        if criado:
            criados += 1
            print(f"PRODUTO CRIADO: {nome}")
        else:
            atualizados += 1
            print(f"PRODUTO ATUALIZADO: {nome}")

    # 3. Criar ou atualizar os ingredientes.
    ingredientes = {}

    for nome, descricao in INGREDIENTES:
        ingrediente, _ = Ingrediente.objects.update_or_create(
            nome=nome,
            defaults={
                "descricao": descricao,
                "ativo": True,
            },
        )

        ingredientes[nome] = ingrediente

    # 4. Criar ou atualizar os adicionais pagos.
    adicionais = {}

    for nome, descricao, preco in ADICIONAIS:
        adicional, _ = Adicional.objects.update_or_create(
            nome=nome,
            defaults={
                "descricao": descricao,
                "preco": Decimal(preco),
                "ativo": True,
            },
        )

        adicionais[nome] = adicional

    # 5. Criar ou atualizar os molhos.
    molhos = {}

    for nome, descricao in MOLHOS:
        molho, _ = Molho.objects.update_or_create(
            nome=nome,
            defaults={
                "descricao": descricao,
                "preco": Decimal("0.00"),
                "ativo": True,
            },
        )

        molhos[nome] = molho

    # 6. Vincular as opções aos hambúrgueres disponíveis.
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

            if criado:
                vinculos_novos += 1

        for adicional in adicionais.values():
            _, criado = ProdutoAdicional.objects.get_or_create(
                produto=produto,
                adicional=adicional,
            )

            if criado:
                vinculos_novos += 1

        for molho in molhos.values():
            _, criado = ProdutoMolho.objects.get_or_create(
                produto=produto,
                molho=molho,
            )

            if criado:
                vinculos_novos += 1

    # 7. Exibir o resumo final.
    print("\n" + "=" * 55)
    print("RECONSTRUÇÃO CONCLUÍDA")
    print("=" * 55)

    print(f"Categorias no banco: {Categoria.objects.count()}")
    print(f"Produtos no banco: {Produto.objects.count()}")
    print(f"Produtos criados nesta execução: {criados}")
    print(f"Produtos atualizados: {atualizados}")
    print(f"Ingredientes cadastrados: {Ingrediente.objects.count()}")
    print(f"Adicionais cadastrados: {Adicional.objects.count()}")
    print(f"Molhos cadastrados: {Molho.objects.count()}")
    print(f"Hambúrgueres disponíveis: {hamburgueres.count()}")
    print(f"Novos vínculos criados: {vinculos_novos}")

    print("=" * 55 + "\n")


if __name__ == "__main__":
    reconstruir_cardapio()
