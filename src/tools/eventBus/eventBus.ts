import type { IEventBus, IEventBusSubscribeOptions, TEventBusListener, TEventBusUnsubscribe } from "./types";

const simpleHash = (id: string, key = "\uD83D\uDE80"): string => {
  let hash = 0;
  const combined = id + key;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return (hash >>> 0).toString(16);
};

const generateSaltedTopic = (topic: string): string => {
  const signature = simpleHash(topic);
  return `${signature}::${topic}`;
};

const createCustomEventListener = <M>(listener: TEventBusListener<M>, onError?: (error: unknown) => void): EventListener => {
  return (event: Event) => {
    if (!(event instanceof CustomEvent)) {
      return;
    }
    try {
      listener(event.detail);
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        console.error("Event listener error:", error);
      }
    }
  };
};

/**
 * Dispatches a message to every subscriber on `topic`.
 *
 * @example
 * ```ts
 * busDispatch('user-updated', { id: 1, name: 'John' });
 * ```
 */
export const busDispatch = <T extends IEventBus>(topic: T["topic"], message: T["message"]): void => {
  if (!topic) {
    return;
  }
  const hashedTopic = generateSaltedTopic(topic);
  window.dispatchEvent(
    new CustomEvent(hashedTopic, {
      detail: message,
      bubbles: true,
      cancelable: false,
    }),
  );
};

/**
 * Subscribes to messages on a specific topic. Returns an unsubscribe function.
 *
 * Pass `options.onError` to handle listener exceptions (default: `console.error`).
 *
 * @example
 * ```ts
 * const unsubscribe = busSubscribe('user-updated', (msg) => {
 *   console.log(msg);
 * });
 * unsubscribe();
 *
 * // Custom error handler
 * busSubscribe('x', handler, { onError: (e) => reportBug(e) });
 * ```
 */
export const busSubscribe = <T extends IEventBus>(
  topic: T["topic"],
  listener: TEventBusListener<T["message"]>,
  options: IEventBusSubscribeOptions = {},
): TEventBusUnsubscribe => {
  if (!topic || typeof listener !== "function") {
    return () => {};
  }

  const customEventListener = createCustomEventListener<T["message"]>(listener, options.onError);
  const hashedTopic = generateSaltedTopic(topic);
  window.addEventListener(hashedTopic, customEventListener);
  return () => window.removeEventListener(hashedTopic, customEventListener);
};

/**
 * Subscribes to a topic and automatically unsubscribes after the first
 * matching dispatch.
 *
 * @example
 * ```ts
 * busOnce('ready', () => startApp());
 * ```
 */
export const busOnce = <T extends IEventBus>(
  topic: T["topic"],
  listener: TEventBusListener<T["message"]>,
  options: IEventBusSubscribeOptions = {},
): TEventBusUnsubscribe => {
  if (!topic || typeof listener !== "function") {
    return () => {};
  }
  const unsubscribe = busSubscribe<T>(
    topic,
    (message) => {
      unsubscribe();
      listener(message);
    },
    options,
  );
  return unsubscribe;
};
