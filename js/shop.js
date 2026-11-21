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
    follow: load('follow', false)
  };
  const persist = () => ['cart', 'saved', 'list', 'orders', 'zip', 'lang', 'follow'].forEach(k => save(k, state[k]));

  const eur = n => '€' + n.toFixed(2);
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  const count = () => state.cart.reduce((n, i) => n + i.qty, 0);
  const subtotal = (lines = state.cart) => lines.reduce((s, i) => s + byId(i.id).price * i.qty, 0);

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
  }
  function updateLocation() { document.querySelectorAll('[data-loc-label]').forEach(el => { el.textContent = where(); }); }
  function updateLang() { $('#langLabel').textContent = state.lang; }
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
    const [route, arg] = location.hash.replace(/^#\/?/, '').split('/');
    if (live.includes(route)) { $('#page').innerHTML = pages[route](arg); afterRender(route); }
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
        <form class="loc-form" data-loc-form novalidate>
          <label for="locZip">Enter a French postcode</label>
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
          ${link('#/orders', 'Your Orders')}${link('#/lists', 'Your Lists')}${link('#/cart', 'Your Basket')}${link('#/help', 'Customer Service')}
          <button type="button" class="drawer__btn" data-open="location">Deliver to ${esc(where())}</button>
          <button type="button" class="drawer__btn" data-open="lang-menu">Language: ${state.lang === 'FR' ? 'Français' : 'English'}</button>
        </nav>
      </div>
      <button type="button" class="drawer__x" data-close aria-label="Close menu">×</button>`, { kind: 'drawer', label: 'All departments' });
  }

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
          <div><h3>Your Lists</h3><a href="#/lists">Wish List (${state.list.length})</a><a href="#/best-sellers">Discover best sellers</a><a href="#/ritual">Find your ritual</a></div>
          <div><h3>Your Account</h3><a href="#/orders">Your Orders (${state.orders.length})</a><a href="#/cart">Your Basket (${count()})</a><a href="#/hand-body/refill">Subscribe &amp; refill</a><a href="#/help">Customer Service</a></div>
        </div>
      </div>`,
    lang: () => `<form class="fly-lang" data-lang-form>
        <p class="fly-lang__title">Change language</p>
        <label><input type="radio" name="lang" value="FR" ${state.lang === 'FR' ? 'checked' : ''}> Français - FR</label>
        <label><input type="radio" name="lang" value="EN" ${state.lang === 'EN' ? 'checked' : ''}> English - EN</label>
        <p class="muted small">The concept is written in English for the class pitch.</p>
        <p class="fly-lang__title">Currency</p>
        <p class="small">€ - EUR - Euro</p>
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
      items = t ? products.filter(p => `${p.name} ${p.aromaText} ${p.family || ''}`.toLowerCase().includes(t)).slice(0, 6) : [];
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

  /* ---------- clicks ---------- */

  document.addEventListener('click', e => {
    const t = e.target;

    const opener = t.closest('[data-open]');
    if (opener) {
      const kind = opener.dataset.open;
      if (kind === 'location') { e.preventDefault(); openLocation(); return; }
      if (kind === 'menu') { e.preventDefault(); openMenu(); return; }
      if (kind === 'lang-menu') { e.preventDefault(); openPanel(`${head('Language settings')}<div class="panel__body">${flyoutHtml.lang()}</div>`, { label: 'Language settings' }); return; }
      if (kind === 'account' || kind === 'lang') {
        e.preventDefault();
        if (flyAnchor === opener && !fly.hidden) closeFlyout(); else openFlyout(opener, flyoutHtml[kind]());
        return;
      }
    }

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
      addToCart(p.id, qty, { gift, sub });
      closePanel(false);
      openAdded(p);
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
    if (t.closest('[data-checkout]')) { location.hash = '#/checkout'; return; }

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
      return;
    }

    if (t.closest('[data-write-review]')) {
      toast('<b>Reviews open at launch</b> Customers can review once the official store is live.');
      return;
    }
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
    if (t.matches('[data-gift-all]')) { state.cart.forEach(l => { l.gift = t.checked; }); persist(); refresh(); return; }
    if (t.closest('[data-lang-form]') && t.name === 'lang') {
      state.lang = t.value;
      persist();
      updateLang();
      toast(t.value === 'FR' ? '<b>Langue : Français</b> The concept itself stays in English for the pitch.' : '<b>Language: English</b>');
    }
  });

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

  function placeOrder() {
    if (!state.cart.length) return;
    const later = document.querySelector('input[name="deliv"]:checked')?.value === 'later';
    const order = {
      id: orderId(),
      placed: new Date().toISOString(),
      arrive: dayAfter(later ? 3 : 1).toISOString(),
      items: state.cart.map(l => ({ ...l, price: byId(l.id).price })),
      total: subtotal(),
      address: `12 Rue de la Roquette, ${where()}`
    };
    state.orders.unshift(order);
    state.cart = [];
    persist();
    updateCount();
    location.hash = `#/order/${order.id}`;
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
    return `<div class="cart-item">
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
    const n = count();
    const anyGift = state.cart.some(l => l.gift);
    const main = state.cart.length
      ? `<h1 class="cart__title">Shopping Basket</h1>
         <p class="cart__pricehead">Price</p>
         ${state.cart.map(cartLine).join('')}
         <p class="cart__subtotal">Subtotal (${plural(n, 'item')}): <b>${eur(subtotal())}</b></p>`
      : `<div class="cart-empty">
           <h1>Your Amazon Basket is empty</h1>
           <p>Nothing here yet. Start with the formulations our customers come back to most.</p>
           <a class="add-btn" href="#/best-sellers">Shop best sellers</a>
         </div>`;
    const box = state.cart.length
      ? `<aside class="cart-box">
           <p class="cart-box__free">${primeBadge} Your order qualifies for FREE delivery tomorrow.</p>
           <p class="cart-box__sub">Subtotal (${plural(n, 'item')}): <b>${eur(subtotal())}</b></p>
           <label class="cart-box__gift"><input type="checkbox" data-gift-all ${anyGift ? 'checked' : ''}> This order contains a gift</label>
           <button type="button" class="add-btn add-btn--wide" data-checkout>Proceed to checkout</button>
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
    if (!state.cart.length) {
      return `<section class="cart-empty cart-empty--page"><h1>Your basket is empty</h1><p>Add something to your basket to check out.</p><a class="add-btn" href="#/">Continue shopping</a></section>`;
    }
    const n = count();
    const t1 = longDate(dayAfter(1));
    const t3 = longDate(dayAfter(3));
    return `<section class="checkout">
      <div class="checkout__main">
        <h1 class="checkout__title">Checkout (${plural(n, 'item')})</h1>
        <section class="co-step">
          <h2><span>1</span>Delivery address</h2>
          <div class="co-step__body">
            <p><b>Demo customer</b><br>12 Rue de la Roquette<br><span data-loc-label>${esc(where())}</span>, France</p>
            <button type="button" class="linklike" data-open="location">Change</button>
          </div>
        </section>
        <section class="co-step">
          <h2><span>2</span>Payment method</h2>
          <div class="co-step__body co-step__body--col">
            <label class="co-radio"><input type="radio" name="pay" checked> <span><b>Pay on delivery (demo)</b><small>Concept demo: no payment details are collected and nothing is charged.</small></span></label>
          </div>
        </section>
        <section class="co-step">
          <h2><span>3</span>Review items and delivery</h2>
          <div class="co-step__body co-step__body--col">
            <div class="co-items">${state.cart.map(l => { const p = byId(l.id); return `<div class="co-item">
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
          </div>
        </section>
      </div>
      <aside class="co-summary">
        <button type="button" class="add-btn add-btn--wide" data-place-order>Place your order</button>
        <p class="co-summary__fine">Concept demo: your order is saved in this browser only. Nothing is shipped or charged.</p>
        <h2>Order Summary</h2>
        <dl>
          <div><dt>Items:</dt><dd>${eur(subtotal())}</dd></div>
          <div><dt>Delivery:</dt><dd>${eur(0)}</dd></div>
          <div class="co-total"><dt>Order Total:</dt><dd>${eur(subtotal())}</dd></div>
        </dl>
      </aside>
    </section>`;
  };

  pages.order = id => {
    const o = state.orders.find(x => x.id === id);
    if (!o) return `<section class="cart-empty cart-empty--page"><h1>Order not found</h1><p><a href="#/orders">See your orders</a></p></section>`;
    return `<section class="thanks">
      <div class="thanks__box">
        <p class="thanks__ok">${checkIcon} Order placed, thank you!</p>
        <p>Your order <b>${esc(o.id)}</b> will arrive <b class="co-green">${longDate(new Date(o.arrive))}</b>.</p>
        <p class="muted">Shipping to Demo customer, ${esc(o.address)}.</p>
        <div class="thanks__items">${o.items.map(l => `<a href="#/p/${l.id}" class="thanks__thumb" aria-label="${esc(byId(l.id).name)}">${productSVG(byId(l.id), { decorative: true })}</a>`).join('')}</div>
        <a class="linklike" href="#/orders">Review or edit your recent orders</a>
      </div>
    </section>
    ${S.carousel(products.filter(p => p.gift).slice(0, 10), 'Gifts customers add to their next order')}`;
  };

  const orderCard = o => `<article class="order-card">
    <header class="order-card__head">
      <div><small>Order placed</small>${shortDate(new Date(o.placed))}</div>
      <div><small>Total</small>${eur(o.total)}</div>
      <div><small>Dispatch to</small>Demo customer</div>
      <div class="order-card__id"><small>Order # ${esc(o.id)}</small><a href="#/order/${o.id}">View order details</a></div>
    </header>
    <div class="order-card__body">
      <div class="order-card__items">
        <p class="order-card__status">${o.returned ? `Return started · drop-off code ${esc(o.returned.code)}` : `Arriving ${longDate(new Date(o.arrive))}`}</p>
        ${o.items.map(l => { const p = byId(l.id); return `<div class="order-item">
          <a class="order-item__img" href="#/p/${p.id}">${productSVG(p, { decorative: true })}</a>
          <div><a class="order-item__name" href="#/p/${p.id}">Aesop ${esc(p.name)}, ${esc(p.size)}</a>
          <p class="muted small">Qty ${l.qty}${l.gift ? ' · Gift' : ''}${l.sub ? ' · Subscribe &amp; refill' : ''}</p>
          <button type="button" class="add-btn add-btn--sm" data-add="${p.id}">Buy it again</button></div>
        </div>`; }).join('')}
      </div>
      <div class="order-card__actions">
        <button type="button" class="add-btn add-btn--wide" data-track="${o.id}">Track package</button>
        <button type="button" class="pill-btn pill-btn--wide" data-return="${o.id}" ${o.returned ? 'disabled' : ''}>${o.returned ? 'Return started' : 'Return or replace items'}</button>
        <button type="button" class="pill-btn pill-btn--wide" data-cancel="${o.id}">Cancel order</button>
      </div>
    </div>
  </article>`;

  pages.orders = () => `<section class="orders">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Your Account</a> › Your Orders</nav>
      <h1 class="orders__title">Your Orders</h1>
      <p class="orders__count"><b>${plural(state.orders.length, 'order')}</b> placed in this browser</p>
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
      ['How does Subscribe & refill work?', 'Choose Subscribe & refill on a hand wash and a 500 mL refill arrives every two months. Skip or cancel any time from Your Orders.'],
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

  Object.assign(titles, {
    cart: 'Amazon.fr Shopping Basket', checkout: 'Amazon.fr Checkout', order: 'Thank you for your order',
    orders: 'Your Orders', lists: 'Your Wish List', 'best-sellers': 'Best Sellers in Aesop',
    deals: "Today's Deals", prime: 'Prime delivery', help: 'Customer Service'
  });

  /* ---------- after every render ---------- */

  function afterRender() {
    updateLocation();
    updateListButtons();
  }
  hooks.push(afterRender);

  updateCount();
  updateLocation();
  updateLang();
  updateFollow();
})();
