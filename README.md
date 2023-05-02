# Future

It is a `Promise` compatible type that allows to define and track error types.

## Why is the default Promise definition type bad?

An asynchronous code may throw errors but the standard type of the `Promise` cannot tell you which errors you can handle in the `catch` method. Of course, you can define the error's type explicitly, but you should know what en error can be at the time. It may be hard task, especially if you are chaining a lot of promises and each of them may throw an error.

## Installation

```bash
npm i @halo-lab/future
```

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

By using the `Future` you can describe which errors a promise can be rejected with and TypeScript will help you remember and exhaustively handle them later.

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

This package defines and exports some functions that makes Future creation and managing easier because default Promise typings don't are plain and don't pay any attention to the error types. These functions are exported separately and in a namespace (as default export) for convenience.

1. `of`/`Future.of` - wraps a value with a `Future` and immediately resolves it. If the value is another `Future`, the latter isn't wrapped.

2. `failed`/`Future.failed` - wraps a value with a `Future` and immediately rejects it. If the value is another `Future`, it will be awaited and a new `Future` will be rejected with either value.

3. `make`/`Future.make` - creates a `Future` with an _executor_ callback. The same as `Promise` constructor.

4. `spawn`/`spawn` - creates a `Future` with a _callback's_ result. If the callback throws an error, the `Future` will be rejected. If the callback returns another `Future` it will be returned as is.

5. `isThenable`/`Future.is` - checks if a value is [thenable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#thenables) object.

6. `merge`/`Future.merge` - combines multiple `Future`s together waiting for all to complete or first to reject. Behaves as the `Promise.all`. Accepts variable number of arguments or the single argument that should be `Iterable` or `ArrayLike`.

7. `settle`/`Future.settle` - combines multiple `Future`s together waiting for all to complete. Behaves as the `Promise.allSettled`. Accepts variable number of arguments or the single argument that should be `Iterable` or `ArrayLike`.

8. `first`/`Future.first` - waits for the first `Future` to settle. Behaves as the `Promise.race`. Accepts variable number of arguments or the single argument that should be `Iterable` or `ArrayLike`.

9. `oneOf`/`Future.oneOf` - waits for the first `Future` to resolve or all `Future`s to reject (array of errors is returned). Behaves as the `Promise.any`. Accepts variable number of arguments or the single argument that should be `Iterable` or `ArrayLike`.

10. `map`/`Future.map` - transforms a resolved value of the `Future` and returns another `Future`. Functional way to call _onfulfilled_ callback of `then` method.

11. `mapErr`/`Future.mapErr` - transforms a rejected value of the `Future` into another rejected value and returns rejected `Future`.

12. `recover`/`Future.recover` - transofmrs a rejected value of the `Future` into a fulfileld value and returns another `Future`. Functional way to call _onrejected_ callback of the `then` method.

13. `after`/`Future.after` - register a callback to be called after the `Future` settles. Functional way to call the `finally` method.

The `Future` namespace defines also aliases for the `Future` type: `Self` and for the `FutureLike` type: `Like`.

```typescript
import Future from '@halo-lab/future';

function one(): Future.Self<1, never> {
  return Future.of(1);
}

const numberOne: Future.Like<1, never> = one();
```

## Word from author

Have fun ✌️

<a href="https://www.halo-lab.com/?utm_source=github">
  <img
    src="https://dgestran.sirv.com/Images/supported-by-halolab.png"
    alt="Supported by Halo lab"
    height="60"
  >
</a>
