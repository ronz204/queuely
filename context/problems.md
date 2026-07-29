# Queuely — El Problema

> Este documento responde una sola pregunta: ¿qué problema real resuelve Queuely, y por qué necesitamos cálculo integral para resolverlo?

## El problema real

Durante eventos de alta demanda (Black Friday es el caso de estudio), las tiendas de e-commerce reciben órdenes a una tasa que **varía fuertemente en el tiempo** — hay un pico de llegadas alrededor de ciertas horas, y luego baja. El sistema que procesa esas órdenes (inventario, pagos, logística) tiene una capacidad de servicio que **no siempre alcanza** para seguirle el ritmo al pico.

Cuando la tasa de llegada λ(t) supera la tasa de servicio μ(t), las órdenes se acumulan en una cola. Si ese desbalance dura suficiente tiempo o es suficientemente grande, se genera un **backlog** — un atraso acumulado que puede tardar horas en absorberse incluso después de que el pico de demanda ya pasó.

El problema de negocio es concreto: ¿cuánto crece la cola?, ¿cuánto tarda en vaciarse?, ¿cuál es el momento crítico?, ¿cuánta capacidad de servicio adicional se necesitaría para evitar el colapso?

## Por qué cálculo integral (y no solo conteo)

Las tasas λ(t) y μ(t) son funciones continuas en el tiempo, no números fijos. Eso significa que preguntas como "¿cuántas órdenes llegaron en total entre las 2pm y las 4pm?" o "¿cuál fue la tasa promedio de llegada durante el pico?" no se responden contando — se responden **integrando**.

Concretamente:

- **D (backlog acumulado)** es la integral definida de (λ(t) − μ(t)) sobre el intervalo donde λ(t) > μ(t). Es literalmente el área entre las dos curvas.
- **El valor promedio de λ(t)** durante el pico usa el teorema del valor promedio de una función.
- **Q(t)**, el tamaño de la cola en cualquier instante, es una función acumulada — se construye con el Teorema Fundamental del Cálculo a partir de la tasa neta de cambio.
- Como λ(t) es una gaussiana, muchas de estas integrales **no tienen solución analítica cerrada** (la integral de una gaussiana no es elemental) — por eso el proyecto necesita métodos de **integración numérica** (trapecio, Simpson) para calcularlas en la práctica.

En resumen: el problema de "¿qué tan mal se pone la cola y cuándo?" es, matemáticamente, un problema de áreas bajo curvas — el dominio natural del cálculo integral.

## Preguntas que Queuely debe poder responder

1. ¿Cómo evoluciona el tamaño de la cola Q(t) a lo largo del evento?
2. ¿Cuál es el backlog total acumulado D al final del período de estudio?
3. ¿En qué momento la cola alcanza su punto máximo?
4. ¿Cuál es la tasa de llegada promedio durante la ventana de mayor demanda?
5. ¿Qué tan preciso es el modelo continuo (gaussiana) comparado con la simulación discreta (Poisson)?

## Por qué esto importa (impacto esperado)

Este tipo de modelado es exactamente lo que usan los equipos de ingeniería en empresas reales para dimensionar capacidad antes de eventos de alto tráfico: cuánta infraestructura de procesamiento reservar, cuándo activar recursos adicionales, y cuánto backlog es "aceptable" antes de que la experiencia del cliente se deteriore. Queuely traduce ese problema de ingeniería a un modelo matemático verificable y a código que lo simula.

## Fuera de scope de este problema

Queuely no busca predecir demanda real de una tienda específica ni reemplazar un sistema de colas en producción (RabbitMQ, Redis, etc.). El objetivo es demostrar, con un modelo matemático riguroso y una simulación funcional, cómo el cálculo integral describe y predice el comportamiento de un sistema de colas bajo estrés.
