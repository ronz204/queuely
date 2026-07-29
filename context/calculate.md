# Queuely — Modelo Matemático

Este documento es la fuente de verdad matemática del proyecto. Todo lo que el código calcule debe trazarse a una fórmula de aquí. Si hay una discrepancia entre el código y este documento, este documento manda.

## 1. Visión general: cómo encajan las piezas

El pipeline matemático tiene 4 pasos, en orden:

```
λ(t) [gaussiana, continua]
    ├──> Proceso de Poisson no homogéneo ──> eventos discretos (órdenes individuales)
    └──> junto con μ(t) ──> Q(t) [tamaño de cola] ──> D [backlog acumulado]
                                                    └──> métricas derivadas (promedio, pico, etc.)
```

λ(t) es el punto de partida de todo. De ahí se ramifica en dos direcciones: una continua (hacia Q(t) y las integrales) y una discreta (hacia los eventos individuales de Poisson). Ambas ramas describen el mismo fenómeno desde ángulos distintos, y en algún punto del análisis se comparan entre sí.

---

## 2. Notación y operaciones — guía de lectura

Antes de entrar en las fórmulas, esta sección explica **cada símbolo y operación** que vas a encontrar en el resto del documento. La idea es que no haya ningún signo "misterioso" — si en algún momento un símbolo no te hace clic, volvé a esta sección.

| Símbolo / operación | Qué significa | Nota |
|---|---|---|
| `t` | Variable de tiempo. La única variable independiente de todo el modelo. | Todo lo demás (λ, μ, Q) es "función de t" |
| `f(t)` | Notación general: "una función evaluada en t" | `λ(t)` se lee "lambda evaluado en el instante t" — **no es** lambda multiplicado por t |
| `λ` (lambda), `μ` (mu) | Letras griegas usadas por convención en teoría de colas: λ = llegada, μ = servicio | No confundir `μ` (tasa de servicio) con `μ_t` (centro de la gaussiana) — son cosas distintas que comparten letra por convención estadística |
| `exp(x)` | La función exponencial, equivalente a `e^x`, donde `e ≈ 2.71828` | En la gaussiana, el exponente siempre es negativo o cero, así que `exp(...)` da un valor entre 0 y 1 |
| `σ` (sigma) | Desviación estándar — mide qué tan "ancho" es algo | `σ²` es sigma al cuadrado; aparece en el denominador de la gaussiana |
| `∫` | Integral — el símbolo central del cálculo integral | Se lee como "el área acumulada bajo la curva de la función" |
| `∫ₐᵇ f(t) dt` | Integral definida de `f` entre los límites `a` y `b` | El resultado es **un número** (un área), no una función. `a` es el límite inferior, `b` el superior |
| `dt` | Un incremento infinitesimal de `t` | Indica respecto a qué variable se integra. En integración numérica, `dt` se aproxima con un paso finito `h` |
| `dQ/dt` | La derivada de `Q` respecto a `t` — la tasa de cambio instantánea | Se lee "cuánto cambia Q por cada unidad de tiempo que pasa" |
| `max(0, x)` | El mayor valor entre 0 y `x` | Se usa para "recortar" resultados que no tienen sentido físico si son negativos (ej. una cola no puede tener tamaño negativo) |
| `t₀, t₁, ..., tᵢ, ..., tₙ` | Subíndices que enumeran puntos discretos dentro de un intervalo continuo | `t₀` es el primer punto, `tₙ` el último, `tᵢ` es "el punto genérico i-ésimo". Aparecen al aproximar una integral con una suma de muchos puntos |
| `h` | El "paso": distancia entre puntos consecutivos al dividir un intervalo en `n` partes iguales | `h = (b - a) / n` |
| `n` | Número de subdivisiones/puntos usados en integración numérica | Más `n` = más precisión, más costo computacional |
| `P(evento)` | Notación de probabilidad: "la probabilidad de que ocurra el evento" | Se usa en el proceso de Poisson para decidir si un evento candidato se acepta o rechaza |
| valor "aleatorio" / "random" | Un valor generado siguiendo una **distribución de probabilidad específica** (uniforme, exponencial) | No es "cualquier número al azar sin regla" — cada una sigue una fórmula estadística precisa (ver sección 4) |
| `A`, `μ₀`, `T_max` (mayúsculas o con subíndice `0`/`max`) | Constantes o parámetros del modelo | Son valores que vos configurás al armar la simulación; no cambian con `t` |

---

## 3. λ(t) — Tasa de llegada (función gaussiana)

### Fórmula

```
λ(t) = A · exp( -(t - μ_t)² / (2σ²) )
```

