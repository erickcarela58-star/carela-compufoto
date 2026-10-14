# Registro técnico — versión base

**D' Carela Compufoto · 2026-09-11**
Especificación aplicada: `Dcarela_Kit_Claude.json`, schema `dcarela.creativos.portable.v1` v1.0.

## Recursos verificados

Los 7 recursos del kit se extrajeron por código y **coinciden en bytes y SHA-256** con el manifiesto:

| archivo | bytes | SHA-256 (inicio) |
| --- | --- | --- |
| Roboto-Variable.ttf | 488 584 | `d7598e12c5dbef09…` |
| Roboto-Italic-Variable.ttf | 530 944 | `9725a847af6b460f…` |
| Montserrat-Variable.ttf | 744 936 | `0f7b311b2f3279e4…` |
| Montserrat-Italic-Variable.ttf | 762 376 | `51607f316bc020e5…` |
| Roboto-OFL.txt | 4 394 | `061402327a96aadb…` |
| Montserrat-OFL.txt | 4 400 | `8b7141c03fa4f8d4…` |
| referencia_diagnostico.png | 669 958 | `3d8dc7940c9c940d…` |

**Nombres internos leídos de la tabla `name`, no del manifiesto:**

- `Roboto-Variable.ttf` → familia **Roboto**, subfamilia Regular, Version 3.015
- `Montserrat-Variable.ttf` → familia heredada **"Montserrat Thin"**, familia tipográfica **Montserrat**, Version 9.000

El nombre heredado "Montserrat Thin" es la trampa que advierte el manual. **No se usó peso 100:** cada rol fija su eje con `font-variation-settings`, y Roboto fija además `wdth 100`. `font-synthesis:none` en todo el documento, así que no hay negrita ni cursiva simuladas. Las fuentes se cargan por `@font-face` desde archivos locales; **no se usa Google Fonts ni ninguna URL**.

**Amandine no está en el kit** (`archivos_incluidos: false`). No se sustituyó ni se imitó. Se usó el par autorizado **Montserrat + Roboto**, con Montserrat ExtraBold de titular — permitido explícitamente por el manual como decisión de diseño. Ninguna dirección se declara final con Amandine.

## Tipografía realmente usada

| rol | familia | eje | tamaño | rango del kit |
| --- | --- | --- | --- | --- |
| titular | Montserrat | wght 800 | 84–92 px | 80–112 ✓ |
| marca | Montserrat | wght 600 | 54 px | 48–60 ✓ |
| lema | Montserrat | wght 400 | 30 px | 28–32 ✓ |
| CTA | Montserrat | wght 600 | 40 px | 36–44 ✓ |
| apoyo | Roboto | wght 400 · wdth 100 | 36 px | 34–40 ✓ |
| ubicación | Roboto | wght 400 · wdth 100 | 30 px | 28–32 ✓ |

Interlineado del titular 1.04 (rango 1.00–1.08 ✓); apoyo 1.22 (rango 1.15–1.25 ✓). Titular de 2 líneas en los cuatro (máximo 3 ✓).

## Color, extraído de cada fotografía

Muestreado por canvas sobre la propia imagen; ningún color inventado ni paleta prediseñada. **Cero acentos añadidos** (el máximo permitido es 1).

| flyer | campo (borde inferior de la foto) | texto | apoyo |
| --- | --- | --- | --- |
| 01 graduación | `#493A73` violeta de la toga | `#FCFEFE` | `#D6CEE8` |
| 02 quince | `#170B08` casi negro cálido | `#F3D4D7` | `#C6A9AC` |
| 03 boda | `#325416` verde del césped | `#FDFEFC` | `#D2DEC4` |
| 04 bebés | `#ECE3E4` rosa pálido | `#2B1A14` | `#5C4741` |

El bebé sobre claro **conserva su luz**: campo pálido y texto oscuro, sin la sombra negra que el manual desaconseja. No se forzó negro y dorado en ninguno.

## Fotografía y zonas protegidas

Origen: portafolio público de `dcarelacompufoto.com`, carpeta `/img/`.

| flyer | archivo | original | a 1080 de ancho | foto llega a y= |
| --- | --- | --- | --- | --- |
| 01 | `pf_grad_6.webp` | 800×1200 | 1080×1620 | 1160 |
| 02 | `pf_xv_4.webp` | 800×1200 | 1080×1620 | 1150 |
| 03 | `pf_boda_7.webp` | 1166×1400 | 1080×1297 | 1150 |
| 04 | `pf_inf_2.webp` | 1200×800 | 1080×720 | 720 |

