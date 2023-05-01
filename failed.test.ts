import test from 'node:test'
import { ok, equal } from 'node:assert/strict'

import { expectType } from 'tsd'

import Future from './index.js'

test('faild function should wrap a non-Promise value into the Future (Promise)', async () => {
	const a = Future.failed(8)

	ok(a instanceof Promise)

	return a.catch(() => { })
})

test('failed function should fail future with a value', async () => {
	const a: Future.Self<number, 'foo'> = Future.failed('foo')

	return a.catch((error) => equal(error, 'foo'))
})

test('failed function rejects a passed Future', async (context) => {
	await context.test('fulfilled Future', async () => {
		const a: Future.Self<never, number> = Future.failed(Future.of(8))

		return a.catch((n) => equal(n, 8))
	})

	await context.test('rejected Future', async () => {
		const a: Future.Self<never, 'mark'> = Future.failed(Promise.reject('mark'))

		return a.catch((v) => equal(v, 'mark'))
	})
})

{
	const a = Future.failed('error')

	// Expect failed function to infer exact type of the non-thenable value.
	expectType<Future.Self<never, 'error'>>(a)

	a.catch(() => { })
}