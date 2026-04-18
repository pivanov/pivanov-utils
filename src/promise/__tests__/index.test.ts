import { describe, expect, it } from "bun:test";

import { defer, parallelLimit, retry, sleep, timeout } from "../";

describe("sleep", () => {
  it("resolves after the specified time", async () => {
    const start = performance.now();
    await sleep(20);
    expect(performance.now() - start).toBeGreaterThanOrEqual(15);
  });

  it("resolves to undefined", async () => {
    await expect(sleep(1)).resolves.toBeUndefined();
  });

  it("rejects immediately when signal is already aborted", async () => {
    const ctrl = new AbortController();
    ctrl.abort(new Error("already"));
    await expect(sleep(1000, ctrl.signal)).rejects.toThrow("already");
  });

  it("rejects with signal.reason when aborted mid-flight", async () => {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(new Error("cancelled")), 5);
    await expect(sleep(500, ctrl.signal)).rejects.toThrow("cancelled");
  });
});

describe("timeout", () => {
  it("resolves when promise beats the timer", async () => {
    await expect(timeout(Promise.resolve(42), 100)).resolves.toBe(42);
  });

  it("rejects with default error when timer wins", async () => {
    await expect(timeout(new Promise(() => {}), 10)).rejects.toThrow(/timed out/);
  });

  it("rejects with custom reason", async () => {
    await expect(timeout(new Promise(() => {}), 10, new Error("custom"))).rejects.toThrow("custom");
  });

  it("propagates inner rejection", async () => {
    await expect(timeout(Promise.reject(new Error("boom")), 100)).rejects.toThrow("boom");
  });
});

describe("retry", () => {
  it("returns first success", async () => {
    let calls = 0;
    const result = await retry(async () => {
      calls++;
      return "ok";
    });
    expect(result).toBe("ok");
    expect(calls).toBe(1);
  });

  it("retries on rejection up to attempts", async () => {
    let calls = 0;
    await expect(
      retry(
        async () => {
          calls++;
          throw new Error("fail");
        },
        { attempts: 3 },
      ),
    ).rejects.toThrow("fail");
    expect(calls).toBe(3);
  });

  it("resolves on a later attempt", async () => {
    let calls = 0;
    const result = await retry(
      async () => {
        calls++;
        if (calls < 3) {
          throw new Error("not yet");
        }
        return "done";
      },
      { attempts: 5 },
    );
    expect(result).toBe("done");
    expect(calls).toBe(3);
  });

  it("respects fixed backoff", async () => {
    const start = performance.now();
    await expect(
      retry(
        async () => {
          throw new Error("x");
        },
        { attempts: 3, backoff: 20 },
      ),
    ).rejects.toThrow("x");
    expect(performance.now() - start).toBeGreaterThanOrEqual(30); // 2 waits
  });

  it("supports functional backoff", async () => {
    const waits: number[] = [];
    await expect(
      retry(
        async () => {
          throw new Error("x");
        },
        {
          attempts: 3,
          backoff: (n) => {
            waits.push(n);
            return 1;
          },
        },
      ),
    ).rejects.toThrow("x");
    expect(waits).toEqual([1, 2]);
  });

  it("aborts on signal", async () => {
    const ctrl = new AbortController();
    ctrl.abort(new Error("stop"));
    await expect(retry(async () => "ok", { signal: ctrl.signal })).rejects.toThrow("stop");
  });

  it("stops retrying when shouldRetry returns false", async () => {
    let calls = 0;
    await expect(
      retry(
        async () => {
          calls++;
          throw new Error("nope");
        },
        {
          attempts: 5,
          shouldRetry: () => calls < 2,
        },
      ),
    ).rejects.toThrow("nope");
    expect(calls).toBe(2);
  });
});

describe("defer", () => {
  it("resolves externally", async () => {
    const d = defer<number>();
    setTimeout(() => d.resolve(7), 1);
    await expect(d.promise).resolves.toBe(7);
  });

  it("rejects externally", async () => {
    const d = defer<number>();
    setTimeout(() => d.reject(new Error("nope")), 1);
    await expect(d.promise).rejects.toThrow("nope");
  });
});

describe("parallelLimit", () => {
  it("preserves input order", async () => {
    const items = [10, 20, 30, 40, 50];
    const result = await parallelLimit(items, 2, async (n) => {
      await sleep(1);
      return n * 2;
    });
    expect(result).toEqual([20, 40, 60, 80, 100]);
  });

  it("bounds concurrency", async () => {
    let current = 0;
    let peak = 0;
    await parallelLimit([1, 2, 3, 4, 5, 6], 2, async () => {
      current++;
      peak = Math.max(peak, current);
      await sleep(5);
      current--;
    });
    expect(peak).toBe(2);
  });

  it("passes index", async () => {
    const result = await parallelLimit(["a", "b", "c"], 2, (item, i) => `${item}:${i}`);
    expect(result).toEqual(["a:0", "b:1", "c:2"]);
  });

  it("throws on non-positive concurrency", () => {
    expect(() => parallelLimit([1], 0, async (x) => x)).toThrow(/concurrency must be >= 1/);
  });

  it("empty input returns empty array", async () => {
    expect(await parallelLimit([], 5, async (x) => x)).toEqual([]);
  });
});
