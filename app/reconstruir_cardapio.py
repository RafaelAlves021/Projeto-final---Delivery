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
# IMAGENS REAIS (Unsplash) POR PRODUTO
# ============================================================

IMAGENS = {
    # ---------- HAMBÚRGUERES ----------
    "smash-classico-duplo": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80",
    "bacon-melt-trufado": "https://images.unsplash.com/photo-1586816001966-79b736744398?w=600&auto=format&fit=crop&q=80",
    "rua-classico": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    "cheddar-bacon": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80",
    "barbecue-smash": "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=600&auto=format&fit=crop&q=80",
    "duplo-cheddar": "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&auto=format&fit=crop&q=80",
    "smash-picles": "https://images.unsplash.com/photo-1550317138-10000687a72b?w=600&auto=format&fit=crop&q=80",
    "triplo-rua": "https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=600&auto=format&fit=crop&q=80",
    "crispy-burger": "https://images.unsplash.com/photo-1603064752734-4c48eff53d05?w=600&auto=format&fit=crop&q=80",
    "jalapeno-burger": "https://images.unsplash.com/photo-1596662951482-0c4ba74a6df6?w=600&auto=format&fit=crop&q=80",
    "onion-burger": "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&auto=format&fit=crop&q=80",
    "melt-duplo": "https://images.unsplash.com/photo-1554433607-66b5efe9d304?w=600&auto=format&fit=crop&q=80",
    "frango-burger-rua": "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&auto=format&fit=crop&q=80",
    "cheese-salada": "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=600&auto=format&fit=crop&q=80",
    "bacon-cebola": "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&auto=format&fit=crop&q=80",

    # ---------- BATATAS ----------
    "batata-rustica-alecrim": "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=600&auto=format&fit=crop&q=80",
    "batata-cheddar": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80",
    "batata-bacon": "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=600&auto=format&fit=crop&q=80",
    "batata-cheddar-bacon": "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80",
    "onion-rings": "https://images.unsplash.com/photo-1639024471283-03518883512d?w=600&auto=format&fit=crop&q=80",
    "nuggets-6": "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80",
    "nuggets-10": "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=600&auto=format&fit=crop&q=80",
    "batata-canoinha": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80",
    "polenta-crocante": "https://images.unsplash.com/photo-1604909052743-94e838986d24?w=600&auto=format&fit=crop&q=80",
    "mix-fritas": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80",

    # ---------- FRANGO ----------
    "crispy-chicken-spicy": "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80",
    "crispy-chicken-classico": "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=600&auto=format&fit=crop&q=80",
    "chicken-cheddar": "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&auto=format&fit=crop&q=80",
    "chicken-bacon": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    "chicken-bbq": "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=600&auto=format&fit=crop&q=80",
    "tiras-frango-6": "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80",
    "tiras-frango-10": "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=600&auto=format&fit=crop&q=80",
    "chicken-spicy-duplo": "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80",

    # ---------- BEBIDAS ----------
    "pink-lemonade-500ml": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
    "cola-lata": "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&auto=format&fit=crop&q=80",
    "cola-zero-lata": "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=600&auto=format&fit=crop&q=80",
    "guarana-lata": "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=600&auto=format&fit=crop&q=80",
    "laranja-lata": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop&q=80",
    "agua-sem-gas": "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&auto=format&fit=crop&q=80",
    "agua-com-gas": "https://images.unsplash.com/photo-1560023907-5f339617ea30?w=600&auto=format&fit=crop&q=80",
    "cha-pessego": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80",
    "limonada-natural": "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600&auto=format&fit=crop&q=80",
    "milkshake-chocolate": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80",

    # ---------- SOBREMESAS ----------
    "cheesecake-new-york": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80",
    "brownie-chocolate": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80",
    "cookie-chocolate": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop&q=80",
    "cookie-duplo-chocolate": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80",
    "pudim-leite": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&auto=format&fit=crop&q=80",
    "churros-doce-leite": "https://images.unsplash.com/photo-1624371414361-e670edf4898d?w=600&auto=format&fit=crop&q=80",
    "sundae-chocolate": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop&q=80",
    "mousse-maracuja": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80",
}


# ============================================================
# PRODUTOS
# ============================================================

