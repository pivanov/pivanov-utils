import { GlobalRegistrator } from "@happy-dom/global-registrator";

if (typeof window === "undefined") {
  GlobalRegistrator.register();
}

import { bench, group, summary } from "mitata";

import { busDispatch, busSubscribe } from "../src/tools/eventBus";

const subscribeN = (topic: string, n: number): Array<() => void> => {
  const unsubs: Array<() => void> = [];
  for (let i = 0; i < n; i++) {
    unsubs.push(busSubscribe(topic, () => {}));
  }
  return unsubs;
};

group("busDispatch:no listeners", () => {
  summary(() => {
    bench("dispatch", () => busDispatch("empty-topic", { data: "x" }));
  });
});

group("busDispatch:10 listeners", () => {
  const unsubs = subscribeN("bench-10", 10);
  summary(() => {
    bench("dispatch", () => busDispatch("bench-10", { data: "x" }));
  });
  for (const u of unsubs) {
    u();
  }
});

group("busDispatch:100 listeners", () => {
  const unsubs = subscribeN("bench-100", 100);
  summary(() => {
    bench("dispatch", () => busDispatch("bench-100", { data: "x" }));
  });
  for (const u of unsubs) {
    u();
  }
});

group("busSubscribe / unsubscribe cycle", () => {
  summary(() => {
    bench("subscribe+unsubscribe", () => {
      const u = busSubscribe("cycle-topic", () => {});
      u();
    });
  });
});
