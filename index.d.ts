export interface FutureLike<T, E> {
  then(
    onfulfilled?: null | undefined,
    onrejected?: null | undefined
  ): FutureLike<T, E>;
  then<K, O = never>(
    onfulfilled: (value: T) => K | FutureLike<K, O>,
    onrejected?: null | undefined
  ): FutureLike<K, O | E>;
  then<W, O = never>(
    onfulfilled: null | undefined,
    onrejected: (error: E) => W | FutureLike<W, O>
  ): FutureLike<T | W, O>;
  then<K, O = never, W = K, G = O>(
    onfulfilled: (value: T) => K | FutureLike<K, O>,
    onrejected: (error: E) => W | FutureLike<W, G>
  ): FutureLike<K | W, O | G>;
}

export interface Future<T, E> {
  readonly [Symbol.toStringTag]: string;

  then(
    onfulfilled?: null | undefined,
    onrejected?: null | undefined
  ): Future<T, E>;
  then<K, O = never>(
    onfulfilled: (value: T) => K | FutureLike<K, O>,
    onrejected?: null | undefined
  ): Future<K, O | E>;
  then<W, O = never>(
    onfulfilled: null | undefined,
    onrejected: (error: E) => W | FutureLike<W, O>
  ): Future<T | W, O>;
  then<K, O = never, W = K, G = O>(
    onfulfilled: (value: T) => K | FutureLike<K, O>,
    onrejected: (error: E) => W | FutureLike<W, G>
  ): Future<K | W, O | G>;

  catch(onrejected?: null | undefined): Future<T, E>;
  catch<R = T, O = never>(
    onrejected: (error: E) => R | FutureLike<R, O>
  ): Future<T | R, O>;

  finally(callback?: VoidFunction | null | undefined): Future<T, E>;
}

type CollectResolvedTypes<T> = {
  readonly [K in keyof T]: Awaited<T[K]>;
};

type CollectRejectedTypes<T> = {
  readonly [K in keyof T]: T[K] extends FutureLike<unknown, infer E> ? E : never;
};

type MergeResolvedTypes<T extends readonly unknown[]> = Awaited<T[number]>;

type MergeRejectedTypes<T extends readonly unknown[], R = never> = T extends readonly []
  ? R
  : T extends readonly [infer A, ...infer Rest]
  ? A extends FutureLike<unknown, infer B>
  ? MergeRejectedTypes<Rest, B | R>
  : MergeRejectedTypes<Rest, R>
  : T extends readonly (infer C)[]
  ? C extends FutureLike<unknown, infer D>
  ? D | R
  : R
  : never;

export function isThenable<T>(value: PromiseLike<T>): true;
export function isThenable<T, E>(value: FutureLike<T, E>): true;
export function isThenable<T, E>(value: unknown): value is FutureLike<T, E>;

export function spawn<T, E>(callback: () => T | FutureLike<T, E>): Future<T, E>;
export function spawn<T, E, const P extends readonly unknown[]>(callback: (...args: P) => T | FutureLike<T, E>, parameters: P): Future<T, E>;

export function merge<const P extends readonly unknown[]>(futureLikes: P): Future<CollectResolvedTypes<P>, MergeRejectedTypes<P>>;
export function merge<T, E>(futureLikes: Iterable<T | FutureLike<T, E>> | ArrayLike<T | FutureLike<T, E>>): Future<readonly T[], E>;
export function merge<const P extends readonly unknown[]>(...futureLikes: P): Future<CollectResolvedTypes<P>, MergeRejectedTypes<P>>;

export function of<T, E>(value: T | FutureLike<T, E>): Future<T, E>;

export function failed<T, E>(value: E | FutureLike<T, E>): Future<never, T | E>;

export function first<const P extends readonly unknown[]>(futureLikes: P): Future<MergeResolvedTypes<P>, MergeRejectedTypes<P>>;
export function first<T, E>(futureLikes: Iterable<T | FutureLike<T, E>> | ArrayLike<T | FutureLike<T, E>>): Future<T, E>;
export function first<const P extends readonly unknown[]>(...futureLikes: P): Future<MergeResolvedTypes<P>, MergeRejectedTypes<P>>;

export function make<T, E>(executor: (ok: (value: T | FutureLike<T, E>) => void, fail: (error: E) => void) => void): Future<T, E>;

export function oneOf<const P extends readonly unknown[]>(futureLikes: P): Future<MergeResolvedTypes<P>, CollectRejectedTypes<P>>;
export function oneOf<T, E>(futureLikes: Iterable<T | FutureLike<T, E>> | ArrayLike<T | FutureLike<T, E>>): Future<T, readonly E[]>;
export function oneOf<const P extends readonly unknown[]>(...futureLikes: P): Future<MergeResolvedTypes<P>, CollectRejectedTypes<P>>;

type Result<T, E> = {
  readonly ok: T;
} | {
  readonly err: E;
};

type CollectBoth<P> = {
  readonly [K in keyof P]: P[K] extends FutureLike<infer A, infer B> ? Result<A, B> : Result<P[K], never>;
};

export function settle<const P extends readonly unknown[]>(futureLikes: P): Future<CollectBoth<P>, never>;
export function settle<T, E>(futureLikes: Iterable<T | FutureLike<T, E>> | ArrayLike<T | FutureLike<T, E>>): Future<readonly Result<T, E>[], never>;
export function settle<const P extends readonly unknown[]>(...futureLikes: P): Future<CollectBoth<P>, never>;

type _of = typeof of;
type _is = typeof isThenable;
type _make = typeof make;
type _oneOf = typeof oneOf;
type _merge = typeof merge;
type _spawn = typeof spawn;
type _first = typeof first;
type _settle = typeof settle;
type _failed = typeof failed;

declare namespace Future {
  export type Self<T, E> = Future<T, E>;
  export type Like<T, E> = FutureLike<T, E>;

  export const of: _of;
  export const is: _is;
  export const make: _make;
  export const oneOf: _oneOf;
  export const merge: _merge;
  export const spawn: _spawn;
  export const first: _first;
  export const settle: _settle;
  export const failed: _failed;
}

export default Future;