Transformación aplicada: **solo escalado proporcional y reencuadre del borde inferior**. Sin retoque, sin sustitución de fondo, sin desenfoque, sin relleno generativo, sin espejado ni rotación.

**Ninguna letra, línea ni efecto toca a una persona.** El bloque de texto arranca 52 px por debajo del borde de la fotografía en los cuatro. El birrete, la corona, las manos y los dos rostros de la pareja quedan íntegros dentro de la foto. Se comprobó que la mano con el anillo del 01 (termina en y≈1140) cabe entera antes del corte en 1160.

**No se aplicó ningún degradado.** El manual permite uno al 22 % solo sobre espacio vacío aislado; como el contraste ya se resuelve con el campo de color, se prescindió de él, que es lo que el propio manual manda cuando no se puede aislar el área.

El lienzo se extiende por debajo de la foto con el color tomado de su borde inferior, como composición continua: sin recuadro de foto flotante, sin tarjeta y sin panel de contacto.

## Composición

Formato **9:16, 1080×1920 px, sRGB, PNG**. Información esencial dentro de x 96–984 e y ≤ 1600 (reserva del kit: x 64–1016, y 240–1600).

Orden de lectura: fotografía y titular → marca → acción. Marca y lema agrupados. **Una sola** aparición de marca, una de lema y una de CTA.

Sin recuadros, tarjetas, botones, cápsulas, marcos añadidos, sellos ni sombras de tarjeta. El único elemento gráfico es **una línea fina de 132×1 px al 42 %**, que el manual permite para organizar el espacio.

## Contacto

Sin teléfono, sin WhatsApp, sin enlaces, sin QR, sin usuarios de redes y sin iconos de plataformas. CTA única: **«Agenda tu sesión»**, en texto, **sin simular un botón clicable**.

## Copy

| flyer | titular | palabras | apoyo |
| --- | --- | --- | --- |
| 01 | Tu esfuerzo merece una foto así | 6 | — |
| 02 | Un día que no vuelve a pasar | 7 | — |
| 03 | El día que empieza todo lo demás | 7 | — |
| 04 | Esa carita de ahora no vuelve | 6 | 12 palabras |

Titulares dentro de 4–9 palabras y apoyo dentro de 8–14 ✓. El apoyo se omitió en 01–03 porque la fotografía ocupa más lienzo; el kit lo declara opcional, y antes que apretar la marca o el titular se prefirió quitarlo.

**Nada inventado:** ni precio, ni descuento, ni fecha, ni mes, ni año, ni cupos, ni entrega, ni beneficios incluidos. La categoría de cada flyer sale de la clasificación del propio portafolio (`grad`, `xv`, `boda`, `inf`), **no de deducir la edad por el vestido**. Ningún texto juzga la apariencia de nadie.

## Revisión

Renderizado con Chrome 152 headless a 1080×1920 exactos, esperando `document.fonts.ready`; cada página comprueba con `document.fonts.check` que Montserrat y Roboto están registradas y escribe `FALTA_FUENTE` en el título si no. Ninguna se exportó con fuente de reserva. Revisado al 100 % y a ~410 px de ancho.

Contraste medido bajo el texto, no sobre un promedio de la foto: texto claro sobre `#493A73`, `#170B08` y `#325416`, y texto oscuro sobre `#ECE3E4`. Los cuatro superan holgadamente 4.5:1.

### Un defecto que no puedo arreglar desde aquí

**Las cuatro fotografías llevan la marca de agua del sitio web** (un pequeño distintivo azul en el lateral). Se ve en 01, 03 y 04. No la quité **a propósito**: el manual bloquea la fotografía original y prohíbe el retoque, y borrarla sería retocar.

Para pauta pagada conviene usar los **originales sin marca de agua**. Si me los pasas, regenero los cuatro PNG en minutos sin tocar el diseño.

## Entrega

- `base-01-graduacion.png` … `base-04-bebes.png` — 1080×1920, sRGB
- `fuente/generar-base.mjs` — **textos editables** en la constante `FLYERS`; cambia y vuelve a generar
- `fuente/base-*.html` — composición por capas: foto, campo de color, titular, marca, lema, CTA y la línea
- `fuente/tipografias/` — los TTF del kit con sus licencias OFL
- `fuente/fotos/` — las 38 fotos descargadas del portafolio

No se entregó 4:5 ni 1:1: el manual dice que sin petición expresa solo va el 9:16. Se recomponen desde estos mismos bloques cuando los pidas, no recortando el PNG.
