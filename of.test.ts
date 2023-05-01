import test from 'node:test'
import { ok, equal } from 'node:assert/strict'

import { expectType } from 'tsd'

import Future from './index.js'

test('of function should wrap a non-Promise value into the Future (Promise)', () => {
  ok(Future.of(8) instanceof Promise)
})

test('of function should pass through future', async (context) => {
  await context.test('resolved future', async () => {
    const a = Future.of(Future.of('foo'))

    equal(await a, 'foo')
  })

  await context.test('rejected future', async () => {
    const a: Future.Self<string, number> = Future.of(Promise.reject(1))

    return a.catch((n) => equal(n, 1))
  })
})

// Expect of narrowing exact type for the non-thenable value.
expectType<Future.Self<5, never>>(Future.of(5))
