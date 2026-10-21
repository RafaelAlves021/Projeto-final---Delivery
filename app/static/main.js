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
                    chave: String(item.chave || item.id),
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
            aviso.className = "toast-msg";
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
    // ÍCONE DE LIXEIRA
    // -----------------------------------------------------

    function criarIconeLixeira() {
        const svg = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );

        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("width", "18");
        svg.setAttribute("height", "18");
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

        // Frete grátis a partir de R$ 50
        if (freteTexto && barraFrete) {
            if (total >= META_FRETE_GRATIS) {
                freteTexto.textContent = "Parabéns! Você ganhou frete grátis!";
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
            atualizarBotoesCards();
            atualizarPaginaCarrinho();
            atualizarCheckout();
            return;
        }

        lista.replaceChildren();

        if (carrinho.length === 0) {
            const vazio = document.createElement("div");
            vazio.className = "carrinho-vazio";
            vazio.textContent =
                "Sua sacola está vazia. Adicione um produto para começar.";

            lista.appendChild(vazio);
            atualizarBotoesCards();
            atualizarPaginaCarrinho();
            atualizarCheckout();
            return;
        }

        carrinho.forEach(item => {
            const linha = document.createElement("div");
            linha.className = "item-carrinho";

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
            remover.setAttribute("aria-label", `Remover ${item.nome} do carrinho`);
            remover.title = "Remover produto";
            remover.appendChild(criarIconeLixeira());

            remover.addEventListener("click", () => {
                removerItem(item.chave || item.id);
            });

            linha.append(informacoes, remover);
            lista.appendChild(linha);
        });

        atualizarBotoesCards();
        atualizarPaginaCarrinho();
        atualizarCheckout();
    }

    // -----------------------------------------------------
    // ATUALIZAR BOTÕES DOS CARDS
    // -----------------------------------------------------

    function atualizarBotoesCards() {
        document.querySelectorAll(".card-produto").forEach(card => {
            const botao = card.querySelector(".btn-adicionar-produto");

            if (!botao) return;

            const id = Number(botao.dataset.id || card.dataset.id);

            if (!id) return;

            const item = carrinho.find(produto =>
                produto.id === id &&
                Object.keys(produto.personalizacao || {}).length === 0
            );

            const seletor = card.querySelector(".card-seletor-qty");
            const qtyTxt = card.querySelector(".qty-display-mini");

            if (item && item.qtd > 0) {
                if (seletor) seletor.classList.add("visivel");
                if (qtyTxt) qtyTxt.textContent = item.qtd;
            } else {
                if (seletor) seletor.classList.remove("visivel");
            }
        });
    }

    // -----------------------------------------------------
    // PÁGINA DO CARRINHO (/carrinho/)
    // -----------------------------------------------------

    function atualizarPaginaCarrinho() {
        const lista = document.getElementById("carrinhoPaginaLista") || document.getElementById("carrinhoItensLista");

        if (!lista) return;

        const contador = document.getElementById("carrinhoPaginaContador") || document.getElementById("carrinhoQtdTexto");
        const resumoSubtotal = document.getElementById("resumoSubtotal") || document.getElementById("carrinhoSubtotalValor");
        const resumoFrete = document.getElementById("resumoFrete") || document.getElementById("carrinhoFreteValor");
        const resumoTotal = document.getElementById("resumoTotal") || document.getElementById("carrinhoTotalGeral");

        const quantidade = obterQuantidade();
        const subtotal = obterTotal();

        if (contador) {
            contador.textContent = `${quantidade} item(ns) adicionado(s)`;
        }

        const frete = subtotal >= META_FRETE_GRATIS || subtotal === 0 ? 0 : 8;
        const total = subtotal + frete;

        if (resumoSubtotal) resumoSubtotal.textContent = formatarPreco(subtotal);
        if (resumoFrete) {
            resumoFrete.textContent = frete === 0 && subtotal > 0
                ? "Grátis"
                : formatarPreco(frete);
        }
        if (resumoTotal) resumoTotal.textContent = formatarPreco(total);

        lista.replaceChildren();

        if (carrinho.length === 0) {
            const vazio = document.createElement("div");
            vazio.className = "carrinho-vazio";
            vazio.textContent = "O seu carrinho está vazio.";
            lista.appendChild(vazio);
            return;
        }

        carrinho.forEach(item => {
            const linha = document.createElement("div");
            linha.className = "item-linha";

            if (item.imagem) {
                const img = document.createElement("img");
                img.className = "item-carrinho__imagem";
                img.src = item.imagem;
                img.alt = item.nome;
                linha.appendChild(img);
            }

            const dados = document.createElement("div");
            dados.className = "item-linha__dados";

            const nome = document.createElement("h4");
            nome.textContent = item.nome;

            const preco = document.createElement("span");
            preco.textContent = formatarPreco(item.preco * item.qtd);

            dados.append(nome, preco);

            const controles = document.createElement("div");
            controles.className = "card-seletor-qty visivel";

            const menos = document.createElement("button");
            menos.type = "button";
            menos.className = "btn-qty-mini";
            menos.textContent = "−";
            menos.addEventListener("click", () => {
                ajustarQuantidade(item.chave || item.id, -1);
            });

            const qtd = document.createElement("span");
            qtd.className = "qty-display-mini";
            qtd.textContent = item.qtd;

            const mais = document.createElement("button");
            mais.type = "button";
            mais.className = "btn-qty-mini";
            mais.textContent = "+";
            mais.addEventListener("click", () => {
                ajustarQuantidade(item.chave || item.id, 1);
            });

            const remover = document.createElement("button");
            remover.type = "button";
            remover.className = "btn-carrinho-remover";
            remover.setAttribute("aria-label", `Remover ${item.nome}`);
            remover.title = "Remover produto";
            remover.appendChild(criarIconeLixeira());
            remover.addEventListener("click", () => {
                removerItem(item.chave || item.id);
            });

            controles.append(menos, qtd, mais);
            linha.append(dados, controles, remover);
            lista.appendChild(linha);
        });
    }

    // -----------------------------------------------------
    // PÁGINA DE CHECKOUT
    // -----------------------------------------------------

    function atualizarCheckout() {
        const subtotalEl = document.getElementById("checkoutSubtotal") || document.getElementById("checkoutSubtotalValor");

        if (!subtotalEl) return;

        const freteEl = document.getElementById("checkoutFrete") || document.getElementById("checkoutFreteValor");
        const totalEl = document.getElementById("checkoutTotal") || document.getElementById("checkoutTotalGeral");

        const subtotal = obterTotal();
        const frete = subtotal >= META_FRETE_GRATIS || subtotal === 0 ? 0 : 8;
        const total = subtotal + frete;

        subtotalEl.textContent = formatarPreco(subtotal);

        if (freteEl) {
            freteEl.textContent = frete === 0 && subtotal > 0
                ? "Grátis"
                : formatarPreco(frete);
        }

        if (totalEl) totalEl.textContent = formatarPreco(total);
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
            carrinho = carrinho.filter(produto => produto !== item);
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

        const assinatura = JSON.stringify(
            escolhas,
            Object.keys(escolhas).sort()
        );

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
        
        // Abre automaticamente a gaveta lateral ao adicionar qualquer produto
        abrirCarrinho();
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
        const abrirMobile = document.getElementById("btnAbrirCarrinhoMobile") || document.getElementById("btnMobileVerSacola");

        if (abrir) abrir.addEventListener("click", abrirCarrinho);
        if (fechar) fechar.addEventListener("click", fecharCarrinho);
        if (overlay) overlay.addEventListener("click", fecharCarrinho);
        if (abrirPromo) abrirPromo.addEventListener("click", abrirCarrinho);
        if (abrirMobile) abrirMobile.addEventListener("click", abrirCarrinho);

        document.addEventListener("click", evento => {
            const botao = evento.target.closest(".btn-adicionar-produto");

            if (!botao || botao.disabled) return;

            evento.preventDefault();

            const card = botao.closest(".card-produto");

            const id = Number(botao.dataset.id || card?.dataset.id);
            const nome =
                botao.dataset.nome ||
                card?.dataset.nome ||
                document.querySelector(".detalhe-titulo")?.textContent?.trim() ||
                "";

            const preco =
                botao.dataset.preco ||
                card?.dataset.preco;

            const imagem =
                botao.dataset.imagem ||
                card?.querySelector("img")?.src ||
                document.querySelector(".detalhe-imagem")?.src ||
                "";

            const personalizacao = {
                ingredientes: Array.from(
                    document.querySelectorAll(
                        '[name="ingredientes"]:checked'
                    )
                ).map(campo => ({
                    id: campo.value,
                    nome:
                        campo.dataset.nome ||
                        campo.labels?.[0]?.textContent?.trim() ||
                        campo.value
                })),

                adicionais: Array.from(
                    document.querySelectorAll(
                        '[name="adicionais"]:checked'
                    )
                ).map(campo => ({
                    id: campo.value,
                    nome:
                        campo.dataset.nome ||
                        campo.labels?.[0]?.textContent?.trim() ||
                        campo.value,
                    preco: converterPreco(campo.dataset.preco)
                })),

                molhos: Array.from(
                    document.querySelectorAll(
                        '[name="molhos"]:checked'
                    )
                ).map(campo => ({
                    id: campo.value,
                    nome:
                        campo.dataset.nome ||
                        campo.labels?.[0]?.textContent?.trim() ||
                        campo.value
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

        document.querySelectorAll(".card-seletor-qty").forEach(seletor => {
            const card = seletor.closest(".card-produto");

            if (!card) return;

            const botaoAdd = card.querySelector(".btn-adicionar-produto");
            const id = Number(
                botaoAdd?.dataset.id || card.dataset.id
            );

            if (!id) return;

            const btnMenos = seletor.querySelector(".btn-card-menos");
            const btnMais = seletor.querySelector(".btn-card-mais");

            if (btnMenos) {
                btnMenos.addEventListener("click", () => {
                    const item = carrinho.find(p => p.id === id);

                    if (item) {
                        ajustarQuantidade(item.chave || item.id, -1);
                    }
                });
            }

            if (btnMais) {
                btnMais.addEventListener("click", () => {
                    const item = carrinho.find(p => p.id === id);

                    if (item) {
                        ajustarQuantidade(item.chave || item.id, 1);
                    }
                });
            }
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