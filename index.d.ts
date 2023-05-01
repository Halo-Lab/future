/**
 * A type-only symbol that will hold a fulfilled type to strictly catch
 * unassignable types when TypScript cannot differentiate it based on the
 * `then` signature.
 *
 * TypeScript allows assigning types with unassignable properties if
 * one of the types contains an overloaded property and at least one
 * overloaded member **is** assignable to the same property from
 * other type.
 */
declare const fulfilled_type: unique symbol

declare global {
  interface PromiseLike<T> {
    readonly [fulfilled_type]?: T
  }

  interface Promise<T> {
    readonly [fulfilled_type]?: T
  }
}

export interface FutureLike<T, E> {
  readonly [fulfilled_type]?: T

  then(
    onfulfilled?: null | undefined,
    onrejected?: null | undefined
  ): FutureLike<T, E>

  then<K, O = never>(
    onfulfilled: (value: T) => K | FutureLike<K, O>,
    onrejected?: null | undefined
  ): FutureLike<K, O | E>
  then<K, O>(
    onfulfilled: (value: T) => K | PromiseLike<K>,
    onrejected?: null | undefined
  ): FutureLike<K, O | E>

  then<W = T, O = never>(
    onfulfilled: null | undefined,
    onrejected: (error: E) => W | FutureLike<W, O>
  ): FutureLike<T | W, O>
  then<W = T, O = unknown>(
    onfulfilled: null | undefined,
    onrejected: (error: E) => W | PromiseLike<W>
  ): FutureLike<T | W, O>

  then<K, O = never, W = K, G = O>(
    onfulfilled: (value: T) => K | FutureLike<K, O>,
    onrejected: (error: E) => W | FutureLike<W, G>
  ): FutureLike<K | W, O | G>
  then<K, O, W = K, G = O>(
    onfulfilled: (value: T) => K | PromiseLike<K>,
    onrejected: (error: E) => W | PromiseLike<W>
  ): FutureLike<K | W, O | G>
}

export interface Future<T, E> {
  readonly [fulfilled_type]?: T
  readonly [Symbol.toStringTag]: string

  then(
    onfulfilled?: null | undefined,
    onrejected?: null | undefined
  ): Future<T, E>

  then<K, O = never>(
    onfulfilled: (value: T) => K | FutureLike<K, O>,
    onrejected?: null | undefined
  ): Future<K, O | E>
  then<K, O>(
    onfulfilled: (value: T) => K | PromiseLike<K>,
    onrejected?: null | undefined
  ): Future<K, O | E>

  then<W = T, O = never>(
    onfulfilled: null | undefined,
    onrejected: (error: E) => W | FutureLike<W, O>
  ): Future<T | W, O>
  then<W = T, O = unknown>(
    onfulfilled: null | undefined,
    onrejected: (error: E) => W | PromiseLike<W>
  ): Future<T | W, O>

  then<K, O = never, W = K, G = O>(
    onfulfilled: (value: T) => K | FutureLike<K, O>,
    onrejected: (error: E) => W | FutureLike<W, G>
  ): Future<K | W, O | G>
  then<K, O, W = K, G = O>(
    onfulfilled: (value: T) => K | PromiseLike<K>,
    onrejected: (error: E) => W | PromiseLike<W>
  ): Future<K | W, O | G>

  catch(onrejected?: null | undefined): Future<T, E>
  catch<R = T, O = never>(
    onrejected: (error: E) => R | FutureLike<R, O>
  ): Future<T | R, O>
  catch<R = T, O = unknown>(
    onrejected: (error: E) => R | PromiseLike<R>
  ): Future<T | R, O>

  finally(callback?: null | undefined): Future<T, E>
  finally<R, O = never>(callback: () => FutureLike<R, O>): Future<T, E | O>
  finally<R, O>(callback: () => PromiseLike<R>): Future<T, E | O>
  finally<R>(callback: () => R): Future<T, E>
}

type CollectResolvedTypes<T> = {
  readonly [K in keyof T]: Awaited<T[K]>
}

type CollectRejectedTypes<T> = {
  readonly [K in keyof T]: T[K] extends FutureLike<unknown, infer E>
  // Guard agains any from the PromiseLike type.
  ? unknown extends E ? unknown : E
  : never
}

type MergeResolvedTypes<T extends readonly unknown[]> = Awaited<T[number]>

