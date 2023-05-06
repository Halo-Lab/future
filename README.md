# Future

It is a `Promise` compatible type that allows to define and track error types.

## Why is the default Promise definition type bad?

An asynchronous code may throw errors but the standard type of the `Promise` cannot tell you which errors you can handle in the `catch` method. Of course, you can define the error type explicitly, but you should know what en error can be at the time. It may be a hard task, especially if you are chaining a lot of promises and each of them may throw an error.

## Installation

```bash
npm i @halo-lab/future
```

## API

1. [Overview](#usage)
2. [`of`/`Future.of`](#offutureof)
3. [`fail`/`Future.fail`](#failfuturefail)
4. [`make`/`Future.make`](#makefuturemake)
5. [`spawn`/`Future.spawn`](#spawnfuturespawn)
6. [`isThenable`/`Future.is`](#isthenablefutureis)
7. [`merge`/`Future.merge`](#mergefuturemerge)
8. [`settle`/`Future.settle`](#settlefuturesettle)
9. [`first`/`Future.first`](#firstfuturefirst)
10. [`oneOf`/`Future.oneOf`](#oneoffutureoneof)
11. [`map`/`Future.map`](#mapfuturemap)
12. [`mapErr`/`Future.mapErr`](#maperrfuturemaperr)
13. [`recover`/`Future.recover`](#recoverfuturerecover)
14. [`after`/`Future.after`](#afterfutureafter)

## Usage

This package defines `Future`/`FutureLike` types which you can use instead of the `Promise`/`PromiseLike`. These types are interchangeable.

```typescript
import { Future } from '@halo-lab/future';

const future: Future<number, Error> = new Promise((resolve, reject) => {
  const randomNumber = Math.random();

  if (randomNumber > 0.5) resolve(randomNumber);
  else reject(new Error("Random number is less than 0.5"));
});

const promise: Promise<number> = future;
```

By using the `Future` you can describe what errors a promise can be rejected with and TypeScript will help you remember and exhaustively handle them later.

```typescript
// using the example above
const newFuture: Future<string[], never> = future.then(
  (number) => {
    /* do something useful */
    return ['foo'] /* some result */;
  },
  (error /* Error */) => {
    /* report that there is a problem and fix it */
    return [];
  }
);
```

> Unfortunately, `await`ed future inside the `try/catch` block cannot populate an error type to the `catch` block, because TypeScript doesn't allow it (even explicitly). Though you can refer to the future type inside the `try` block and easily get what errors are expected to be thrown.
> ```typescript
> try {
>   const value: string[] = await newFuture;
> } catch (error) {
>   /* error is not typed as never but any or unknown depending on your tsconfig */
> }
> ```

This package defines and exports some functions that make `Future` creation and managing easier because default `Promis`e typings are plain and don't pay any attention to the error types. These functions are exported separately and in a _namespace_ (as a default export) for convenience.

The `Future` namespace defines also aliases for the `Future` type: `Self` and for the `FutureLike` type: `Like`.

```typescript
import Future from '@halo-lab/future';

function one(): Future.Self<1, never> {
  return Future.of(1);
}

const numberOne: Future.Like<1, never> = one();
```

### `of`/`Future.of`

Wraps a value with a `Future` and immediately resolves it. If the value is another `Future`, the latter isn't wrapped.

```typescript
const wrappedNumber: Future.Self<10, never> = Future.of(10);

const duplicatedWrappedNumber: Future.Self<10, never> = Future.of(wrappedNumber);

// The Future created from the Promise always has an `unknown`
// error type because it is really unknown unless the user knows it
// and provides the type manually.
const fromPromise: Future.Self<string, unknown> = Future.of(Promise.resolve('foo'));

// If the value is rejected Future or Promise, the resulting Future
// also has the rejected state.
const failedFuture: Future<never, string> = Future.of(Promise.reject('A very helpful message'));
```

### `fail`/`Future.fail`

Wraps a value with a `Future` and immediately rejects it. If the value is another `Future`, it will be awaited and a new `Future` will be rejected with either value.

```typescript
const failedFuture: Future.Self<never, 'error'> = Future.fail('error');

const failedPromise: Future.Self<never, number> = Future.fail(Promise.resolve(7));
```

### `make`/`Future.make`

Creates a `Future` with an _executor_ callback. The same as the `Promise` constructor.

```typescript
const future: Future<number, string> = Future.make((ok, err) => {
    doAsyncJob((error, result) =>
        error ? err(error) : ok(result)
    );
});
```

### `spawn`/`Future.spawn`

Creates a `Future` from a _callback's_ result. If the callback throws an error, the `Future` will be rejected. If the callback returns another `Future` it will be returned as is.

```typescript
function calculateFibonacciNumber(position: number): number {
    // ...
}

const future: Future.Self<number, never> = Future.spawn(() => {
    return calculateFibonacciNumber(57);
});

// There is no way to mark a function in TypeScript that can
// throw an error, so you have to describe the error type that
// manually. Otherwise, it will be `never`.
const trickyFuture: Future.Self<never, Error> = Future.spawn(() => {
    throw new Error('an error is thrown');
});
```

You can pass arguments into the callback by providing them after it.

```typescript
const future: Future.Self<number, never> = Future.spawn((first, second) => {
    return first + second;
}, [34, 97]);
```

### `isThenable`/`Future.is`

Checks if a value is a [thenable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#thenables) object.

```typescript
Future.is(Future.of(1)); // -> true
Future.is(Promise.resolve('foo')); // -> true
Future.is({
    then(fulfill) {
        return Future.of(fulfill(Math.random()));
    }
}); // -> true
Future.is(3); // -> false
```

### `merge`/`Future.merge`

Combines multiple `Future`s together waiting for all to complete or first to reject. Behaves as the `Promise.all`. Accepts a variable number of arguments or a single argument that should be `Iterable` or `ArrayLike`.

```typescript
const result: Future.Self<readonly [number, string], boolean | string> = Future.merge(
    Future.spawn<number, boolean>(() => mayThrowABoolean()),
    Future.spawn<string, string>(() => mayThrowAString())
);

const combined: Future.Self<readonly [1, 2], never> = Future.merge([
    Future.of(1),
    Future.of(2)
]);
```

### `settle`/`Future.settle`

Combines multiple `Future`s together waiting for all to complete. Behaves as the `Promise.allSettled`. Accepts a variable number of arguments or a single argument that should be `Iterable` or `ArrayLike`. Promise's values are wrapped with the special `Result` object. It is a plain object with either `ok` property or `err`.

```typescript
const future: Future.Self<
    readonly [Result<1, never>, Result<never, 'bar'>],
    never
> = Future.settle(
    Future.ok(1),
    Future.fail('bar')
);
```

### `first`/`Future.first`

Waits for the first `Future` to fulfill either successfuly or as a failure. Behaves as the `Promise.race`. Accepts a variable number of arguments or a single argument that should be `Iterable` or `ArrayLike`.

```typescript
const future: Future.Self<1 | 'foo', string | boolean> = Future.first(
    Future.make<1, string>((ok, err) => setTimeout(() => {
        Math.random() > 0.5
            ? ok(1)
            : err('numbers greater than 0.5 are not acceptable');
    }), 100),
    Future.spawn<'foo', boolean>(() => {
        if (Math.random() > 0.5) return 'foo';
        else throw true;
    })
);
```

### `oneOf`/`Future.oneOf`

Waits for the first `Future` to fulfill or all `Future`s to reject (array of errors is returned). Behaves as the `Promise.any`. Accepts a variable number of arguments or a single argument that should be `Iterable` or `ArrayLike`.

```typescript
const future: Future.Self<1 | 'foo', readonly [string, boolean]> = Future.oneOf(
    Future.make<1, string>((ok, err) => setTimeout(() => {
        Math.random() > 0.5
            ? ok(1)
            : err('numbers greater than 0.5 are not acceptable');
    }), 100),
    Future.spawn<'foo', boolean>(() => {
        if (Math.random() > 0.5) return 'foo';
        else throw true;
    })
);
```

### `map`/`Future.map`

Transforms a resolved value of the `Future` and returns another `Future`. It's a functional way to call _onfulfilled_ callback of `then` method.

### `mapErr`/`Future.mapErr`

Transforms a rejected value of the `Future` into another rejected value and returns rejected `Future`.

### `recover`/`Future.recover`

Transforms a rejected value of the `Future` into a fulfileld value and returns another `Future`. It's a functional way to call _onrejected_ callback of the `then` method.

### `after`/`Future.after`

Registers a callback to be called after the `Future` resolves either way. It's a functional way to call the `finally` method.

## Word from author

Have fun ✌️

<a href="https://www.halo-lab.com/?utm_source=github">
  <img
    src="https://dgestran.sirv.com/Images/supported-by-halolab.png"
    alt="Supported by Halo lab"
    height="60"
  >
</a>
