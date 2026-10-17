
/* =========================================================
   BURGA RUA — CARRINHO DE COMPRAS
   ========================================================= */

   (() => {
    "use strict";

    const CHAVE_CARRINHO = "burga_carrinho_premium";
    const META_FRETE_GRATIS = 50;

    let carrinho = carregarCarrinho();

    // -----------------------------------------------------
    // PREÇOS
    // -----------------------------------------------------

    function converterPreco(valor) {
        if (typeof valor === "number") {
            return Number.isFinite(valor) && valor >= 0 ? valor : 0;
        }

        if (typeof valor !== "string" || !valor.trim()) {
            return 0;
        }

        let texto = valor.trim().replace(/[R$\s]/g, "");

        if (texto.includes(",")) {
            texto = texto.replace(/\./g, "").replace(",", ".");
        }

        const numero = Number(texto);

        return Number.isFinite(numero) && numero >= 0 ? numero : 0;
    }

    function formatarPreco(valor) {
        return converterPreco(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    // -----------------------------------------------------
    // PERSISTÊNCIA DO CARRINHO
    // -----------------------------------------------------

    function carregarCarrinho() {
        try {
            const salvo = localStorage.getItem(CHAVE_CARRINHO);

            if (!salvo) return [];

            const dados = JSON.parse(salvo);

            if (!Array.isArray(dados)) return [];

            return dados
                .filter(item =>
                    item &&
                    Number.isSafeInteger(Number(item.id)) &&
                    Number(item.id) > 0 &&
                    String(item.nome || "").trim() !== ""
                )
                .map(item => ({
                    id: Number(item.id),
                    nome: String(item.nome),
                    preco: converterPreco(item.preco),
                    qtd: Math.max(1, Math.floor(Number(item.qtd) || 1)),
                    imagem: String(item.imagem || ""),
                    personalizacao:
                        item.personalizacao &&
                        typeof item.personalizacao === "object"
                            ? item.personalizacao
                            : {}
                }))
                .filter(item => item.preco > 0);
        } catch (erro) {
            console.error("Erro ao carregar o carrinho:", erro);
            return [];
        }
    }

    function salvarCarrinho() {
        try {
            localStorage.setItem(
                CHAVE_CARRINHO,
                JSON.stringify(carrinho)
            );
        } catch (erro) {
            console.error("Erro ao salvar o carrinho:", erro);
            mostrarToast("Não foi possível salvar o carrinho.");
        }
    }

    function obterTotal() {
        return carrinho.reduce(
            (total, item) => total + item.preco * item.qtd,
            0
        );
    }

    function obterQuantidade() {
        return carrinho.reduce(
            (total, item) => total + item.qtd,
            0
        );
    }

    // -----------------------------------------------------
    // AVISOS
    // -----------------------------------------------------

    function mostrarToast(mensagem) {
        const toast = document.getElementById("toastNotificacao");
        const texto = document.getElementById("toastTexto");

        if (toast && texto) {
            texto.textContent = mensagem;
            toast.classList.add("visivel");

            clearTimeout(mostrarToast.timeout);

            mostrarToast.timeout = setTimeout(() => {
                toast.classList.remove("visivel");
            }, 2400);

            return;
        }

        let aviso = document.getElementById("toastDetalheProduto");

        if (!aviso) {
            aviso = document.createElement("div");
            aviso.id = "toastDetalheProduto";
            aviso.setAttribute("role", "status");
            aviso.setAttribute("aria-live", "polite");

            // O aviso usa uma classe; a aparência fica no CSS.
            aviso.className = "toast-detalhe-produto";
            document.body.appendChild(aviso);
        }

        aviso.textContent = mensagem;
        aviso.classList.add("visivel");

        clearTimeout(mostrarToast.timeout);

        mostrarToast.timeout = setTimeout(() => {
            aviso.classList.remove("visivel");
        }, 2600);
    }

    // -----------------------------------------------------
    // ABRIR E FECHAR A GAVETA
    // -----------------------------------------------------

    function abrirCarrinho() {
        const drawer = document.getElementById("carrinhoDrawer");
        const overlay = document.getElementById("carrinhoOverlay");

        if (drawer) {
            drawer.classList.add("aberto");
            drawer.setAttribute("aria-hidden", "false");
        }

        if (overlay) {
            overlay.classList.add("aberto");
        }
    }

    function fecharCarrinho() {
        const drawer = document.getElementById("carrinhoDrawer");
        const overlay = document.getElementById("carrinhoOverlay");

        if (drawer) {
            drawer.classList.remove("aberto");
            drawer.setAttribute("aria-hidden", "true");
        }

        if (overlay) {
            overlay.classList.remove("aberto");
        }
    }

    // -----------------------------------------------------
    // ATUALIZAR BOTÕES DOS PRODUTOS
    // -----------------------------------------------------

    function sincronizarBotoesCards() {
        document.querySelectorAll(".card-produto").forEach(card => {
            const botao = card.querySelector(".btn-adicionar-produto");

            if (!botao) return;

            const id = Number(botao.dataset.id);

            const item = carrinho.find(produto =>
                produto.id === id &&
                Object.keys(produto.personalizacao || {}).length === 0
            );

            if (item) {
                botao.dataset.quantidade = String(item.qtd);

                botao.setAttribute(
                    "aria-label",
                    `${item.nome}, ${item.qtd} no carrinho`
                );
            } else {
                delete botao.dataset.quantidade;

                botao.setAttribute(
                    "aria-label",
                    `Adicionar ${botao.dataset.nome || "produto"} ao carrinho`
                );
            }
        });
    }

    // -----------------------------------------------------
    // ÍCONE DE LIXEIRA
    // -----------------------------------------------------

    function criarIconeLixeira() {
        const svg = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );

        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("width", "16");
        svg.setAttribute("height", "16");
        svg.setAttribute("fill", "none");
        svg.setAttribute("stroke", "currentColor");
        svg.setAttribute("stroke-width", "2");
        svg.setAttribute("stroke-linecap", "round");
        svg.setAttribute("stroke-linejoin", "round");
        svg.setAttribute("aria-hidden", "true");

        const tampa = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
        );
        tampa.setAttribute("d", "M3 6h18");

        const corpo = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
        );
        corpo.setAttribute("d", "M8 6V4h8v2M5 6l1 14h12l1-14");

        const linhas = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
        );
        linhas.setAttribute("d", "M10 11v5m4-5v5");

        svg.append(tampa, corpo, linhas);

        return svg;
    }

    // -----------------------------------------------------
    // RENDERIZAR O CARRINHO
    // -----------------------------------------------------

    function renderizarCarrinho() {
        salvarCarrinho();

        const total = obterTotal();
        const quantidade = obterQuantidade();

        const badge = document.getElementById("carrinhoBadge");
        const totalTexto = document.getElementById("carrinhoTotalValor");
        const mobileTotal = document.getElementById("mobileCartTotal");
        const mobileQtd = document.getElementById("mobileCartQtd");
        const lista = document.getElementById("drawerItensLista");
        const freteTexto = document.getElementById("freteTexto");
        const barraFrete = document.getElementById("freteProgressoBarra");

        if (badge) badge.textContent = quantidade;
        if (mobileQtd) mobileQtd.textContent = quantidade;

        if (totalTexto) totalTexto.textContent = formatarPreco(total);
        if (mobileTotal) mobileTotal.textContent = formatarPreco(total);

        // Frete grátis a partir de R$ 50.
        if (freteTexto && barraFrete) {
            if (total >= META_FRETE_GRATIS) {
                freteTexto.textContent =
                    "Parabéns! Você ganhou frete grátis!";

                barraFrete.style.width = "100%";
                barraFrete.style.background = "#2E7D32";
            } else {
                const restante = META_FRETE_GRATIS - total;

                const percentual = Math.min(
                    100,
                    (total / META_FRETE_GRATIS) * 100
                );

                freteTexto.textContent =
                    `Faltam ${formatarPreco(restante)} para ganhar frete grátis`;

                barraFrete.style.width = `${percentual}%`;
                barraFrete.style.background = "var(--cor-destaque)";
            }
        }

        // Se a página não tiver gaveta, atualiza os elementos disponíveis.
        if (!lista) {
            sincronizarBotoesCards();
            return;
        }

        lista.replaceChildren();

        if (carrinho.length === 0) {
            const vazio = document.createElement("div");

            vazio.className = "carrinho-vazio";
            vazio.textContent =
                "Sua sacola está vazia. Adicione um produto para começar.";

            lista.appendChild(vazio);
            sincronizarBotoesCards();
            return;
        }

        carrinho.forEach(item => {
            const linha = document.createElement("div");
            linha.className = "item-carrinho";

            // Imagem, quando disponível.
            if (item.imagem) {
                const imagem = document.createElement("img");

                imagem.className = "item-carrinho__imagem";
                imagem.src = item.imagem;
                imagem.alt = item.nome;
                imagem.loading = "lazy";

                imagem.addEventListener("error", () => {
                    imagem.remove();
                }, { once: true });

                linha.appendChild(imagem);
            }

            const informacoes = document.createElement("div");
            informacoes.className = "item-carrinho__info";

            const nome = document.createElement("h5");
            nome.textContent = item.nome;

            const preco = document.createElement("span");
            preco.textContent = formatarPreco(item.preco * item.qtd);

            informacoes.append(nome, preco);

            // Exibe personalização caso ela já esteja salva no item.
            const personalizacao = item.personalizacao || {};
            const escolhas = [];

            ["ingredientes", "adicionais", "molhos"].forEach(grupo => {
                if (Array.isArray(personalizacao[grupo])) {
                    personalizacao[grupo].forEach(escolha => {
                        if (typeof escolha === "string") {
                            escolhas.push(escolha);
                        } else if (escolha && escolha.nome) {
                            escolhas.push(escolha.nome);
                        }
                    });
                }
            });

            if (personalizacao.observacoes) {
                escolhas.push(
                    `Observação: ${String(personalizacao.observacoes)}`
                );
            }

            if (escolhas.length) {
                const detalhes = document.createElement("small");

                detalhes.className = "item-carrinho__personalizacao";
                detalhes.textContent = escolhas.join(" • ");

                informacoes.appendChild(detalhes);
            }

            const controles = document.createElement("div");
            controles.className = "item-carrinho__controles";

            const menos = document.createElement("button");
            menos.type = "button";
            menos.className = "btn-qty-mini btn-carrinho-menos";
            menos.textContent = "−";
            menos.setAttribute("aria-label", `Diminuir ${item.nome}`);

            menos.addEventListener("click", () => {
                ajustarQuantidade(item.chave || item.id, -1);
            });

            const quantidadeItem = document.createElement("span");
            quantidadeItem.className = "qty-display-mini";
            quantidadeItem.textContent = item.qtd;

            const mais = document.createElement("button");
            mais.type = "button";
            mais.className = "btn-qty-mini btn-carrinho-mais";
            mais.textContent = "+";
            mais.setAttribute("aria-label", `Adicionar ${item.nome}`);

            mais.addEventListener("click", () => {
                ajustarQuantidade(item.chave || item.id, 1);
            });

            controles.append(menos, quantidadeItem, mais);
            informacoes.appendChild(controles);

            const remover = document.createElement("button");
            remover.type = "button";
            remover.className = "btn-carrinho-remover";

            remover.setAttribute(
                "aria-label",
                `Remover ${item.nome} do carrinho`
            );

            remover.title = "Remover produto";

            const textoRemover = document.createElement("span");
            textoRemover.textContent = "Remover";

            remover.append(criarIconeLixeira(), textoRemover);

            remover.addEventListener("click", () => {
                removerItem(item.chave || item.id);
            });

            linha.append(informacoes, remover);
            lista.appendChild(linha);
        });

        sincronizarBotoesCards();
    }

    // -----------------------------------------------------
    // QUANTIDADE E REMOÇÃO
    // -----------------------------------------------------

    function localizarItem(identificador) {
        return carrinho.find(item =>
            String(item.chave || item.id) === String(identificador)
        );
    }

    function ajustarQuantidade(identificador, variacao) {
        const item = localizarItem(identificador);

        if (!item) return;

        item.qtd += variacao;

        if (item.qtd <= 0) {
            carrinho = carrinho.filter(
                produto => produto !== item
            );
        }

        renderizarCarrinho();
    }

    function removerItem(identificador) {
        carrinho = carrinho.filter(item =>
            String(item.chave || item.id) !== String(identificador)
        );

        renderizarCarrinho();
        mostrarToast("Produto removido da sacola.");
    }

    // -----------------------------------------------------
    // ADICIONAR PRODUTO
    // -----------------------------------------------------

    function adicionarProduto(
        id,
        nome,
        preco,
        imagem = "",
        personalizacao = {}
    ) {
        const idConvertido = Number(id);
        const nomeConvertido = String(nome || "").trim();
        const precoConvertido = converterPreco(preco);

        if (
            !Number.isSafeInteger(idConvertido) ||
            idConvertido <= 0 ||
            !nomeConvertido ||
            precoConvertido <= 0
        ) {
            console.error("Dados inválidos do produto:", {
                id,
                nome,
                preco
            });

            mostrarToast(
                "Não foi possível adicionar esse produto. Confira o preço."
            );
            return;
        }

        const escolhas = personalizacao &&
            typeof personalizacao === "object"
                ? personalizacao
                : {};

        // Combina ID e personalização para separar versões diferentes
        // do mesmo produto no carrinho.
        const assinatura = JSON.stringify(escolhas, Object.keys(escolhas).sort());

        const chave = `${idConvertido}_${assinatura}`;

        const existente = carrinho.find(item =>
            String(item.chave || item.id) === chave
        );

        if (existente) {
            existente.qtd += 1;
        } else {
            carrinho.push({
                chave,
                id: idConvertido,
                nome: nomeConvertido,
                preco: precoConvertido,
                qtd: 1,
                imagem: String(imagem || ""),
                personalizacao: escolhas
            });
        }

        renderizarCarrinho();
        mostrarToast(`${nomeConvertido} adicionado à sacola!`);
    }

    // -----------------------------------------------------
    // EVENTOS
    // -----------------------------------------------------

    function inicializarCarrinho() {
        const header = document.getElementById("headerPrincipal");

        window.addEventListener("scroll", () => {
            if (header) {
                header.classList.toggle("scrolled", window.scrollY > 30);
            }
        });

        const abrir = document.getElementById("btnAbrirCarrinho");
        const fechar = document.getElementById("btnFecharCarrinho");
        const overlay = document.getElementById("carrinhoOverlay");
        const abrirPromo = document.getElementById("btnAbrirCarrinhoPromo");
        const abrirMobile = document.getElementById("btnAbrirCarrinhoMobile");

        if (abrir) abrir.addEventListener("click", abrirCarrinho);
        if (fechar) fechar.addEventListener("click", fecharCarrinho);
        if (overlay) overlay.addEventListener("click", fecharCarrinho);
        if (abrirPromo) abrirPromo.addEventListener("click", abrirCarrinho);
        if (abrirMobile) abrirMobile.addEventListener("click", abrirCarrinho);

        // Delegação de eventos: funciona também na página de detalhes.
        document.addEventListener("click", evento => {
            const botao = evento.target.closest(".btn-adicionar-produto");

            if (!botao || botao.disabled) return;

            evento.preventDefault();

            const card = botao.closest(".card-produto");

            const id = Number(botao.dataset.id);
            const nome =
                botao.dataset.nome ||
                card?.dataset.nome ||
                document.querySelector(".detalhe-titulo")?.textContent?.trim() ||
                "";

            const preco = botao.dataset.preco;

            const imagem =
                botao.dataset.imagem ||
                card?.querySelector("img")?.src ||
                document.querySelector(".detalhe-imagem")?.src ||
                "";

            // Lê personalização se o template disponibilizar os campos.
            const personalizacao = {
                ingredientes: Array.from(
                    document.querySelectorAll(
                        '[name="ingredientes"]:checked'
                    )
                ).map(campo => ({
                    id: campo.value,
                    nome: campo.dataset.nome || campo.labels?.[0]?.textContent?.trim() || campo.value
                })),

                adicionais: Array.from(
                    document.querySelectorAll(
                        '[name="adicionais"]:checked'
                    )
                ).map(campo => ({
                    id: campo.value,
                    nome: campo.dataset.nome || campo.labels?.[0]?.textContent?.trim() || campo.value,
                    preco: converterPreco(campo.dataset.preco)
                })),

                molhos: Array.from(
                    document.querySelectorAll(
                        '[name="molhos"]:checked'
                    )
                ).map(campo => ({
                    id: campo.value,
                    nome: campo.dataset.nome || campo.labels?.[0]?.textContent?.trim() || campo.value
                })),

                observacoes:
                    document.querySelector(
                        '[name="observacoes_personalizacao"]'
                    )?.value?.trim() || ""
            };

            const adicionaisTotal = personalizacao.adicionais.reduce(
                (soma, adicional) => soma + adicional.preco,
                0
            );

            adicionarProduto(
                id,
                nome,
                converterPreco(preco) + adicionaisTotal,
                imagem,
                personalizacao
            );
        });

        const combo = document.getElementById("btnAdicionarCombo");

        if (combo) {
            combo.addEventListener("click", () => {
                adicionarProduto(
                    99,
                    "Combo Duplo Especial",
                    39.90
                );
            });
        }

        if ("IntersectionObserver" in window) {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visivel");
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll(".fade-up").forEach(element => {
                observer.observe(element);
            });
        }

        renderizarCarrinho();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            inicializarCarrinho,
            { once: true }
        );
    } else {
        inicializarCarrinho();
    }
})();