type MergeRejectedTypes<T extends readonly unknown[], R = never> = T extends readonly []
  // Guard against the PromiseLike type, because it has error type as any.
  ? unknown extends R ? unknown : R
  : T extends readonly [infer A, ...infer Rest]
  ? A extends FutureLike<unknown, infer B>
  ? MergeRejectedTypes<Rest, B | R>
  : MergeRejectedTypes<Rest, R>
  : T extends readonly (infer C)[]
  ? C extends FutureLike<unknown, infer D>
  ? D | R
  : R
  : never

export function isThenable<T>(value: PromiseLike<T>): true
export function isThenable<T, E>(value: FutureLike<T, E>): true
export function isThenable<T, E>(value: unknown): value is FutureLike<T, E>

export function spawn<T, E>(callback: () => T | FutureLike<T, E>): Future<T, E>
export function spawn<T, E>(callback: () => T | PromiseLike<T>): Future<T, E>
export function spawn<T, E, const P extends readonly unknown[]>(callback: (...args: P) => T | FutureLike<T, E>, parameters: P): Future<T, E>
export function spawn<T, E, const P extends readonly unknown[]>(callback: (...args: P) => T | PromiseLike<T>, parameters: P): Future<T, E>

export function merge<const P extends readonly unknown[]>(list: P): Future<CollectResolvedTypes<P>, MergeRejectedTypes<P>>
export function merge<T, E>(list: Iterable<T | FutureLike<T, E>> | ArrayLike<T | FutureLike<T, E>>): Future<readonly T[], E>
export function merge<T, E>(list: Iterable<T | PromiseLike<T>> | ArrayLike<T | PromiseLike<T>>): Future<readonly T[], E>
export function merge<const P extends readonly unknown[]>(...list: P): Future<CollectResolvedTypes<P>, MergeRejectedTypes<P>>

export function of<T, E>(value: FutureLike<T, E>): Future<T, E>
export function of<T, E>(value: PromiseLike<T>): Future<T, E>
export function of<const T>(value: T): Future<T, never>

export function failed<T, E>(value: FutureLike<T, E>): Future<never, T | E>
export function failed<T, E>(value: PromiseLike<T>): Future<never, T | E>
export function failed<const E>(value: E): Future<never, E>

export function first<const P extends readonly unknown[]>(list: P): Future<MergeResolvedTypes<P>, MergeRejectedTypes<P>>
export function first<T, E>(list: Iterable<T | FutureLike<T, E>> | ArrayLike<T | FutureLike<T, E>>): Future<T, E>
export function first<T, E>(list: Iterable<T | PromiseLike<T>> | ArrayLike<T | PromiseLike<T>>): Future<T, E>
export function first<const P extends readonly unknown[]>(...list: P): Future<MergeResolvedTypes<P>, MergeRejectedTypes<P>>

export function make<T, E>(executor: (ok: (value: T | FutureLike<T, E>) => void, err: (error: E) => void) => void): Future<T, E>
export function make<T, E>(executor: (ok: (value: T | PromiseLike<T>) => void, err: (error: E) => void) => void): Future<T, E>

export function oneOf<const P extends readonly unknown[]>(list: P): Future<MergeResolvedTypes<P>, CollectRejectedTypes<P>>
export function oneOf<T, E>(list: Iterable<T | FutureLike<T, E>> | ArrayLike<T | FutureLike<T, E>>): Future<T, readonly E[]>
export function oneOf<T, E>(list: Iterable<T | PromiseLike<T>> | ArrayLike<T | PromiseLike<T>>): Future<T, readonly E[]>
export function oneOf<const P extends readonly unknown[]>(...list: P): Future<MergeResolvedTypes<P>, CollectRejectedTypes<P>>

type Result<T, E> = {
  readonly ok: T
} | {
  readonly err: E
}

type CollectBoth<P> = {
  readonly [K in keyof P]: P[K] extends FutureLike<infer A, infer B>
  // Guard agains any from the PromiseLike type.
  ? Result<A, unknown extends B ? unknown : B>
  : Result<P[K], never>
}

export function settle<const P extends readonly unknown[]>(list: P): Future<CollectBoth<P>, never>
export function settle<T, E>(list: Iterable<T | FutureLike<T, E>> | ArrayLike<T | FutureLike<T, E>>): Future<readonly Result<T, E>[], never>
export function settle<T, E>(list: Iterable<T | PromiseLike<T>> | ArrayLike<T | PromiseLike<T>>): Future<readonly Result<T, E>[], never>
export function settle<const P extends readonly unknown[]>(...list: P): Future<CollectBoth<P>, never>

