import {
  act,
  cleanup,
  renderHook,
} from '@testing-library/react';
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { busDispatch } from '../';
import { useEventBus } from '../useEventBus';

import type { TEventBusListener } from '../types';

describe('useEventBus', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should subscribe to events and receive messages', () => {
    const mockCallback = vi.fn();
    renderHook(() => useEventBus('test-topic', mockCallback));
    const message = { data: 'test' };

    act(() => {
      busDispatch('test-topic', message);
    });

    expect(mockCallback).toHaveBeenCalledWith(message);
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should handle invalid inputs', () => {
    const mockCallback = vi.fn();

    // Test with empty topic
    renderHook(() => useEventBus('', mockCallback));

    // Test with invalid listener
    renderHook(() => useEventBus('test-topic', null as unknown as TEventBusListener<unknown>));

    act(() => {
      busDispatch('test-topic', 'test');
    });

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('should properly cleanup on unmount', () => {
    const mockCallback = vi.fn();
    const { unmount } = renderHook(() =>
      useEventBus('test-topic', mockCallback),
    );

    unmount();

    act(() => {
      busDispatch('test-topic', 'test');
    });

    expect(mockCallback).not.toHaveBeenCalled();
  });

  // Add more test cases as needed
});
