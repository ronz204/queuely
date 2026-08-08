---
paths:
  - "**/*.vue"
  - "**/*.ts"
---

# Frontend Conventions

Conventions for Vue 3 + TypeScript + Tailwind CSS code. The goal is readable, approachable code that stays concise — favor clarity over cleverness, and keep components small enough that their responsibility is obvious from a glance. This intentionally says nothing about directory/folder layout — that convention doesn't exist yet and will be documented once a real pattern emerges from actual code, not decided upfront.

---

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

- No directory/file-organization convention is defined here — that will be documented separately once a real pattern exists in actual code, not decided in advance of writing any.
- No state-management library convention — there's no external state library in use; component-local reactivity and composables are the state layer for now.
- No testing convention — automated tests aren't part of the current scope, so this rule doesn't prescribe how components should be structured for testability.
