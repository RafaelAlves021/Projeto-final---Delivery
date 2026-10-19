
from decimal import Decimal

from django.db import transaction

from app.models import (
    Produto,
    Ingrediente,
    Adicional,
    Molho,
    ProdutoIngrediente,
    ProdutoAdicional,
    ProdutoMolho,
)


# Opções de ingredientes que podem ser retirados.
INGREDIENTES = [
    {
        "nome": "Queijo",
        "descricao": "Queijo do hambúrguer.",
    },
    {
        "nome": "Bacon",
        "descricao": "Bacon crocante.",
    },
    {
        "nome": "Cebola",
        "descricao": "Cebola do hambúrguer.",
    },
]

# Adicionais pagos: preços iniciais de exemplo.
ADICIONAIS = [
    {
        "nome": "Queijo extra",
        "descricao": "Uma porção extra de queijo.",
        "preco": Decimal("3.00"),
    },
    {
        "nome": "Bacon extra",
        "descricao": "Uma porção extra de bacon.",
        "preco": Decimal("4.00"),
    },
    {
        "nome": "Cebola extra",
        "descricao": "Uma porção extra de cebola.",
        "preco": Decimal("1.50"),
    },
]

# Molhos gratuitos inicialmente.
MOLHOS = [
    {
        "nome": "Maionese da casa",
        "descricao": "Maionese especial da casa.",
        "preco": Decimal("0.00"),
    },
    {
        "nome": "Molho barbecue",
        "descricao": "Molho barbecue.",
        "preco": Decimal("0.00"),
    },
    {
        "nome": "Molho especial",
        "descricao": "Molho especial da hamburgueria.",
        "preco": Decimal("0.00"),
    },
]

# Identifica produtos que parecem ser hambúrgueres.
PALAVRAS_HAMBURGUER = (
    "burger",
    "hamburg",
    "smash",
    "melt",
    "duplo",
    "cheddar",
)

# Slugs conhecidos de hambúrgueres deste projeto.
SLUGS_HAMBURGUER = {
    "bacon-melt-trufado",
    "smash-classico-duplo",
}


def parece_hamburguer(produto):
    nome = produto.nome.lower()
    slug = produto.slug.lower()

    return (
        slug in SLUGS_HAMBURGUER
        or any(palavra in nome for palavra in PALAVRAS_HAMBURGUER)
        or any(palavra in slug for palavra in PALAVRAS_HAMBURGUER)
    )


@transaction.atomic
def executar():
    produtos = list(Produto.objects.all().order_by("id"))
    hamburgueres = [
        produto for produto in produtos
        if parece_hamburguer(produto)
    ]

    if not produtos:
        print("Nenhum produto encontrado. Nada foi alterado.")
        return

    if not hamburgueres:
        print(
            "Nenhum hambúrguer foi identificado pelos nomes e slugs. "
            "Nenhum vínculo foi criado."
        )
        print("Produtos existentes:")
        for produto in produtos:
            print(f"- {produto.nome} | slug: {produto.slug}")
        return

    ingredientes_criados = {}
    adicionais_criados = {}
    molhos_criados = {}

    # Cadastra ingredientes sem duplicar nomes existentes.
    for dados in INGREDIENTES:
        ingrediente, _ = Ingrediente.objects.get_or_create(
            nome=dados["nome"],
            defaults={
                "descricao": dados["descricao"],
                "ativo": True,
            },
        )

        if not ingrediente.ativo:
            ingrediente.ativo = True
            ingrediente.save(update_fields=["ativo"])

        ingredientes_criados[dados["nome"]] = ingrediente

    # Cadastra adicionais sem duplicar nomes existentes.
    for dados in ADICIONAIS:
        adicional, _ = Adicional.objects.get_or_create(
            nome=dados["nome"],
            defaults={
                "descricao": dados["descricao"],
                "preco": dados["preco"],
                "ativo": True,
            },
        )

        if not adicional.ativo:
            adicional.ativo = True
            adicional.save(update_fields=["ativo"])

        adicionais_criados[dados["nome"]] = adicional

    # Cadastra molhos sem duplicar nomes existentes.
    for dados in MOLHOS:
        molho, _ = Molho.objects.get_or_create(
            nome=dados["nome"],
            defaults={
                "descricao": dados["descricao"],
                "preco": dados["preco"],
                "ativo": True,
            },
        )

        if not molho.ativo:
            molho.ativo = True
            molho.save(update_fields=["ativo"])

        molhos_criados[dados["nome"]] = molho

    # Associa as opções a cada hambúrguer identificado.
    vinculos_criados = 0

    for produto in hamburgueres:
        for ingrediente in ingredientes_criados.values():
            _, criado = ProdutoIngrediente.objects.get_or_create(
                produto=produto,
                ingrediente=ingrediente,
                defaults={"removivel": True},
            )
            vinculos_criados += int(criado)

        for adicional in adicionais_criados.values():
            _, criado = ProdutoAdicional.objects.get_or_create(
                produto=produto,
                adicional=adicional,
            )
            vinculos_criados += int(criado)

        for molho in molhos_criados.values():
            _, criado = ProdutoMolho.objects.get_or_create(
                produto=produto,
                molho=molho,
            )
            vinculos_criados += int(criado)

        print(f"Hambúrguer configurado: {produto.nome}")

    print("\nPERSONALIZAÇÃO CADASTRADA!")
    print(f"Produtos preservados: {len(produtos)}")
    print(f"Hambúrgueres identificados: {len(hamburgueres)}")
    print(f"Ingredientes cadastrados: {Ingrediente.objects.count()}")
    print(f"Adicionais cadastrados: {Adicional.objects.count()}")
    print(f"Molhos cadastrados: {Molho.objects.count()}")
    print(f"Novos vínculos criados: {vinculos_criados}")
    print(
        "\nExecute novamente quando quiser: "
        "os mesmos registros e vínculos não serão duplicados."
    )


executar()
