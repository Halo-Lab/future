# Future

It is a `Promise` compatible type that allows to define and track error types.

## Why is the default Promise definition type bad?

An asynchronous code may throw errors but the standard type of the `Promise` cannot tell you which errors you can handle in the `catch` method. Of course, you can define the error's type explicitly, but you should know what en error can be at the time. It may be hard task, especially if you are chaining a lot of promises and each of them may throw an error.

## Installation

```bash
npm i -D @halo-lab/future
```

## Adding to the project

The package doesn't carry any JavaScript code. It contains only the global type definition, so you just continue using plain promises implying that they return the `Future` value.

If you have the `tsconfig.json` or `jsconfig.json` files in your project, then add an entry to the **types** property of the **compilerOptions** object.

```json
{
  "compilerOptions": {
    "types": ["@halo-lab/future/index"]
  }
}
```

Or you can define the `global.d.ts` file somewhere in your project and import the package into it.

```typescript
import "@halo-lab/future";
```

Otherwise, you can import it straight to your code in the same way as to the definition file.

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

By using the `Future` you can describe which errors a promise can throw and TypeScript will help you remember and exhaustively handle them later.

```typescript
// using the example above
future.then(
  (number) => /* do something useful */,
  (error /* Error */) => /* report that there is a problem and fix it */
);
```

> Unfortunately, `await`ed future inside the `try/catch` block cannot populate an error type to the `catch` block, because TypeScript doesn't allow it (even explicitly). Though you can refer to the future type inside the `try` block and easily get what errors are expected to be thrown.

## Word from author

Have fun ✌️

<a href="https://www.halo-lab.com/?utm_source=github">
  <img
    src="https://dgestran.sirv.com/Images/supported-by-halolab.png"
    alt="Supported by Halo lab"
    height="60"
  >
</a>
