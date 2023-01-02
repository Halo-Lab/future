declare global {
  interface FutureLike<T, E> {
    readonly then: <K = T, O = E, W = K>(
      onfulfilled?: ((value: T) => K | PromiseLike<K>) | null | undefined,
      onrejected?: ((error: E) => W | PromiseLike<W>) | null | undefined
    ) => FutureLike<K | W, O>;
  }

  interface Future<T, E> {
    readonly [Symbol.toStringTag]: string;

    readonly then: <K = T, O = E, W = K>(
      onfulfilled?: ((value: T) => K | FutureLike<K, O>) | null | undefined,
      onrejected?: ((error: E) => W | FutureLike<W, O>) | null | undefined
    ) => Future<K | W, O>;
    readonly catch: <R = T, O = E>(
      onrejected?: ((error: E) => R | FutureLike<R, O>) | null | undefined
    ) => Future<T | R, O>;
    readonly finally: (
      callback?: VoidFunction | null | undefined
    ) => Future<T, E>;
  }
}

export {};
