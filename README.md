# Future

It is a `Promise` compatible type that allows to define and track error types.

## Why is the default Promise definition type is bad?

An asynchronous code may throw errors but the standard type of the `Promise` cannot tell you which errors you can handle in the `catch` method. Of course, you can define the error's type explicitly, but you should know what en error can be at the time. It may be hard task, especially if you chaining a lot of promises and each of them may throw an error.

## Usage

This package defines a `Future` type which you can use instead of the `Promise`. Those types are interchangeable.

```typescript
const future: Future<number, Error> = new Promise((resolve, reject) => {
  const randomNumber = Math.random();

  if (randomNumber > 0.5) resolve(randomNumber);
  else reject(new Error("Random number is less than 0.5"));
});

const promise: Promise<number> = future;
```

By using the `Future` you can describe which errors a promise can carry at the time of throwing them and later TypeScript will help you remember and exhaustively handle them.

```typescript
// using the example above
future.then(
  (number) => /* do something useful */,
  (error /* Error */) => /* report that there is a problem and fix it */
);
```

> The project doesn't carry any JavaScript code. It contains only the global type definition, so you must continue using plain promises implying that they return the `Future` value.

## Word from author

Have fun ✌️
