# Typed Events

The event bus supports two typing styles. Pick whichever scales with your app.

## Single-topic interface (simple apps)

For a handful of events, declare one interface per topic:

```ts
import { busSubscribe, busDispatch, type IEventBus } from '@pivanov/utils/tools';

interface UserLoggedIn extends IEventBus<{ id: number; name: string }> {
  topic: 'user:logged-in';
}

busSubscribe<UserLoggedIn>('user:logged-in', (user) => {
  user.name; // typed: string
});

busDispatch<UserLoggedIn>('user:logged-in', { id: 1, name: 'Ada' });
```

## Event-map pattern (larger apps)

When you have more than a handful of events, a single map plus thin adapters keeps things clean:

```ts
// events.ts - single source of truth
type AppEvents = {
  'user:login':         { id: number; name: string };
  'user:logout':        void;
  'notification':       { message: string; type: 'info' | 'error' };
  'cart:item-added':    { productId: string; qty: number };
  'cart:cleared':       void;
};

// bus.ts - typed adapters
import { busDispatch, busSubscribe, busOnce } from '@pivanov/utils/tools';
import type { IEventBus } from '@pivanov/utils/tools';

type Event<K extends keyof AppEvents> = IEventBus<AppEvents[K]> & { topic: K };

export const dispatch = <K extends keyof AppEvents>(
  topic: K,
  message: AppEvents[K],
) => busDispatch<Event<K>>(topic, message);

export const subscribe = <K extends keyof AppEvents>(
  topic: K,
  listener: (message: AppEvents[K]) => void,
) => busSubscribe<Event<K>>(topic, listener);

export const once = <K extends keyof AppEvents>(
  topic: K,
  listener: (message: AppEvents[K]) => void,
) => busOnce<Event<K>>(topic, listener);
```

Usage is tight:

```ts
import { dispatch, subscribe } from './bus';

dispatch('user:login', { id: 1, name: 'Ada' });
// dispatch('user:login', { nope: true }); // compile error

subscribe('notification', (n) => {
  // n: { message: string; type: 'info' | 'error' }
  console.log(n.type, n.message);
});
```

## React hook with types

```tsx
import { useEventBus } from '@pivanov/utils/tools';
import type { IEventBus } from '@pivanov/utils/tools';

type Event<K extends keyof AppEvents> = IEventBus<AppEvents[K]> & { topic: K };

function Badge() {
  const [count, setCount] = useState(0);
  useEventBus<Event<'notification'>>('notification', (n) => {
    setCount((c) => c + 1);
  });
  return <span>{count}</span>;
}
```

## Error handling

Listeners that throw don't take down other listeners. By default the bus logs via `console.error`. Override with an `onError` handler:

```ts
busSubscribe('payment:failed', onPaymentFailed, {
  onError: (err) => reportToSentry(err),
});
```
