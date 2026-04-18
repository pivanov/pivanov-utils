/**
 * Returns true when running in a browser-like environment.
 *
 * Checks for both `window` and `document` so service-worker and
 * partially-mocked contexts are correctly reported as non-browser.
 *
 * @example
 * ```ts
 * if (isBrowser()) window.addEventListener('resize', onResize);
 * ```
 */
export const isBrowser = (): boolean => {
  return typeof window !== "undefined" && typeof document !== "undefined";
};

/**
 * Sets CSS custom properties on an element. Safely no-ops when element is null.
 *
 * @example
 * ```ts
 * setStyleProperties(el, { '--primary': '#3b82f6', '--gap': '1rem' });
 * ```
 */
export const setStyleProperties = (el: HTMLElement | null, cssVars: Record<string, string>): void => {
  if (!el) {
    return;
  }
  for (const [key, value] of Object.entries(cssVars)) {
    el.style.setProperty(key, value);
  }
};

interface CheckVisibilityOptions {
  /** Require the element to intersect the viewport. Default: true. */
  checkViewport?: boolean;
  /** Require computed `display` to be non-"none". Default: true. */
  checkDisplay?: boolean;
  /** Require computed `visibility` to be "visible". Default: true. */
  checkVisibility?: boolean;
  /** Require computed `opacity` to be > 0. Default: true. */
  checkOpacity?: boolean;
}

/**
 * Checks whether an element is visible to the user.
 *
 * By default verifies: attached to DOM, `display` not `none`,
 * `visibility` is `visible`, `opacity > 0`, and intersects the viewport
 * on both axes. Each check can be toggled via options.
 *
 * @example
 * ```ts
 * if (checkVisibility(el)) el.classList.add('seen');
 * checkVisibility(el, { checkViewport: false }); // visible per CSS only
 * ```
 */
export const checkVisibility = (element: HTMLElement, options: CheckVisibilityOptions = {}): boolean => {
  const { checkViewport = true, checkDisplay = true, checkVisibility: checkCssVisibility = true, checkOpacity = true } = options;

  if (!element.isConnected) {
    return false;
  }

  if (checkDisplay || checkCssVisibility || checkOpacity) {
    const style = window.getComputedStyle(element);
    if (checkDisplay && style.display === "none") {
      return false;
    }
    if (checkCssVisibility && style.visibility !== "" && style.visibility !== "visible") {
      return false;
    }
    if (checkOpacity && style.opacity !== "") {
      const parsed = Number.parseFloat(style.opacity);
      if (!Number.isNaN(parsed) && parsed === 0) {
        return false;
      }
    }
  }

  if (checkViewport) {
    const rect = element.getBoundingClientRect();
    // If layout hasn't produced a rect (e.g. tests without a layout engine),
    // skip viewport clipping rather than report false negatives.
    if (rect.width !== 0 || rect.height !== 0) {
      const viewHeight = window.innerHeight || document.documentElement.clientHeight;
      const viewWidth = window.innerWidth || document.documentElement.clientWidth;
      const outsideVertical = rect.bottom <= 0 || rect.top >= viewHeight;
      const outsideHorizontal = rect.right <= 0 || rect.left >= viewWidth;
      if (outsideVertical || outsideHorizontal) {
        return false;
      }
    }
  }

  return true;
};

const DEFAULT_FONT_FAMILY = `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`;

let cachedCanvas: HTMLCanvasElement | undefined;
let cachedContext: CanvasRenderingContext2D | null | undefined;

const getTextMeasurementContext = (): CanvasRenderingContext2D | null => {
  if (cachedContext !== undefined) {
    return cachedContext;
  }
  if (typeof document === "undefined") {
    cachedContext = null;
    return null;
  }
  cachedCanvas = document.createElement("canvas");
  cachedContext = cachedCanvas.getContext("2d");
  return cachedContext;
};

/**
 * @internal Resets the cached canvas - for tests only.
 */
export const __resetTextMeasurementCache = (): void => {
  cachedCanvas = undefined;
  cachedContext = undefined;
};

interface IViewportOptions {
  /** Require vertical intersection. Default: true. */
  vertical?: boolean;
  /** Require horizontal intersection. Default: true. */
  horizontal?: boolean;
}

/**
 * Returns true when the element's bounding rect intersects the viewport.
 * Pure geometry - ignores CSS visibility. Use `checkVisibility` for a full
 * visibility check.
 *
 * Zero-sized rects (no layout yet) return true - we can't clip against
 * nothing, and failing them would produce false negatives in test environments.
 *
 * @example
 * ```ts
 * if (isInViewport(el)) track();
 * isInViewport(el, { horizontal: false }); // vertical only
 * ```
 */
export const isInViewport = (element: HTMLElement, options: IViewportOptions = {}): boolean => {
  const { vertical = true, horizontal = true } = options;
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    return true;
  }
  const viewHeight = window.innerHeight || document.documentElement.clientHeight;
  const viewWidth = window.innerWidth || document.documentElement.clientWidth;

  if (vertical && (rect.bottom <= 0 || rect.top >= viewHeight)) {
    return false;
  }
  if (horizontal && (rect.right <= 0 || rect.left >= viewWidth)) {
    return false;
  }
  return true;
};

/**
 * Measures the rendered width of text in pixels using a cached off-screen
 * canvas. Returns `0` when 2D context is unavailable.
 *
 * @example
 * ```ts
 * calculateRenderedTextWidth('Hello World', 16);
 * calculateRenderedTextWidth('Hi', 14, true, 'Arial');
 * ```
 */
export const calculateRenderedTextWidth = (text: string, fontSize: number, isUppercase = false, fontFamily = DEFAULT_FONT_FAMILY): number => {
  const context = getTextMeasurementContext();
  if (!context) {
    return 0;
  }
  const finalText = isUppercase ? text.toUpperCase() : text;
  context.font = `${fontSize}px ${fontFamily}`;
  return context.measureText(finalText).width;
};
