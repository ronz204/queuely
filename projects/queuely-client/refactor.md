# Plan de refactor — organización de `queuely-client`

Este documento describe **qué se va a hacer**, todavía no se ha tocado código. Es la propuesta a revisar antes de ejecutar el refactor.

## 1. Diagnóstico

`source/features/` hoy mezcla tres cosas de naturaleza distinta bajo el mismo nombre:

- **Lógica de dominio pura** (sin Vue, sin I/O): `demand-generator`, `queue-simulator`, `integral-analysis-engine`. Esto sí son sub-módulos de Queuely.
- **Estado de aplicación** disfrazado de composable: `dashboard/useSimulationParameters.ts` y `scenario-comparison/useScenarioComparison.ts` mantienen `ref`/`reactive` que en la práctica es estado global de la app (App.vue los llama una sola vez y lo pasa a todo por props). Es el caso de uso exacto para un store — hoy `pinia` está en `package.json` pero no se usa en ningún lado.
- **Componentes de UI** (`ParameterForm.vue`, `ScenarioComparison.vue`, los charts) mezclados en la misma carpeta que el estado y que helpers puros (`field-definitions.ts`, `build-chart-data.ts`, etc).

Además `shared/` es un cajón de sastre (tipos de dominio + una paleta de color de UI, sin relación entre sí) y `designs/` es en realidad el design system, pero no está nombrado como tal.

Resultado: para entender "qué es esta carpeta" hay que abrir los archivos, no alcanza con el nombre. Ese es el problema a resolver.

## 2. Principios que guían el reorden

- **Capas por dirección de dependencia**, de adentro hacia afuera: `domain` → `stores` → `features` → `app`, con `components` como hoja sin dependencias de negocio. Una capa solo puede importar de capas más internas, nunca al revés. Esto hace la arquitectura legible por estructura, no por convención tácita.
- **`domain/` son los sub-módulos reales de Queuely** (bounded contexts): matemática pura, sin Vue, sin efectos secundarios — tal como ya estaban escritos `demand-generator`, `queue-simulator` e `integral-analysis-engine`, solo que hoy conviven con UI en el mismo nivel.
- **Pinia reemplaza los composables que en realidad son estado de app.** Un composable con estado propio que un único componente raíz instancia una vez y reparte por props ya es, de hecho, un store sin la ergonomía de uno. Pasar a Pinia además elimina el prop-drilling actual (`App.vue` hoy reenvía `raw/errors/result/scenarios` a mano a cada hijo).
- **`features/` queda solo para las capacidades de cara al usuario de Queuely** (UI): formulario de parámetros, comparación de escenarios, visualización. Nada de estado compartido ni matemática vive ahí.
- **`components/` es el design system genérico**, sin conocimiento del dominio (`Badge`, `TextField`, etc. no saben qué es un `SimulationResult`).
- No se crean carpetas para adelantarse a necesidades futuras (YAGNI) — si algo termina teniendo un solo consumidor, vive junto a ese consumidor en vez de en un `shared/` genérico.

## 3. Estructura propuesta

