/* MainDeDieu - interface (PWA locale, aucune donnée envoyée). */
(function () {
  const D = window.MDD_DATA, G = window.MDD_GAME, P = window.MDD_PLANET;
  const $app = document.getElementById('app');

  const MODES = {
    classique: { name: 'Genèse', desc: 'Pars de quatre éléments et crée tout un monde, sans pression.', icon: '✨' },
    planete: { name: 'Planète', desc: 'Même jeu, avec une planète qui prend vie sous tes yeux.', icon: '🪐' }
  };
  const KEY = 'mdd.v1.';

  function loadJSON(k) { try { return JSON.parse(localStorage.getItem(KEY + k)); } catch (e) { return null; } }
  function saveJSON(k, v) { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch (e) { /* stockage plein ou bloqué */ } }

  const saves = { classique: G.sanitize(loadJSON('classique')), planete: G.sanitize(loadJSON('planete')) };
  const settings = Object.assign({ sound: true, view: 'round' }, loadJSON('settings') || {});
  if (settings.view !== 'round' && settings.view !== 'land') settings.view = 'round';

  const ui = { screen: 'home', mode: 'classique', a: null, b: null, busy: false, group: 'all', msg: null, recent: [], modal: null, shake: false };
  let sceneNode = null, sceneKey = '';

  // ---------- son ----------
  let actx = null;
  function beep(freqs) {
    if (!settings.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach(function (f, i) {
        const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + i * 0.09;
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
        o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 0.25);
      });
    } catch (e) { /* audio indisponible */ }
  }

  // ---------- utilitaires ----------
  const el = function (id) { return G.byId[id]; };
  const st = function () { return saves[ui.mode]; };
  const persist = function () { saveJSON(ui.mode, st()); };
  const fmt = function (ms) { const s = Math.ceil(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const pct = function (s) { return Math.round(100 * s.found.length / D.elements.length); };
  const chip = function (e) { return e.emoji + ' ' + e.name; };

  // ---------- rendu ----------
  function topBar(title, showBack) {
    const s = st();
    return '<header class="top">' +
      (showBack ? '<button class="iconbtn" data-act="go" data-to="home" aria-label="Retour à l’accueil">‹</button>' : '') +
      '<h1>' + title + '</h1><span class="count" aria-label="Éléments trouvés">' + s.found.length + ' / ' + D.elements.length + '</span></header>' +
      '<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct(s) + '"><i style="width:' + pct(s) + '%"></i></div>';
  }

  function tabBar() {
    const t = function (to, ic, label) {
      return '<button data-act="go" data-to="' + to + '"' + (ui.screen === to ? ' aria-current="page"' : '') + '><span>' + ic + '</span>' + label + '</button>';
    };
    return '<nav class="tabbar" aria-label="Navigation">' + t('atelier', MODES[ui.mode].icon, 'Atelier') + t('livre', '📖', 'Livre') + t('reglages', '⚙️', 'Réglages') + t('home', '🏠', 'Accueil') + '</nav>';
  }

  function homeView() {
    const card = function (m) {
      const s = saves[m], p = pct(s);
      return '<button class="mode" data-act="mode" data-mode="' + m + '"><b>' + MODES[m].icon + ' ' + MODES[m].name + '</b><small>' + MODES[m].desc + '</small>' +
        '<small>' + s.found.length + ' / ' + D.elements.length + ' éléments</small><div class="bar"><i style="width:' + p + '%"></i></div></button>';
    };
    return '<main class="home"><div><h1>MainDeDieu</h1><p class="sub">Mélange les éléments, découvre-les tous.</p></div>' +
      '<div class="modes">' + card('classique') + card('planete') + '</div>' +
      '<div class="homebtns"><button class="btn" data-act="go" data-to="reglages">⚙️ Réglages</button></div></main>';
  }

  function slotHtml(id, which) {
    if (!id) return '<button class="slot" data-act="slot" data-which="' + which + '" aria-label="Emplacement ' + which.toUpperCase() + ' vide">?</button>';
    const e = el(id);
    return '<button class="slot full" data-act="slot" data-which="' + which + '" aria-label="' + e.name + ', toucher pour retirer"><span><span class="em">' + e.emoji + '</span>' + e.name + '</span></button>';
  }

  function hintLabel() {
    const w = G.hintWait(st(), Date.now());
    return w > 0 ? fmt(w) : 'Indice';
  }

  function msgHtml() {
    const m = ui.msg;
    if (!m) return '<div class="msg" aria-live="polite">Touche deux éléments pour les mélanger.</div>';
    return '<div class="msg ' + (m.kind || '') + '" aria-live="polite"><b>' + m.title + '</b>' + (m.sub ? '<span>' + m.sub + '</span>' : '') + '</div>';
  }

  function atelierBench() {
    const s = st();
    const groups = D.GROUPS.filter(function (g) { return G.groupCount(s, g.id).got > 0; });
    if (ui.group !== 'all' && !groups.some(function (g) { return g.id === ui.group; })) ui.group = 'all';
    let tabs = '<button class="tab" data-act="group" data-g="all" aria-pressed="' + (ui.group === 'all') + '">Tous<small>' + s.found.length + '</small></button>';
    groups.forEach(function (g) {
      const c = G.groupCount(s, g.id);
      tabs += '<button class="tab" data-act="group" data-g="' + g.id + '" aria-pressed="' + (ui.group === g.id) + '">' + g.icon + ' ' + g.name + '<small>' + c.got + '/' + c.total + '</small></button>';
    });
    const list = D.elements.filter(function (e) { return s.found.indexOf(e.id) >= 0 && (ui.group === 'all' || e.group === ui.group); });
    const tiles = list.map(function (e) {
      const sel = ui.a === e.id || ui.b === e.id;
      return '<button class="tile' + (ui.recent.indexOf(e.id) >= 0 ? ' fresh' : '') + '" data-act="tile" data-id="' + e.id + '" aria-pressed="' + sel + '" aria-label="' + e.name + '"><span class="em">' + e.emoji + '</span>' + e.name + '</button>';
    }).join('');
    return '<section class="bench" aria-label="Atelier">' +
      '<div class="slots' + (ui.shake ? ' shake' : '') + '">' + slotHtml(ui.a, 'a') + '<span class="op" aria-hidden="true">+</span>' + slotHtml(ui.b, 'b') +
      '<button class="hintbtn" data-act="hint" aria-label="Demander un indice"><span>💡</span><small id="hinttxt">' + hintLabel() + '</small></button></div>' +
      msgHtml() +
      '<div class="tabs" role="group" aria-label="Groupes">' + tabs + '</div>' +
      '<div class="grid" role="group" aria-label="Éléments découverts">' + tiles + '</div></section>';
  }

  function sceneHtml() {
    return '<div class="scene" id="scene"><span class="tag" id="scenetag"></span>' +
      '<button class="viewbtn" data-act="view" aria-label="Changer de vue de la planète">' + (settings.view === 'round' ? '🏞️' : '🪐') + '</button></div>';
  }

  function atelierView() {
    const m = MODES[ui.mode];
    return topBar(m.icon + ' ' + m.name, true) + '<main>' + (ui.mode === 'planete' ? sceneHtml() : '') + atelierBench() + '</main>' + tabBar();
  }

  function livreView() {
    const s = st();
    let h = '';
    D.GROUPS.forEach(function (g) {
      const c = G.groupCount(s, g.id);
      h += '<section><h2><span>' + g.icon + ' ' + g.name + '</span><small>' + c.got + ' / ' + c.total + '</small></h2>';
      D.elements.filter(function (e) { return e.group === g.id; }).forEach(function (e) {
        if (s.found.indexOf(e.id) < 0) { h += '<details class="el unk"><summary>❓ ???</summary></details>'; return; }
        const recs = s.tried.filter(function (k) { return G.recipeMap[k].indexOf(e.id) >= 0; }).map(function (k) {
          const p = k.split('+'); return '<li>' + chip(el(p[0])) + ' + ' + chip(el(p[1])) + '</li>';
        }).join('');
        const body = recs || (D.START.indexOf(e.id) >= 0 ? '<li>Élément de départ</li>' : '<li>Recette à retrouver</li>');
        h += '<details class="el"><summary><span style="font-size:26px">' + e.emoji + '</span>' + e.name + '</summary><ul>' + body + '</ul></details>';
      });
      h += '</section>';
    });
    return topBar('📖 Livre des éléments', true) + '<main><div class="book">' + h + '</div></main>' + tabBar();
  }

  function reglagesView() {
    const sw = function (act, on, label) {
      return '<div class="row"><span>' + label + '</span><button class="switch" role="switch" aria-checked="' + on + '" data-act="' + act + '" aria-label="' + label + '"></button></div>';
    };
    const resets = Object.keys(MODES).map(function (m) {
      return '<div class="row"><span>' + MODES[m].icon + ' ' + MODES[m].name + ' : ' + saves[m].found.length + ' éléments</span><button class="btn danger" data-act="reset" data-mode="' + m + '">Réinitialiser</button></div>';
    }).join('');
    const body = '<div class="settings">' + sw('sound', settings.sound, 'Sons') +
      '<div class="row"><span>Vue de la planète</span><button class="btn" data-act="view">' + (settings.view === 'round' ? 'Ronde' : 'Paysage') + '</button></div>' +
      resets + '<p class="note">Tout est enregistré sur cet appareil uniquement. Tous droits réservés.</p></div>';
    if (ui.screen === 'reglages' && ui.from === 'home') return '<header class="top"><button class="iconbtn" data-act="go" data-to="home" aria-label="Retour">‹</button><h1>⚙️ Réglages</h1></header><main>' + body + '</main>';
    return topBar('⚙️ Réglages', true) + '<main>' + body + '</main>' + tabBar();
  }

  function modalHtml() {
    const m = ui.modal;
    if (!m) return '';
    let inner = '';
    if (m.type === 'reset') {
      inner = '<h2>Réinitialiser ' + MODES[m.mode].name + ' ?</h2><p>Tu repartiras avec les quatre éléments de départ. Cette action est définitive.</p>' +
        '<div class="btns"><button class="btn" data-act="close">Annuler</button><button class="btn danger" data-act="doreset" data-mode="' + m.mode + '">Réinitialiser</button></div>';
    } else if (m.type === 'group') {
      const g = D.GROUPS.find(function (x) { return x.id === m.gid; });
      inner = '<div class="big">' + g.icon + '</div><h2>Groupe complet !</h2><p>Tu as découvert tous les éléments de « ' + g.name + ' ».</p><div class="btns"><button class="btn primary" data-act="close">Continuer</button></div>';
    } else if (m.type === 'win') {
      inner = '<div class="big">🌟</div><h2>Monde complet !</h2><p>Tu as découvert les ' + D.elements.length + ' éléments. Bravo, MainDeDieu.</p><div class="btns"><button class="btn primary" data-act="close">Continuer</button></div>';
    }
    return '<div class="modal" role="dialog" aria-modal="true"><div class="card">' + inner + '</div></div>';
  }

  // ---------- affichage global ----------
  function render() {
    const grid = $app.querySelector('.grid'), tabs = $app.querySelector('.tabs'), book = $app.querySelector('.book');
    const keep = { g: grid ? grid.scrollTop : 0, t: tabs ? tabs.scrollLeft : 0, b: book ? book.scrollTop : 0, screen: $app.dataset.screen };
    let html;
    if (ui.screen === 'home') html = homeView();
    else if (ui.screen === 'livre') html = livreView();
    else if (ui.screen === 'reglages') html = reglagesView();
    else html = atelierView();
    $app.innerHTML = html + modalHtml();
    $app.dataset.screen = ui.screen;
    if (keep.screen === ui.screen) {
      const g2 = $app.querySelector('.grid'), t2 = $app.querySelector('.tabs'), b2 = $app.querySelector('.book');
      if (g2) g2.scrollTop = keep.g; if (t2) t2.scrollLeft = keep.t; if (b2) b2.scrollTop = keep.b;
    }
    if (ui.screen === 'atelier' && ui.mode === 'planete') mountScene();
  }

  function mountScene() {
    const slot = document.getElementById('scene');
    if (!slot) return;
    const s = st();
    const key = s.found.length + '|' + settings.view;
    if (!sceneNode || key !== sceneKey) {
      const wrap = document.createElement('div');
      wrap.style.cssText = 'position:absolute;inset:0';
      wrap.innerHTML = P.render(s.found, settings.view, ui.recent);
      sceneNode = wrap; sceneKey = key;
    }
    slot.insertBefore(sceneNode, slot.firstChild);
    const n = D.elements.filter(function (e) { return e.zone && s.found.indexOf(e.id) >= 0; }).length;
    document.getElementById('scenetag').textContent = n + (n > 1 ? ' choses' : ' chose') + ' sur ta planète';
  }

  // ---------- actions ----------
  function say(kind, title, sub) { ui.msg = { kind: kind, title: title, sub: sub }; }

  function clearSlots() { ui.a = null; ui.b = null; }

  function resolve() {
    const s = st();
    const gBefore = {};
    D.GROUPS.forEach(function (g) { gBefore[g.id] = G.groupCount(s, g.id).got; });
    const r = G.combine(s, ui.a, ui.b);
    ui.busy = false;
    if (r.status === 'none') {
      say('bad', 'Rien ne se passe', 'Essaie une autre association.');
      ui.shake = true; beep([180]);
      render();
      setTimeout(function () { ui.shake = false; clearSlots(); render(); }, 380);
      return;
    }
    persist();
    if (r.status === 'known') {
      say('', 'Déjà obtenu : ' + r.out.map(function (id) { return chip(el(id)); }).join(' · '), 'Cherche une autre combinaison.');
      ui.recent = [];
    } else {
      ui.recent = r.fresh.slice();
      say('good', '✨ Nouveau : ' + r.fresh.map(function (id) { return chip(el(id)); }).join(' · '), D.MESSAGES[Math.floor(Math.random() * D.MESSAGES.length)]);
      beep([523, 659, 784]);
      if (r.fresh.some(function (id) { return D.START.indexOf(id) < 0 && el(id).zone; }) && ui.mode === 'planete') { /* la planète change */ }
      const done = D.GROUPS.find(function (g) { const c = G.groupCount(s, g.id); return gBefore[g.id] < c.total && c.got === c.total; });
      if (G.isComplete(s)) ui.modal = { type: 'win' };
      else if (done) ui.modal = { type: 'group', gid: done.id };
    }
    clearSlots();
    render();
  }

  function pickTile(id) {
    if (ui.busy) return;
    if (!ui.a) ui.a = id;
    else if (!ui.b) ui.b = id;
    else { ui.a = id; ui.b = null; }
    beep([440]);
    if (ui.a && ui.b) { ui.busy = true; render(); setTimeout(resolve, 320); }
    else render();
  }

  function useHint() {
    if (ui.busy) return;
    const s = st(), w = G.hintWait(s, Date.now());
    if (w > 0) { say('', 'Prochain indice dans ' + fmt(w), 'Prends ton temps pour explorer.'); render(); return; }
    const h = G.pickHint(s);
    if (!h) { say('', 'Aucune idée en réserve', 'Tout ce que tu peux combiner est déjà découvert.'); render(); return; }
    s.hintAt = Date.now(); s.hints += 1; persist();
    ui.a = h.a; ui.b = null;
    say('', '💡 Pars de ' + chip(el(h.a)), 'Il se combine avec quelque chose pour créer du nouveau.');
    render();
  }

  function doReset(mode) {
    saves[mode] = G.newState(); saveJSON(mode, saves[mode]);
    if (mode === ui.mode) { clearSlots(); ui.msg = null; ui.recent = []; ui.group = 'all'; }
    sceneNode = null; ui.modal = null; render();
  }

  $app.addEventListener('click', function (ev) {
    const b = ev.target.closest('[data-act]');
    if (!b) return;
    const d = b.dataset;
    switch (d.act) {
      case 'mode': ui.mode = d.mode; ui.screen = 'atelier'; ui.group = 'all'; clearSlots(); ui.msg = null; ui.recent = []; sceneNode = null; render(); break;
      case 'go':
        ui.from = ui.screen === 'home' ? 'home' : '';
        ui.screen = d.to; if (d.to === 'atelier' || d.to === 'livre') ui.from = ''; render(); break;
      case 'tile': pickTile(d.id); break;
      case 'slot': if (!ui.busy) { ui[d.which] = null; render(); } break;
      case 'hint': useHint(); break;
      case 'group': ui.group = d.g; render(); break;
      case 'view': settings.view = settings.view === 'round' ? 'land' : 'round'; saveJSON('settings', settings); render(); break;
      case 'sound': settings.sound = !settings.sound; saveJSON('settings', settings); render(); break;
      case 'reset': ui.modal = { type: 'reset', mode: d.mode }; render(); break;
      case 'doreset': doReset(d.mode); break;
      case 'close': ui.modal = null; render(); break;
    }
  });

  setInterval(function () {
    const t = document.getElementById('hinttxt');
    if (t && ui.screen === 'atelier') t.textContent = hintLabel();
  }, 1000);

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').catch(function () { /* hors ligne non disponible */ });
  }
  render();
})();
