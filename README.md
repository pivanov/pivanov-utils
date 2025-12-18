# @pivanov/utils

<p align="center">
  <i>A comprehensive collection of TypeScript utilities for modern web development</i>
  <br />
  <br />
  <img src="https://img.shields.io/npm/v/@pivanov/utils?logo=npm" alt="NPM Version" />
  &nbsp;&nbsp;
  <img src="https://img.shields.io/bundlephobia/minzip/@pivanov/utils" alt="Bundle Size" />
  &nbsp;&nbsp;
  <img src="https://github.com/pivanov/pivanov-utils/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI Status" />
  &nbsp;&nbsp;
  <img src="https://codecov.io/github/pivanov/pivanov-utils/graph/badge.svg?token=EPRKTP7D79" alt="Coverage Status" />
</p>

## Features

- 🔒 **Type-Safe** - Full TypeScript support with strict type checking and excellent type inference
- 🎯 **Tree-Shakeable** - Import only what you need for minimal bundle size
- ⚡ **Performance Focused** - Optimized implementations with no external dependencies
- 🧪 **Well Tested** - Comprehensive test coverage for reliability
- 📦 **Modular** - Organized into focused modules for easy navigation
- 📝 **Well Documented** - Detailed JSDoc comments and examples

## Installation

```bash
pnpm add @pivanov/utils
# or
npm install @pivanov/utils
# or
yarn add @pivanov/utils
```

## Quick Start

```typescript
import { camelCase } from '@pivanov/utils/string';
import { pick } from '@pivanov/utils/object';
import { isString } from '@pivanov/utils/assertion';

camelCase('foo-bar'); // 'fooBar'
pick({ name: 'John', age: 30 }, ['name']); // { name: 'John' }
isString('hello'); // true
```

## API Reference

### Type Guards & Assertions

Runtime type checking with TypeScript type narrowing.

```typescript
import {
  isString,
  isNumber,
  isBoolean,
  isObject,
  isFunction,
  isNull,
  isUndefined,
} from '@pivanov/utils/assertion';

// Type guards automatically narrow TypeScript types
function processValue(value: unknown) {
  if (isString(value)) {
    return value.toUpperCase(); // TypeScript knows this is a string
  }
  if (isNumber(value)) {
    return value.toFixed(2); // TypeScript knows this is a number
  }
}

// Examples
isString('hello'); // true
isNumber(42); // true
isBoolean(true); // true
isObject({}); // true (plain objects only, not arrays)
isFunction(() => {}); // true
isNull(null); // true
isUndefined(undefined); // true
```

### Object Utilities

Immutable object manipulation with full type safety.

```typescript
import { pick, omit, merge, deepMerge } from '@pivanov/utils/object';

// Pick specific properties
const user = { name: 'John', age: 30, email: 'john@example.com' };
pick(user, ['name', 'email']);
// { name: 'John', email: 'john@example.com' }

// Omit specific properties
omit(user, ['email']);
// { name: 'John', age: 30 }

// Shallow merge
merge({ a: 1, b: 2 }, { b: 3, c: 4 });
// { a: 1, b: 3, c: 4 }

// Deep merge with nested structures
deepMerge(
  { user: { name: 'John', settings: { theme: 'dark' } } },
  { user: { settings: { fontSize: 14 } } }
);
// { user: { name: 'John', settings: { theme: 'dark', fontSize: 14 } } }
```

### String Utilities

String transformation utilities with TypeScript template literal types support.