### Parámetros

| Parámetro | Qué controla | Ejemplo típico |
|---|---|---|
| `A` | Altura del pico — la tasa máxima de llegada (órdenes/minuto en el instante de mayor demanda) | 500 órdenes/min |
| `μ_t` | Instante donde ocurre el pico de demanda | t = 120 (minuto 120 de la simulación) |
| `σ` | Qué tan "ancho" es el pico — un σ grande significa que la demanda alta dura más tiempo | 30 minutos |

### Cómo leer la fórmula paso a paso

1. `(t - μ_t)` — la distancia entre el instante actual y el pico. Si `t = μ_t`, esto es 0.
2. `(t - μ_t)²` — esa distancia, al cuadrado (siempre positiva, sin importar si `t` está antes o después del pico — por eso la gaussiana es simétrica).
3. `-(t - μ_t)² / (2σ²)` — la distancia al cuadrado, dividida entre `2σ²` y con signo negativo. Mientras más lejos del pico, más negativo este número.
4. `exp(...)` de ese número — como el exponente es negativo (o cero exactamente en el pico), el resultado es un valor entre 0 y 1: vale 1 exactamente en `t = μ_t`, y se acerca a 0 mientras `t` se aleja del pico.
5. `A · exp(...)` — se multiplica por `A` para escalar ese valor entre 0 y 1 a la tasa real máxima de llegada.

### Intuición

Pensalo como una ola: empieza baja, sube hasta un máximo en `t = μ_t`, y vuelve a bajar. `A` es la altura de la ola, `σ` es qué tan larga es la ola de punta a punta. Es simétrica alrededor de `μ_t`.

### Propiedad clave para el resto del modelo

`λ(t)` es siempre positiva y suave (infinitamente derivable), pero **su integral no tiene forma cerrada elemental** — no existe una función simple `F(t)` tal que `F'(t) = λ(t)`. Esto es lo que obliga a usar integración numérica más adelante (sección 8).

---

## 4. Proceso de Poisson no homogéneo — de continuo a discreto

`λ(t)` describe una tasa *promedio* — no dice exactamente cuándo llega cada orden individual, solo la densidad esperada de llegadas en cada instante. El proceso de Poisson no homogéneo es el mecanismo que toma esa tasa y genera una lista concreta de instantes de llegada: `t₁, t₂, t₃, ...`

### Por qué "no homogéneo"

Un proceso de Poisson homogéneo tiene tasa constante (λ fijo). El nuestro es **no homogéneo** porque la tasa cambia con el tiempo — es literalmente `λ(t)`, la gaussiana de la sección 3.

### Dos operaciones aleatorias que usa este algoritmo

- **`exponencial_random(1 / λ_max)`**: genera "cuánto tiempo pasa hasta el próximo evento candidato", asumiendo tasa constante `λ_max`. Es la distribución natural para "tiempo de espera hasta el próximo evento" cuando la tasa es constante.
- **`uniforme_random(0, 1)`**: genera un número decimal al azar entre 0 y 1, con la misma probabilidad para cualquier valor en ese rango. Se usa como "moneda cargada" para aceptar o rechazar un candidato.

### Cómo generarlo: algoritmo de thinning (adelgazamiento)

Este es el método estándar y el más simple de implementar correctamente:

1. Encontrar `λ_max` = el valor máximo de `λ(t)` en el intervalo de estudio (para la gaussiana, esto es simplemente `A`, el valor en `t = μ_t`).
2. Generar un proceso de Poisson **homogéneo** auxiliar con tasa constante `λ_max` (los tiempos entre eventos siguen una distribución exponencial con parámetro `λ_max`).
3. Para cada evento candidato en el instante `t` generado en el paso 2, **aceptarlo con probabilidad** `λ(t) / λ_max`, y descartarlo si no.
4. Los eventos aceptados son las llegadas reales del proceso no homogéneo.

### Por qué funciona

En los instantes donde `λ(t)` es baja (lejos del pico), la mayoría de los candidatos se rechazan — por eso hay pocas llegadas ahí. Cerca del pico, `λ(t) ≈ λ_max`, así que casi todos los candidatos se aceptan. El resultado es una densidad de eventos que sigue exactamente la forma de la gaussiana.

### Pseudocódigo

```
t = 0
eventos = []
mientras t < T_max:
    t += exponencial_random(1 / λ_max)   # siguiente candidato
    si t >= T_max: romper
    u = uniforme_random(0, 1)
    si u <= λ(t) / λ_max:
        eventos.append(t)
retornar eventos
```

