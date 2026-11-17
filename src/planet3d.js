/* MainDeDieu - planète 3D stylisée (Three.js, low-poly).
   Source du bundle vendor/planet3d.js (npm run build). Expose window.MDD_PLANET3D.create(container). */
import * as THREE from 'three';

const D = window.MDD_DATA;
const SEA = 0.48;
const TAU = Math.PI * 2;

// ---------- aléa déterministe ----------
function hash(str, salt) {
  let x = 2166136261 >>> 0;
  const s = str + '#' + (salt || 0);
  for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; }
  x ^= x >>> 15; x = Math.imul(x, 2246822519) >>> 0; x ^= x >>> 13;
  return (x >>> 0) / 4294967296;
}
function ih(x, y, z) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 1274126177) + 1442695041) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}
function vnoise(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const l = (a, b, t) => a + (b - a) * t;
  return l(
    l(l(ih(xi, yi, zi), ih(xi + 1, yi, zi), u), l(ih(xi, yi + 1, zi), ih(xi + 1, yi + 1, zi), u), v),
    l(l(ih(xi, yi, zi + 1), ih(xi + 1, yi, zi + 1), u), l(ih(xi, yi + 1, zi + 1), ih(xi + 1, yi + 1, zi + 1), u), v), w);
}
function fbm(x, y, z) {
  let a = 1, f = 1, s = 0, n = 0;
  for (let i = 0; i < 4; i++) { s += vnoise(x * f, y * f, z * f) * a; n += a; a *= 0.5; f *= 2; }
  return s / n;
}
const height01 = (d) => fbm(d.x * 1.7 + 3.1, d.y * 1.7 + 7.7, d.z * 1.7 + 1.3);

// ---------- matériaux et modèles low-poly ----------
const M = (c, extra) => new THREE.MeshStandardMaterial(Object.assign({ color: c, flatShading: true, roughness: 0.85, metalness: 0 }, extra || {}));
const mat = {
  trunk: M(0x6b4a2f), leaf: M(0x45a24f), leaf2: M(0x2f7d3f), pine: M(0x25643a), wall: M(0xf4e9d4), roof: M(0xcf5a43),
  roof2: M(0x4a6fb5), stone: M(0xbdbbcc), dark: M(0x6c6a7e), cactus: M(0x3f9a5a), lava: M(0xff5a2a, { emissive: 0xff3a10, emissiveIntensity: 0.9 }),
  rock: M(0x8b8a94), hull: M(0x8a5a32), sail: M(0xfaf6ec), cloud: M(0xffffff, { roughness: 1, emissive: 0xdfe8ff, emissiveIntensity: 0.55 }), chimney: M(0x8a4a3a), glass: M(0x9fd6ff, { emissive: 0x3a7ab0, emissiveIntensity: 0.4 })
};
const at = (m, x, y, z) => { m.position.set(x, y, z); return m; };
const cone = (r, h, seg, m, y) => at(new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), m), 0, y + h / 2, 0);
const cyl = (rt, rb, h, seg, m, y) => at(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m), 0, y + h / 2, 0);
const box = (w, h, d, m, x, y, z) => at(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m), x, y + h / 2, z);
const blob = (r, m, x, y, z) => at(new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), m), x, y, z);

