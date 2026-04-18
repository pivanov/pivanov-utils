# Event Bus

Type-safe pub/sub on top of `CustomEvent`. Import from `@pivanov/utils/tools` or `@pivanov/utils`.

::: info
The event bus dispatches through `window`. It only works in browser environments. For SSR/worker-safe cross-module messaging, an in-memory fallback is on the roadmap for a future minor release.
:::

## Dispatching & subscribing

### `busDispatch<T>(topic, message)`
Fires a message on `topic`. No-ops on empty topics.

### `busSubscribe<T>(topic, listener, options?)`
Registers a listener. Returns an unsubscribe function.

```ts
import { busDispatch, busSubscribe } from '@pivanov/utils/tools';

const unsubscribe = busSubscribe('user:logged-in', (user) => {
  console.log('welcome', user);
});

busDispatch('user:logged-in', { id: 1, name: 'Ada' });

// Clean up
unsubscribe();
```

### `busOnce<T>(topic, listener, options?)`
Same as `busSubscribe`, but auto-unsubscribes after the first fire.

```ts
import { busOnce } from '@pivanov/utils/tools';

busOnce('app:ready', () => startApp());
```

### Subscription options

```ts
busSubscribe('topic', handler, {
  onError: (err) => reportToSentry(err),
});
```

| Option | Effect |
|---|---|
| `onError(err)` | Called when the listener throws. Defaults to `console.error`. |

## Typing - single topic

```ts
import { busDispatch, busSubscribe, type IEventBus } from '@pivanov/utils/tools';

interface UserLoggedIn extends IEventBus<{ id: number; name: string }> {
  topic: 'user:logged-in';
}

busSubscribe<UserLoggedIn>('user:logged-in', (user) => {
  user.name; // typed: string
});

busDispatch<UserLoggedIn>('user:logged-in', { id: 1, name: 'Ada' });
```

## Typing - event map (recommended for large apps)

```ts
type AppEvents = {
  'user:login':    { id: number; name: string };
  'user:logout':   void;
  'notification':  { message: string; type: 'info' | 'error' };
};
```

Use a small adapter:

```ts
import { busDispatch, busSubscribe } from '@pivanov/utils/tools';
import type { IEventBus } from '@pivanov/utils/tools';

const dispatch = <K extends keyof AppEvents>(
  topic: K,
  message: AppEvents[K],
) => busDispatch<IEventBus<AppEvents[K]> & { topic: K }>(topic, message);

const subscribe = <K extends keyof AppEvents>(
  topic: K,
  listener: (message: AppEvents[K]) => void,
) => busSubscribe<IEventBus<AppEvents[K]> & { topic: K }>(topic, listener);

dispatch('user:login', { id: 1, name: 'Ada' });
subscribe('notification', (n) => console.log(n.type, n.message));
```

See the [Typed Events guide](/guides/typed-events) for more patterns.

## React: `useEventBus(topic, listener, deps?)`

A React hook that subscribes on mount and unsubscribes on unmount. Accepts a `deps` array like `useEffect`.

```tsx
import { useEventBus } from '@pivanov/utils/tools';

function Notifier() {
  const [count, setCount] = useState(0);

  useEventBus('notification', (n) => {
    setCount((c) => c + 1);
  }, [setCount]);

  return <Badge count={count} />;
}
```

## How it works

Under the hood, `busDispatch` fires a `CustomEvent` on `window` with a topic hashed into a salted name (e.g. `"3c8a9b::user:logged-in"`). This avoids accidental collisions with other libraries dispatching on `window`. `busSubscribe` registers a matching listener.

Dispatched events do bubble through the DOM - if you're using an overly broad `window` listener, you may see them. Hash-salting means normal string-topic listeners outside this library won't match.
