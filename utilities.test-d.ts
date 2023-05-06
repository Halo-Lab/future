import { expectType } from 'tsd'

import Future from './index.js'

declare const rightFromFuture: Future.Right<Future.Self<number, string>>

// Right type unwraps the Future type and gets the fulfilled value type.
expectType<number>(rightFromFuture)

declare const rightFromPromise: Future.Right<Promise<7>>

// Right type unwraps the Promise type and gets the fulfilled value type.
expectType<7>(rightFromPromise)

declare const rightFromValue: Future.Right<string>

// Right type should return non-thenable type as is.
expectType<string>(rightFromValue)

declare const leftFromFuture: Future.Left<Future.Self<number, boolean>>

// Left type unwaps the Future and gets the error value type. 
expectType<boolean>(leftFromFuture)

declare const leftFromValue: Future.Left<[number]>

// Left type should return never for the non-thenable type. 
expectType<never>(leftFromValue)

declare const leftFromPromise: Future.Left<Promise<'hello'>>

// Left type should return unknown for the Promise type.
expectType<unknown>(leftFromPromise)

declare const futureLike: Future.Not<Future.Like<string, Error>>

// NonThenable type should return never for the FutureLike type.
expectType<never>(futureLike)

declare const promiseLike: Future.Not<PromiseLike<string>>

// NonThenable type should return never for the PromiseLike type.
expectType<never>(promiseLike)

declare const value: Future.Not<3>

// NonThenable type should return the non-thenable type as is
expectType<3>(value)