function house(w, h, roofMat) {
  const g = new THREE.Group();
  g.add(box(w, h, w, mat.wall, 0, 0, 0));
  const r = cone(w * 0.78, h * 0.7, 4, roofMat || mat.roof, h);
  r.rotation.y = Math.PI / 4; g.add(r);
  return g;
}
const prefabs = {
  arbre() { const g = new THREE.Group(); g.add(cyl(0.06, 0.08, 0.35, 5, mat.trunk, 0)); g.add(blob(0.28, mat.leaf, 0, 0.62, 0)); return g; },
  foret() {
    const g = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const p = new THREE.Group(), s = 0.75 + hash('f', i) * 0.45;
      p.add(cyl(0.04, 0.05, 0.2, 5, mat.trunk, 0)); p.add(cone(0.24, 0.45, 6, mat.pine, 0.15)); p.add(cone(0.17, 0.4, 6, mat.pine, 0.4));
      p.scale.setScalar(s); p.position.set(Math.cos(i * 1.26) * 0.38, 0, Math.sin(i * 1.26) * 0.38); g.add(p);
    }
    return g;
  },
  jungle() {
    const g = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const p = new THREE.Group(); p.add(cyl(0.035, 0.05, 0.6, 5, mat.trunk, 0));
      for (let k = 0; k < 4; k++) { const l = cone(0.07, 0.34, 4, mat.leaf, 0); l.rotation.set(0, 0, 1.2); l.position.set(0, 0.6, 0); const a = new THREE.Group(); a.add(l); a.rotation.y = k * 1.57; p.add(a); }
      p.position.set(Math.cos(i * 1.6) * 0.32, 0, Math.sin(i * 1.6) * 0.32); p.scale.setScalar(0.8 + hash('j', i) * 0.4); g.add(p);
    }
    return g;
  },
  cactus() { const g = new THREE.Group(); g.add(cyl(0.07, 0.08, 0.5, 6, mat.cactus, 0)); g.add(box(0.2, 0.05, 0.05, mat.cactus, 0.12, 0.25, 0)); g.add(box(0.05, 0.18, 0.05, mat.cactus, 0.22, 0.25, 0)); g.add(blob(0.07, mat.cactus, 0, 0.52, 0)); return g; },
  cabane() { const g = house(0.32, 0.22, mat.trunk); g.scale.setScalar(1.1); return g; },
  maison() { return house(0.4, 0.3); },
  village() {
    const g = new THREE.Group();
    [[-0.3, 0.1, 0.3, 0.22], [0.25, 0.15, 0.34, 0.26], [0.0, -0.3, 0.3, 0.2], [-0.05, 0.32, 0.28, 0.24]].forEach((p, i) => {
      const h = house(p[2], p[3], i % 2 ? mat.roof2 : mat.roof); h.position.set(p[0], 0, p[1]); g.add(h);
    });
    return g;
  },
  ville() {
    const g = new THREE.Group();
    for (let i = 0; i < 9; i++) {
      const w = 0.14 + hash('v', i) * 0.1, hgt = 0.25 + hash('w', i) * 0.7;
      const b = box(w, hgt, w, i % 3 ? mat.stone : mat.dark, (hash('x', i) - 0.5) * 0.7, 0, (hash('z', i) - 0.5) * 0.7);
      g.add(b);
      g.add(box(w * 0.6, 0.02, 0.01, mat.glass, b.position.x, hgt * 0.7, b.position.z + w / 2));
    }
    return g;
  },
  chateau() {
    const g = new THREE.Group();
    g.add(box(0.42, 0.34, 0.42, mat.stone, 0, 0, 0)); g.add(cone(0.18, 0.28, 4, mat.roof2, 0.34));
    [[-0.26, -0.26], [0.26, -0.26], [-0.26, 0.26], [0.26, 0.26]].forEach((p) => { const t = cyl(0.07, 0.08, 0.42, 6, mat.stone, 0); t.position.x = p[0]; t.position.z = p[1]; g.add(t); const c = cone(0.1, 0.18, 6, mat.roof, 0.42); c.position.x = p[0]; c.position.z = p[1]; g.add(c); });
    return g;
  },
  usine() { const g = new THREE.Group(); g.add(box(0.5, 0.25, 0.3, mat.dark, 0, 0, 0)); g.add(cyl(0.05, 0.05, 0.4, 6, mat.chimney, 0.2)); g.children[1].position.x = 0.15; g.add(cyl(0.04, 0.04, 0.3, 6, mat.chimney, 0.2)); g.children[2].position.x = -0.05; return g; },
  volcan() { const g = new THREE.Group(); g.add(cone(0.34, 0.5, 7, mat.rock, 0)); g.add(cone(0.12, 0.12, 7, mat.lava, 0.46)); return g; },
  bateau() { const g = new THREE.Group(); g.add(box(0.3, 0.07, 0.12, mat.hull, 0, 0, 0)); g.add(cyl(0.01, 0.01, 0.3, 4, mat.trunk, 0.07)); const s = cone(0.1, 0.24, 3, mat.sail, 0.1); s.position.x = 0.04; s.rotation.y = Math.PI / 2; g.add(s); return g; }
};
const SCALE = { arbre: 0.3, foret: 0.3, jungle: 0.3, cactus: 0.26, cabane: 0.25, maison: 0.27, village: 0.32, ville: 0.36, chateau: 0.36, usine: 0.32, volcan: 0.34, bateau: 0.55 };

