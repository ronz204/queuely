# Queuely — Overview

> Documento de referencia rápida. Si sos un LLM (Claude Code) leyendo esto por primera vez: acá está el contexto mínimo necesario para entender qué estamos construyendo y por qué. Si sos Ron (o cualquier compañero del equipo): esto es el mapa para no perderse.

## ¿Qué es Queuely?

Queuely es un simulador de una **cola de procesamiento de órdenes de e-commerce durante un evento de alta demanda** (escenario tipo Black Friday). No es solo una simulación — es un proyecto académico de **ISW-523 (Cálculo Integral para Informática)** que usa herramientas de cálculo integral para modelar, analizar y visualizar el comportamiento de un sistema real de colas.

La idea central: cuando una tienda online tiene un pico de demanda, las órdenes llegan mucho más rápido de lo que el sistema puede procesarlas. Queuely modela ese desbalance matemáticamente y lo simula en código.

## El modelo matemático, en una mirada

Cuatro piezas que se relacionan entre sí:

| Símbolo | Qué representa | Cómo se modela |
|---|---|---|
| **λ(t)** | Tasa de llegada de órdenes | Función gaussiana (forma continua de la curva de demanda) |
| **μ(t)** | Tasa de servicio (qué tan rápido procesamos) | Función del sistema |
| **Q(t)** | Tamaño de la cola en el tiempo | Función acumulada, resultado de λ(t) - μ(t) |
| **D** | Backlog acumulado (órdenes atrasadas) | Integral definida sobre el intervalo de estudio |

Dos capas que **no son redundantes, son complementarias**:
- La **gaussiana** define la forma continua e ideal del pico de demanda (cuántas órdenes "en promedio" llegan en cada instante).
- El **proceso de Poisson no homogéneo** usa esa gaussiana como su tasa λ(t) para generar eventos discretos e individuales (cada orden real que entra al sistema, con su aleatoriedad).

Herramientas de cálculo integral aplicadas:
- Integrales definidas
- Área entre curvas (para comparar λ(t) vs μ(t))
- Valor promedio de una función
- Teorema Fundamental del Cálculo
- Integración numérica: regla del trapecio y regla de Simpson (para cuando no hay solución analítica cerrada)

## Arquitectura conceptual: 4 módulos

1. **Generador de demanda** — produce λ(t) (gaussiana) y genera eventos discretos vía Poisson no homogéneo.
2. **Simulador de cola** — usa λ(t) y μ(t) para calcular Q(t) y el backlog D a lo largo del tiempo.
3. **Motor de análisis integral** — aplica las herramientas de cálculo (integrales, área entre curvas, promedio, Simpson/trapecio) sobre los datos generados.
4. **Módulo de visualización** — grafica λ(t), μ(t), Q(t) y las métricas derivadas para que el análisis se pueda leer de un vistazo.