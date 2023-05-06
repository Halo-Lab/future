import test from 'node:test'
import { ok, equal } from 'node:assert/strict'

import Future from './index.js'

test('mapErr function should transform an error of the Future into another error', async () => {
	const a = Future.mapErr(Future.fail(1), (n) => n + 1)

	return a.catch((n) => equal(n, 2))
})

test('mapErr function will unwrap and reject a FutureLike returned by a callback', async () => {
	const a = Future.mapErr(Future.fail(1), (n) => Future.of(n + 1))

	return a.catch((n) => equal(n, 2))
})

test('mapErr function can accept the Future later and apply callback on it', async () => {
	const a = Future.mapErr((n: number) => n + 1)

	ok(!Future.is(a))
	ok(typeof a === 'function')

	return a(Future.fail(1)).catch((n) => equal(n, 2))
})
