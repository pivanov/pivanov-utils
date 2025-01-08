import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  calculateRenderedTextWidth,
  checkVisibility,
  isBrowser,
  setStyleProperties,
} from '../dom';

describe('DOM utilities', () => {
  // Setup for browser environment mocking
  const originalWindow = global.window;
  const originalDocument = global.document;

  beforeEach(() => {
    // Mock window and document
    global.window = {
      innerHeight: 800,
      innerWidth: 800,
    } as Window & typeof globalThis;

    global.document = {
      documentElement: {
        clientHeight: 800,
        clientWidth: 800,
      },
      createElement: vi.fn(),
    } as unknown as Document;
  });

  afterEach(() => {
    global.window = originalWindow;
    global.document = originalDocument;
    vi.clearAllMocks();
  });

  describe('isBrowser', () => {
    it('returns true when window is defined', () => {
      expect(isBrowser()).toBe(true);
    });

    it('returns false when window is undefined', () => {
      global.window = undefined as unknown as Window & typeof globalThis;
      expect(isBrowser()).toBe(false);
    });
  });

  describe('setStyleProperties', () => {
    it('sets style properties on element', () => {
      const mockElement = {
        style: {
          setProperty: vi.fn(),
        },
      } as unknown as HTMLElement;

      const cssVars: Record<string, string> = {
        '--color': 'red',
        '--size': '12px',
      };

      setStyleProperties(mockElement, cssVars);

      expect(mockElement.style.setProperty).toHaveBeenCalledTimes(2);
      expect(mockElement.style.setProperty).toHaveBeenCalledWith(
        '--color',
        'red',
      );
      expect(mockElement.style.setProperty).toHaveBeenCalledWith(
        '--size',
        '12px',
      );
    });

    it('handles null element gracefully', () => {
      expect(() => {
        setStyleProperties(null, { '--color': 'red' });
      }).not.toThrow();
    });
  });

  describe('checkVisibility', () => {
    it('returns true when element is in viewport', () => {
      const mockElement = {
        getBoundingClientRect: () => ({
          top: 100,
          bottom: 200,
        }),
      } as HTMLElement;

      expect(checkVisibility(mockElement)).toBe(true);
    });

    it('returns false when element is above viewport', () => {
      const mockElement = {
        getBoundingClientRect: () => ({
          top: -200,
          bottom: -100,
        }),
      } as HTMLElement;

      expect(checkVisibility(mockElement)).toBe(false);
    });

    it('returns false when element is below viewport', () => {
      const mockElement = {
        getBoundingClientRect: () => ({
          top: 1000,
          bottom: 1100,
        }),
      } as HTMLElement;

      expect(checkVisibility(mockElement)).toBe(false);
    });
  });

  describe('calculateRenderedTextWidth', () => {
    it('calculates text width correctly', () => {
      const mockContext = {
        font: '',
        measureText: vi.fn().mockReturnValue({ width: 100 }),
      } as unknown as CanvasRenderingContext2D;

      const mockCanvas = {
        getContext: vi.fn().mockReturnValue(mockContext),
      } as unknown as HTMLCanvasElement;

      (document.createElement as ReturnType<typeof vi.fn>).mockReturnValue(
        mockCanvas,
      );

      const width = calculateRenderedTextWidth('test', 16);

      expect(width).toBe(100);
      expect(mockContext.font).toBe(
        '16px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
      );
    });

    it('handles uppercase conversion', () => {
      const mockContext = {
        font: '',
        measureText: vi.fn().mockReturnValue({ width: 120 }),
      } as unknown as CanvasRenderingContext2D;

      const mockCanvas = {
        getContext: vi.fn().mockReturnValue(mockContext),
      } as unknown as HTMLCanvasElement;

      (document.createElement as ReturnType<typeof vi.fn>).mockReturnValue(
        mockCanvas,
      );

      const width = calculateRenderedTextWidth('test', 16, true);

      expect(mockContext.measureText).toHaveBeenCalledWith('TEST');
      expect(width).toBe(120);
    });

    it('handles custom font family', () => {
      const mockContext = {
        font: '',
        measureText: vi.fn().mockReturnValue({ width: 100 }),
      } as unknown as CanvasRenderingContext2D;

      const mockCanvas = {
        getContext: vi.fn().mockReturnValue(mockContext),
      } as unknown as HTMLCanvasElement;

      (document.createElement as ReturnType<typeof vi.fn>).mockReturnValue(
        mockCanvas,
      );

      const width = calculateRenderedTextWidth('test', 16, false, 'Arial');

      expect(width).toBe(100);
      expect(mockContext.font).toBe('16px Arial');
    });
  });
});
