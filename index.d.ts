declare global {
  interface FutureLike<T, E> {
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

  interface Future<T, E> {
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
}

export {};
