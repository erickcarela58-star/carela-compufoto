# -*- coding: utf-8 -*-
"""RETIRADO. Este generador dibujaba la tarjeta vieja y ya no se usa.

El dueno cambio el diseno el 11/09/2026: la franja fija que este script pintaba abajo
tapaba medio retrato -- el vestido de un combo de XV, la barriga de una sesion de
embarazo. La tarjeta nueva lleva un panel encajado abajo, con margen, cuyo alto lo decide
el contenido, asi que la foto se ve casi entera.

Las tarjetas se generan ahora con:

    node scripts/generar_tarjetas_combo.mjs todas

Dejar aqui un segundo generador capaz de sobrescribir los mismos 39 archivos era pedir
que alguien corriera el equivocado y revirtiera el cambio sin darse cuenta. El codigo
sigue entero en el historial de git si hiciera falta mirarlo:

    git log --follow -- scripts/export_combos_flyer.py

Los cinco PDF del catalogo se siguen armando con scripts/export_combos_pdf.py, que lee
las tarjetas ya generadas y no dibuja nada por su cuenta.
"""
import sys

sys.exit(__doc__)
