import test from 'node:test'
import { deepEqual } from 'node:assert/strict'

import Future from './index.js'

test('settle should return the result of all fullfilled Futures', async () => {
	const a = Future.settle(
		Future.make<string, never>((ok) => setTimeout(() => ok('foo'), 10)),
		Future.make<boolean, never>((ok) => setTimeout(() => ok(false), 20)),
		Future.fail(3)
	)

	return a.then((r) => deepEqual(r, [{ ok: 'foo' }, { ok: false }, { err: 3 }]))
})

test('a single array argument should be treated as a list of futures for the settle function', async () => {
	const a = Future.settle(
		[
			Future.make<string, never>((ok) => setTimeout(() => ok('foo'), 10)),
			Future.make<boolean, never>((ok) => setTimeout(() => ok(false), 20)),
			Future.fail(3)
		]
	)

	return a.then((r) => deepEqual(r, [{ ok: 'foo' }, { ok: false }, { err: 3 }]))
})