PRODUTOS = [
    # HAMBÚRGUERES
    ("smash-classico-duplo", "Smash Clássico Duplo", "burgers", "29.90", "Dois discos de carne smash, queijo derretido e pão brioche."),
    ("bacon-melt-trufado", "Bacon Melt Trufado", "burgers", "36.50", "Hambúrguer artesanal, bacon crocante, queijo e molho trufado."),
    ("rua-classico", "Rua Clássico", "burgers", "27.90", "Hambúrguer artesanal, queijo derretido, alface, tomate e molho da casa."),
    ("cheddar-bacon", "Cheddar Bacon", "burgers", "34.90", "Blend bovino, cheddar cremoso, bacon crocante e pão brioche."),
    ("barbecue-smash", "Barbecue Smash", "burgers", "31.90", "Smash bovino, queijo, cebola caramelizada e molho barbecue."),
    ("duplo-cheddar", "Duplo Cheddar", "burgers", "35.90", "Dois discos de carne, cheddar, picles e molho especial."),
    ("smash-picles", "Smash Picles", "burgers", "28.90", "Smash bovino, queijo, picles crocantes e molho da casa."),
    ("triplo-rua", "Triplo Rua", "burgers", "42.90", "Três discos de carne, queijo derretido e molho especial."),
    ("crispy-burger", "Crispy Burger", "burgers", "32.90", "Hambúrguer com cebola crocante, queijo e molho defumado."),
    ("jalapeno-burger", "Jalapeño Burger", "burgers", "34.50", "Blend bovino, queijo, jalapeño e molho levemente picante."),
    ("onion-burger", "Onion Burger", "burgers", "30.90", "Hambúrguer artesanal com cebola grelhada e queijo."),
    ("melt-duplo", "Melt Duplo", "burgers", "37.90", "Dois discos de carne, queijo cremoso e brioche tostado."),
    ("frango-burger-rua", "Chicken Burger Rua", "burgers", "29.90", "Frango crocante, alface fresca e maionese temperada."),
    ("cheese-salada", "Cheese Salada", "burgers", "28.50", "Hambúrguer, queijo, alface, tomate e molho especial."),
    ("bacon-cebola", "Bacon e Cebola", "burgers", "33.90", "Blend bovino, bacon, cebola caramelizada e queijo."),

    # BATATAS
    ("batata-rustica-alecrim", "Batata Rústica com Alecrim", "batatas", "19.00", "Batatas especiais cortadas com casca e temperadas com alecrim."),
    ("batata-cheddar", "Batata com Cheddar", "batatas", "24.90", "Batatas crocantes cobertas com cheddar cremoso."),
    ("batata-bacon", "Batata com Bacon", "batatas", "26.90", "Porção de batatas com bacon crocante."),
    ("batata-cheddar-bacon", "Batata Cheddar e Bacon", "batatas", "29.90", "Batatas crocantes, cheddar e bacon."),
    ("onion-rings", "Onion Rings", "batatas", "22.90", "Anéis de cebola empanados e crocantes."),
    ("nuggets-6", "Nuggets — 6 unidades", "batatas", "17.90", "Seis unidades de frango empanado e crocante."),
    ("nuggets-10", "Nuggets — 10 unidades", "batatas", "24.90", "Dez unidades de frango empanado e crocante."),
    ("batata-canoinha", "Batata Canoinha", "batatas", "21.90", "Batatas em formato canoa, temperadas e crocantes."),
    ("polenta-crocante", "Polenta Crocante", "batatas", "19.90", "Porção de polenta dourada e crocante."),
    ("mix-fritas", "Mix de Fritas", "batatas", "27.90", "Porção para compartilhar com batatas e onion rings."),

    # FRANGO
    ("crispy-chicken-spicy", "Crispy Chicken Spicy", "frango", "28.00", "Frango empanado e crocante com molho picante."),
    ("crispy-chicken-classico", "Crispy Chicken Clássico", "frango", "27.90", "Frango crocante, alface e maionese especial no brioche."),
    ("chicken-cheddar", "Chicken Cheddar", "frango", "30.90", "Frango empanado com cheddar cremoso."),
    ("chicken-bacon", "Chicken Bacon", "frango", "32.90", "Frango crocante, bacon e queijo derretido."),
    ("chicken-bbq", "Chicken BBQ", "frango", "29.90", "Frango empanado com molho barbecue."),
    ("tiras-frango-6", "Tiras de Frango — 6 unidades", "frango", "25.90", "Tiras de frango empanadas, servidas crocantes."),
    ("tiras-frango-10", "Tiras de Frango — 10 unidades", "frango", "34.90", "Dez tiras de frango empanadas para compartilhar."),
    ("chicken-spicy-duplo", "Chicken Spicy Duplo", "frango", "34.90", "Frango crocante em dose dupla com molho picante."),

    # BEBIDAS
    ("pink-lemonade-500ml", "Pink Lemonade 500 ml", "bebidas", "12.00", "Limonada com frutas vermelhas, servida gelada."),
    ("cola-lata", "Refrigerante Cola 350ml", "bebidas", "6.00", "Refrigerante de cola em lata de 350ml."),
    ("cola-zero-lata", "Cola Zero 350ml", "bebidas", "6.00", "Refrigerante de cola sem açúcar em lata de 350ml."),
    ("guarana-lata", "Guaraná 350ml", "bebidas", "6.00", "Refrigerante de guaraná em lata de 350ml."),
    ("laranja-lata", "Refrigerante de Laranja 350ml", "bebidas", "6.00", "Refrigerante sabor laranja em lata de 350ml."),
    ("agua-sem-gas", "Água Mineral 500ml", "bebidas", "4.00", "Água mineral sem gás, garrafa de 500ml."),
    ("agua-com-gas", "Água com Gás 500ml", "bebidas", "4.50", "Água mineral com gás, garrafa de 500ml."),
    ("cha-pessego", "Chá Gelado de Pêssego", "bebidas", "8.90", "Chá gelado sabor pêssego."),
    ("limonada-natural", "Limonada Natural", "bebidas", "9.90", "Limonada preparada com limão e gelo."),
    ("milkshake-chocolate", "Milkshake de Chocolate", "bebidas", "18.90", "Milkshake cremoso sabor chocolate."),

    # SOBREMESAS
    ("cheesecake-new-york", "Cheesecake New York", "sobremesas", "18.50", "Cheesecake cremoso com base amanteigada."),
    ("brownie-chocolate", "Brownie de Chocolate", "sobremesas", "12.90", "Brownie de chocolate com interior macio."),
    ("cookie-chocolate", "Cookie de Chocolate", "sobremesas", "9.90", "Cookie assado com gotas de chocolate."),
    ("cookie-duplo-chocolate", "Cookie Duplo Chocolate", "sobremesas", "11.90", "Cookie com massa e gotas de chocolate."),
    ("pudim-leite", "Pudim de Leite", "sobremesas", "10.90", "Pudim de leite condensado com calda de caramelo."),
    ("churros-doce-leite", "Churros com Doce de Leite", "sobremesas", "14.90", "Churros polvilhados com açúcar e canela."),
    ("sundae-chocolate", "Sundae de Chocolate", "sobremesas", "12.90", "Sobremesa gelada com calda de chocolate."),
    ("mousse-maracuja", "Mousse de Maracujá", "sobremesas", "10.90", "Mousse cremosa de maracujá."),
]


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

    # 1. Categorias
    categorias = {}

    for nome, slug, ordem in CATEGORIAS:
        categoria, criada = Categoria.objects.update_or_create(
            slug=slug,
            defaults={"nome": nome, "ordem_exibicao": ordem, "ativo": True},
        )
        categorias[slug] = categoria
        if criada:
            print(f"CATEGORIA CRIADA: {nome}")

    # 2. Produtos
    criados = 0
    atualizados = 0

    for slug, nome, categoria_slug, preco, descricao in PRODUTOS:
        imagem_url = IMAGENS.get(slug, "")

        if not imagem_url:
            print(f"AVISO: sem imagem para {slug}, usando placeholder.")
            imagem_url = f"https://picsum.photos/seed/{slug}/600/450"

        produto, criado = Produto.objects.update_or_create(
            slug=slug,
            defaults={
                "nome": nome,
                "categoria": categorias[categoria_slug],
                "preco": Decimal(preco),
                "descricao": descricao,
                "imagem_url": imagem_url,
                "disponivel": True,
            },
        )

        if criado:
            criados += 1
        else:
            atualizados += 1

    print(f"PRODUTOS CRIADOS: {criados}")
    print(f"PRODUTOS ATUALIZADOS: {atualizados}")

    # 3. Ingredientes
    ingredientes = {}
    for nome, descricao in INGREDIENTES:
        ingrediente, _ = Ingrediente.objects.update_or_create(
            nome=nome,
            defaults={"descricao": descricao, "ativo": True},
        )
        ingredientes[nome] = ingrediente

    # 4. Adicionais
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

    # 5. Molhos
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

    # 6. Vincular opções aos hambúrgueres
    hamburgueres = Produto.objects.filter(
        categoria__slug="burgers",
        disponivel=True,
    )

    vinculos = 0
    for produto in hamburgueres:
        for ingrediente in ingredientes.values():
            _, criado = ProdutoIngrediente.objects.get_or_create(
                produto=produto, ingrediente=ingrediente,
                defaults={"removivel": True},
            )
            vinculos += int(criado)

        for adicional in adicionais.values():
            _, criado = ProdutoAdicional.objects.get_or_create(
                produto=produto, adicional=adicional,
            )
            vinculos += int(criado)

        for molho in molhos.values():
            _, criado = ProdutoMolho.objects.get_or_create(
                produto=produto, molho=molho,
            )
            vinculos += int(criado)

    # 7. Resumo
    print("\n" + "=" * 55)
    print("RECONSTRUÇÃO CONCLUÍDA")
    print("=" * 55)
    print(f"Categorias: {Categoria.objects.count()}")
    print(f"Produtos: {Produto.objects.count()}")
    print(f"Produtos com imagem: {Produto.objects.exclude(imagem_url='').count()}")
    print(f"Ingredientes: {Ingrediente.objects.count()}")
    print(f"Adicionais: {Adicional.objects.count()}")
    print(f"Molhos: {Molho.objects.count()}")
    print(f"Novos vínculos: {vinculos}")
    print("=" * 55 + "\n")


if __name__ == "__main__":
    reconstruir_cardapio()