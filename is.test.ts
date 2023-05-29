import test from "node:test";
import { ok } from "node:assert/strict";

import Future from "./index.js";

test("is function should return true for", async (context) => {
  await context.test("Promise", () => {
    ok(Future.is(Promise.resolve(7)));
  });

  await context.test("Future", () => {
    ok(Future.is(Future.of("")));
  });

  await context.test("thenable", () => {
    ok(
      Future.is({
        then(f: (value: boolean) => void) {
          f(false);
        },
      })
    );
  });
});

test("is function should return false for non thenable objects", () => {
  ok(!Future.is(8));
  ok(!Future.is([]));
  ok(!Future.is({}));
  ok(!Future.is(""));
  ok(!Future.is({ then: true }));
});
