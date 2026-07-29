# Queuely — Teoría de Colas

Este documento explica los conceptos de teoría de colas que sostienen el proyecto. `calculate.md` explica el "cómo se calcula" (las integrales); este documento explica el "qué es lo que estamos modelando" desde la perspectiva de teoría de colas como disciplina — el vocabulario y los conceptos que un ingeniero de sistemas reconocería.

## 1. ¿Qué es un sistema de colas?

Un sistema de colas tiene tres partes:

1. **Fuente de llegadas** — de dónde vienen los clientes/órdenes que entran al sistema.
2. **La cola** — donde esperan los que ya llegaron pero todavía no han sido atendidos.
3. **El servidor (o servidores)** — lo que procesa/atiende, sacando elementos de la cola.

En Queuely: los **clientes** son órdenes de e-commerce, la **cola** es el buffer de órdenes pendientes de procesar, y el **servidor** es la capacidad de procesamiento del sistema (inventario, pagos, logística — todo simplificado en una sola tasa de servicio).

## 2. Notación de Kendall (A/S/c)

Es la forma estándar de clasificar un sistema de colas con tres símbolos: `A/S/c`

- **A** — el proceso de llegadas (ej. `M` = Markoviano/Poisson, `D` = determinístico, `G` = general)
- **S** — el proceso de servicio (misma clasificación que A)
- **c** — número de servidores

Un `M/M/1` clásico es: llegadas Poisson, servicio exponencial, 1 servidor. Es el sistema de colas más estudiado y tiene fórmulas cerradas para todo (tiempo de espera promedio, longitud de cola promedio, etc.) — pero esas fórmulas **asumen tasas constantes** (λ y μ no cambian con el tiempo).

### Por qué Queuely no es un M/M/1 clásico

Queuely es más parecido a un **`M(t)/M/1`** — un sistema donde la tasa de llegada `λ(t)` varía en el tiempo (la gaussiana). Esto se llama un sistema **no estacionario** o **transitorio**, y es justamente por esto que el proyecto no puede usar las fórmulas cerradas clásicas de teoría de colas — no existen para el caso general no estacionario. Por eso el enfoque de Queuely es simulación + cálculo integral en vez de fórmulas de libro de texto.

Esta es la razón matemática de fondo por la que el proyecto necesita cálculo integral: **la teoría de colas clásica resuelve el caso estacionario con álgebra; Queuely resuelve el caso no estacionario con integrales**.

## 3. Intensidad de tráfico (ρ)

```
ρ(t) = λ(t) / μ(t)
```

Se lee "rho", y mide qué tan cargado está el sistema en relación a su capacidad:

- **ρ(t) < 1** → el sistema procesa más rápido de lo que llega. La cola tiende a vaciarse.
- **ρ(t) = 1** → el sistema está exactamente al límite de su capacidad.
- **ρ(t) > 1** → llegan más órdenes de las que se pueden procesar. La cola crece — este es el estado durante el pico del evento de alta demanda.

### Condición de estabilidad

En teoría de colas clásica (tasas constantes), la condición de estabilidad de largo plazo es `ρ < 1` — si no se cumple, la cola crece sin límite para siempre. En Queuely, como `λ(t)` varía y eventualmente vuelve a bajar (es una gaussiana, no una función que crece indefinidamente), el sistema es **temporalmente inestable** (`ρ(t) > 1`) durante el pico, pero se espera que vuelva a ser estable (`ρ(t) < 1`) después. Esa ventana de inestabilidad temporal es exactamente lo que genera el backlog `D` de `calculate.md`.

## 4. Período ocupado (busy period)

El intervalo continuo de tiempo durante el cual el sistema tiene al menos una orden en cola o en proceso (es decir, `Q(t) > 0`). En Queuely, el período ocupado crítico es el que empieza cuando `λ(t)` supera a `μ(t)` y termina cuando la cola por fin logra vaciarse — que puede ser **después** de que `λ(t)` ya volvió a estar por debajo de `μ(t)`, porque todavía hay backlog acumulado por drenar.

Esto conecta directamente con `Q(t)`: el período ocupado es el intervalo donde `Q(t) > 0`, y termina en el primer instante donde `Q(t)` vuelve a tocar 0.

## 5. Ley de Little

Una de las relaciones más generales de teoría de colas, válida para casi cualquier sistema en estado estable:

```
L = λ · W
```

Donde:
- `L` = número promedio de clientes/órdenes en el sistema
- `λ` = tasa de llegada promedio
- `W` = tiempo promedio que un cliente/orden pasa en el sistema

### Aplicabilidad a Queuely (con cautela)

La Ley de Little asume un sistema en **estado estable** (las condiciones no cambian con el tiempo) — Queuely es explícitamente no estacionario durante el pico, así que la ley no aplica literalmente en cualquier instante `t`. Sin embargo, sí es útil como **aproximación o verificación** sobre ventanas de tiempo donde el sistema se comporta de forma relativamente estable (por ejemplo, comparando el promedio de `Q(t)` durante todo el evento contra `λ_promedio · W_promedio` como sanity check).

## 6. Vocabulario de referencia rápida

| Término | En teoría de colas | En Queuely |
|---|---|---|
| Cliente | Entidad que llega y espera servicio | Orden de e-commerce |
| Servidor | Entidad que atiende/procesa | Capacidad de procesamiento (inventario + pagos + logística, simplificado) |
| Cola / buffer | Espacio donde esperan los clientes no atendidos | `Q(t)`, el tamaño de la cola de órdenes pendientes |
| Sistema | Cola + servidor juntos | Todo el pipeline de procesamiento de órdenes |
| Tasa de llegada | `λ`, clientes por unidad de tiempo | `λ(t)`, órdenes/minuto, gaussiana |
| Tasa de servicio | `μ`, capacidad de atención por unidad de tiempo | `μ(t)`, órdenes/minuto que el sistema puede procesar |
| Intensidad de tráfico | `ρ = λ/μ` | `ρ(t) = λ(t)/μ(t)`, varía en el tiempo |
| Estado estable / estacionario | Las tasas no cambian en el tiempo, el sistema alcanza un equilibrio | **No aplica directamente a Queuely** — el sistema es transitorio por diseño |
| Período ocupado | Intervalo con al menos un cliente en el sistema | Intervalo donde `Q(t) > 0` |
| Backlog | Trabajo acumulado sin procesar | `D`, definido en `calculate.md` |

## 7. Por qué esto le importa a la implementación

Cuando estés escribiendo o revisando código de Queuely, estos son los chequeos de sanity que se derivan directamente de la teoría de este documento:

- `Q(t)` nunca debería quedar negativo (ya cubierto en `calculate.md`, pero la razón de fondo es que `Q(t)` mide una cantidad física real de órdenes esperando).
- El pico de `Q(t)` debería ocurrir **después** del pico de `λ(t)` (no en el mismo instante) — porque la cola sigue creciendo mientras `ρ(t) > 1`, y eso ocurre un rato después de que `λ(t)` ya empezó a bajar, hasta que `λ(t)` cruza por debajo de `μ(t)`.
- El sistema debería volver a `Q(t) = 0` en algún momento después del evento (asumiendo que `μ(t)` es suficiente para drenar el backlog) — si `Q(t)` nunca vuelve a 0 en la simulación, eso es una señal de que `μ₀` está mal configurado (demasiado bajo) o hay un error de implementación.