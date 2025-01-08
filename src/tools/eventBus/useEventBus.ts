import {
  type DependencyList,
  useEffect,
} from 'react';

import { busSubscribe } from './eventBus';

import type {
  IEventBus,
  TEventBusListener,
} from './types';

export const useEventBus = <T extends IEventBus>(
  topic: T['topic'],
  listener: TEventBusListener<T['message']>,
  deps: DependencyList = [],
): void => {
  useEffect(() => {
    if (!topic || typeof listener !== 'function') return;
    return busSubscribe<T>(topic, listener);
  }, [topic, listener, ...deps]);
};
