// Genera las 39 tarjetas de combo que el CRM adjunta cuando alguien pide los combos.
//
// El dueno eligio este diseno sobre el anterior por una razon concreta: el panel de texto
// no tapa al sujeto. Va encajado abajo, con margen por los cuatro lados, y su alto lo
// decide el contenido, asi que un combo de tres items deja ver casi toda la foto. El
// diseno viejo cortaba la foto por la mitad con una franja fija.
//
// Fuente de datos: el combos.html de ESTE repo, que es el desplegado y el mismo que lee
// el panel. Tipografias del kit de marca (Montserrat y Roboto variables, OFL) con los
// ejes fijados a mano: el TTF de Montserrat declara familia heredada "Montserrat Thin" y
// sin fijar "wght" sale todo en peso 100.
//
// El nombre del archivo es un contrato con el CRM: el panel calcula el slug del combo con
// combosSlug() en dcarela-crm/panel/v2.html y pide /combos-img/<slug>.png. Esa regla NO
// translitera tildes -- "Eco Basico" con tilde queda en "eco-bsico" -- y aqui se replica
// tal cual, no como uno esperaria que fuese.
//
// Uso:
//   node generar_tarjetas_combo.mjs            valida y no escribe nada
//   node generar_tarjetas_combo.mjs muestra    tres casos limite en _muestras/
//   node generar_tarjetas_combo.mjs todas      regenera las 39 en combos-img/

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(AQUI, '..');
const SRC = path.join(REPO, 'combos.html');
const OUT = path.join(REPO, 'combos-img');
const MUESTRAS = path.join(AQUI, '_muestras');
const TMP = path.join(AQUI, '_html');
const ESPEJO = 'C:/Users/Erick/Documents/dcarela-catalogo/combos-img';
const PANEL_V2 = 'C:/Users/Erick/Documents/dcarela-crm/panel/v2.html';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const MARCA = 'D’ Carela Compufoto';
const LEMA = 'Captamos tus mejores momentos';
const CTA = 'Agenda tu sesión';
const CATS = ['xv', 'infantil', 'graduacion', 'cumpleanos', 'embarazadas'];

/* ---- lectura del catalogo desplegado ------------------------------------- */

const unesc = s => String(s || '')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ').trim();

// La regla del panel, calcada. Cualquier "mejora" aqui rompe el envio en el CRM.
const slugPanel = (cat, nombre) => cat + '-' + String(nombre || '').toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');

