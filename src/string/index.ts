/**
 * Converts a string to camelCase.
 *
 * @example
 * ```ts
 * camelCase('foo-bar');  // 'fooBar'
 * camelCase('FOO_BAR');  // 'fooBar'
 * ```
 */
export const camelCase = (str: string): string => {
  return str
    .trim()
    .toLowerCase()
    .replace(/^[-_\s]+/, "")
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""));
};

/**
 * Converts a string to PascalCase.
 *
 * @example
 * ```ts
 * pascalCase('foo-bar');      // 'FooBar'
 * pascalCase('foo123bar');    // 'Foo123Bar'
 * ```
 */
export const pascalCase = (str: string): string => {
  return str
    .split(/(?=[0-9])|(?<=[0-9])|[^a-zA-Z0-9]+/g)
    .filter(Boolean)
    .map((w) => w.toLowerCase())
    .map((w) => `${w.charAt(0).toUpperCase()}${w.slice(1)}`)
    .join("");
};

/**
 * Capitalizes the first character of a string (runtime).
 * For TypeScript literal-type preservation, use `capitalize` instead.
 */
export const capitalizeFirstLetter = (string: string): string => string.charAt(0).toUpperCase() + string.slice(1);

/**
 * Converts a string to kebab-case.
 *
 * @example
 * ```ts
 * kebabCase('fooBar');         // 'foo-bar'
 * kebabCase('XMLHttpRequest'); // 'xml-http-request'
 * ```
 */
export const kebabCase = (str: string): string => {
  if (str == null) {
    return str;
  }
  return str
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\w\s-]/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .replace(/[-_\s]+/g, "-")
    .toLowerCase()
    .replace(/^-+|-+$/g, "")
    .trim();
};

/**
 * Converts a string to snake_case.
 *
 * @example
 * ```ts
 * snakeCase('fooBar');         // 'foo_bar'
 * snakeCase('XMLHttpRequest'); // 'xml_http_request'
 * ```
 */
export const snakeCase = (str: string): string => {
  if (str == null) {
    return str;
  }
  return str
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\w\s-]/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
    .replace(/[-_\s]+/g, "_")
    .toLowerCase()
    .replace(/^_+|_+$/g, "")
    .trim();
};

/**
 * Converts a string to Title Case - each word capitalized, separators
 * normalized to single spaces.
 *
 * @example
 * ```ts
 * titleCase('hello world');       // 'Hello World'
 * titleCase('foo-bar_baz');       // 'Foo Bar Baz'
 * ```
 */
export const titleCase = (str: string): string => {
  return str
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, " ")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Converts a string into a URL-friendly slug. More aggressive than
 * `kebabCase` - strips all non-ASCII-word characters.
 *
 * @example
 * ```ts
 * slugify('Hello World!');     // 'hello-world'
 * slugify('Über Café');         // 'uber-cafe'
 * ```
 */
export const slugify = (str: string): string => {
  return str
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[-\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Capitalizes the first character; preserves TypeScript literal types.
 */
export const capitalize = <S extends string>(str: S): Capitalize<S> => {
  return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<S>;
};

/**
 * Lower-cases the first character; preserves TypeScript literal types.
 */
export const uncapitalize = <S extends string>(str: S): Uncapitalize<S> => {
  return (str.charAt(0).toLowerCase() + str.slice(1)) as Uncapitalize<S>;
};

/**
 * Truncates a string to `maxLength` characters, appending an ellipsis
 * (default `…`) if truncation happened. The ellipsis is included in
 * the final length.
 *
 * @example
 * ```ts
 * truncate('Hello, world!', 8);        // 'Hello, …'
 * truncate('Hello, world!', 8, '...'); // 'Hello...'
 * truncate('Short', 20);               // 'Short'
 * ```
 */
export const truncate = (str: string, maxLength: number, ellipsis = "…"): string => {
  if (str.length <= maxLength) {
    return str;
  }
  if (maxLength <= ellipsis.length) {
    return ellipsis.slice(0, maxLength);
  }
  return str.slice(0, maxLength - ellipsis.length) + ellipsis;
};

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Escapes HTML special characters for safe interpolation into markup.
 *
 * @example
 * ```ts
 * escapeHtml('<script>alert(1)</script>');
 * // '&lt;script&gt;alert(1)&lt;/script&gt;'
 * ```
 */
export const escapeHtml = (str: string): string => {
  return str.replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch]);
};

/**
 * Escapes characters that have special meaning in a regular expression so the
 * string can be safely embedded as a literal match.
 *
 * @example
 * ```ts
 * new RegExp(escapeRegExp('a.b*c')); // matches the literal "a.b*c"
 * ```
 */
export const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Splits a string into words by whitespace, dashes, and underscores.
 * Preserves case; filters out empty segments.
 *
 * @example
 * ```ts
 * words('hello_world-foo bar'); // ['hello', 'world', 'foo', 'bar']
 * ```
 */
export const words = (str: string): string[] => {
  return str.split(/[-_\s]+/).filter(Boolean);
};

/**
 * Splits a string by line breaks (`\r\n`, `\n`, or `\r`).
 *
 * @example
 * ```ts
 * lines('a\nb\r\nc'); // ['a', 'b', 'c']
 * ```
 */
export const lines = (str: string): string[] => {
  return str.split(/\r\n|\r|\n/);
};