---

## 5. μ(t) — Tasa de servicio

Representa cuántas órdenes puede procesar el sistema por unidad de tiempo. A diferencia de `λ(t)`, no tiene por qué ser gaussiana — puede modelarse de formas distintas según qué se quiera simular:

- **Constante:** `μ(t) = μ₀` — el sistema tiene capacidad fija (el caso más simple, buen punto de partida).
- **Escalonada:** `μ(t)` sube en pasos discretos (simula "activar más servidores" en ciertos momentos).
- **Función del tiempo:** `μ(t)` variable si se quiere modelar, por ejemplo, degradación de capacidad bajo estrés.

Para la primera versión funcional de Queuely, `μ(t) = μ₀` (constante) es suficiente y recomendado — permite validar el resto del modelo antes de añadir complejidad. Las variantes no constantes son una extensión natural, no un requisito inicial.

---

## 6. Q(t) — Tamaño de la cola

### La idea

La cola crece cuando llegan más órdenes de las que se procesan, y se reduce cuando se procesa más de lo que llega. La *tasa de cambio* de la cola es la diferencia entre llegada y servicio:

```
dQ/dt = λ(t) - μ(t)
```

### Forma integral (Teorema Fundamental del Cálculo aplicado)

Integrando ambos lados desde el inicio (t=0) hasta un instante t:

```
Q(t) = Q(0) + ∫₀ᵗ [λ(s) - μ(s)] ds
```

**Nota de notación:** acá usamos `s` como variable de integración (en vez de `t`) porque `t` ya está ocupado como el límite superior de la integral — es una convención para no confundir "el instante hasta donde integro" con "la variable que recorre el intervalo mientras integro". `s` recorre todos los valores entre 0 y `t`.

Esto es el Teorema Fundamental del Cálculo en acción: `Q(t)` es una función acumulada cuya derivada es exactamente `λ(t) - μ(t)`. En español simple: **Q(t) es el área acumulada bajo la curva de (llegada menos servicio), desde el inicio hasta t**.

### Restricción física importante

`Q(t)` **no puede ser negativa** — no existen "órdenes negativas" esperando en la cola. Si la integral da un valor negativo (o sea, se procesó más de lo que llegó y la cola matemáticamente "debería" bajar de cero), hay que truncar:

```
Q(t) = max(0, Q(0) + ∫₀ᵗ [λ(s) - μ(s)] ds)
```

Esto es clave para la implementación: la fórmula pura de la integral puede dar valores negativos sin sentido físico, y el código debe aplicar ese `max(0, ...)`.

### Q(0), la condición inicial

Normalmente `Q(0) = 0` — la simulación empieza con la cola vacía, antes de que arranque el evento de alta demanda.

---

## 7. D — Backlog acumulado (área entre curvas)

### Definición

`D` es el total de órdenes atrasadas acumuladas durante todo el período donde la llegada superó al servicio. Matemáticamente es el área entre las curvas `λ(t)` y `μ(t)`, pero **solo contando donde λ(t) > μ(t)** (donde realmente se genera atraso, no donde el sistema está "adelantado"):

```
D = ∫ [λ(t) - μ(t)] dt,  evaluada solo sobre el conjunto {t : λ(t) > μ(t)}
```

**Nota de notación:** `{t : λ(t) > μ(t)}` se lee "el conjunto de todos los instantes t tales que λ(t) es mayor que μ(t)". Los dos puntos `:` dentro de las llaves significan "tal que" — es notación de teoría de conjuntos, define qué instantes entran a la integral.

En la práctica esto se calcula así:
1. Encontrar el intervalo (o intervalos) `[t_a, t_b]` donde `λ(t) > μ(t)` — con `μ(t)` constante, esto suele ser un único intervalo alrededor del pico de la gaussiana.
2. Integrar `(λ(t) - μ(t))` solo en ese intervalo.

Esto es distinto de `Q(t_final)` — `Q(t)` es el tamaño de la cola en un instante puntual (puede bajar a 0 después del pico), mientras que `D` es el **total acumulado** de desbalance a lo largo de todo el intervalo crítico. Son dos métricas complementarias, no la misma cosa con otro nombre.

---

## 8. Valor promedio de una función

### Fórmula (Teorema del Valor Medio para integrales)

```
f_promedio = (1 / (b - a)) · ∫ₐᵇ f(t) dt
```

### Cómo leerla

Es literalmente "el área bajo la curva, repartida en partes iguales a lo largo del ancho del intervalo". Si tomás el área total (`∫ₐᵇ f(t) dt`) y la dividís entre el ancho del intervalo (`b - a`), obtenés la altura que tendría un rectángulo con esa misma área y ese mismo ancho — esa altura es el promedio.

