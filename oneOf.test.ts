import test from "node:test";
import { ok, equal, deepEqual } from "node:assert/strict";

import Future from "./index.js";

test("oneOf should return the result of first successfully fullfilled Future", async () => {
  const a = Future.oneOf(
    Future.make<string, never>((ok) => setTimeout(() => ok("foo"), 10)),
    Future.make<boolean, never>((ok) => setTimeout(() => ok(false), 20)),
    Future.fail(3)
  );

  return a.then((s) => equal(s, "foo"));
});

test("oneOf should return an array with errors if no Future is resolved successfully", async () => {
  const a = Future.oneOf(Future.fail(""), Future.fail(true), Future.fail(3));

  return a.catch((r) => deepEqual(r, ["", true, 3]));
});

test("a single array argument should be treated as a list of futures for the oneOf function", async () => {
  const a = Future.oneOf([
    Future.make<string, never>((ok) => setTimeout(() => ok("foo"), 10)),
    Future.make<boolean, never>((ok) => setTimeout(() => ok(false), 20)),
    Future.fail(3),
  ]);

  return a.then((s) => equal(s, "foo"));
});

test("a single iterable argument should be treated as a list of futures for the oneOf function", async () => {
  const foo = Object.assign(() => {}, {
    *[Symbol.iterator]() {
      yield* [
        Future.make<string, never>((ok) => setTimeout(() => ok("foo"), 10)),
        Future.make<boolean, never>((ok) => setTimeout(() => ok(false), 20)),
        Future.fail(3),
      ];
    },
  });

  const a = Future.oneOf(foo);

  return a.then((s) => equal(s, "foo"));
});

test("should treat an arrayLike as non-iterable value", async (t) => {
  const a = Future.oneOf({
    0: Future.of(""),
    1: Future.of(2),
    2: Future.of([true]),
    length: 3,
  });

  return a.then((result) => {
    equal(typeof result[0], "object");
    ok("length" in result);
    equal(result.length, 3);
    ok(Future.is(result[0]));
    ok(Future.is(result[1]));
    ok(Future.is(result[2]));
  });
});
