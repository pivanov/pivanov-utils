---
layout: home
hero:
  name: '@pivanov/utils'
  text: TypeScript utilities, refined
  tagline: Focused modules for strings, objects, async, DOM, event bus, cache storage, and deep clone/equality. Zero dependencies. Tree-shakeable. Fully typed.
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: API Reference
      link: /api/assertion
features:
  - title: Fully Typed
    details: Strict TypeScript across every module. Literal types are preserved through helpers like capitalize, and type guards narrow properly.
  - title: Tree-Shakeable
    details: Ships ESM, CJS, and per-module subpath exports. Import only what you use - sideEffects:false tells your bundler it's safe.
  - title: Zero Dependencies
    details: No runtime deps. React is a peer dependency and is only needed for the optional useEventBus hook.
  - title: Rich deepClone
    details: Handles Dates, Maps, Sets, TypedArrays, Buffers, class instances, circular references, getters/setters, and symbols.
  - title: Typed Event Bus
    details: Cross-component event bus with typed topics and payloads. Auto-cleanup via the React hook. Custom error handler + once-subscription included.
  - title: Cache API with TTL
    details: Thin wrapper over the browser Cache API with BigInt-safe JSON serialization and optional TTL storage.
---
