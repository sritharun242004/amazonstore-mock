/*
  SVG product illustrations. Every product is drawn from its `shape` so the whole
  store has one consistent "studio photo" look with no external images.
  All drawings use a 300 x 360 canvas with the product standing at y = 336.
*/
(function () {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // Squeeze long names onto two short label lines
  function splitName(name, max) {
    const words = name.split(' ');
    const lines = [''];
    words.forEach(w => {
      const cur = lines[lines.length - 1];
      if ((cur + ' ' + w).trim().length > max && lines.length < 2) lines.push(w);
      else lines[lines.length - 1] = (cur + ' ' + w).trim();
    });
    return lines;
  }

  // The cream Aesop label: logotype, black name band, small "text" rules
  function label(x, y, w, h, name, opts = {}) {
    const lines = splitName(name, opts.max || 26);
    const fs = opts.fs || 5.6;
    const logo = opts.logo || 15;
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${opts.paper || '#f2ecdf'}"/>`;
    s += `<text x="${x + 7}" y="${y + logo + 4}" font-family="Cormorant Garamond, Georgia, serif" font-size="${logo}" fill="#1a1a1a">A&#275;sop.</text>`;
    const by = y + logo + 10;
    s += `<rect x="${x + 6}" y="${by}" width="${w - 12}" height="${lines.length * (fs + 3) + 4}" fill="#161616"/>`;
    lines.forEach((l, i) => {
      s += `<text x="${x + 9}" y="${by + 2 + (i + 1) * (fs + 2.6)}" font-family="Helvetica, Arial, sans-serif" font-size="${fs}" fill="#f2ecdf">${esc(l)}</text>`;
    });
    let ly = by + lines.length * (fs + 3) + 12;
    while (ly < y + h - 10) {
      const ww = (w - 14) * (0.55 + ((ly * 7) % 40) / 100);
      s += `<rect x="${x + 7}" y="${ly}" width="${ww}" height="1.6" fill="#8d877b" opacity=".55"/>`;
      ly += 6;
    }
    s += `<rect x="${x + 7}" y="${y + h - 7}" width="18" height="1.6" fill="#8d877b" opacity=".6"/>`;
    return s;
  }

  const ground = (w = 130) => `<ellipse cx="150" cy="338" rx="${w}" ry="10" fill="url(#g-ground)"/>`;
  const shine = (x, y, h, w = 9) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w / 2}" fill="url(#g-shine)" opacity=".5"/>`;

  // Boston round amber bottle body (shared by pump / cap / spray)
  const bostonBody = `<path d="M128 104h44v14c0 10 36 15 36 44v156c0 12-8 18-20 18h-76c-12 0-20-6-20-18V162c0-29 36-34 36-44z" fill="url(#g-amber)"/>`;

  const shapes = {
    pump: p => `
      ${ground(92)}
      ${bostonBody}
      ${shine(103, 150, 160)}
      <rect x="125" y="86" width="50" height="22" rx="3" fill="url(#g-black)"/>
      <rect x="144" y="56" width="12" height="32" fill="#151515"/>
      <rect x="128" y="44" width="46" height="15" rx="3" fill="url(#g-black)"/>
      <path d="M130 47h-34c-4 0-6 3-6 6v2h40z" fill="#1d1d1d"/>
      ${label(101, 190, 98, 116, p.name)}`,

    cap: p => `
      <g transform="${p.small ? 'translate(150 336) scale(.82) translate(-150 -336)' : ''}">
        ${ground(92)}
        ${bostonBody}
        ${shine(103, 150, 160)}
        <rect x="124" y="72" width="52" height="38" rx="4" fill="url(#g-black)"/>
        ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect x="${129 + i * 6}" y="75" width="1.4" height="32" fill="#000" opacity=".5"/>`).join('')}
        ${label(101, 190, 98, 116, p.name)}
      </g>`,

    spray: p => `
      <g transform="translate(150 336) scale(.86) translate(-150 -336)">
        ${ground(92)}
        ${bostonBody}
        ${shine(103, 150, 160)}
        <rect x="126" y="88" width="48" height="20" rx="3" fill="url(#g-black)"/>
        <rect x="134" y="60" width="32" height="30" rx="6" fill="url(#g-black)"/>
        <circle cx="137" cy="72" r="2.4" fill="#555"/>
        ${label(101, 190, 98, 116, p.name)}
      </g>`,

    tube: p => `
      ${ground(70)}
      <path d="M104 52h92v10l-20 238h-52L104 62z" fill="url(#g-tube)"/>
      ${[0, 1, 2, 3, 4].map(i => `<rect x="104" y="${52 + i * 2.2}" width="92" height=".8" fill="#9c917a" opacity=".6"/>`).join('')}
      <rect x="126" y="298" width="48" height="40" rx="5" fill="url(#g-black)"/>
      ${label(117, 110, 66, 132, p.name, { max: 17, fs: 5, logo: 12, paper: 'rgba(0,0,0,0)' })}`,

    perfume: p => {
      const glow = p.id === 'marrakech-intense' ? 'url(#g-amber-light)' : 'url(#g-amber)';
      const lines = splitName(p.name.replace(' Eau de Parfum', ''), 12);
      return `
      ${ground(96)}
      <rect x="86" y="150" width="128" height="188" rx="34" fill="${glow}"/>
      <rect x="98" y="166" width="104" height="160" rx="26" fill="#000" opacity=".12"/>
      ${shine(98, 172, 140, 10)}
      <rect x="112" y="64" width="76" height="92" rx="5" fill="url(#g-black)"/>
      <rect x="112" y="64" width="76" height="6" rx="3" fill="#2b2b2b"/>
      ${lines.map((l, i) => `<text x="150" y="${214 + i * 13}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="11" fill="#f6dcb6" opacity=".85">${esc(l)}</text>`).join('')}
      <text x="150" y="304" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="36" fill="#f3c99a" opacity=".55">A&#275;sop</text>`;
    },

    candle: p => `
      ${ground(100)}
      <rect x="84" y="164" width="132" height="174" rx="12" fill="url(#g-ivory)"/>
      <rect x="84" y="164" width="132" height="174" rx="12" filter="url(#f-stone)" fill="#fff"/>
      <ellipse cx="150" cy="166" rx="62" ry="9" fill="#cdbfa6"/>
      <ellipse cx="150" cy="168" rx="54" ry="6.5" fill="#efe7d6"/>
      <rect x="149" y="156" width="2" height="12" fill="#2b2b2b"/>
      ${label(110, 214, 80, 82, p.name, { max: 16, fs: 5, logo: 12 })}`,

    kit: p => `
      ${ground(118)}
      <path d="M70 162l24-22h156l-24 22z" fill="#e9e1cf"/>
      <path d="M226 162l24-22v176l-24 22z" fill="#c9bea6"/>
      <rect x="70" y="162" width="156" height="176" fill="url(#g-box)"/>
      <rect x="140" y="162" width="16" height="176" fill="#3c2a1e" opacity=".85"/>
      <path d="M148 140l-26 22M148 140l24 22" stroke="#3c2a1e" stroke-width="4" opacity=".85"/>
      <path d="M148 162c-16-20-34-22-34-10 0 10 20 10 34 10zM148 162c16-20 34-22 34-10 0 10-20 10-34 10z" fill="none" stroke="#3c2a1e" stroke-width="3.2"/>
      <text x="104" y="230" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="20" fill="#1a1a1a">A&#275;sop.</text>
      <text x="104" y="250" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="7" fill="#3c2a1e">Helping Hands</text>
      <text x="190" y="230" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="7" fill="#3c2a1e">Hand Balm</text>
      <text x="190" y="242" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="7" fill="#3c2a1e">Trio</text>`
  };

  function productSVG(p, opts = {}) {
    if (p.photo) return `<img class="pimg" src="${esc(p.photo)}" alt="${opts.decorative ? '' : esc(p.name + ' ' + p.size)}" loading="lazy">`;
    const draw = shapes[p.shape] || shapes.pump;
    const title = opts.decorative ? '' : `<title>${esc(p.name)} ${esc(p.size)}</title>`;
    const role = opts.decorative ? 'aria-hidden="true"' : 'role="img"';
    return `<svg class="pimg" viewBox="${opts.viewBox || '0 0 300 360'}" ${role} preserveAspectRatio="xMidYMid meet">${title}${draw(p)}</svg>`;
  }

  // Just the drawing, to embed inside a bigger scene
  function productGroup(p) { return (shapes[p.shape] || shapes.pump)(p); }

  // Leaf shadow cast across a wall: a stem with leaves, blurred
  function leafShadow(x, y, scale, opacity, flip) {
    const leaves = [];
    for (let i = 0; i < 13; i++) {
      const t = i / 12;
      const lx = 260 - t * 240 + Math.sin(t * 5) * 18;
      const ly = t * 300;
      const side = i % 2 ? 1 : -1;
      leaves.push(`<ellipse cx="${lx + side * 26}" cy="${ly}" rx="34" ry="11" transform="rotate(${side * 32 - 20} ${lx + side * 26} ${ly})"/>`);
    }
    return `<g transform="translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})" fill="#4a3220" opacity="${opacity}" filter="url(#f-soft)">
      <path d="M260 0 C 200 100 120 180 20 300" stroke="#4a3220" stroke-width="5" fill="none"/>
      ${leaves.join('')}
    </g>`;
  }

  // Dried stems in a ceramic vase (the deck's styling)
  function vase(x, y, s) {
    const stems = [];
    const tips = [[-60, -230], [-20, -270], [30, -250], [70, -200], [-90, -170], [10, -210]];
    tips.forEach(([tx, ty], i) => {
      stems.push(`<path d="M0 0 Q ${tx * 0.4} ${ty * 0.5} ${tx} ${ty}" stroke="#7a5a3a" stroke-width="2" fill="none"/>`);
      for (let k = 0; k < 7; k++) {
        const a = (k / 7) * Math.PI * 2 + i;
        stems.push(`<circle cx="${tx + Math.cos(a) * 9}" cy="${ty + Math.sin(a) * 7}" r="3.2" fill="#9a7148"/>`);
      }
    });
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <g transform="translate(0 -110)">${stems.join('')}</g>
      <path d="M-30 -110 C -30 -90 -62 -70 -62 -30 C -62 0 -40 10 0 10 C 40 10 62 0 62 -30 C 62 -70 30 -90 30 -110 Z" fill="url(#g-ivory)"/>
      <path d="M-30 -110 C -30 -90 -62 -70 -62 -30 C -62 0 -40 10 0 10 C 40 10 62 0 62 -30 C 62 -70 30 -90 30 -110 Z" fill="#fff" filter="url(#f-stone)"/>
      <ellipse cx="0" cy="-110" rx="30" ry="5" fill="#b9ad96"/>
    </g>`;
  }

  // Dust caught in the window light; each mote drifts on its own delay (positions are fixed so every render matches)
  function motes(w, h) {
    let s = '';
    for (let i = 0; i < 18; i++) {
      const x = w * (0.3 + ((i * 37) % 40) / 100);
      const y = h * (0.25 + ((i * 53) % 60) / 100);
      const r = 1.2 + (i % 3) * 0.8;
      s += `<circle class="anim-mote" cx="${x}" cy="${y}" r="${r}" fill="#fff" style="animation-delay:-${(i * 1.7).toFixed(1)}s;animation-duration:${12 + (i % 5) * 2}s"/>`;
    }
    return s;
  }

  /*
    A still-life scene. `dark` swaps the wall for the warm Marrakech mood.
    Used for the store hero and for page banners.
  */
  function scene(opts) {
    const { w = 1500, h = 400, product, dark = false, px = 0.72, scale = 0.86, plinthW = 380, withVase = true, extra = '', align = 'xMidYMid', animated = false } = opts;
    const plinthX = w * px - plinthW / 2;
    const plinthTop = h - 92;
    const bottleX = w * px - 150 * scale;
    const bottleY = plinthTop + 4 - 336 * scale;
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="${align} slice" aria-hidden="true">
      <rect width="${w}" height="${h}" fill="url(#${dark ? 'g-wall-dark' : 'g-wall'})"/>
      <g class="${animated ? 'anim-light' : ''}"><polygon points="${w * 0.42},0 ${w * 0.8},0 ${w * 0.62},${h} ${w * 0.22},${h}" fill="#fff" opacity="${dark ? 0.05 : 0.22}" filter="url(#f-softer)"/></g>
      <g class="${animated ? 'anim-sway' : ''}">${leafShadow(w * 0.78, -30, 1.15, dark ? 0.25 : 0.16, false)}</g>
      <g class="${animated ? 'anim-sway anim-sway--slow' : ''}">${leafShadow(w * 0.02, -60, 0.9, dark ? 0.18 : 0.1, true)}</g>
      ${animated ? motes(w, h) : ''}
      <rect x="0" y="${plinthTop + 70}" width="${w}" height="40" fill="${dark ? '#24140b' : '#cbbaa0'}" opacity=".55"/>
      <g>
        <rect x="${plinthX}" y="${plinthTop}" width="${plinthW}" height="140" fill="url(#g-plinth)"/>
        <rect x="${plinthX}" y="${plinthTop}" width="${plinthW}" height="140" fill="#fff" filter="url(#f-stone)"/>
        <rect x="${plinthX}" y="${plinthTop}" width="${plinthW}" height="7" fill="#e6dac6"/>
        <rect x="${plinthX}" y="${plinthTop + 7}" width="${plinthW}" height="40" fill="#000" opacity=".06"/>
      </g>
      ${withVase ? vase(plinthX + plinthW - 70, plinthTop + 2, 0.8) : ''}
      ${product ? `<g transform="translate(${bottleX} ${bottleY}) scale(${scale})">${productGroup(product)}</g>` : ''}
      ${extra}
    </svg>`;
  }

  window.ART = { productSVG, productGroup, scene, esc };
})();
