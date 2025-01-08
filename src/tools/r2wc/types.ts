import type {
  DetailedHTMLProps,
  HTMLAttributes,
} from 'react';

declare global {
  interface HTMLElement {
    uuid?: string;
  }
  interface ISharedValues {
    baseStoreUI: unknown;
  }
  interface Window {
    pivanov?: unknown; // for testing purposes
  }
  interface Navigator {
    [key: string | symbol]: unknown;
  }
  interface Document {
    [key: string | symbol]: unknown;
  }
  namespace JSX {
    interface IntrinsicElements {
      [elementName: `${string}-${string}`]: DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & { [key: string]: unknown },
        HTMLElement
      >;
    }
  }
}

export interface IEventBusUpdate {
  topic: string;
  message: {
    widgetName: string;
    widgetProps: Record<string, unknown>;
    cacheKey: string;
    uuid: string;
  };
}

export interface IEventBusUpdateProps {
  topic: string;
  message: Record<string, unknown>;
}

export interface IR2WCOptions {
  shadow?: 'open' | 'closed';
}

export interface IR2WCRenderer<Props, Context> {
  mount: (
    container: HTMLElement,
    props: Props,
  ) => Context;
  update: (props: Props) => void;
  unmount: () => void;
}

export interface IR2WCBaseProps {
  container?: HTMLElement;
}