```typescript
import {
  camelCase,
  pascalCase,
  kebabCase,
  slugify,
  capitalize,
  uncapitalize,
  capitalizeFirstLetter,
} from '@pivanov/utils/string';

// Case transformations
camelCase('foo-bar'); // 'fooBar'
camelCase('FOO_BAR'); // 'fooBar'

pascalCase('foo-bar'); // 'FooBar'
pascalCase('foo_bar_baz'); // 'FooBarBaz'

kebabCase('fooBar'); // 'foo-bar'
kebabCase('XMLHttpRequest'); // 'xml-http-request'

slugify('Hello World!'); // 'hello-world'
slugify('Über Café'); // 'uber-cafe'

// Capitalization with TypeScript support
capitalize('hello'); // 'Hello' (type: Capitalize<'hello'>)
uncapitalize('Hello'); // 'hello' (type: Uncapitalize<'Hello'>)
capitalizeFirstLetter('hello world'); // 'Hello world'
```

**When to use each:**

- `camelCase`: JavaScript/TypeScript variables and properties
- `pascalCase`: Class names, React components, TypeScript types
- `kebabCase`: CSS classes, HTML attributes, file names
- `slugify`: URL slugs (more aggressive than kebabCase)

### Promise Utilities

Simple async utilities for better promise handling.

```typescript
import { sleep } from '@pivanov/utils/promise';

async function example() {
  console.log('Start');
  await sleep(1000); // Wait 1 second
  console.log('Done');
}
```

### Deep Clone & Equality

High-performance deep cloning and comparison with circular reference handling.

```typescript
import { deepClone, isEqual } from '@pivanov/utils/tools';

// Deep clone complex structures
const original = {
  nested: { array: [1, 2, { value: 3 }] },
  date: new Date(),
  map: new Map([['key', 'value']]),
  set: new Set([1, 2, 3]),
  circular: {} as any,
};
original.circular = original; // Circular reference

const cloned = deepClone(original);
// Fully independent copy with circular references preserved

// Deep equality comparison
isEqual({ a: [1, 2, 3] }, { a: [1, 2, 3] }); // true
isEqual(new Date('2024-01-01'), new Date('2024-01-01')); // true
isEqual([1, 2, [3, 4]], [1, 2, [3, 4]]); // true
isEqual(new Set([1, 2]), new Set([2, 1])); // false (Sets maintain order)
```

**Supported types:**

- Primitives (string, number, boolean, null, undefined, symbol, bigint)
- Arrays (including sparse arrays)
- Plain objects (with getters/setters)
- Date, RegExp, Map, Set
- TypedArrays, ArrayBuffer, Buffer
- Circular references

### Event Bus

Type-safe, lightweight event bus with React hooks support.

```typescript
import { busDispatch, busSubscribe, useEventBus } from '@pivanov/utils/tools';

// Define your application events (optional but recommended)
type AppEvents = {
  'user-logged-in': { id: number; name: string };
  'data-updated': { timestamp: number };
  'notification': { message: string; type: 'info' | 'error' };
};

// React hook usage (auto-unsubscribes on unmount)
function UserProfile() {
  useEventBus<AppEvents>('user-logged-in', (data) => {
    console.log(`Welcome ${data.name}!`);
  });

  return <div>Profile</div>;
}

// Vanilla JavaScript usage
const unsubscribe = busSubscribe<AppEvents>('data-updated', (data) => {
  console.log('Updated at:', data.timestamp);
});

// Later: cleanup
unsubscribe();

// Dispatch events anywhere in your app
busDispatch<AppEvents>('user-logged-in', { id: 1, name: 'John' });
busDispatch<AppEvents>('notification', {
  message: 'Settings saved',
  type: 'info',
});
```

**Features:**

- Fully type-safe with TypeScript
- Works across React and vanilla JavaScript
- Automatic cleanup with React hook
- Uses hashed topic names to avoid collisions
- Zero dependencies

### Browser Cache API

Type-safe wrapper around the browser Cache API with expiration support.

