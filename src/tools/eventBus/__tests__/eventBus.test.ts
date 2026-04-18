import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";

import { busDispatch, busOnce, busSubscribe } from "../";
import type { TEventBusListener } from "../types";

describe("EventBus", () => {
  afterEach(() => {
    mock.restore();
  });

  it("calls listener when event is dispatched", () => {
    const listener = mock((_msg: unknown) => {});
    busSubscribe("test-topic", listener);
    busDispatch("test-topic", { data: "test" });
    expect(listener).toHaveBeenCalledWith({ data: "test" });
  });

  it("supports multiple listeners for the same topic", () => {
    const a = mock((_msg: unknown) => {});
    const b = mock((_msg: unknown) => {});
    busSubscribe("shared-topic", a);
    busSubscribe("shared-topic", b);
    busDispatch("shared-topic", "payload");
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it("isolates listeners per topic", () => {
    const a = mock((_msg: unknown) => {});
    const b = mock((_msg: unknown) => {});
    busSubscribe("topic-a", a);
    busSubscribe("topic-b", b);
    busDispatch("topic-a", "data");
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).not.toHaveBeenCalled();
  });

  it("unsubscribes via returned function", () => {
    const listener = mock((_msg: unknown) => {});
    const unsubscribe = busSubscribe("unsub-topic", listener);
    busDispatch("unsub-topic", "first");
    unsubscribe();
    busDispatch("unsub-topic", "second");
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith("first");
  });

  it("keeps other listeners alive when one throws", () => {
    const consoleSpy = spyOn(console, "error").mockImplementation(() => {});
    const bad = mock(() => {
      throw new Error("Listener error");
    });
    const good = mock((_msg: unknown) => {});
    busSubscribe("error-topic", bad);
    busSubscribe("error-topic", good);
    busDispatch("error-topic", { data: "x" });
    expect(bad).toHaveBeenCalledTimes(1);
    expect(good).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("no-ops on empty topics", () => {
    const listener = mock((_msg: unknown) => {});
    busDispatch("", "data");
    expect(listener).not.toHaveBeenCalled();

    const unsubscribe = busSubscribe("", null as unknown as TEventBusListener<unknown>);
    expect(() => unsubscribe()).not.toThrow();
  });

  it("ignores non-CustomEvents dispatched under the hashed topic", () => {
    const listener = mock((_msg: unknown) => {});
    const addSpy = spyOn(window, "addEventListener");
    busSubscribe("raw-topic", listener);
    const [hashedTopic, handler] = addSpy.mock.calls.at(-1) as [string, EventListener];
    handler(new Event(hashedTopic));
    expect(listener).not.toHaveBeenCalled();
    addSpy.mockRestore();
  });

  it("handles unicode topics", () => {
    const listener = mock((_msg: unknown) => {});
    const topic = "🚀 special → characters ←";
    busSubscribe(topic, listener);
    busDispatch(topic, "hello");
    expect(listener).toHaveBeenCalledWith("hello");
  });

  it("custom onError overrides default logging", () => {
    const onError = mock((_e: unknown) => {});
    const bad = mock(() => {
      throw new Error("bad");
    });
    busSubscribe("err-topic", bad, { onError });
    busDispatch("err-topic", 1);
    expect(onError).toHaveBeenCalled();
  });

  describe("busOnce", () => {
    it("fires once then auto-unsubscribes", () => {
      const listener = mock((_msg: unknown) => {});
      busOnce("once-topic", listener);
      busDispatch("once-topic", "a");
      busDispatch("once-topic", "b");
      busDispatch("once-topic", "c");
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith("a");
    });

    it("can be cancelled before firing", () => {
      const listener = mock((_msg: unknown) => {});
      const unsubscribe = busOnce("once-topic-2", listener);
      unsubscribe();
      busDispatch("once-topic-2", "x");
      expect(listener).not.toHaveBeenCalled();
    });

    it("returns a no-op for empty topic or invalid listener", () => {
      const noop1 = busOnce("", () => {});
      const noop2 = busOnce("x", null as unknown as TEventBusListener<unknown>);
      expect(() => noop1()).not.toThrow();
      expect(() => noop2()).not.toThrow();
    });
  });
});
