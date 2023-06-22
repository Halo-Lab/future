import test from "node:test";
import { ok, equal } from "node:assert/strict";

import Future from "./index.js";

test("first should return the result of first fullfilled Future", async (context) => {
  await context.test("resolved", async () => {
    const a = Future.first(
      Future.make<never, void>((_, err) => setTimeout(err, 10)),
      Future.of(3)
    );

    return a.then((n) => equal(n, 3));
  });

  await context.test("rejected", async () => {
    const a = Future.first(
      Future.make<string, never>((ok) => setTimeout(() => ok("foo"), 10)),
      Future.fail(3)
    );

    return a.catch((n) => equal(n, 3));
  });
});

test("a single array argument should be treated as a list of futures for the first function", async () => {
  const a = Future.first([Future.of(4), Future.of(3), Future.fail("foo")]);

  return a.then((n) => equal(n, 4));
});

test("should treat an arrayLike as non-iterable value", async (t) => {
  const a = Future.first({
    0: Future.of(""),
    1: Future.of(2),
    2: Future.of([true]),
    length: 3,
  });

  return a.then((result) => {
    equal(typeof result, "object");
    ok("length" in result);
    equal(result.length, 3);
    ok(Future.is(result[0]));
    ok(Future.is(result[1]));
    ok(Future.is(result[2]));
  });
});
