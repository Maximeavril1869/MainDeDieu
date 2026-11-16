// Tests de cohérence des données et de la logique : node tests/data.test.js
const assert = require('assert');
const D = require('../js/data.js');
const G = require('../js/game.js');

let n = 0;
function t(name, fn) { fn(); n++; console.log('ok -', name); }

t('ids uniques', () => {
  const ids = D.elements.map(e => e.id);
  assert.strictEqual(new Set(ids).size, ids.length);
});
t('chaque élément a un groupe valide', () => {
  const gs = new Set(D.GROUPS.map(g => g.id));
  D.elements.forEach(e => assert.ok(gs.has(e.group), 'groupe inconnu: ' + e.id));
});
t('les recettes ne citent que des éléments connus', () => {
  D.recipes.forEach(r => [r.a, r.b].concat(r.out).forEach(id => assert.ok(G.byId[id], 'inconnu: ' + id)));
});
t('pas de recette en double (commutatif)', () => {
  const keys = D.recipes.map(r => G.pairKey(r.a, r.b));
  assert.strictEqual(new Set(keys).size, keys.length);
});
t('tous les éléments sont atteignables', () => {
  const have = G.reachable();
  const missing = D.elements.filter(e => !have.has(e.id)).map(e => e.id);
  assert.deepStrictEqual(missing, []);
});
t('chaque élément non primordial a au moins une recette', () => {
  const produced = new Set();
  D.recipes.forEach(r => r.out.forEach(id => produced.add(id)));
  D.elements.filter(e => !D.START.includes(e.id)).forEach(e => assert.ok(produced.has(e.id), 'sans recette: ' + e.id));
});
t('combinaison nouvelle, connue, impossible', () => {
  const s = G.newState();
  let r = G.combine(s, 'eau', 'feu');
  assert.strictEqual(r.status, 'new');
  assert.ok(s.found.includes('vapeur'));
  r = G.combine(s, 'feu', 'eau');
  assert.strictEqual(r.status, 'known');
  r = G.combine(s, 'air', 'eau');
  assert.strictEqual(r.status, 'none');
});
t('même élément deux fois (air + air)', () => {
  const s = G.newState();
  assert.strictEqual(G.combine(s, 'air', 'air').status, 'new');
  assert.ok(s.found.includes('vent'));
});
t('indice : cooldown et choix valide', () => {
  const s = G.newState();
  assert.strictEqual(G.hintWait(s, G.HINT_COOLDOWN_MS), 0);
  s.hintAt = 1000;
  assert.ok(G.hintWait(s, 2000) > 0);
  assert.strictEqual(G.hintWait(s, 1000 + G.HINT_COOLDOWN_MS), 0);
  const h = G.pickHint(s, () => 0);
  assert.ok(h && s.found.includes(h.a) && s.found.includes(h.b) && !s.found.includes(h.result));
});
t('sanitize répare un état corrompu', () => {
  const s = G.sanitize({ found: ['feu', 'zzz', 'feu'], tried: ['nope'], hintAt: 'x' });
  assert.ok(s.found.includes('eau') && !s.found.includes('zzz'));
  assert.strictEqual(s.tried.length, 0);
  assert.strictEqual(s.hintAt, 0);
  assert.deepStrictEqual(G.sanitize(null).found, D.START);
});
t('partie complète jouable de bout en bout', () => {
  const s = G.newState();
  let guard = 0;
  while (!G.isComplete(s) && guard++ < 1000) {
    const h = G.pickHint(s, () => 0);
    assert.ok(h, 'bloqué');
    G.combine(s, h.a, h.b);
  }
  assert.ok(G.isComplete(s));
});

console.log('\n' + n + ' tests OK, ' + D.elements.length + ' éléments, ' + D.recipes.length + ' recettes');
