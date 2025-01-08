import type {
  IEventBus,
  TEventBusListener,
  TEventBusUnsubscribe,
} from './types';

const simpleHash = (id: string, key = '\uD83D\uDE80') => {
  let hash = 0;
  const combined = id + key;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return (hash >>> 0).toString(16); // Ensure the hash is positive and convert to hex
};

const generateSaltedTopic = (topic: string) => {
  const signature = simpleHash(topic);
  return `${signature}::${topic}`;
};

const createCustomEventListener = <M>(listener: TEventBusListener<M>): EventListener => {
  return (event: Event) => {
    if (!(event instanceof CustomEvent)) return;
    try {
      listener(event.detail);
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: Intended debug output
      console.error('Event listener error:', error);
    }
  };
};

/**
 * Dispatches a message to all listeners subscribed to the given topic
 *
 * @template T - The type of the message payload
 * @param topic - The topic/channel to dispatch to
 * @param message - The message payload to send
 *
 * @example
 * ```ts
 * busDispatch('user-updated', { id: 1, name: 'John' });
 * ```
 */
export const busDispatch = <T extends IEventBus>(
  topic: T['topic'],
  message: T['message'],
): void => {
  if (!topic) return;
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
 * Subscribes to messages on a specific topic
 *
 * @template T - The type of the message payload
 * @param topic - The topic/channel to subscribe to
 * @param listener - Callback function that will be called with the message payload
 * @returns An unsubscribe function that can be called to remove the subscription
 *
 * @example
 * ```ts
 * const unsubscribe = busSubscribe('user-updated', (message) => {
 *   console.log('User updated:', message);
 * });
 *
 * // Later when you want to unsubscribe
 * unsubscribe();
 * ```
 */
export const busSubscribe = <T extends IEventBus>(
  topic: IEventBus['topic'],
  listener: TEventBusListener<T['message']>,
): TEventBusUnsubscribe => {
  if (!topic || typeof listener !== 'function') {
    return () => {};
  }

  const customEventListener = createCustomEventListener<T['message']>(listener);
  const hashedTopic = generateSaltedTopic(topic);
  window.addEventListener(hashedTopic, customEventListener);
  return () => window.removeEventListener(hashedTopic, customEventListener);
};