// ---------- sprites emoji ----------
const texCache = {};
function emojiTex(e) {
  if (texCache[e]) return texCache[e];
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  x.font = '92px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(e, 64, 70);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return (texCache[e] = t);
}
function emojiSprite(e, size) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: emojiTex(e), transparent: true, depthWrite: false }));
  s.scale.setScalar(size); s.userData.size = size; return s;
}

const easeOutBack = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

function create(container) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const canvas = renderer.domElement;
  canvas.style.cssText = 'width:100%;height:100%;display:block;touch-action:none;cursor:grab';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Ta planète en 3D, fais-la tourner avec le doigt');
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  const hemi = new THREE.HemisphereLight(0xcfe0ff, 0x30305a, 0.9); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff2d8, 0.9); sun.position.set(3.2, 1.8, 2.4); scene.add(sun);
  const planet = new THREE.Group(); scene.add(planet);
  planet.quaternion.setFromEuler(new THREE.Euler(0.35, -0.6, 0));

  // atmosphère (halo)
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.16, 48, 32), new THREE.ShaderMaterial({
    side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec3 vN; varying vec3 vP; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vP = -mv.xyz; gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'varying vec3 vN; varying vec3 vP; void main(){ float f = pow(0.72 - dot(normalize(vN), normalize(vP)), 3.0); gl_FragColor = vec4(0.45,0.7,1.0,1.0)*clamp(f,0.0,1.0)*0.85; }'
  }));
  scene.add(atmo);

  // étoiles
  let stars = null;
  function makeStars(n, size) {
    if (stars) { scene.remove(stars); stars.geometry.dispose(); }
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = hash('s', i) * 2 - 1, a = hash('t', i) * TAU, s = Math.sqrt(1 - u * u), r = 14 + hash('r', i) * 6;
      pos[i * 3] = Math.cos(a) * s * r; pos[i * 3 + 1] = u * r; pos[i * 3 + 2] = Math.sin(a) * s * r;
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    stars = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: size, sizeAttenuation: true, transparent: true, opacity: 0.9 }));
    scene.add(stars);
  }
  makeStars(500, 0.07);

  // ---------- terrain ----------
  let terrain = null, flagsKey = '', flags = {};
  const baseGeo = new THREE.IcosahedronGeometry(1, 5);
  const basePos = baseGeo.attributes.position.array.slice();
  const vcount = basePos.length / 3;
  const tmp = new THREE.Vector3(), tmp2 = new THREE.Color(), col = new THREE.Color();

  function radiusAt(d, f) {
    const h = height01(d);
    if (!f.mer) return 1 + (h - 0.5) * 0.07;
    if (h <= SEA) return 1;
    const e = (h - SEA) / (1 - SEA);
    return 1.012 + (f.montagne ? Math.pow(e, 1.5) * 0.4 : e * 0.14);
  }
  function colorAt(d, f) {
    const h = height01(d), lat = Math.abs(d.y), e = Math.max(0, (h - SEA) / (1 - SEA));
    if (!f.mer) return col.setHex(0x8a8fae).lerp(tmp2.set(0xb8bcd6), h);
    if (h <= SEA) {
      if (f.glace && lat > 0.84) return col.setHex(0xeaf6ff);
      return col.setHex(0x3f94d8).lerp(tmp2.set(0x1f4f9c), Math.min(1, (SEA - h) * 7));
    }
    if (f.glace && lat > 0.86) return col.setHex(0xffffff);
    if (e < 0.035) return col.setHex(0xe8d49c);
    if (f.desert && lat < 0.42 && fbm(d.x * 3 + 9, d.y * 3, d.z * 3) > 0.52) return col.setHex(0xdcb96e);
    if (f.montagne && e > 0.42) return col.setHex(0xffffff);
    if (f.montagne && e > 0.32) return col.setHex(0x8e8c98);
    if (f.plante) return col.setHex(0x5eb056).lerp(tmp2.set(0x3f8a47), Math.min(1, e * 2.5 + fbm(d.x * 6, d.y * 6, d.z * 6) * 0.25));
    return col.setHex(0x9a7550).lerp(tmp2.set(0x7a5a3c), Math.min(1, e * 2));
  }
  function buildTerrain(f) {
    const pos = new Float32Array(basePos.length), colors = new Float32Array(basePos.length);
    for (let i = 0; i < vcount; i++) {
      tmp.set(basePos[i * 3], basePos[i * 3 + 1], basePos[i * 3 + 2]).normalize();
      const r = radiusAt(tmp, f);
      pos[i * 3] = tmp.x * r; pos[i * 3 + 1] = tmp.y * r; pos[i * 3 + 2] = tmp.z * r;
    }
    for (let t = 0; t < vcount; t += 3) {
      tmp.set(0, 0, 0);
      for (let k = 0; k < 3; k++) tmp.x += basePos[(t + k) * 3], tmp.y += basePos[(t + k) * 3 + 1], tmp.z += basePos[(t + k) * 3 + 2];
      tmp.normalize(); colorAt(tmp, f);
      for (let k = 0; k < 3; k++) { colors[(t + k) * 3] = col.r; colors[(t + k) * 3 + 1] = col.g; colors[(t + k) * 3 + 2] = col.b; }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    if (terrain) { terrain.geometry.dispose(); terrain.geometry = g; }
    else { terrain = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9, metalness: 0 })); planet.add(terrain); }
  }

  // ---------- objets ----------
  const objs = new Map();       // id -> { node, dir, kind, salt }
  const sky = new Map();        // id -> pivot (orbites)
  let cloudGroup = null, moon = null, sunMesh = null, rainbow = null;
  let focus = null;

  const sphereDir = (id, k) => {
    const u = hash(id, 10 + k * 3) * 2 - 1, a = hash(id, 11 + k * 3) * TAU, s = Math.sqrt(1 - u * u);
    return new THREE.Vector3(Math.cos(a) * s, u, Math.sin(a) * s);
  };
  function valid(d, zone, id) {
    const h = height01(d), e = (h - SEA) / (1 - SEA);
    if (zone === 'w') return flags.mer && h < SEA - 0.02;
    if (flags.mer && (h < SEA + 0.04 || e > (flags.montagne ? 0.3 : 0.5))) return false;
    if (id === 'volcan' && flags.montagne && e < 0.22) return false;
    return true;
  }
  function placeDir(id, zone, startSalt) {
    let best = null;
    for (let k = startSalt; k < startSalt + 60; k++) {
      const d = sphereDir(id, k);
      if (!valid(d, zone, id)) continue;
      let ok = true;
      objs.forEach((o, oid) => { if (oid !== id && o.dir.dot(d) > 0.985) ok = false; });
      if (ok) return { d: d, salt: k };
      if (!best) best = { d: d, salt: k };
    }
    return best || { d: sphereDir(id, startSalt), salt: startSalt };
  }
  function setOnSurface(o) {
    const r = o.zone === 'w' ? 1.0 : radiusAt(o.dir, flags);
    o.node.position.copy(o.dir).multiplyScalar(r + (o.sprite ? o.node.userData.size * 0.5 : 0));
    if (!o.sprite) o.node.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), o.dir);
  }
  function addSurfaceObject(e, pop) {
    const kind = prefabs[e.id] ? e.id : null;
    const place = placeDir(e.id, e.zone, 0);
    let node, sprite = false;
    if (kind) { node = prefabs[kind](); node.scale.setScalar(SCALE[kind]); node.userData.base = SCALE[kind]; }
    else { node = emojiSprite(e.emoji, e.zone === 'w' ? 0.2 : 0.17); node.userData.base = node.userData.size; sprite = true; }
    const o = { node: node, dir: place.d, salt: place.salt, zone: e.zone, sprite: sprite, id: e.id };
    setOnSurface(o);
    if (pop) { node.userData.pop = 0; node.scale.setScalar(0.001); }
    planet.add(node); objs.set(e.id, o);
    return o;
  }
  function addSkyObject(e, pop) {
    const pivot = new THREE.Group(), spin = new THREE.Group();
    pivot.rotation.set(hash(e.id, 21) * Math.PI, hash(e.id, 22) * Math.PI, 0);
    const sp = emojiSprite(e.emoji, 0.2);
    sp.position.set(1.28 + hash(e.id, 23) * 0.5, 0, 0);
    spin.add(sp); pivot.add(spin); scene.add(pivot);
    pivot.userData = { spin: spin, speed: (0.18 + hash(e.id, 24) * 0.35) * (hash(e.id, 25) > 0.5 ? 1 : -1), sprite: sp, base: 0.2 };
    spin.rotation.y = hash(e.id, 26) * TAU;
    if (pop) { pivot.userData.pop = 0; sp.scale.setScalar(0.001); }
    sky.set(e.id, pivot);
  }

  function makeClouds(n) {
    if (cloudGroup) { planet.remove(cloudGroup); }
    cloudGroup = new THREE.Group();
    for (let i = 0; i < n; i++) {
      const puff = new THREE.Group();
      for (let k = 0; k < 3; k++) puff.add(blob(0.05 + hash('c', i * 3 + k) * 0.035, mat.cloud, (k - 1) * 0.06, hash('cy', i * 3 + k) * 0.02, (hash('cz', i * 3 + k) - 0.5) * 0.05));
      const d = sphereDir('cloud' + i, 0);
      puff.position.copy(d).multiplyScalar(1.17 + hash('cr', i) * 0.1);
      puff.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
      puff.scale.setScalar(0.75 + hash('cs', i) * 0.6);
      cloudGroup.add(puff);
    }
    planet.add(cloudGroup);
  }
  function makeRainbow(dir) {
    const g = new THREE.Group();
    [0xe84a4a, 0xf08a3a, 0xf0d23a, 0x5ac45a, 0x4aa0e8, 0x4a58c8, 0x8a4ac8].forEach((c, i) => {
      g.add(new THREE.Mesh(new THREE.TorusGeometry(0.34 - i * 0.022, 0.012, 6, 28, Math.PI), new THREE.MeshBasicMaterial({ color: c })));
    });
    g.position.copy(dir).multiplyScalar(1.03); g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    g.rotateY(hash('rb', 1) * TAU);
    return g;
  }

  // ---------- mise à jour selon les éléments trouvés ----------
  let lastIds = new Set();
  function update(foundList, freshList) {
    const found = new Set(foundList);
    const nf = { mer: found.has('mer'), plante: found.has('plante'), montagne: found.has('montagne'), glace: found.has('glace'), desert: found.has('desert') };
    const key = JSON.stringify(nf);
    const reset = foundList.length < lastIds.size;
    if (reset) {
      objs.forEach((o) => planet.remove(o.node)); objs.clear();
      sky.forEach((p) => scene.remove(p)); sky.clear();
      [cloudGroup, rainbow].forEach((n) => n && planet.remove(n)); cloudGroup = rainbow = null;
      if (moon) { scene.remove(moon.pivot); moon = null; }
      if (sunMesh) { scene.remove(sunMesh); sunMesh = null; }
      lastIds = new Set(); flagsKey = '';
    }
    const fresh = new Set(freshList || []);
    if (key !== flagsKey) {
      flags = nf; flagsKey = key; buildTerrain(flags);
      objs.forEach((o) => {
        if (!valid(o.dir, o.zone, o.id)) { const p = placeDir(o.id, o.zone, o.salt + 1); o.dir = p.d; o.salt = p.salt; }
        setOnSurface(o);
      });
    }
    D.elements.forEach((e) => {
      if (!found.has(e.id)) return;
      const isNew = fresh.has(e.id) && !lastIds.has(e.id);
      if (e.zone === 'g' || e.zone === 'w') { if (!objs.has(e.id)) { const o = addSurfaceObject(e, isNew); if (isNew) focus = { o: o, t: 0 }; } }
      else if (e.zone === 's' && !['nuage', 'soleil', 'lune', 'etoile', 'arcenciel'].includes(e.id)) { if (!sky.has(e.id)) addSkyObject(e, isNew); }
    });
    // éléments « d'ambiance »
    if (found.has('nuage')) makeClouds(8 + (found.has('pluie') ? 4 : 0) + (found.has('orage') ? 4 : 0) + (found.has('neige') ? 3 : 0));
    else if (cloudGroup) { planet.remove(cloudGroup); cloudGroup = null; }
    if (found.has('arcenciel') && !rainbow) { rainbow = makeRainbow(sphereDir('arcenciel', 0)); planet.add(rainbow); rainbow.userData.pop = fresh.has('arcenciel') ? 0 : 1; if (fresh.has('arcenciel')) rainbow.scale.setScalar(0.001); }
    if (found.has('soleil') && !sunMesh) {
      sunMesh = new THREE.Group();
      sunMesh.add(new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffd25a })));
      const glow = emojiSprite('☀️', 1.4); glow.material.opacity = 0.35; glow.material.blending = THREE.AdditiveBlending; sunMesh.add(glow);
      sunMesh.position.copy(sun.position).multiplyScalar(1.9); scene.add(sunMesh);
    }
    if (found.has('lune') && !moon) {
      const pivot = new THREE.Group(); pivot.rotation.set(0.5, 0, 0.3);
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 1), M(0xc8c8d6)); m.position.set(2.1, 0, 0);
      pivot.add(m); scene.add(pivot); moon = { pivot: pivot, mesh: m };
    }
    if (found.has('etoile')) makeStars(1400, 0.09); else if (found.has('nuit') || found.has('lune')) makeStars(900, 0.08);
    // lumière : plus chaude et forte avec le soleil
    sun.intensity = found.has('soleil') ? 1.5 : 0.9;
    sun.color.setHex(found.has('soleil') ? 0xfff0cf : 0xc9d4ff);
    hemi.intensity = found.has('soleil') ? 0.75 : 0.55;
    lastIds = found;
  }

  // ---------- interaction ----------
  const pointers = new Map();
  let vel = { x: 0, y: 0 }, idle = 0, zoom = 1, pinch = 0;
  const AX = new THREE.Vector3(1, 0, 0), AY = new THREE.Vector3(0, 1, 0);
  function spinBy(dx, dy) {
    const k = 0.0075 / Math.max(0.6, zoom);
    planet.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(AY, dx * k)).premultiply(new THREE.Quaternion().setFromAxisAngle(AX, dy * k));
  }
  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId); pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    focus = null; idle = 0; vel.x = vel.y = 0; canvas.style.cursor = 'grabbing';
    if (pointers.size === 2) { const p = [...pointers.values()]; pinch = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y); }
  });
  canvas.addEventListener('pointermove', (e) => {
    const p = pointers.get(e.pointerId); if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; idle = 0;
    if (pointers.size === 1) { spinBy(dx, dy); vel.x = dx; vel.y = dy; }
    else if (pointers.size === 2) {
      const q = [...pointers.values()], dist = Math.hypot(q[0].x - q[1].x, q[0].y - q[1].y);
      if (pinch > 0) zoom = Math.min(1.9, Math.max(0.65, zoom * dist / pinch)); pinch = dist; fit();
    }
  });
  const up = (e) => { pointers.delete(e.pointerId); pinch = 0; canvas.style.cursor = 'grab'; };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('wheel', (e) => { e.preventDefault(); zoom = Math.min(1.9, Math.max(0.65, zoom * (e.deltaY > 0 ? 0.92 : 1.08))); fit(); }, { passive: false });

  // ---------- taille et boucle ----------
  function fit() {
    const w = container.clientWidth || 300, h = container.clientHeight || 200, a = w / h;
    renderer.setSize(w, h, false); camera.aspect = a;
    camera.position.set(0, 0, 1.42 / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * Math.min(1, a) * zoom));
    camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(fit); ro.observe(container); fit();

  let raf = 0, last = performance.now(), dead = false;
  const camDir = new THREE.Vector3(0, 0, 1), cur = new THREE.Vector3(), qf = new THREE.Quaternion();
  function frame(now) {
    if (dead) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!container.isConnected || document.hidden || !container.clientWidth) return;
    idle += dt;
    if (pointers.size === 0) {
      if (Math.abs(vel.x) + Math.abs(vel.y) > 0.05) { spinBy(vel.x, vel.y); vel.x *= 0.94; vel.y *= 0.94; }
      else if (focus) {
        focus.t += dt; cur.copy(focus.o.dir).applyQuaternion(planet.quaternion);
        qf.setFromUnitVectors(cur, camDir); qf.slerp(new THREE.Quaternion(), 1 - Math.min(1, dt * 3.2)); planet.quaternion.premultiply(qf);
        if (focus.t > 2.2) focus = null;
      } else if (idle > 2) planet.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(AY, 0.1 * dt));
    }
    if (cloudGroup) cloudGroup.rotation.y += dt * 0.03;
    objs.forEach((o) => {
      const n = o.node;
      if (n.userData.pop !== undefined && n.userData.pop < 1) { n.userData.pop = Math.min(1, n.userData.pop + dt / 0.8); n.scale.setScalar(Math.max(0.001, n.userData.base * easeOutBack(n.userData.pop))); }
    });
    sky.forEach((p) => {
      p.userData.spin.rotation.y += p.userData.speed * dt;
      if (p.userData.pop !== undefined && p.userData.pop < 1) { p.userData.pop = Math.min(1, p.userData.pop + dt / 0.8); p.userData.sprite.scale.setScalar(Math.max(0.001, p.userData.base * easeOutBack(p.userData.pop))); }
    });
    if (rainbow && rainbow.userData.pop < 1) { rainbow.userData.pop = Math.min(1, rainbow.userData.pop + dt / 1.2); rainbow.scale.setScalar(Math.max(0.001, easeOutBack(rainbow.userData.pop))); }
    if (moon) moon.pivot.rotation.y += dt * 0.12;
    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(frame);

  function destroy() {
    dead = true; cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose();
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
  }
  // pour les tests : état interne lisible
  const debug = () => ({ objects: objs.size, sky: sky.size, flags: flags, clouds: !!cloudGroup, moon: !!moon });
  return { update: update, destroy: destroy, debug: debug };
}

window.MDD_PLANET3D = { create: create };
