import test from 'node:test'
import { ok, equal } from 'node:assert/strict'

import Future from './index.js'

test('recover function should transform an error of the Future into a resolved value', async () => {
	const a = Future.recover(Future.fail(1), (n) => n + 1)

	return a.then((n) => equal(n, 2))
})

test('recover function will unwrap a FutureLike returned by a callback', async (context) => {
	await context.test('resolved', async () => {
		const a = Future.recover(Future.fail(1), (n) => Future.of(n + 1))

		return a.then((n) => equal(n, 2))
	})

	await context.test('rejected', async () => {
		const a = Future.recover(Future.fail(1), (n) => Future.fail(n + 1))

		return a.catch((n) => equal(n, 2))
	})
})

test('recover function can accept the Future later and apply callback on it', async () => {
	const a = Future.recover((n: number) => n + 1)

	ok(!Future.is(a))
	ok(typeof a === 'function')

	return a(Future.fail(1)).then((n) => equal(n, 2))
})
