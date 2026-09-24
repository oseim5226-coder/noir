(() => {
  const STORE = window.STORE;
  if (!STORE || !Array.isArray(STORE.products)) {
    console.error('config.js is missing or has no products list.');
    return;
  }

  const SHOP_NAME = STORE.shopName || 'Shop';
  const WHATSAPP_NUMBER = String(STORE.whatsapp || '');
  const PRODUCTS = STORE.products;
  const BY_ID = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
  const CATS = ['All', ...new Set(PRODUCTS.map(p => p.cat).filter(Boolean))];
  const CART_KEY = 'cart:' + SHOP_NAME;

  let fmt;
  try {
    fmt = new Intl.NumberFormat(STORE.locale || 'en-US', { style: 'currency', currency: STORE.currency || 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 });
  } catch (e) {
    fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
  const money = n => fmt.format(n);
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const visual = p => {
    if (p.img) return `<img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy">`;
    if (p.art) return `<svg class="art" viewBox="0 0 200 200" aria-hidden="true" focusable="false"><use href="#a-${esc(p.art)}"/></svg>`;
    return `<span class="initial" aria-hidden="true">${esc(p.name.charAt(0))}</span>`;
  };

  const grid = $('#grid'), filtersEl = $('#filters'), lines = $('#lines'),
        drawer = $('#drawer'), scrim = $('#scrim'), countEl = $('#count'),
        bagBtn = $('#bagBtn'), closeBtn = $('#closeBtn'), toastEl = $('#toast'),
        subtotalEl = $('#subtotal'), checkoutBtn = $('#checkout');

  let filter = 'All';
  let cart = loadCart();
  let lastFocus = null;
  let toastTimer;

  /* ---------- branding from config.js ---------- */
  function applyBranding() {
    document.title = STORE.tagline ? `${SHOP_NAME} | ${STORE.tagline}` : SHOP_NAME;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', STORE.description || STORE.tagline || SHOP_NAME);
    if (STORE.accent) document.documentElement.style.setProperty('--accent', STORE.accent);
    const setText = (sel, txt) => { const el = $(sel); if (el && txt != null) el.textContent = txt; };
    setText('#brandTop', SHOP_NAME);
    setText('#brandFoot', SHOP_NAME);
    setText('#tagline', STORE.tagline);
    setText('#shop-title', STORE.collectionTitle);
    setText('#footNote', STORE.footerNote);
    const top = $('#brandTop');
    if (top) top.setAttribute('aria-label', SHOP_NAME + ' home');
    const hero = $('#hero-title');
    if (hero) { hero.textContent = SHOP_NAME; hero.dataset.text = SHOP_NAME; }
    const promises = $('#promises');
    if (promises && Array.isArray(STORE.promises)) {
      if (!STORE.promises.length) promises.hidden = true;
      else promises.innerHTML = STORE.promises.map(x => `<div><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div>`).join('');
    }
  }

  // Shrink the big hero name if a long shop name would overflow the screen
  function fitWordmark() {
    const el = $('#hero-title');
    if (!el) return;
    el.style.fontSize = '';
    const avail = el.clientWidth, need = el.scrollWidth;
    if (avail && need > avail) {
      el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * (avail / need) * 0.97) + 'px';
    }
  }

  /* ---------- storage ---------- */
  function loadCart() {
    try {
      const raw = JSON.parse(localStorage.getItem(CART_KEY));
      const clean = {};
      if (raw && typeof raw === 'object') {
        for (const [id, q] of Object.entries(raw)) {
          if (BY_ID[id] && Number.isInteger(q) && q > 0) clean[id] = Math.min(q, 99);
        }
      }
      return clean;
    } catch (e) { return {}; }
  }
  function saveCart() { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {} }

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
    filtersEl.hidden = CATS.length <= 2;
    filtersEl.innerHTML = CATS.map(c =>
      `<button class="chip" data-cat="${esc(c)}" aria-pressed="${c === filter}">${esc(c)}</button>`).join('');
  }
  function renderGrid() {
    const list = filter === 'All' ? PRODUCTS : PRODUCTS.filter(p => p.cat === filter);
    grid.innerHTML = list.map(p => `
      <article class="card">
        <div class="tile">${visual(p)}</div>
        <div class="meta"><h3>${esc(p.name)}</h3><span class="price">${money(p.price)}</span></div>
        ${p.note ? `<p class="note">${esc(p.note)}</p>` : '<div class="note"></div>'}
        <button class="add" data-add="${esc(p.id)}" aria-label="Add ${esc(p.name)} to bag">Add to bag</button>
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
        <li class="line" data-id="${esc(id)}">
          <div class="thumb">${visual(p)}</div>
          <div>
            <h3>${esc(p.name)}</h3>
            <div class="unit">${money(p.price)} each</div>
            <div class="qty">
              <button data-dec aria-label="Decrease quantity of ${esc(p.name)}">&minus;</button>
              <span>${q}</span>
              <button data-inc aria-label="Increase quantity of ${esc(p.name)}">+</button>
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
    const active = [...filtersEl.querySelectorAll('[data-cat]')].find(x => x.dataset.cat === filter);
    if (active) active.focus();
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
  checkoutBtn.addEventListener('click', () => {
    const entries = Object.entries(cart);
    if (!entries.length) return;
    if (!/^\d{8,15}$/.test(WHATSAPP_NUMBER)) { toast('Add your WhatsApp number in config.js first.'); return; }
    const rows = entries.map(([id, q]) => `- ${q} x ${BY_ID[id].name} (${money(BY_ID[id].price * q)})`);
    const text = `Hello ${SHOP_NAME}, I'd like to order:\n${rows.join('\n')}\nTotal: ${money(subtotal())}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });
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
    if (e.key === CART_KEY) { cart = loadCart(); renderCount(); renderCart(); }
  });
  window.addEventListener('resize', fitWordmark);

  /* ---------- init ---------- */
  applyBranding();
  $('#year').textContent = new Date().getFullYear();
  renderFilters(); renderGrid(); renderCount(); renderCart();
  fitWordmark();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitWordmark);
})();
