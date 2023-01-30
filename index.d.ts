declare global {
  interface FutureLike<T, E> {
    then(
      onfulfilled?: null | undefined,
      onrejected?: null | undefined
    ): FutureLike<T, E>;
    then<K, O = E>(
      onfulfilled: (value: T) => K | PromiseLike<K>,
      onrejected?: null | undefined
    ): FutureLike<K, O | E>;
    then<W, O = never>(
      onfulfilled: null | undefined,
      onrejected: (error: E) => W | PromiseLike<W>
    ): FutureLike<T | W, O>;
    then<K, O = never, W = K>(
      onfulfilled: (value: T) => K | PromiseLike<K>,
      onrejected: (error: E) => W | PromiseLike<W>
    ): FutureLike<K | W, O>;
  }

  interface Future<T, E> {
    readonly [Symbol.toStringTag]: string;

    then(
      onfulfilled?: null | undefined,
      onrejected?: null | undefined
    ): Future<T, E>;
    then<K, O = E>(
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
    catch<O = never, R = T>(
      onrejected: (error: E) => R | FutureLike<R, O>
    ): Future<T | R, O>;

    finally(callback?: VoidFunction | null | undefined): Future<T, E>;
  }
}

export {};
