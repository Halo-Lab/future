import test from "node:test";
import { ok, equal, deepEqual } from "node:assert/strict";

import Future from "./index.js";

test("merge should accept variable amount of agruments", async () => {
  const a = Future.merge(Future.of(""), Future.of(2), Future.of([true]));

  return a.then((result) => {
    ok(Array.isArray(result));
    deepEqual(result, ["", 2, [true]]);
  });
});

test("merge should reject if one of futures rejects", async () => {
  const a = Future.merge(Future.of(""), Future.fail(2), Future.of([true]));

  return a.catch((result) => {
    equal(result, 2);
  });
});

test("a single array argument should be treated as a list of futures for the merge", async () => {
  const a = Future.merge([Future.of(""), Future.of(2), Future.of([true])]);

  return a.then((result) => {
    deepEqual(result, ["", 2, [true]]);
  });
});

test("should treat an arrayLike as non-iterable value", async (t) => {
  const a = Future.merge({
    0: Future.of(""),
    1: Future.of(2),
    2: Future.of([true]),
    length: 3,
  });

  return a.then((result) => {
    ok(Array.isArray(result));
    equal(result.length, 1);
    equal(typeof result[0], "object");
    ok("length" in result[0]);
    equal(result[0].length, 3);
    ok(Future.is(result[0][0]));
    ok(Future.is(result[0][1]));
    ok(Future.is(result[0][2]));
  });
});
