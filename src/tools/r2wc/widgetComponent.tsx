import {
  memo,
  useEffect,
  useRef,
} from 'react';
import { createRoot } from 'react-dom/client';

import {
  busDispatch,
  busSubscribe,
} from '../eventBus';

import type { JSXElementConstructor } from 'react';

/**
 * Props interface for Widget components
 * @interface IWidgetComponentProps
 * @property {string} name - The name of the widget
 * @property {string} [uuid] - Optional group identifier. Widgets sharing the same uuid will update together
 * @property {string[]} [jsFiles] - Array of JavaScript file URLs to load. Files are loaded sequentially in the specified order, useful for dependencies
 * @property {unknown} [widgetProps] - Optional props to pass to the widget
 */
interface IWidgetComponentProps {
  name: string;
  uuid?: string;
  jsFiles?: string[];
  widgetProps?: unknown;
}

/**
 * Memoized component that renders the actual widget element
 * @internal
 */
const MemoizedComponent = memo((props: Partial<IWidgetComponentProps>) => {
  const {
    name,
    uuid,
  } = props;

  const refComponent = useRef<HTMLElement>();
  const BaseComponent = `widget-${name}` as unknown as JSXElementConstructor<Record<string, unknown>>;

  useEffect(() => {
    if (refComponent.current) {
      refComponent.current.uuid = uuid as string;
    }
  }, [uuid]);

  if (typeof uuid !== 'string' || !uuid.length) {
    return null;
  }

  return (
    <BaseComponent ref={refComponent} />
  );
}, () => true);

/**
 * React component that handles widget lifecycle and rendering
 * @component
 * @example
 * ```tsx
 * <WidgetComponent
 *   name="my-widget"
 *   uuid="group1"  // Widgets with the same uuid will update together
 *   widgetProps={{ color: 'blue' }}
 * />
 * ```
 * Multiple widgets with the same uuid will form a group - when one widget's props
 * are updated, all widgets in the group will receive the update.
 */
export const WidgetComponent = (props: IWidgetComponentProps) => {
  const {
    name: _widgetName,
    uuid: _uuid,
    widgetProps,
  } = props;

  const refInitialized = useRef<boolean>(false);

  const uuid = _uuid?.trim() || crypto.randomUUID().replace(/-/g, '').slice(0, 6);
  const widgetName = _widgetName.trim().toLowerCase();
  const cacheKey = `${widgetName}-${uuid}`;

  const isValidWidget = !!widgetName.length && !!uuid.length;

  // biome-ignore lint/correctness/useExhaustiveDependencies: no deps
  useEffect(() => {
    if (!isValidWidget) {
      return;
    }

    if (refInitialized.current) {
      busDispatch('@@-widget-update', {
        widgetName,
        widgetProps,
        cacheKey,
      });
    }
  }, [widgetProps, uuid, widgetName, isValidWidget, cacheKey]);

  busSubscribe('@@-widgets-loaded', () => {
    refInitialized.current = true;
    busDispatch('@@-widget-create', {
      widgetName,
      widgetProps,
      cacheKey,
    });
  });

  if (!isValidWidget) {
    // biome-ignore lint/suspicious/noConsole: Intended debug output
    console.warn('Invalid widget!', widgetName);
    return null;
  }

  return (
    <MemoizedComponent
      name={widgetName}
      uuid={uuid}
    />
  );
};

/**
 * Props interface for renderWidget function
 * @interface IRenderWidgetProps
 * @property {string} name - The name of the widget to load
 * @property {string} [uuid] - Optional unique identifier for the widget
 * @property {HTMLElement} mountTo - DOM element where the widget should be mounted
 * @property {Object.<string, unknown>} widgetProps - Props to pass to the widget
 */
interface IRenderWidgetProps {
  name: string;
  uuid?: string;
  mountTo: HTMLElement;
  widgetProps?: {
    [key: string]: unknown;
  };
}

/**
 * Programmatically loads and mounts a widget into a specified DOM element
 * @function
 * @param {IRenderWidgetProps} widgetProps - Configuration options for loading the widget
 * @example
 * ```ts
 * renderWidget({
 *   widgetName: 'my-widget',
 *   uuid: 'group1',
 *   mountTo: document.getElementById('widget-container'),
 *   widgetProps: {
 *     color: 'blue',
 *     size: 'large'
 *   }
 * });
 * ```
 */
export const renderWidget = (props: IRenderWidgetProps) => {
  const {
    name: _widgetName,
    uuid: _uuid,
    mountTo,
    widgetProps,
  } = props;

  const uuid = _uuid?.trim() || crypto.randomUUID().replace(/-/g, '').slice(0, 6);
  const widgetName = _widgetName.trim().toLowerCase();
  const isValidWidget = !!widgetName.length && !!uuid.length;

  if (isValidWidget && mountTo && mountTo instanceof HTMLElement) {
    void (() => {
      createRoot(mountTo).render(
        <WidgetComponent
          name={widgetName}
          uuid={uuid}
          widgetProps={widgetProps}
        />,
      );
    })();
  }
};
