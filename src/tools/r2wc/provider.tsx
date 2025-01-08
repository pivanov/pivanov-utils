import {
  cloneElement,
  useEffect,
  useState,
} from 'react';

import { busSubscribe } from '../eventBus';

import { generateSVGSpriteDomElement } from './utils';

import type {
  ReactElement,
  ReactNode,
} from 'react';
import type { IEventBusUpdateProps } from './types';

interface IR2WCProviderProps {
  container: HTMLElement;
  root: HTMLElement;
  children: ReactNode;
  svgSpritePath: string | undefined;
}

export const R2WCProvider = (props: IR2WCProviderProps) => {
  const {
    root,
    container,
    svgSpritePath,
    children,
  } = props;

  const [
    shouldRender,
    setShouldRender,
  ] = useState(false);

  const [
    childrenProps,
    setChildrenProps,
  ] = useState<IEventBusUpdateProps['message']>();

  // biome-ignore lint/correctness/useExhaustiveDependencies: no deps
  useEffect(() => {
    if (!svgSpritePath) {
      setShouldRender(true);
      return;
    }
    void generateSVGSpriteDomElement(svgSpritePath).then(async (svgElement) => {
      if (container && svgElement) {
        container.appendChild(svgElement);
      }
      setShouldRender(true);
    });
  }, []);

  busSubscribe<IEventBusUpdateProps>('@@-widget-update-props', (message) => {
    const { widgetProps, uuid } = message;
    if (root.uuid === uuid) {
      setChildrenProps(widgetProps as Record<string, unknown>);
    }
  });

  if (!shouldRender) {
    return null;
  }

  return cloneElement(children as ReactElement, {
    ...childrenProps,
    key: performance.now(),
  });
};
