import test from "node:test";
import { ok, equal } from "node:assert/strict";

import { expectType } from "tsd";

import Future from "./index.js";

// The returned Future should inherit the Right and Left types from the FutureLike returned from a callback.
expectType<
  <K = never>(futureLike: Future.Like<string, K>) => Future.Self<boolean, K>
>(Future.map((value: string) => Future.of(value === "foo")));

// If error types are different, they have to be united.
expectType<
  (
    futureLike: Future.Like<number, { foo: string }>
  ) => Future.Self<string, Error | { foo: string }>
>(
  Future.map((value: number) =>
    Future.make<string, Error>((ok, err) =>
      Math.random() ? ok(String(value)) : err(new Error())
    )
  )<{ foo: string }>
);

// The returned Future should inherit the Right type from the PromiseLike returned from a callback and the Left type as unknown by default.
expectType<
  <K = unknown>(
    futureLike: PromiseLike<string>
  ) => Future.Self<boolean, unknown>
>(Future.map((value: string) => Promise.resolve(value === "foo")));

// User should be able to type the Left type manually if callback returns the PromiseLike.
expectType<
  <K = string>(
    promiseLike: PromiseLike<string>
  ) => Future.Self<boolean, string | K>
>(
  Future.map<string, boolean, string>((value: string) =>
    Promise.resolve(value === "foo")
  )
);

// If a callback returns non-thenable value, the returned FutureLike or PromiseLike accepts any Left type.
expectType<<A>(futureLike: Future.Like<number, A>) => Future.Self<number, A>>(
  Future.map((number: number) => number + 1)
);
expectType<<A>(futureLike: Future.Like<number, A>) => Future.Self<number, A>>(
  Future.map((number: number) => number + 1)
);

// Should unwrap the FutureLike or PromiseLike type if a callback returns mixed types.
expectType<
  <A>(futureLike: Future.Like<number, A>) => Future.Self<number | "foo", A>
>(Future.map((value: number) => (Math.random() ? value : Future.of("foo"))));
expectType<
  <A>(
    futureLike: Future.Like<number, A>
  ) => Future.Self<number | "foo", unknown>
>(
  Future.map((value: number) =>
    Math.random() ? value : Promise.resolve("foo")
  )
);

// If a callback returns a non-thenable and the PromiseLike, there should be ability to manually declare Left type.
expectType<
  <A>(
    futureLike: Future.Like<number, A>
  ) => Future.Self<number | string, A | boolean>
>(
  Future.map<number, number | Promise<string>, boolean>((value: number) =>
    Math.random() ? value + 1 : Promise.resolve("foo")
  )
);

// The returned Future should inherit the Right and Left types from the FutureLike returned from a callback.
expectType<Future.Self<boolean, never>>(
  Future.map(Future.of("baz"), (value) => Future.of(value === "baz"))
);

// The returned Future should inherit the Right type from the PromiseLike returned from a callback and the Left type as unknown by default.
expectType<Future.Self<boolean, unknown>>(
  Future.map(Promise.resolve("baz"), (value) =>
    Promise.resolve(value === "foo")
  )
);

// User should be able to type the Left type manually if callback returns the PromiseLike.
expectType<Future.Self<boolean, string>>(
  Future.map(Promise.resolve("foo"), (value) =>
    Promise.resolve(value === "foo")
  )
);

// If a callback returns non-thenable value, the returned FutureLike infers the Left type.
expectType<Future.Self<number, never>>(
  Future.map(Future.of(9), (number) => number + 1)
);

// If a callback returns non-thenable value, the returned PromiseLike accepts any Left type.
expectType<Future.Self<number, string>>(
  Future.map(Promise.resolve(10), (number) => number + 1)
);

// Should unwrap the FutureLike or PromiseLike type if a callback returns mixed types.
expectType<Future.Self<number | "foo", "bar">>(
  Future.map(
    Future.spawn<number, "bar">(() => {
      if (Math.random()) return 1;
      else throw "bar";
    }),
    (value) => (Math.random() ? value : Future.of("foo"))
  )
);
expectType<Future.Self<number | "foo", unknown>>(
  Future.map(Promise.resolve(10), (value) =>
    Math.random() ? value : Promise.resolve("foo")
  )
);

// If a callback returns a non-thenable and the PromiseLike, there should be ability to manually declare Left type.
expectType<Future.Self<number | string, boolean | "baz">>(
  Future.map<number, "baz", number | Promise<string>, boolean>(
    Promise.resolve(10),
    (value) => (Math.random() ? value + 1 : Promise.resolve("foo"))
  )
);

test("map function should transform a resolved value of the Future", async () => {
  const a = Future.map(Future.of(1), (n) => n + 1);

  return a.then((n) => equal(n, 2));
});

test("map function will unwrap a FutureLike returned by a callback", async () => {
  const a = Future.map(Future.of(1), (n) => Future.of(n + 1));

  return a.then((n) => equal(n, 2));
});

test("map function can accept the Future later and apply callback on it", async () => {
  const a = Future.map((n: number) => n + 1);

  ok(!Future.is(a));
  ok(typeof a === "function");

  return a(Future.of(1)).then((n) => equal(n, 2));
});
