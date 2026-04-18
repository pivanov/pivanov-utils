import { describe, expect, it } from "bun:test";

import {
  camelCase,
  capitalize,
  capitalizeFirstLetter,
  escapeHtml,
  escapeRegExp,
  kebabCase,
  lines,
  pascalCase,
  slugify,
  snakeCase,
  titleCase,
  truncate,
  uncapitalize,
  words,
} from "./index";

describe("string utils", () => {
  describe("camelCase", () => {
    it("converts various formats", () => {
      expect(camelCase("foo-bar")).toBe("fooBar");
      expect(camelCase("foo_bar")).toBe("fooBar");
      expect(camelCase("Foo Bar")).toBe("fooBar");
      expect(camelCase("FOO_BAR")).toBe("fooBar");
      expect(camelCase("")).toBe("");
    });
  });

  describe("pascalCase", () => {
    it("converts various formats", () => {
      expect(pascalCase("foo-bar")).toBe("FooBar");
      expect(pascalCase("foo123bar")).toBe("Foo123Bar");
      expect(pascalCase("FOO_BAR_BAZ")).toBe("FooBarBaz");
    });
  });

  describe("kebabCase", () => {
    it("handles typical input", () => {
      expect(kebabCase("fooBar")).toBe("foo-bar");
      expect(kebabCase("XMLHttpRequest")).toBe("xml-http-request");
      expect(kebabCase("é è à ù")).toBe("e-e-a-u");
      expect(kebabCase("foo@#$%bar&*^baz")).toBe("foo-bar-baz");
    });
    it("passes null/undefined through (legacy behavior)", () => {
      expect(kebabCase(null as unknown as string)).toBe(null as unknown as string);
      expect(kebabCase(undefined as unknown as string)).toBe(undefined as unknown as string);
    });
  });

  describe("snakeCase", () => {
    it("converts various formats", () => {
      expect(snakeCase("fooBar")).toBe("foo_bar");
      expect(snakeCase("XMLHttpRequest")).toBe("xml_http_request");
      expect(snakeCase("Foo Bar Baz")).toBe("foo_bar_baz");
      expect(snakeCase("é è à ù")).toBe("e_e_a_u");
    });
    it("passes null/undefined through", () => {
      expect(snakeCase(null as unknown as string)).toBe(null as unknown as string);
    });
  });

  describe("titleCase", () => {
    it("capitalizes each word", () => {
      expect(titleCase("hello world")).toBe("Hello World");
      expect(titleCase("foo-bar_baz")).toBe("Foo Bar Baz");
      expect(titleCase("HELLO WORLD")).toBe("Hello World");
      expect(titleCase("")).toBe("");
    });
  });

  describe("slugify", () => {
    it("creates URL slugs", () => {
      expect(slugify("Hello World!")).toBe("hello-world");
      expect(slugify("Über Café")).toBe("uber-cafe");
      expect(slugify("-leading-and-trailing-")).toBe("leading-and-trailing");
      expect(slugify("한글")).toBe("");
    });
  });

  describe("capitalizeFirstLetter / capitalize / uncapitalize", () => {
    it("all work on empty and non-empty", () => {
      expect(capitalizeFirstLetter("hello")).toBe("Hello");
      expect(capitalizeFirstLetter("")).toBe("");
      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("")).toBe("");
      expect(uncapitalize("Hello")).toBe("hello");
      expect(uncapitalize("")).toBe("");
    });
  });

  describe("truncate", () => {
    it("returns original if under length", () => {
      expect(truncate("short", 20)).toBe("short");
    });
    it("truncates with default ellipsis", () => {
      expect(truncate("Hello, world!", 8)).toBe("Hello, …");
    });
    it("supports custom ellipsis", () => {
      expect(truncate("Hello, world!", 8, "...")).toBe("Hello...");
    });
    it("handles maxLength <= ellipsis length", () => {
      expect(truncate("Hello", 2, "...")).toBe("..");
    });
  });

  describe("escapeHtml", () => {
    it("escapes all HTML-critical characters", () => {
      expect(escapeHtml('<script>alert("1")</script>')).toBe("&lt;script&gt;alert(&quot;1&quot;)&lt;/script&gt;");
      expect(escapeHtml("Tom's & Jerry's")).toBe("Tom&#39;s &amp; Jerry&#39;s");
    });
  });

  describe("escapeRegExp", () => {
    it("escapes regex metacharacters", () => {
      expect(escapeRegExp("a.b*c")).toBe("a\\.b\\*c");
      const matcher = new RegExp(escapeRegExp("a.b*c"));
      expect(matcher.test("a.b*c")).toBe(true);
      expect(matcher.test("aXbYc")).toBe(false);
    });
  });

  describe("words", () => {
    it("splits on dashes, underscores, whitespace", () => {
      expect(words("hello_world-foo bar")).toEqual(["hello", "world", "foo", "bar"]);
      expect(words("")).toEqual([]);
      expect(words("__foo__")).toEqual(["foo"]);
    });
  });

  describe("lines", () => {
    it("splits on all line break styles", () => {
      expect(lines("a\nb\r\nc\rd")).toEqual(["a", "b", "c", "d"]);
      expect(lines("")).toEqual([""]);
    });
  });
});
