import { expectAssignable, expectType } from "tsd";

import ".";

const futureLike: FutureLike<string, TypeError> = Promise.resolve("");

const promiseLike: PromiseLike<number> = Promise.resolve(8);

// Expect that FutureLike is assignable to PromiseLike.
expectAssignable<PromiseLike<string>>(futureLike);

// Expect that PromiseLike is assignable to FutureLike.
expectAssignable<FutureLike<number, Error>>(promiseLike);

const promise: Promise<boolean> = Promise.resolve(true);

const future: Future<string, EvalError> = Promise.reject<string>();

// Expect the empty then method of the Future returns the same type.
expectType<typeof future>(future.then());

// Expect the then method of the Future inherits a return type.
expectType<Future<number, EvalError>>(future.then(() => 4));

// Expect that Future is assignable to Promise.
expectAssignable<Promise<string>>(future);

// Expect that Promise is assignable to Future.
expectAssignable<Future<boolean, Error>>(promise);

// Expect the success type in the then method is the same as in the Future.
future.then((value) => expectType<string>(value));

// Expect the error type in the then is the same as in the Future.
future.then(null, (error) => expectType<EvalError>(error));

// Expect the error type in the catch is the same as in the Future.
future.catch((error) => expectType<EvalError>(error));

// Expect finally to preserve the success and error type of the
// outer future even if the callback returns another.
expectType<Future<string, EvalError>>(
  future.finally(() => future.then(() => 5))
);

// Expect a new Future inherit the error type of the previous future
// if there is no onrejected callback.
expectType<Future<number, EvalError>>(future.then((value) => Number(value)));

// Expect the then method of the Future inherits a success type of the Promise.
//
// Unfortunately promise variable is inferred as Future<boolean, any>, because
// it cannot infer the error type from outer future, so strict comparison fails.
expectAssignable<Future<boolean, EvalError>>(future.then(() => promise));

// Expect the new Future to inherit types of the returned future.
expectType<Future<boolean, TypeError>>(
  future.then(() => future.then<boolean, TypeError>(() => false))
);
