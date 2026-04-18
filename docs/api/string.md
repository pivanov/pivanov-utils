# String

String transformation and formatting. Import from `@pivanov/utils/string` or `@pivanov/utils`.

## Case conversion

### `camelCase(str)`
```ts
camelCase('foo-bar');        // 'fooBar'
camelCase('FOO_BAR');        // 'fooBar'
camelCase('Foo Bar Baz');    // 'fooBarBaz'
```

### `pascalCase(str)`
```ts
pascalCase('foo-bar');       // 'FooBar'
pascalCase('foo123bar');     // 'Foo123Bar'
pascalCase('FOO_BAR_BAZ');   // 'FooBarBaz'
```

### `kebabCase(str)`
```ts
kebabCase('fooBar');         // 'foo-bar'
kebabCase('XMLHttpRequest'); // 'xml-http-request'
kebabCase('é è à ù');        // 'e-e-a-u'
```

### `snakeCase(str)`
```ts
snakeCase('fooBar');         // 'foo_bar'
snakeCase('XMLHttpRequest'); // 'xml_http_request'
```

### `titleCase(str)`
```ts
titleCase('hello world');    // 'Hello World'
titleCase('foo-bar_baz');    // 'Foo Bar Baz'
```

::: info null / undefined handling
`kebabCase` and `snakeCase` pass `null` / `undefined` through unchanged (legacy behavior). The other converters throw.
:::

## Capitalization

### `capitalize<S>(str)` · `uncapitalize<S>(str)`
Literal-type preserving. Use these when you care about TypeScript inferring the exact capitalized string.

```ts
const s: 'hello' = 'hello';
const cap = capitalize(s); // type: 'Hello'
```

### `capitalizeFirstLetter(str)`
Runtime-only version that accepts any string.

## Slugs

### `slugify(str)`
More aggressive than `kebabCase` - strips all non-ASCII-word characters. Good for URL slugs.

```ts
slugify('Hello World!');        // 'hello-world'
slugify('Über Café');            // 'uber-cafe'
slugify('Complex@#$%^&* String'); // 'complex-string'
slugify('한글');                  // ''   (non-Latin dropped)
```

## Truncation

### `truncate(str, maxLength, ellipsis?)`
Truncates to `maxLength` characters, appending `ellipsis` (default `…`). The ellipsis counts toward the final length.

```ts
truncate('Hello, world!', 8);         // 'Hello, …'
truncate('Hello, world!', 8, '...');  // 'Hello...'
truncate('Short', 20);                // 'Short'
```

## Escaping

### `escapeHtml(str)`
Escapes `& < > " '` for safe interpolation into HTML.

```ts
escapeHtml('<script>alert("1")</script>');
// '&lt;script&gt;alert(&quot;1&quot;)&lt;/script&gt;'
```

### `escapeRegExp(str)`
Escapes regex metacharacters so a string can be embedded as a literal match.

```ts
const needle = 'a.b*c';
const re = new RegExp(escapeRegExp(needle));
re.test('a.b*c'); // true
```

## Splitting

### `words(str)`
Splits on whitespace, dashes, and underscores. Filters empties.

```ts
words('hello_world-foo bar'); // ['hello', 'world', 'foo', 'bar']
```

### `lines(str)`
Splits on any line break style (`\r\n`, `\n`, `\r`).

```ts
lines('a\nb\r\nc\rd'); // ['a', 'b', 'c', 'd']
```

## Choosing the right function

| Need | Use |
|---|---|
| Variable names | `camelCase` |
| Class / component names | `pascalCase` |
| CSS classes, HTML attrs | `kebabCase` |
| Python/Rust-style identifiers | `snakeCase` |
| UI headings | `titleCase` |
| URL slug | `slugify` |
| Safe HTML interpolation | `escapeHtml` |
| Build a regex from user input | `escapeRegExp` |
