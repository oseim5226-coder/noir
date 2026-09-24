(() => {
  const PRODUCTS = [
    { id:'nuit', name:'Nuit Eau de Parfum', cat:'Fragrance', price:210, art:'perfume', note:'Black pepper, oud and smoke. 50 ml.' },
    { id:'ambre', name:'Ambre Rose', cat:'Fragrance', price:185, art:'perfume2', note:'Amber, rose and vanilla. 50 ml.' },
    { id:'lune', name:'Lune Blanche', cat:'Fragrance', price:160, art:'perfume3', note:'Jasmine, white musk and cedar. 30 ml.' },
    { id:'vesper', name:'Vesper Tote', cat:'Bags', price:890, art:'tote', note:'Full-grain leather with a suede lining.' },
    { id:'soir', name:'Soir Clutch', cat:'Bags', price:320, art:'clutch', note:'Satin finish with a detachable chain.' },
    { id:'velours', name:'Velours Face Cream', cat:'Skincare', price:95, art:'jar', note:'Rich daily moisturizer with shea butter. 50 ml.' },
    { id:'eclat', name:'Éclat Vitamin C Serum', cat:'Skincare', price:78, art:'serum', note:'Lightweight daily serum. 30 ml.' },
    { id:'douceur', name:'Douceur Gentle Cleanser', cat:'Skincare', price:42, art:'tube', note:'Soft foaming face wash. 100 ml.' }
  ];
  const BY_ID = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
  const CATS = ['All', ...new Set(PRODUCTS.map(p => p.cat))];
  const money = n => new Intl.NumberFormat('en-US', { style:'currency', currency:'USD', maximumFractionDigits:0 }).format(n);
  const $ = s => document.querySelector(s);
  const art = id => `<svg class="art" viewBox="0 0 200 200" aria-hidden="true" focusable="false"><use href="#a-${id}"/></svg>`;

  const grid = $('#grid'), filtersEl = $('#filters'), lines = $('#lines'),
        drawer = $('#drawer'), scrim = $('#scrim'), countEl = $('#count'),
        bagBtn = $('#bagBtn'), closeBtn = $('#closeBtn'), toastEl = $('#toast'),
        subtotalEl = $('#subtotal'), checkoutBtn = $('#checkout');

  let filter = 'All';
  let cart = loadCart();
  let lastFocus = null;
  let toastTimer;

  /* ---------- storage ---------- */
  function loadCart() {
    try {
      const raw = JSON.parse(localStorage.getItem('noir-cart'));
      const clean = {};
      if (raw && typeof raw === 'object') {
        for (const [id, q] of Object.entries(raw)) {
          if (BY_ID[id] && Number.isInteger(q) && q > 0) clean[id] = Math.min(q, 99);
        }
      }
      return clean;
    } catch { return {}; }
  }
  function saveCart() { try { localStorage.setItem('noir-cart', JSON.stringify(cart)); } catch {} }

  /* ---------- cart logic ---------- */
  const totalItems = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const subtotal = () => Object.entries(cart).reduce((s, [id, q]) => s + BY_ID[id].price * q, 0);

  function addItem(id) {
    cart[id] = Math.min((cart[id] || 0) + 1, 99);
    commit();
    toast(`${BY_ID[id].name} added to your bag`);
    countEl.classList.remove('bump'); void countEl.offsetWidth; countEl.classList.add('bump');
  }
  function setQty(id, q) {
    if (q <= 0) delete cart[id]; else cart[id] = Math.min(q, 99);
    commit();
  }
  function commit() { saveCart(); renderCount(); renderCart(); }

  /* ---------- rendering ---------- */
  function renderFilters() {
    filtersEl.innerHTML = CATS.map(c =>
      `<button class="chip" data-cat="${c}" aria-pressed="${c === filter}">${c}</button>`).join('');
  }
  function renderGrid() {
    const list = filter === 'All' ? PRODUCTS : PRODUCTS.filter(p => p.cat === filter);
    grid.innerHTML = list.map(p => `
      <article class="card">
        <div class="tile">${art(p.art)}</div>
        <div class="meta"><h3>${p.name}</h3><span class="price">${money(p.price)}</span></div>
        <p class="note">${p.note}</p>
        <button class="add" data-add="${p.id}" aria-label="Add ${p.name} to bag">Add to bag</button>
      </article>`).join('');
  }
  function renderCount() {
    const n = totalItems();
    countEl.textContent = n;
    countEl.dataset.n = n;
    bagBtn.setAttribute('aria-label', `Open bag, ${n} ${n === 1 ? 'item' : 'items'}`);
  }
  function renderCart(refocus) {
    const entries = Object.entries(cart);
    if (!entries.length) {
      lines.innerHTML = `<li class="empty"><h3>Your bag is empty</h3><p>Pick something from the collection and it will show up here.</p><button class="btn" data-browse>Browse the collection</button></li>`;
    } else {
      lines.innerHTML = entries.map(([id, q]) => {
        const p = BY_ID[id];
        return `
        <li class="line" data-id="${id}">
          <div class="thumb">${art(p.art)}</div>
          <div>
            <h3>${p.name}</h3>
            <div class="unit">${money(p.price)} each</div>
            <div class="qty">
              <button data-dec aria-label="Decrease quantity of ${p.name}">&minus;</button>
              <span>${q}</span>
              <button data-inc aria-label="Increase quantity of ${p.name}">+</button>
            </div>
            <button class="rm" data-rm>Remove</button>
          </div>
          <strong class="ltotal">${money(p.price * q)}</strong>
        </li>`;
      }).join('');
    }
    subtotalEl.textContent = money(subtotal());
    checkoutBtn.disabled = !entries.length;
    if (refocus) {
      const target = lines.querySelector(`[data-id="${refocus.id}"] [${refocus.action}]`) || closeBtn;
      target.focus();
    }
  }

  /* ---------- drawer ---------- */
  function openDrawer() {
    lastFocus = document.activeElement;
    drawer.classList.add('open'); scrim.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }
  function closeDrawer() {
    drawer.classList.remove('open'); scrim.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  const isOpen = () => drawer.classList.contains('open');

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
  }

  /* ---------- events ---------- */
  filtersEl.addEventListener('click', e => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    filter = b.dataset.cat;
    renderFilters(); renderGrid();
    filtersEl.querySelector(`[data-cat="${filter}"]`).focus();
  });
  grid.addEventListener('click', e => {
    const b = e.target.closest('[data-add]');
    if (b) addItem(b.dataset.add);
  });
  lines.addEventListener('click', e => {
    const browse = e.target.closest('[data-browse]');
    if (browse) { closeDrawer(); location.hash = 'collection'; return; }
    const b = e.target.closest('button');
    const li = e.target.closest('.line');
    if (!b || !li) return;
    const id = li.dataset.id;
    let action = null;
    if (b.hasAttribute('data-inc')) { setQty(id, (cart[id] || 0) + 1); action = 'data-inc'; }
    else if (b.hasAttribute('data-dec')) { setQty(id, (cart[id] || 0) - 1); action = 'data-dec'; }
    else if (b.hasAttribute('data-rm')) { setQty(id, 0); }
    if (cart[id]) renderCart({ id, action: action || 'data-inc' }); else renderCart({ id: '', action: '' });
  });
  bagBtn.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  scrim.addEventListener('click', closeDrawer);
  checkoutBtn.addEventListener('click', () => toast("Checkout isn't connected yet. This is a demo store."));
  document.addEventListener('keydown', e => {
    if (!isOpen()) return;
    if (e.key === 'Escape') { closeDrawer(); return; }
    if (e.key === 'Tab') {
      const f = [...drawer.querySelectorAll('button:not([disabled])')];
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener('storage', e => {
    if (e.key === 'noir-cart') { cart = loadCart(); renderCount(); renderCart(); }
  });

  /* ---------- init ---------- */
  $('#year').textContent = new Date().getFullYear();
  renderFilters(); renderGrid(); renderCount(); renderCart();
})();
