# -*- coding: utf-8 -*-
"""Regenera los flyers 1080x1350 de cada combo (los que el CRM envia por WhatsApp).

Estas tarjetas no son decoracion: son lo que el panel adjunta cuando alguien pide los
combos, y el nombre del archivo es el contrato -- el panel calcula el slug del combo y
pide /combos-img/<slug>.png. Si un combo se renombra y la tarjeta no, el envio se cae a
la foto pelada del catalogo, sin precio ni detalle.

Fuente de datos: el combos.html DESPLEGADO (carela-compufoto-publish), que es el mismo
que lee el panel. Leer una copia local dejaba abierta la puerta a que la tarjeta dijera
un precio y la web otro.
Salida: combos-img/<slug>.png en el repo publicado, con espejo en dcarela-catalogo.

Uso:
  python export_combos_flyer.py validate   # solo valida parse + mapeo de slugs
  python export_combos_flyer.py sample      # genera 3 muestras en _flyer_preview/
  python export_combos_flyer.py all         # regenera los 39 en combos-img/
"""
import os, re, sys, html as html_lib
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT   = Path(r"C:\Users\Erick\Documents\carela-compufoto-publish")   # lo desplegado
ESPEJO = Path(r"C:\Users\Erick\Documents\dcarela-catalogo")           # copia de trabajo
SRC  = ROOT / "combos.html"
OUTD = ROOT / "combos-img"
PREV = ESPEJO / "_flyer_preview"

W, H = 1080, 1350
# La tarjeta se envia DENTRO del chat de WhatsApp, asi que el numero sobra: quien la
# recibe ya esta escribiendo al estudio. Ademas el numero cambio una vez (5644 -> 5620)
# y dejarlo grabado en 39 PNG es sembrar un dato que caduca solo. Regla del dueno: los
# flyers no llevan telefono. Para revertirlo basta poner True y regenerar.
MOSTRAR_TELEFONO = False
PHONE_DISPLAY = "849-524-5620"          # = wa.me/18495245620 (linea del bot, en combos.html)
BRAND   = "D' Carela Compufoto"
TAGLINE = "Captamos tus mejores momentos"

CAT_COLORS = {
    'xv': (235, 110, 120), 'infantil': (255, 165, 90), 'graduacion': (90, 160, 235),
    'cumpleanos': (245, 95, 115), 'embarazadas': (220, 150, 120),
}

