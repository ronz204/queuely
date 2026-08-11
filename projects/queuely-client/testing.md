# Queuely Client — Pruebas manuales

Checklist paso a paso para validar la implementación actual del dashboard contra los 6 delta specs de `deltas/`. Pensado para correrlo a mano en el navegador — no hay suite automatizada (decisión ya documentada en `structure.md`/`modules.md`).

**Cambios recientes en "Guardar escenario actual":**
1. El botón tiraba una excepción (`Uncaught DOMException: Proxy object could not be cloned`) y no guardaba nada — `structuredClone` no puede clonar el objeto reactivo de Vue tal cual llega; ahora se desenvuelve con `toRaw()` antes de clonarlo.
2. Aun sin esa excepción, las curvas superpuestas en los charts no iban a actualizarse: el estado de escenarios se mutaba en el lugar (`push`) en vez de reemplazarse por un array nuevo, y los charts solo re-dibujan cuando la referencia del array cambia.
3. El botón y la "✕" de cada escenario no mostraban el cursor de mano al pasar por encima; ya tienen `cursor-pointer`.

Los tres están corregidos — la sección 8 de abajo quedó reescrita paso a paso para verificarlo con cambios de valores concretos.

## Setup

```
cd projects/queuely-client
bun run dev
```

Abrí `http://localhost:5173`. Dejá la consola del navegador (DevTools) abierta durante todo el checklist — cualquier error ahí es un fallo, aunque la UI "se vea bien".

---

## 1. Carga inicial (defaults)

Con la página recién cargada, sin tocar nada:

- [ ] El header muestra el título "Queuely" y un badge de estado a la derecha.
- [ ] El panel de parámetros (izquierda) muestra estos 6 valores por default:

  | Campo | Valor |
  |---|---|
  | Amplitud del pico (A) | 140 |
  | Instante del pico (t₀) | 40 |
  | Ancho del pico (σ) | 12 |
  | Tasa de servicio (μ) | 60 |
  | Horizonte de estudio (T) | 90 |
  | Puntos de integración (N) | 180 |

- [ ] El badge de estado dice **"Sobrecargado en el intervalo crítico"** (en rojo) — con estos defaults el sistema arranca sobrecargado (A=140 > μ=60).
- [ ] Las 4 tarjetas de métricas muestran valores numéricos (no `NaN`, no vacío): Backlog acumulado (D), Pico de cola (Q_max), Instante del pico (t(Q_max)), λ promedio (crítico).
- [ ] No hay errores en la consola del navegador.

## 2. Chart λ(t) vs μ(t)

- [ ] Se ve una curva celeste (λ(t)) con forma de campana de Gauss, con el pico visualmente ubicado en **t=40** en el eje X.
- [ ] Se ve una línea punteada ámbar horizontal en **y=60** (μ(t)).
- [ ] **El área entre las dos curvas, en la franja donde λ(t) queda por encima de μ(t), aparece sombreada en rojo/naranja translúcido.** Este es el área del backlog D — si no se ve ningún sombreado ahí, es una regresión del bug que ya corregimos (plugin `Filler` de Chart.js sin registrar).
- [ ] Se ven puntitos individuales (eventos del proceso de Poisson) dispersos sobre la curva celeste, más densos cerca de t=40 y más dispersos en los extremos.
- [ ] La leyenda arriba del chart lista: λ(t), μ(t), backlog D, eventos Poisson — cada uno con su color correspondiente.

## 3. Chart Q(t)

- [ ] Se ve una curva morada que arranca en 0, sube, llega a un pico, y vuelve a bajar.
- [ ] **El área bajo la curva Q(t) aparece rellena en morado translúcido** (mismo bug potencial que el punto anterior — confirmar que no quedó vacío).
- [ ] El pico de la curva Q(t) ocurre visualmente **después de t=40** (el instante del pico de λ), nunca en el mismo instante ni antes — es el invariante central del modelo.
- [ ] Hay una línea vertical punteada gris marcando el instante exacto del pico, con un puntito morado en la cima.
- [ ] Con los defaults, la curva vuelve a (o cerca de) 0 antes de llegar a t=90 (el horizonte). Si se queda "colgada" en un valor alto al final, algo está mal (μ demasiado bajo o bug).

