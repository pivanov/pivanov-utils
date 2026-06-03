import { bench, group, summary } from "mitata";

import { camelCase, escapeHtml, kebabCase, slugify, snakeCase, titleCase } from "../src/string";

const inputs = {
  short: "foo-bar-baz",
  compound: "XMLHttpRequestHandler",
  sentence: "The quick brown fox jumps over the lazy dog",
  unicode: "Über Café résumé naïve",
  dirty: "  Complex@#$%^&* String_with__mixed-delimiters  ",
  html: '<div class="x">Tom & "Jerry" <span>\'s</span></div>',
};

group("camelCase", () => {
  summary(() => {
    bench("short", () => camelCase(inputs.short));
    bench("compound", () => camelCase(inputs.compound));
    bench("sentence", () => camelCase(inputs.sentence));
  });
});

group("kebabCase", () => {
  summary(() => {
    bench("short", () => kebabCase(inputs.short));
    bench("compound", () => kebabCase(inputs.compound));
    bench("dirty", () => kebabCase(inputs.dirty));
  });
});

group("snakeCase", () => {
  summary(() => {
    bench("short", () => snakeCase(inputs.short));
    bench("compound", () => snakeCase(inputs.compound));
  });
});

group("titleCase", () => {
  summary(() => {
    bench("short", () => titleCase(inputs.short));
    bench("sentence", () => titleCase(inputs.sentence));
  });
});

group("slugify", () => {
  summary(() => {
    bench("short", () => slugify(inputs.short));
    bench("unicode", () => slugify(inputs.unicode));
    bench("dirty", () => slugify(inputs.dirty));
  });
});

group("escapeHtml", () => {
  summary(() => {
    bench("no special chars", () => escapeHtml(inputs.sentence));
    bench("heavy markup", () => escapeHtml(inputs.html));
  });
});
