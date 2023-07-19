function isFunction(value) {
  return typeof value === "function";
}

export function isThenable(value) {
  return value != null && isFunction(value.then);
}

function isIterable(value) {
  return value != null && isFunction(value[Symbol.iterator]);
}

export function spawn(callback, parameters = []) {
  return from((ok, err) => {
    try {
      ok(callback(...parameters));
    } catch (error) {
      err(error);
    }
  });
}

function flatFutureLikes(futureLikes) {
  return futureLikes.length === 1 && isIterable(futureLikes[0])
    ? futureLikes[0]
    : futureLikes;
}

export function merge(...futureLikes) {
  return Promise.all(flatFutureLikes(futureLikes));
}

export function of(value) {
  return Promise.resolve(value);
}

export async function fail(value) {
  throw await value;
}

export function first(...futureLikes) {
  return Promise.race(flatFutureLikes(futureLikes));
}

export function from(executor) {
  return new Promise(executor);
}

export function oneOf(...futureLikes) {
  return from((ok, err) => {
    const errors = [];
    let settledErrorsAmount = 0;

    Array.from(flatFutureLikes(futureLikes)).forEach(
      (futureLike, index, list) =>
        of(futureLike).then(ok, (error) => {
          errors[index] = error;
          settledErrorsAmount += 1;

          settledErrorsAmount === list.length && err(errors);
        }),
    );
  });
}

export function settle(...futureLikes) {
  return Promise.all(
    Array.from(flatFutureLikes(futureLikes)).map((like) =>
      of(like).then(
        (ok) => ({ ok }),
        (err) => ({ err }),
      ),
    ),
  );
}

export function map(futureLike, callback) {
  return isFunction(futureLike)
    ? (actualFutureLike) => map(actualFutureLike, futureLike)
    : futureLike.then(callback);
}

export function mapErr(futureLike, callback) {
  return isFunction(futureLike)
    ? (actualFutureLike) => mapErr(actualFutureLike, futureLike)
    : futureLike.then(null, (error) => fail(callback(error)));
}

export function recover(futureLike, callback) {
  return isFunction(futureLike)
    ? (actualFutureLike) => recover(actualFutureLike, futureLike)
    : futureLike.then(null, callback);
}

export function after(futureLike, callback) {
  return isFunction(futureLike)
    ? (actualFutureLike) => after(actualFutureLike, futureLike)
    : futureLike.then(
        (value) => of(callback()).then(() => value),
        (error) => of(callback()).then(() => fail(error)),
      );
}

export function apply(futureLikeWithValue, futureLikeWithFunction) {
  return futureLikeWithFunction
    ? map(merge(futureLikeWithValue, futureLikeWithFunction), ([value, fn]) =>
        fn(value),
      )
    : (anotherFutureLikeWithValue) =>
        apply(anotherFutureLikeWithValue, futureLikeWithValue);
}

export default {
  of,
  is: isThenable,
  map,
  fail,
  from,
  oneOf,
  merge,
  spawn,
  first,
  after,
  apply,
  mapErr,
  settle,
  recover,
};
