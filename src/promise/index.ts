/**
 * Asynchronously waits for the specified number of milliseconds.
 *
 * Accepts an optional `AbortSignal` - when the signal aborts, the returned
 * promise rejects with the signal's `reason` and the pending timer is cleared.
 *
 * @example
 * ```ts
 * await sleep(1000);
 *
 * const ctrl = new AbortController();
 * setTimeout(() => ctrl.abort(), 50);
 * await sleep(1000, ctrl.signal); // rejects after 50ms
 * ```
 */
export const sleep = (ms: number, signal?: AbortSignal): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    const onAbort = (): void => {
      clearTimeout(timer);
      reject(signal?.reason);
    };

    signal?.addEventListener("abort", onAbort, { once: true });
  });
};

/**
 * Races a promise against a timeout. Rejects with the given reason (or a
 * default `TimeoutError`) if the promise doesn't settle in time.
 *
 * @example
 * ```ts
 * await timeout(fetch('/slow'), 3000);
 * await timeout(work(), 5000, new Error('took too long'));
 * ```
 */
export const timeout = <T>(promise: Promise<T>, ms: number, reason?: unknown): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(reason ?? new Error(`Operation timed out after ${ms}ms`));
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
};

interface IRetryOptions {
  /** Maximum number of attempts (including the first). Default: 3. */
  attempts?: number;
  /** Milliseconds to wait between attempts. Can be a fixed number or a function
   *  `(attempt) => ms` where attempt is 1-indexed. Default: 0 (no delay). */
  backoff?: number | ((attempt: number) => number);
  /** Cancels in-flight retries. */
  signal?: AbortSignal;
  /** Optional predicate - return false to abort retrying for a given error. */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

/**
 * Runs `fn` and retries on rejection up to `attempts` times with optional
 * backoff. Re-throws the last error if all attempts fail.
 *
 * @example
 * ```ts
 * await retry(() => fetch('/api'), { attempts: 3, backoff: 500 });
 * await retry(work, {
 *   attempts: 5,
 *   backoff: (n) => 100 * 2 ** n, // exponential
 * });
 * ```
 */
export const retry = async <T>(fn: (attempt: number) => Promise<T> | T, options: IRetryOptions = {}): Promise<T> => {
  const { attempts = 3, backoff = 0, signal, shouldRetry } = options;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    if (signal?.aborted) {
      throw signal.reason;
    }
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      if (attempt >= attempts) {
        break;
      }
      if (shouldRetry && !shouldRetry(error, attempt)) {
        break;
      }
      const delay = typeof backoff === "function" ? backoff(attempt) : backoff;
      if (delay > 0) {
        await sleep(delay, signal);
      }
    }
  }

  throw lastError;
};

interface IDeferred<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
}

/**
 * Creates an externally-resolvable promise. Equivalent to `Promise.withResolvers`
 * (ES2024) but works in older runtimes.
 *
 * @example
 * ```ts
 * const { promise, resolve } = defer<string>();
 * setTimeout(() => resolve('hi'), 100);
 * const value = await promise;
 * ```
 */
export const defer = <T>(): IDeferred<T> => {
  let resolve!: IDeferred<T>["resolve"];
  let reject!: IDeferred<T>["reject"];
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

/**
 * Maps `items` through `fn` with bounded concurrency. Results preserve input
 * order. If any task rejects, the returned promise rejects as soon as that
 * error surfaces (but already-started tasks continue running).
 *
 * @example
 * ```ts
 * const bodies = await parallelLimit(urls, 4, (url) => fetch(url));
 * ```
 */
export const parallelLimit = async <T, R>(items: readonly T[], concurrency: number, fn: (item: T, index: number) => Promise<R> | R): Promise<R[]> => {
  if (concurrency < 1) {
    throw new Error("parallelLimit: concurrency must be >= 1");
  }
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  const worker = async (): Promise<void> => {
    while (true) {
      const index = nextIndex++;
      if (index >= items.length) {
        return;
      }
      results[index] = await fn(items[index], index);
    }
  };

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, worker);
  await Promise.all(workers);
  return results;
};
