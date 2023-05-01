import test from 'node:test'
import { equal } from 'node:assert/strict'

import Future from './index.js'

test('first should return the result of first fullfilled Future', async (context) => {
	await context.test('resolved', async () => {
		const a = Future.first(
			Future.make<never, void>((_, err) => setTimeout(err, 10)),
			Future.of(3)
		)

		return a.then((n) => equal(n, 3))
	})

	await context.test('rejected', async () => {
		const a = Future.first(
			Future.make<string, never>((ok) => setTimeout(() => ok('foo'), 10)),
			Future.failed(3)
		)

		return a.catch((n) => equal(n, 3))
	})
})

test('a single array argument should be treated as a list of futures for the first function', async () => {
	const a = Future.first(
		[
			Future.of(4),
			Future.of(3),
			Future.failed('foo')
		]
	)

	return a.then((n) => equal(n, 4))
})