```
source/
├── main.ts                          # bootstrap: createApp + createPinia
├── style.css
├── app/
│   └── App.vue                      # composición de la página, sin lógica propia
├── domain/                          # matemática pura de Queuely — sin Vue, sin I/O
│   ├── demand-generator/
│   │   ├── arrival-rate.ts
│   │   ├── poisson-thinning.ts
│   │   └── index.ts
│   ├── queue-simulator/
│   │   ├── service-rate.ts
│   │   ├── queue-series.ts
│   │   ├── critical-interval.ts
│   │   ├── metrics.ts
│   │   └── index.ts
│   ├── integral-analysis-engine/
│   │   ├── integrate.ts
│   │   └── index.ts
│   └── simulation/                  # servicio de dominio que combina los tres anteriores
│       ├── simulate.ts              # runSimulation(...) — hoy features/dashboard/simulate.ts
│       ├── types.ts                 # SimulationParameters/Series/Metrics/Result — hoy shared/types.ts
│       └── index.ts
├── stores/                          # estado de aplicación (Pinia)
│   ├── simulation/
│   │   ├── useSimulationStore.ts    # raw input, errores, result, isFrozen, setField(...)
│   │   ├── validation.ts            # RawParameterInput, ValidationErrors, validateParameters(...)
│   │   └── index.ts
│   └── scenario-comparison/
│       ├── useScenarioComparisonStore.ts
│       ├── palette.ts               # scenarioColor(...) — hoy shared/scenario-palette.ts
│       └── index.ts
├── features/                        # capacidades de UI de Queuely — solo componentes + helpers propios de esa UI
│   ├── parameter-form/
│   │   ├── ParameterForm.vue
│   │   ├── field-definitions.ts
│   │   └── index.ts
│   ├── scenario-comparison/
│   │   ├── ScenarioComparison.vue
│   │   └── index.ts
│   └── visualization/
│       ├── ArrivalServiceChart.vue
│       ├── QueueChart.vue
│       ├── MetricsPanel.vue
│       ├── StatusBadges.vue
│       ├── build-chart-data.ts
│       ├── chart-colors.ts
│       ├── chart-options.ts
│       ├── register-chart.ts
│       └── index.ts
└── components/                      # design system genérico — hoy `designs/`
    ├── Badge.vue
    ├── LegendSwatch.vue
    ├── StatCard.vue
    └── TextField.vue
```

`shared/` y `designs/` desaparecen como nombres: cada archivo que había en `shared/` tiene un dueño claro en el árbol de arriba, y `designs/` se renombra a `components/` (nombre que además el propio pedido pidió explícitamente).

## 4. Mapeo archivo por archivo

| Hoy | Pasa a | Motivo |
|---|---|---|
| `features/demand-generator/**` | `domain/demand-generator/**` | Es dominio puro, solo cambia de nivel |
| `features/queue-simulator/**` | `domain/queue-simulator/**` | Ídem |
| `features/integral-analysis-engine/**` | `domain/integral-analysis-engine/**` | Ídem |
| `features/dashboard/simulate.ts` | `domain/simulation/simulate.ts` | Es un domain service puro (ya lo dice su propio comentario), no UI |
| `shared/types.ts` (Simulation*) | `domain/simulation/types.ts` | Son los tipos que produce `runSimulation`, viven con su productor |
| `shared/types.ts` (`SavedScenario`) | `stores/scenario-comparison/useScenarioComparionStore.ts` | Es forma de estado de app, no dominio |
| `shared/scenario-palette.ts` | `stores/scenario-comparison/palette.ts` | Único consumidor es el store de escenarios |
| `features/dashboard/useSimulationParameters.ts` | `stores/simulation/useSimulationStore.ts` | Se convierte de composable a store Pinia (`defineStore`) |
| `features/dashboard/validation.ts` | `stores/simulation/validation.ts` | Ligado 1:1 al estado que valida el store |
| `features/dashboard/ParameterForm.vue` | `features/parameter-form/ParameterForm.vue` | Es la única pieza de UI real que quedaba en "dashboard" |
| `features/dashboard/field-definitions.ts` | `features/parameter-form/field-definitions.ts` | Metadata de UI del formulario |
| `features/scenario-comparison/useScenarioComparison.ts` | `stores/scenario-comparison/useScenarioComparisonStore.ts` | Composable → store Pinia |
| `features/scenario-comparison/ScenarioComparison.vue` | `features/scenario-comparison/ScenarioComparison.vue` | Se queda, pero pasa a leer el store directo en vez de props |
| `features/visualization/**` | `features/visualization/**` | Se queda igual, solo pasa a leer los stores directo en vez de props |
| `designs/*.vue` | `components/*.vue` | Renombre de carpeta a su nombre real |
| `App.vue` | `app/App.vue` | Pasa a ser puro layout: sin `computed`, sin wiring de props/emits — cada hijo lee su store |

