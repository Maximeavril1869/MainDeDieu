/* MainDeDieu - scène « Planète » : deux vues (ronde et paysage), générées en SVG. */
(function (root) {
  const D = (typeof module !== 'undefined' && module.exports) ? require('./data.js') : root.MDD_DATA;

  // Nombre pseudo-aléatoire stable dans [0,1) à partir d'un texte.
  function h(str, salt) {
    let x = 2166136261 >>> 0;
    const s = str + '#' + (salt || 0);
    for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; }
    x ^= x >>> 15; x = Math.imul(x, 2246822519) >>> 0; x ^= x >>> 13;
    return (x >>> 0) / 4294967296;
  }
  const has = function (set, id) { return set.has(id); };
  const r1 = function (n) { return Math.round(n * 10) / 10; };

  function items(found) {
    return D.elements.filter(function (e) { return e.zone && found.has(e.id); });
  }

  function stars(found, w, hgt, n) {
    if (!(has(found, 'etoile') || has(found, 'nuit') || has(found, 'lune'))) return '';
    let s = '';
    for (let i = 0; i < n; i++) {
      s += '<circle class="twinkle" cx="' + r1(h('st', i) * w) + '" cy="' + r1(h('sy', i) * hgt) + '" r="' + r1(0.6 + h('sr', i) * 1.2) +
        '" fill="#fff" style="animation-delay:' + r1(h('sd', i) * 3) + 's"/>';
    }
    return s;
  }

  function round(found, fresh) {
    const C = 160, R = 74;
    let g = '<svg viewBox="-40 30 400 260" role="img" aria-label="Ta planète, vue de loin" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">';
    g += '<defs><clipPath id="pc"><circle cx="' + C + '" cy="' + C + '" r="' + R + '"/></clipPath>' +
      '<radialGradient id="atm"><stop offset="80%" stop-color="#8ec5ff" stop-opacity=".0"/><stop offset="100%" stop-color="#8ec5ff" stop-opacity=".35"/></radialGradient></defs>';
    g += stars(found, 400, 330, 50).replace(/cx="([0-9.]+)"/g, function (m, v) { return 'cx="' + (parseFloat(v) - 40) + '"'; });
    g += '<circle cx="' + C + '" cy="' + C + '" r="' + (R + 12) + '" fill="url(#atm)"/>';
    g += '<circle cx="' + C + '" cy="' + C + '" r="' + R + '" fill="#6f7390"/>';
    g += '<g clip-path="url(#pc)">';
    if (has(found, 'mer')) g += '<rect x="0" y="0" width="320" height="320" fill="#2f6fb5"/>';
    if (has(found, 'montagne') || has(found, 'ile') || has(found, 'plante')) {
      const col = has(found, 'plante') ? '#4f9a4a' : '#8b6b4a';
      for (let i = 0; i < 4; i++) {
        g += '<ellipse cx="' + r1(C - 60 + h('lx', i) * 120) + '" cy="' + r1(C - 60 + h('ly', i) * 120) + '" rx="' + r1(22 + h('lr', i) * 24) + '" ry="' + r1(14 + h('lq', i) * 18) + '" fill="' + col + '"/>';
      }
    } else if (!has(found, 'mer')) {
      for (let i = 0; i < 3; i++) g += '<circle cx="' + r1(C - 40 + h('cx', i) * 80) + '" cy="' + r1(C - 40 + h('cy', i) * 80) + '" r="' + r1(6 + h('cr', i) * 8) + '" fill="#5d6180"/>';
    }
    if (has(found, 'desert')) g += '<ellipse cx="' + (C + 20) + '" cy="' + (C + 30) + '" rx="26" ry="14" fill="#d9b86c"/>';
    if (has(found, 'glace')) g += '<ellipse cx="' + C + '" cy="' + (C - R + 6) + '" rx="46" ry="14" fill="#eaf6ff"/><ellipse cx="' + C + '" cy="' + (C + R - 6) + '" rx="40" ry="12" fill="#eaf6ff"/>';
    if (has(found, 'nuage')) {
      for (let i = 0; i < 5; i++) g += '<ellipse cx="' + r1(C - 60 + h('nx', i) * 120) + '" cy="' + r1(C - 60 + h('ny', i) * 120) + '" rx="' + r1(16 + h('nr', i) * 14) + '" ry="6" fill="#fff" opacity=".55"/>';
    }
    g += '</g>';
    items(found).forEach(function (e) {
      const a = h(e.id, 1) * Math.PI * 2;
      const cls = fresh.has(e.id) ? ' class="pop"' : '';
      if (e.zone === 'g') {
        const rr = R + 4, x = C + Math.cos(a) * rr, y = C + Math.sin(a) * rr, deg = a * 180 / Math.PI + 90;
        g += '<text' + cls + ' x="' + r1(x) + '" y="' + r1(y) + '" font-size="17" text-anchor="middle" transform="rotate(' + r1(deg) + ' ' + r1(x) + ' ' + r1(y) + ')">' + e.emoji + '</text>';
      } else if (e.zone === 'w') {
        if (!has(found, 'mer')) return;
        const rr = 14 + h(e.id, 2) * 38, x = C + Math.cos(a) * rr, y = C + Math.sin(a) * rr;
        g += '<text' + cls + ' x="' + r1(x) + '" y="' + r1(y) + '" font-size="14" text-anchor="middle">' + e.emoji + '</text>';
      } else {
        const rr = R + 26 + h(e.id, 3) * 36, dur = 24 + h(e.id, 4) * 40;
        const x = C + rr, y = C;
        g += '<g><text' + cls + ' x="' + r1(x) + '" y="' + C + '" font-size="15" text-anchor="middle">' + e.emoji + '</text>' +
          '<animateTransform attributeName="transform" type="rotate" from="' + r1(a * 180 / Math.PI) + ' ' + C + ' ' + C + '" to="' + r1(a * 180 / Math.PI + 360) + ' ' + C + ' ' + C + '" dur="' + r1(dur) + 's" repeatCount="indefinite"/></g>';
      }
    });
    return g + '</svg>';
  }

  function land(found, fresh) {
    const W = 400, H = 240, G = 150;
    const day = has(found, 'soleil');
    const night = !day && (has(found, 'lune') || has(found, 'etoile') || has(found, 'nuit'));
    const top = day ? '#4aa3e0' : (night ? '#070a24' : '#3a3f63');
    const bot = day ? '#bfe6fb' : (night ? '#252d66' : '#5a5f86');
    let g = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Ton monde, vu de côté" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">';
    g += '<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + top + '"/><stop offset="1" stop-color="' + bot + '"/></linearGradient></defs>';
    g += '<rect width="' + W + '" height="' + H + '" fill="url(#sky)"/>';
    g += stars(found, W, G, 45);
    if (has(found, 'montagne')) g += '<polygon points="30,' + G + ' 110,70 190,' + G + '" fill="#7d8299"/><polygon points="150,' + G + ' 250,50 350,' + G + '" fill="#6c7188"/><polygon points="110,70 100,88 120,88" fill="#fff"/><polygon points="250,50 238,72 262,72" fill="#fff"/>';
    g += '<rect y="' + G + '" width="' + W + '" height="' + (H - G) + '" fill="' + (has(found, 'plante') ? '#4f9a4a' : '#8b6b4a') + '"/>';
    if (has(found, 'desert')) g += '<ellipse cx="330" cy="' + (G + 14) + '" rx="60" ry="12" fill="#d9b86c"/>';
    if (has(found, 'mer')) g += '<rect y="205" width="' + W + '" height="' + (H - 205) + '" fill="#2f6fb5"/><path d="M0 205 q25 -8 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" fill="none" stroke="#9fd0ff" stroke-width="2"/>';
    items(found).forEach(function (e) {
      const cls = fresh.has(e.id) ? 'pop' : '';
      const x = r1(18 + h(e.id, 1) * (W - 36));
      if (e.zone === 'g') {
        const y = r1(G + 14 + h(e.id, 2) * 38);
        g += '<text class="' + cls + '" x="' + x + '" y="' + y + '" font-size="22" text-anchor="middle">' + e.emoji + '</text>';
      } else if (e.zone === 'w') {
        if (!has(found, 'mer')) return;
        const y = r1(222 + h(e.id, 2) * 14);
        g += '<text class="' + cls + '" x="' + x + '" y="' + y + '" font-size="16" text-anchor="middle">' + e.emoji + '</text>';
      } else {
        const y = r1(26 + h(e.id, 2) * 80), dx = r1(8 + h(e.id, 3) * 14), dur = r1(6 + h(e.id, 4) * 8);
        g += '<g><text class="' + cls + '" x="' + x + '" y="' + y + '" font-size="20" text-anchor="middle">' + e.emoji + '</text>' +
          '<animateTransform attributeName="transform" type="translate" values="0 0;' + dx + ' 0;0 0;-' + dx + ' 0;0 0" dur="' + dur + 's" repeatCount="indefinite"/></g>';
      }
    });
    return g + '</svg>';
  }

  function render(foundList, view, freshList) {
    const found = new Set(foundList), fresh = new Set(freshList || []);
    return view === 'land' ? land(found, fresh) : round(found, fresh);
  }

  const api = { render: render, hash: h };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MDD_PLANET = api;
})(typeof window !== 'undefined' ? window : globalThis);
