import { expectAssignable, expectNotAssignable, expectType } from "tsd";

import Future from "./index.js";

const promise: Promise<boolean> = Promise.resolve(true);

const future: Future.Self<string, EvalError> = Promise.reject<string>();

// Expect the future with different resolved type than Promise is not assignable to the latter.
expectNotAssignable<Promise<boolean>>(future);

// Expect the promise with different resolved type than Future is not assignable to the latter.
expectNotAssignable<Future.Self<number, string>>(promise);

// Expect the Future is assignable to Promise.
expectAssignable<Promise<string>>(future);

// Expect the Promise is assignable to Future.
expectAssignable<Future.Self<boolean, Error>>(promise);

// Expect the empty then method returns the same type.
expectType<Future.Self<string, EvalError>>(future.then());

// Expect the fulfilled type in the then method is the same as in the Future.
future.then((value) => expectType<string>(value));

// Expect the error type in the then is the same as in the Future.
future.then(null, (error) => expectType<EvalError>(error));

// The onfulfilled callback should return the Future with another
// fulfilled type but the same error type.
expectType<Future.Self<number, EvalError>>(future.then(() => 4));

{
  const other = <A>(value: A): Future.Self<A, SyntaxError> =>
    Promise.resolve(value);

  // Expect the resulting Future to inherit an error type
  // from the returned Future of the onfulfilled callback.
  expectType<Future.Self<string, EvalError | SyntaxError>>(
    future.then((value) => other(value)),
  );
}

// If the onrejected callback does not return a Future, an error
// type of the resulting Future has to be never.
expectType<Future.Self<string, never>>(future.then(null, () => ""));

// The onrejected callback may return another fulfilled type.
expectType<Future.Self<string | boolean, never>>(
  future.then(null, () => false),
);

{
  const other: Future.Self<boolean, SyntaxError> = Promise.resolve(true);

  // If the onrejected callback returns a Future, the resulting Future type
  // should inherit an error type of the callback's Future.
  expectType<Future.Self<string | boolean, SyntaxError>>(
    future.then(null, () => other),
  );
}

{
  const other: Future.Self<string[], TypeError> = Promise.resolve([]);
  const other2: Future.Self<number, RangeError> = Promise.resolve(7);

  // The onfulfilled and onrejected callback should be able to
  // return Futures with different error and fulfilled types.
  expectType<Future.Self<number | string[], TypeError | RangeError>>(
    future.then(
      () => other,
      () => other2,
    ),
  );
}

// If both onfulfilled and onrejected callbacks do not return
// futures, the resulting Future type should have an error type
// as never.
expectType<Future.Self<number | boolean, never>>(
  future.then(
    () => 3,
    () => false,
  ),
);

// Expect the resulting Future to have "unknown" as an error type
// if the onfulfilled callback returns the Promise type.
expectType<Future.Self<boolean, unknown>>(future.then(() => promise));

// After manually providing an error type for the returned Promise type
// from the onfulfilled callback, the resulting Future should have
// the union error type.
expectType<Future.Self<boolean, EvalError | MediaError>>(
  future.then<boolean, MediaError>(() => promise),
);

// Expect the Future type to have an error type as "unknown" if the onrejected
// callback returns the raw Promise type.
expectType<Future.Self<string | boolean, unknown>>(
  future.then(null, () => promise),
);

// Expect the resulting Future to inherit the error type provided
// manually for the Promise returned from the onrejected callback.
expectType<Future.Self<string | boolean, ReferenceError>>(
  future.then<boolean, ReferenceError>(null, () => promise),
);

{
  const other = Promise.resolve([{}]);
  const other2 = Promise.resolve(4);

  // There should be ability to manually define all return types
  // for the onfulfilled and onrejected callbacks.
  expectType<Future.Self<number | {}[], MediaError | AggregateError>>(
    future.then<{}[], MediaError, number, AggregateError>(
      () => other,
      () => other2,
    ),
  );
}

// Expect the error type in the catch is the same as in the Future.
future.catch((error) => expectType<EvalError>(error));

// Expect the empty catch method to return the same Future type.
expectType<Future.Self<string, EvalError>>(future.catch());

// Expect the catch method to return Future with "never" as an error
// type if the onrejected callback returns a non-Future value.
expectType<Future.Self<string | number, never>>(future.catch(() => 8));

{
  const other: Future.Self<string, MediaError> = Promise.resolve("");

  // Expect the resulting Future to inherit an error type from the Future
  // returned by the onrejected callback.
  expectType<Future.Self<string, MediaError>>(future.catch(() => other));
}

// Expect the Future to have an error type as "unknown" if onrejected callback
// returns the Promise.
expectType<Future.Self<string | boolean, unknown>>(future.catch(() => promise));

// Manually provided error types should be included into the resulting
// Future type if onrejected callback returns the Promise type.
expectType<Future.Self<string | boolean, ReferenceError>>(
  future.catch<boolean, ReferenceError>(() => promise),
);

// Expect the finally method to return the the same type
// if callback returns a FutureLike that never throws.
expectType<Future.Self<string, EvalError>>(
  future.finally(() =>
    future.then(
      () => 5,
      () => 1,
    ),
  ),
);

{
  const future2: Future.Self<number, boolean> = Promise.resolve(1);

  // Expect the finally method to return the future which inherits
  // an error type from the callback's FutureLike.
  expectType<Future.Self<string, EvalError | boolean>>(
    future.finally(() => future2),
  );
}

{
  const future2 = future.finally(() => Promise.resolve(false));

  // PromiseLike transform an error type into unknown by default.
  expectType<Future.Self<string, unknown>>(future2);
}

{
  const future2 = future.finally<boolean, string>(() => Promise.resolve(false));

  // If callback returns a PromiseLike the error type can be narrowed manually.
  expectType<Future.Self<string, EvalError | string>>(future2);
}

// Expect the finally to return the same type if callback does not return thenables.
expectType<Future.Self<string, EvalError>>(future.finally(() => 8));

// Expect the finally to inherit the error type of all FutureLikes if a callback
// returns mixed types.
expectType<Future.Self<string, EvalError | "bar">>(
  future.finally(() => (Math.random() ? 8 : Future.fail("bar"))),
);

// Expect the finally to receive the unknown type as an error type if a callback
// returns mixed types and at least one of them is PromiseLike.
expectType<Future.Self<string, unknown>>(
  future.finally(() => (Math.random() ? 8 : Promise.resolve("bar"))),
);

// User should be able to set error type manually if a callback
// returns mixed types and at least one of them is PromiseLike.
expectType<Future.Self<string, EvalError | string>>(
  future.finally(() => (Math.random() ? 8 : Promise.resolve("bar"))),
);
