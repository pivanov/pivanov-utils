/**
 * Generic event-bus shape. Extend this interface for typed dispatch/subscribe.
 *
 * @example
 * ```ts
 * interface UserLoggedIn extends IEventBus<{ id: number; name: string }> {
 *   topic: 'user:logged-in';
 * }
 * busDispatch<UserLoggedIn>('user:logged-in', { id: 1, name: 'John' });
 * ```
 */
export interface IEventBus<T = unknown> {
  topic: string;
  message: T;
}

/**
 * Listener callback shape.
 */
export type TEventBusListener<T = unknown> = (message: T) => void;

/**
 * Function returned by `busSubscribe` that removes the subscription.
 */
export type TEventBusUnsubscribe = () => void;

/**
 * Optional behavior for a subscription.
 */
export interface IEventBusSubscribeOptions {
  /** Called with the error when the listener throws. Defaults to `console.error`. */
  onError?: (error: unknown) => void;
}

/**
 * Type helper: given an event map, extract the set of valid topic names.
 *
 * @example
 * ```ts
 * type Events = {
 *   'user:login': { id: number };
 *   'user:logout': void;
 * };
 * type Topic = TEventTopic<Events>; // 'user:login' | 'user:logout'
 * ```
 */
export type TEventTopic<Map> = keyof Map & string;

/**
 * Type helper: given an event map and a topic, extract the message payload.
 */
export type TEventMessage<Map, Topic extends TEventTopic<Map>> = Map[Topic];