## 4. Consistencia numérica entre panel de métricas y charts

- [ ] El valor de "Backlog acumulado (D)" en la tarjeta coincide, a simple vista, con el tamaño del área sombreada roja del chart 1.
- [ ] El valor de "Pico de cola (Q_max)" coincide con la altura máxima de la curva morada del chart 2.
- [ ] El valor de "Instante del pico t(Q_max)" coincide con la posición X de la línea punteada vertical del chart 2.
- [ ] **D y Q_max pueden coincidir numéricamente** (no es un bug) — matemáticamente Q(t) crece sin parar mientras λ(t)>μ(t), así que su pico ocurre justo al final del intervalo crítico y ahí Q(pico) = D. Lo que **sí** tiene que ser distinto es D contra el valor de Q(t) al final del horizonte (t=90) — ese debería estar cerca de 0.

## 5. Validación inline por campo

Probar cada caso por separado, restaurando el valor válido antes de pasar al siguiente:

- [ ] **Amplitud = 0** → error inline debajo del campo ("Debe ser mayor que 0"), los charts dejan de recalcularse (quedan "congelados", ver punto 7).
- [ ] **Amplitud = 1500** (mayor a 1000) → error inline ("Máximo 1000").
- [ ] **Ancho del pico (σ) = -5** → error inline ("Debe ser mayor que 0"). Este es el caso explícito del spec de dashboard.
- [ ] **Ancho del pico (σ) = 200** (mayor al horizonte de 90) → error inline ("Debe ser ≤ 90").
- [ ] **Instante del pico = 150** (mayor al horizonte de 90) → error inline ("Debe estar entre 0 y 90").
- [ ] **Tasa de servicio = 0** → error inline ("Debe ser mayor que 0").
- [ ] **Horizonte = 600** (mayor a 500) → error inline ("Máximo 500 min").
- [ ] **Puntos de integración = 5** (menor a 10) → error inline ("Entre 10 y 2000").
- [ ] **Puntos de integración = 12.5** (no entero) → error inline ("Debe ser un entero").
- [ ] En cada caso de arriba, corregir el valor a algo válido hace desaparecer el error automáticamente y los charts se actualizan solos, sin tocar ningún botón.

## 6. Recompute en vivo + debounce

- [ ] Cambiar la Amplitud de 140 a 300 (un valor válido) → después de un instante breve (no inmediato, no hay que hacer nada más), los charts y las 4 métricas se actualizan solos reflejando el nuevo valor.
- [ ] Escribir varios dígitos rápido en un campo (ej. borrar "140" y tipear "2", "20", "200" en sucesión rápida) → no se nota un recálculo por cada tecla, solo un recálculo final cuando se deja de tipear (debounce).

## 7. Estado "congelado"

- [ ] Con cualquier campo en estado inválido (ver punto 5), aparece un badge rojo extra en el header: **"Resultados congelados"**, además del badge de sobrecarga/capacidad.
- [ ] Con un campo inválido, los dos charts muestran una superposición visual (rayado/oscurecido) indicando que el contenido está congelado — no deberían verse como "normales" mientras hay un error activo.

## 8. Comparación de escenarios — paso a paso con valores concretos

Esta sección es la que hay que probar con más cuidado, porque es donde estaba el bug. La idea es ir cambiando parámetros y confirmando, en cada paso, qué línea nueva aparece en los charts y cuál se queda "congelada" con su forma vieja.

**Paso 1 — Guardar el estado default como Escenario 1.**
Con los defaults (A=140, t₀=40, σ=12, μ=60, T=90, N=180) sin tocar nada, click en **"Guardar escenario actual"**.
- [ ] Aparece un chip **"Escenario 1"** con un punto de color (ej. celeste/cian) junto al botón.
- [ ] Aparece una fila en la tabla de abajo con los mismos números que muestran las 4 tarjetas de métricas de arriba en este momento.
- [ ] En el chart λ(t)/μ(t): aparece una línea **fina** adicional, del color del chip, prácticamente **pegada encima** de la curva celeste gruesa — tiene sentido, porque el escenario guardado tiene los mismos parámetros que el estado actual todavía.

