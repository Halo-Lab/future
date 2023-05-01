import test from 'node:test'
import { ok, equal, deepEqual } from 'node:assert/strict'

import Future from './index.js'

test('merge should accept variable amount of agruments', async () => {
	const a = Future.merge(
		Future.of(''),
		Future.of(2),
		Future.of([true])
	)

	return a.then((result) => {
		ok(Array.isArray(result))
		deepEqual(result, ['', 2, [true]])
	})
})

test('merge should reject if one of futures rejects', async () => {
	const a = Future.merge(
		Future.of(''),
		Future.failed(2),
		Future.of([true])
	)

	return a.catch((result) => {
		equal(result, 2)
	})
})

test('a single array argument should be treated as a list of futures for the merge', async () => {
	const a = Future.merge(
		[
			Future.of(''),
			Future.of(2),
			Future.of([true])
		]
	)

	return a.then((result) => {
		deepEqual(result, ['', 2, [true]])
	})
})
