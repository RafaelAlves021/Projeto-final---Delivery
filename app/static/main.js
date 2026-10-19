<<<<<<< HEAD

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
=======
/* ==========================================================================
   ESTADO DO CARRINHO & REGRAS DE NEGÓCIO (BURGA RUA)
   ========================================================================== */
   let carrinho = JSON.parse(localStorage.getItem('burga_carrinho_premium')) || [];
   const META_FRETE_GRATIS = 50.00;
   
   document.addEventListener('DOMContentLoaded', function () {
     // Elementos do Header e Drawer (Home)
     const headerSite = document.getElementById('headerPrincipal');
     const btnAbrirCarrinho = document.getElementById('btnAbrirCarrinho');
     const btnFecharCarrinho = document.getElementById('btnFecharCarrinho');
     const carrinhoDrawer = document.getElementById('carrinhoDrawer');
     const carrinhoOverlay = document.getElementById('carrinhoOverlay');
     const drawerItensLista = document.getElementById('drawerItensLista');
     const carrinhoTotalValor = document.getElementById('carrinhoTotalValor');
     const carrinhoBadge = document.getElementById('carrinhoBadge');
     const freteTexto = document.getElementById('freteTexto');
     const freteProgressoBarra = document.getElementById('freteProgressoBarra');
     const mobileCartTotal = document.getElementById('mobileCartTotal');
     const mobileCartQtd = document.getElementById('mobileCartQtd');
     const btnMobileBar = document.getElementById('btnMobileVerSacola');
     const btnMenuMobile = document.getElementById('btnMenuMobile');
     const menuMobileGaveta = document.getElementById('menuMobileGaveta');
     const formCepHero = document.getElementById('formCepHero');
     const toast = document.getElementById('toastNotificacao');
     const toastTexto = document.getElementById('toastTexto');
   
     // Elementos da Página de Carrinho (/carrinho/)
     const paginaLista = document.getElementById('carrinhoPaginaLista');
     const paginaContador = document.getElementById('carrinhoPaginaContador');
     const resumoSubtotal = document.getElementById('resumoSubtotal');
     const resumoFrete = document.getElementById('resumoFrete');
     const resumoTotal = document.getElementById('resumoTotal');
   
     // Elementos do Checkout (/checkout/)
     const checkoutSubtotal = document.getElementById('checkoutSubtotal');
     const checkoutFrete = document.getElementById('checkoutFrete');
     const checkoutTotal = document.getElementById('checkoutTotal');
     const formCheckout = document.getElementById('formCheckout');
   
     // Menu Mobile
     if (btnMenuMobile && menuMobileGaveta) {
       btnMenuMobile.addEventListener('click', function () {
         menuMobileGaveta.classList.toggle('aberto');
       });
     }
   
     // Header translúcido ao rolar
     window.addEventListener('scroll', function () {
       if (headerSite) {
         if (window.scrollY > 30) {
           headerSite.classList.add('scrolled');
         } else {
           headerSite.classList.remove('scrolled');
         }
       }
     });
   
     // Drawer
     function abrirDrawer() {
       if (carrinhoDrawer && carrinhoOverlay) {
         carrinhoDrawer.classList.add('aberto');
         carrinhoOverlay.classList.add('aberto');
       }
     }
   
     function fecharDrawer() {
       if (carrinhoDrawer && carrinhoOverlay) {
         carrinhoDrawer.classList.remove('aberto');
         carrinhoOverlay.classList.remove('aberto');
       }
     }
   
     if (btnAbrirCarrinho) btnAbrirCarrinho.addEventListener('click', abrirDrawer);
     if (btnFecharCarrinho) btnFecharCarrinho.addEventListener('click', fecharDrawer);
     if (carrinhoOverlay) carrinhoOverlay.addEventListener('click', fecharDrawer);
     if (btnMobileBar) btnMobileBar.addEventListener('click', abrirDrawer);
   
     function mostrarToast(mensagem) {
       if (!toast || !toastTexto) return;
       toastTexto.textContent = mensagem;
       toast.classList.add('visivel');
       setTimeout(function () {
         toast.classList.remove('visivel');
       }, 2400);
     }
   
     function ajustarQuantidade(id, delta) {
       const item = carrinho.find(function (i) { return i.id === id; });
       if (item) {
         item.qtd += delta;
         if (item.qtd <= 0) {
           carrinho = carrinho.filter(function (i) { return i.id !== id; });
         }
       }
       salvarESincronizar();
     }
   
     function removerItem(id) {
       carrinho = carrinho.filter(function (i) { return i.id !== id; });
       salvarESincronizar();
     }
   
     function salvarESincronizar() {
       localStorage.setItem('burga_carrinho_premium', JSON.stringify(carrinho));
       renderizarDrawerUI();
       renderizarPaginaCarrinhoUI();
       renderizarCheckoutUI();
       sincronizarBotoesCardsHome();
     }
   
     // 1. Drawer Lateral
     function renderizarDrawerUI() {
       const qtdTotal = carrinho.reduce(function (sum, item) { return sum + item.qtd; }, 0);
       if (carrinhoBadge) {
         carrinhoBadge.textContent = qtdTotal;
         carrinhoBadge.classList.add('pop');
         setTimeout(function () { carrinhoBadge.classList.remove('pop'); }, 200);
       }
       if (mobileCartQtd) mobileCartQtd.textContent = qtdTotal;
   
       const subtotal = carrinho.reduce(function (sum, item) { return sum + (item.preco * item.qtd); }, 0);
       const precoFormatado = 'R$ ' + subtotal.toFixed(2).replace('.', ',');
       if (carrinhoTotalValor) carrinhoTotalValor.textContent = precoFormatado;
       if (mobileCartTotal) mobileCartTotal.textContent = precoFormatado;
   
       if (freteTexto && freteProgressoBarra) {
         if (subtotal >= META_FRETE_GRATIS) {
           freteTexto.textContent = 'Parabéns! Você ganhou Frete Grátis!';
           freteProgressoBarra.style.width = '100%';
           freteProgressoBarra.style.background = '#2E7D32';
         } else {
           const restante = META_FRETE_GRATIS - subtotal;
           freteTexto.textContent = 'Faltam R$ ' + restante.toFixed(2).replace('.', ',') + ' para frete grátis';
           const pct = (subtotal / META_FRETE_GRATIS) * 100;
           freteProgressoBarra.style.width = pct + '%';
           freteProgressoBarra.style.background = 'var(--cor-destaque)';
         }
       }
   
       if (!drawerItensLista) return;
   
       if (carrinho.length === 0) {
         drawerItensLista.innerHTML = `
           <div style="text-align: center; padding: 48px 0; color: var(--cor-texto-mutado);">
             <p style="font-weight: 600;">Sua sacola está vazia</p>
             <p style="font-size: 0.85rem; margin-top: 4px;">Adicione um smash burger para começar.</p>
           </div>
         `;
         return;
       }
   
       drawerItensLista.innerHTML = '';
       carrinho.forEach(function (item) {
         const div = document.createElement('div');
         div.className = 'item-carrinho';
         div.innerHTML = `
           <div class="item-carrinho__info">
             <h5>${item.nome}</h5>
             <span>R$ ${(item.preco * item.qtd).toFixed(2).replace('.', ',')}</span>
             <div class="item-carrinho__controles">
               <button type="button" class="btn-qty-mini btn-drawer-menos" data-id="${item.id}">-</button>
               <span class="qty-display-mini">${item.qtd}</span>
               <button type="button" class="btn-qty-mini btn-drawer-mais" data-id="${item.id}">+</button>
             </div>
           </div>
           <button type="button" class="btn-drawer-remover" data-id="${item.id}" style="background: none; border: none; color: #A8A29D; cursor: pointer; padding: 4px;" title="Remover item">
             ✕
           </button>
         `;
         drawerItensLista.appendChild(div);
       });
   
       drawerItensLista.querySelectorAll('.btn-drawer-menos').forEach(function (btn) {
         btn.addEventListener('click', function () {
           ajustarQuantidade(parseInt(btn.getAttribute('data-id'), 10), -1);
         });
       });
   
       drawerItensLista.querySelectorAll('.btn-drawer-mais').forEach(function (btn) {
         btn.addEventListener('click', function () {
           ajustarQuantidade(parseInt(btn.getAttribute('data-id'), 10), 1);
         });
       });
   
       drawerItensLista.querySelectorAll('.btn-drawer-remover').forEach(function (btn) {
         btn.addEventListener('click', function () {
           removerItem(parseInt(btn.getAttribute('data-id'), 10));
         });
       });
     }
   
     // 2. Página de Carrinho (/carrinho/)
     function renderizarPaginaCarrinhoUI() {
       if (!paginaLista) return;
   
       const qtdTotal = carrinho.reduce(function (sum, item) { return sum + item.qtd; }, 0);
       if (paginaContador) paginaContador.textContent = `${qtdTotal} itens adicionados`;
   
       if (carrinho.length === 0) {
         paginaLista.innerHTML = `
           <div class="carrinho-vazio">
             <p>O seu carrinho está vazio.</p>
           </div>
         `;
         if (resumoSubtotal) resumoSubtotal.textContent = 'R$ 0,00';
         if (resumoFrete) resumoFrete.textContent = 'R$ 0,00';
         if (resumoTotal) resumoTotal.textContent = 'R$ 0,00';
         return;
       }
   
       const subtotal = carrinho.reduce(function (sum, item) { return sum + (item.preco * item.qtd); }, 0);
       const frete = subtotal >= META_FRETE_GRATIS ? 0.00 : 8.00;
       const total = subtotal + frete;
   
       if (resumoSubtotal) resumoSubtotal.textContent = 'R$ ' + subtotal.toFixed(2).replace('.', ',');
       if (resumoFrete) resumoFrete.textContent = frete === 0.00 ? 'Grátis' : 'R$ ' + frete.toFixed(2).replace('.', ',');
       if (resumoTotal) resumoTotal.textContent = 'R$ ' + total.toFixed(2).replace('.', ',');
   
       paginaLista.innerHTML = '';
       carrinho.forEach(function (item) {
         const art = document.createElement('article');
         art.className = 'item-linha';
         art.innerHTML = `
           <div class="item-linha__dados">
             <h4>${item.nome}</h4>
             <span>R$ ${(item.preco * item.qtd).toFixed(2).replace('.', ',')}</span>
           </div>
           <div class="card-seletor-qty visivel" style="display: flex;">
             <button type="button" class="btn-qty-mini btn-pagina-menos" data-id="${item.id}">-</button>
             <span class="qty-display-mini">${item.qtd}</span>
             <button type="button" class="btn-qty-mini btn-pagina-mais" data-id="${item.id}">+</button>
           </div>
         `;
         paginaLista.appendChild(art);
       });
   
       paginaLista.querySelectorAll('.btn-pagina-menos').forEach(function (btn) {
         btn.addEventListener('click', function () {
           ajustarQuantidade(parseInt(btn.getAttribute('data-id'), 10), -1);
         });
       });
   
       paginaLista.querySelectorAll('.btn-pagina-mais').forEach(function (btn) {
         btn.addEventListener('click', function () {
           ajustarQuantidade(parseInt(btn.getAttribute('data-id'), 10), 1);
         });
       });
     }
   
     // 3. Checkout
     function renderizarCheckoutUI() {
       if (!checkoutSubtotal || !checkoutTotal) return;
   
       const subtotal = carrinho.reduce(function (sum, item) { return sum + (item.preco * item.qtd); }, 0);
       const frete = subtotal >= META_FRETE_GRATIS ? 0.00 : 8.00;
       const total = subtotal + frete;
   
       checkoutSubtotal.textContent = 'R$ ' + subtotal.toFixed(2).replace('.', ',');
       if (checkoutFrete) {
         checkoutFrete.textContent = frete === 0.00 ? 'Grátis' : 'R$ ' + frete.toFixed(2).replace('.', ',');
       }
       checkoutTotal.textContent = 'R$ ' + total.toFixed(2).replace('.', ',');
     }
   
     // 4. Sincronizar Cards da Home
     function sincronizarBotoesCardsHome() {
       document.querySelectorAll('.card-produto').forEach(function (card) {
         const id = parseInt(card.getAttribute('data-id'), 10);
         const btnAdd = card.querySelector('.btn-adicionar-produto');
         const seletor = card.querySelector('.card-seletor-qty');
         const qtyTxt = card.querySelector('.qty-display-mini');
         const item = carrinho.find(function (i) { return i.id === id; });
   
         if (btnAdd && seletor && qtyTxt) {
           if (item && item.qtd > 0) {
             btnAdd.style.display = 'none';
             seletor.classList.add('visivel');
             qtyTxt.textContent = item.qtd;
           } else {
             seletor.classList.remove('visivel');
             btnAdd.style.display = 'flex';
           }
         }
       });
     }
   
     // Adicionar Produto na Home
     document.querySelectorAll('.btn-adicionar-produto').forEach(function (btn) {
       btn.addEventListener('click', function () {
         const card = btn.closest('.card-produto');
         if (!card) return;
         const id = parseInt(card.getAttribute('data-id'), 10);
         const nome = card.getAttribute('data-nome');
         const preco = parseFloat(card.getAttribute('data-preco'));
   
         const itemExistente = carrinho.find(function (i) { return i.id === id; });
         if (itemExistente) {
           itemExistente.qtd += 1;
         } else {
           carrinho.push({ id: id, nome: nome, preco: preco, qtd: 1 });
         }
   
         salvarESincronizar();
         mostrarToast(`${nome} adicionado à sacola!`);
       });
     });
   
     // Botões de quantidade nos cards da Home
     document.querySelectorAll('.card-seletor-qty').forEach(function (seletor) {
       const card = seletor.closest('.card-produto');
       if (!card) return;
       const id = parseInt(card.getAttribute('data-id'), 10);
   
       const btnMenos = seletor.querySelector('.btn-card-menos');
       const btnMais = seletor.querySelector('.btn-card-mais');
   
       if (btnMenos) {
         btnMenos.addEventListener('click', function () {
           ajustarQuantidade(id, -1);
         });
       }
       if (btnMais) {
         btnMais.addEventListener('click', function () {
           ajustarQuantidade(id, 1);
         });
       }
     });
   
     // Botão Promoção Combo
     const btnCombo = document.getElementById('btnAdicionarCombo');
     if (btnCombo) {
       btnCombo.addEventListener('click', function () {
         const id = 99;
         const nome = 'Combo Duplo Especial';
         const preco = 39.90;
         const item = carrinho.find(function (i) { return i.id === id; });
         if (item) {
           item.qtd += 1;
         } else {
           carrinho.push({ id: id, nome: nome, preco: preco, qtd: 1 });
         }
         salvarESincronizar();
         mostrarToast(`${nome} adicionado!`);
       });
     }
   
     // Categorias
     const categoriaBotoes = document.querySelectorAll('.categoria-pill');
     const cardsProdutos = document.querySelectorAll('.card-produto');
   
     categoriaBotoes.forEach(function (botao) {
       botao.addEventListener('click', function () {
         categoriaBotoes.forEach(function (b) { b.classList.remove('ativo'); });
         botao.classList.add('ativo');
   
         const cat = botao.getAttribute('data-categoria');
   
         cardsProdutos.forEach(function (card) {
           const cardCat = card.getAttribute('data-categoria');
           if (cat === 'todos' || cardCat === cat) {
             card.style.opacity = '0';
             card.style.display = 'flex';
             setTimeout(function () {
               card.style.opacity = '1';
             }, 50);
           } else {
             card.style.display = 'none';
           }
         });
       });
     });
   
     // CEP Hero
     if (formCepHero) {
       formCepHero.addEventListener('submit', function (e) {
         e.preventDefault();
         const input = document.getElementById('campoCepHero');
         if (input && input.value.trim()) {
           mostrarToast('✓ Entrega disponível em até 30 min para sua região!');
         }
       });
     }
   
     // Form Checkout
     if (formCheckout) {
       formCheckout.addEventListener('submit', function (e) {
         e.preventDefault();
         if (carrinho.length === 0) {
           alert('O seu carrinho está vazio!');
           return;
         }
         const nomeInput = document.getElementById('clienteNome');
         const nome = nomeInput ? nomeInput.value : 'Cliente';
         alert(`Obrigado, ${nome}! Pedido registado com sucesso.`);
         localStorage.removeItem('burga_carrinho_premium');
         window.location.href = '/';
       });
     }
   
     // Animação de entrada
     if ('IntersectionObserver' in window) {
       const observer = new IntersectionObserver(function (entries) {
         entries.forEach(function (entry) {
           if (entry.isIntersecting) {
             entry.target.classList.add('visivel');
           }
         });
       }, { threshold: 0.1 });
   
       document.querySelectorAll('.fade-up').forEach(function (el) {
         observer.observe(el);
       });
     }
   
     // Executa no carregamento
     salvarESincronizar();
   });

// Salvar e carregar observação do pedido no localStorage
const campoObs = document.getElementById('campoObservacao');
if (campoObs) {
  // Carrega o que já estava digitado anteriormente
  campoObs.value = localStorage.getItem('burga_obs_pedido') || '';

  // Salva automaticamente enquanto o cliente digita
  campoObs.addEventListener('input', function () {
    localStorage.setItem('burga_obs_pedido', campoObs.value);
  });
}
>>>>>>> origin/main
