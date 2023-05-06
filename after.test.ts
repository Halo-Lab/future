import test from 'node:test'
import { ok, equal } from 'node:assert/strict'

import Future from './index.js'

test('after function should not transform the resolved value', async () => {
	const a = Future.after(Future.of(1), () => 10)

	return a.then((n) => equal(n, 1))
})

test('after function will unwrap a FutureLike returned by a callback and preserve only the resolved value', async (context) => {
	await context.test('resolved', async () => {
		const callback = context.mock.fn(() => Future.of(10))

		const a = Future.after(Future.of(1), callback)

		return a.then((n) => {
			ok(callback.mock.callCount() === 1)
			equal(n, 1)
		})
	})

	await context.test('rejected value is changed', async () => {
		const callback = context.mock.fn(() => Future.fail(10))

		const a = Future.after(Future.fail(1), callback)

		return a.catch((n) => {
			ok(callback.mock.callCount() === 1)
			equal(n, 10)
		})
	})
})

test('after function can accept the Future later and apply callback on it', async (context) => {
	const callback = context.mock.fn()

	const a = Future.after(callback)

	ok(!Future.is(a))
	ok(typeof a === 'function')

	return a(Future.fail(1)).catch((n) => {
		ok(callback.mock.callCount() === 1)
		equal(n, 1)
	})
})
