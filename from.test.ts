import test from "node:test";
import { equal } from "node:assert/strict";

import Future from "./index.js";

test("from should create a Future", async (context) => {
  await context.test("resolved", async () => {
    const a = Future.from<9, never>((ok) => ok(9));

    return a.then((n) => equal(n, 9));
  });

  await context.test("rejected", async () => {
    const a = Future.from<never, 9>((_, fail) => fail(9));

    return a.catch((n) => equal(n, 9));
  });
});
