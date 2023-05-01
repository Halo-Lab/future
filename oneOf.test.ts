import test from 'node:test'
import { equal, deepEqual } from 'node:assert/strict'

import Future from './index.js'

test('oneOf should return the result of first successfully fullfilled Future', async () => {
	const a = Future.oneOf(
		Future.make<string, never>((ok) => setTimeout(() => ok('foo'), 10)),
		Future.make<boolean, never>((ok) => setTimeout(() => ok(false), 20)),
		Future.failed(3)
	)

	return a.then((s) => equal(s, 'foo'))
})

test('oneOf should return an array with errors if no Future is resolved successfully', async () => {
	const a = Future.oneOf(
		Future.failed(''),
		Future.failed(true),
		Future.failed(3)
	)

	return a.catch((r) => deepEqual(r, ['', true, 3]))
})

test('a single array argument should be treated as a list of futures for the oneOf function', async () => {
	const a = Future.oneOf(
		[
			Future.make<string, never>((ok) => setTimeout(() => ok('foo'), 10)),
			Future.make<boolean, never>((ok) => setTimeout(() => ok(false), 20)),
			Future.failed(3)
		]
	)

	return a.then((s) => equal(s, 'foo'))
})
