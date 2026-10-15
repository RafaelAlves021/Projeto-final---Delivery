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