import test from "node:test";
import { ok, equal } from "node:assert/strict";

import { expectNotType, expectType } from "tsd";

import Future from "./index.js";

// mapErr should transform one error type into another.
expectType<<T>(futureLike: Future.Like<T, number>) => Future.Self<T, string>>(
  Future.mapErr((value: number) => String(value))
);

// mapErr should convert the Right value of the returned future into the Left value.
expectType<
  <T>(futureLike: Future.Like<T, number>) => Future.Self<T, number | string>
>(
  Future.mapErr((value: number) =>
    Future.of<number, string>(Promise.resolve(value))
  )
);
expectType<<T>(futureLike: Future.Like<T, number>) => Future.Self<T, unknown>>(
  Future.mapErr((value: number) => Promise.resolve(value))
);
expectType<Future.Self<boolean, unknown>>(
  Future.mapErr(Future.of(false), (value: number) => Promise.resolve(value))
);
expectType<Future.Self<boolean, unknown>>(
  Future.mapErr(Promise.resolve(false), (value: number) =>
    Promise.resolve(value)
  )
);

// PromiseLike should invalidate the error type and set it as unknown.
expectNotType<
  <T>(futureLike: Future.Like<T, number>) => Future.Self<T, number | string>
>(Future.mapErr((value: number) => Promise.resolve(value)));
expectNotType<Future.Self<boolean, number | boolean>>(
  Future.mapErr(Future.of(false), (value: number) => Promise.resolve(value))
);

test("mapErr function should transform an error of the Future into another error", async () => {
  const a = Future.mapErr(Future.fail(1), (n) => n + 1);

  return a.catch((n) => equal(n, 2));
});

test("mapErr function will unwrap and reject a FutureLike returned by a callback", async () => {
  const a = Future.mapErr(Future.fail(1), (n) => Future.of(n + 1));

  return a.catch((n) => equal(n, 2));
});

test("mapErr function can accept the Future later and apply callback on it", async () => {
  const a = Future.mapErr((n: number) => n + 1);

  ok(!Future.is(a));
  ok(typeof a === "function");

  return a(Future.fail(1)).catch((n) => equal(n, 2));
});
