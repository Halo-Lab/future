import test from 'node:test'
import { equal } from 'node:assert/strict'

import { expectType } from 'tsd'

import Future from './index.js'

// Expect the resulting Future correctly inherit Right and Left types of the FutureLike
// returned by the callback.
expectType<Future.Self<'foo', never>>(Future.spawn(() => Future.of('foo')))

// Expect the resulting Future correctly inherit Right type of the PromiseLike
// returned by the callback. Left type should be unknown by default.
expectType<Future.Self<'foo', unknown>>(
	Future.spawn(() => Promise.resolve('foo')),
)

// Allow to change the Left type inherited from the PromiseLike
// when the latter is returned from the callback.
expectType<Future.Self<'foo', 1>>(
	Future.spawn<'foo', 1>(() => Promise.resolve('foo')),
)

// If a callback returns a non-thenable value, it's type should be inherited by the Future
// as the Right type and the Left type should be never by default.
expectType<Future.Self<number, never>>(Future.spawn(() => 3))

// If a callback returns a non-thenable value, the Left type should be able to change.
expectType<Future.Self<number, 'error'>>(Future.spawn(() => 3))

// If a callback returns FutureLike and a non-thenable, the resulting Future
// has to inherit the Right type from FutureLike and non-thenable and the Left
// from the FutureLike.
expectType<Future.Self<number | 'hello', 'bye'>>(
	Future.spawn(() =>
		Math.random() > 0.1 ? Future.spawn<number, 'bye'>(() => 1) : 'hello',
	),
)

// If a callback returns PromiseLike and a non-thenable, the resulting Future
// has to inherit the Right type from PromiseLike and non-thenable and the Left
// infer as unknown by default.
expectType<Future.Self<number | 'hello', unknown>>(
	Future.spawn(() => (Math.random() > 0.1 ? Promise.resolve(1) : 'hello')),
)

// If a callback returns PromiseLike and a non-thenable, the Left type should be configurable.
expectType<Future.Self<number | 'hello', 'configurable error'>>(
	Future.spawn(() => (Math.random() > 0.1 ? Promise.resolve(1) : 'hello')),
)

// TODO: write tests for cases with arguments for the callback.

test("spawn should resolve with a callback's result", async () => {
	const a = Future.spawn<number, string>(() => {
		const i: boolean = true

		if (i) return 7
		else throw 'foo'
	})

	return a.then((n) => equal(n, 7))
})

test('spawn should create a failed Future with a thrown error', async () => {
	const a = Future.spawn<number, string>(() => {
		const i: boolean = false

		if (i) return 7
		else throw 'foo'
	})

	return a.catch((s) => equal(s, 'foo'))
})

test('spawn should pass through returned Future', async (context) => {
	await context.test('resolved', async () => {
		const a = Future.spawn(() => Future.of(3))

		return a.then((n) => equal(n, 3))
	})

	await context.test('failed', async () => {
		const a = Future.spawn(() => Future.fail(3))

		return a.catch((e) => equal(e, 3))
	})
})

test('spawn can accept parameters for the callback', async () => {
	const a = Future.spawn((n: number) => n ** 2, [3])

	return a.then((n) => equal(n, 9))
})
