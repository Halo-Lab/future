declare global {
  interface Future<T, E> {
    readonly then: <K = T, O = E, W = K>(
      onfulfilled?: ((value: T) => K | Future<K, O>) | null,
      onrejected?: ((error: E) => W | Future<W, O>) | null
    ) => Future<K | W, O>;
    readonly catch: <R = T, O = E>(
      callback?: ((error: E) => R | Future<R, O>) | null
    ) => Future<T | R, O>;
    readonly finally: (callback?: VoidFunction | null) => Future<T, E>;
  }
}

export {};
