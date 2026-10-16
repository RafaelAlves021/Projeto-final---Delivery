
/* =========================================================
   BURGA RUA — CARRINHO DE COMPRAS
   ========================================================= */

   (() => {
    "use strict";

    const CHAVE_CARRINHO = "burga_carrinho_premium";
    const META_FRETE_GRATIS = 50;

    let carrinho = carregarCarrinho();

    // Converte preços para números.
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

    // Carrega o carrinho salvo.
    function carregarCarrinho() {
        try {
            const salvo = localStorage.getItem(CHAVE_CARRINHO);

            if (!salvo) return [];

            const dados = JSON.parse(salvo);

            if (!Array.isArray(dados)) return [];

            return dados
                .filter(item =>
                    item &&
                    Number.isFinite(Number(item.id)) &&
                    String(item.nome || "").trim() !== ""
                )
                .map(item => ({
                    id: Number(item.id),
                    nome: String(item.nome),
                    preco: converterPreco(item.preco),
                    qtd: Math.max(1, Math.floor(Number(item.qtd) || 1))
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
        }
    }

    function formatarPreco(valor) {
        return converterPreco(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
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

    function mostrarToast(mensagem) {
        const toast = document.getElementById("toastNotificacao");
        const texto = document.getElementById("toastTexto");

        if (!toast || !texto) return;

        texto.textContent = mensagem;
        toast.classList.add("visivel");

        clearTimeout(mostrarToast.timeout);

        mostrarToast.timeout = setTimeout(() => {
            toast.classList.remove("visivel");
        }, 2400);
    }

    function abrirCarrinho() {
        const drawer = document.getElementById("carrinhoDrawer");
        const overlay = document.getElementById("carrinhoOverlay");

        if (drawer) {
            drawer.classList.add("aberto");
            drawer.setAttribute("aria-hidden", "false");
        }

        if (overlay) overlay.classList.add("aberto");
    }

    function fecharCarrinho() {
        const drawer = document.getElementById("carrinhoDrawer");
        const overlay = document.getElementById("carrinhoOverlay");

        if (drawer) {
            drawer.classList.remove("aberto");
            drawer.setAttribute("aria-hidden", "true");
        }

        if (overlay) overlay.classList.remove("aberto");
    }

    // Atualiza os botões dos cartões de produtos.
    function sincronizarBotoesCards() {
        document.querySelectorAll(".card-produto").forEach(card => {
            const botao = card.querySelector(".btn-adicionar-produto");

            if (!botao) return;

            const id = Number(botao.dataset.id);
            const item = carrinho.find(produto => produto.id === id);

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

    // Cria o ícone de lixeira em SVG.
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

    // Atualiza o carrinho, totais e frete.
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
            vazio.style.padding = "32px 12px";
            vazio.style.textAlign = "center";

            lista.appendChild(vazio);
            sincronizarBotoesCards();
            return;
        }

        carrinho.forEach(item => {
            const linha = document.createElement("div");
            linha.className = "item-carrinho";

            const informacoes = document.createElement("div");
            informacoes.className = "item-carrinho__info";

            const nome = document.createElement("h5");
            nome.textContent = item.nome;

            const preco = document.createElement("span");
            preco.textContent = formatarPreco(item.preco * item.qtd);

            const controles = document.createElement("div");
            controles.className = "item-carrinho__controles";

            const menos = document.createElement("button");
            menos.type = "button";
            menos.className = "btn-qty-mini btn-carrinho-menos";
            menos.textContent = "−";
            menos.setAttribute("aria-label", `Diminuir ${item.nome}`);
            menos.addEventListener("click", () => {
                ajustarQuantidade(item.id, -1);
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
                ajustarQuantidade(item.id, 1);
            });

            controles.append(menos, quantidadeItem, mais);
            informacoes.append(nome, preco, controles);

            // Botão de remover com ícone de lixeira.
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
                removerItem(item.id);
            });

            linha.append(informacoes, remover);
            lista.appendChild(linha);
        });

        sincronizarBotoesCards();
    }

    function ajustarQuantidade(id, variacao) {
        const item = carrinho.find(
            produto => produto.id === Number(id)
        );

        if (!item) return;

        item.qtd += variacao;

        if (item.qtd <= 0) {
            carrinho = carrinho.filter(
                produto => produto.id !== Number(id)
            );
        }

        renderizarCarrinho();
    }

    function removerItem(id) {
        carrinho = carrinho.filter(
            produto => produto.id !== Number(id)
        );

        renderizarCarrinho();
        mostrarToast("Produto removido da sacola.");
    }

    function adicionarProduto(id, nome, preco) {
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

        const existente = carrinho.find(
            item => item.id === idConvertido
        );

        if (existente) {
            existente.qtd += 1;
        } else {
            carrinho.push({
                id: idConvertido,
                nome: nomeConvertido,
                preco: precoConvertido,
                qtd: 1
            });
        }

        renderizarCarrinho();
        mostrarToast(`${nomeConvertido} adicionado à sacola!`);
    }

    // Registra os eventos da página.
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

        document.querySelectorAll(".btn-adicionar-produto").forEach(botao => {
            botao.addEventListener("click", () => {
                if (botao.disabled) return;

                const card = botao.closest(".card-produto");
                const id = Number(botao.dataset.id);
                const nome = botao.dataset.nome || card?.dataset.nome || "";
                const preco = botao.dataset.preco;

                adicionarProduto(id, nome, preco);
            });
        });

        const combo = document.getElementById("btnAdicionarCombo");

        if (combo) {
            combo.addEventListener("click", () => {
                adicionarProduto(99, "Combo Duplo Especial", 39.90);
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