def F(size, bold=False):
    cands = [r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
             r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf"]
    for f in cands:
        try: return ImageFont.truetype(f, size)
        except: pass
    return ImageFont.load_default()

def unesc(s): return html_lib.unescape(s or '').strip()

def slugify(s):
    s = s.lower()
    s = re.sub(r'[^a-z0-9 ]+', '', s)      # borra acentos/puntuacion (NO los transliter)
    s = re.sub(r'\s+', '-', s).strip('-')
    return s

SEC_RE = re.compile(r'<section class="sec" id="(\w+)"[^>]*>(.*?)</section>', re.S)
COMBO_RE = re.compile(
    r'<article class="combo"[^>]*data-accent="([^"]+)"[^>]*>'
    r'.*?data-bg="([^"]+)"[^>]*></div>'
    r'.*?<div class="cname">([^<]+)</div>'
    r'.*?<div class="cprice"><i>RD\$</i><b>([^<]+)</b></div>'
    r'(.*?)<ul class="cinc[^"]*">(.*?)</ul>'
    r'(.*?)</article>', re.S)
# El total de fotos digitales dejo de ser un <li> y paso a su propio div. Sin leerlo, los
# cuatro combos "Digital" salen con la lista vacia: ese numero es su unica linea.
TOTAL_RE = re.compile(r'<div class="cinc-total">([^<]+)</div>')
LI_RE = re.compile(r'<li>(.*?)</li>', re.S)
INC_RE = re.compile(r'<div class="il">([^<]+)</div>\s*<div class="iv">([^<]+)</div>', re.S)

def parse():
    txt = SRC.read_text(encoding='utf-8')
    out = []
    for sm in SEC_RE.finditer(txt):
        cat, body = sm.group(1), sm.group(2)
        if cat == 'portafolio': continue
        for cm in COMBO_RE.finditer(body):
            accent, photo, name, price, medio, items_html, rest = cm.groups()
            tot = TOTAL_RE.search(medio) or TOTAL_RE.search(rest)
            items = [unesc(re.sub(r'<[^>]+>', '', x)) for x in LI_RE.findall(items_html)]
            extras = [(unesc(m.group(1)), unesc(m.group(2))) for m in INC_RE.finditer(rest)]
            out.append({'cat': cat, 'name': unesc(name), 'price': unesc(price),
                        'digital': unesc(tot.group(1)) if tot else '',
                        'photo': photo, 'items': items, 'extras': extras,
                        'slug': f"{cat}-{slugify(unesc(name))}"})
    return out

def hexc(h):
    h = h.lstrip('#')
    if len(h) == 3: h = ''.join(c*2 for c in h)
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def cover(img, w, h):
    """cover-fit: rellena (w,h) recortando el exceso, SIN deformar."""
    iw, ih = img.size
    scale = max(w / iw, h / ih)
    nw, nh = int(iw * scale + 0.5), int(ih * scale + 0.5)
    img = img.resize((nw, nh), Image.LANCZOS)
    # anclar arriba-centro (cabezas/caras quedan visibles)
    x = (nw - w) // 2
    y = int((nh - h) * 0.18)
    return img.crop((x, y, x + w, y + h))

def wrap(d, text, font, mw):
    words, lines, cur = text.split(), [], ''
    for wd in words:
        t = (cur + ' ' + wd).strip()
        if d.textbbox((0, 0), t, font=font)[2] <= mw: cur = t
        else:
            if cur: lines.append(cur)
            cur = wd
    if cur: lines.append(cur)
    return lines

def render(combo):
    cat = combo['cat']
    accent = CAT_COLORS.get(cat, hexc('#7aa0d0'))
    ppath = ROOT / combo['photo']
    photo = Image.open(ppath).convert('RGB')

    base = cover(photo, W, H)                       # FOTO a sangre completa (retrato)
    canvas = base.convert('RGBA')

    # --- medir contenido del panel para fijar su altura (foto dominante) ---
    dmy = ImageDraw.Draw(canvas)
    f_name = F(62, bold=True); f_prc = F(92, bold=True); f_prl = F(30)
    f_itb = F(24); f_inh = F(26, bold=True); f_it = F(29); f_exh = F(25, bold=True); f_ex = F(28)
    f_dig = F(33, bold=True)
    pad = 58; col_w = (W - pad * 2)
    name_lines = wrap(dmy, combo['name'], f_name, col_w)
    items = combo['items'][:10]
    two_col = len(items) > 5
    rows = (len(items) + 1) // 2 if two_col else len(items)
    extras_lines = []
    for lbl, val in combo['extras'][:1]:
        extras_lines.append((lbl, wrap(dmy, val, f_ex, col_w)))

    ch = 28 + len(name_lines) * 70 + 18 + 96 + 30 + 16 + 40 + rows * 42 + 14
    if combo.get('digital'): ch += 48
    for lbl, vl in extras_lines: ch += 40 + len(vl) * 36
    ch += 70                                         # franja de cierre
    py = max(560, H - ch - 36)                       # la foto siempre conserva >=560px

    # --- panel glass: recorta la zona baja de la foto, la oscurece + desenfoca ---
    region = base.crop((0, py, W, H)).filter(ImageFilter.GaussianBlur(22))
    dark = Image.new('RGB', region.size, (10, 14, 28))
    region = Image.blend(region, dark, 0.78)
    # esquinas superiores redondeadas
    mask = Image.new('L', region.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, W - 1, region.size[1] - 1], radius=44, fill=255)
    canvas.paste(region, (0, py), mask)
    pdv = ImageDraw.Draw(canvas)
    pdv.line([pad, py + 3, pad + 120, py + 3], fill=accent, width=6)   # acento

    # --- gradiente arriba para legibilidad de la marca ---
    grad = Image.new('RGBA', (W, 200), (0, 0, 0, 0)); gd = ImageDraw.Draw(grad)
    for i in range(200): gd.rectangle([0, i, W, i + 1], fill=(6, 9, 20, int(165 * (1 - i / 200))))
    canvas.alpha_composite(grad, (0, 0))

    d = ImageDraw.Draw(canvas)
    d.rectangle([0, 0, W, 7], fill=accent)
    d.text((46, 30), BRAND, fill=(255, 255, 255), font=F(36, bold=True))
    d.text((48, 78), TAGLINE, fill=(225, 232, 245), font=F(22))

    # --- contenido del panel ---
    y = py + 30
    for ln in name_lines:
        d.text((pad, y), ln, fill=(255, 255, 255), font=f_name); y += 70
    y += 6
    d.text((pad, y + 44), 'RD$', fill=(190, 205, 230), font=f_prl)
    rdw = d.textbbox((pad, y), 'RD$', font=f_prl)[2] - pad
    d.text((pad + rdw + 14, y), combo['price'], fill=accent, font=f_prc)
    y += 100
    d.text((pad, y), 'ITBIS incluido (18%)', fill=(200, 210, 225), font=f_itb); y += 34
    d.line([pad, y, W - pad, y], fill=(70, 88, 120), width=2); y += 18

    # El total de fotos digitales es lo primero que preguntan, y desde el rediseno del
    # catalogo ya no viene entre los <li>: si no se dibuja aqui, no aparece en ningun lado.
    if combo.get('digital'):
        d.text((pad, y), combo['digital'], fill=accent, font=f_dig); y += 48

    if items:
        d.text((pad, y), 'INCLUYE', fill=accent, font=f_inh); y += 40
        if two_col:
            half = (len(items) + 1) // 2
            colx = [pad, pad + col_w // 2 + 10]
            for ci, group in enumerate((items[:half], items[half:])):
                yy = y
                for it in group:
                    d.text((colx[ci], yy), '•', fill=accent, font=f_it)
                    d.text((colx[ci] + 26, yy), it, fill=(228, 233, 243), font=f_it); yy += 42
            y += half * 42
        else:
            for it in items:
                d.text((pad, y), '•', fill=accent, font=f_it)
                d.text((pad + 26, y), it, fill=(228, 233, 243), font=f_it); y += 42

    for lbl, vl in extras_lines:
        h = lbl.replace('✦', '').strip().upper()
        if h == 'INCLUYE': h = 'ADEMÁS'                 # evita repetir el header "INCLUYE"
        elif h.startswith('INCLUYE '): h = h[len('INCLUYE '):]   # "INCLUYE GRATIS" -> "GRATIS"
        y += 8
        d.text((pad, y), h, fill=(150, 180, 225), font=f_exh); y += 36
        for ln in vl:
            d.text((pad, y), ln, fill=(225, 230, 240), font=f_ex); y += 36

    # --- cierre abajo ---
    cierre = ('WhatsApp ' + PHONE_DISPLAY) if MOSTRAR_TELEFONO else 'Agenda tu sesión'
    d.text((pad, H - 58), cierre, fill=(255, 255, 255) if MOSTRAR_TELEFONO else accent,
           font=F(32, bold=True))
    return canvas.convert('RGB')

# El panel del CRM calcula el nombre del archivo por su cuenta, en JavaScript, dentro de
# panel/v2.html. Son dos implementaciones de la MISMA regla en dos repos distintos: si una
# se toca y la otra no, el CRM pide tarjetas que no existen y el cliente recibe una foto
# sin precio. Aqui se comprueba que sigan diciendo lo mismo sobre los 39 nombres reales.
PANEL_V2 = Path(r"C:\Users\Erick\Documents\dcarela-crm\panel\v2.html")
# Se compara sin espacios: el panel puede partir la linea donde quiera, pero la cadena de
# operaciones tiene que ser exactamente esta.
PANEL_SLUG_CANON = ("returncat+'-'+String(nombre||'').toLowerCase()"
                    r".replace(/[^a-z0-9\s-]/g,'')"
                    r".trim().replace(/\s+/g,'-').replace(/-+/g,'-');")

def revisa_contrato_con_el_panel(combos):
    if not PANEL_V2.is_file():
        print('  (aviso) no se encontro el panel del CRM, no se pudo cruzar la regla del slug')
        return True
    txt = PANEL_V2.read_text(encoding='utf-8')
    if PANEL_SLUG_CANON not in re.sub(r'\s+', '', txt):
        print('  ALERTA: combosSlug() del panel ya no es la regla que asume este script.')
        print('          Revisa panel/v2.html antes de regenerar: los nombres podrian no calzar.')
        return False
    print('  regla del slug: el panel del CRM y este script coinciden')
    return True

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else 'validate'
    combos = parse()
    print(f'combos: {len(combos)}')
    sin_digital = [c['slug'] for c in combos if not c.get('digital')]
    if sin_digital: print(f'  (aviso) sin total de fotos digitales: {sin_digital}')
    # validar mapeo slug -> archivo existente
    existing = {p.stem for p in OUTD.glob('*.png')}
    miss = [c['slug'] for c in combos if c['slug'] not in existing]
    print(f'slugs que NO calzan con un PNG existente: {len(miss)} {miss if miss else ""}')
    if mode == 'validate':
        ok = revisa_contrato_con_el_panel(combos)
        for c in combos: print(f"  {c['cat']:11} {c['name']:28} -> {c['slug']}.png  foto={c['photo']}")
        if not ok or miss: sys.exit(1)
        return
    if mode == 'sample':
        PREV.mkdir(exist_ok=True)
        for slug in ['xv-xv-diamante', 'cumpleanos-digital-plus', 'embarazadas-maternidad-eco-mini']:
            c = next(x for x in combos if x['slug'] == slug)
            render(c).save(PREV / (slug + '.png'), 'PNG', optimize=True)
            print('  muestra ->', PREV / (slug + '.png'))
        return
    if mode == 'all':
        if not revisa_contrato_con_el_panel(combos):
            print('ABORTA: la regla del nombre cambio en el panel.'); sys.exit(1)
        if miss:
            print('ABORTA: hay slugs sin calzar, revisa antes de sobrescribir.'); sys.exit(1)
        import shutil
        espejo = ESPEJO / 'combos-img'
        for c in combos:
            destino = OUTD / (c['slug'] + '.png')
            render(c).save(destino, 'PNG', optimize=True)
            if espejo.is_dir(): shutil.copyfile(destino, espejo / destino.name)
            print('  ok', c['slug'])
        print('LISTO:', len(combos), 'flyers regenerados en', OUTD, '(+ espejo)')

if __name__ == '__main__':
    main()
