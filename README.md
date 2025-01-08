# @pivanov/utils

<p align="center">
    <i>A comprehensive collection of TypeScript utilities for modern web development</i>
    <br>
    <br>
    <img src="https://img.shields.io/npm/v/@pivanov/utils?logo=npm" alt="NPM Version">
    &nbsp;&nbsp;
    <img src="https://img.shields.io/bundlephobia/minzip/@pivanov/utils" alt="Bundle Size">
    &nbsp;&nbsp;
    <img src="https://github.com/pivanov/pivanov-utils/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI Status" />
    &nbsp;&nbsp;
    <img src="https://codecov.io/github/pivanov/pivanov-utils/graph/badge.svg?token=EPRKTP7D79" alt="Coverage Status">
</p>

## Features

- 🔄 **Type-Safe** - Full TypeScript support with strict type checking
- 🔄 **Immutable Operations** - Safe object and array manipulations
- 🎨 **String Transformations** - Comprehensive string formatting utilities
- 🛠️ **DOM Utilities** - Browser-safe DOM manipulation helpers
- ⚡ **Performance Focused** - Optimized for both speed and bundle size
- 📦 **Tree-Shakeable** - Import only what you need
- 📝 **Well Documented** - Detailed documentation and examples
- ✅ **Well Tested** - Comprehensive test coverage

## Installation

```bash
pnpm install @pivanov/utils
# or
yarn add @pivanov/utils
# or
npm install @pivanov/utils
```

## Documentation

### Module Overview

The package is organized into several modules:

- **assertion** - Type guards and runtime type checking
- **object** - Object manipulation utilities
- **promise** - Async utilities and promise helpers
- **string** - String transformation utilities
- **tools** - Various utilities including DOM, Event Bus, and more

### Assertion Module

Type-safe runtime type checking utilities.

```typescript
import {
  isString,
  isNumber,
  isBoolean,
  isObject,
  isFunction,
  isNull,
  isUndefined
} from '@pivanov/utils/assertion';

// Type Guards with TypeScript type narrowing
isString('hello');     // type narrowed to string
isNumber(123);        // type narrowed to number
isBoolean(true);      // type narrowed to boolean
isObject({});         // type narrowed to object
isFunction(() => {}); // type narrowed to function
isNull(null);         // type narrowed to null
isUndefined(void 0);  // type narrowed to undefined

// Use in conditional checks
function processValue(value: unknown) {
  if (isString(value)) {
    return value.toUpperCase(); // TypeScript knows value is string
  }
  if (isNumber(value)) {
    return value.toFixed(2);    // TypeScript knows value is number
  }
}
```

### Object Module

Type-safe object manipulation utilities.

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
merge({ a: 1 }, { b: 2 });
// { a: 1, b: 2 }

// Deep merge with nested structures
deepMerge(
  { user: { name: 'John', settings: { theme: 'dark' } } },
  { user: { settings: { fontSize: 14 } } }
);
// { user: { name: 'John', settings: { theme: 'dark', fontSize: 14 } } }
```

### Promise Module

Async utilities for better promise handling.

```typescript
import { sleep } from '@pivanov/utils/promise';

// Pause execution for specified duration
async function example() {
  console.log('Start');
  await sleep(1000); // Wait for 1 second
  console.log('End');
}
```

### String Module

String manipulation utilities with TypeScript support.

```typescript
import {
  camelCase,
  pascalCase,
  kebabCase,
  slugify,
  capitalize,
  uncapitalize,
  capitalizeFirstLetter
} from '@pivanov/utils/string';

// Case transformations
camelCase('foo-bar');      // 'fooBar'
pascalCase('foo_bar');     // 'FooBar'
kebabCase('fooBar');       // 'foo-bar'
slugify('Hello World!');   // 'hello-world'

// Capitalization with TypeScript support
capitalize('hello');       // 'Hello' (with type Capitalize<'hello'>)
uncapitalize('Hello');     // 'hello' (with type Uncapitalize<'Hello'>)
capitalizeFirstLetter('hello world'); // 'Hello world'
```

### Tools Module

Various utilities for DOM manipulation, event handling, and more.

#### DOM Utilities

```typescript
import { checkVisibility, setStyleProperties } from '@pivanov/utils/tools';

// Check element visibility
const isVisible = checkVisibility(element);

