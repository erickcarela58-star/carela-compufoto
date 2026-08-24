'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const index = read('index.html');
const inicio = read('inicio.html');
const css = read(path.join('assets', 'site.css'));
const js = read(path.join('assets', 'site.js'));
const combos = read('combos.html');
const portfolio = read('portafolio.html');
const sitemap = read('sitemap.xml');

for (const [name, html] of [['index.html', index], ['inicio.html', inicio]]) {
  assert.match(html, /id="gal3d"/, `${name} debe conservar el diseño original del carrusel 3D.`);
  assert.doesNotMatch(html, /class="gal-cover"/, `${name} no debe sustituir el carrusel por una portada estática.`);
  assert.match(html, /rel="preconnect" href="https:\/\/cdnjs\.cloudflare\.com"/);
  assert.match(html, /assets\/site\.css\?v=20260824v34/);
  assert.match(html, /assets\/site\.js\?v=20260824v34p2/);
}

assert.match(css, /\.gal-hero\{[^}]+background:#09060d/);
assert.match(js, /mesh\.visible=false/);
assert.match(js, /if\(!u\.loaded\|\|!m\.material\.map\)/, 'Un plano 3D nunca puede mostrarse antes de cargar su textura.');
assert.match(js, /const imgs=sources\.map\(s=>optimizedImage\(s,mobile\?480:960\)\)/, 'El carrusel debe usar imágenes responsivas, no originales pesados.');
assert.match(js, /const previews=sources\.map\(s=>optimizedImage\(s,480\)\)/, 'La primera aparición de escritorio debe usar previsualizaciones ligeras.');
assert.match(js, /GALLERY_LIMIT=matchMedia\('\(max-width:700px\)'\)\.matches\?8:14/);
assert.match(js, /antialias:!mobile/);
assert.match(js, /mobile\?1\.35:1\.75/);
assert.match(js, /textureJobs\.sort\(\(a,b\)=>a\.rank-b\.rank\)/, 'Las texturas frente a cámara deben cargarse primero.');
assert.match(js, /textureJobs\.slice\(0,4\)\.forEach\(job=>job\.load\(\)\)/);
assert.match(js, /renderer\.initTexture\(tex\)/, 'La textura debe subir a la GPU antes de mostrar el plano.');
assert.match(js, /requestAnimationFrame\(\(\)=>requestAnimationFrame/, 'El plano debe esperar dos frames después de preparar su textura.');
assert.match(js, /requestAnimationFrame\(\(\)=>setTimeout\(start,60\)\)/, 'El carrusel debe arrancar justo después del primer render.');
assert.match(js, /script\.fetchPriority='high'/);
assert.doesNotMatch(js, /max-width:700px\)'\)\.matches\|\|matchMedia\('\(prefers-reduced-motion/, 'El teléfono no debe degradarse a una portada estática.');

const hero480 = fs.statSync(path.join(root, 'img', 'optimized-v33', 'pf_xv_4-480.webp')).size;
const hero960 = fs.statSync(path.join(root, 'img', 'optimized-v33', 'pf_xv_4-960.webp')).size;
assert.ok(hero480 < 75_000, `El hero móvil pesa demasiado: ${hero480} bytes.`);
assert.ok(hero960 < 150_000, `El hero de escritorio pesa demasiado: ${hero960} bytes.`);

assert.equal((combos.match(/<article class="combo"/g) || []).length, 39, 'La fuente de datos CRM conserva los 39 combos.');
assert.match(combos, /location\.replace\(target\.href\)/, 'La página visual obsoleta debe ocultarse a visitantes.');
assert.doesNotMatch(sitemap, /combos\.html/, 'La página visual obsoleta no debe aparecer en el sitemap.');
assert.match(portfolio, /\/#portafolio/, 'La URL histórica de portafolio debe llevar a la galería real.');

console.log(`Portada v34: carrusel 3D preservado, texturas 480/960 optimizadas y planos ocultos hasta cargar.`);
