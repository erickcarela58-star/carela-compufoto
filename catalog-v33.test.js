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
console.log('Catálogo v33: 39 combos, diseño moderno y 18 rutas heredadas retiradas.');
