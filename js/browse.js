/* Browsing features that work like Amazon: search results with sort and filters,
   and on product pages hover zoom, Share, "Frequently bought together" and
   "Compare with similar items". */
(() => {
  const S = window.STORE;
  const { pages, hooks, products, byId, esc, productSVG, price, stars, soldBy, toast, $ } = S;
  const { openPanel, closePanel, head, eur, addToCart, openAdded } = S.shop;

  /* ---------- search results ---------- */

  const CATS = [['hand', 'Hand care'], ['body', 'Bath & body'], ['fragrance', 'Fragrance'], ['home', 'Home fragrance'], ['gift', 'Gift sets']];
  const AROMAS = [['woody', 'Woody'], ['fresh', 'Fresh'], ['citrus', 'Citrus'], ['light', 'Light'], ['opulent', 'Opulent']];
  const PRICES = [['', 'Any price'], ['0-40', 'Up to €40'], ['40-100', '€40 to €100'], ['100-', '€100 &amp; above']];
  const SORTS = [['featured', 'Featured'], ['price-asc', 'Price: Low to High'], ['price-desc', 'Price: High to Low'], ['rating', 'Avg. Customer Review'], ['popular', 'Best Sellers']];
  let filters = null;
  let lastTerm = null;
  const fresh = () => ({ cats: [], aromas: [], price: '', stars4: false, prime: false, sort: 'featured' });

  const matches = term => {
    const t = term.toLowerCase();
    return products.filter(p => !t || (p.name + ' ' + p.aromaText + ' ' + p.cat + ' ' + (p.family || '') + ' ' + p.aromas.join(' ')).toLowerCase().includes(t));
  };

  function apply(list) {
    const f = filters;
    let out = list.filter(p =>
      (!f.cats.length || f.cats.includes(p.cat)) &&
      (!f.aromas.length || p.aromas.some(a => f.aromas.includes(a))) &&
      (!f.stars4 || p.rating >= 4) &&
      (!f.price || (() => { const [lo, hi] = f.price.split('-').map(Number); return p.price >= lo && (!hi || p.price <= hi); })()));
    const by = { 'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price, rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews, popular: (a, b) => b.reviews - a.reviews }[f.sort];
    if (by) out = [...out].sort(by);
    return out;
  }

  const activeCount = () => filters.cats.length + filters.aromas.length + (filters.price ? 1 : 0) + filters.stars4 + filters.prime;

  function resultsHtml(term) {
    const base = matches(term);
    const res = apply(base);
    const label = term ? ` for <span class="srch__term">"${esc(term)}"</span>` : '';
    return `<div class="srch__bar">
        <p class="srch__count" aria-live="polite">${res.length ? `1-${res.length} of ${res.length} results` : 'No results'}${label}</p>
        <label class="srch__sort">Sort by: <select data-srch-sort>${SORTS.map(([v, l]) => `<option value="${v}" ${filters.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      </div>
      ${res.length ? S.grid(res, { prime: filters.prime })
        : `<div class="srch__none"><h2>No results${label}.</h2><p>${base.length && activeCount() ? 'Try removing some filters.' : 'Try checking your spelling or use more general terms, such as "hand", "balm", "woody" or "candle".'}</p>
           ${activeCount() ? '<button type="button" class="pill-btn" data-srch-clear>Clear all filters</button>' : ''}</div>`}`;
  }

  const check = (group, value, label, on) => `<label class="srch-f__opt"><input type="checkbox" data-srch-f="${group}" value="${value}" ${on ? 'checked' : ''}> ${label}</label>`;

  pages.search = q => {
    const term = decodeURIComponent(q || '').trim();
    if (term !== lastTerm) { filters = fresh(); lastTerm = term; }
    const base = matches(term);
    const has = (key, val) => base.some(p => key === 'cat' ? p.cat === val : p.aromas.includes(val));
    return `<section class="srch">
      <aside class="srch-f" aria-label="Filters">
        <div class="srch-f__group"><h2>Delivery</h2>${check('prime', '1', `${S.primeBadge} <span>Prime FREE delivery</span>`, filters.prime)}</div>
        <div class="srch-f__group"><h2>Category</h2>${CATS.filter(([v]) => has('cat', v)).map(([v, l]) => check('cats', v, l, filters.cats.includes(v))).join('')}</div>
        <div class="srch-f__group"><h2>Customer Reviews</h2>${check('stars4', '1', `<span class="stars" role="img" aria-label="4 stars"><span class="stars__fill" style="width:80%"></span></span> &amp; up`, filters.stars4)}</div>
        <div class="srch-f__group"><h2>Price</h2>${PRICES.map(([v, l]) => `<label class="srch-f__opt"><input type="radio" name="srch-price" data-srch-f="price" value="${v}" ${filters.price === v ? 'checked' : ''}> ${l}</label>`).join('')}</div>
        <div class="srch-f__group"><h2>Aroma</h2>${AROMAS.filter(([v]) => has('aroma', v)).map(([v, l]) => check('aromas', v, l, filters.aromas.includes(v))).join('')}</div>
        <button type="button" class="linklike srch-f__clear" data-srch-clear ${activeCount() ? '' : 'hidden'}>Clear all filters</button>
      </aside>
      <div class="srch__main" id="srchMain" data-term="${esc(term)}">${resultsHtml(term)}</div>
    </section>`;
  };

  function rerun() {
    const main = $('#srchMain');
    if (!main) return;
    main.innerHTML = resultsHtml(main.dataset.term);
    document.querySelector('[data-srch-clear].srch-f__clear').hidden = !activeCount();
    hooks.forEach(fn => fn === pdpExtras ? null : fn('search-results'));
  }

  document.addEventListener('change', e => {
    const t = e.target;
    if (t.matches('[data-srch-sort]')) { filters.sort = t.value; rerun(); return; }
    if (!t.matches('[data-srch-f]')) return;
    const g = t.dataset.srchF;
    if (g === 'cats' || g === 'aromas') filters[g] = t.checked ? [...filters[g], t.value] : filters[g].filter(x => x !== t.value);
    else if (g === 'price') filters.price = t.value;
    else filters[g] = t.checked;
    rerun();
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('[data-srch-clear]')) return;
    const sort = filters.sort;
    filters = { ...fresh(), sort };
    $('#page').innerHTML = pages.search(encodeURIComponent($('#srchMain').dataset.term));
    hooks.forEach(fn => fn('search'));
  });

  /* ---------- product page: hover zoom ---------- */

  const canZoom = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1000px)');
  const Z = 2.4;
  let zoom = null;

  function zoomMove(e) {
    const main = $('#pdpMain');
    const img = main?.querySelector(':scope > img');
    const pdp = document.querySelector('.pdp');
    const info = document.querySelector('.pdp__info');
    if (!img || !info || !canZoom.matches) return zoomEnd();
    const r = img.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
    if (fx < 0 || fx > 1 || fy < 0 || fy > 1) return zoomEnd();
    if (!zoom || zoom.src !== img.currentSrc) {
      zoomEnd();
      const pr = pdp.getBoundingClientRect(), ir = info.getBoundingClientRect();
      const pane = document.createElement('div');
      pane.className = 'zoom-pane';
      pane.setAttribute('aria-hidden', 'true');
      const w = Math.min(ir.width + 40, pr.right - ir.left), h = Math.min(r.height, innerHeight - 120);
      Object.assign(pane.style, { left: `${ir.left - pr.left}px`, top: `${Math.max(0, r.top - pr.top)}px`, width: `${w}px`, height: `${h}px` });
      const big = img.cloneNode();
      big.removeAttribute('loading');
      Object.assign(big.style, { width: `${r.width * Z}px`, height: `${r.height * Z}px`, objectFit: getComputedStyle(img).objectFit });
      big.className = 'zoom-pane__img';
      pane.append(big);
      pdp.append(pane);
      const lens = document.createElement('div');
      lens.className = 'zoom-lens';
      Object.assign(lens.style, { width: `${w / Z}px`, height: `${h / Z}px` });
      main.append(lens);
      zoom = { src: img.currentSrc, pane, lens, big, w, h };
    }
    const mr = main.getBoundingClientRect();
    const lw = zoom.w / Z, lh = zoom.h / Z;
    const lx = Math.max(r.left, Math.min(e.clientX - lw / 2, r.right - lw)), ly = Math.max(r.top, Math.min(e.clientY - lh / 2, r.bottom - lh));
    zoom.lens.style.transform = `translate(${lx - mr.left}px, ${ly - mr.top}px)`;
    zoom.big.style.transform = `translate(${-(lx - r.left) * Z}px, ${-(ly - r.top) * Z}px)`;
  }
  function zoomEnd() {
    if (!zoom) return;
    zoom.pane.remove(); zoom.lens.remove();
    zoom = null;
  }
  document.addEventListener('mousemove', e => {
    if (e.target.closest?.('#pdpMain')) zoomMove(e); else zoomEnd();
  });
  window.addEventListener('scroll', zoomEnd, { passive: true });

  /* ---------- product page: share, bought together, compare ---------- */

  const shareIcon = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7 8l5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';

  function openShare(p) {
    const url = `${location.origin}${location.pathname}#/p/${p.id}`;
    const subject = encodeURIComponent(`Aesop ${p.name} on Amazon.fr`);
    openPanel(`${head('Share this product')}
      <div class="panel__body share">
        <div class="share__item"><span class="added__img">${productSVG(p, { decorative: true })}</span><p>Aesop ${esc(p.name)}, ${esc(p.size)}</p></div>
        <div class="share__row">
          <input class="share__url" value="${esc(url)}" readonly aria-label="Product link">
          <button type="button" class="add-btn" data-copy-link="${esc(url)}">Copy link</button>
        </div>
        <div class="share__btns">
          <a class="pill-btn" href="mailto:?subject=${subject}&amp;body=${encodeURIComponent(url)}">Email</a>
          ${navigator.share ? `<button type="button" class="pill-btn" data-native-share="${p.id}">More options</button>` : ''}
        </div>
      </div>`, { label: 'Share this product' });
  }

  function companions(p) {
    const pool = products.filter(x => x.id !== p.id && x.price && (p.cat === 'gift' ? x.cat === 'gift' : x.cat !== 'gift'));
    const near = { hand: ['hand', 'body'], body: ['body', 'hand'], fragrance: ['fragrance', 'home'], home: ['home', 'fragrance'], gift: ['gift'] }[p.cat] || [p.cat];
    return [...pool].sort((a, b) => (near.indexOf(a.cat) + 9) % 9 - (near.indexOf(b.cat) + 9) % 9 || b.reviews - a.reviews).slice(0, 2);
  }

  function fbtHtml(p) {
    const set = [p, ...companions(p)];
    return `<section class="fbt" aria-labelledby="fbtTitle">
      <h2 class="fbt__title" id="fbtTitle">Frequently bought together</h2>
      <div class="fbt__wrap">
        <div class="fbt__imgs">${set.map((x, i) => `${i ? '<span class="fbt__plus" aria-hidden="true">+</span>' : ''}<a class="fbt__img" href="#/p/${x.id}">${productSVG(x, { decorative: true })}<span class="visually-hidden">${esc(x.name)}</span></a>`).join('')}</div>
        <div class="fbt__buy">
          <p class="fbt__total">Total price: <b data-fbt-total>${eur(set.reduce((s, x) => s + x.price, 0))}</b></p>
          <button type="button" class="add-btn" data-fbt-add>Add all ${set.length === 3 ? 'three' : 'both'} to Basket</button>
        </div>
      </div>
      <ul class="fbt__list">${set.map((x, i) => `<li><label><input type="checkbox" data-fbt="${x.id}" data-price="${x.price}" checked>
        <span>${i === 0 ? '<b>This item:</b> ' : ''}<a href="#/p/${x.id}">Aesop ${esc(x.name)}, ${esc(x.size)}</a></span> <b class="fbt__price">${eur(x.price)}</b></label></li>`).join('')}</ul>
    </section>`;
  }

  function compareHtml(p) {
    const same = products.filter(x => x.id !== p.id && x.cat === p.cat);
    const others = products.filter(x => x.id !== p.id && x.cat !== p.cat && x.cat !== 'gift');
    const set = [p, ...[...same, ...others].slice(0, 3)];
    const row = (label, cell) => `<tr><th scope="row">${label}</th>${set.map(x => `<td>${cell(x)}</td>`).join('')}</tr>`;
    return `<section class="cmp" aria-labelledby="cmpTitle">
      <h2 class="fbt__title" id="cmpTitle">Compare with similar items</h2>
      <div class="cmp__scroll"><table class="cmp__table">
        <thead><tr><td></td>${set.map((x, i) => `<th scope="col">${i === 0 ? '<span class="cmp__this">This item</span>' : ''}<a class="cmp__img" href="#/p/${x.id}">${productSVG(x, { decorative: true })}</a><a class="cmp__name" href="#/p/${x.id}">Aesop ${esc(x.name)}, ${esc(x.size)}</a></th>`).join('')}</tr></thead>
        <tbody>
          <tr><td></td>${set.map(x => `<td><button type="button" class="add-btn add-btn--sm" data-add="${x.id}">Add to basket</button></td>`).join('')}</tr>
          ${row('Customer Rating', x => stars(x))}
          ${row('Price', x => price(x, 'price--sm'))}
          ${row('Sold By', () => 'Amazon')}
          ${row('Size', x => esc(x.size))}
          ${row('Aroma', x => esc(x.aromaText))}
        </tbody>
      </table></div>
    </section>`;
  }

  function pdpExtras(route, arg) {
    if (route !== 'p' || !byId(arg)) return;
    const p = byId(arg);
    const gallery = document.querySelector('.pdp__gallery');
    gallery?.insertAdjacentHTML('beforeend', `<button type="button" class="pdp__share" data-share-open="${p.id}" aria-label="Share this product">${shareIcon}</button>`);
    const hint = document.querySelector('.pdp__hint');
    if (hint && canZoom.matches && document.querySelector('#pdpMain > img')) hint.textContent = 'Roll over image to zoom in · Click to see full view';
    document.querySelector('.pdp')?.insertAdjacentHTML('afterend', fbtHtml(p));
    const reviews = document.getElementById('reviews');
    if (reviews) reviews.insertAdjacentHTML('beforebegin', compareHtml(p));
  }
  hooks.push(pdpExtras);

  document.addEventListener('change', e => {
    if (!e.target.matches('[data-fbt]')) return;
    const box = e.target.closest('.fbt');
    const on = [...box.querySelectorAll('[data-fbt]:checked')];
    box.querySelector('[data-fbt-total]').textContent = eur(on.reduce((s, c) => s + Number(c.dataset.price), 0));
    const btn = box.querySelector('[data-fbt-add]');
    btn.disabled = !on.length;
    btn.textContent = on.length === 3 ? 'Add all three to Basket' : on.length === 2 ? 'Add both to Basket' : on.length ? 'Add to Basket' : 'Select an item';
    box.querySelectorAll('.fbt__img').forEach((img, i) => img.classList.toggle('is-off', !box.querySelectorAll('[data-fbt]')[i].checked));
  });

  document.addEventListener('click', e => {
    const t = e.target;
    const sh = t.closest('[data-share-open]');
    if (sh) { openShare(byId(sh.dataset.shareOpen)); return; }
    const copy = t.closest('[data-copy-link]');
    if (copy) {
      const done = () => { copy.textContent = 'Copied!'; toast('<b>Link copied</b> Paste it anywhere to share this product.'); };
      if (navigator.clipboard) navigator.clipboard.writeText(copy.dataset.copyLink).then(done, () => { $('.share__url').select(); });
      else { $('.share__url').select(); }
      return;
    }
    const ns = t.closest('[data-native-share]');
    if (ns) { const p = byId(ns.dataset.nativeShare); navigator.share({ title: `Aesop ${p.name}`, url: `${location.origin}${location.pathname}#/p/${p.id}` }).catch(() => {}); return; }
    const fbt = t.closest('[data-fbt-add]');
    if (fbt) {
      const ids = [...fbt.closest('.fbt').querySelectorAll('[data-fbt]:checked')].map(c => c.dataset.fbt);
      if (!ids.length) return;
      ids.forEach(id => addToCart(id, 1));
      closePanel(false);
      openAdded(byId(ids[0]));
      if (ids.length > 1) toast(`<b>${ids.length} items added to basket</b>`);
    }
  });
})();
