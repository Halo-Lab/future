import test from 'node:test'
import { ok, equal } from 'node:assert/strict'

import { expectNotType, expectType } from 'tsd'

import Future from './index.js'

// Expect the Future to have the exact Right type from the non-thenable value and never as the Left type.
expectType<Future.Self<5, never>>(Future.of(5))

{
	const a: Future.Like<string, number> = Future.spawn(() => 'foo')

	// Expect the Future to inherit Right and Left types from the FutureLike.
	expectType<Future.Self<string, number>>(Future.of(a))
}

// Expect the Future to inherit the Right type from the PromiseLike and have the unknown as the Left type.
expectType<Future.Self<string, unknown>>(Future.of(Promise.resolve('foo')))
expectNotType<Future.Self<string, boolean>>(Future.of(Promise.resolve('foo')))

// Left type should be configurable if the PromiseLike is an argument.
expectType<Future.Self<string, number>>(
	Future.of<string, number>(Promise.resolve('foo')),
)

test('of function should wrap a non-Promise value into the Future (Promise)', () => {
	ok(Future.of(8) instanceof Promise)
})

test('of function should pass through future', async (context) => {
	await context.test('resolved future', async () => {
		const a = Future.of(Future.of('foo'))

		equal(await a, 'foo')
	})

	await context.test('rejected future', async () => {
		const a: Future.Self<string, number> = Future.of(Promise.reject(1))

		return a.catch((n) => equal(n, 1))
	})
})
