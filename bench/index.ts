import { run } from "mitata";

import "./deep-clone.bench";
import "./is-equal.bench";
import "./object.bench";
import "./string.bench";
import "./event-bus.bench";

await run();
