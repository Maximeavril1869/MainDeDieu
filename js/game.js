/* MainDeDieu - logique du jeu (sans interface, testable avec Node). */
(function (root) {
  const D = (typeof module !== 'undefined' && module.exports) ? require('./data.js') : root.MDD_DATA;

  const HINT_COOLDOWN_MS = 3 * 60 * 1000;
  const byId = {};
  D.elements.forEach(function (e) { byId[e.id] = e; });
  const recipeMap = {};
  const pairKey = function (a, b) { return [a, b].sort().join('+'); };
  D.recipes.forEach(function (r) { recipeMap[pairKey(r.a, r.b)] = r.out; });

  function newState() {
    return { found: D.START.slice(), tried: [], hintAt: 0, hints: 0 };
  }

  // Nettoie un état chargé depuis le stockage (ids inconnus, doublons).
  function sanitize(s) {
    const base = newState();
    if (!s || typeof s !== 'object') return base;
    const found = Array.isArray(s.found) ? s.found.filter(function (id, i, a) { return byId[id] && a.indexOf(id) === i; }) : [];
    D.START.forEach(function (id) { if (found.indexOf(id) < 0) found.unshift(id); });
    const tried = Array.isArray(s.tried) ? s.tried.filter(function (k, i, a) { return recipeMap[k] && a.indexOf(k) === i; }) : [];
    return {
      found: found,
      tried: tried,
      hintAt: typeof s.hintAt === 'number' ? s.hintAt : 0,
      hints: typeof s.hints === 'number' ? s.hints : 0
    };
  }

  function combine(state, a, b) {
    const key = pairKey(a, b);
    const out = recipeMap[key];
    if (!out) return { status: 'none', out: [], fresh: [] };
    if (state.tried.indexOf(key) < 0) state.tried.push(key);
    const fresh = out.filter(function (id) { return state.found.indexOf(id) < 0; });
    fresh.forEach(function (id) { state.found.push(id); });
    return { status: fresh.length ? 'new' : 'known', out: out, fresh: fresh };
  }

  function hintWait(state, now) {
    return Math.max(0, state.hintAt + HINT_COOLDOWN_MS - now);
  }

  // Renvoie { a, b, result } ou null. Ne modifie pas l'état.
  function pickHint(state, rng) {
    const r = rng || Math.random;
    const cands = D.recipes.filter(function (x) {
      return state.found.indexOf(x.a) >= 0 && state.found.indexOf(x.b) >= 0 &&
        x.out.some(function (id) { return state.found.indexOf(id) < 0; });
    });
    if (!cands.length) return null;
    const c = cands[Math.floor(r() * cands.length)];
    return { a: c.a, b: c.b, result: c.out.find(function (id) { return state.found.indexOf(id) < 0; }) };
  }

  function groupCount(state, gid) {
    const all = D.elements.filter(function (e) { return e.group === gid; });
    const got = all.filter(function (e) { return state.found.indexOf(e.id) >= 0; });
    return { got: got.length, total: all.length };
  }

  function isComplete(state) { return state.found.length >= D.elements.length; }

  // Éléments atteignables depuis les 4 de départ (sert aux tests).
  function reachable() {
    const have = new Set(D.START);
    let changed = true;
    while (changed) {
      changed = false;
      D.recipes.forEach(function (r) {
        if (have.has(r.a) && have.has(r.b)) {
          r.out.forEach(function (id) { if (!have.has(id)) { have.add(id); changed = true; } });
        }
      });
    }
    return have;
  }

  const api = {
    HINT_COOLDOWN_MS: HINT_COOLDOWN_MS, byId: byId, pairKey: pairKey, recipeMap: recipeMap,
    newState: newState, sanitize: sanitize, combine: combine, hintWait: hintWait, pickHint: pickHint,
    groupCount: groupCount, isComplete: isComplete, reachable: reachable
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MDD_GAME = api;
})(typeof window !== 'undefined' ? window : globalThis);
