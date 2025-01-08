import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  busDispatch,
  busSubscribe,
} from '../';

import type { TEventBusListener } from '../types';

beforeEach(() => {
  // No need to mock window as jsdom provides it
  // Only need to clear existing listeners between tests
  const events = document.querySelectorAll('*');
  for (const element of events) {
    element.replaceWith(element.cloneNode(true));
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('EventBus', () => {
  describe('busSubscribe/busDispatch', () => {
    it('should call listener when event is dispatched', () => {
      const topic = 'test-topic';
      const message = { data: 'test' };
      const listener = vi.fn();

      busSubscribe(topic, listener);
      busDispatch(topic, message);

      expect(listener).toHaveBeenCalledWith(message);
    });

    it('should support multiple listeners for same event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      busSubscribe('test-event', listener1);
      busSubscribe('test-event', listener2);

      const payload = { data: 'test' };
      busDispatch('test-event', payload);

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
      expect(listener1).toHaveBeenCalledWith(payload);
      expect(listener2).toHaveBeenCalledWith(payload);
    });

    it('should not call listeners of different events', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      busSubscribe('event1', listener1);
      busSubscribe('event2', listener2);

      busDispatch('event1', 'data');

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).not.toHaveBeenCalled();
    });

    it('should return unsubscribe function', () => {
      const listener = vi.fn();
      const unsubscribe = busSubscribe('test-event', listener);

      busDispatch('test-event', 'first');
      unsubscribe();
      busDispatch('test-event', 'second');

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith('first');
    });

    it('should handle multiple subscriptions and unsubscriptions correctly', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const unsubscribe1 = busSubscribe('test-event', listener1);
      const unsubscribe2 = busSubscribe('test-event', listener2);

      busDispatch('test-event', 'first');
      unsubscribe1();

      busDispatch('test-event', 'second');
      unsubscribe2();

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener1).toHaveBeenCalledWith('first');
      expect(listener2).toHaveBeenCalledTimes(2);
      expect(listener2).toHaveBeenCalledWith('second');
    });

    it('should handle errors in listeners without affecting other listeners', () => {
      // Temporarily suppress console.error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const errorListener = vi.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });
      const successListener = vi.fn();

      busSubscribe('test', errorListener);
      busSubscribe('test', successListener);

      busDispatch('test', { data: 'test' });

      expect(errorListener).toHaveBeenCalledTimes(1);
      expect(successListener).toHaveBeenCalledTimes(1);
      expect(successListener).toHaveBeenCalledWith({ data: 'test' });

      // Verify error was logged
      expect(consoleSpy).toHaveBeenCalledWith(
        'Event listener error:',
        expect.any(Error),
      );

      // Restore console.error
      consoleSpy.mockRestore();
    });

    it('should safely handle dispatch to event with no listeners', () => {
      expect(() => {
        busDispatch('non-existent', 'data');
      }).not.toThrow();
    });

    it('should handle empty or invalid topics', () => {
      const listener = vi.fn();

      // Test empty topic
      busDispatch('', 'data');
      expect(listener).not.toHaveBeenCalled();

      // Test invalid listener
      const unsubscribe = busSubscribe('', null as unknown as TEventBusListener<unknown>);
      expect(unsubscribe).toBeDefined();
      unsubscribe(); // Should not throw
    });

    it('should ignore non-CustomEvents', () => {
      const listener = vi.fn();
      busSubscribe('test-topic', listener);

      // Dispatch a regular Event instead of CustomEvent
      window.dispatchEvent(new Event('test-topic'));

      expect(listener).not.toHaveBeenCalled();
    });

    it('should generate consistent hashed topics with special characters', () => {
      const listener = vi.fn();
      const topic = '🚀 special → characters ←';

      busSubscribe(topic, listener);
      busDispatch(topic, 'test');

      expect(listener).toHaveBeenCalledWith('test');
    });

    it('should handle undefined or null event data', () => {
      const listener = vi.fn();
      busSubscribe('test-topic', listener);

      busDispatch('test-topic', undefined);
      busDispatch('test-topic', null);

      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(1, null);
      expect(listener).toHaveBeenNthCalledWith(2, null);
    });

    it('should handle falsy event data', () => {
      const listener = vi.fn();
      busSubscribe('test-topic', listener);

      busDispatch('test-topic', 0);
      busDispatch('test-topic', '');
      busDispatch('test-topic', false);

      expect(listener).toHaveBeenCalledTimes(3);
      expect(listener).toHaveBeenNthCalledWith(1, 0);
      expect(listener).toHaveBeenNthCalledWith(2, '');
      expect(listener).toHaveBeenNthCalledWith(3, false);
    });

    it('should handle invalid event objects', () => {
      const listener = vi.fn();
      const topic = 'test-topic';

      // Get the actual event listener by spying on addEventListener
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      busSubscribe(topic, listener);

      // Get the event listener function that was passed to addEventListener
      const eventListener = addEventListenerSpy.mock.calls[0][1] as EventListener;

      // Test with various invalid events
      eventListener(null as unknown as Event);
      eventListener(undefined as unknown as Event);
      eventListener({} as Event); // plain object that's not an Event

      expect(listener).not.toHaveBeenCalled();

      addEventListenerSpy.mockRestore();
    });
  });
});
