/* ==========================================================================
   ESTADO DO CARRINHO & REGRAS DE NEGÓCIO (BURGA RUA)
   ========================================================================== */
   let carrinho = JSON.parse(localStorage.getItem('burga_carrinho_premium')) || [];
   const META_FRETE_GRATIS = 50.00;
   
   document.addEventListener('DOMContentLoaded', () => {
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
     const toast = document.getElementById('toastNotificacao');
     const toastTexto = document.getElementById('toastTexto');
     const btnMenuMobile = document.getElementById('btnMenuMobile');
     const menuMobileGaveta = document.getElementById('menuMobileGaveta');
     const formCepHero = document.getElementById('formCepHero');
   
     // Menu Mobile
     if (btnMenuMobile && menuMobileGaveta) {
       btnMenuMobile.addEventListener('click', () => {
         menuMobileGaveta.classList.toggle('aberto');
       });
     }
   
     // Header translúcido ao rolar
     window.addEventListener('scroll', () => {
       if (headerSite) {
         if (window.scrollY > 30) {
           headerSite.classList.add('scrolled');
         } else {
           headerSite.classList.remove('scrolled');
         }
       }
     });
   
     // Drawer do Carrinho
     function abrirDrawerCarrinho() {
       if (carrinhoDrawer && carrinhoOverlay) {
         carrinhoDrawer.classList.add('aberto');
         carrinhoOverlay.classList.add('aberto');
       }
     }
   
     function fecharDrawerCarrinho() {
       if (carrinhoDrawer && carrinhoOverlay) {
         carrinhoDrawer.classList.remove('aberto');
         carrinhoOverlay.classList.remove('aberto');
       }
     }
   
     if (btnAbrirCarrinho) btnAbrirCarrinho.addEventListener('click', abrirDrawerCarrinho);
     if (btnFecharCarrinho) btnFecharCarrinho.addEventListener('click', fecharDrawerCarrinho);
     if (carrinhoOverlay) carrinhoOverlay.addEventListener('click', fecharDrawerCarrinho);
   
     const btnMobileBar = document.getElementById('btnMobileVerSacola');
     if (btnMobileBar) btnMobileBar.addEventListener('click', abrirDrawerCarrinho);
   
     // Toast
     function mostrarToast(mensagem) {
       if (!toast || !toastTexto) return;
       toastTexto.textContent = mensagem;
       toast.classList.add('visivel');
       setTimeout(() => {
         toast.classList.remove('visivel');
       }, 2400);
     }
   
     // Atualizar UI do Carrinho
     function renderizarCarrinhoUI() {
       localStorage.setItem('burga_carrinho_premium', JSON.stringify(carrinho));
   
       const qtdTotal = carrinho.reduce((sum, item) => sum + item.qtd, 0);
       if (carrinhoBadge) carrinhoBadge.textContent = qtdTotal;
       if (mobileCartQtd) mobileCartQtd.textContent = qtdTotal;
   
       const totalPreco = carrinho.reduce((sum, item) => sum + (item.preco * item.qtd), 0);
       const precoFormatado = 'R$ ' + totalPreco.toFixed(2).replace('.', ',');
       if (carrinhoTotalValor) carrinhoTotalValor.textContent = precoFormatado;
       if (mobileCartTotal) mobileCartTotal.textContent = precoFormatado;
   
       if (freteTexto && freteProgressoBarra) {
         if (totalPreco >= META_FRETE_GRATIS) {
           freteTexto.textContent = 'Parabéns! Você ganhou Frete Grátis!';
           freteProgressoBarra.style.width = '100%';
           freteProgressoBarra.style.background = '#2E7D32';
         } else {
           const restante = META_FRETE_GRATIS - totalPreco;
           freteTexto.textContent = 'Faltam R$ ' + restante.toFixed(2).replace('.', ',') + ' para frete grátis';
           const pct = (totalPreco / META_FRETE_GRATIS) * 100;
           freteProgressoBarra.style.width = pct + '%';
           freteProgressoBarra.style.background = 'var(--cor-destaque)';
         }
       }
   
       if (!drawerItensLista) return;
   
       if (carrinho.length === 0) {
         drawerItensLista.innerHTML = `
           <div style="text-align: center; padding: 48px 0; color: var(--cor-texto-mutado);">
             <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px;"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
             <p style="font-weight: 600;">Sua sacola está vazia</p>
             <p style="font-size: 0.85rem; margin-top: 4px;">Adicione um smash burger para começar.</p>
           </div>
         `;
         return;
       }
   
       drawerItensLista.innerHTML = '';
       carrinho.forEach(item => {
         const div = document.createElement('div');
         div.className = 'item-carrinho';
         div.innerHTML = `
           <div class="item-carrinho__info">
             <h5>${item.nome}</h5>
             <span>R$ ${(item.preco * item.qtd).toFixed(2).replace('.', ',')}</span>
             <div class="item-carrinho__controles">
               <button type="button" class="btn-qty-mini btn-carrinho-menos" data-id="${item.id}">-</button>
               <span class="qty-display-mini">${item.qtd}</span>
               <button type="button" class="btn-qty-mini btn-carrinho-mais" data-id="${item.id}">+</button>
             </div>
           </div>
           <button type="button" class="btn-carrinho-remover" data-id="${item.id}" style="background: none; border: none; color: #A8A29D; cursor: pointer; padding: 4px;" title="Remover item">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
           </button>
         `;
         drawerItensLista.appendChild(div);
       });
   
       // Eventos dentro do drawer
       drawerItensLista.querySelectorAll('.btn-carrinho-menos').forEach(btn => {
         btn.addEventListener('click', () => ajustarQtd(parseInt(btn.dataset.id, 10), -1));
       });
       drawerItensLista.querySelectorAll('.btn-carrinho-mais').forEach(btn => {
         btn.addEventListener('click', () => ajustarQtd(parseInt(btn.dataset.id, 10), 1));
       });
       drawerItensLista.querySelectorAll('.btn-carrinho-remover').forEach(btn => {
         btn.addEventListener('click', () => removerItem(parseInt(btn.dataset.id, 10)));
       });
     }
   
     function ajustarQtd(id, delta) {
       const item = carrinho.find(i => i.id === id);
       if (item) {
         item.qtd += delta;
         if (item.qtd <= 0) {
           carrinho = carrinho.filter(i => i.id !== id);
         }
       }
       renderizarCarrinhoUI();
       sincronizarBotoesCards();
     }
   
     function removerItem(id) {
       carrinho = carrinho.filter(i => i.id !== id);
       renderizarCarrinhoUI();
       sincronizarBotoesCards();
     }
   
     function sincronizarBotoesCards() {
       document.querySelectorAll('.card-produto').forEach(card => {
         const id = parseInt(card.dataset.id, 10);
         const btnAdd = card.querySelector('.btn-adicionar-produto');
         const seletor = card.querySelector('.card-seletor-qty');
         const qtyTxt = card.querySelector('.qty-display-mini');
         const item = carrinho.find(i => i.id === id);
   
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
   
     // Eventos de clique nos Cards de Produto
     document.querySelectorAll('.btn-adicionar-produto').forEach(btn => {
       btn.addEventListener('click', () => {
         const card = btn.closest('.card-produto');
         if (!card) return;
         const id = parseInt(card.dataset.id, 10);
         const nome = card.dataset.nome;
         const preco = parseFloat(card.dataset.preco);
   
         const itemExistente = carrinho.find(i => i.id === id);
         if (itemExistente) {
           itemExistente.qtd += 1;
         } else {
           carrinho.push({ id, nome, preco, qtd: 1 });
         }
   
         renderizarCarrinhoUI();
         sincronizarBotoesCards();
         mostrarToast(`${nome} adicionado à sacola!`);
       });
     });
   
     document.querySelectorAll('.card-seletor-qty').forEach(seletor => {
       const card = seletor.closest('.card-produto');
       if (!card) return;
       const id = parseInt(card.dataset.id, 10);
   
       const btnMenos = seletor.querySelector('.btn-card-menos');
       const btnMais = seletor.querySelector('.btn-card-mais');
   
       if (btnMenos) btnMenos.addEventListener('click', () => ajustarQtd(id, -1));
       if (btnMais) btnMais.addEventListener('click', () => ajustarQtd(id, 1));
     });
   
     // Botão Promoção Combo
     const btnCombo = document.getElementById('btnAdicionarCombo');
     if (btnCombo) {
       btnCombo.addEventListener('click', () => {
         const id = 99;
         const nome = 'Combo Duplo Especial';
         const preco = 39.90;
         const item = carrinho.find(i => i.id === id);
         if (item) {
           item.qtd += 1;
         } else {
           carrinho.push({ id, nome, preco, qtd: 1 });
         }
         renderizarCarrinhoUI();
         mostrarToast(`${nome} adicionado!`);
       });
     }
   
     // Filtro de Categorias
     const categoriaBotoes = document.querySelectorAll('.categoria-pill');
     const cardsProdutos = document.querySelectorAll('.card-produto');
   
     categoriaBotoes.forEach(botao => {
       botao.addEventListener('click', () => {
         categoriaBotoes.forEach(b => b.classList.remove('ativo'));
         botao.classList.add('ativo');
   
         const cat = botao.getAttribute('data-categoria');
   
         cardsProdutos.forEach(card => {
           const cardCat = card.getAttribute('data-categoria');
           if (cat === 'todos' || cardCat === cat) {
             card.style.opacity = '0';
             card.style.display = 'flex';
             setTimeout(() => {
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
       formCepHero.addEventListener('submit', (e) => {
         e.preventDefault();
         const input = document.getElementById('campoCepHero');
         if (input && input.value.trim()) {
           mostrarToast('✓ Entrega disponível em até 30 min para sua região!');
         }
       });
     }
   
     // Intersection Observer
     const observer = new IntersectionObserver((entries) => {
       entries.forEach(entry => {
         if (entry.isIntersecting) {
           entry.target.classList.add('visivel');
         }
       });
     }, { threshold: 0.1 });
   
     document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
   
     // Inicialização
     renderizarCarrinhoUI();
     sincronizarBotoesCards();
   });