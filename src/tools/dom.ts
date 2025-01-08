/**
 * Checks if the code is running in a browser environment
 * @returns {boolean} True if running in a browser, false otherwise
 * @example
 * if (isBrowser()) {
 *   // Execute browser-specific code
 *   window.addEventListener('resize', handleResize);
 * }
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

/**
 * Sets CSS custom properties (variables) on an HTML element
 * @param {HTMLElement | null} el - The target HTML element
 * @param {Record<string, string>} cssVars - Object containing CSS variable names and values
 * @example
 * const element = document.querySelector('.my-element');
 * setStyleProperties(element, {
 *   '--background-color': '#fff',
 *   '--text-color': '#000',
 *   '--padding': '1rem'
 * });
 */
export const setStyleProperties = (
  el: HTMLElement | null,
  cssVars: Record<string, string>,
) => {
  if (!el) {
    return;
  }

  for (const [key, value] of Object.entries(cssVars)) {
    el.style.setProperty(key, value);
  }
};

/**
 * Checks if an element is currently visible in the viewport
 * @param {HTMLElement} element - The element to check
 * @returns {boolean} True if the element is visible in viewport, false otherwise
 * @example
 * const element = document.querySelector('.my-element');
 * if (checkVisibility(element)) {
 *   // Element is visible in viewport
 *   element.classList.add('animate');
 * }
 */
export const checkVisibility = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const viewHeight = Math.max(
    document.documentElement.clientHeight,
    window.innerHeight,
  );
  return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
};

/**
 * Calculates the rendered width of text with specified styling
 * @param {string} text - The text to measure
 * @param {number} fontSize - Font size in pixels
 * @param {boolean} [isUppercase=false] - Whether to convert text to uppercase before measuring
 * @param {string} [fontFamily] - Font family string, defaults to system fonts
 * @returns {number} The width of the text in pixels
 * @example
 * // Basic usage
 * const width = calculateRenderedTextWidth('Hello World', 16);
 *
 * // With uppercase conversion
 * const upperWidth = calculateRenderedTextWidth('Hello World', 16, true);
 *
 * // With custom font
 * const customWidth = calculateRenderedTextWidth('Hello World', 16, false, 'Arial');
 *
 * // Use the width for calculations
 * const containerWidth = width + 32; // text width + padding
 */
export const calculateRenderedTextWidth = (
  text: string,
  fontSize: number,
  isUppercase = false,
  fontFamily = `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`,
) => {
  const finalText = isUppercase ? text.toUpperCase() : text;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  (context as CanvasRenderingContext2D).font = `${fontSize}px ${fontFamily}`;
  return (context as CanvasRenderingContext2D).measureText(finalText).width;
};
