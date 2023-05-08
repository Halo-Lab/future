import test from 'node:test'
import { ok, equal } from 'node:assert/strict'

import { expectNotType, expectType } from 'tsd'

import Future from './index.js'

{
	const a = Future.fail('error')

	// Expect the fail function to infer exact type of the non-thenable value.
	expectType<Future.Self<never, 'error'>>(a)

	a.catch(() => {})
}

{
	const a = Future.fail(Future.of(1))

	// Expect the Future to receive the Right type of the FutureLike argument as the Left type.
	expectType<Future.Self<never, 1>>(a)

	a.catch(() => {})
}

{
	const a = Future.fail(Future.fail(1))

	// Expect the Future to receive the Left type of the FutureLike argument as the Left type.
	expectType<Future.Self<never, 1>>(a)

	a.catch(() => {})
}

{
	const a = Future.fail(Promise.resolve(1))

	// Expect the Future to receive the Left type as unknown if the resolved PromiseLike is an argument.
	expectType<Future.Self<never, unknown>>(a)
	expectNotType<Future.Self<never, number>>(a)

	a.catch(() => {})
}

{
	const a = Future.fail<number, string>(Promise.resolve(1))

	// Expect the Left type to be configurable if an argument is the resolved PromiseLike.
	expectType<Future.Self<never, number | string>>(a)

	a.catch(() => {})
}

{
	const a = Future.fail(Promise.reject(1))

	// Expect the Future to receive the Left type as unknown if the rejected PromiseLike is an argument.
	expectType<Future.Self<never, unknown>>(a)

	a.catch(() => {})
}

{
	const a = Future.fail<string, number>(Promise.reject(1))

	// Expect the Left type to be configurable if an argument is the rejected PromiseLike.
	expectType<Future.Self<never, number | string>>(a)

	a.catch(() => {})
}

test('fail function should wrap a non-Promise value into the Future (Promise)', async () => {
	const a = Future.fail(8)

	ok(a instanceof Promise)

	return a.catch(() => {})
})

test('fail function should fail future with a value', async () => {
	const a: Future.Self<number, 'foo'> = Future.fail('foo')

	return a.catch((error) => equal(error, 'foo'))
})

test('fail function rejects a passed Future', async (context) => {
	await context.test('fulfilled Future', async () => {
		const a: Future.Self<never, number> = Future.fail(Future.of(8))

		return a.catch((n) => equal(n, 8))
	})

	await context.test('rejected Future', async () => {
		const a: Future.Self<never, 'mark'> = Future.fail(Promise.reject('mark'))

		return a.catch((v) => equal(v, 'mark'))
	})
})
