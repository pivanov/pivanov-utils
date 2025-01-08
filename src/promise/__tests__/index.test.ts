import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { sleep } from '../';

describe('sleep', () => {
  // Mock the timer functions
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should resolve after the specified time', async () => {
    const ms = 1000;
    const promise = sleep(ms);

    // Fast-forward time
    vi.advanceTimersByTime(ms);

    await expect(promise).resolves.toBeUndefined();
  });

  it('should not resolve before the specified time', async () => {
    const ms = 1000;
    const promise = sleep(ms);

    // Fast-forward time, but not enough
    vi.advanceTimersByTime(ms - 1);

    const resolved = vi.fn();
    void promise.then(resolved);

    // Verify the promise hasn't resolved yet
    expect(resolved).not.toHaveBeenCalled();
  });
});
