
import os
import django
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from app.models import Categoria, Produto


PRODUTOS = [
    {
        "categoria": "burgers",
        "nome": "Smash Clássico Duplo",
        "slug": "smash-classico-duplo",
        "descricao": (
            "Dois ultra smash de carne 100% Angus, "
            "american cheese derretido, cebola chapeada "
            "e molho artesanal no pão brioche."
        ),
        "preco": Decimal("29.90"),
        "imagem_url": (
            "https://images.unsplash.com/photo-1586190848861-99aa4a171e90"
            "?w=600&auto=format&fit=crop&q=80"
        ),
    },
    {
        "categoria": "burgers",
        "nome": "Bacon Melt Trufado",
        "slug": "bacon-melt-trufado",
        "descricao": (
            "Blend Angus 160g, bacon crocante, creme de "
            "queijo trufado e brioche selado na manteiga."
        ),
        "preco": Decimal("36.50"),
        "imagem_url": (
            "https://images.unsplash.com/photo-1553979459-d2229ba7433b"
            "?w=600&auto=format&fit=crop&q=80"
        ),
    },
    {
        "categoria": "batatas",
        "nome": "Batata Rústica com Alecrim",
        "slug": "batata-rustica-alecrim",
        "descricao": (
            "Batatas especiais cortadas com casca, "
            "flor de sal, alecrim fresco e maionese verde."
        ),
        "preco": Decimal("19.00"),
        "imagem_url": (
            "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=600&auto=format&fit=crop&q=80"
            "?w=600&auto=format&fit=crop&q=80"
        ),
    },
    {
        "categoria": "frango",
        "nome": "Crispy Chicken Spicy",
        "slug": "crispy-chicken-spicy",
        "descricao": (
            "Frango crocante, salada coleslaw cremosa "
            "e molho picante suave."
        ),
        "preco": Decimal("28.00"),
        "imagem_url": (
            "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b"
            "?w=600&auto=format&fit=crop&q=80"
        ),
    },
    {
        "categoria": "bebidas",
        "nome": "Pink Lemonade 500ml",
        "slug": "pink-lemonade-500ml",
        "descricao": (
            "Limonada natural com frutas vermelhas "
            "e folhas frescas de hortelã."
        ),
        "preco": Decimal("12.00"),
        "imagem_url": (
            "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd"
            "?w=600&auto=format&fit=crop&q=80"
        ),
    },
    {
        "categoria": "sobremesas",
        "nome": "Cheesecake New York",
        "slug": "cheesecake-new-york",
        "descricao": (
            "Massa crocante amanteigada, creme de queijo "
            "e redução artesanal de frutas vermelhas."
        ),
        "preco": Decimal("18.50"),
        "imagem_url": (
            "https://images.unsplash.com/photo-1533134242443-d4fd215305ad"
            "?w=600&auto=format&fit=crop&q=80"
        ),
    },
]


def carregar_cardapio():
    print("Atualizando imagens do cardápio...")

    for dados in PRODUTOS:
        slug_categoria = dados["categoria"]

        try:
            categoria = Categoria.objects.get(slug=slug_categoria)
        except Categoria.DoesNotExist:
            print(
                f"ERRO: categoria '{slug_categoria}' "
                "não encontrada. Produto ignorado."
            )
            continue

        produto, criado = Produto.objects.update_or_create(
            slug=dados["slug"],
            defaults={
                "categoria": categoria,
                "nome": dados["nome"],
                "descricao": dados["descricao"],
                "preco": dados["preco"],
                "imagem_url": dados["imagem_url"],
                "disponivel": True,
            },
        )

        resultado = "Criado" if criado else "Atualizado"
        print(f"{resultado}: {produto.nome}")
        print(f"Imagem: {produto.imagem_url}")

    total = Produto.objects.count()
    com_url = Produto.objects.exclude(imagem_url="").count()

    print("\n--- RESULTADO ---")
    print(f"Produtos no banco: {total}")
    print(f"Produtos com URL: {com_url}")


if __name__ == "__main__":
    carregar_cardapio()