**Paso 2 — Cambiar Amplitud y ver la curva principal moverse mientras la guardada queda fija.**
Cambiá el campo **Amplitud del pico** de `140` a `300` (dejá los demás campos igual).
- [ ] La curva celeste **gruesa** (el estado actual) crece: el pico pasa de altura ~140 a altura ~300 en el chart λ(t)/μ(t).
- [ ] La línea **fina** de "Escenario 1" **no se mueve** — se queda con su pico en altura ~140, exactamente donde estaba antes de tocar el campo. Esta es la prueba visual de que el guardado es una foto congelada, no una referencia en vivo.
- [ ] Las 4 tarjetas de métricas arriba sí cambian (más backlog D, por ejemplo), pero la fila de "Escenario 1" en la tabla de abajo **no cambia**.

**Paso 3 — Guardar el nuevo estado como Escenario 2.**
Con Amplitud ya en `300`, click de nuevo en **"Guardar escenario actual"**.
- [ ] Aparece un segundo chip **"Escenario 2"**, con un color **distinto** al de Escenario 1 (ej. ámbar).
- [ ] Aparece una segunda fila en la tabla, con un D más grande que el de Escenario 1 (más amplitud → más backlog).
- [ ] Ahora el chart muestra **tres** curvas de λ: la gruesa (actual, pico 300) y dos finas superpuestas casi iguales entre sí (Escenario 1 en pico 140, Escenario 2 en pico 300 — esta última va a quedar pegada a la curva gruesa actual, igual que pasó en el paso 1).

**Paso 4 — Cambiar el instante del pico y confirmar que las curvas guardadas no se mueven de lugar.**
Cambiá **Instante del pico (t₀)** de `40` a `65` (Amplitud se queda en 300).
- [ ] La curva gruesa actual desplaza su pico de t=40 a t=65 en el eje X, en ambos charts (λ(t) y Q(t)).
- [ ] Las dos líneas finas de Escenario 1 y Escenario 2 **siguen con su pico en t=40** — no se mueven, aunque el campo que cambiaste sea el mismo que usaron ellas al guardarse.
- [ ] En el chart Q(t): ahora hay tres curvas moradas/de color con picos en distintos instantes y alturas — la actual más a la derecha (t≈65+), y las dos guardadas más a la izquierda (t≈40+), sin que se muevan al seguir editando.

**Paso 5 — Eliminar un escenario.**
Click en la "✕" del chip de **Escenario 1**.
- [ ] El chip de Escenario 1 desaparece.
- [ ] Su fila desaparece de la tabla.
- [ ] Su línea fina desaparece de **ambos** charts — quedan solo la curva actual gruesa y la línea fina de Escenario 2.

**Paso 6 — Vaciar la lista.**
Eliminá también Escenario 2.
- [ ] Vuelve a aparecer el texto "No hay escenarios guardados todavía." en el panel.
- [ ] Los charts vuelven a mostrar solo la curva actual (gruesa), sin ninguna línea fina superpuesta.

**Extra — botón deshabilitado en estado inválido.**
- [ ] Poné algún campo en un valor inválido (ej. σ = -5, ver sección 5) → el botón "Guardar escenario actual" se ve atenuado/deshabilitado y no responde al click mientras el error siga activo.

## 9. Sanity check de layout responsive

- [ ] Achicar la ventana del navegador a un ancho angosto (menos de ~1024px) → el panel de parámetros pasa a mostrarse arriba del contenido principal (columna única) en vez de al costado, sin que nada se corte o se superponga.

---

Si algo de esta lista falla, anotá el paso exacto y lo que viste (screenshot si es posible) — eso alcanza para que lo pueda reproducir y arreglar sin tener que re-explorar toda la app de nuevo.
