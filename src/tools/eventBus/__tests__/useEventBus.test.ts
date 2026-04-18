import { afterEach, describe, expect, it, mock } from "bun:test";
import { act, cleanup, renderHook } from "@testing-library/react";

import { busDispatch } from "../";
import type { TEventBusListener } from "../types";
import { useEventBus } from "../useEventBus";

describe("useEventBus", () => {
  afterEach(() => {
    cleanup();
  });

  it("subscribes and receives messages", () => {
    const listener = mock((_msg: unknown) => {});
    renderHook(() => useEventBus("hook-topic", listener));

    act(() => {
      busDispatch("hook-topic", { data: "test" });
    });

    expect(listener).toHaveBeenCalledWith({ data: "test" });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("ignores invalid inputs", () => {
    const listener = mock((_msg: unknown) => {});
    renderHook(() => useEventBus("", listener));
    renderHook(() => useEventBus("hook-topic", null as unknown as TEventBusListener<unknown>));

    act(() => {
      busDispatch("hook-topic", "test");
    });

    expect(listener).not.toHaveBeenCalled();
  });

  it("unsubscribes on unmount", () => {
    const listener = mock((_msg: unknown) => {});
    const { unmount } = renderHook(() => useEventBus("hook-topic", listener));
    unmount();

    act(() => {
      busDispatch("hook-topic", "test");
    });

    expect(listener).not.toHaveBeenCalled();
  });
});
