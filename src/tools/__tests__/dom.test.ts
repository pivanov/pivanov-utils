import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

import { __resetTextMeasurementCache, calculateRenderedTextWidth, checkVisibility, isBrowser, isInViewport, setStyleProperties } from "../dom";

describe("DOM utilities", () => {
  describe("isBrowser", () => {
    it("returns true when window + document exist", () => {
      expect(isBrowser()).toBe(true);
    });
  });

  describe("setStyleProperties", () => {
    it("sets each CSS variable", () => {
      const el = document.createElement("div");
      setStyleProperties(el, { "--color": "red", "--size": "12px" });
      expect(el.style.getPropertyValue("--color")).toBe("red");
      expect(el.style.getPropertyValue("--size")).toBe("12px");
    });

    it("handles null element gracefully", () => {
      expect(() => setStyleProperties(null, { "--color": "red" })).not.toThrow();
    });
  });

  describe("checkVisibility", () => {
    let el: HTMLElement;
    const stubRect = (rect: Partial<DOMRect>) => {
      el.getBoundingClientRect = () =>
        ({
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          top: 10,
          left: 10,
          right: 110,
          bottom: 110,
          toJSON: () => ({}),
          ...rect,
        }) as DOMRect;
    };

    beforeEach(() => {
      el = document.createElement("div");
      document.body.appendChild(el);
    });

    afterEach(() => {
      el.remove();
    });

    it("returns true for an attached, visible, in-viewport element", () => {
      stubRect({});
      expect(checkVisibility(el)).toBe(true);
    });

    it("returns false when detached", () => {
      el.remove();
      expect(checkVisibility(el)).toBe(false);
    });

    it("returns false for display:none", () => {
      el.style.display = "none";
      expect(checkVisibility(el)).toBe(false);
    });

    it("returns false for visibility:hidden", () => {
      el.style.visibility = "hidden";
      expect(checkVisibility(el)).toBe(false);
    });

    it("returns false for opacity:0", () => {
      el.style.opacity = "0";
      expect(checkVisibility(el)).toBe(false);
    });

    it("returns true for non-zero explicit opacity", () => {
      el.style.opacity = "0.5";
      stubRect({});
      expect(checkVisibility(el)).toBe(true);
    });

    it("returns false when rect is above viewport", () => {
      stubRect({ top: -500, bottom: -400 });
      expect(checkVisibility(el)).toBe(false);
    });

    it("returns false when rect is below viewport", () => {
      const h = window.innerHeight;
      stubRect({ top: h + 100, bottom: h + 200 });
      expect(checkVisibility(el)).toBe(false);
    });

    it("returns false when rect is left of viewport", () => {
      stubRect({ left: -500, right: -400 });
      expect(checkVisibility(el)).toBe(false);
    });

    it("respects checkViewport:false", () => {
      stubRect({ top: -500, bottom: -400 });
      expect(checkVisibility(el, { checkViewport: false })).toBe(true);
    });

    it("respects checkOpacity:false", () => {
      el.style.opacity = "0";
      stubRect({});
      expect(checkVisibility(el, { checkOpacity: false })).toBe(true);
    });

    it("skips viewport check when layout reports zero rect", () => {
      expect(checkVisibility(el)).toBe(true);
    });
  });

  describe("isInViewport", () => {
    let el: HTMLElement;
    const stubRect = (rect: Partial<DOMRect>) => {
      el.getBoundingClientRect = () =>
        ({
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          top: 10,
          left: 10,
          right: 110,
          bottom: 110,
          toJSON: () => ({}),
          ...rect,
        }) as DOMRect;
    };

    beforeEach(() => {
      el = document.createElement("div");
      document.body.appendChild(el);
    });

    afterEach(() => {
      el.remove();
    });

    it("true for visible rect", () => {
      stubRect({});
      expect(isInViewport(el)).toBe(true);
    });

    it("false when above viewport", () => {
      stubRect({ top: -500, bottom: -400 });
      expect(isInViewport(el)).toBe(false);
    });

    it("false when left of viewport", () => {
      stubRect({ left: -500, right: -400 });
      expect(isInViewport(el)).toBe(false);
    });

    it("vertical-only skips horizontal check", () => {
      stubRect({ left: -500, right: -400 });
      expect(isInViewport(el, { horizontal: false })).toBe(true);
    });

    it("zero-sized rect short-circuits to true", () => {
      expect(isInViewport(el)).toBe(true);
    });
  });

  describe("calculateRenderedTextWidth", () => {
    const originalCreateElement = document.createElement.bind(document);
    let calls = 0;
    let stubContext: { font: string; measureText: (t: string) => { width: number } };

    beforeEach(() => {
      __resetTextMeasurementCache();
      calls = 0;
      stubContext = {
        font: "",
        measureText: (t: string) => ({ width: t.length * 10 }),
      };
      document.createElement = mock(((tag: string) => {
        if (tag === "canvas") {
          calls++;
          return {
            getContext: () => stubContext,
          } as unknown as HTMLCanvasElement;
        }
        return originalCreateElement(tag);
      }) as typeof document.createElement);
    });

    afterEach(() => {
      document.createElement = originalCreateElement;
      __resetTextMeasurementCache();
    });

    it("measures text width with default font", () => {
      expect(calculateRenderedTextWidth("test", 16)).toBe(40);
      expect(stubContext.font).toContain("16px");
    });

    it("uppercases when requested", () => {
      expect(calculateRenderedTextWidth("abc", 14, true)).toBe(30);
    });

    it("accepts a custom font family", () => {
      calculateRenderedTextWidth("hi", 12, false, "Arial");
      expect(stubContext.font).toBe("12px Arial");
    });

    it("caches the canvas across calls", () => {
      calculateRenderedTextWidth("a", 10);
      calculateRenderedTextWidth("b", 10);
      calculateRenderedTextWidth("c", 10);
      expect(calls).toBe(1);
    });

    it("returns 0 when getContext returns null", () => {
      __resetTextMeasurementCache();
      document.createElement = mock((() => ({ getContext: () => null }) as unknown as HTMLCanvasElement) as typeof document.createElement);
      expect(calculateRenderedTextWidth("x", 16)).toBe(0);
    });

    it("returns 0 when document is unavailable (SSR)", () => {
      __resetTextMeasurementCache();
      const originalDocument = globalThis.document;
      try {
        (globalThis as { document?: Document }).document = undefined;
        expect(calculateRenderedTextWidth("x", 16)).toBe(0);
      } finally {
        (globalThis as { document?: Document }).document = originalDocument;
        __resetTextMeasurementCache();
      }
    });
  });
});
