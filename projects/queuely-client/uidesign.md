# Prompt — Diseño de interfaz para Queuely

> Prompt listo para pegar en una sesión de Claude enfocada en diseño (con acceso a búsqueda web). El proyecto no tiene un sistema de diseño definido todavía — parte del trabajo pedido es investigarlo y proponerlo, no asumirlo.

---

Quiero que diseñes la interfaz de **Queuely**, una aplicación web académica que simula una cola de pedidos de e-commerce durante un evento de demanda alta (tipo Black Friday) y aplica cálculo integral para modelar, analizar y visualizar cómo se comporta esa cola. Es un ejercicio académico de cálculo integral aplicado a teoría de colas, no un producto comercial — el tono visual debe sentirse técnico y riguroso, no corporativo ni "startup".

No tengo un sistema de diseño todavía. Antes de proponer componentes, **investigá y proponé uno desde cero**: paleta de colores, tipografía, escala de espaciado y radios, y el lenguaje visual general (¿dark mode, light mode, o ambos?). Buscá referencias en dashboards de analítica/data-visualization modernos y bien valorados (herramientas de observabilidad, dashboards financieros, herramientas científicas/de simulación) y traé 2-3 direcciones de estilo con su razonamiento antes de fijar una — no asumas una paleta genérica de "SaaS azul y blanco" sin justificarla contra el contenido real que esta app muestra (curvas matemáticas, áreas sombreadas, series de tiempo).

## Qué es la app, en una vista

Es una **single-page app**, sin backend, sin autenticación, sin persistencia entre sesiones — todo el cálculo corre en el navegador. Hay una sola pantalla (dashboard), no hay navegación entre páginas. El usuario ajusta parámetros de un modelo matemático y ve, en vivo, cómo cambian varias curvas y métricas derivadas.

El modelo en juego (contexto para que las curvas tengan sentido visual):

- `λ(t)` — tasa de llegada de pedidos, una curva Gaussiana (sube, tiene un pico, baja).
- `μ(t)` — tasa de servicio (capacidad de procesamiento), una línea constante.
- `Q(t)` — tamaño de la cola en el tiempo, nunca negativo, con su propio pico (que ocurre después del pico de `λ(t)`).
- `D` — backlog acumulado: el área entre `λ(t)` y `μ(t)` en el tramo donde `λ(t) > μ(t)`, se muestra como región sombreada.
- Eventos discretos individuales (pedidos generados por un proceso de Poisson) superpuestos sobre la curva continua de `λ(t)`.

## Stack técnico (restricciones reales, no elegibles)

- Vue 3 + `<script setup lang="ts">`, TypeScript.
- Tailwind CSS v4 — utilidades reales de la escala de diseño, sin valores arbitrarios (`w-[137px]`, `text-[#hex]`) salvo que genuinamente no exista un valor de escala que sirva, y sin `@apply`.
- Chart.js, usado de forma directa e imperativa (sin wrapper de framework) para todos los charts.
- Sin librería de routing ni de state management externo — es una sola vista, con estado reactivo nativo de Vue.

El resultado del diseño tiene que poder expresarse como tokens de Tailwind (colores, spacing, radios, tipografía) y como composición de componentes Vue reales — no como un mockup desconectado de lo que después hay que construir.

## Superficies a diseñar

### 1. Formulario de parámetros (panel de inputs)

Campos: amplitud del pico de demanda, instante del pico, ancho del pico (desviación estándar), tasa de servicio constante, horizonte de estudio, cantidad de puntos de integración. Cada campo válida en línea (mensaje de error debajo del campo específico, no un banner global) y el recálculo se dispara solo automáticamente al corregir un valor inválido — no hay botón "aplicar". Necesito que el estado "hay un error, el resultado mostrado está congelado" sea visualmente inequívoco, sin depender solo de un texto rojo pequeño.

### 2. Charts principales

- Un chart de líneas con `λ(t)` y `μ(t)` superpuestas.
- Un chart (o el mismo) con `Q(t)`.
- El área de `D` sombreada sobre el intervalo crítico.
- Marcadores individuales para los eventos discretos de Poisson sobre la curva de `λ(t)`, visualmente distintos de la curva continua.
- Un panel/tira de métricas derivadas: backlog `D`, valor e instante del pico de `Q(t)`, promedio de `λ(t)` en el intervalo crítico.

Esta es la parte central de la app — tiene que leerse de un vistazo qué está pasando (¿el sistema está sobrecargado ahora mismo?, ¿cuánto backlog se generó?), no solo verse prolija.

### 3. Comparación de escenarios

El usuario puede "guardar" el escenario actual (parámetros + resultados) en una lista, sin límite fijo. Los escenarios guardados se superponen como curvas adicionales sobre los mismos charts (necesitan ser distinguibles entre sí — pensar en una paleta de series categórica, no solo variar el color de `λ` vs `μ`), más una tabla resumen comparando `D`, pico de `Q(t)` y su instante, y promedio de `λ(t)` por escenario. Cada escenario guardado se puede eliminar de la lista.

## Qué espero como entregable

1. Dirección de estilo elegida (con las alternativas descartadas y por qué) — paleta (incluyendo cómo se diferencian las series de datos entre sí y contra el fondo, con atención a contraste/accesibilidad ya que el contenido central son curvas y áreas coloreadas), tipografía (¿monoespaciada para los valores numéricos/fórmulas?, ¿una sans para el resto?), escala de espaciado y radios.
2. Cómo se traduce esa dirección a configuración de Tailwind (tokens de tema, no solo una imagen).
3. Composición de las tres superficies de arriba: layout general (¿todo en una sola columna larga?, ¿panel de parámetros fijo a un costado y charts al centro?), jerarquía visual entre "estoy ajustando parámetros" vs "estoy leyendo resultados" vs "estoy comparando escenarios".
4. Estados a cubrir explícitamente: parámetro inválido (por campo), carga inicial con los valores por defecto, cero escenarios guardados vs varios escenarios guardados superpuestos.

No hace falta que generes código Vue todavía — el objetivo de este prompt es el sistema de diseño y la composición visual, priorizando que se vea limpio, moderno y que las curvas/áreas se lean con claridad inmediata.
