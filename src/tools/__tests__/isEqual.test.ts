import {
  describe,
  expect,
  it,
} from 'vitest';

import { isEqual } from '../isEqual';

describe('isEqual', () => {
  it('compares primitives', () => {
    expect(isEqual(1, 1)).toBe(true);
    expect(isEqual('test', 'test')).toBe(true);
    expect(isEqual(true, true)).toBe(true);
    expect(isEqual(1, 2)).toBe(false);
  });

  it('compares arrays', () => {
    expect(isEqual([
      1,
      2,
      3,
    ], [
      1,
      2,
      3,
    ])).toBe(true);
    expect(isEqual([
      1,
      2,
      3,
    ], [
      1,
      2,
      4,
    ])).toBe(false);
    expect(isEqual([
      1,
      [
        2,
        3,
      ],
    ], [
      1,
      [
        2,
        3,
      ],
    ])).toBe(true);
    expect(isEqual([
      1,
      2,
    ], [
      1,
      2,
      3,
    ])).toBe(false);
    expect(isEqual([], [1])).toBe(false);
  });

  it('compares objects', () => {
    expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    expect(isEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    expect(isEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(isEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
    expect(isEqual({}, { a: 1 })).toBe(false);
    expect(isEqual(
      { a: { b: 1 }, c: 2 },
      { a: { b: 1 }, c: 2 },
    )).toBe(true);
  });

  it('compares Sets', () => {
    expect(isEqual(new Set([
      1,
      2,
    ]), new Set([
      1,
      2,
    ]))).toBe(true);
    expect(isEqual(new Set([
      1,
      2,
    ]), new Set([
      1,
      3,
    ]))).toBe(false);
    expect(isEqual(new Set([1]), new Set([
      1,
      2,
    ]))).toBe(false);
    expect(isEqual(new Set(), new Set([1]))).toBe(false);
  });

  it('compares Maps', () => {
    const map1 = new Map([
      [
        'a',
        1,
      ],
    ]);
    const map2 = new Map([
      [
        'a',
        1,
      ],
    ]);
    const map3 = new Map([
      [
        'a',
        2,
      ],
    ]);
    const map4 = new Map([
      [
        'a',
        1,
      ],
      [
        'b',
        2,
      ],
    ]);
    const nestedMap1 = new Map([
      [
        'a',
        new Map([
          [
            'b',
            1,
          ],
        ]),
      ],
    ]);
    const nestedMap2 = new Map([
      [
        'a',
        new Map([
          [
            'b',
            1,
          ],
        ]),
      ],
    ]);

    expect(isEqual(map1, map2)).toBe(true);
    expect(isEqual(map1, map3)).toBe(false);
    expect(isEqual(map1, map4)).toBe(false);
    expect(isEqual(new Map(), map1)).toBe(false);
    expect(isEqual(nestedMap1, nestedMap2)).toBe(true);
  });

  it('compares Dates', () => {
    expect(isEqual(new Date('2024-01-01'), new Date('2024-01-01'))).toBe(true);
    expect(isEqual(new Date('2024-01-01'), new Date('2024-01-02'))).toBe(false);
  });

  it('handles null and undefined', () => {
    expect(isEqual(null, null)).toBe(true);
    expect(isEqual(undefined, undefined)).toBe(true);
    expect(isEqual(null, undefined)).toBe(false);
    expect(isEqual({}, null)).toBe(false);
  });
});
