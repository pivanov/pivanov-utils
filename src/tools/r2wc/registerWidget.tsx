import type { ComponentType } from 'react';

import { r2wc } from './core';
import { R2WCProvider } from './provider';

import type { IR2WCBaseProps } from './types';

interface IRegisterWidgetProps<T> {
  name: string;
  styles?: string[];
  component: ComponentType<T>;
  svgSpritePath?: string;
}

export const registerWidget = <T extends object>(
  props: IRegisterWidgetProps<T>,
) => {
  const { name, styles, component: Component, svgSpritePath } = props;

  const widget = (
    compProps: T & { root: HTMLElement; container: HTMLElement },
  ) => {
    const { root, container, ...rest } = compProps;

    return (
      <R2WCProvider
        container={container}
        root={root}
        svgSpritePath={svgSpritePath}
      >
        <Component {...(rest as T)} name={name} />
      </R2WCProvider>
    );
  };

  return r2wc(
    `widget-${name}`,
    widget as ComponentType<IR2WCBaseProps>,
    { shadow: 'open' },
    styles,
  );
};