// Set CSS custom properties
setStyleProperties(element, {
  '--background-color': '#fff',
  '--text-color': '#000'
});
```

#### Event Bus

Type-safe event bus with React hooks support.

```typescript
import { busDispatch, busSubscribe, useEventBus } from '@pivanov/utils/tools/eventBus';

// Define your events interface
interface Events {
  'user-logged-in': { id: number; name: string };
  'data-updated': { timestamp: number };
}

// React hook usage
function Component() {
  useEventBus('user-logged-in', (data) => {
    console.log('User logged in:', data.name);
  });
}

// Direct subscription
const unsubscribe = busSubscribe('data-updated', (data) => {
  console.log('Data updated at:', data.timestamp);
});

// Dispatch events
busDispatch('user-logged-in', { id: 1, name: 'John' });
```

#### Deep Clone & Equality

```typescript
import { deepClone, isEqual } from '@pivanov/utils/tools';

// Deep clone with circular reference handling
const original = {
  nested: { array: [1, 2, { value: 3 }] },
  date: new Date(),
  circular: {} as any
};
original.circular = original;
const cloned = deepClone(original);

// Deep equality comparison
isEqual({ a: [1, 2, 3] }, { a: [1, 2, 3] }); // true
isEqual(new Date('2024-01-01'), new Date('2024-01-01')); // true
isEqual([1, 2, [3, 4]], [1, 2, [3, 4]]); // true
```

#### Cache API

Browser-safe cache utilities with TypeScript support.

```typescript
import { CacheAPI } from '@pivanov/utils/tools/cache-api';

// Initialize cache
const cache = new CacheAPI('my-cache');

// Store data with expiration
await cache.set('user-data', { name: 'John' }, {
  expireIn: '1h' // Supports: 's' (seconds), 'm' (minutes), 'h' (hours), 'd' (days)
});

// Retrieve data
const userData = await cache.get('user-data');

// Check if data exists and is not expired
const exists = await cache.has('user-data');

// Remove data
await cache.delete('user-data');

// Clear all cache
await cache.clear();
```

#### React to Web Components (r2wc)

A utility to convert React components into standalone Web Components that can be used in any application.

##### Creating a Widget

Create a single file for your widget (e.g., `sparkline-widget.ts`):
```typescript
import { registerWidget } from '@pivanov/utils';

// Your React component
const SparklineChart = ({ values, color }) => (
  <div className="sparkline">
    {/* Your chart implementation */}
  </div>
);

// Register the widget with optional configuration
registerWidget({
  name: 'sparkline',
  component: SparklineChart,
  styles: [
    'https://cdn.example.com/styles/sparkline.css',  // Optional: CSS files to load
  ],
  svgSpritePath: 'https://cdn.example.com/icons/sprite.svg', // Optional: SVG sprite path
});
```

##### Using in React Applications

```typescript
import { importWidgets } from '@pivanov/utils';
import { createRoot } from 'react-dom/client';
import { App } from './app';

// Load widgets ... we need to do this once
void importWidgets([
  'https://cdn.example.com/widgets/sparkline.js'
]);

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(<App />);
}

...

// Then use the widgets as React components
<WidgetComponent
  name="sparkline"
  widgetProps={{ color: 'green', values: [1, 2, 3, 4, 5] }}
/>
```

##### Using in Plain HTML

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import { importWidgets, renderWidget } from 'https://esm.sh/@pivanov/utils';

    void importWidgets([
      'https://cdn.example.com/widgets/sparkline.js'
    ]);

    renderWidget({
      name: 'sparkline',
      mountTo: document.getElementById('sparkline'),
      widgetProps: {
        color: 'green',
        values: [1, 2, 3, 4, 5]
      }
    });
  </script>
</head>
<body>
  <div id="sparkline"></div>
</body>
</html>
```

Key Features:
- Single-file widget definition
- Automatic CSS and SVG sprite loading
- ESM support for browser and bundler usage
- TypeScript support with proper type inference
- Works in both React and plain HTML environments

### Tree Shaking

Import specific utilities to minimize bundle size:

```typescript
// Import only what you need
import { camelCase } from '@pivanov/utils/string';
import { deepClone } from '@pivanov/utils/tools';
import { isString } from '@pivanov/utils/assertion';
```

### TypeScript Integration

All utilities are written in TypeScript and provide excellent type inference:

```typescript
import { pick } from '@pivanov/utils/object';

// TypeScript will infer correct types
const user = { name: 'John', age: 30 } as const;
const picked = pick(user, ['name']); // Type: { name: "John" }
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © Pavel Ivanov
