import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  camelCase,
  capitalize,
  capitalizeFirstLetter,
  kebabCase,
  pascalCase,
  slugify,
  uncapitalize,
} from './index';

describe('string utils', () => {
  describe('camelCase', () => {
    it('converts various string formats to camelCase', () => {
      expect(camelCase('foo-bar')).toBe('fooBar');
      expect(camelCase('foo_bar')).toBe('fooBar');
      expect(camelCase('Foo Bar')).toBe('fooBar');
      expect(camelCase('foo bar baz')).toBe('fooBarBaz');
      expect(camelCase('  foo  bar  ')).toBe('fooBar');
      expect(camelCase('')).toBe('');
      expect(camelCase('   ')).toBe('');
      expect(camelCase('123')).toBe('123');
      expect(camelCase('foo--bar')).toBe('fooBar');
      expect(camelCase('foo__bar')).toBe('fooBar');
      expect(camelCase('FOO_BAR')).toBe('fooBar');
    });

    it('handles edge cases with special patterns', () => {
      expect(camelCase('foo-')).toBe('foo');
      expect(camelCase('foo_')).toBe('foo');
      expect(camelCase('foo ')).toBe('foo');
      expect(camelCase('-foo')).toBe('foo');
      expect(camelCase('_foo')).toBe('foo');
      expect(camelCase(' foo')).toBe('foo');
      expect(camelCase('foo--')).toBe('foo');
      expect(camelCase('foo__')).toBe('foo');
      expect(camelCase('foo  ')).toBe('foo');
      expect(camelCase('-')).toBe('');
      expect(camelCase('_')).toBe('');
      expect(camelCase(' ')).toBe('');
      expect(camelCase('- ')).toBe('');
      expect(camelCase('_ ')).toBe('');
      expect(camelCase('  ')).toBe('');
      expect(camelCase('-foo-bar')).toBe('fooBar');
      expect(camelCase('_foo_bar')).toBe('fooBar');
      expect(camelCase(' foo bar')).toBe('fooBar');
    });
  });

  describe('pascalCase', () => {
    it('converts various string formats to PascalCase', () => {
      expect(pascalCase('foo-bar')).toBe('FooBar');
      expect(pascalCase('foo_bar')).toBe('FooBar');
      expect(pascalCase('foo bar')).toBe('FooBar');
      expect(pascalCase('foo123bar')).toBe('Foo123Bar');
      expect(pascalCase('')).toBe('');
      expect(pascalCase('   ')).toBe('');
      expect(pascalCase('123')).toBe('123');
      expect(pascalCase('123foo')).toBe('123Foo');
      expect(pascalCase('foo123foo')).toBe('Foo123Foo');
      expect(pascalCase('FOO_BAR_BAZ')).toBe('FooBarBaz');
    });
  });

  describe('capitalizeFirstLetter', () => {
    it('capitalizes the first letter of a string', () => {
      expect(capitalizeFirstLetter('hello')).toBe('Hello');
      expect(capitalizeFirstLetter('world')).toBe('World');
      expect(capitalizeFirstLetter('already Capitalized')).toBe('Already Capitalized');
      expect(capitalizeFirstLetter('')).toBe('');
    });
  });

  describe('kebabCase', () => {
    it('converts various string formats to kebab-case', () => {
      expect(kebabCase('fooBar')).toBe('foo-bar');
      expect(kebabCase('FooBar')).toBe('foo-bar');
      expect(kebabCase('foo bar')).toBe('foo-bar');
      expect(kebabCase('Foo123Bar')).toBe('foo123-bar');
      expect(kebabCase('FOOBar')).toBe('foo-bar');
      expect(kebabCase('')).toBe('');
      expect(kebabCase('   ')).toBe('');
      expect(kebabCase('123')).toBe('123');
      expect(kebabCase('FOO_BAR-BAZ')).toBe('foo-bar-baz');
      expect(kebabCase('FOO')).toBe('foo');
      expect(kebabCase('FOOBar')).toBe('foo-bar');
      expect(kebabCase('FOO_BAR')).toBe('foo-bar');
      expect(kebabCase('FOO-BAR')).toBe('foo-bar');
      expect(kebabCase('XMLHttpRequest')).toBe('xml-http-request');
      expect(kebabCase('AAABBBCcc')).toBe('aaabbb-ccc');
      expect(kebabCase('ABC')).toBe('abc');
      expect(kebabCase('foo_BAR-BAZ')).toBe('foo-bar-baz');
      expect(kebabCase('foo--BAR__BAZ')).toBe('foo-bar-baz');
      expect(kebabCase(undefined as unknown as string)).toBe(undefined);
      expect(kebabCase(null as unknown as string)).toBe(null);
      expect(kebabCase('')).toBe('');
      expect(kebabCase('   ')).toBe('');
      expect(kebabCase('123')).toBe('123');
      expect(kebabCase('é è à ù')).toBe('e-e-a-u');
      expect(kebabCase('ñ ç')).toBe('n-c');
      expect(kebabCase('한글')).toBe('');
      expect(kebabCase('foo@#$%bar&*^baz')).toBe('foo-bar-baz');
      expect(kebabCase('foo---bar___baz')).toBe('foo-bar-baz');
    });

    it('handles edge cases with special characters and patterns', () => {
      expect(kebabCase('ABC_DEF')).toBe('abc-def');
      expect(kebabCase('ABC-DEF')).toBe('abc-def');
      expect(kebabCase('ABC DEF')).toBe('abc-def');
      expect(kebabCase('ABC__DEF')).toBe('abc-def');
      expect(kebabCase('ABC--DEF')).toBe('abc-def');
      expect(kebabCase('ABC  DEF')).toBe('abc-def');
      expect(kebabCase('ABC---DEF')).toBe('abc-def');
      expect(kebabCase('ABC___DEF')).toBe('abc-def');
      expect(kebabCase('ABC   DEF')).toBe('abc-def');
      expect(kebabCase('ABC----DEF')).toBe('abc-def');
      expect(kebabCase('ABC____DEF')).toBe('abc-def');
      expect(kebabCase('ABC    DEF')).toBe('abc-def');
    });

    it('handles consecutive uppercase characters', () => {
      expect(kebabCase('XMLHttpRequest')).toBe('xml-http-request');
      expect(kebabCase('AAABBBCcc')).toBe('aaabbb-ccc');
      expect(kebabCase('XMLHTTP')).toBe('xmlhttp');
      expect(kebabCase('XMLHTTP_REQUEST')).toBe('xmlhttp-request');
      expect(kebabCase('XML_HTTP_REQUEST')).toBe('xml-http-request');
    });
  });

  describe('slugify', () => {
    it('converts strings to URL-friendly slugs', () => {
      expect(slugify('Hello World!')).toBe('hello-world');
      expect(slugify('Über Café')).toBe('uber-cafe');
      expect(slugify('__FOO--BAR  ')).toBe('foo-bar');
      expect(slugify('Complex@#$%^&* String')).toBe('complex-string');
      expect(slugify('multiple   spaces')).toBe('multiple-spaces');
      expect(slugify('-leading-and-trailing-')).toBe('leading-and-trailing');
      expect(slugify('')).toBe('');
      expect(slugify('   ')).toBe('');
      expect(slugify('123')).toBe('123');
      expect(slugify('é è à ù')).toBe('e-e-a-u');
      expect(slugify('ñ ç')).toBe('n-c');
      expect(slugify('한글')).toBe('');
      expect(slugify('foo@#$%bar&*^baz')).toBe('foobarbaz');
      expect(slugify('foo---bar___baz')).toBe('foo-bar-baz');
    });
  });

  describe('capitalize', () => {
    it('capitalizes strings while maintaining TypeScript types', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('world')).toBe('World');
      expect(capitalize('')).toBe('');
      // TypeScript will ensure the return type is Capitalize<string>
    });
  });

  describe('uncapitalize', () => {
    it('uncapitalizes strings while maintaining TypeScript types', () => {
      expect(uncapitalize('Hello')).toBe('hello');
      expect(uncapitalize('World')).toBe('world');
      expect(uncapitalize('')).toBe('');
      // TypeScript will ensure the return type is Uncapitalize<string>
    });
  });
});
