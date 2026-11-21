/* Your Account area, like Amazon's: account hub, address book, Subscribe & refill,
   browsing history, your reviews and printable invoices. Everything is kept in this
   browser (see shop.js); there is deliberately no sign-in. */
(() => {
  const S = window.STORE;
  const { pages, titles, hooks, byId, esc, productSVG, price, toast, $ } = S;
  const {
    state, persist, refresh, live, openPanel, closePanel, confirmPanel, head, eur, plural,
    updateLocation, city, longDate, shortDate, shipTo, addrLines
  } = S.shop;

  live.push('account', 'addresses', 'subscriptions', 'history', 'my-reviews');

  const icon = d => `<svg viewBox="0 0 48 48" width="44" height="44" aria-hidden="true" fill="none" stroke="#232F3E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const icons = {
    orders: icon('<path d="M8 16 24 8l16 8v18l-16 8-16-8z"/><path d="M8 16l16 8 16-8M24 24v18"/><path d="m16 12 16 8" stroke="#FF9900"/>'),
    security: icon('<rect x="11" y="21" width="26" height="19" rx="3"/><path d="M17 21v-5a7 7 0 0 1 14 0v5"/><circle cx="24" cy="30" r="2.5" stroke="#FF9900"/>'),
    prime: icon('<path d="M10 25 20 35 38 13" stroke="#00A8E1" stroke-width="3"/>'),
    address: icon('<path d="M24 42s13-12 13-23a13 13 0 0 0-26 0c0 11 13 23 13 23z"/><circle cx="24" cy="19" r="5" stroke="#FF9900"/>'),
    subs: icon('<path d="M38 20A15 15 0 0 0 11 15M10 28a15 15 0 0 0 27 5"/><path d="M11 8v7h7M37 40v-7h-7" stroke="#FF9900"/>'),
    lists: icon('<path d="M17 13h22M17 24h22M17 35h22"/><path d="M9 13h1M9 24h1M9 35h1" stroke="#FF9900" stroke-width="3"/>'),
    reviews: icon('<path d="M24 8l4.7 9.6 10.5 1.5-7.6 7.4 1.8 10.5L24 32l-9.4 5 1.8-10.5-7.6-7.4 10.5-1.5z" stroke="#FF9900"/>'),
    history: icon('<circle cx="24" cy="24" r="16"/><path d="M24 15v10l7 4" stroke="#FF9900"/>'),
    help: icon('<path d="M10 30v-6a14 14 0 0 1 28 0v6"/><rect x="8" y="28" width="7" height="10" rx="2"/><rect x="33" y="28" width="7" height="10" rx="2"/><path d="M36 38c0 3-4 4-9 4" stroke="#FF9900"/>')
  };

  /* ---------- Your Account hub ---------- */

  pages.account = () => {
    const active = state.subs.filter(s => s.status === 'active').length;
    const card = (href, ic, title, text, attrs = '') => `<a class="acct-card" href="${href}"${attrs}>${ic}<span><b>${title}</b><small>${text}</small></span></a>`;
    return `<section class="acct">
      <h1 class="acct__title">Your Account</h1>
      <div class="acct-grid">
        ${card('#/orders', icons.orders, 'Your Orders', `Track, return or buy things again · ${plural(state.orders.length, 'order')}`)}
        <button type="button" class="acct-card" data-open="security">${icons.security}<span><b>Login &amp; security</b><small>Why this concept has no sign-in</small></span></button>
        ${card('#/prime', icons.prime, 'Prime', 'FREE delivery tomorrow on every Aesop formulation')}
        ${card('#/addresses', icons.address, 'Your Addresses', `Edit addresses for orders · ${plural(state.addresses.length, 'address').replace('addresss', 'addresses')}`)}
        ${card('#/subscriptions', icons.subs, 'Your Subscribe &amp; refill', `Skip, change or cancel refills · ${active} active`)}
        ${card('#/lists', icons.lists, 'Your Lists', `Your Wish List · ${plural(state.list.length, 'item')}`)}
        ${card('#/my-reviews', icons.reviews, 'Your reviews', `Edit or delete reviews you wrote · ${Object.keys(state.reviews).length}`)}
        ${card('#/history', icons.history, 'Your browsing history', state.historyOn ? `${plural(state.history.length, 'product')} viewed` : 'Turned off')}
        ${card('#/help', icons.help, 'Customer Service', 'Deliveries, returns and questions')}
      </div>
      <p class="acct__fine">Concept demo: this account lives in this browser only. Clearing your browser data resets it.</p>
    </section>`;
  };

  /* ---------- Your Addresses ---------- */

  pages.addresses = () => {
    const def = shipTo();
    return `<section class="acct">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#/account">Your Account</a> › Your Addresses</nav>
      <h1 class="acct__title">Your Addresses</h1>
      <div class="addr-grid">
        <a class="addr-card addr-card--add" href="#/address/new"><span aria-hidden="true">+</span><b>Add address</b></a>
        ${state.addresses.map(a => `<article class="addr-card">
          ${a.id === def.id ? '<p class="addr-card__default">Default</p>' : ''}
          <p><b>${esc(a.name)}</b><br>${addrLines(a).map(esc).join('<br>')}${a.phone ? `<br>Phone number: ${esc(a.phone)}` : ''}</p>
          <p class="addr-card__actions"><a href="#/address/${a.id}">Edit</a> <span aria-hidden="true">|</span>
            <button type="button" class="linklike" data-del-addr="${a.id}">Remove</button>
            ${a.id === def.id ? '' : `<span aria-hidden="true">|</span> <button type="button" class="linklike" data-default-addr="${a.id}">Set as Default</button>`}</p>
        </article>`).join('')}
      </div>
      ${state.addresses.length ? '' : `<p class="muted">Until you add an address, orders go to the demo address: ${esc(addrLines(def).join(', '))}.</p>`}
    </section>`;
  };

  pages.address = (id, back) => {
    const a = state.addresses.find(x => x.id === id) || { name: '', line1: '', line2: '', zip: state.zip, city: city(state.zip), phone: '' };
    const editing = id !== 'new' && state.addresses.some(x => x.id === id);
    const field = (name, label, opts = {}) => `<div class="addr-form__row">
        <label for="af-${name}">${label}${opts.optional ? ' <span class="muted">(optional)</span>' : ''}</label>
        <input id="af-${name}" name="${name}" value="${esc(a[name] || '')}" ${opts.attrs || ''} aria-describedby="ae-${name}">
        <p class="field-error" id="ae-${name}" hidden>${opts.error || ''}</p>
      </div>`;
    return `<section class="acct acct--narrow">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#/account">Your Account</a> › <a href="#/addresses">Your Addresses</a> › ${editing ? 'Edit address' : 'New address'}</nav>
      <h1 class="acct__title">${editing ? 'Edit your address' : 'Add a new address'}</h1>
      <form class="addr-form" data-addr-form="${editing ? id : 'new'}" data-back="${esc(back || '')}" novalidate>
        <div class="addr-form__row"><label>Country/Region</label><p class="addr-form__fixed">France</p></div>
        ${field('name', 'Full name (first and last name)', { attrs: 'autocomplete="name" maxlength="60"', error: 'Please enter a name.' })}
        ${field('line1', 'Address', { attrs: 'autocomplete="address-line1" maxlength="80" placeholder="Street address or P.O. Box"', error: 'Please enter an address.' })}
        ${field('line2', 'Apartment, suite, unit, building, floor', { optional: true, attrs: 'autocomplete="address-line2" maxlength="80"' })}
        <div class="addr-form__pair">
          ${field('zip', 'Postcode', { attrs: 'autocomplete="postal-code" inputmode="numeric" maxlength="5"', error: 'Please enter a 5-digit French postcode.' })}
          ${field('city', 'Town/City', { attrs: `autocomplete="address-level2" maxlength="40"${editing ? '' : ' data-auto="1"'}`, error: 'Please enter a town or city.' })}
        </div>
        ${field('phone', 'Phone number', { optional: true, attrs: 'type="tel" autocomplete="tel" maxlength="20"', error: 'Please enter a valid phone number, such as 06 12 34 56 78.' })}
        <label class="addr-form__default"><input type="checkbox" name="makeDefault" ${!editing || a.id === shipTo().id ? 'checked' : ''}> Make this my default address</label>
        <div class="review-form__actions"><button type="submit" class="add-btn">${editing ? 'Save changes' : 'Add address'}</button> <a href="${back === 'checkout' ? '#/checkout' : '#/addresses'}">Cancel</a></div>
      </form>
    </section>`;
  };

  // Postcode fills in the town, the way Amazon's form suggests it
  document.addEventListener('input', e => {
    if (!e.target.matches('[data-addr-form] [name="zip"]')) return;
    const zip = e.target.value.trim(), cityInput = e.target.form.city;
    if (/^\d{5}$/.test(zip) && (!cityInput.value || cityInput.dataset.auto)) { cityInput.value = city(zip) === 'France' ? '' : city(zip); cityInput.dataset.auto = '1'; }
  });

  document.addEventListener('input', e => { if (e.target.matches('[data-addr-form] [name="city"]')) delete e.target.dataset.auto; });

  document.addEventListener('submit', e => {
    const form = e.target.closest('[data-addr-form]');
    if (!form) return;
    e.preventDefault();
    const v = n => form.elements[n].value.trim();
    const data = { name: v('name'), line1: v('line1'), line2: v('line2'), zip: v('zip'), city: v('city'), phone: v('phone') };
    const bad = {
      name: !data.name, line1: !data.line1, zip: !/^\d{5}$/.test(data.zip), city: !data.city,
      phone: !!data.phone && !/^\+?[\d\s().-]{9,20}$/.test(data.phone)
    };
    Object.entries(bad).forEach(([k, isBad]) => {
      form.querySelector(`#ae-${k}`).hidden = !isBad;
      form.elements[k].setAttribute('aria-invalid', isBad);
    });
    const first = Object.keys(bad).find(k => bad[k]);
    if (first) { form.elements[first].focus(); return; }
    const id = form.dataset.addrForm === 'new' ? 'A' + Date.now().toString(36) : form.dataset.addrForm;
    const i = state.addresses.findIndex(x => x.id === id);
    if (i > -1) state.addresses[i] = { id, ...data }; else state.addresses.push({ id, ...data });
    if (form.elements.makeDefault.checked || state.addresses.length === 1) useAddress(id, false);
    persist();
    location.hash = form.dataset.back === 'checkout' ? '#/checkout' : '#/addresses';
    toast(i > -1 ? '<b>Address saved</b>' : '<b>Address added</b>');
  });

  function useAddress(id, announce = true) {
    const a = state.addresses.find(x => x.id === id);
    if (!a) return;
    state.defaultAddr = id;
    state.zip = a.zip;   // "Deliver to" follows the chosen address, as on Amazon
    persist();
    updateLocation();
    if (announce) toast(`<b>Delivering to ${esc(a.name)}</b> ${esc(a.line1)}, ${esc(a.zip)} ${esc(a.city)}`);
  }

  function openAddressPicker() {
    const cur = shipTo();
    openPanel(`${head('Choose a delivery address')}
      <form class="panel__body addr-pick" data-addr-pick>
        ${state.addresses.length ? state.addresses.map(a => `<label class="co-radio"><input type="radio" name="addr" value="${a.id}" ${a.id === cur.id ? 'checked' : ''}>
          <span><b>${esc(a.name)}</b><small>${esc(addrLines(a).join(', '))}</small></span></label>`).join('')
          : `<p>Orders currently go to the demo address: <b>${esc(addrLines(cur).join(', '))}</b>.</p>`}
        <a class="addr-pick__new" href="#/address/new/checkout">+ Add a new address</a>
        <div class="panel__actions">${state.addresses.length ? '<button type="submit" class="add-btn">Use this address</button>' : ''}</div>
      </form>`, { label: 'Choose a delivery address' });
  }

  document.addEventListener('submit', e => {
    const form = e.target.closest('[data-addr-pick]');
    if (!form) return;
    e.preventDefault();
    const id = form.addr?.value;
    if (id) useAddress(id);
    closePanel(false);
    refresh();
  });

  /* ---------- Subscribe & refill ---------- */

  const nextDate = s => longDate(new Date(s.next));
  const addMonths = (iso, m) => { const d = new Date(iso); d.setMonth(d.getMonth() + m); return d.toISOString(); };

  pages.subscriptions = () => {
    const active = state.subs.filter(s => s.status === 'active');
    const ended = state.subs.filter(s => s.status !== 'active');
    const subCard = s => {
      const p = byId(s.pid);
      const on = s.status === 'active';
      return `<article class="sub-card${on ? '' : ' sub-card--off'}">
        <a class="sub-card__img" href="#/p/${p.id}">${productSVG(p, { decorative: true })}</a>
        <div class="sub-card__info">
          <a class="sub-card__name" href="#/p/${p.id}">Aesop ${esc(p.name)}, ${esc(p.size)}</a>
          <p>${price(p, 'price--sm')} <span class="muted">· Qty ${s.qty}</span></p>
          ${on ? `<p class="sub-card__next">Next delivery: <b>${nextDate(s)}</b></p>` : '<p class="sub-card__next muted">Subscription cancelled</p>'}
        </div>
        <div class="sub-card__actions">
          ${on ? `<label class="sub-card__every">Deliver every
              <select data-sub-every="${s.id}">${[1, 2, 3, 4, 6].map(m => `<option value="${m}" ${s.every === m ? 'selected' : ''}>${m} month${m > 1 ? 's' : ''}</option>`).join('')}</select></label>
            <button type="button" class="pill-btn pill-btn--wide" data-sub-skip="${s.id}">Skip next delivery</button>
            <button type="button" class="pill-btn pill-btn--wide" data-sub-cancel="${s.id}">Cancel subscription</button>`
          : `<button type="button" class="add-btn add-btn--wide" data-sub-resume="${s.id}">Resubscribe</button>`}
        </div>
      </article>`;
    };
    return `<section class="acct">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#/account">Your Account</a> › Your Subscribe &amp; refill</nav>
      <h1 class="acct__title">Your Subscribe &amp; refill</h1>
      <p class="muted">Refills arrive on your schedule with FREE Prime delivery. Skip, change or cancel at any time.</p>
      ${active.length ? `<h2 class="sub-head">Active subscriptions (${active.length})</h2>${active.map(subCard).join('')}`
        : `<div class="cart-empty"><h2>You have no active subscriptions</h2><p>Choose <b>Subscribe &amp; refill</b> on a hand wash and complete checkout. The subscription appears here.</p><a class="add-btn" href="#/hand-body/refill">Shop Subscribe &amp; refill</a></div>`}
      ${ended.length ? `<h2 class="sub-head">Cancelled</h2>${ended.map(subCard).join('')}` : ''}
    </section>`;
  };

  document.addEventListener('change', e => {
    const sel = e.target.closest('[data-sub-every]');
    if (!sel) return;
    const s = state.subs.find(x => x.id === sel.dataset.subEvery);
    s.every = Number(sel.value);
    persist();
    toast(`<b>Frequency updated</b> ${esc(byId(s.pid).name)} now arrives every ${plural(s.every, 'month')}.`);
  });

  /* ---------- browsing history ---------- */

  pages.history = () => {
    const items = state.history.map(byId).filter(Boolean);
    return `<section class="acct">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#/account">Your Account</a> › Your browsing history</nav>
      <div class="hist-head">
        <h1 class="acct__title">Your browsing history</h1>
        <div class="hist-head__tools">
          ${items.length ? '<button type="button" class="linklike" data-hist-clear>Remove all items from view</button>' : ''}
          <label class="hist-toggle"><input type="checkbox" data-hist-toggle ${state.historyOn ? 'checked' : ''}> Browsing history is ${state.historyOn ? 'on' : 'off'}</label>
        </div>
      </div>
      <p class="muted">These items were viewed recently. We use them to personalise recommendations.</p>
      ${items.length ? `<div class="grid">${items.map(p => S.tile(p).replace('</article>', `<button type="button" class="linklike lists__remove" data-hist-del="${p.id}">Remove from view</button></article>`)).join('')}</div>`
        : `<div class="cart-empty"><h2>${state.historyOn ? 'You have no recently viewed items' : 'Browsing history is turned off'}</h2><p>${state.historyOn ? 'Products you look at appear here.' : 'Turn it on to see products you looked at.'}</p><a class="add-btn" href="#/">Browse the Aesop store</a></div>`}
    </section>`;
  };

  // Amazon shows a strip of recently viewed items at the bottom of most pages
  const stripRoutes = ['p', 'cart', 'search', 'orders', 'lists', 'account', 'best-sellers'];
  function historyStrip(route, arg) {
    if (!state.historyOn || !stripRoutes.includes(route)) return;
    const items = state.history.filter(id => !(route === 'p' && id === arg)).slice(0, 12).map(byId).filter(Boolean);
    if (!items.length) return;
    $('#page').insertAdjacentHTML('beforeend', `<section class="hist-strip" aria-labelledby="histStripTitle">
      <div class="hist-strip__head"><h2 id="histStripTitle">Your browsing history</h2><a href="#/history">View or edit your browsing history</a></div>
      <div class="hist-strip__row">${items.map(p => `<a class="hist-strip__item" href="#/p/${p.id}" title="${esc(p.name)}">${productSVG(p, { decorative: true })}<span class="visually-hidden">${esc(p.name)}</span></a>`).join('')}</div>
    </section>`);
  }

  function record(route, arg) {
    if (route !== 'p' || !byId(arg) || !state.historyOn) return;
    state.history = [arg, ...state.history.filter(x => x !== arg)].slice(0, 30);
    persist();
  }

  hooks.push((route, arg) => { historyStrip(route, arg); record(route, arg); });

  /* ---------- Your reviews ---------- */

  pages['my-reviews'] = () => {
    const mine = Object.entries(state.reviews).filter(([id]) => byId(id));
    return `<section class="acct">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#/account">Your Account</a> › Your reviews</nav>
      <h1 class="acct__title">Your reviews</h1>
      ${mine.length ? mine.map(([id, r]) => { const p = byId(id); return `<article class="myrev">
          <a class="sub-card__img" href="#/p/${id}">${productSVG(p, { decorative: true })}</a>
          <div class="myrev__body">
            <a class="sub-card__name" href="#/p/${id}/reviews">Aesop ${esc(p.name)}, ${esc(p.size)}</a>
            <p class="review__head"><span class="stars" role="img" aria-label="${r.rating} out of 5 stars"><span class="stars__fill" style="width:${r.rating * 20}%"></span></span> <b>${esc(r.title)}</b></p>
            <p class="review__body">${esc(r.body)}</p>
            <div class="review__actions"><a class="pill-btn pill-btn--sm" href="#/review/${id}">Edit</a><button type="button" class="pill-btn pill-btn--sm" data-del-review="${id}">Delete</button></div>
          </div>
        </article>`; }).join('')
        : `<div class="cart-empty"><h2>You haven't written any reviews yet</h2><p>Open a product and choose <b>Write a product review</b> under Customer reviews.</p><a class="add-btn" href="#/orders">Review something you ordered</a></div>`}
    </section>`;
  };

  /* ---------- printable invoice ---------- */

  pages.invoice = id => {
    const o = state.orders.find(x => x.id === id);
    if (!o) return `<section class="cart-empty cart-empty--page"><h1>Invoice not found</h1><p><a href="#/orders">See your orders</a></p></section>`;
    const vat = o.total - o.total / 1.2;
    return `<section class="invoice">
      <div class="invoice__tools"><a href="#/order/${o.id}">‹ Back to order details</a><button type="button" class="add-btn" data-print>Print this page</button></div>
      <header class="invoice__head">
        <div><p class="invoice__brand">Amazon.fr <span>CONCEPT</span></p><p class="muted small">Student concept invoice. Not a tax document.</p></div>
        <div class="invoice__ids"><h1>Invoice</h1><p>Order # ${esc(o.id)}</p><p>Order date: ${shortDate(new Date(o.placed))}</p></div>
      </header>
      <div class="invoice__parties">
        <div><h2>Sold by</h2><p>Amazon (concept)<br>Aesop official store</p></div>
        <div><h2>Delivery address</h2><p>${esc(o.name || 'Demo customer')}<br>${esc(o.address).split(', ').join('<br>')}</p></div>
        <div><h2>Payment</h2><p>Pay on delivery (demo)</p></div>
      </div>
      <table class="invoice__table">
        <thead><tr><th scope="col">Description</th><th scope="col">Qty</th><th scope="col">Unit price (incl. VAT)</th><th scope="col">Total (incl. VAT)</th></tr></thead>
        <tbody>${o.items.map(l => { const p = byId(l.id); return `<tr><td>Aesop ${esc(p.name)}, ${esc(p.size)}${l.sub ? ' (Subscribe &amp; refill)' : ''}</td><td>${l.qty}</td><td>${eur(l.price)}</td><td>${eur(l.price * l.qty)}</td></tr>`; }).join('')}
          <tr><td>Delivery (Prime)</td><td>1</td><td>${eur(0)}</td><td>${eur(0)}</td></tr></tbody>
        <tfoot>
          <tr><th scope="row" colspan="3">Total excl. VAT</th><td>${eur(o.total - vat)}</td></tr>
          <tr><th scope="row" colspan="3">VAT 20%</th><td>${eur(vat)}</td></tr>
          <tr class="invoice__grand"><th scope="row" colspan="3">Total</th><td>${eur(o.total)}</td></tr>
        </tfoot>
      </table>
      <p class="muted small">Student concept – not affiliated with Aesop or Amazon.</p>
    </section>`;
  };

  /* ---------- clicks ---------- */

  document.addEventListener('click', e => {
    const t = e.target;
    const opener = t.closest('[data-open]');
    if (opener?.dataset.open === 'addresses') { e.preventDefault(); openAddressPicker(); return; }
    if (opener?.dataset.open === 'security') {
      e.preventDefault();
      openPanel(`${head('Login &amp; security')}<div class="panel__body">
        <p>This is a student concept, so it deliberately has <b>no sign-in, passwords or card details</b>. Real Amazon accounts are never asked for here.</p>
        <p>Your basket, orders, addresses and reviews are kept in this browser only, so they survive a refresh but are never sent anywhere.</p>
        <div class="panel__actions"><button type="button" class="add-btn" data-close>Got it</button></div></div>`, { label: 'Login and security' });
      return;
    }
    const use = t.closest('[data-use-addr]');
    if (use) { useAddress(use.dataset.useAddr); closePanel(false); refresh(); return; }
    const def = t.closest('[data-default-addr]');
    if (def) { useAddress(def.dataset.defaultAddr); refresh(); return; }
    const delA = t.closest('[data-del-addr]');
    if (delA) { confirmPanel('Remove this address?', 'It will no longer be offered at checkout.', `addr:${delA.dataset.delAddr}`, 'Remove address'); return; }

    const skip = t.closest('[data-sub-skip]');
    if (skip) {
      const s = state.subs.find(x => x.id === skip.dataset.subSkip);
      s.next = addMonths(s.next, s.every);
      persist(); refresh();
      toast(`<b>Delivery skipped</b> Next refill arrives ${nextDate(s)}.`);
      return;
    }
    const cancel = t.closest('[data-sub-cancel]');
    if (cancel) { confirmPanel('Cancel this subscription?', 'No more refills will be sent. You can resubscribe at any time.', `sub:${cancel.dataset.subCancel}`, 'Cancel subscription'); return; }
    const resume = t.closest('[data-sub-resume]');
    if (resume) {
      const s = state.subs.find(x => x.id === resume.dataset.subResume);
      s.status = 'active';
      s.next = addMonths(new Date().toISOString(), s.every);
      persist(); refresh();
      toast(`<b>Subscription restarted</b> First refill arrives ${nextDate(s)}.`);
      return;
    }

    const hDel = t.closest('[data-hist-del]');
    if (hDel) { state.history = state.history.filter(x => x !== hDel.dataset.histDel); persist(); refresh(); return; }
    if (t.closest('[data-hist-clear]')) { state.history = []; persist(); refresh(); toast('<b>Browsing history cleared</b>'); return; }
    if (t.closest('[data-print]')) { window.print(); }
  });

  document.addEventListener('change', e => {
    if (!e.target.matches('[data-hist-toggle]')) return;
    state.historyOn = e.target.checked;
    if (!state.historyOn) state.history = [];
    persist(); refresh();
    toast(state.historyOn ? '<b>Browsing history turned on</b>' : '<b>Browsing history turned off</b> Past items were removed.');
  });

  // Confirmations raised from this file (see confirmPanel in shop.js)
  S.onConfirm = (action, id) => {
    if (action === 'addr') {
      state.addresses = state.addresses.filter(a => a.id !== id);
      if (state.defaultAddr === id) state.defaultAddr = state.addresses[0]?.id || null;
      persist(); closePanel(false); refresh(); updateLocation();
      toast('<b>Address removed</b>');
      return true;
    }
    if (action === 'sub') {
      const s = state.subs.find(x => x.id === id);
      s.status = 'cancelled';
      persist(); closePanel(false); refresh();
      toast(`<b>Subscription cancelled</b> ${esc(byId(s.pid).name)}`);
      return true;
    }
    return false;
  };

  Object.assign(titles, {
    account: 'Your Account', addresses: 'Your Addresses', address: 'Your Addresses', subscriptions: 'Your Subscribe & refill',
    history: 'Your browsing history', 'my-reviews': 'Your reviews', invoice: 'Invoice'
  });
})();
