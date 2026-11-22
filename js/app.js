/* Aesop on Amazon.fr: concept store. Hash-routed single page, no build step. */
(function () {
  const { products, tabs, notes } = window.AESOP;
  const { productSVG, scene, esc } = window.ART;
  const byId = id => products.find(p => p.id === id);
  const $ = (s, el = document) => el.querySelector(s);
  const page = $('#page');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- real photos / videos dropped into img/ and video/ ----------
     Every slot is optional. A file found at start-up replaces the SVG illustration. */

  // js/assets.js (written by tools/scan_assets.py) lists the media files that exist
  const found = {};
  const media = window.ASSETS || [];
  const pick = (base, exts) => {
    for (const ext of exts) if (media.includes(`${base}.${ext}`)) return `${base}.${ext}`;
    return null;
  };
  const IMG = ['jpg', 'jpeg', 'webp', 'png', 'avif'];
  const VID = ['mp4', 'webm'];
  function loadAssets() {
    ['hero', 'hero-banner', 'hero-band', 'hero-band-left', 'banner-campaign', 'video-poster', 'banner-motion', 'brand-film-poster',
      'banner-hand-body', 'banner-fragrance', 'banner-for-the-home', 'banner-gifts',
      'banner-hand-body-full', 'banner-fragrance-full', 'banner-for-the-home-full', 'banner-gifts-full',
      'cat-hand-body', 'cat-fragrance', 'cat-for-the-home', 'cat-gifts'
    ].forEach(k => { found[k] = pick('img/' + k, IMG); });
    products.forEach(p => {
      if (!p.photo) p.photo = pick('img/products/' + p.id, IMG);
      // Extra listing views: <id>-2, <id>-3 ...
      p.gallery = [2, 3, 4, 5, 6, 7, 8, 9].map(n => pick(`img/products/${p.id}-${n}`, IMG)).filter(Boolean);
    });
    found.heroVideo = pick('video/hero', VID);
    found.bannerVideo = pick('video/banner', VID);
    // The Gift Guide banner loops a film: video/gift-guide.mp4 if present, otherwise the brand film
    found.giftVideo = pick('video/gift-guide', VID) || pick('video/brand-film', VID);
  }
  const cover = (src, cls = '') => `<img class="media-cover ${cls}" src="${esc(src)}" alt="" loading="lazy">`;
  const coverVideo = (src, poster) => `<video class="media-cover" src="${esc(src)}" ${poster ? `poster="${esc(poster)}"` : ''} muted loop playsinline ${reduceMotion.matches ? '' : 'autoplay'} preload="metadata" aria-hidden="true"></video>`;

  /* ---------- small helpers ---------- */

  const tmr = new Date();
  tmr.setDate(tmr.getDate() + 1);
  const tomorrow = tmr.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const tomorrowShort = tmr.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  // Prices are stored in euros. Like Amazon's currency converter, other currencies are shown at
  // indicative rates; orders are still placed in euros.
  const CURRENCIES = {
    EUR: { sym: '€', rate: 1, name: 'Euro' },
    GBP: { sym: '£', rate: 0.87, name: 'British Pound' },
    USD: { sym: 'US$', rate: 1.16, name: 'US Dollar' },
    CHF: { sym: 'CHF ', rate: 0.93, name: 'Swiss Franc' }
  };
  const cur = () => CURRENCIES[window.STORE?.currency] || CURRENCIES.EUR;
  // In French, Amazon.fr writes "30,00 €", "4,9" and "2 874"
  const isFR = () => window.STORE?.shop?.state.lang === 'FR';
  const money = n => { const v = (n * cur().rate).toFixed(2); return isFR() ? `${v.replace('.', ',')} ${cur().sym.trim()}` : cur().sym + v; };
  const num = n => n.toLocaleString(isFR() ? 'fr-FR' : 'en-GB');
  const rate1 = r => isFR() ? r.toFixed(1).replace('.', ',') : r.toFixed(1);

  function price(p, cls = '') {
    const c = cur(), v = (p.price * c.rate).toFixed(2);
    const [whole, frac] = v.split('.');
    if (isFR()) return `<span class="price price--fr ${cls}" aria-label="${whole},${frac} ${c.sym.trim()}"><span class="price__whole">${whole}</span><span class="price__frac">,${frac}</span><span class="price__sym">${c.sym.trim()}</span></span>`;
    return `<span class="price ${cls}" aria-label="${c.sym}${v}"><span class="price__sym">${c.sym.trim()}</span><span class="price__whole">${whole}</span><span class="price__frac">${frac}</span></span>`;
  }

  function stars(p, withCount = true) {
    const pct = (p.rating / 5) * 100;
    return `<span class="rating"><span class="rating__num">${rate1(p.rating)}</span><span class="stars" role="img" aria-label="${p.rating} out of 5 stars"><span class="stars__fill" style="width:${pct}%"></span></span>${withCount ? `<a class="rating__count" href="#/p/${p.id}/reviews">${num(p.reviews)}</a>` : ''}</span>`;
  }

  const primeBadge = `<span class="prime" aria-label="Prime"><svg viewBox="0 0 16 12" width="14" height="11" aria-hidden="true"><path d="M1.5 6.5 6 10.5 14.5 1.5" fill="none" stroke="#F59E0B" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>prime</span>`;

  const soldBy = `<span class="soldby"><svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M8 1 2 3.5V8c0 3.3 2.6 6.2 6 7 3.4-.8 6-3.7 6-7V3.5z" fill="#007185"/><path d="m5.2 8 2 2 3.8-4" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>Sold by Amazon</span>`;

  const parity = `<span class="parity" title="Same price as on aesop.fr">aesop.fr price</span>`;

  const delivery = () => `<p class="delivery">${primeBadge} FREE delivery <b>Tomorrow, ${tomorrowShort}</b></p>`;

  function addBtn(p, label = 'Add to basket', cls = '') {
    return `<button type="button" class="add-btn ${cls}" data-add="${p.id}">${label}</button>`;
  }

  /* ---------- product tile (the Amazon store grid card) ---------- */

  function tile(p, opts = {}) {
    return `<article class="tile">
      <a class="tile__img" href="#/p/${p.id}" aria-label="${esc(p.name)}, view details">
        ${productSVG(p, { decorative: true })}
        ${p.subscribe ? '<span class="tile__flag">Subscribe &amp; refill</span>' : ''}
      </a>
      <a class="tile__look" href="#/p/${p.id}" data-quick="${p.id}" aria-label="Quick look: ${esc(p.name)}">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3.4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
      </a>
      <div class="tile__body">
        <p class="tile__brand">AESOP</p>
        <h3 class="tile__title"><a href="#/p/${p.id}">${esc(p.name)}, ${esc(p.size)}</a></h3>
        ${stars(p)}
        <div class="tile__price">${price(p)} ${parity}</div>
        ${soldBy}
        ${opts.prime ? delivery() : ''}
        ${addBtn(p)}
      </div>
    </article>`;
  }

  function grid(list, opts = {}) {
    return `<div class="grid" data-grid>${list.map(p => tile(p, opts)).join('')}</div>`;
  }

  function carousel(list, title, opts = {}) {
    return `<section class="block">
      <div class="block__head"><h2 class="block__title">${title}</h2>${opts.link ? `<a class="block__link" href="${opts.link}">See all</a>` : ''}</div>
      <div class="carousel">
        <button type="button" class="carousel__btn carousel__btn--prev" data-scroll="-1" aria-label="Previous products">‹</button>
        <div class="carousel__track">${list.map(p => tile(p, opts)).join('')}</div>
        <button type="button" class="carousel__btn carousel__btn--next" data-scroll="1" aria-label="Next products">›</button>
      </div>
    </section>`;
  }

  function chips(name, options) {
    return `<div class="chips" role="group" aria-label="Filter products" data-chips="${name}">
      ${options.map((o, i) => `<button type="button" class="chip" aria-pressed="${i === 0}" data-filter="${o.key}">${o.label}</button>`).join('')}
    </div>`;
  }

  function pitchNote(key) {
    return notes[key] ? `<aside class="pitch-note"><b>Pitch note</b>${esc(notes[key])}</aside>` : '';
  }

  // With a photo the banner becomes Aesop's 50/50 split: copy panel beside the image.
  // photoDark sets the copy panel to the dark tone that suits that photo.
  function banner({ key, title, lede, product, dark, photoDark = dark, side = '', cls = '' }) {
    // A finished banner (img/banner-<key>-full.*) already has the title in the picture: show it whole,
    // and keep the heading for screen readers and search
    const full = found[`banner-${key}-full`];
    if (full) return `<section class="banner banner--full ${cls}">
        <img class="banner__full" src="${esc(full)}" alt="">
        <h1 class="visually-hidden">${title}</h1>${lede ? `<p class="visually-hidden">${lede}</p>` : ''}${side}
      </section>`;
    const photo = found['banner-' + key];
    const isDark = photo ? photoDark : dark;
    return `<section class="banner ${isDark ? 'banner--dark' : ''} ${photo ? 'banner--photo' : ''} ${cls}">
      <div class="banner__art">${photo ? cover(photo) : scene({ w: 1200, h: 420, product, dark, px: 0.74, scale: 0.92, plinthW: 330, align: 'xMaxYMid' })}</div>
      <div class="banner__copy">
        <h1 class="banner__title">${title}</h1>
        ${lede ? `<p class="banner__lede">${lede}</p>` : ''}
        ${side}
      </div>
    </section>`;
  }

  /* ---------- video banner (Amazon Stores "background video" tile) ---------- */

  const pauseIcon = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/></svg>';
  const playIcon = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/></svg>';

  function videoBanner() {
    const v = window.AESOP.media.homeVideo;
    const src = v.src || found.bannerVideo;
    const still = reduceMotion.matches;
    // Priority: real video, then a still with slow camera motion, then the animated illustration
    const motion = !src && found['banner-motion'];
    const media = src
      ? coverVideo(src, v.poster || found['video-poster'])
      : motion ? cover(motion)
      : scene({ w: 1600, h: 600, product: byId('reverence-hand-wash'), px: 0.74, scale: 1.2, plinthW: 520, animated: true, align: 'xMaxYMid' });
    return `<section class="vbanner ${still ? 'is-paused' : ''} ${src || motion ? 'vbanner--real vbanner--dark' : ''}" aria-label="Brand video">
      <div class="vbanner__media">${media}</div>
      <div class="vbanner__copy">
        <h2>A ritual for hard-working hands</h2>
        <p>Reverence Aromatique Hand Wash, at the aesop.fr price and delivered tomorrow with Prime.</p>
        <a class="dark-btn dark-btn--on-dark" href="#/hand-body">Shop Hand &amp; Body</a>
      </div>
      <button type="button" class="vbanner__toggle" data-video-toggle aria-label="${still ? 'Play video' : 'Pause video'}">${still ? playIcon : pauseIcon}</button>
    </section>`;
  }

  const soundOffIcon = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="m16 9 5 6m0-6-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const soundOnIcon = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  /* ---------- pages ---------- */

  const pages = {};

  pages[''] = () => {
    const focus = products.filter(p => p.focus);
    const tints = { 'reverence-hand-wash': 'sand', 'marrakech-intense': 'ember', 'post-poo-drops': 'stone' };
    const proof = {
      'reverence-hand-wash': '<span class="proof">Subscribe &amp; refill available</span>',
      'marrakech-intense': '<span class="proof">Authentic stock, Transparency-coded</span>',
      'post-poo-drops': '<span class="proof">Our most-gifted formulation</span>'
    };
    const bestsellers = [...products].sort((a, b) => b.reviews - a.reviews);
    const cats = [
      { route: 'hand-body', label: 'Hand & Body', p: byId('resurrection-hand-balm') },
      { route: 'fragrance', label: 'Fragrance', p: byId('marrakech-intense'), dark: true },
      { route: 'for-the-home', label: 'For the home', p: byId('ptolemy-candle') },
      { route: 'gifts', label: 'Gifts', p: byId('arms-outstretched') }
    ];

    const giftPhoto = found['banner-campaign'] || found['banner-gifts'] || found['cat-gifts'];
    const giftPoster = found['brand-film-poster'] || giftPhoto;
    // A film sits beside the copy (split) so its baked-in captions stay visible; a wide photo goes full-bleed behind the copy
    const fullBleed = !found.giftVideo && !!found['banner-campaign'];
    return `
      <section class="campaign bleed ${fullBleed ? 'campaign--photo' : ''} ${found.giftVideo ? 'campaign--video' : ''}" aria-label="2026 Gift Guide">
        <div class="campaign__copy">
          <h1 class="campaign__title">The 2026 Gift&nbsp;Guide</h1>
          <p class="campaign__lede">Considered gifts at the aesop.fr price, delivered tomorrow with Prime.</p>
          <a class="campaign__btn" href="#/gifts">Shop the Gift Guide</a>
        </div>
        <div class="campaign__art" data-video-host>
          ${found.giftVideo ? coverVideo(found.giftVideo, giftPoster) : giftPhoto ? cover(giftPhoto) : scene({ w: 900, h: 560, product: byId('arms-outstretched'), px: 0.5, scale: 1.1, plinthW: 380, dark: true })}
          ${found.giftVideo ? `<button type="button" class="vbanner__toggle" data-video-toggle aria-label="${reduceMotion.matches ? 'Play video' : 'Pause video'}">${reduceMotion.matches ? playIcon : pauseIcon}</button>
          <button type="button" class="vbanner__toggle vbanner__sound" data-video-sound aria-label="Turn sound on">${soundOffIcon}</button>` : ''}
        </div>
      </section>
      ${pitchNote('')}
      <section class="intro">
        <p class="intro__line">Formulations for skin, hair and body, made in Melbourne since 1987. Now sold by Amazon, at the same price as aesop.fr.</p>
      </section>

      <section class="trust" aria-label="Why buy here">
        <div class="trust__item">
          <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3 5 7.5v8c0 6.2 4.7 11.6 11 13 6.3-1.4 11-6.8 11-13v-8z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m11 16 3.5 3.5L21.5 12" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
          <p><b>Ships from and sold by Amazon</b>No third-party resellers in this store.</p>
        </div>
        <div class="trust__item">
          <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 16 16 4h11v11L15 27z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="21.5" cy="9.5" r="2" fill="currentColor"/></svg>
          <p><b>The aesop.fr price</b>€39 for the hand wash, not €79.</p>
        </div>
        <div class="trust__item">
          <svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="5" width="22" height="22" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 9h4v4H9zM19 9h4v4h-4zM9 19h4v4H9zM16 16h2v2h-2zM20 19h3v4h-3z" fill="currentColor"/></svg>
          <p><b>Authentic, traceable stock</b>Brand Registry and Transparency codes.</p>
        </div>
        <div class="trust__item">
          <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 9h16v13H3zM19 13h5l4 4v5h-9z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="8.5" cy="23.5" r="2.5" fill="#fff" stroke="currentColor" stroke-width="1.6"/><circle cx="23.5" cy="23.5" r="2.5" fill="#fff" stroke="currentColor" stroke-width="1.6"/></svg>
          <p><b>Delivered tomorrow</b>Free with Prime, gift options at checkout.</p>
        </div>
      </section>

      <section class="block">
        <div class="block__head"><h2 class="block__title">Three to begin with</h2></div>
        <div class="features">
          ${focus.map(p => `
            <article class="feature feature--${tints[p.id]}">
              <a class="feature__img" href="#/p/${p.id}" aria-label="${esc(p.name)}, view details">${productSVG(p, { decorative: true })}</a>
              <div class="feature__body">
                <h3 class="feature__name"><a href="#/p/${p.id}">${esc(p.name)}</a></h3>
                <p class="feature__tag">${esc(p.tagline)}</p>
                ${stars(p)}
                <div class="tile__price">${price(p)} <span class="feature__size">${esc(p.size)}</span> ${parity}</div>
                ${soldBy}
                ${proof[p.id]}
                ${addBtn(p)}
              </div>
            </article>`).join('')}
        </div>
      </section>

      ${videoBanner()}

      <section class="block">
        <div class="block__head"><h2 class="block__title">Explore the store</h2></div>
        <div class="cats">
          ${cats.map(c => `
            <a class="cat ${c.dark ? 'cat--dark' : ''} ${found['cat-' + c.route] ? 'cat--photo' : ''}" href="#/${c.route}">
              <span class="cat__art">${found['cat-' + c.route] ? cover(found['cat-' + c.route]) : scene({ w: 600, h: 520, product: c.p, dark: c.dark, px: 0.5, scale: 1.05, plinthW: 300, withVase: false })}</span>
              <span class="cat__label">${c.label}</span>
            </a>`).join('')}
        </div>
      </section>

      ${carousel(bestsellers, 'Best sellers')}

      <section class="quiz-cta">
        <div class="quiz-cta__copy">
          <h2>Not sure where to start?</h2>
          <p>Answer four short questions and we will suggest three formulations, the way a consultant would in one of our stores.</p>
          <a class="dark-btn" href="#/ritual">Find your ritual</a>
        </div>
        <div class="quiz-cta__art" aria-hidden="true">
          ${['resurrection-hand-balm', 'reverence-hand-wash', 'tacit'].map(id => productSVG(byId(id), { decorative: true })).join('')}
        </div>
      </section>

      <section class="values-teaser">
        <p>Certified B Corporation since 2020. Leaping Bunny approved, never tested on animals. Refills, not discounts.</p>
        <a href="#/values">Read about our values</a>
      </section>`;
  };

  pages['hand-body'] = () => {
    const list = products.filter(p => p.cat === 'hand' || p.cat === 'body');
    const steps = [
      { p: byId('reverence-hand-wash'), verb: 'Cleanse', text: 'Pumice gently lifts the day off your hands.' },
      { p: byId('resurrection-hand-balm'), verb: 'Soften', text: 'A light balm that absorbs in seconds.' },
      { p: byId('geranium-body-cleanser'), verb: 'Shower', text: 'A gentle Geranium Leaf cleanser for the body.' }
    ];
    const wash = byId('reverence-hand-wash');
    return `
      ${pitchNote('hand-body')}
      ${banner({ key: 'hand-body', photoDark: true, title: 'Hand &amp; Body', lede: 'Gentle formulations, quiet aromas and a routine you can actually keep.', product: byId('resurrection-hand-balm') })}

      <section class="block">
        <div class="block__head"><h2 class="block__title">A routine in three steps</h2></div>
        <ol class="routine" role="list">
          ${steps.map((s, i) => `
            <li class="routine__step">
              <span class="routine__num">${i + 1}</span>
              <a class="routine__img" href="#/p/${s.p.id}" aria-label="${esc(s.p.name)}">${productSVG(s.p, { decorative: true })}</a>
              <div>
                <h3>${s.verb}</h3>
                <p>${s.text}</p>
                <p class="routine__product"><a href="#/p/${s.p.id}">${esc(s.p.name)}</a> ${price(s.p, 'price--sm')}</p>
              </div>
            </li>`).join('')}
        </ol>
      </section>

      <section class="subscribe-band">
        <div class="subscribe-band__img">${productSVG(wash, { decorative: true })}</div>
        <div class="subscribe-band__copy">
          <h2>Never run out of hand wash</h2>
          <p>Subscribe to Reverence Aromatique Hand Wash and a 500 mL refill arrives every two months. Skip or cancel any time.</p>
          <div class="sns">
            <label class="sns__opt"><input type="radio" name="sns-band" value="sub" checked> <span><b>Subscribe &amp; refill</b> every 2 months<small>Same price, delivered before you run out.</small></span> ${price(wash, 'price--sm')}</label>
            <label class="sns__opt"><input type="radio" name="sns-band" value="once"> <span><b>One-time purchase</b></span> ${price(wash, 'price--sm')}</label>
          </div>
          ${addBtn(wash, 'Set up subscription')}
        </div>
      </section>

      <section class="block">
        <div class="block__head"><h2 class="block__title">All hand &amp; body</h2>
          ${chips('hb', [
            { key: 'all', label: 'All' }, { key: 'hand', label: 'Hands' }, { key: 'body', label: 'Body' },
            { key: 'light', label: 'Light aroma' }, { key: 'refill', label: 'Refills &amp; subscribe' }])}
        </div>
        ${grid(list)}
      </section>`;
  };

  pages['fragrance'] = () => {
    const m = byId('marrakech-intense');
    const list = products.filter(p => p.cat === 'fragrance');
    return `
      ${pitchNote('fragrance')}
      ${banner({
        key: 'fragrance', title: 'Marrakech Intense', dark: true, product: m,
        lede: 'Clove, cardamom, jasmine and sandalwood. A warm, spiced eau de parfum for day and night.',
        side: `<div class="banner__buy">${price(m)} <span class="banner__size">50 mL</span> ${parity}</div><div class="banner__actions">${addBtn(m)} <a class="banner__link" href="#/p/${m.id}">See details</a></div>`
      })}

      <section class="families" aria-label="Fragrance families">
        <div class="family"><h3>Woody</h3><p>Smoky, grounding, warm. Hwyl and Marrakech Intense.</p></div>
        <div class="family"><h3>Fresh</h3><p>Citrus, herbs, sea air. Tacit and Karst.</p></div>
        <div class="family"><h3>Not sure?</h3><p>Four questions, three suggestions. <a href="#/ritual">Find your ritual</a></p></div>
      </section>

      <section class="block">
        <div class="block__head"><h2 class="block__title">Eaux de parfum</h2>
          ${chips('fr', [{ key: 'all', label: 'All' }, { key: 'Woody', label: 'Woody' }, { key: 'Fresh', label: 'Fresh' }])}
        </div>
        ${grid(list)}
      </section>`;
  };

  pages['for-the-home'] = () => {
    const pp = byId('post-poo-drops');
    const list = products.filter(p => p.cat === 'home');
    return `
      ${pitchNote('for-the-home')}
      ${banner({
        key: 'for-the-home', title: 'Post-Poo Drops', product: pp,
        lede: 'A few drops in the bowl after you flush. The next visitor will never know.',
        side: `<div class="banner__buy">${price(pp)} <span class="banner__size">100 mL</span> ${parity}</div><div class="banner__actions">${addBtn(pp)} <a class="banner__link" href="#/p/${pp.id}">See details</a></div>`
      })}

      <section class="block">
        <div class="block__head"><h2 class="block__title">How to use</h2></div>
        <ol class="howto" role="list">
          <li><span class="routine__num">1</span><p>Flush, then add a few drops to the bowl.</p></li>
          <li><span class="routine__num">2</span><p>Tangerine peel, ylang-ylang and mandarin peel mask what lingers.</p></li>
          <li><span class="routine__num">3</span><p>The next visitor walks into a bright, citrus-fresh room.</p></li>
        </ol>
      </section>

      <section class="block">
        <div class="block__head"><h2 class="block__title">For the home</h2></div>
        ${grid(list)}
      </section>`;
  };

  pages['gifts'] = () => {
    const list = products.filter(p => p.gift).sort((a, b) => a.price - b.price);
    return `
      ${pitchNote('gifts')}
      <section class="gift-hero">
        <div class="gift-hero__copy">
          <p class="gift-hero__prime">${primeBadge}</p>
          <h1>Delivered tomorrow with Prime</h1>
          <p>Order by 23:59 tonight and your gift arrives <b>${tomorrow}</b>. Add a message and hide the price at checkout.</p>
        </div>
        <div class="gift-hero__art">${found['banner-gifts'] ? cover(found['banner-gifts']) : scene({ w: 900, h: 420, product: byId('arms-outstretched'), px: 0.55, scale: 0.95, plinthW: 360 })}</div>
      </section>

      <section class="block">
        <div class="block__head"><h2 class="block__title">Gifts by budget</h2>
          ${chips('gift', [
            { key: 'all', label: 'All gifts' }, { key: 'u50', label: 'Under €50' },
            { key: '50-100', label: '€50 to €100' }, { key: 'o100', label: 'Over €100' }])}
        </div>
        ${grid(list, { prime: true })}
      </section>

      <section class="gift-notes">
        <div><h3>Gift wrap</h3><p>Choose gift wrap at checkout. Every Aesop parcel ships in a plain outer box.</p></div>
        <div><h3>Gift receipt</h3><p>Prices are hidden on the packing slip so the recipient can return or exchange.</p></div>
        <div><h3>Returns until 31 January</h3><p>Christmas purchases can be returned until the end of January.</p></div>
      </section>`;
  };

  /* ----- Find your ritual quiz ----- */

  const quizQs = [
    { key: 'where', q: 'Where would you like to begin?', opts: [
      { v: 'hand', label: 'My hands', sub: 'Washes and balms' },
      { v: 'body', label: 'My body', sub: 'Cleansers and balms' },
      { v: 'home', label: 'My home', sub: 'Room sprays, candles, the bathroom' },
      { v: 'fragrance', label: 'A scent to wear', sub: 'Eaux de parfum' }] },
    { key: 'aroma', q: 'Which aromas draw you in?', opts: [
      { v: 'woody', label: 'Woody and smoky', sub: 'Vetiver, cedar, frankincense' },
      { v: 'fresh', label: 'Fresh and citrus', sub: 'Mandarin, yuzu, herbs' },
      { v: 'opulent', label: 'Warm and spiced', sub: 'Clove, cardamom, jasmine' },
      { v: 'light', label: 'Barely there', sub: 'Quiet aromas that stay close' }] },
    { key: 'who', q: 'Who is it for?', opts: [
      { v: 'me', label: 'For me', sub: 'Everyday use' },
      { v: 'gift', label: 'A gift', sub: 'Delivered tomorrow with Prime' }] },
    { key: 'care', q: 'What matters most to you?', opts: [
      { v: 'refill', label: 'Less packaging', sub: 'Refills and subscriptions' },
      { v: 'vegan', label: 'Cruelty-free', sub: 'Every formulation is Leaping Bunny approved' },
      { v: 'simple', label: 'Keeping it simple', sub: 'One or two products, no fuss' }] }
  ];
  let quiz = { step: 0, answers: {} };

  function quizResults() {
    const a = quiz.answers;
    const scored = products.map(p => {
      let s = 0;
      const why = [];
      const cat = p.cat === 'gift' ? 'hand' : p.cat;
      if (cat === a.where) { s += 4; }
      if (p.aromas.includes(a.aroma)) { s += 3; why.push(p.aromaText.split('.')[0].toLowerCase() + ' aroma'); }
      if (a.aroma === 'light' && p.light) { s += 2; }
      if (a.who === 'gift' && p.gift) { s += 2; why.push('gift-ready, here tomorrow'); }
      if (a.care === 'refill' && (p.refill || p.subscribe)) { s += 2; why.push('refill available'); }
      if (a.care === 'simple' && p.price < 60) { s += 1; }
      return { p, s, why };
    }).sort((x, y) => y.s - x.s || y.p.reviews - x.p.reviews);
    return scored.slice(0, 3);
  }

  function quizView() {
    if (quiz.step < quizQs.length) {
      const q = quizQs[quiz.step];
      return `<div class="quiz__card">
        <div class="quiz__progress" aria-hidden="true"><span style="width:${(quiz.step / quizQs.length) * 100}%"></span></div>
        <p class="quiz__count">Question ${quiz.step + 1} of ${quizQs.length}</p>
        <h2 class="quiz__q" tabindex="-1">${q.q}</h2>
        <div class="quiz__opts">
          ${q.opts.map(o => `<button type="button" class="quiz__opt ${quiz.answers[q.key] === o.v ? 'is-picked' : ''}" data-quiz="${q.key}" data-value="${o.v}"><b>${o.label}</b><span>${o.sub}</span></button>`).join('')}
        </div>
        ${quiz.step > 0 ? '<button type="button" class="text-btn" data-quiz-back>Back</button>' : ''}
      </div>`;
    }
    const res = quizResults();
    const veganLine = quiz.answers.care === 'vegan' ? '<p class="quiz__aside">Good news: every Aesop formulation is Leaping Bunny approved, certified cruelty-free.</p>' : '';
    return `<div class="quiz__card quiz__card--result">
      <div class="quiz__progress" aria-hidden="true"><span style="width:100%"></span></div>
      <h2 class="quiz__q" tabindex="-1">Your ritual</h2>
      <p class="quiz__intro">Based on your answers, these three would suit you.</p>
      ${veganLine}
      <div class="quiz__results">
        ${res.map(({ p, why }) => `
          <article class="quiz__pick">
            <a class="quiz__pick-img" href="#/p/${p.id}" aria-label="${esc(p.name)}">${productSVG(p, { decorative: true })}</a>
            <h3><a href="#/p/${p.id}">${esc(p.name)}</a></h3>
            <p class="quiz__why">${why.length ? 'Why: ' + esc(why.slice(0, 2).join(', ')) + '.' : esc(p.tagline)}</p>
            ${stars(p)}
            <div class="tile__price">${price(p)} ${parity}</div>
            ${addBtn(p)}
          </article>`).join('')}
      </div>
      <button type="button" class="text-btn" data-quiz-restart>Start again</button>
    </div>`;
  }

  pages['ritual'] = () => `
    ${pitchNote('ritual')}
    <section class="quiz-head">
      <h1>Find your ritual</h1>
      <p>In our stores, a consultant asks a few questions before suggesting anything. This does the same, in under a minute.</p>
    </section>
    <section class="quiz" id="quiz">${quizView()}</section>`;

  pages['values'] = () => `
    ${pitchNote('values')}
    <section class="values-hero">
      <h1>Our values</h1>
      <p>We make formulations for skin, hair and body with the same care we give to the stores that sell them. Joining Amazon.fr changes where you can buy Aesop, not how it is made or what it costs.</p>
    </section>
    ${found.hero ? `<figure class="values-photo bleed-soft">${cover(found.hero)}<figcaption>Aesop, rue des Francs-Bourgeois, Paris. The same formulations, now also delivered tomorrow by Amazon.</figcaption></figure>` : ''}
    <section class="values">
      <article class="value value--wide">
        <div class="value__mark" aria-hidden="true"><span>B</span></div>
        <div><h2>Certified B Corporation</h2><p>Aesop was certified in 2020 and renewed in 2024. The certification measures how a company treats its workers, suppliers, community and the environment, not only its products.</p></div>
      </article>
      <article class="value"><h2>Leaping Bunny approved</h2><p>Our formulations are approved and certified cruelty-free under Cruelty Free International's Leaping Bunny programme.</p></article>
      <article class="value"><h2>Refills, not discounts</h2><p>500 mL refills for our hand washes, and Subscribe &amp; refill so you never buy a new bottle you do not need.</p></article>
      <article class="value"><h2>One price, everywhere</h2><p>The price on Amazon.fr is the price on aesop.fr. No promotions, no grey market at double the price.</p></article>
      <article class="value"><h2>Authentic, traceable stock</h2><p>Every unit ships from Amazon with a Transparency code, so you know it came from us and was stored properly.</p></article>
      <article class="value"><h2>Climate Active certified</h2><p>Since 2018, our Australian operations have been certified carbon-neutral under the government's Climate Active scheme.</p></article>
    </section>
    <section class="values-cta">
      <p>Start with the formulation our customers come back to most.</p>
      <a class="dark-btn" href="#/p/resurrection-hand-balm">Resurrection Aromatique Hand Balm</a>
    </section>`;

  /* ----- Product detail page (Amazon listing layout) ----- */

  pages['p'] = id => {
    const p = byId(id);
    if (!p) return `<section class="empty"><h1>This product is not in the store</h1><p><a href="#/">Go back to the Aesop store home</a></p></section>`;
    const crumbs = { hand: 'Hand Care', body: 'Bath & Body', fragrance: 'Fragrance', home: 'Home Fragrance', gift: 'Gift Sets' };
    // "From the brand" uses the campaign photo for the product's category when one exists
    const aplusPhoto = { hand: found['banner-hand-body'], body: found['banner-hand-body'], fragrance: found['banner-fragrance'],
      home: found['cat-for-the-home'], gift: found['banner-gifts'] }[p.cat];
    const related = products.filter(x => x.id !== p.id && (x.cat === p.cat || x.gift)).slice(0, 8);
    const views = p.photo ? [
      productSVG(p),
      ...p.gallery.map((g, i) => `<img class="pimg pimg--scene" src="${esc(g)}" alt="${esc(p.name)}, view ${i + 2}" loading="lazy">`),
      // A zoomed crop only when there are no real extra photos to show
      ...(p.gallery.length ? [] : [`<div class="pimg-zoom">${productSVG(p, { decorative: true })}</div>`])
    ] : [
      productSVG(p),
      `<svg viewBox="0 0 300 360" class="pimg" aria-hidden="true"><g transform="translate(-150 -230) scale(2)">${window.ART.productGroup(p)}</g></svg>`,
      scene({ w: 600, h: 720, product: p, px: 0.5, scale: 1.2, plinthW: 380, withVase: true })
    ];
    // Like Amazon: up to 7 thumbnails, the last one turns into "+N" and opens the full view
    const MAX_THUMBS = 7;
    const shown = views.length > MAX_THUMBS ? MAX_THUMBS - 1 : views.length;
    const thumbs = views.slice(0, shown).map((v, i) =>
      `<button type="button" class="pdp__thumb" role="tab" aria-selected="${i === 0}" data-view="${i}" aria-label="Image ${i + 1} of ${views.length}">${v}</button>`).join('')
      + (views.length > shown
        ? `<button type="button" class="pdp__thumb pdp__thumb--more" data-viewer="${shown}" aria-label="See all ${views.length} images">${views[shown]}<span class="pdp__more" aria-hidden="true">+${views.length - shown}</span></button>`
        : '');
    return `
      ${pitchNote('product')}
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Beauty</a> › <a href="#/">Luxury Beauty</a> › <a href="#/${p.cat === 'fragrance' ? 'fragrance' : p.cat === 'home' ? 'for-the-home' : p.cat === 'gift' ? 'gifts' : 'hand-body'}">${crumbs[p.cat]}</a></nav>
      <section class="pdp">
        <div class="pdp__gallery">
          <div class="pdp__thumbs" role="tablist" aria-label="Product images">
            ${thumbs}
          </div>
          <button type="button" class="pdp__main" id="pdpMain" data-viewer="0" aria-label="Open full view of image 1">${views[0]}</button>
          <p class="pdp__hint">Click image to open expanded view</p>
          <template id="pdpViews">${views.map(v => `<div>${v}</div>`).join('')}</template>
        </div>

        <div class="pdp__info">
          <h1 class="pdp__title">Aesop ${esc(p.name)}, ${esc(p.size)}</h1>
          <a class="pdp__store" href="#/">Visit the Aesop Store</a>
          <div class="pdp__rating">${stars(p)} <span class="pdp__badge">Official Aesop store</span></div>
          <hr>
          <div class="pdp__price">${price(p, 'price--lg')}</div>
          <p class="pdp__parity">Same price as aesop.fr. All prices include VAT.</p>
          ${p.subscribe ? `
          <div class="sns sns--pdp">
            <label class="sns__opt"><input type="radio" name="sns-pdp" value="once" checked> <span><b>One-time purchase</b></span> ${price(p, 'price--sm')}</label>
            <label class="sns__opt"><input type="radio" name="sns-pdp" value="sub"> <span><b>Subscribe &amp; refill</b><small>A 500 mL refill every 2 months. Skip or cancel any time.</small></span> ${price(p, 'price--sm')}</label>
          </div>` : ''}
          <dl class="pdp__facts">
            <div><dt>Brand</dt><dd>Aesop</dd></div>
            <div><dt>Size</dt><dd>${esc(p.size)}</dd></div>
            <div><dt>Aroma</dt><dd>${esc(p.aromaText)}</dd></div>
            <div><dt>Made in</dt><dd>Australia</dd></div>
          </dl>
          <hr>
          <h2 class="pdp__about">About this item</h2>
          <ul class="pdp__bullets">${p.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
        </div>

        <aside class="buybox" aria-label="Buying options">
          <div class="buybox__price">${price(p, 'price--lg')}</div>
          <p class="delivery">${primeBadge}</p>
          <p class="buybox__line">FREE delivery <b>${tomorrow}</b>. Order within <span class="buybox__green">6 hrs 12 mins</span>.</p>
          <button type="button" class="buybox__loc" data-open="location"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg> Deliver to <span data-loc-label>Paris 75011</span></button>
          <p class="buybox__stock">In stock</p>
          <label class="buybox__qty">Quantity <select data-qty>${[1,2,3,4,5,6,7,8,9,10].map(n => `<option>${n}</option>`).join('')}</select></label>
          ${addBtn(p, 'Add to basket', 'add-btn--wide')}
          <button type="button" class="buy-now" data-buy="${p.id}">Buy Now</button>
          <dl class="buybox__seller">
            <div><dt>Ships from</dt><dd>Amazon</dd></div>
            <div><dt>Sold by</dt><dd>Amazon</dd></div>
            <div><dt>Returns</dt><dd>Returnable within 30 days</dd></div>
            <div><dt>Packaging</dt><dd>Ships in plain outer box</dd></div>
          </dl>
          <label class="buybox__gift"><input type="checkbox" data-gift> Add gift options</label>
          <button type="button" class="pill-btn pill-btn--wide buybox__list" data-list="${p.id}">Add to List</button>
        </aside>
      </section>

      <section class="aplus">
        <h2 class="block__title">From the brand</h2>
        <div class="aplus__banner ${aplusPhoto ? 'aplus__banner--photo' : ''}">
          <div class="aplus__art">${aplusPhoto ? cover(aplusPhoto) : scene({ w: 1200, h: 380, product: p.photo ? null : p, dark: p.cat === 'fragrance', px: 0.75, scale: 0.85, plinthW: 300 })}${!aplusPhoto && p.photo ? `<img class="aplus__photo" src="${esc(p.photo)}" alt="">` : ''}</div>
          <div class="aplus__copy">
            <p class="aesop-logo aesop-logo--sm">A&#275;sop.</p>
            <p>${esc(p.tagline)}</p>
          </div>
        </div>
      </section>

      ${reviewsBlock(p)}

      ${carousel(related, 'Customers who viewed this item also viewed')}`;
  };

  // Rating breakdown derived from the placeholder average, so bars and stars always agree
  function reviewsBlock(p) {
    const p5 = Math.max(40, Math.min(85, Math.round(55 + (p.rating - 4.5) * 60)));
    const p4 = Math.round((100 - p5) * 0.6);
    const p3 = Math.round((100 - p5 - p4) * 0.55);
    const p2 = Math.round((100 - p5 - p4 - p3) * 0.5);
    const bars = [[5, p5], [4, p4], [3, p3], [2, p2], [1, 100 - p5 - p4 - p3 - p2]];
    const mine = window.STORE.myReview?.(p.id);
    return `<section class="reviews" id="reviews">
      <h2 class="block__title">Customer reviews</h2>
      <div class="reviews__grid">
        <div class="reviews__summary">
          ${stars(p, false)}
          <p class="reviews__avg">${rate1(p.rating)} out of 5</p>
          <p class="reviews__total">${num(p.reviews + (mine ? 1 : 0))} global ratings</p>
          <table class="reviews__bars"><tbody>${bars.map(([n, pct]) => `<tr><th scope="row">${n} star</th><td><span class="reviews__bar"><span style="width:${pct}%"></span></span></td><td>${pct}%</td></tr>`).join('')}</tbody></table>
        </div>
        <div class="reviews__note">
          <h3>Review this product</h3>
          <p>Share your thoughts with other customers.</p>
          <a class="pill-btn pill-btn--wide" href="#/review/${p.id}">${mine ? 'Edit your review' : 'Write a product review'}</a>
          <p class="reviews__fine">Star ratings are placeholders for this concept. Reviews written here are saved in this browser only.</p>
        </div>
      </div>
      ${window.STORE.reviewsList?.(p) || ''}
    </section>`;
  }

  pages['search'] = q => {
    const term = decodeURIComponent(q || '').trim();
    const t = term.toLowerCase();
    const res = products.filter(p => (p.name + ' ' + p.aromaText + ' ' + p.cat + ' ' + (p.family || '')).toLowerCase().includes(t));
    return `
      ${pitchNote('search')}
      <section class="search-head"><h1>${res.length} result${res.length === 1 ? '' : 's'} for "<span>${esc(term)}</span>" in Aesop</h1></section>
      ${res.length ? `<section class="block">${grid(res)}</section>` :
        `<section class="empty"><p>No Aesop products match "${esc(term)}". Try "hand", "balm", "woody" or "candle", or <a href="#/ritual">find your ritual</a>.</p></section>`}`;
  };

  /* ---------- router ---------- */

  function parse() {
    const h = location.hash.replace(/^#\/?/, '');
    const [route, arg, extra] = h.split('/');
    return { route: route || '', arg, extra };
  }

  const caret = '<svg class="store-nav__caret" viewBox="0 0 10 6" width="10" height="6" aria-hidden="true"><path d="M0 0h10L5 6z" fill="currentColor"/></svg>';
  function renderTabs(active) {
    $('#storeTabs').innerHTML = tabs.map(t => {
      const current = t.route === active ? 'aria-current="page"' : '';
      if (!t.menu) return `<li><a href="#/${t.route}" class="store-nav__tab" ${current}>${esc(t.label)}</a></li>`;
      return `<li class="store-nav__item has-menu">
        <a href="#/${t.route}" class="store-nav__tab" ${current} aria-haspopup="true">${esc(t.label)}${caret}</a>
        <div class="store-nav__menu">
          ${t.menu.map(m => `<a href="#/${t.route}/${encodeURIComponent(m.filter)}">${esc(m.label)}</a>`).join('')}
        </div>
      </li>`;
    }).join('');
  }

  function render() {
    const { route, arg, extra } = parse();
    if (route === 'top') return; // footer "Back to top" link
    const view = pages[route] || pages[''];
    page.innerHTML = view(arg, extra);
    renderTabs(pages[route] ? route : '');
    const tabLabel = (tabs.find(t => t.route === route) || {}).label;
    document.title = route === 'p' && byId(arg) ? `Aesop ${byId(arg).name} | Amazon.fr concept` :
      titles[route] ? `${titles[route]} | Amazon.fr concept` :
      `${tabLabel && route ? tabLabel + ' | ' : ''}Aesop Store Concept on Amazon.fr`;
    // A dropdown link like #/hand-body/light opens the page with that filter chip applied
    const chip = arg && route !== 'p' && route !== 'search' && page.querySelector(`[data-filter="${CSS.escape(decodeURIComponent(arg))}"]`);
    if (chip) chip.click();
    window.scrollTo({ top: 0 });
    page.focus({ preventScroll: true });
    // A third segment names a section to jump to, e.g. #/p/<id>/reviews
    if (extra && document.getElementById(extra)) document.getElementById(extra).scrollIntoView();
    hooks.forEach(fn => fn(route, arg));
    // Videos inserted via innerHTML do not always honour autoplay, so start it explicitly
    if (!reduceMotion.matches) page.querySelectorAll('video').forEach(v => v.play().catch(() => {}));
  }

  /* ---------- interactions ---------- */

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.innerHTML = msg;
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-on'), 2600);
  }

  function applyFilter(group, key) {
    const gridEl = group.closest('.block').querySelector('[data-grid]');
    const name = group.dataset.chips;
    const tilesEl = [...gridEl.children];
    const list = name === 'hb' ? products.filter(p => p.cat === 'hand' || p.cat === 'body') :
      name === 'fr' ? products.filter(p => p.cat === 'fragrance') :
      products.filter(p => p.gift).sort((a, b) => a.price - b.price);
    list.forEach((p, i) => {
      let show = key === 'all';
      if (name === 'hb') show = show || p.cat === key || (key === 'light' && p.light) || (key === 'refill' && (p.refill || p.subscribe));
      if (name === 'fr') show = show || p.family === key;
      if (name === 'gift') show = show || (key === 'u50' && p.price < 50) || (key === '50-100' && p.price >= 50 && p.price <= 100) || (key === 'o100' && p.price > 100);
      tilesEl[i].hidden = !show;
    });
  }

  document.addEventListener('click', e => {
    const chip = e.target.closest('[data-filter]');
    if (chip) {
      const group = chip.parentElement;
      group.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', c === chip));
      applyFilter(group, chip.dataset.filter);
      return;
    }

    const sc = e.target.closest('[data-scroll]');
    if (sc) {
      const track = sc.parentElement.querySelector('.carousel__track');
      track.scrollBy({ left: Number(sc.dataset.scroll) * track.clientWidth * 0.9, behavior: 'smooth' });
      return;
    }

    const opt = e.target.closest('[data-quiz]');
    if (opt) {
      quiz.answers[opt.dataset.quiz] = opt.dataset.value;
      quiz.step += 1;
      $('#quiz').innerHTML = quizView();
      $('.quiz__q').focus();
      return;
    }
    if (e.target.closest('[data-quiz-back]')) { quiz.step -= 1; $('#quiz').innerHTML = quizView(); $('.quiz__q').focus(); return; }
    if (e.target.closest('[data-quiz-restart]')) { quiz = { step: 0, answers: {} }; $('#quiz').innerHTML = quizView(); $('.quiz__q').focus(); return; }

    const thumb = e.target.closest('[data-view]');
    if (thumb) {
      const views = $('#pdpViews').content.children;
      const main = $('#pdpMain'), n = Number(thumb.dataset.view);
      main.innerHTML = views[n].innerHTML;
      main.dataset.viewer = n;
      main.setAttribute('aria-label', `Open full view of image ${n + 1}`);
      document.querySelectorAll('.pdp__thumb').forEach(t => t.setAttribute('aria-selected', t === thumb));
      return;
    }

    const vs = e.target.closest('[data-video-sound]');
    if (vs) {
      const video = vs.closest('[data-video-host]').querySelector('video');
      video.muted = !video.muted;
      if (!video.muted && video.paused) video.play().catch(() => {});
      vs.setAttribute('aria-label', video.muted ? 'Turn sound on' : 'Turn sound off');
      vs.innerHTML = video.muted ? soundOffIcon : soundOnIcon;
      return;
    }

    const vt = e.target.closest('[data-video-toggle]');
    if (vt) {
      const banner = vt.closest('.vbanner, [data-video-host]');
      const paused = banner.classList.toggle('is-paused');
      const video = banner.querySelector('video');
      if (video) paused ? video.pause() : video.play();
      vt.setAttribute('aria-label', paused ? 'Play video' : 'Pause video');
      vt.innerHTML = paused ? playIcon : pauseIcon;
      return;
    }

    if (e.target.closest('#backToTop')) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  });

  // Hover on thumbnails swaps the main image, like Amazon
  document.addEventListener('mouseover', e => {
    const thumb = e.target.closest('[data-view]');
    if (thumb && !thumb.matches('[aria-selected="true"]')) thumb.click();
  });

  $('#followBtn').addEventListener('click', e => {
    const on = e.currentTarget.getAttribute('aria-pressed') !== 'true';
    e.currentTarget.setAttribute('aria-pressed', on);
    e.currentTarget.textContent = on ? 'Following' : 'Follow';
  });

  // Pitch notes are hidden for normal visitors; open the site with ?notes to show them while presenting
  if (new URLSearchParams(location.search).has('notes')) document.body.classList.add('notes-on');

  $('#shareBtn').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(location.href); toast('<b>Link copied</b> Paste it in your team chat.'); }
    catch { toast('<b>Copy the link</b> from the address bar to share it.'); }
  });

  function searchTo(input) {
    const q = input.value.trim();
    if (q) location.hash = '#/search/' + encodeURIComponent(q);
  }
  $('#storeSearch').addEventListener('submit', e => { e.preventDefault(); searchTo($('#storeSearchInput')); });
  $('#siteSearch').addEventListener('submit', e => { e.preventDefault(); searchTo($('#siteSearchInput')); });

  // Shadow under the sticky store nav once it is stuck
  const nav = $('#storeNav');
  new IntersectionObserver(([en]) => nav.classList.toggle('is-stuck', en.intersectionRatio < 1), { threshold: [1], rootMargin: '-1px 0px 0px 0px' }).observe(nav);

  // Brand band: a looping video/hero.mp4 plays behind the logo if present; otherwise the textured band shows
  const drawHero = () => {
    const hero = $('#heroArt');
    const band = hero.closest('.store-hero');
    // A finished banner (img/hero-banner.*) already carries the logo and tagline, so it is shown whole
    if (found['hero-banner']) {
      band.classList.add('store-hero--banner');
      hero.innerHTML = `<img src="${esc(found['hero-banner'])}" alt="" fetchpriority="high">`;
      return;
    }
    if (!found.heroVideo && !found['hero-band']) return;
    // Two photos: one each side, both fading into a dark centre that holds the logo
    if (!found.heroVideo && found['hero-band-left']) {
      band.classList.add('store-hero--duo');
      hero.innerHTML = `<img class="hero-duo hero-duo--left" src="${esc(found['hero-band-left'])}" alt="">`
        + `<img class="hero-duo hero-duo--right" src="${esc(found['hero-band'])}" alt="">`;
      return;
    }
    band.classList.add('store-hero--photo');
    hero.innerHTML = found.heroVideo ? coverVideo(found.heroVideo, found['hero-band']) : cover(found['hero-band']);
    const v = hero.querySelector('video');
    if (v && !reduceMotion.matches) v.play().catch(() => {});
  };

  // shop.js (basket, checkout, orders, menus) registers its pages, titles and hooks here
  const titles = {};
  const hooks = [];
  window.STORE = { pages, titles, hooks, products, byId, esc, productSVG, price, money, CURRENCIES, stars, primeBadge, soldBy, parity,
    delivery, tile, grid, carousel, toast, render, tomorrow, tomorrowShort, $ };

  window.addEventListener('hashchange', render);
  loadAssets();
  drawHero();
  // Scripts sit at the end of <body>, so DOMContentLoaded fires after shop.js has registered its pages
  document.addEventListener('DOMContentLoaded', render);
})();
