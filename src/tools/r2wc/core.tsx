import { createRoot } from 'react-dom/client';

import {
  busDispatch,
  busSubscribe,
} from '../eventBus';

import type { ComponentType } from 'react';
import type { Root } from 'react-dom/client';
import type {
  IEventBusUpdate,
  IR2WCBaseProps,
  IR2WCOptions,
} from './types';

/**
 * Converts a React component into a Web Component (Custom Element)
 *
 * @template Props - The props type for the React component, must extend IR2WCBaseProps
 * @param ReactComponent - The React component to convert
 * @param options - Configuration options for the Web Component
 * @param styles - Optional array of CSS styles to be injected into the shadow DOM
 * @returns A Custom Element constructor that can be registered with customElements.define
 *
 * @example
 * ```tsx
 * const MyWebComponent = r2wc(MyReactComponent, {
 *   shadow: 'open',
 * });
 *
 * customElements.define('my-component', MyWebComponent);
 * ```
 */
export const r2wc = <Props extends IR2WCBaseProps>(
  elementName: string,
  ReactComponent: ComponentType<Props>,
  options: IR2WCOptions = {},
  styles?: string[],
): CustomElementConstructor => {
  const WebComponent = class ReactWebComponent extends HTMLElement {
    private root?: Root;
    private container: HTMLElement | ShadowRoot;
    private cacheKey?: string;

    constructor() {
      super();

      // Create or find a stylesheet
      let styleSheet = Array.from(document.styleSheets).find(
        (sheet) => sheet instanceof CSSStyleSheet && !sheet.disabled,
      ) as CSSStyleSheet | undefined;

      // If no stylesheet exists, create a new one
      if (!styleSheet) {
        const style = document.createElement('style');
        document.head.appendChild(style);
        styleSheet = style.sheet as CSSStyleSheet;
      }

      const ruleExists = Array.from(styleSheet.cssRules).find((rule) => {
        return (rule as CSSStyleRule).selectorText === `${this.tagName.toLowerCase()}`;
      });

      if (!ruleExists) {
        // Add a CSS rule to apply display: inline-flex to all custom elements
        styleSheet.insertRule(
          `${this.tagName.toLowerCase()} { display: inline-flex; }`,
          styleSheet.cssRules.length,
        );
      }

      const shadow = options.shadow || (styles?.length ? 'open' : 'closed');

      if (!options.shadow && styles?.length) {
        // biome-ignore lint/suspicious/noConsole: Intended debug output
        console.info('@@@ Styles are provided but shadowDOM is not enabled');
      }

      // Set up shadow DOM
      this.container = shadow
        ? (this.attachShadow({ mode: shadow }) as unknown as HTMLElement)
        : this;

      if (styles && shadow) {
        const styleElement = document.createElement('style');
        styleElement.textContent = styles.join('\n');
        this.container.appendChild(styleElement);
      }
    }

    connectedCallback() {
      if (!this.root) {
        this.root = createRoot(this.container);
        this.subscribeToEvents();
      }
    }

    disconnectedCallback() {
      if (this.root) {
        this.root.unmount();
      }
    }

    private subscribeToEvents() {
      busSubscribe<IEventBusUpdate>('@@-widget-create', (message: IEventBusUpdate['message']) => {
        const { widgetProps, cacheKey } = message;

        if (!this.cacheKey && cacheKey === `${this.tagName.toLowerCase().replace('widget-', '')}-${this.uuid}`) {
          this.cacheKey = cacheKey;

          this.mountComponent(widgetProps as unknown as Props);
        }
      });

      busSubscribe<IEventBusUpdate>('@@-widget-update', (message: IEventBusUpdate['message']) => {
        const { widgetProps, cacheKey } = message;

        if ((this.cacheKey === cacheKey) && cacheKey === `${this.tagName.toLowerCase().replace('widget-', '')}-${this.uuid}`) {
          busDispatch('@@-widget-update-props', {
            widgetProps,
            uuid: this.uuid,
          });
        }
      });
    }

    private mountComponent(widgetProps?: Props) {
      if (this.root && widgetProps) {
        this.root.render(
          <ReactComponent
            {...widgetProps}
            container={this.container}
            root={this}
          />,
        );
      }
    }
  };

  // Register the web component if it hasn't been registered yet
  if (!customElements.get(elementName)) {
    customElements.define(elementName, WebComponent);
  }

  return WebComponent;
};