export function map<T, E, R>(callback: (value: T) => R | FutureLike<R, E>): (futureLike: FutureLike<T, E>) => Future<R, E>
export function map<T, E, R>(callback: (value: T) => R | PromiseLike<R>): (promiseLike: PromiseLike<T>) => Future<R, E>
export function map<T, E, R>(futureLike: FutureLike<T, E>, callback: (value: T) => R | FutureLike<R, E>): Future<R, E>
export function map<T, E, R>(promiseLike: PromiseLike<T>, callback: (value: T) => R | PromiseLike<R>): Future<R, E>

export function mapErr<E, K, R>(callback: (value: E) => FutureLike<K, R>): <T>(futureLike: FutureLike<T, E>) => Future<T, K | R>
export function mapErr<E, K, R>(callback: (value: E) => PromiseLike<K>): <T>(promiseLike: PromiseLike<T>) => Future<T, K | R>
export function mapErr<E, K>(callback: (value: E) => K): <T>(futureLike: FutureLike<T, E>) => Future<T, K>
export function mapErr<E, K>(callback: (value: E) => K): <T>(promiseLike: PromiseLike<T>) => Future<T, K>
export function mapErr<T, E, K, R>(futureLike: FutureLike<T, E>, callback: (value: E) => FutureLike<K, R>): Future<T, K | R>
export function mapErr<T, E, K, R>(promiseLike: PromiseLike<T>, callback: (value: E) => PromiseLike<K>): Future<T, K | R>
export function mapErr<T, E, K>(futureLike: FutureLike<T, E>, callback: (value: E) => K): Future<T, K>
export function mapErr<T, E, K>(promiseLike: PromiseLike<T>, callback: (value: E) => K): Future<T, K>

export function recover<E, R>(callback: (value: E) => R | FutureLike<R, never>): <T = R>(futureLike: FutureLike<T, E>) => Future<T | R, never>
export function recover<E, R, K = unknown>(callback: (value: E) => R | PromiseLike<R>): <T = R>(promiseLike: PromiseLike<T>) => Future<T | R, K>
export function recover<T, E, R = T>(futureLike: FutureLike<T, E>, callback: (value: E) => R | FutureLike<R, never>): Future<T | R, never>
export function recover<T, E, R = T, K = unknown>(promiseLike: PromiseLike<T>, callback: (value: E) => R | PromiseLike<R>): Future<T | R, K>

export function after<T, E>(callback: () => FutureLike<T, E>): <A, K>(futureLike: FutureLike<A, K>) => Future<T, E | K>
export function after<T, E>(callback: () => PromiseLike<T>): <A, K>(promiseLike: PromiseLike<A>) => Future<T, E | K>
export function after<R>(callback: () => R): <T, E>(futureLike: FutureLike<T, E>) => Future<T, E>
export function after<R>(callback: () => R): <T, E>(promiseLike: PromiseLike<T>) => Future<T, E>
export function after<T, E, A, K>(futureLike: FutureLike<T, E>, callback: () => FutureLike<A, K>): Future<T, E | K>
export function after<T, E, A, K>(promiseLike: PromiseLike<T>, callback: () => PromiseLike<A>): Future<T, E | K>
export function after<T, E, R>(futureLike: FutureLike<T, E>, callback: () => R): Future<T, E>
export function after<T, E, R>(promiseLike: PromiseLike<T>, callback: () => R): Future<T, E>

type _of = typeof of
type _is = typeof isThenable
type _map = typeof map
type _make = typeof make
type _oneOf = typeof oneOf
type _merge = typeof merge
type _spawn = typeof spawn
type _first = typeof first
type _after = typeof after
type _mapErr = typeof mapErr
type _settle = typeof settle
type _failed = typeof failed
type _recover = typeof recover

declare namespace Future {
  export type Self<T, E> = Future<T, E>
  export type Like<T, E> = FutureLike<T, E>

  export const of: _of
  export const is: _is
  export const map: _map
  export const make: _make
  export const oneOf: _oneOf
  export const merge: _merge
  export const spawn: _spawn
  export const first: _first
  export const after: _after
  export const mapErr: _mapErr
  export const settle: _settle
  export const failed: _failed
  export const recover: _recover
}

export default Future