### Dónde se usa en Queuely

Para responder "¿cuál fue la tasa de llegada promedio durante la ventana de mayor demanda?": se define la ventana `[a, b]` de interés (por ejemplo, el intervalo donde `λ(t) > μ(t)`, el mismo que en la sección 7) y se aplica la fórmula con `f(t) = λ(t)`.

---

## 9. Integración numérica

### Por qué la necesitamos

Como se explicó en la sección 3, `λ(t)` es una gaussiana y **su integral no tiene forma cerrada elemental**. Esto significa que no podemos escribir una fórmula algebraica simple para `∫λ(t)dt` — necesitamos aproximarla numéricamente, evaluando la función en puntos discretos.

Esto aplica a **todas** las integrales del modelo: `Q(t)`, `D`, y el valor promedio.

### Regla del trapecio

Divide el intervalo `[a, b]` en `n` sub-intervalos iguales de ancho `h = (b - a) / n`, y aproxima el área bajo la curva en cada sub-intervalo como un trapecio:

```
∫ₐᵇ f(t) dt ≈ h · [ f(t₀)/2 + f(t₁) + f(t₂) + ... + f(tₙ₋₁) + f(tₙ)/2 ]
```

donde `tᵢ = a + i·h` (cada punto es el inicio del intervalo más `i` pasos de tamaño `h`).

**Por qué los extremos se dividen entre 2:** cada trapecio interior comparte un lado con el trapecio vecino, así que el punto donde se tocan se cuenta una sola vez "completo" en la suma — pero los dos puntos de los bordes (`t₀` y `tₙ`) solo pertenecen a un trapecio cada uno, por eso llevan la mitad de peso.

Simple de implementar, buena para empezar. El error de aproximación es proporcional a `h²` (si duplicás `n`, el error se divide entre 4, aproximadamente).

### Regla de Simpson

Más precisa que el trapecio para la misma cantidad de puntos, porque en vez de aproximar cada tramo con una línea recta, usa una parábola. Requiere `n` par:

```
∫ₐᵇ f(t) dt ≈ (h/3) · [ f(t₀) + 4f(t₁) + 2f(t₂) + 4f(t₃) + 2f(t₄) + ... + 4f(tₙ₋₁) + f(tₙ) ]
```

Patrón de coeficientes: extremos = 1, índices impares = 4, índices pares (no extremos) = 2. Ese patrón `1, 4, 2, 4, 2, ..., 4, 1` no es arbitrario — sale de ajustar una parábola exacta a cada trío de puntos consecutivos e integrar esa parábola de forma analítica; el resultado de esa cuenta es justo esos coeficientes.

El error es proporcional a `h⁴` — mucho más preciso que el trapecio con el mismo número de puntos.

### Cuál usar en Queuely

Recomendación: **Simpson como método principal** (más preciso), y **trapecio como método de comparación/validación** — correr ambos sobre los mismos datos y verificar que los resultados convergen, es una buena forma de detectar errores de implementación.

### Cuántos puntos (`n`) usar

Mientras más grande `n`, más preciso el resultado pero más costoso computacionalmente. Para una gaussiana suave como `λ(t)`, valores de `n` entre 100 y 1000 sobre el intervalo de estudio ya dan una precisión más que suficiente para este proyecto. Si hay dudas, se puede duplicar `n` y verificar que el resultado no cambie significativamente (eso confirma que ya se alcanzó convergencia).

---

## 10. Cómo se conecta todo en la implementación

Orden recomendado de construcción (cada paso depende del anterior):

1. Implementar `λ(t)` (gaussiana) y `μ(t)` (constante) como funciones puras.
2. Implementar integración numérica genérica (trapecio y Simpson) que reciba cualquier función y un intervalo.
3. Usar el integrador para calcular `Q(t)` en una malla de instantes (aplicando el `max(0, ...)`).
4. Usar el integrador para calcular `D` sobre el intervalo crítico.
5. Calcular el valor promedio de `λ(t)` sobre ese mismo intervalo.
6. Implementar el proceso de Poisson no homogéneo (thinning) como una rama independiente, que se compara contra `λ(t)` al final.

Cada uno de estos pasos es una función testeable de forma aislada — no hace falta el resto del sistema para verificar que, por ejemplo, la regla de Simpson da el resultado correcto sobre una función conocida (probalo primero con algo como `f(t) = t²`, cuya integral analítica conocés, antes de confiar en el resultado sobre la gaussiana).