import { expectAssignable, expectType } from "tsd";

import Future from "./index.d";

// FutureLike section
{
  const futureLike: Future.Like<string, TypeError> = Promise.resolve("");

  const promiseLike: PromiseLike<number> = Promise.resolve(8);

  // Expect the FutureLike is assignable to the PromiseLike.
  expectAssignable<PromiseLike<string>>(futureLike);

  // Expect the PromiseLike is assignable to the FutureLike.
  expectAssignable<Future.Like<number, Error>>(promiseLike);

  // Empty then should return of the same FutureLike type.
  expectType<Future.Like<string, TypeError>>(futureLike.then());

  // Expect the fulfilled type in the then method is the same as in the FutureLike.
  futureLike.then((value) => expectType<string>(value));

  // Expect the error type in the then is the same as in the FutureLike.
  futureLike.then(null, (error) => expectType<TypeError>(error));

  // Then with the onfulfilled parameter should return a new fulfilled type
  // and the same error type if the callback does not return the FutureLike.
  expectType<Future.Like<number, TypeError>>(futureLike.then(() => 8));

  // If the onrejected callback returns a non-PromiseLike value, inferred
  // error value should be "never".
  expectType<Future.Like<string, never>>(futureLike.then(null, () => ""));

  // The onrejected callback is allowed to return a different fulfilled
  // value from which the main FutureLike holds. The final type will be
  // the union of the new type and the futureLike's fulfilled type.
  expectType<Future.Like<string | number, never>>(
    futureLike.then(null, () => 4)
  );

  // then method is allowed to return different values from onfulfilled
  // and onrejected callbacks.
  expectType<Future.Like<boolean | string[], never>>(
    futureLike.then(
      () => false,
      () => [""]
    )
  );

  // Other variants of FutureLike's then method cannot be reliably tested
  // because error types has to be manually written to be strictly correct
  // as TypeScript cannot infer those types from PromiseLike for obvious reasons.
}

// Future section
{
  const promise: Promise<boolean> = Promise.resolve(true);

  const future: Future.Self<string, EvalError> = Promise.reject<string>();

  // Expect that Future is assignable to Promise.
  expectAssignable<Promise<string>>(future);

  // Expect that Promise is assignable to Future.
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
      future.then((value) => other(value))
    );
  }

  // If the onrejected callback does not return a Future, an error
  // type of the resulting Future has to be never.
  expectType<Future.Self<string, never>>(future.then(null, () => ""));

  // The onrejected callback may return another fulfilled type.
  expectType<Future.Self<string | boolean, never>>(future.then(null, () => false));

  {
    const other: Future.Self<boolean, SyntaxError> = Promise.resolve(true);

    // If the onrejected callback returns a Future, the resulting Future type
    // should inherit an error type of the callback's Future.
    expectType<Future.Self<string | boolean, SyntaxError>>(
      future.then(null, () => other)
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
        () => other2
      )
    );
  }

  // If both onfulfilled and onrejected callbacks do not return
  // futures, the resulting Future type should have an error type
  // as never.
  expectType<Future.Self<number | boolean, never>>(
    future.then(
      () => 3,
      () => false
    )
  );

  // Expect the resulting Future to have "any" as an error type
  // if the onfulfilled callback returns the Promise type.
  expectType<Future.Self<boolean, any>>(future.then(() => promise));

  // After manually providing an error type for the returned Promise type
  // from the onfulfilled callback, the resulting Future should have
  // the union error type.
  expectType<Future.Self<boolean, EvalError | MediaError>>(
    future.then<boolean, MediaError>(() => promise)
  );

  // Expect the Future type to have an error type as any if the onrejected
  // callback returns the raw Promise type.
  expectType<Future.Self<string | boolean, any>>(future.then(null, () => promise));

  // Expect the resulting Future to inherit the error type provided
  // manually for the Promise returned from the onrejected callback.
  expectType<Future.Self<string | boolean, ReferenceError>>(
    future.then<boolean, ReferenceError>(null, () => promise)
  );

  {
    const other = Promise.resolve([{}]);
    const other2 = Promise.resolve(4);

    // There should be ability to manually define all return types
    // for the onfulfilled and onrejected callbacks.
    expectType<Future.Self<number | {}[], MediaError | AggregateError>>(
      future.then<{}[], MediaError, number, AggregateError>(
        () => other,
        () => other2
      )
    );
  }

  // Expect the error type in the catch is the same as in the Future.
  future.catch((error) => expectType<EvalError>(error));

  // Expect the empty catch method to return the same Future type.
  expectType<Future.Self<string, EvalError>>(future.catch());

  // Expect the catch method to return Future with never as an error
  // type if the onrejected callback returns a non-Future value.
  expectType<Future.Self<string | number, never>>(future.catch(() => 8));

  {
    const other: Future.Self<string, MediaError> = Promise.resolve("");

    // Expect the resulting Future to inherit an error type from the Future
    // returned by the onrejected callback.
    expectType<Future.Self<string, MediaError>>(future.catch(() => other));
  }

  // Expect the Future to have an error type as any if onrejected callback
  // returns the Promise.
  expectType<Future.Self<string | boolean, any>>(future.catch(() => promise));

  // Manually provided error types should be included into the resulting
  // Future type if onrejected callback returns the Promise type.
  expectType<Future.Self<string | boolean, ReferenceError>>(
    future.catch<boolean, ReferenceError>(() => promise)
  );

  // Expect the finally method to return the same type of the
  // outer future even if the callback returns another.
  expectType<Future.Self<string, EvalError>>(
    future.finally(() =>
      future.then(
        () => 5,
        () => 1
      )
    )
  );
}
