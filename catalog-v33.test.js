'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const html = fs.readFileSync(path.join(root, 'combos.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'assets', 'catalog-v33.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'assets', 'catalog-v33.js'), 'utf8');
const legacy = [
  'combos_xv_central.html', 'combos_xv_plaza.html', 'combos_xv_publico.html',
  'combos_infantil_central.html', 'combos_infantil_plaza.html', 'combos_infantil_publico.html',
  'combos_graduacion_central.html', 'combos_graduacion_plaza.html', 'combos_graduacion_publico.html',
  'combos_cumpleanos_central.html', 'combos_cumpleanos_plaza.html', 'combos_cumpleanos_publico.html',
  'combos_embarazadas_central.html', 'combos_embarazadas_plaza.html', 'combos_embarazadas_publico.html',
  'combos-privados.html', 'DCarela_Catalogo.html', 'DCarela_Catalogo_publico.html'
];

assert.equal((html.match(/<article class="combo"/g) || []).length, 39, 'El contrato CRM debe conservar exactamente 39 combos estáticos.');
assert.equal((html.match(/<section class="sec" id="(?:xv|infantil|graduacion|cumpleanos|embarazadas)"/g) || []).length, 5, 'Deben existir las cinco categorías comerciales.');
assert.match(html, /assets\/catalog-v33\.css\?v=20260824v33/);
assert.match(html, /assets\/catalog-v33\.js\?v=20260824v33/);
assert.match(html, /class="cname"/);
assert.match(html, /class="cprice"/);
assert.match(html, /class="cinc-total"/);
assert.match(html, /class="cinc/);
assert.match(css, /grid-template-columns:\s*repeat\(3/);
assert.match(css, /@media \(max-width: 760px\)/);
assert.match(js, /catalogSearch/);
assert.match(js, /dataset\.catalogSearch/);
assert.match(js, /BUILD = '2026-08-24-catalog-v33'/);
assert.match(js, /optimized-v33/);
assert.match(html, /img\.srcset = 'img\/optimized-v33/);
assert.match(html, /img\.fetchPriority = 'low'/);
assert.doesNotMatch(html, /setTimeout\(drain,1200\)/, 'El catálogo no debe descargar todas las fotos fuera de pantalla por temporizador.');

for (const file of legacy) {
  const body = fs.readFileSync(path.join(root, file), 'utf8');
  assert.match(body, /noindex,nofollow/, `${file} debe quedar fuera del índice.`);
  assert.match(body, /location\.replace/, `${file} debe redirigir sin dejar una página antigua en el historial.`);
  assert.ok(body.length < 3000, `${file} todavía parece contener el catálogo antiguo (${body.length} bytes).`);
}

assert.equal(fs.readdirSync(path.join(root, 'combos-img')).filter(name => name.endsWith('.png')).length, 39, 'La biblioteca que consumen los CRM debe conservar 39 imágenes.');

// El panel del CRM no busca la tarjeta por una lista: la deduce del nombre del combo con
// esta misma regla y pide /combos-img/<slug>.png. Renombrar un combo sin renombrar su
// tarjeta deja al cliente recibiendo una foto sin precio ni detalle, y nadie se entera.
const slugCombo = (cat, nombre) => cat + '-' + String(nombre || '').toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
const porCategoria = {};
for (const sec of html.match(/<section class="sec" id="(?:xv|infantil|graduacion|cumpleanos|embarazadas)"[\s\S]*?<\/section>/g) || []) {
  const cat = sec.match(/id="(\w+)"/)[1];
  porCategoria[cat] = [...sec.matchAll(/<div class="cname">([^<]+)<\/div>/g)].map(m => m[1].trim());
}
const nombres = Object.entries(porCategoria).flatMap(([cat, ns]) => ns.map(n => [cat, n]));
assert.equal(nombres.length, 39, 'Los 39 combos deben repartirse entre las cinco categorías.');
for (const [cat, nombre] of nombres) {
  const archivo = path.join(root, 'combos-img', slugCombo(cat, nombre) + '.png');
  assert.ok(fs.existsSync(archivo), `El CRM pediría ${slugCombo(cat, nombre)}.png para "${nombre}" y no existe.`);
}

// Los cinco PDF que el panel ofrece en "Catálogo en PDF". Estuvieron en 404 durante
// meses: los botones existían y el archivo no. Una página por combo de la categoría.
for (const [cat, ns] of Object.entries(porCategoria)) {
  const pdf = path.join(root, 'pdf', `combos-${cat}.pdf`);
  assert.ok(fs.existsSync(pdf), `El panel ofrece /pdf/combos-${cat}.pdf y no existe.`);
  const bytes = fs.readFileSync(pdf);
  assert.ok(bytes.subarray(0, 5).toString() === '%PDF-', `combos-${cat}.pdf no es un PDF.`);
  const paginas = (bytes.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  assert.equal(paginas, ns.length, `combos-${cat}.pdf debe traer ${ns.length} combos, trae ${paginas}.`);
  assert.ok(bytes.length < 8 * 1024 * 1024, `combos-${cat}.pdf pesa ${(bytes.length / 1048576).toFixed(1)} MB: demasiado para datos móviles.`);
}

console.log('Catálogo v33: 39 combos, diseño moderno y 18 rutas heredadas retiradas.');
