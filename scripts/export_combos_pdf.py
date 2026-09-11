# -*- coding: utf-8 -*-
"""Arma los cinco PDF de catalogo que el panel del CRM ofrece enviar.

El panel tiene una fila de botones "Catalogo en PDF -- XV / Infantil / Graduacion /
Cumpleanos / Embarazadas" que piden /pdf/combos-<cat>.pdf. Esos archivos no existian:
los cinco botones respondian "No se pudo preparar el PDF -- PDF HTTP 404". El panel lo
avisa bien, pero la funcion llevaba tiempo muerta.

Cada PDF es una pagina por combo, en el mismo orden del catalogo y con la MISMA tarjeta
que se envia suelta (combos-img/<slug>.png), asi que no hay un segundo diseno que
mantener: si se regeneran las tarjetas, se vuelve a correr esto y ya.

Las paginas van en JPEG de calidad 82. En PNG el PDF de cumpleanos pasaba de 7 MB, y
esto se manda por WhatsApp a gente con datos moviles.

Uso:
  python export_combos_pdf.py          # arma los cinco en pdf/
"""
import re, sys, io, html as html_lib
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent      # carela-compufoto-publish
SRC  = ROOT / "combos.html"
IMGD = ROOT / "combos-img"
OUTD = ROOT / "pdf"

CATS = {'xv': 'XV', 'infantil': 'Infantil', 'graduacion': 'Graduacion',
        'cumpleanos': 'Cumpleanos', 'embarazadas': 'Embarazadas'}
ANCHO = 1080                                        # igual que la tarjeta, sin reescalar
CALIDAD = 82

SEC_RE = re.compile(r'<section class="sec" id="(\w+)"[^>]*>(.*?)</section>', re.S)
NAME_RE = re.compile(r'<div class="cname">([^<]+)</div>')


def slugify(s):
    """La misma regla que usan el generador de tarjetas y combosSlug() del panel."""
    s = s.lower()
    s = re.sub(r'[^a-z0-9 ]+', '', s)
    return re.sub(r'\s+', '-', s).strip('-')


def por_categoria():
    txt = SRC.read_text(encoding='utf-8')
    orden = {}
    for sm in SEC_RE.finditer(txt):
        cat = sm.group(1)
        if cat not in CATS:
            continue
        nombres = [html_lib.unescape(n).strip() for n in NAME_RE.findall(sm.group(2))]
        orden[cat] = [f'{cat}-{slugify(n)}' for n in nombres]
    return orden


def main():
    OUTD.mkdir(exist_ok=True)
    orden = por_categoria()
    faltan = [s for slugs in orden.values() for s in slugs if not (IMGD / (s + '.png')).is_file()]
    if faltan:
        sys.exit('ABORTA: faltan tarjetas. Corre antes:\n'
                 '  node scripts/generar_tarjetas_combo.mjs todas\n'
                 f'  faltan -> {faltan}')

    total = 0
    for cat, slugs in orden.items():
        paginas = []
        for s in slugs:
            im = Image.open(IMGD / (s + '.png')).convert('RGB')
            if im.width != ANCHO:
                im = im.resize((ANCHO, round(im.height * ANCHO / im.width)), Image.LANCZOS)
            paginas.append(im)
        destino = OUTD / f'combos-{cat}.pdf'
        paginas[0].save(destino, 'PDF', save_all=True, append_images=paginas[1:],
                        quality=CALIDAD, optimize=True, resolution=150.0)
        mb = destino.stat().st_size / 1024 / 1024
        print(f'  {destino.name:28} {len(paginas):2} combos  {mb:.1f} MB')
        total += len(paginas)
    print(f'LISTO: {len(orden)} PDF con {total} combos en {OUTD}')


if __name__ == '__main__':
    main()
