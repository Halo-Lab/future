import { expectAssignable, expectNotAssignable, expectType } from "tsd"

import Future from "./index.js"

const futureLike: Future.Like<string, TypeError> = Promise.resolve("")

const promiseLike: PromiseLike<number> = Promise.resolve(8)

// Expect the FutureLike is not assignable to the PromiseLike with different resolved type.
expectNotAssignable<PromiseLike<boolean>>(futureLike)

// Expect the PromiseLike is not assignable to the FutureLike with different resolved type.
expectNotAssignable<Future.Like<readonly number[], string>>(promiseLike)

// Expect the FutureLike is assignable to the PromiseLike with the same resolved type.
expectAssignable<PromiseLike<string>>(futureLike)

// Expect the PromiseLike is assignable to the FutureLike with the same resolved type.
expectAssignable<Future.Like<number, Error>>(promiseLike)

// Empty then should return of the same FutureLike type.
expectType<Future.Like<string, TypeError>>(futureLike.then())

// Expect the fulfilled type in the then method is the same as in the FutureLike.
futureLike.then((value) => expectType<string>(value))

// Expect the error type in the then is the same as in the FutureLike.
futureLike.then(null, (error) => expectType<TypeError>(error))

// Then with the onfulfilled parameter should return a new fulfilled type
// and the same error type if the callback does not return the FutureLike.
expectType<Future.Like<number, TypeError>>(futureLike.then(() => 8))

// If the onrejected callback returns a non-PromiseLike value, inferred
// error value should be "never".
expectType<Future.Like<string, never>>(futureLike.then(null, () => ""))

// The onrejected callback is allowed to return a different fulfilled
// value from which the main FutureLike holds. The final type will be
// the union of the new type and the futureLike's fulfilled type.
expectType<Future.Like<string | number, never>>(
	futureLike.then(null, () => 4)
)

// then method is allowed to return different values from onfulfilled
// and onrejected callbacks simultaneously.
expectType<Future.Like<boolean | string[], never>>(
	futureLike.then(
		() => false,
		() => [""]
	)
)

{
	const futureLike2: Future.Like<{ readonly foo: string }, number> = Promise.resolve({ foo: '' })

	// If onresolved callback returns another FutureLike, the resulting FutureLike inherits both
	// error types and resolved type is changed to the one which is carried by a type returned by
	// onresolved callback.
	expectType<Future.Like<{ readonly foo: string }, number | TypeError>>(
		futureLike.then((_value) => futureLike2)
	)
}

// If onresolved callback returns PromiseLike, the error type of the resulting FutureLike
// should be inferred as unknown.
expectType<Future.Like<boolean, unknown>>(
	futureLike.then((value) => Promise.resolve(value === 'true'))
)

// If onrejected callback returns PromiseLike, the error type of the resulting FutureLike
// should be inferred as unknown and resolved types should be combined.
expectType<Future.Like<string | boolean, unknown>>(
	futureLike.then(null, (value) => Promise.resolve(value.name === 'TypeError'))
)