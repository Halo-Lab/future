import test from 'node:test'
import { equal } from 'node:assert/strict'

import Future from './index.js'

test('spawn should resolve with a callback\'s result', async () => {
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
	const a = Future.spawn((n: number) => n ** 2, [3]);

	return a.then((n) => equal(n, 9))
})