function leeCombos() {
  const txt = fs.readFileSync(SRC, 'utf8');
  const combos = [];
  const SEC = /<section class="sec" id="(\w+)"[^>]*>([\s\S]*?)<\/section>/g;
  let s;
  while ((s = SEC.exec(txt))) {
    const [, cat, body] = s;
    if (!CATS.includes(cat)) continue;
    const ART = /<article class="combo"[\s\S]*?<\/article>/g;
    let a;
    while ((a = ART.exec(body))) {
      const art = a[0];
      const nombre = unesc((art.match(/<div class="cname">([^<]+)<\/div>/) || [])[1]);
      if (!nombre) continue;
      const items = [...art.matchAll(/<li>([\s\S]*?)<\/li>/g)]
        .map(m => unesc(m[1].replace(/<[^>]+>/g, ''))).filter(Boolean);
      const extras = [...art.matchAll(/<div class="il">([^<]+)<\/div>\s*<div class="iv">([^<]+)<\/div>/g)]
        .map(m => [unesc(m[1]), unesc(m[2])]);
      combos.push({
        cat,
        nombre,
        precio: unesc((art.match(/<div class="cprice"><i>RD\$<\/i><b>([^<]+)<\/b><\/div>/) || [])[1]),
        // El total de fotos digitales vive en su propio div desde el rediseno del
        // catalogo. En los cuatro combos "Digital" es su unica linea de contenido.
        digital: unesc((art.match(/<div class="cinc-total">([^<]+)<\/div>/) || [])[1]),
        acento: unesc((art.match(/data-accent="([^"]+)"/) || [])[1]) || '#cb6d4d',
        foto: (art.match(/data-bg="([^"]+)"/) || [])[1] || '',
        items, extras,
        slug: slugPanel(cat, nombre),
      });
    }
  }
  return combos;
}

/* ---- contrato con el panel del CRM --------------------------------------- */

const REGLA_PANEL = "returncat+'-'+String(nombre||'').toLowerCase()"
  + ".replace(/[^a-z0-9\\s-]/g,'')"
  + ".trim().replace(/\\s+/g,'-').replace(/-+/g,'-');";

function mismaReglaQueElPanel() {
  if (!fs.existsSync(PANEL_V2)) {
    console.log('  (aviso) no encuentro el panel del CRM; no pude cruzar la regla del nombre');
    return true;
  }
  const plano = fs.readFileSync(PANEL_V2, 'utf8').replace(/\s+/g, '');
  if (plano.includes(REGLA_PANEL)) {
    console.log('  regla del nombre: el panel del CRM y este generador coinciden');
    return true;
  }
  console.log('  ALERTA: combosSlug() del panel ya no es la regla que usa este generador.');
  console.log('          Revisa dcarela-crm/panel/v2.html antes de regenerar.');
  return false;
}

/* ---- la tarjeta ----------------------------------------------------------- */

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');

// Chrome resuelve las rutas relativas contra scripts/_html/, no contra el repo ni contra
// esta carpeta. Con rutas relativas la foto y las dos tipografias fallaban EN SILENCIO:
// salia un icono de imagen rota y todo el texto en la serif del sistema.
const comoUrl = p => 'file:///' + p.replace(/\\/g, '/').replace(/ /g, '%20');
const URL_TIPO = comoUrl(path.join(AQUI, 'tipografias'));

const plantilla = c => {
  const mitad = Math.ceil(c.items.length / 2);
  const col = arr => '<ul>' + arr.map(t => `<li>${esc(t)}</li>`).join('') + '</ul>';
  const extras = c.extras.map(([l, v]) => `${esc(l)} ${esc(v)}`).join(' · ');
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>${esc(c.slug)}</title>
<style>
  @font-face{font-family:"MontserratKit";src:url("${URL_TIPO}/Montserrat-Variable.ttf") format("truetype-variations");font-weight:100 900;font-style:normal;font-display:block}
  @font-face{font-family:"RobotoKit";src:url("${URL_TIPO}/Roboto-Variable.ttf") format("truetype-variations");font-weight:100 900;font-style:normal;font-display:block}
  *{margin:0;padding:0;box-sizing:border-box;font-synthesis:none}
  html,body{width:1080px;height:1350px;overflow:hidden}
  body{background:#0C0A11;position:relative;font-family:"RobotoKit",system-ui,sans-serif}

  .foto{position:absolute;inset:0;width:1080px;height:1350px;object-fit:cover;display:block}
  /* Velo solo arriba: es lo justo para que se lea la marca sin apagar la foto. */
  .velo{position:absolute;left:0;right:0;top:0;height:300px;
    background:linear-gradient(rgba(10,8,16,.62),rgba(10,8,16,0))}

  .marca{position:absolute;left:44px;top:38px;color:#fff}
  .marca b{display:block;font-family:"MontserratKit";font-variation-settings:"wght" 600;
    font-size:27px;letter-spacing:.01em;line-height:1.15}
  .marca span{display:block;font-family:"RobotoKit";font-variation-settings:"wght" 400,"wdth" 100;
    font-size:15px;opacity:.82;margin-top:3px;letter-spacing:.02em}

  /* Encajado abajo y con margen: el alto lo pone el contenido, no una franja fija. */
  .panel{position:absolute;left:34px;right:34px;bottom:34px;border-radius:22px;
    background:rgba(14,11,20,.80);padding:30px 34px 28px;color:#fff}
  .nombre{font-family:"MontserratKit";font-variation-settings:"wght" 600;
    font-size:38px;line-height:1.1;letter-spacing:-.01em}
  .fila{display:flex;align-items:baseline;gap:14px;margin-top:4px;flex-wrap:wrap}
  .precio{font-family:"MontserratKit";font-variation-settings:"wght" 800;
    font-size:62px;line-height:1.05;letter-spacing:-.02em;color:${c.acento}}
  .precio i{font-style:normal;font-size:38px;margin-right:3px}
  .itbis{font-size:17px;opacity:.62;font-variation-settings:"wght" 400}
  .digital{margin-top:8px;font-family:"MontserratKit";font-variation-settings:"wght" 600;
    font-size:25px;color:${c.acento}}

  .rotulo{font-family:"MontserratKit";font-variation-settings:"wght" 600;font-size:15px;
    letter-spacing:.16em;text-transform:uppercase;opacity:.62;margin:18px 0 10px}
  .items{display:grid;grid-template-columns:1fr 1fr;gap:4px 30px}
  .items ul{list-style:none}
  .items li{font-size:20px;line-height:1.42;opacity:.94;
    font-variation-settings:"wght" 400,"wdth" 100}
  .extras{margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,.16);
    font-size:19px;line-height:1.4;opacity:.9}
  .cta{margin-top:18px;font-family:"MontserratKit";font-variation-settings:"wght" 600;
    font-size:27px;color:${c.acento}}
</style></head>
<body>
  <img class="foto" src="${comoUrl(path.join(REPO, c.foto))}" alt="">
  <div class="velo"></div>
  <div class="marca"><b>${esc(MARCA)}</b><span>${esc(LEMA)}</span></div>

  <div class="panel">
    <div class="nombre">${esc(c.nombre)}</div>
    <div class="fila">
      <div class="precio"><i>RD$</i>${esc(c.precio)}</div>
      <div class="itbis">ITBIS incluido (18%)</div>
    </div>
    ${c.digital ? `<div class="digital">${esc(c.digital)}</div>` : ''}
    ${c.items.length ? `<div class="rotulo">Ítems incluidos</div>
    <div class="items">${col(c.items.slice(0, mitad))}${col(c.items.slice(mitad))}</div>` : ''}
    ${extras ? `<div class="extras">${esc(extras)}</div>` : ''}
    <div class="cta">${esc(CTA)}</div>
  </div>
<script>
// Si la fuente del kit no cargara, Chrome caeria a una del sistema sin avisar y las 39
// tarjetas saldrian con otra tipografia. El titulo lo delata.
document.fonts.ready.then(() => {
  document.title = document.fonts.check('800 62px MontserratKit')
    && document.fonts.check('400 20px RobotoKit') ? 'listo' : 'FALTA_FUENTE';
});
</script>
</body></html>`;
};

// Una tarjeta de prueba con --dump-dom: si la fuente del kit no entro, el titulo lo dice
// y no tiene sentido dibujar las 39.
function tipografiasCargan(c) {
  fs.mkdirSync(TMP, { recursive: true });
  const html = path.join(TMP, '_prueba.html');
  fs.writeFileSync(html, plantilla(c), 'utf8');
  const dom = execFileSync(CHROME, ['--headless=new', '--disable-gpu',
    '--allow-file-access-from-files', '--virtual-time-budget=9000',
    '--dump-dom', 'file:///' + html.replace(/\\/g, '/')], { encoding: 'utf8' });
  const titulo = (dom.match(/<title>([^<]*)<\/title>/) || [])[1] || '(sin titulo)';
  if (titulo === 'listo') { console.log('  tipografias del kit: cargadas'); return true; }
  console.log('  ALERTA: las tipografias del kit no cargaron (titulo: ' + titulo + ').');
  return false;
}

function dibuja(c, destino) {
  fs.mkdirSync(TMP, { recursive: true });
  const html = path.join(TMP, c.slug + '.html');
  fs.writeFileSync(html, plantilla(c), 'utf8');
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars',
    '--allow-file-access-from-files', '--force-device-scale-factor=1',
    '--window-size=1080,1350', '--virtual-time-budget=9000',
    '--screenshot=' + destino, 'file:///' + html.replace(/\\/g, '/')], { stdio: 'ignore' });
  if (!fs.existsSync(destino)) throw new Error('Chrome no escribio ' + destino);
}

/* ---- ejecucion ------------------------------------------------------------ */

const modo = process.argv[2] || 'validar';
const combos = leeCombos();
console.log('combos en el catalogo desplegado: ' + combos.length);

const sinFoto = combos.filter(c => !fs.existsSync(path.join(REPO, c.foto)));
const sinDigital = combos.filter(c => !c.digital);
if (sinFoto.length) console.log('  FALTAN fotos: ' + sinFoto.map(c => c.slug).join(', '));
if (sinDigital.length) console.log('  (aviso) sin total de fotos digitales: ' + sinDigital.map(c => c.slug).join(', '));

const yaPublicadas = new Set(fs.readdirSync(OUT).filter(f => f.endsWith('.png')).map(f => f.slice(0, -4)));
const huerfanas = combos.filter(c => !yaPublicadas.has(c.slug)).map(c => c.slug);
console.log('nombres que no calzan con una tarjeta ya publicada: ' + huerfanas.length
  + (huerfanas.length ? ' ' + huerfanas.join(', ') : ''));

const contrato = mismaReglaQueElPanel();

if (modo === 'validar') {
  for (const c of combos) {
    console.log(`  ${c.cat.padEnd(11)} ${c.nombre.padEnd(26)} -> ${c.slug}.png  ${c.items.length} items`
      + (c.digital ? '  · ' + c.digital : ''));
  }
  process.exit(contrato && !huerfanas.length && !sinFoto.length ? 0 : 1);
}

if (!contrato || sinFoto.length) {
  console.log('ABORTA: arregla lo de arriba antes de dibujar.');
  process.exit(1);
}

if (!tipografiasCargan(combos[0])) {
  console.log('ABORTA: sin las tipografias del kit las 39 saldrian con otra letra.');
  process.exit(1);
}

if (modo === 'muestra') {
  fs.mkdirSync(MUESTRAS, { recursive: true });
  // Un combo cargado, uno sin items y uno corto: los tres casos que rompen el encaje.
  for (const slug of ['xv-xv-diamante', 'cumpleanos-digital-plus', 'embarazadas-maternidad-eco-mini']) {
    const c = combos.find(x => x.slug === slug);
    if (!c) { console.log('  no encuentro ' + slug); continue; }
    const destino = path.join(MUESTRAS, slug + '.png');
    dibuja(c, destino);
    console.log('  muestra -> ' + destino);
  }
  process.exit(0);
}

if (modo === 'todas') {
  if (huerfanas.length) { console.log('ABORTA: hay nombres sin tarjeta previa, revisa antes de sobrescribir.'); process.exit(1); }
  let n = 0;
  for (const c of combos) {
    const destino = path.join(OUT, c.slug + '.png');
    dibuja(c, destino);
    if (fs.existsSync(ESPEJO)) fs.copyFileSync(destino, path.join(ESPEJO, c.slug + '.png'));
    n++;
    if (n % 10 === 0) console.log('  ' + n + ' de ' + combos.length);
  }
  console.log('LISTO: ' + n + ' tarjetas en ' + OUT + ' (+ espejo)');
  process.exit(0);
}

console.log('modo desconocido: ' + modo);
process.exit(1);