```typescript
import {
  storageSetItem,
  storageGetItem,
  storageRemoveItem,
  storageExists,
  storageClear,
  storageClearByPrefixOrSuffix,
  storageGetAllKeys,
  storageCalculateSize,
} from '@pivanov/utils/tools';

const CACHE_NAME = 'my-app-cache';

// Store data
await storageSetItem(CACHE_NAME, 'user-data', {
  id: 1,
  name: 'John',
  bigNumber: BigInt(9007199254740991), // BigInt support!
});

// Retrieve data
const userData = await storageGetItem<{ id: number; name: string }>(
  CACHE_NAME,
  'user-data'
);

// Check existence
const exists = await storageExists(CACHE_NAME, 'user-data');

// Remove specific item
await storageRemoveItem(CACHE_NAME, 'user-data');

// Get all keys
const keys = await storageGetAllKeys(CACHE_NAME);

// Clear items by prefix
await storageClearByPrefixOrSuffix(CACHE_NAME, 'temp-', true);

// Clear items by suffix
await storageClearByPrefixOrSuffix(CACHE_NAME, '-cache', false);

// Calculate cache size (in bytes)
const totalSize = await storageCalculateSize(CACHE_NAME);
const itemSize = await storageCalculateSize(CACHE_NAME, 'user-data');

// Clear all cache
await storageClear(CACHE_NAME);
```

**Features:**

- Automatic JSON serialization/deserialization
- BigInt support (automatically converted to strings)
- Type-safe with generics
- Works with absolute URLs as keys
- Size calculation utilities

### DOM Utilities

Browser-safe DOM manipulation helpers.

```typescript
import {
  isBrowser,
  checkVisibility,
  setStyleProperties,
  calculateRenderedTextWidth,
} from '@pivanov/utils/tools';

// Check if running in browser (SSR-safe)
if (isBrowser()) {
  // Browser-only code
  window.addEventListener('scroll', handleScroll);
}

// Check element visibility in viewport
const element = document.querySelector('.my-element') as HTMLElement;
if (checkVisibility(element)) {
  element.classList.add('visible');
}

// Set CSS custom properties
setStyleProperties(element, {
  '--primary-color': '#3b82f6',
  '--spacing': '1rem',
  '--border-radius': '8px',
});

// Calculate text width for dynamic layouts
const width = calculateRenderedTextWidth('Hello World', 16);
const widthUppercase = calculateRenderedTextWidth('Hello World', 16, true);
const widthCustomFont = calculateRenderedTextWidth(
  'Hello World',
  16,
  false,
  'Arial'
);
```

## Tree Shaking

Import only what you need to minimize bundle size:

```typescript
// ✅ Good: Import specific utilities
import { camelCase } from '@pivanov/utils/string';
import { deepClone } from '@pivanov/utils/tools';

// ❌ Avoid: Importing everything
import * as utils from '@pivanov/utils';
```

## TypeScript Support

All utilities provide excellent type inference:

```typescript
import { pick } from '@pivanov/utils/object';
import { capitalize } from '@pivanov/utils/string';

// TypeScript infers exact types
const user = { name: 'John', age: 30, email: 'john@example.com' } as const;
const picked = pick(user, ['name', 'email']);
// Type: { name: "John"; email: "john@example.com" }

const str = 'hello' as const;
const capitalized = capitalize(str);
// Type: "Hello"
```

## Module Overview

```text
@pivanov/utils
├── /assertion    - Type guards (isString, isNumber, etc.)
├── /object       - Object utilities (pick, omit, merge, deepMerge)
├── /promise      - Async utilities (sleep)
├── /string       - String utilities (camelCase, kebabCase, etc.)
└── /tools        - Various tools
    ├── deepClone
    ├── isEqual
    ├── DOM utilities (isBrowser, checkVisibility, etc.)
    ├── eventBus (busDispatch, busSubscribe, useEventBus)
    └── Cache API (storageSetItem, storageGetItem, etc.)
```

## Browser Compatibility

- Modern browsers with ES2015+ support
- Cache API requires browser support (Chrome 40+, Firefox 41+, Safari 11.1+)
- SSR-safe with browser environment detection

## License

MIT © [Pavel Ivanov](https://github.com/pivanov)
