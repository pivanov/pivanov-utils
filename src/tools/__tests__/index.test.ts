import {
  describe,
  expect,
  it,
} from 'vitest';

import * as utils from '../index';

describe('barrel file exports', () => {
  it('should export all utilities', () => {
    expect(utils).toBeDefined();
    // Optional: you can also test for specific exports if you want to be thorough
    expect(Object.keys(utils).length).toBeGreaterThan(0);
  });
});
