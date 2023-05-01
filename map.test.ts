import test from 'node:test'
import { ok, equal } from 'node:assert/strict'

import Future from './index.js'

test('map function should transform a resolved value of the Future', async () => {
	const a = Future.map(Future.of(1), (n) => n + 1)

	return a.then((n) => equal(n, 2))
})

test('map function will unwrap a FutureLike returned by a callback', async () => {
	const a = Future.map(Future.of(1), (n) => Future.of(n + 1))

	return a.then((n) => equal(n, 2))
})

test('map function can accept the Future later and apply callback on it', async () => {
	const a = Future.map((n: number) => n + 1)

	ok(!Future.is(a))
	ok(typeof a === 'function')

	return a(Future.of(1)).then((n) => equal(n, 2))
})
