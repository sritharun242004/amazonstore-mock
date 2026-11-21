/*
  Shopping features, working the way Amazon's do: basket, checkout, orders, lists,
  delivery location, language, the "All" menu, quick look and search suggestions.

  Concept demo: there is no sign-in and no payment form. Everything is kept in
  this browser (localStorage) so the basket and orders survive a refresh.
*/
(function () {
  const S = window.STORE;
  const { pages, titles, hooks, products, byId, esc, productSVG, price, stars, primeBadge, soldBy, parity, toast, $ } = S;

  /* ---------- state, saved in this browser ---------- */

  // app.js reads the chosen currency through STORE.currency
  Object.defineProperty(S, 'currency', { get: () => state.currency });

  const KEY = 'aesop-concept:';
  const load = (k, fallback) => {
    try { const v = localStorage.getItem(KEY + k); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  };
  const save = (k, v) => { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch { /* private mode: keep in memory */ } };

  const state = {
    cart: load('cart', []).filter(i => byId(i.id)),        // [{ id, qty, gift, sub }]
    saved: load('saved', []).filter(byId),                  // [id] saved for later
    list: load('list', []).filter(byId),                    // [id] wish list
    orders: load('orders', []),
    zip: load('zip', '75011'),
    lang: load('lang', 'EN'),
    currency: load('currency', 'EUR'),
    follow: load('follow', false),
    reviews: load('reviews', {}),                          // { [id]: { rating, title, body, name, date } }
    reviewName: load('reviewName', 'Amazon Customer'),
    addresses: load('addresses', []),                       // [{ id, name, line1, line2, zip, city, phone }]
    defaultAddr: load('defaultAddr', null),
    subs: load('subs', []).filter(s => byId(s.pid)),        // Subscribe & refill: [{ id, pid, qty, every, next, status }]
    history: load('history', []).filter(byId),              // recently viewed product ids, newest first
    historyOn: load('historyOn', true)
  };
  const persist = () => ['cart', 'saved', 'list', 'orders', 'zip', 'lang', 'currency', 'follow', 'reviews', 'reviewName',
    'addresses', 'defaultAddr', 'subs', 'history', 'historyOn'].forEach(k => save(k, state[k]));

  const eur = n => S.money(n);
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  const count = () => state.cart.reduce((n, i) => n + i.qty, 0);
  const subtotal = (lines = state.cart) => lines.reduce((s, i) => s + byId(i.id).price * i.qty, 0);
  // Like Amazon, unticked basket items stay in the basket but are left out of the subtotal and checkout
  const chosen = () => state.cart.filter(l => l.sel !== false);
  const countOf = lines => lines.reduce((n, i) => n + i.qty, 0);

  const CITIES = { '75': 'Paris', '69': 'Lyon', '13': 'Marseille', '33': 'Bordeaux', '31': 'Toulouse', '59': 'Lille',
    '06': 'Nice', '44': 'Nantes', '67': 'Strasbourg', '34': 'Montpellier', '35': 'Rennes', '92': 'Hauts-de-Seine', '94': 'Val-de-Marne' };
  const city = zip => CITIES[zip.slice(0, 2)] || 'France';
  const where = () => `${city(state.zip)} ${state.zip}`;

  const dayAfter = n => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
  const longDate = d => d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const shortDate = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const checkIcon = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#067D62"/><path d="m7 12.5 3.2 3.2L17 9" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const trashIcon = '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ---------- header: basket count, location, language, follow ---------- */

  function updateCount(bump) {
    const c = $('#basketCount');
    c.textContent = count();
    if (bump) { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); }
    updateTileButtons();
  }

  // Product cards: once an item is in the basket its button turns into a quantity stepper, as in Amazon results
  const tileQty = id => state.cart.find(l => l.id === id && !l.sub)?.qty || 0;
  function updateTileButtons() {
    document.querySelectorAll('.tile').forEach(tile => {
      const slot = tile.querySelector('.tile__body > [data-add], .tile__body > .tile-step');
      if (!slot) return;
      const id = slot.dataset.add || slot.dataset.step;
      const qty = tileQty(id);
      const p = byId(id);
      const html = qty
        ? `<div class="tile-step" data-step="${id}" role="group" aria-label="${esc(p.name)} in basket">
             <button type="button" data-step-dec="${id}" aria-label="${qty === 1 ? 'Remove from basket' : 'Decrease quantity'}">${qty === 1 ? trashIcon : '−'}</button>
             <span aria-live="polite">${qty}</span>
             <button type="button" data-step-inc="${id}" aria-label="Increase quantity" ${qty >= 10 ? 'disabled' : ''}>+</button>
           </div>`
        : `<button type="button" class="add-btn " data-add="${id}">Add to basket</button>`;
      const had = document.activeElement && slot.contains(document.activeElement) ? document.activeElement.matches('[data-step-dec]') ? 'dec' : 'inc' : '';
      if (slot.outerHTML.replace(/\s+/g, ' ') === html.replace(/\s+/g, ' ')) return;
      slot.outerHTML = html;
      if (had) (tile.querySelector(had === 'dec' ? '[data-step-dec]' : '[data-step-inc]') || tile.querySelector('[data-add]'))?.focus();
    });
  }
  function updateLocation() { document.querySelectorAll('[data-loc-label]').forEach(el => { el.textContent = where(); }); }
  function updateLang() {
    $('#langLabel').textContent = state.lang;
    document.documentElement.lang = state.lang === 'FR' ? 'fr' : 'en';
    const chip = document.querySelector('[data-lang-chip]');
    if (chip) chip.textContent = state.lang === 'FR' ? 'Français' : 'English';
    const curChip = document.querySelector('[data-cur-chip]');
    if (curChip) curChip.textContent = curLabel(state.currency);
  }
  // Amazon's wording: "€ - EUR - Euro", but "CHF - Swiss Franc" when the symbol is the code
  const curLabel = code => { const c = S.CURRENCIES[code]; return c.sym.trim() === code ? `${code} - ${c.name}` : `${c.sym.trim()} - ${code} - ${c.name}`; };
  const frFlag = '<svg viewBox="0 0 3 2" width="20" height="14" aria-hidden="true"><rect width="1" height="2" fill="#0055A4"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#EF4135"/></svg>';

  // Language: French translates the interface (js/i18n.js); going back to English reloads the page.
  // Currency: prices are redrawn in place.
  function setLang(lang) {
    if (lang === state.lang) return;
    state.lang = lang;
    persist();
    if (lang === 'EN') { location.reload(); return; }
    updateLang();
    S.i18n?.apply();
    toast('<b>Langue : français</b> Toute la boutique est désormais en français.');
  }
  function setCurrency(code) {
    if (code === state.currency || !S.CURRENCIES[code]) return;
    state.currency = code;
    persist();
    updateLang();
    const y = scrollY;
    S.render();
    scrollTo(0, y);
    toast(code === 'EUR' ? '<b>Prices in euros</b>' : `<b>Prices in ${S.CURRENCIES[code].name}s</b> Indicative rate: €1 = ${S.CURRENCIES[code].sym.trim()} ${S.CURRENCIES[code].rate}. You are still charged in euros.`);
  }
  function updateFollow() {
    const b = $('#followBtn');
    b.setAttribute('aria-pressed', state.follow);
    b.textContent = state.follow ? 'Following' : 'Follow';
  }
  function updateListButtons() {
    document.querySelectorAll('[data-list]').forEach(b => {
      const on = state.list.includes(b.dataset.list);
      b.textContent = on ? 'Added to Wish List' : 'Add to List';
      b.setAttribute('aria-pressed', on);
    });
  }

  /* ---------- basket operations ---------- */

  function addToCart(id, qty = 1, opts = {}) {
    const line = state.cart.find(i => i.id === id && !!i.sub === !!opts.sub);
    if (line) {
      line.qty = Math.min(10, line.qty + qty);
      if (opts.gift) line.gift = true;
    } else {
      state.cart.push({ id, qty: Math.min(10, qty), gift: !!opts.gift, sub: !!opts.sub });
    }
    persist();
    updateCount(true);
  }

  // Re-draw the current page in place (no scroll jump) after a basket or order change
  const live = ['cart', 'checkout', 'orders', 'lists', 'order'];
  function refresh() {
    const [route, arg, extra] = location.hash.replace(/^#\/?/, '').split('/');
    if (live.includes(route)) { $('#page').innerHTML = pages[route](arg, extra); hooks.forEach(fn => fn(route, arg)); }
  }

  /* ---------- overlay: modals, side menu, "added to basket" sheet ---------- */

  const layer = document.createElement('div');
  layer.className = 'overlay';
  layer.hidden = true;
  document.body.append(layer);
  let lastFocus = null;

  function openPanel(html, { kind = 'modal', label = 'Dialog' } = {}) {
    closeFlyout();
    lastFocus = document.activeElement;
    layer.className = `overlay overlay--${kind}`;
    layer.innerHTML = `<div class="panel panel--${kind}" role="dialog" aria-modal="true" aria-label="${esc(label)}">${html}</div>`;
    layer.hidden = false;
    document.body.classList.add('has-overlay');
    requestAnimationFrame(() => layer.classList.add('is-open'));
    const first = layer.querySelector('[autofocus]') || layer.querySelector('input, select, button, a');
    if (first) first.focus();
  }
  function closePanel(restoreFocus = true) {
    if (layer.hidden) return;
    layer.hidden = true;
    layer.classList.remove('is-open');
    layer.innerHTML = '';
    document.body.classList.remove('has-overlay');
    if (restoreFocus && lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }
  layer.addEventListener('click', e => {
    if (e.target === layer || e.target.closest('[data-close]')) closePanel();
    else if (e.target.closest('a[href^="#"]')) closePanel(false); // following a link inside closes the panel
  });

  const head = title => `<header class="panel__head"><h2>${title}</h2><button type="button" class="panel__x" data-close aria-label="Close">×</button></header>`;

  // Keep Tab inside an open dialog
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closePanel(); closeFlyout(true); return; }
    if (e.key !== 'Tab' || layer.hidden) return;
    const f = [...layer.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select, textarea')].filter(el => el.offsetParent !== null);
    if (!f.length) return;
    const [first, last] = [f[0], f[f.length - 1]];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  function openLocation() {
    openPanel(`${head('Choose your location')}
      <div class="panel__body">
        <p class="muted">Delivery options and delivery speeds may vary for different locations.</p>
        ${state.addresses.length ? `<div class="loc-addrs">${state.addresses.map(a => `<button type="button" class="loc-addr${a.id === shipTo().id ? ' is-on' : ''}" data-use-addr="${a.id}"><b>${esc(a.name)}</b> ${esc(a.line1)}, ${esc(a.zip)} ${esc(a.city)}${a.id === state.defaultAddr ? '<small>Default address</small>' : ''}</button>`).join('')}</div>` : ''}
        <a class="loc-manage" href="#/addresses">${state.addresses.length ? 'Manage address book' : 'Add an address or pick-up point'}</a>
        <form class="loc-form" data-loc-form novalidate>
          <label for="locZip">${state.addresses.length ? 'or enter a French postcode' : 'Enter a French postcode'}</label>
          <div class="loc-row">
            <input id="locZip" name="zip" inputmode="numeric" maxlength="5" value="${esc(state.zip)}" autocomplete="postal-code" autofocus>
            <button class="pill-btn" type="submit">Apply</button>
          </div>
          <p class="loc-error" role="alert" hidden>Enter a valid 5-digit French postcode, such as 75011.</p>
        </form>
        <p class="muted small">Your postcode is saved in this browser only.</p>
      </div>`, { label: 'Choose your location' });
  }

  function openMenu() {
    const link = (href, text) => `<a href="${href}">${text}</a>`;
    openPanel(`<div class="drawer">
        <div class="drawer__hello"><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><circle cx="12" cy="8" r="4.5" fill="#fff"/><path d="M3.5 21c1.2-4.6 4.6-7 8.5-7s7.3 2.4 8.5 7z" fill="#fff"/></svg> Hello, guest</div>
        <nav class="drawer__nav" aria-label="All departments">
          <h3>Aesop store</h3>
          ${link('#/', 'Store home')}${link('#/gifts', 'Gift Guide')}${link('#/hand-body', 'Hand &amp; Body')}${link('#/fragrance', 'Fragrance')}${link('#/for-the-home', 'For the home')}${link('#/ritual', 'Find your ritual')}${link('#/values', 'Our values')}
          <h3>Trending</h3>
          ${link('#/best-sellers', 'Best Sellers')}${link('#/deals', "Today's Deals")}${link('#/prime', 'Prime')}
          <h3>Help &amp; settings</h3>
          ${link('#/account', 'Your Account')}${link('#/orders', 'Your Orders')}${link('#/subscriptions', 'Your Subscribe &amp; refill')}${link('#/lists', 'Your Lists')}${link('#/history', 'Your browsing history')}${link('#/cart', 'Your Basket')}${link('#/help', 'Customer Service')}
          <button type="button" class="drawer__btn" data-open="location">Deliver to ${esc(where())}</button>
          <button type="button" class="drawer__btn" data-open="lang-menu">Language: ${state.lang === 'FR' ? 'Français' : 'English'}</button>
        </nav>
      </div>
      <button type="button" class="drawer__x" data-close aria-label="Close menu">×</button>`, { kind: 'drawer', label: 'All departments' });
  }

  // After a card's button becomes a stepper, keep keyboard focus on it
  function tileFocus(id) { document.querySelector(`.tile-step[data-step="${id}"] [data-step-inc]`)?.focus(); }

  function openAdded(p) {
    const n = count();
    openPanel(`<div class="added">
        <div class="added__row">
          <span class="added__img">${productSVG(p, { decorative: true })}</span>
          <p class="added__ok">${checkIcon} Added to basket</p>
        </div>
        <p class="added__name">${esc(p.name)}, ${esc(p.size)}</p>
        <p class="added__sub">Basket subtotal (${plural(n, 'item')}): <b>${eur(subtotal())}</b></p>
        <p class="added__free">${primeBadge} Your order qualifies for FREE delivery tomorrow.</p>
        <a class="add-btn add-btn--wide" href="#/checkout">Proceed to checkout (${plural(n, 'item')})</a>
        <a class="pill-btn pill-btn--wide" href="#/cart">Go to basket</a>
      </div>
      <button type="button" class="panel__x added__x" data-close aria-label="Close">×</button>`, { kind: 'sheet', label: 'Added to basket' });
  }

  function openQuickLook(p) {
    openPanel(`${head('Quick look')}
      <div class="ql">
        <a class="ql__img" href="#/p/${p.id}">${productSVG(p)}</a>
        <div class="ql__info">
          <p class="tile__brand">AESOP</p>
          <h3 class="ql__title"><a href="#/p/${p.id}">${esc(p.name)}, ${esc(p.size)}</a></h3>
          ${stars(p)}
          <div class="ql__price">${price(p, 'price--lg')} ${parity}</div>
          ${S.delivery()}
          ${soldBy}
          <ul class="pdp__bullets">${p.bullets.slice(0, 3).map(b => `<li>${esc(b)}</li>`).join('')}</ul>
          <div class="ql__actions">
            <label class="buybox__qty">Qty <select data-qty>${[1, 2, 3, 4, 5].map(n => `<option>${n}</option>`).join('')}</select></label>
            <button type="button" class="add-btn" data-add="${p.id}">Add to basket</button>
          </div>
          <a class="ql__more" href="#/p/${p.id}">See all details</a>
        </div>
      </div>`, { label: `Quick look: ${p.name}` });
  }

  function confirmPanel(title, text, action, cta) {
    openPanel(`${head(title)}<div class="panel__body"><p>${text}</p>
      <div class="panel__actions"><button type="button" class="pill-btn" data-close>Keep it</button>
      <button type="button" class="add-btn" data-confirm="${action}">${cta}</button></div></div>`, { label: title });
  }

  /* ---------- flyouts: Account & Lists, language ---------- */

  const fly = document.createElement('div');
  fly.className = 'flyout';
  fly.hidden = true;
  document.body.append(fly);
  let flyAnchor = null;
  let flyTimer;

  function openFlyout(anchor, html) {
    clearTimeout(flyTimer);
    if (flyAnchor === anchor && !fly.hidden) return;
    closeFlyout();
    fly.innerHTML = html;
    fly.hidden = false;
    flyAnchor = anchor;
    anchor.setAttribute('aria-expanded', 'true');
    const r = anchor.getBoundingClientRect();
    const w = fly.offsetWidth;
    fly.style.top = `${r.bottom + window.scrollY + 4}px`;
    fly.style.left = `${Math.max(8, Math.min(window.innerWidth - w - 8, r.left + r.width / 2 - w / 2))}px`;
  }
  function closeFlyout(restore) {
    if (fly.hidden) return;
    fly.hidden = true;
    if (flyAnchor) { flyAnchor.setAttribute('aria-expanded', 'false'); if (restore) flyAnchor.focus(); }
    flyAnchor = null;
  }
  const flyoutHtml = {
    account: () => `<div class="fly-acct">
        <p class="fly-acct__note"><b>Concept demo</b> There is no sign-in. Your basket, lists and orders are saved in this browser.</p>
        <div class="fly-acct__cols">
          <div><h3>Your Lists</h3><a href="#/lists">Wish List (${state.list.length})</a><a href="#/history">Browsing history</a><a href="#/best-sellers">Discover best sellers</a><a href="#/ritual">Find your ritual</a></div>
          <div><h3>Your Account</h3><a href="#/account">Your Account</a><a href="#/orders">Your Orders (${state.orders.length})</a><a href="#/subscriptions">Your Subscribe &amp; refill</a><a href="#/addresses">Your Addresses</a><a href="#/my-reviews">Your reviews</a><a href="#/help">Customer Service</a></div>
        </div>
      </div>`,
    lang: () => `<form class="fly-lang" data-lang-form aria-label="Language and currency">
        <p class="fly-lang__title">Change language</p>
        <label><input type="radio" name="lang" value="FR" ${state.lang === 'FR' ? 'checked' : ''}> français - FR</label>
        <hr>
        <label><input type="radio" name="lang" value="EN" ${state.lang === 'EN' ? 'checked' : ''}> English - EN</label>
        <hr>
        <p class="fly-lang__title">Change currency</p>
        ${Object.entries(S.CURRENCIES).map(([code, c]) => `<label><input type="radio" name="currency" value="${code}" ${state.currency === code ? 'checked' : ''}> ${curLabel(code)}</label>`).join('')}
        <a class="fly-lang__more" href="#/settings">See all</a>
        <hr>
        <p class="fly-lang__shop">${frFlag} You are shopping on Amazon.fr</p>
        <button type="button" class="linklike fly-lang__country" data-open="country">Change country/region</button>
      </form>`
  };
  fly.addEventListener('mouseenter', () => clearTimeout(flyTimer));
  fly.addEventListener('mouseleave', () => { flyTimer = setTimeout(closeFlyout, 250); });
  fly.addEventListener('click', e => { if (e.target.closest('a')) closeFlyout(); });
  document.querySelectorAll('[data-open="account"], .amz-header [data-open="lang"]').forEach(btn => {
    const kind = btn.dataset.open;
    btn.addEventListener('mouseenter', () => { if (matchMedia('(hover: hover)').matches) openFlyout(btn, flyoutHtml[kind]()); });
    btn.addEventListener('mouseleave', () => { flyTimer = setTimeout(closeFlyout, 250); });
  });
  document.addEventListener('click', e => {
    if (!fly.hidden && !fly.contains(e.target) && !e.target.closest('[data-open="account"], [data-open="lang"]')) closeFlyout();
  });

  /* ---------- search suggestions (both search boxes) ---------- */

  function attachSuggest(input) {
    const box = document.createElement('ul');
    box.className = 'suggest';
    box.id = `${input.id}-list`;
    box.setAttribute('role', 'listbox');
    box.hidden = true;
    input.closest('form').append(box);
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', box.id);
    input.setAttribute('aria-expanded', 'false');
    let items = [];
    let idx = -1;
    const mark = () => {
      [...box.children].forEach((li, i) => li.setAttribute('aria-selected', i === idx));
      input.setAttribute('aria-activedescendant', idx >= 0 ? `${box.id}-${idx}` : '');
    };
    const hide = () => { box.hidden = true; input.setAttribute('aria-expanded', 'false'); idx = -1; };
    const go = id => { hide(); input.value = ''; input.blur(); location.hash = '#/p/' + id; };
    input.addEventListener('input', () => {
      const t = input.value.trim().toLowerCase();
      items = t ? products.filter(p => `${p.name} ${p.nameEn || ''} ${p.aromaText} ${p.family || ''}`.toLowerCase().includes(t)).slice(0, 6) : [];
      if (!items.length) return hide();
      box.innerHTML = items.map((p, i) => {
        const at = p.name.toLowerCase().indexOf(t);
        const label = at >= 0 ? `${esc(p.name.slice(0, at))}<b>${esc(p.name.slice(at, at + t.length))}</b>${esc(p.name.slice(at + t.length))}` : esc(p.name);
        return `<li role="option" id="${box.id}-${i}" data-sg="${p.id}">${label}<span> in Aesop</span></li>`;
      }).join('');
      idx = -1;
      box.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    });
    input.addEventListener('keydown', e => {
      if (box.hidden) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        idx = (idx + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        mark();
      } else if (e.key === 'Enter' && idx >= 0) {
        e.preventDefault();
        go(items[idx].id);
      } else if (e.key === 'Escape') hide();
    });
    box.addEventListener('mousedown', e => { const li = e.target.closest('[data-sg]'); if (li) { e.preventDefault(); go(li.dataset.sg); } });
    input.addEventListener('blur', () => setTimeout(hide, 120));
  }
  attachSuggest($('#siteSearchInput'));
  attachSuggest($('#storeSearchInput'));

  /* ---------- full-view image viewer (product page) ---------- */

  const chevron = dir => `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="${dir < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  let viewer = null;

  function openViewer(start) {
    const tpl = document.getElementById('pdpViews');
    if (!tpl) return;
    const views = [...tpl.content.children].map(v => v.innerHTML);
    const title = document.querySelector('.pdp__title')?.textContent.trim() || 'Product images';
    const one = views.length < 2;
    openPanel(`
      ${head('Images')}
      <div class="viewer${one ? ' viewer--single' : ''}">
        <div class="viewer__stage">
          ${one ? '' : `<button type="button" class="viewer__nav viewer__nav--prev" data-viewer-step="-1" aria-label="Previous image">${chevron(-1)}</button>`}
          <div class="viewer__img" id="viewerImg"></div>
          ${one ? '' : `<button type="button" class="viewer__nav viewer__nav--next" data-viewer-step="1" aria-label="Next image">${chevron(1)}</button>`}
        </div>
        <aside class="viewer__side">
          <p class="viewer__title">${esc(title)}</p>
          <p class="viewer__count" id="viewerCount" aria-live="polite"></p>
          <div class="viewer__grid">
            ${views.map((v, n) => `<button type="button" class="viewer__thumb" data-viewer-go="${n}" aria-label="Image ${n + 1}">${v}</button>`).join('')}
          </div>
        </aside>
      </div>`, { kind: 'viewer', label: `${title}, images` });
    viewer = { views };
    showView(start);
  }

  function showView(n) {
    if (!viewer || layer.hidden) return;
    const len = viewer.views.length;
    viewer.i = ((n % len) + len) % len;
    $('#viewerImg').innerHTML = viewer.views[viewer.i];
    $('#viewerCount').textContent = `Image ${viewer.i + 1} of ${len}`;
    layer.querySelectorAll('.viewer__thumb').forEach((b, k) => b.setAttribute('aria-current', k === viewer.i));
    layer.querySelector('.viewer__thumb[aria-current="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  document.addEventListener('keydown', e => {
    if (!viewer || layer.hidden || !layer.querySelector('.viewer')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); showView(viewer.i + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); showView(viewer.i - 1); }
  });

  /* ---------- clicks ---------- */

  document.addEventListener('click', e => {
    const t = e.target;

    const opener = t.closest('[data-open]');
    if (opener) {
      const kind = opener.dataset.open;
      if (kind === 'location') { e.preventDefault(); openLocation(); return; }
      if (kind === 'menu') { e.preventDefault(); openMenu(); return; }
      if (kind === 'country') { e.preventDefault(); closeFlyout(); openCountry(); return; }
      if (kind === 'lang-menu') { e.preventDefault(); openPanel(`${head('Language settings')}<div class="panel__body">${flyoutHtml.lang()}</div>`, { label: 'Language settings' }); return; }
      if (kind === 'account' || kind === 'lang') {
        e.preventDefault();
        if (flyAnchor === opener && !fly.hidden) closeFlyout(); else openFlyout(opener, flyoutHtml[kind]());
        return;
      }
    }

    const view = t.closest('[data-viewer]');
    if (view) { e.preventDefault(); openViewer(Number(view.dataset.viewer) || 0); return; }
    const step = t.closest('[data-viewer-step]');
    if (step) { showView(viewer.i + Number(step.dataset.viewerStep)); return; }
    const go = t.closest('[data-viewer-go]');
    if (go) { showView(Number(go.dataset.viewerGo)); return; }

    const quick = t.closest('[data-quick]');
    if (quick) { e.preventDefault(); openQuickLook(byId(quick.dataset.quick)); return; }

    const add = t.closest('[data-add]');
    if (add) {
      const p = byId(add.dataset.add);
      const scope = add.closest('.buybox, .ql, .subscribe-band, .cart-saved, .order-card');
      const qty = Number(scope?.querySelector('[data-qty]')?.value || 1);
      const gift = !!scope?.querySelector('[data-gift]')?.checked;
      // Subscribe & refill applies only where that choice is on screen (product page, Hand & Body band)
      const subSelector = add.closest('.subscribe-band') ? 'input[name="sns-band"]:checked'
        : add.closest('.buybox') ? 'input[name="sns-pdp"]:checked' : '';
      const sub = subSelector ? document.querySelector(subSelector)?.value === 'sub' : false;
      // Check before adding: adding swaps a card's button for the stepper
      const inCard = !!add.closest('.tile') && !add.closest('.lists');
      addToCart(p.id, qty, { gift, sub });
      if (inCard) { tileFocus(p.id); return; }
      closePanel(false);
      openAdded(p);
      return;
    }
    const stepInc = t.closest('[data-step-inc]');
    if (stepInc) { addToCart(stepInc.dataset.stepInc, 1); return; }
    const stepDec = t.closest('[data-step-dec]');
    if (stepDec) {
      const i = state.cart.findIndex(l => l.id === stepDec.dataset.stepDec && !l.sub);
      if (i > -1) { if (state.cart[i].qty > 1) state.cart[i].qty -= 1; else state.cart.splice(i, 1); }
      persist(); updateCount(); refresh();
      return;
    }

    const buy = t.closest('[data-buy]');
    if (buy) {
      const scope = buy.closest('.buybox');
      const sub = document.querySelector('input[name="sns-pdp"]:checked')?.value === 'sub';
      addToCart(buy.dataset.buy, Number(scope?.querySelector('[data-qty]')?.value || 1), { gift: !!scope?.querySelector('[data-gift]')?.checked, sub });
      location.hash = '#/checkout';
      return;
    }

    const listBtn = t.closest('[data-list]');
    if (listBtn) {
      const id = listBtn.dataset.list;
      const on = state.list.includes(id);
      state.list = on ? state.list.filter(x => x !== id) : [...state.list, id];
      persist();
      updateListButtons();
      toast(on ? `<b>Removed from Wish List</b> ${esc(byId(id).name)}` : `<b>Added to Wish List</b> <a href="#/lists">View your list</a>`);
      refresh();
      return;
    }

    // Basket page
    const lineIdx = el => Number(el.dataset[Object.keys(el.dataset)[0]]);
    const inc = t.closest('[data-qty-inc]');
    if (inc) { const l = state.cart[lineIdx(inc)]; l.qty = Math.min(10, l.qty + 1); persist(); updateCount(); refresh(); return; }
    const dec = t.closest('[data-qty-dec]');
    if (dec) {
      const i = lineIdx(dec);
      if (state.cart[i].qty > 1) state.cart[i].qty -= 1; else state.cart.splice(i, 1);
      persist(); updateCount(); refresh(); return;
    }
    const del = t.closest('[data-del]');
    if (del) {
      const [removed] = state.cart.splice(lineIdx(del), 1);
      persist(); updateCount(); refresh();
      toast(`<b>Removed from basket</b> ${esc(byId(removed.id).name)}`);
      return;
    }
    const later = t.closest('[data-save-later]');
    if (later) {
      const [moved] = state.cart.splice(lineIdx(later), 1);
      if (!state.saved.includes(moved.id)) state.saved.push(moved.id);
      persist(); updateCount(); refresh(); return;
    }
    const move = t.closest('[data-move-cart]');
    if (move) {
      state.saved = state.saved.filter(x => x !== move.dataset.moveCart);
      addToCart(move.dataset.moveCart, 1);
      refresh(); return;
    }
    const delSaved = t.closest('[data-del-saved]');
    if (delSaved) { state.saved = state.saved.filter(x => x !== delSaved.dataset.delSaved); persist(); refresh(); return; }
    const share = t.closest('[data-share]');
    if (share) {
      const url = `${location.origin}${location.pathname}#/p/${share.dataset.share}`;
      navigator.clipboard?.writeText(url).then(() => toast('<b>Link copied</b> Paste it anywhere to share this product.'), () => toast(url));
      return;
    }
    if (t.closest('[data-checkout]')) { if (chosen().length) location.hash = '#/checkout'; return; }
    const selAll = t.closest('[data-sel-all]');
    if (selAll) { const on = selAll.dataset.selAll === 'on'; state.cart.forEach(l => { l.sel = on; }); persist(); refresh(); return; }
    const promo = t.closest('[data-promo]');
    if (promo) {
      const input = document.getElementById('promoCode'), msg = document.getElementById('promoMsg');
      const code = input.value.trim();
      msg.hidden = false;
      msg.textContent = code ? `The promotional code "${code}" is not valid. Aesop formulations are sold at the aesop.fr price, without promotional codes.` : 'Enter a gift card or promotional code.';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }

    // Checkout
    if (t.closest('[data-place-order]')) { placeOrder(); return; }

    // Orders
    const track = t.closest('[data-track]');
    if (track) { openTracking(state.orders.find(o => o.id === track.dataset.track)); return; }
    const ret = t.closest('[data-return]');
    if (ret) { openReturn(state.orders.find(o => o.id === ret.dataset.return)); return; }
    const cancel = t.closest('[data-cancel]');
    if (cancel) { confirmPanel('Cancel this order?', 'The order has not been dispatched yet, so it can still be cancelled.', `cancel:${cancel.dataset.cancel}`, 'Cancel order'); return; }
    const confirm = t.closest('[data-confirm]');
    if (confirm) {
      const [action, id] = confirm.dataset.confirm.split(':');
      if (action === 'cancel') {
        state.orders = state.orders.filter(o => o.id !== id);
        persist(); closePanel(false); refresh();
        toast('<b>Order cancelled</b> No charge was made.');
      }
        if (S.onConfirm?.(action, id)) return;
      if (action === 'review') {
        delete state.reviews[id];
        persist(); closePanel(false); S.render();
        toast('<b>Review deleted</b>');
      }
      return;
    }

    const delReview = t.closest('[data-del-review]');
    if (delReview) { confirmPanel('Delete your review?', 'Your review and star rating will be removed from this product.', `review:${delReview.dataset.delReview}`, 'Delete review'); return; }
  });

  // Follow persists between visits (app.js flips the button; this keeps the state)
  $('#followBtn').addEventListener('click', () => {
    state.follow = $('#followBtn').getAttribute('aria-pressed') === 'true';
    persist();
    toast(state.follow ? '<b>You are following Aesop</b> New arrivals will appear in your Amazon feed.' : '<b>Unfollowed Aesop</b>');
  });

  document.addEventListener('change', e => {
    const t = e.target;
    if (t.matches('[data-gift-line]')) { state.cart[Number(t.dataset.giftLine)].gift = t.checked; persist(); return; }
    if (t.matches('[data-sel-line]')) { state.cart[Number(t.dataset.selLine)].sel = t.checked; persist(); refresh(); document.querySelector(`[data-sel-line="${t.dataset.selLine}"]`)?.focus(); return; }
    if (t.matches('[data-gift-all]')) { state.cart.forEach(l => { l.gift = t.checked; }); persist(); refresh(); return; }
    if (t.closest('[data-lang-form]') && t.name === 'lang') { closeFlyout(); closePanel(false); setLang(t.value); return; }
    if (t.closest('[data-lang-form]') && t.name === 'currency') { closeFlyout(); closePanel(false); setCurrency(t.value); return; }
  });

  // Your Orders: filter the cards by product name or order number
  const filterOrders = form => {
    const q = form.q.value.trim().toLowerCase();
    let shown = 0;
    document.querySelectorAll('.orders .order-card').forEach(card => {
      const hit = !q || card.textContent.toLowerCase().includes(q);
      card.hidden = !hit; shown += hit;
    });
    document.querySelector('.orders__none').hidden = shown > 0;
  };
  document.addEventListener('input', e => { const f = e.target.closest('[data-order-search]'); if (f) filterOrders(f); });
  document.addEventListener('submit', e => { const f = e.target.closest('[data-order-search]'); if (f) { e.preventDefault(); filterOrders(f); } });

  document.addEventListener('submit', e => {
    const form = e.target.closest('[data-loc-form]');
    if (!form) return;
    e.preventDefault();
    const zip = form.zip.value.trim();
    if (!/^\d{5}$/.test(zip)) { form.querySelector('.loc-error').hidden = false; form.zip.focus(); return; }
    state.zip = zip;
    persist();
    updateLocation();
    closePanel();
    refresh();
    toast(`<b>Delivering to ${esc(where())}</b> Delivery dates are updated.`);
  });

  /* ---------- orders ---------- */

  const orderId = () => {
    const d = n => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');
    return `40${d(1)}-${d(7)}-${d(7)}`;
  };

  // The default delivery address, or the demo one until the visitor adds their own
  function shipTo() {
    const a = state.addresses.find(x => x.id === state.defaultAddr) || state.addresses[0];
    return a || { name: 'Demo customer', line1: '12 Rue de la Roquette', line2: '', zip: state.zip, city: city(state.zip), phone: '' };
  }
  const addrLines = a => [a.line1, a.line2, `${a.zip} ${a.city}`, 'France'].filter(Boolean);

  function placeOrder() {
    const lines = chosen();
    if (!lines.length) return;
    const later = document.querySelector('input[name="deliv"]:checked')?.value === 'later';
    const a = shipTo();
    const order = {
      id: orderId(),
      placed: new Date().toISOString(),
      arrive: dayAfter(later ? 3 : 1).toISOString(),
      items: lines.map(({ sel, ...l }) => ({ ...l, price: byId(l.id).price })),
      total: subtotal(lines),
      name: a.name,
      address: addrLines(a).join(', '),
      giftMessage: document.getElementById('giftMsg')?.value.trim() || '',
      speed: later ? 'Amazon Day Delivery' : 'Prime Delivery'
    };
    state.orders.unshift(order);
    // Subscribe & refill lines start a subscription, managed from Your Subscribe & refill
    lines.filter(l => l.sub).forEach(l => {
      const next = new Date(order.arrive); next.setMonth(next.getMonth() + 2);
      state.subs.unshift({ id: 'S' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), pid: l.id, qty: l.qty, every: 2, next: next.toISOString(), status: 'active', started: order.placed });
    });
    state.cart = state.cart.filter(l => l.sel === false);
    persist();
    updateCount();
    location.hash = `#/order/${order.id}/placed`;
  }

  function openTracking(o) {
    if (!o) return;
    const steps = ['Ordered', 'Dispatched', 'Out for delivery', 'Delivered'];
    openPanel(`${head('Track package')}
      <div class="panel__body">
        <p class="track__eta">Arriving <b>${longDate(new Date(o.arrive))}</b></p>
        <ol class="track" role="list">${steps.map((s, i) => `<li class="${i === 0 ? 'is-done' : ''}"><span></span>${s}${i === 0 ? `<small>${shortDate(new Date(o.placed))}</small>` : ''}</li>`).join('')}</ol>
        <p class="muted small">Order ${esc(o.id)}, shipping to ${esc(o.address)}.</p>
      </div>`, { label: 'Track package' });
  }

  function openReturn(o) {
    if (!o) return;
    openPanel(`${head('Return or replace items')}
      <form class="panel__body ret" data-return-form="${esc(o.id)}">
        <p class="muted">Choose the items to return. Aesop purchases are returnable within 30 days.</p>
        ${o.items.map((l, i) => `<label class="co-radio"><input type="checkbox" name="item" value="${i}" ${i === 0 ? 'checked' : ''}> <span><b>${esc(byId(l.id).name)}</b><small>Qty ${l.qty} · ${eur(l.price * l.qty)}</small></span></label>`).join('')}
        <label class="ret__reason">Reason
          <select name="reason"><option>Bought by mistake</option><option>No longer needed</option><option>Received as a gift, prefer another aroma</option><option>Item arrived damaged</option></select>
        </label>
        <div class="panel__actions"><button type="button" class="pill-btn" data-close>Cancel</button><button type="submit" class="add-btn">Continue</button></div>
      </form>`, { label: 'Return or replace items' });
  }
  /* ---------- customer reviews (written in this browser) ---------- */

  const reviewDate = iso => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const bought = id => state.orders.some(o => o.items.some(l => l.id === id));
  const starsOf = n => `<span class="stars" role="img" aria-label="${n} out of 5 stars"><span class="stars__fill" style="width:${n * 20}%"></span></span>`;
  const starIcon = '<svg viewBox="0 0 20 20" width="34" height="34" aria-hidden="true"><path d="M10 1.5l2.6 5.5 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L1.4 7.7l6-.7z" stroke-width="1.1" stroke-linejoin="round"/></svg>';
  const personIcon = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#D5D9D9"/><circle cx="12" cy="9.5" r="4" fill="#fff"/><path d="M4.5 19.5c1.6-3.2 4.3-4.8 7.5-4.8s5.9 1.6 7.5 4.8" fill="#fff"/></svg>';

  // Used by the product page (app.js) to show reviews written here
  S.myReview = id => state.reviews[id] || null;
  S.reviewsList = p => {
    const r = state.reviews[p.id];
    if (!r) return '';
    return `<div class="reviews__list">
      <h3>Top reviews from France</h3>
      <article class="review">
        <p class="review__who">${personIcon}<span>${esc(r.name)}</span></p>
        <p class="review__head">${starsOf(r.rating)} <b>${esc(r.title)}</b></p>
        <p class="review__meta">Reviewed in France on ${reviewDate(r.date)}${r.edited ? ' · Edited' : ''}</p>
        ${bought(p.id) ? '<p class="review__verified">Verified Purchase</p>' : ''}
        <p class="review__body">${esc(r.body).replace(/\n/g, '<br>')}</p>
        <div class="review__actions">
          <a class="pill-btn pill-btn--sm" href="#/review/${p.id}">Edit</a>
          <button type="button" class="pill-btn pill-btn--sm" data-del-review="${p.id}">Delete</button>
        </div>
      </article>
    </div>`;
  };

  pages.review = id => {
    const p = byId(id);
    if (!p) return `<section class="empty"><h1>This product is not in the store</h1><p><a href="#/">Go back to the Aesop store home</a></p></section>`;
    const r = state.reviews[id] || {};
    const err = (key, text) => `<p class="field-error" id="err-${key}" hidden><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="7.5" fill="#C40000"/><path d="M8 4v5" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><circle cx="8" cy="11.6" r="1" fill="#fff"/></svg>${text}</p>`;
    return `<section class="review-page">
      <h1>${r.rating ? 'Edit your review' : 'Create review'}</h1>
      <a class="review-page__product" href="#/p/${p.id}"><span class="review-page__img">${productSVG(p, { decorative: true })}</span><span>Aesop ${esc(p.name)}, ${esc(p.size)}</span></a>
      <form class="review-form" data-review-form="${p.id}" novalidate>
        <fieldset class="review-form__row" aria-describedby="err-rating">
          <legend>Overall rating</legend>
          <div class="star-input" data-show="${r.rating || 0}">
            ${[1, 2, 3, 4, 5].map(n => `<input class="visually-hidden" type="radio" id="rate${n}" name="rating" value="${n}"${r.rating === n ? ' checked' : ''}><label for="rate${n}" data-star="${n}" title="${n} star${n > 1 ? 's' : ''}">${starIcon}<span class="visually-hidden">${n} star${n > 1 ? 's' : ''}</span></label>`).join('')}
          </div>
          ${err('rating', 'Please select a star rating')}
        </fieldset>
        <div class="review-form__row">
          <label for="rvTitle">Add a headline</label>
          <input id="rvTitle" name="title" maxlength="100" autocomplete="off" placeholder="What's most important to know?" value="${esc(r.title || '')}" aria-describedby="err-title">
          ${err('title', 'Please enter your headline')}
        </div>
        <div class="review-form__row">
          <label for="rvBody">Add a written review</label>
          <textarea id="rvBody" name="body" rows="6" maxlength="2000" placeholder="What did you like or dislike? How did you use this product?" aria-describedby="err-body">${esc(r.body || '')}</textarea>
          ${err('body', 'Please add a written review')}
        </div>
        <div class="review-form__row">
          <label for="rvName">Choose your public name</label>
          <p class="review-form__hint" id="hint-name">This is how you'll appear to other customers</p>
          <input id="rvName" name="name" maxlength="50" autocomplete="nickname" value="${esc(r.name || state.reviewName)}" aria-describedby="hint-name">
        </div>
        <div class="review-form__actions">
          <button type="submit" class="add-btn">Submit</button>
          <a href="#/p/${p.id}/reviews">Cancel</a>
        </div>
        <p class="review-form__fine">Concept demo: your review is saved in this browser only and is not sent anywhere.</p>
      </form>
    </section>`;
  };

  // Stars light up on hover and stay on the chosen rating
  document.addEventListener('mouseover', e => {
    const star = e.target.closest('.star-input [data-star]');
    if (star) star.parentElement.dataset.show = star.dataset.star;
  });
  document.addEventListener('mouseout', e => {
    const box = e.target.closest('.star-input');
    if (box && !box.contains(e.relatedTarget)) box.dataset.show = box.querySelector('input:checked')?.value || 0;
  });
  document.addEventListener('change', e => {
    if (!e.target.matches('.star-input input')) return;
    e.target.parentElement.dataset.show = e.target.value;
    const form = e.target.form;
    form.querySelector('#err-rating').hidden = true;
  });

  document.addEventListener('submit', e => {
    const form = e.target.closest('[data-review-form]');
    if (!form) return;
    e.preventDefault();
    const id = form.dataset.reviewForm;
    const rating = Number(form.querySelector('input[name="rating"]:checked')?.value || 0);
    const title = form.title.value.trim(), body = form.body.value.trim();
    const name = form.elements.name.value.trim() || 'Amazon Customer';
    const checks = [['rating', !rating, form.querySelector('#rate1')], ['title', !title, form.title], ['body', !body, form.body]];
    checks.forEach(([key, bad, field]) => {
      form.querySelector(`#err-${key}`).hidden = !bad;
      if (key !== 'rating') field.setAttribute('aria-invalid', bad);
    });
    const firstBad = checks.find(c => c[1]);
    if (firstBad) { firstBad[2].focus(); return; }
    const old = state.reviews[id];
    state.reviews[id] = { rating, title, body, name, date: old?.date || new Date().toISOString(), edited: !!old };
    state.reviewName = name;
    persist();
    location.hash = `#/p/${id}/reviews`;
    toast(old ? '<b>Review updated</b>' : '<b>Review submitted, thank you!</b> It now appears under Customer reviews.');
  });

  document.addEventListener('submit', e => {
    const form = e.target.closest('[data-return-form]');
    if (!form) return;
    e.preventDefault();
    const o = state.orders.find(x => x.id === form.dataset.returnForm);
    const picked = [...form.querySelectorAll('input[name="item"]:checked')].map(i => Number(i.value));
    if (!picked.length) { toast('<b>Choose at least one item</b> to return.'); return; }
    o.returned = { items: picked, reason: form.reason.value, code: Math.random().toString(36).slice(2, 8).toUpperCase() };
    persist();
    closePanel(false);
    refresh();
    toast(`<b>Return started</b> Drop-off code ${o.returned.code}. Refund after the item reaches us.`);
  });

  /* ---------- pages ---------- */

  const cartLine = (l, i) => {
    const p = byId(l.id);
    return `<div class="cart-item${l.sel === false ? ' cart-item--off' : ''}">
      <label class="cart-item__sel"><input type="checkbox" data-sel-line="${i}" ${l.sel === false ? '' : 'checked'}><span class="visually-hidden">Include ${esc(p.name)} in checkout</span></label>
      <a class="cart-item__img" href="#/p/${p.id}">${productSVG(p, { decorative: true })}</a>
      <div class="cart-item__body">
        <h2 class="cart-item__name"><a href="#/p/${p.id}">Aesop ${esc(p.name)}, ${esc(p.size)}</a></h2>
        <p class="cart-item__stock">In stock</p>
        <p class="delivery">${primeBadge} <span class="small">FREE delivery <b>tomorrow</b></span></p>
        ${soldBy}
        ${l.sub ? '<p class="cart-item__sub">Subscribe &amp; refill: a 500 mL refill every 2 months</p>' : ''}
        <label class="cart-item__gift"><input type="checkbox" data-gift-line="${i}" ${l.gift ? 'checked' : ''}> This will be a gift</label>
        <div class="cart-item__actions">
          <div class="stepper">
            <button type="button" data-qty-dec="${i}" aria-label="${l.qty === 1 ? 'Delete' : 'Decrease quantity'}">${l.qty === 1 ? trashIcon : '−'}</button>
            <span aria-label="Quantity ${l.qty}">${l.qty}</span>
            <button type="button" data-qty-inc="${i}" aria-label="Increase quantity" ${l.qty >= 10 ? 'disabled' : ''}>+</button>
          </div>
          <button type="button" class="linklike" data-del="${i}">Delete</button>
          <button type="button" class="linklike" data-save-later="${i}">Save for later</button>
          <button type="button" class="linklike" data-share="${p.id}">Share</button>
        </div>
      </div>
      <div class="cart-item__price">${price(p)}</div>
    </div>`;
  };

  pages.cart = () => {
    const sel = chosen(), n = countOf(sel);
    const anyGift = state.cart.some(l => l.gift);
    const subText = sel.length ? `Subtotal (${plural(n, 'item')}): <b>${eur(subtotal(sel))}</b>` : 'No items selected';
    const main = state.cart.length
      ? `<h1 class="cart__title">Shopping Basket</h1>
         <p class="cart__selall">${sel.length === state.cart.length
           ? '<button type="button" class="linklike" data-sel-all="off">Deselect all items</button>'
           : '<button type="button" class="linklike" data-sel-all="on">Select all items</button>'}</p>
         <p class="cart__pricehead">Price</p>
         ${state.cart.map(cartLine).join('')}
         <p class="cart__subtotal">${subText}</p>`
      : `<div class="cart-empty">
           <h1>Your Amazon Basket is empty</h1>
           <p>Nothing here yet. Start with the formulations our customers come back to most.</p>
           <a class="add-btn" href="#/best-sellers">Shop best sellers</a>
         </div>`;
    const box = state.cart.length
      ? `<aside class="cart-box">
           <p class="cart-box__free">${primeBadge} Your order qualifies for FREE delivery tomorrow.</p>
           <p class="cart-box__sub">${subText}</p>
           <label class="cart-box__gift"><input type="checkbox" data-gift-all ${anyGift ? 'checked' : ''}> This order contains a gift</label>
           <button type="button" class="add-btn add-btn--wide" data-checkout ${sel.length ? '' : 'disabled'}>Proceed to checkout</button>
           ${sel.length ? '' : '<p class="muted small">Tick the items you want to buy now.</p>'}
         </aside>`
      : '';
    const saved = state.saved.length
      ? `<section class="cart-saved">
           <h2>Saved for later (${plural(state.saved.length, 'item')})</h2>
           <div class="saved-grid">${state.saved.map(id => { const p = byId(id); return `<article class="saved-card">
             <a class="saved-card__img" href="#/p/${id}">${productSVG(p, { decorative: true })}</a>
             <a class="saved-card__name" href="#/p/${id}">${esc(p.name)}</a>
             ${price(p)}
             <button type="button" class="pill-btn" data-move-cart="${id}">Move to basket</button>
             <button type="button" class="linklike" data-del-saved="${id}">Delete</button>
           </article>`; }).join('')}</div>
         </section>`
      : '';
    const suggest = products.filter(p => !state.cart.some(l => l.id === p.id)).sort((a, b) => b.reviews - a.reviews).slice(0, 10);
    return `<section class="cart ${state.cart.length ? '' : 'cart--empty'}"><div class="cart__main">${main}</div>${box}</section>
      ${saved}
      ${S.carousel(suggest, state.cart.length ? 'Customers who bought items in your basket also bought' : 'Best sellers in the Aesop store')}`;
  };

  pages.checkout = () => {
    const lines = chosen();
    if (!lines.length) {
      return `<section class="cart-empty cart-empty--page"><h1>${state.cart.length ? 'No items selected' : 'Your basket is empty'}</h1><p>${state.cart.length ? 'Tick the items you want to buy in your basket.' : 'Add something to your basket to check out.'}</p><a class="add-btn" href="${state.cart.length ? '#/cart' : '#/'}">${state.cart.length ? 'Go to basket' : 'Continue shopping'}</a></section>`;
    }
    const n = countOf(lines);
    const a = shipTo();
    const anyGift = lines.some(l => l.gift);
    const t1 = longDate(dayAfter(1));
    const t3 = longDate(dayAfter(3));
    return `<section class="checkout">
      <div class="checkout__main">
        <h1 class="checkout__title">Checkout (${plural(n, 'item')})</h1>
        <section class="co-step">
          <h2><span>1</span>Delivery address</h2>
          <div class="co-step__body">
            <p><b>${esc(a.name)}</b><br>${addrLines(a).map(esc).join('<br>')}${a.phone ? `<br><span class="muted">Phone: ${esc(a.phone)}</span>` : ''}</p>
            <button type="button" class="linklike" data-open="addresses">Change</button>
          </div>
        </section>
        <section class="co-step">
          <h2><span>2</span>Payment method</h2>
          <div class="co-step__body co-step__body--col">
            <label class="co-radio"><input type="radio" name="pay" checked> <span><b>Pay on delivery (demo)</b><small>Concept demo: no payment details are collected and nothing is charged.</small></span></label>
            <div class="co-promo">
              <label for="promoCode">Add a gift card or promotion code or voucher</label>
              <div class="loc-row"><input id="promoCode" placeholder="Enter code" autocomplete="off" aria-describedby="promoMsg"><button type="button" class="pill-btn" data-promo>Apply</button></div>
              <p class="loc-error" id="promoMsg" role="alert" hidden></p>
            </div>
          </div>
        </section>
        <section class="co-step">
          <h2><span>3</span>Review items and delivery</h2>
          <div class="co-step__body co-step__body--col">
            <div class="co-items">${lines.map(l => { const p = byId(l.id); return `<div class="co-item">
              <span class="co-item__img">${productSVG(p, { decorative: true })}</span>
              <div><p class="co-item__name">Aesop ${esc(p.name)}, ${esc(p.size)}</p>
              <p>${price(p, 'price--sm')} <span class="muted">· Qty ${l.qty}</span></p>
              ${soldBy}
              ${l.gift ? '<p class="co-item__tag">Gift options added</p>' : ''}${l.sub ? '<p class="co-item__tag">Subscribe &amp; refill every 2 months</p>' : ''}</div>
            </div>`; }).join('')}</div>
            <fieldset class="co-delivery">
              <legend>Choose a delivery option:</legend>
              <label class="co-radio"><input type="radio" name="deliv" value="tomorrow" checked> <span><b class="co-green">${t1}</b><small>FREE Prime Delivery</small></span></label>
              <label class="co-radio"><input type="radio" name="deliv" value="later"> <span><b>${t3}</b><small>FREE Amazon Day Delivery: fewer boxes, fewer trips</small></span></label>
            </fieldset>
            ${anyGift ? `<div class="co-gift">
              <label for="giftMsg">Gift message <span class="muted">(optional)</span></label>
              <textarea id="giftMsg" rows="3" maxlength="240" placeholder="Happy holidays! Enjoy your new ritual."></textarea>
              <p class="muted small">Printed on a card in the parcel. Prices are hidden on the packing slip.</p>
            </div>` : ''}
          </div>
        </section>
      </div>
      <aside class="co-summary">
        <button type="button" class="add-btn add-btn--wide" data-place-order>Place your order</button>
        <p class="co-summary__fine">Concept demo: your order is saved in this browser only. Nothing is shipped or charged.</p>
        <h2>Order Summary</h2>
        <dl>
          <div><dt>Items:</dt><dd>${eur(subtotal(lines))}</dd></div>
          <div><dt>Delivery:</dt><dd>${eur(0)}</dd></div>
          <div class="co-total"><dt>Order Total:</dt><dd>${eur(subtotal(lines))}</dd></div>
        </dl>
      </aside>
    </section>`;
  };

  pages.order = (id, extra) => {
    const o = state.orders.find(x => x.id === id);
    if (!o) return `<section class="cart-empty cart-empty--page"><h1>Order not found</h1><p><a href="#/orders">See your orders</a></p></section>`;
    if (extra !== 'placed') return orderDetails(o);
    return `<section class="thanks">
      <div class="thanks__box">
        <p class="thanks__ok">${checkIcon} Order placed, thank you!</p>
        <p>Your order <b>${esc(o.id)}</b> will arrive <b class="co-green">${longDate(new Date(o.arrive))}</b>.</p>
        <p class="muted">Shipping to ${esc(o.name || 'Demo customer')}, ${esc(o.address)}.</p>
        <div class="thanks__items">${o.items.map(l => `<a href="#/p/${l.id}" class="thanks__thumb" aria-label="${esc(byId(l.id).name)}">${productSVG(byId(l.id), { decorative: true })}</a>`).join('')}</div>
        <p class="thanks__links"><a href="#/order/${o.id}">View order details</a> · <a href="#/orders">Review or edit your recent orders</a>${o.items.some(l => l.sub) ? ' · <a href="#/subscriptions">Manage your Subscribe &amp; refill</a>' : ''}</p>
      </div>
    </section>
    ${S.carousel(products.filter(p => p.gift).slice(0, 10), 'Gifts customers add to their next order')}`;
  };

  function orderDetails(o) {
    const items = o.items.reduce((n, l) => n + l.qty, 0);
    return `<section class="orders">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#/account">Your Account</a> › <a href="#/orders">Your Orders</a> › Order Details</nav>
      <h1 class="orders__title">Order Details</h1>
      <p class="od-meta">Ordered on ${shortDate(new Date(o.placed))} <span aria-hidden="true">|</span> Order# ${esc(o.id)} <span aria-hidden="true">|</span> <a href="#/invoice/${o.id}">View or print invoice</a></p>
      <div class="od-box">
        <div><h2>Delivery address</h2><p>${esc(o.name || 'Demo customer')}<br>${esc(o.address).split(', ').join('<br>')}</p></div>
        <div><h2>Payment method</h2><p>Pay on delivery (demo)</p></div>
        <div><h2>Order Summary</h2><dl class="od-sum">
          <div><dt>Item(s) subtotal:</dt><dd>${eur(o.total)}</dd></div>
          <div><dt>Postage &amp; packing:</dt><dd>${eur(0)}</dd></div>
          <div class="co-total"><dt>Grand Total:</dt><dd>${eur(o.total)}</dd></div></dl></div>
      </div>
      ${orderCard(o)}
      ${o.giftMessage ? `<p class="od-gift"><b>Gift message:</b> ${esc(o.giftMessage)}</p>` : ''}
      <p class="muted small">${plural(items, 'item')} · ${esc(o.speed || 'Prime Delivery')}</p>
    </section>`;
  }

  const orderCard = o => `<article class="order-card">
    <header class="order-card__head">
      <div><small>Order placed</small>${shortDate(new Date(o.placed))}</div>
      <div><small>Total</small>${eur(o.total)}</div>
      <div><small>Dispatch to</small>${esc(o.name || 'Demo customer')}</div>
      <div class="order-card__id"><small>Order # ${esc(o.id)}</small><span><a href="#/order/${o.id}">View order details</a> <span aria-hidden="true">|</span> <a href="#/invoice/${o.id}">Invoice</a></span></div>
    </header>
    <div class="order-card__body">
      <div class="order-card__items">
        <p class="order-card__status">${o.returned ? `Return started · drop-off code ${esc(o.returned.code)}` : `Arriving ${longDate(new Date(o.arrive))}`}</p>
        ${o.items.map(l => { const p = byId(l.id); return `<div class="order-item">
          <a class="order-item__img" href="#/p/${p.id}">${productSVG(p, { decorative: true })}</a>
          <div><a class="order-item__name" href="#/p/${p.id}">Aesop ${esc(p.name)}, ${esc(p.size)}</a>
          <p class="muted small">Qty ${l.qty}${l.gift ? ' · Gift' : ''}${l.sub ? ' · Subscribe &amp; refill' : ''}</p>
          <div class="order-item__btns"><button type="button" class="add-btn add-btn--sm" data-add="${p.id}">Buy it again</button>
          <a class="pill-btn pill-btn--sm" href="#/p/${p.id}">View your item</a></div></div>
        </div>`; }).join('')}
      </div>
      <div class="order-card__actions">
        <button type="button" class="add-btn add-btn--wide" data-track="${o.id}">Track package</button>
        <button type="button" class="pill-btn pill-btn--wide" data-return="${o.id}" ${o.returned ? 'disabled' : ''}>${o.returned ? 'Return started' : 'Return or replace items'}</button>
        <button type="button" class="pill-btn pill-btn--wide" data-cancel="${o.id}">Cancel order</button>
        <a class="pill-btn pill-btn--wide" href="#/review/${o.items[0].id}">Write a product review</a>
      </div>
    </div>
  </article>`;

  pages.orders = () => `<section class="orders">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#/account">Your Account</a> › Your Orders</nav>
      <div class="orders__top"><h1 class="orders__title">Your Orders</h1>
        ${state.orders.length ? `<form class="orders__search" data-order-search role="search"><input type="search" name="q" placeholder="Search all orders" aria-label="Search all orders"><button class="dark-btn" type="submit">Search Orders</button></form>` : ''}</div>
      <p class="orders__count"><b>${plural(state.orders.length, 'order')}</b> placed in this browser</p>
      <p class="orders__none muted" hidden>No orders match your search.</p>
      ${state.orders.length ? state.orders.map(orderCard).join('') :
        `<div class="cart-empty"><h2>You haven't placed any orders yet</h2><p>Orders you place in this concept appear here, with tracking and returns.</p><a class="add-btn" href="#/">Start shopping</a></div>`}
    </section>
    ${state.orders.length ? S.carousel([...new Map(state.orders.flatMap(o => o.items).map(l => [l.id, byId(l.id)])).values()], 'Buy again') : ''}`;

  pages.lists = () => `<section class="lists">
      <h1 class="orders__title">Wish List</h1>
      <p class="orders__count">${plural(state.list.length, 'item')} · Private · Kept in this browser</p>
      ${state.list.length ? `<div class="grid">${state.list.map(id => {
        const p = byId(id);
        return S.tile(p).replace('</article>', `<button type="button" class="linklike lists__remove" data-list="${id}">Remove from list</button></article>`);
      }).join('')}</div>` :
        `<div class="cart-empty"><h2>Your Wish List is empty</h2><p>Use <b>Add to List</b> on any product page to save it here.</p><a class="add-btn" href="#/best-sellers">Browse best sellers</a></div>`}
    </section>`;

  pages['best-sellers'] = () => {
    const ranked = [...products].sort((a, b) => b.reviews - a.reviews);
    return `<section class="list-head"><h1>Best Sellers in Aesop</h1><p>Our most popular formulations, ranked by customer ratings. Updated hourly.</p></section>
      <section class="block"><div class="grid">${ranked.map((p, i) => S.tile(p).replace('<article class="tile">', `<article class="tile tile--ranked"><span class="rank">#${i + 1}</span>`)).join('')}</div></section>`;
  };

  pages.deals = () => {
    const picks = products.filter(p => p.cat === 'gift' || p.refill || p.shape === 'kit');
    return `<section class="list-head list-head--deals">
        <h1>Today's Deals</h1>
        <p><b>There are no Aesop deals, and there won't be.</b> Every formulation in this store is sold by Amazon at the aesop.fr price, every day. Instead of discounts, Aesop offers refills and gift sets that give more for the same price.</p>
      </section>
      <section class="block"><div class="block__head"><h2 class="block__title">Refills and gift sets</h2></div>${S.grid(picks, { prime: true })}</section>`;
  };

  pages.prime = () => `<section class="list-head list-head--prime">
      <p class="list-head__prime">${primeBadge}</p>
      <h1>FREE delivery tomorrow on every Aesop formulation</h1>
      <ul class="prime-perks">
        <li><b>Fast, free delivery</b>Order by 23:59 for delivery tomorrow, at no extra cost.</li>
        <li><b>Gift-ready</b>Add gift options and hide prices on the packing slip.</li>
        <li><b>Easy returns</b>Return any Aesop purchase within 30 days.</li>
      </ul>
    </section>
    <section class="block"><div class="block__head"><h2 class="block__title">Prime-eligible Aesop formulations</h2></div>${S.grid(products, { prime: true })}</section>`;

  pages.help = () => {
    const faq = [
      ['Is everything sold here authentic?', 'Yes. Every unit ships from and is sold by Amazon, with a Transparency code that proves it came from Aesop and was stored correctly.'],
      ['Why is the price the same as aesop.fr?', 'Aesop sells at one price everywhere. You pay the aesop.fr price here, not the higher prices some resellers charge.'],
      ['When will my order arrive?', 'Prime orders placed before 23:59 arrive the next day. You can also choose Amazon Day Delivery at checkout to group your parcels.'],
      ['How does Subscribe & refill work?', 'Choose Subscribe & refill on a hand wash and a 500 mL refill arrives every two months. Skip, change or cancel any time from Your Subscribe & refill.'],
      ['How do I return an item?', 'Go to Your Orders, choose Return or replace items, and follow the steps. Aesop purchases are returnable within 30 days.'],
      ['Can I send a gift?', 'Yes. Tick "This will be a gift" in your basket to add a message and hide the price on the packing slip.']
    ];
    return `<section class="list-head"><h1>Hello. What can we help you with?</h1></section>
      <section class="help-cards">
        <a class="help-card" href="#/orders"><b>Your Orders</b><span>Track packages, return items, buy again</span></a>
        <a class="help-card" href="#/cart"><b>Your Basket</b><span>Change quantities, save for later</span></a>
        <a class="help-card" href="#/lists"><b>Your Lists</b><span>Products you saved for later</span></a>
        <button type="button" class="help-card" data-open="location"><b>Delivery address</b><span>Deliver to <span data-loc-label>${esc(where())}</span></span></button>
      </section>
      <section class="faq"><h2 class="block__title">Frequently asked questions</h2>
        ${faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}
      </section>`;
  };

  pages.settings = () => `<section class="acct acct--settings">
      <form class="settings" data-settings-form>
        <div class="settings__grid">
          <fieldset class="settings__block">
            <legend>Language settings</legend>
            <p>Select the language you prefer for browsing and shopping.</p>
            <label class="co-radio"><input type="radio" name="lang" value="FR" ${state.lang === 'FR' ? 'checked' : ''}> <span>français - FR</span></label>
            <hr>
            <label class="co-radio"><input type="radio" name="lang" value="EN" ${state.lang === 'EN' ? 'checked' : ''}> <span>English - EN</span></label>
          </fieldset>
          <aside class="settings__note"><h2>Translation</h2><p>Français shows the whole store in French, including product names and descriptions. Where aesop.fr has no French name, the concept provides its own translation.</p></aside>
        </div>
        <fieldset class="settings__block">
          <legend>Currency settings</legend>
          <p>Select the currency you want to shop with.</p>
          ${Object.entries(S.CURRENCIES).map(([code, c]) => `<label class="co-radio"><input type="radio" name="currency" value="${code}" ${state.currency === code ? 'checked' : ''}> <span>${curLabel(code)}${code === 'EUR' ? ' (Default)' : ''}</span></label>`).join('')}
          <p class="muted small">Other currencies use indicative exchange rates. Orders are always charged in euros.</p>
        </fieldset>
        <div class="settings__actions"><a class="pill-btn" href="#/">Cancel</a><button type="submit" class="add-btn">Save changes</button></div>
      </form>
    </section>`;

  document.addEventListener('submit', e => {
    const form = e.target.closest('[data-settings-form]');
    if (!form) return;
    e.preventDefault();
    const lang = form.lang.value, code = form.currency.value;
    if (code !== state.currency) { state.currency = code; persist(); updateLang(); }
    if (lang !== state.lang) {
      state.lang = lang; persist();
      if (lang === 'EN') { location.hash = '#/'; location.reload(); return; }
      updateLang(); S.i18n?.apply();
    }
    location.hash = '#/';
    toast(state.lang === 'FR' ? '<b>Paramètres enregistrés</b>' : '<b>Settings saved</b>');
  });

  function openCountry() {
    openPanel(`${head('Website (Country/Region)')}<div class="panel__body">
        <p>Select your preferred country/region website.</p>
        <label class="loc-form"><span class="visually-hidden">Country/region</span>
          <select class="settings__select" disabled><option>France (Amazon.fr)</option></select></label>
        <p class="muted small">This concept exists only for Amazon.fr, where the Aesop store would launch first.</p>
        <div class="panel__actions"><button type="button" class="add-btn" data-close>Go to website</button></div>
      </div>`, { label: 'Choose a country or region' });
  }

  Object.assign(titles, {
    settings: 'Language settings',
    cart: 'Amazon.fr Shopping Basket', checkout: 'Amazon.fr Checkout', order: 'Thank you for your order',
    orders: 'Your Orders', lists: 'Your Wish List', 'best-sellers': 'Best Sellers in Aesop',
    deals: "Today's Deals", prime: 'Prime delivery', help: 'Customer Service', review: 'Create review'
  });

  /* ---------- after every render ---------- */

  function afterRender() {
    updateLocation();
    updateListButtons();
    updateTileButtons();
  }

  // Shared with account.js and browse.js
  S.shop = { state, persist, refresh, live, openPanel, closePanel, confirmPanel, head, eur, plural, count, countOf, chosen,
    subtotal, addToCart, updateCount, updateLocation, where, city, dayAfter, longDate, shortDate, shipTo, addrLines,
    checkIcon, trashIcon, openAdded, toast };
  hooks.push(afterRender);

  updateCount();
  updateLocation();
  updateLang();
  updateFollow();
})();
