import test from "node:test";
import { ok, equal, deepEqual } from "node:assert/strict";

import Future from "./index.js";

test("settle should return the result of all fullfilled Futures", async () => {
  const a = Future.settle(
    Future.make<string, never>((ok) => setTimeout(() => ok("foo"), 10)),
    Future.make<boolean, never>((ok) => setTimeout(() => ok(false), 20)),
    Future.fail(3)
  );

  return a.then((r) =>
    deepEqual(r, [{ ok: "foo" }, { ok: false }, { err: 3 }])
  );
});

test("a single array argument should be treated as a list of futures for the settle function", async () => {
  const a = Future.settle([
    Future.make<string, never>((ok) => setTimeout(() => ok("foo"), 10)),
    Future.make<boolean, never>((ok) => setTimeout(() => ok(false), 20)),
    Future.fail(3),
  ]);

  return a.then((r) =>
    deepEqual(r, [{ ok: "foo" }, { ok: false }, { err: 3 }])
  );
});

test("a single iterable argument should be treated as a list of futures for the settle function", async () => {
  const foo = Object.assign(() => {}, {
    *[Symbol.iterator]() {
      yield* [
        Future.make<string, never>((ok) => setTimeout(() => ok("foo"), 10)),
        Future.make<boolean, never>((ok) => setTimeout(() => ok(false), 20)),
        Future.fail(3),
      ];
    },
  });

  const a = Future.settle(foo);

  return a.then((r) =>
    deepEqual(r, [{ ok: "foo" }, { ok: false }, { err: 3 }])
  );
});

test("should treat an arrayLike as non-iterable value", async () => {
  const a = Future.settle({
    0: Future.of(""),
    1: Future.of(2),
    2: Future.of([true]),
    length: 3,
  });

  return a.then((result) => {
    ok(Array.isArray(result));
    equal(result.length, 1);
    equal(typeof result[0].ok, "object");
    ok("length" in result[0].ok);
    equal(result[0].ok.length, 3);
    ok(Future.is(result[0].ok[0]));
    ok(Future.is(result[0].ok[1]));
    ok(Future.is(result[0].ok[2]));
  });
});
