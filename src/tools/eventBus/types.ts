/**
 * Generic event bus interface for communication between components
 * @template T - The type of the message payload
 */
export interface IEventBus<T = unknown> {
  /** The topic/channel name for the event */
  topic: string;
  /** The message payload */
  message: T;
}

/**
 * Event bus listener function type
 * @template T - The type of the message payload
 */
export type TEventBusListener<T = unknown> = (message: T) => void;

/**
 * Function returned by event bus subscription that can be called to unsubscribe
 */
export type TEventBusUnsubscribe = () => void;
