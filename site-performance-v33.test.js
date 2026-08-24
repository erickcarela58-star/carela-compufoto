'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const site = fs.readFileSync(path.join(root, 'assets', 'site.js'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'img', 'optimized-v33', 'manifest.json'), 'utf8'));
const originals = fs.readdirSync(path.join(root, 'img')).filter(name => name.endsWith('.webp'));

assert.equal(manifest.build, '2026-08-24-images-v33');
assert.equal(manifest.source_count, originals.length);
assert.equal(manifest.variants.length, originals.length * 2);
assert.deepEqual(manifest.widths, [480, 960]);
assert.ok(manifest.variants.every(item => item.bytes > 0 && item.width <= 960));
assert.match(site, /function responsiveImage/);
assert.match(site, /optimized-v33/);
assert.match(site, /GALLERY_LIMIT/);
assert.match(site, /fetchpriority="low"/);
assert.match(site, /navigator\.connection\?\.saveData/);
assert.match(site, /prefers-reduced-motion:reduce/);
assert.doesNotMatch(site, /COUNT=Math\.min\(28,imgs\.length\)/);

const bytes480 = manifest.variants.filter(item => item.target.endsWith('-480.webp')).reduce((sum, item) => sum + item.bytes, 0);
assert.ok(bytes480 < manifest.source_bytes, `Las variantes móviles (${bytes480}) deben pesar menos que los originales (${manifest.source_bytes}).`);
console.log(`Web v33: ${originals.length} fotos, variantes 480/960 y carga diferida verificadas.`);
