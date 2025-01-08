/**
 * Converts a string to camelCase format.
 *
 * @param str - The input string to convert
 * @returns The string in camelCase format
 *
 * @example
 * ```ts
 * camelCase('foo-bar')      // 'fooBar'
 * camelCase('FOO_BAR')      // 'fooBar'
 * camelCase('Foo Bar')      // 'fooBar'
 * camelCase('foo bar baz')  // 'fooBarBaz'
 * camelCase('  foo  bar  ') // 'fooBar'
 *
 * // Handles special cases
 * camelCase('')            // ''
 * camelCase('123')         // '123'
 * camelCase('foo--bar')    // 'fooBar'
 * ```
 *
 * @bestPractice
 * - Use for JavaScript/TypeScript variable and property names
 * - Ideal for internal object properties and method names
 * - Avoid using with user-facing text or URLs (use kebab-case instead)
 */
export const camelCase = (str: string): string => {
  return str
    .trim()
    .toLowerCase()
    .replace(/^[-_\s]+/, '')
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''));
};

/**
 * Converts a string to PascalCase format.
 *
 * @param str - The input string to convert
 * @returns The string in PascalCase format
 *
 * @example
 * ```ts
 * pascalCase('foo-bar')     // 'FooBar'
 * pascalCase('foo_bar')     // 'FooBar'
 * pascalCase('foo bar')     // 'FooBar'
 * pascalCase('foo123bar')   // 'Foo123Bar'
 *
 * // Handles numbers and special cases
 * pascalCase('123foo')      // '123Foo'
 * pascalCase('FOO_BAR_BAZ') // 'FooBarBaz'
 * pascalCase('')            // ''
 * ```
 *
 * @bestPractice
 * - Use for TypeScript/JavaScript class names
 * - Use for React component names
 * - Use for type and interface names in TypeScript
 * - Avoid for variable names or object properties (use camelCase instead)
 */
export const pascalCase = (str: string): string => {
  return str
    .split(/(?=[0-9])|(?<=[0-9])|[^a-zA-Z0-9]+/g)
    .filter(Boolean)
    .map((w) => w.toLowerCase())
    .map((w) => `${w.charAt(0).toUpperCase()}${w.slice(1)}`)
    .join('');
};

/**
 * Capitalizes the first letter of a string.
 *
 * @param string - The input string to capitalize
 * @returns The string with its first letter capitalized
 *
 * @example
 * ```ts
 * capitalizeFirstLetter('hello')              // 'Hello'
 * capitalizeFirstLetter('hello world')        // 'Hello world'
 * capitalizeFirstLetter('already Capitalized') // 'Already Capitalized'
 * capitalizeFirstLetter('')                   // ''
 * ```
 *
 * @bestPractice
 * - Use for simple text formatting where only the first letter needs capitalization
 * - For title formatting, consider creating a separate titleCase function
 * - For component or class names, use pascalCase instead
 */
export const capitalizeFirstLetter = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

/**
 * Converts a string to kebab-case format.
 *
 * @param str - The input string to convert
 * @returns The string in kebab-case format, or the original input if null/undefined
 *
 * @example
 * ```ts
 * kebabCase('fooBar')           // 'foo-bar'
 * kebabCase('XMLHttpRequest')   // 'xml-http-request'
 * kebabCase('AAABBBCcc')       // 'aaabbb-ccc'
 *
 * // Handles special characters and accents
 * kebabCase('é è à ù')         // 'e-e-a-u'
 * kebabCase('foo@#$%bar&*^baz') // 'foo-bar-baz'
 *
 * // Special cases
 * kebabCase('')                // ''
 * kebabCase(null)              // null
 * kebabCase(undefined)         // undefined
 * ```
 *
 * @bestPractice
 * - Use for URL slugs and routes
 * - Use for CSS class names and HTML attributes
 * - Use for file names in web projects
 * - Consider using slugify for full URL-safe string conversion
 */
export const kebabCase = (str: string): string => {
  if (str == null) return str;
  return str
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .replace(/[-_\s]+/g, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '')
    .trim();
};

/**
 * Converts a string into a URL-friendly slug.
 * More aggressive than kebabCase, removing all special characters.
 *
 * @param str - The input string to convert
 * @returns A URL-safe lowercase string with:
 *  - Unicode characters normalized and diacritics removed
 *  - Special characters removed
 *  - Spaces, underscores, and multiple hyphens converted to single hyphens
 *  - Leading and trailing hyphens removed
 *
 * @example
 * ```ts
 * slugify('Hello World!')          // 'hello-world'
 * slugify('Über Café')             // 'uber-cafe'
 * slugify('__FOO--BAR  ')          // 'foo-bar'
 * slugify('Complex@#$%^&* String') // 'complex-string'
 *
 * // Special cases
 * slugify('한글')                   // '' (removes non-Latin characters)
 * slugify('foo@#$%bar&*^baz')     // 'foobarbaz'
 * slugify('')                      // ''
 * ```
 *
 * @bestPractice
 * - Use for generating URL-safe slugs
 * - Use when you need to remove all special characters
 * - For CSS classes or less strict conversions, use kebabCase instead
 * - Consider the target audience when handling non-Latin characters
 */
export const slugify = (str: string): string => {
  return str
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[-\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Capitalizes the first character of a string, maintaining TypeScript's type inference.
 *
 * @param str - The input string to capitalize
 * @returns The string with its first character capitalized
 *
 * @example
 * ```ts
 * capitalize('hello')  // 'Hello'
 * capitalize('world')  // 'World'
 * capitalize('')      // ''
 *
 * // TypeScript type inference
 * const str: 'hello' = 'hello';
 * const capitalized = capitalize(str); // Type is Capitalize<'hello'>
 * ```
 *
 * @bestPractice
 * - Use when you need to preserve TypeScript's literal types
 * - For runtime-only capitalization, use capitalizeFirstLetter instead
 * - Consider creating a separate titleCase function for more complex capitalizations
 */
export const capitalize = <S extends string>(str: S): Capitalize<S> => {
  return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<S>;
};

/**
 * Uncapitalizes the first character of a string, maintaining TypeScript's type inference.
 *
 * @param str - The input string to uncapitalize
 * @returns The string with its first character in lowercase
 *
 * @example
 * ```ts
 * uncapitalize('Hello')  // 'hello'
 * uncapitalize('World')  // 'world'
 * uncapitalize('')      // ''
 *
 * // TypeScript type inference
 * const str: 'Hello' = 'Hello';
 * const uncapitalized = uncapitalize(str); // Type is Uncapitalize<'Hello'>
 * ```
 *
 * @bestPractice
 * - Use when you need to preserve TypeScript's literal types
 * - For runtime-only uncapitalization, consider creating a simpler function
 * - Useful for converting PascalCase to camelCase while maintaining type information
 */
export const uncapitalize = <S extends string>(str: S): Uncapitalize<S> => {
  return (str.charAt(0).toLowerCase() + str.slice(1)) as Uncapitalize<S>;
};
