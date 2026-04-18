# DOM

Browser-only helpers. Import from `@pivanov/utils/tools` or `@pivanov/utils`.

All functions assume a real DOM is available. Wrap calls in `isBrowser()` for SSR safety.

## `isBrowser()`

Returns true when both `window` and `document` are defined.

```ts
import { isBrowser } from '@pivanov/utils/tools';

if (isBrowser()) {
  window.addEventListener('scroll', handleScroll);
}
```

## `setStyleProperties(el, cssVars)`

Batch-sets CSS custom properties on an element. Safely no-ops when `el` is `null`.

```ts
import { setStyleProperties } from '@pivanov/utils/tools';

const card = document.querySelector<HTMLElement>('.card');
setStyleProperties(card, {
  '--primary': '#3b82f6',
  '--gap': '1rem',
  '--radius': '8px',
});
```

## `checkVisibility(element, options?)`

Checks whether an element is actually visible to the user.

By default verifies: attached to the DOM, `display` is not `none`, `visibility` is `visible`, `opacity > 0`, and the bounding rect intersects the viewport on both axes.

Each check can be toggled via options.

```ts
import { checkVisibility } from '@pivanov/utils/tools';

if (checkVisibility(el)) {
  track('card-seen');
}

// Skip CSS checks, viewport only
checkVisibility(el, {
  checkDisplay: false,
  checkVisibility: false,
  checkOpacity: false,
});
```

### Options

| Option | Default | Effect |
|---|---|---|
| `checkViewport` | `true` | Require intersection with the viewport |
| `checkDisplay` | `true` | Reject `display: none` |
| `checkVisibility` | `true` | Reject `visibility: hidden` |
| `checkOpacity` | `true` | Reject `opacity: 0` |

## `isInViewport(element, options?)`

Pure-geometry viewport intersection check - no CSS consultation.

```ts
import { isInViewport } from '@pivanov/utils/tools';

isInViewport(el);                          // both axes
isInViewport(el, { horizontal: false });   // vertical only
```

Zero-sized rects (no layout yet) return `true` to avoid false negatives.

## `calculateRenderedTextWidth(text, fontSize, isUppercase?, fontFamily?)`

Measures the rendered width of text in pixels using a cached off-screen `<canvas>`. Returns `0` when a 2D context is unavailable (non-browser or very old runtime).

```ts
import { calculateRenderedTextWidth } from '@pivanov/utils/tools';

const width = calculateRenderedTextWidth('Hello World', 16);
const upperWidth = calculateRenderedTextWidth('Hello World', 16, true);
const customFont = calculateRenderedTextWidth(
  'Hello World',
  16,
  false,
  'Arial',
);
```

::: warning
Only measures width contributions from the font and font-size. Does **not** account for `letter-spacing`, `font-weight`, `font-style`, or `font-variant`. For precise layout, measure in the actual DOM.
:::
