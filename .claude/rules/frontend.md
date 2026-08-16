---
paths:
  - "**/*.vue"
  - "**/*.ts"
---

# Frontend Conventions

Conventions for Vue 3 + TypeScript + Tailwind CSS code, including the project's source-layout convention. The goal is readable, approachable code that stays concise — favor clarity over cleverness, and keep components small enough that their responsibility is obvious from a glance.

---

## Source Layout

Source is organized into top-level folders by layer, named after the role each one plays: `domain/`, `stores/`, `features/`, `components/`, `app/`.

- **Layer by dependency direction, innermost to outermost: `domain` → `stores` → `features` → `app`.** `components` sits alongside as a dependency-free leaf every other layer may use. A layer may only import from a layer at or inside its own level — `domain` never imports from `stores`/`features`/`app`; `stores` may import from `domain` but never from `features`/`app`; `features` may import from `stores`, `domain`, and `components`; `app` composes `features` and nothing imports from `app`. This makes the architecture legible from the folder structure alone — knowing which top-level folder a file lives in tells you what it's allowed to depend on, without opening it.
- **`domain/` holds pure business/math logic only** — no Vue, no reactivity, no I/O. A function here takes a value and returns a value; if it needs `ref`/`reactive`/a store, it doesn't belong here.
- **`stores/` holds Pinia stores** — anything reactive that more than one component needs to read, or that outlives a single component's lifecycle. A composable that only wraps one component's local state stays inside that component; once a piece of state is instantiated once and read from several unrelated components, it belongs in a store, not a composable.
- **`features/` holds UI only** — Vue components plus any helper tightly coupled to that UI with no other consumer (e.g. a form's field-label metadata). No shared reactive state and no domain math lives here. A feature component reads the stores and domain types it needs directly instead of receiving them as props from a parent — avoid re-threading store state through props/emits when the component can read the store itself.
- **`components/` is the generic design system** — reusable UI primitives with no awareness of any domain concept. A file here should be usable in a project with a completely different data model without modification.
- **`app/` is the composition root** — the single top-level component (and its bootstrap file) that assembles `features/` into the actual page. It holds layout only, no business logic, no reactive state of its own.
- **Each top-level concern folder exports its public surface through an `index.ts` barrel** (or a single component file directly, for a one-component concern) — consumers import from the folder, not from a specific file inside it, so a file can be renamed or split without breaking every caller.

## Component Authoring

- **Use `<script setup lang="ts">`** for every component, not the Options API. It's the current idiomatic default for Vue 3 — less boilerplate than `defineComponent`, and TypeScript inference works throughout the block without extra generic wiring.
- **Type props and emits with the type-only generic syntax** (`defineProps<{ ... }>()`, `defineEmits<{ ... }>()`), not the runtime validator syntax (`props: { foo: String }`). The type-only form is checked at compile time and gives real autocomplete on the calling side; runtime validators only catch mistakes at runtime and duplicate what TypeScript already guarantees.
- **Keep components single-responsibility.** If a template needs multiple `v-if`/`v-else-if` branches to express unrelated states, or a `<script setup>` block accumulates logic for more than one concern, that's a sign that the component should split — a reader shouldn't have to hold two unrelated concerns in their head to understand one file.
- **Prefer `computed` over an inline expression repeated in the template.** If the same derived value is used more than once, or the expression takes more than a glance to parse, name it via `computed` — a named computed value documents *what* the derived value means, not just how it's calculated.

## TypeScript Conventions

- **Avoid `any`.** If a type is genuinely unknown at a boundary (e.g. parsing external input), use `unknown` and narrow it explicitly — `any` silently disables type-checking for everything downstream of it, which defeats the purpose of using TypeScript in the first place.
- **Be explicit at boundaries, let inference handle the rest.** Function parameters, component props/emits, and exported values should have explicit types since they define a contract other code relies on; local variables inside a function body don't need annotations TypeScript can already infer — repeating an inferable type just adds noise.
- **Prefer `type` aliases for props/emits shapes and unions; reserve `interface` for shapes meant to be extended or implemented.** Consistency here matters more than which one is "correct" — pick based on whether the shape is closed data (`type`) or an extensible contract (`interface`), not by habit.
- **Model state that can't coexist as a union, not as multiple independent booleans.** For example, a loading/error/success state expressed as one discriminated union prevents impossible combinations (like `loading: true` and `error: "..."` at once) that separate booleans would silently allow.

## Reactivity Patterns

- **Use `ref` for primitives and for consistency at call sites; reserve `reactive` for object state that's never reassigned wholesale.** Mixing both styles arbitrarily makes it unpredictable whether a given piece of state needs `.value` — defaulting to `ref` keeps that rule simple: template access is automatic, script access always needs `.value`.
- **Extract reusable reactive logic into a composable, not a mixin.** Composables compose explicitly (you can see exactly what a component pulls in and from where); mixins merge implicitly and make it hard to trace where a given reactive property actually came from.
- **Name composables with a `use` prefix** (e.g. a composable managing a countdown timer, not `Timer` or `timerLogic`) — this is now a strong enough convention in the Vue ecosystem that deviating from it makes a composable harder to recognize as one at a glance.
- **Prefer `computed` over a `watch` that just re-derives a value.** `watch` is for side effects (triggering an action in response to a change); if all it does is set another ref to a derived value, that's what `computed` exists for, and it avoids the stale-value bugs that come from a forgotten dependency in a watcher.

## Tailwind Usage

- **Keep class lists composed of real Tailwind utilities; avoid arbitrary value syntax (`w-[137px]`, `text-[#3b3b3b]`) unless there's genuinely no scale value that fits.** Arbitrary values silently opt out of the design system's consistency — a one-off pixel value or hex color can't be reasoned about the same way a scale step can.
- **Don't reach for `@apply` to avoid writing utility classes in the template.** `@apply` re-introduces a separate stylesheet to keep in sync with the markup, which is exactly what utility-first classes in the template are meant to avoid — if a class list is genuinely unwieldy, that's a sign the markup should become a smaller component, not that the classes should move to CSS.
- **Express conditional classes with a plain object or array binding (`:class="{ 'opacity-50': disabled }"`), not string concatenation.** Vue's built-in class binding already handles this cleanly; building class strings by hand is harder to read and easy to get wrong with spacing.
- **Order-sensitive utilities aside, group related classes together (layout, then spacing, then typography, then color/state)** rather than alphabetically or in whatever order they were typed — a class list read left to right should roughly describe the element from its box model outward, which makes a long list scannable instead of just long.

## Naming

- **Component file/tag names in PascalCase, multi-word** (never a single word, since single-word component names collide with existing and future HTML elements). Props and emitted event names in camelCase.
- **Name things for what they mean, not how they're implemented.** A prop called `isDisabled` reads clearly at the call site; a prop called `flag1` doesn't, regardless of how obvious its purpose feels while writing it.
- **Avoid abbreviations that aren't immediately obvious** (`btn`, `idx`, `cfg`) in anything outside the tightest local scope (e.g. a one-line loop). The cost of a few extra characters is much lower than the cost of a reader pausing to decode a shortened name.

---

## Non-goals

- The layering convention doesn't mandate a store per feature — most features need at most one, and a feature with no state shared across components or outliving its own lifecycle needs no store at all; local component reactivity (`ref`/`reactive`/`computed`) is still correct for state that's genuinely local.
- No testing convention — automated tests aren't part of the current scope, so this rule doesn't prescribe how components should be structured for testability.
