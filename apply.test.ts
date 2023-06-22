import test from "node:test";
import { equal } from "node:assert/strict";

import Future from "./index.js";

test("apply should call future's function over another future's value", async () => {
  const futureWithValue = Future.of(2);
  const futureWithFunction = Future.of((n: number) => n * 3);

  const result = Future.apply(futureWithValue, futureWithFunction);

  return result.then((num) => {
    equal(num, 6);
  });
});

test("apply with a single argument  should return a function", async () => {
  const futureWithValue = Future.of(2);
  const futureWithFunction = Future.of((n: number) => n * 3);

  const result = Future.apply(futureWithFunction);

  equal(typeof result, "function");

  return result(futureWithValue).then((num) => {
    equal(num, 6);
  });
});