## 5. Pinia: qué cambia en la práctica

- `main.ts` agrega `createPinia()` y `app.use(pinia)`.
- `useSimulationStore` y `useScenarioComparisonStore` reemplazan los composables actuales, con la misma lógica interna (debounce, validación, copia profunda al guardar un escenario) pero como `defineStore`.
- Como consecuencia, `App.vue` deja de pasar `raw/errors/result/scenarios/isFrozen` por props — `ParameterForm`, `MetricsPanel`, `ArrivalServiceChart`, `QueueChart`, `ScenarioComparison` y `StatusBadges` importan el store que necesitan y lo leen directo. Esto es el motivo real por el que Pinia deja todo "más limpio", no es solo una sustitución cosmética.
- Efecto secundario menor: el prop `showEvents` de `ArrivalServiceChart` hoy siempre se pasa en `true` y no existe ningún toggle en la UI — se elimina el prop y se deja fijo, en vez de mantener una flexibilidad que nadie usa (YAGNI).

## 6. `tsconfig`/`vite` — alias

Los dos archivos tienen la lista de alias duplicada a mano (no hay `vite-tsconfig-paths`), así que el refactor toca ambos en paralelo:

```
@domain/*     → source/domain/*
@stores/*     → source/stores/*
@features/*   → source/features/*
@components/* → source/components/*
```

Se eliminan `@shared/*` (la carpeta desaparece) y `@assets/*` (apunta a una carpeta que nunca existió). `app/App.vue` no necesita alias — `main.ts` la importa con ruta relativa, es el único consumidor.

## 7. Qué NO hace este refactor

- No agrega testing (no está en el alcance actual del proyecto).
- No toca el modelo matemático ni ningún resultado numérico — es reorganización y estado, cero cambios de comportamiento observable salvo el `showEvents` mencionado arriba.
- No introduce routing — sigue siendo una sola pantalla.
- No reescribe los `deltas/*.spec.md` todavía. Quedan desalineados con la carpeta nueva (mencionan "Lives under this slice's own feature directory" y "no external state-management library", ambas cosas dejan de ser ciertas). Lo dejo como paso explícito aparte para no mezclar "mover código" con "reescribir specs" en el mismo commit — se puede hacer inmediatamente después si querés.
- No actualiza `.claude/rules/frontend.md` (hoy dice explícitamente que la convención de carpetas "no existe todavía"). Una vez que este refactor esté aplicado y validado, tiene sentido documentar la convención de capas ahí mismo — lo dejo como seguimiento, no parte de este cambio.

## 8. Orden de ejecución

1. Crear la estructura nueva de carpetas y mover archivos (sin editar contenido todavía) para que los `git mv` queden trazables en el historial.
2. Convertir `useSimulationParameters`/`useScenarioComparison` a `defineStore`.
3. Actualizar imports en cascada (`domain` → `stores` → `features` → `app`) y los alias en `tsconfig.app.json` + `vite.config.ts`.
4. Simplificar `App.vue` y los componentes hoja para leer los stores en vez de recibir props.
5. Verificar con `vue-tsc -b` (type-check) y correr `dev` para revisar visualmente que el dashboard sigue funcionando igual (parámetros, charts, guardar/borrar escenario).

## 9. Riesgos a vigilar

- Ciclos de import entre `stores/simulation` y `domain/simulation` si algo del store terminara importando algo de `features` por error — la regla de capas de la sección 2 evita esto si se respeta al mover código.
- `structuredClone(toRaw(result))` en el guardado de escenarios depende de que `result` siga siendo un `ref` de Pinia (proxy) — el mismo cuidado que ya existe hoy se mantiene al mover la lógica al store.
- Alias desincronizados entre `tsconfig.app.json` y `vite.config.ts` es la fuente de error más probable — se tocan siempre juntos.

---

¿Seguimos con la ejecución de este plan tal cual, o hay algo que quieras ajustar antes (nombres, alcance de los specs, algo del punto 5)?
