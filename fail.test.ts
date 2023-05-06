import test from 'node:test'
import { ok, equal } from 'node:assert/strict'

import { expectType } from 'tsd'

import Future from './index.js'

test('fail function should wrap a non-Promise value into the Future (Promise)', async () => {
	const a = Future.fail(8)

	ok(a instanceof Promise)

	return a.catch(() => { })
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

{
	const a = Future.fail('error')

	// Expect fail function to infer exact type of the non-thenable value.
	expectType<Future.Self<never, 'error'>>(a)

	a.catch(() => { })
}