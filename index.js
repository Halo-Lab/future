function isObject(value) {
	return value != null && typeof value === 'object';
}

export function isThenable(value) {
	return isObject(value) && typeof value.then === 'function';
}

function isIterable(value) {
	return isObject(value) && typeof value[Symbol.iterator] === 'function';
}

export function spawn(callback, parameters = []) {
	return new Promise((resolve, reject) => {
		try {
			const result = callback(...parameters);

			isThenable(result) ? result.then(resolve, reject) : resolve(result);
		} catch (error) {
			reject(error);
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

export function failed(value) {
	return spawn(async () => {
		throw await value;
	})
}

export function first(...futureLikes) {
	return Promise.race(flatFutureLikes(futureLikes));
}

export function make(executor) {
	return new Promise(executor);
}

export function oneOf(...futureLikes) {
	return Promise.any(flatFutureLikes(futureLikes));
}

export function settle(...futureLikes) {
	return Promise.allSettled(
		Array.from(flatFutureLikes(futureLikes)).map(
			(like) => like.then((ok) => ({ ok }), (err) => ({ err }))
		)
	);
}

export function map(futureLike, callback) {
	return typeof futureLike === 'function'
		? (actualFutureLike) => map(actualFutureLike, futureLike)
		: futureLike.then(callback);
}

export function mapErr(futureLike, callback) {
	return typeof futureLike === 'function'
		? (actualFutureLike) => mapErr(actualFutureLike, futureLike)
		: futureLike.catch(async (error) => {
			throw await callback(error);
		});
}

export function recover(futureLike, callback) {
	return typeof futureLike === 'function'
		? (actualFutureLike) => recover(actualFutureLike, futureLike)
		: actualFutureLike.catch(callback);
}

export function after(futureLike, callback) {
	return typeof futureLike === 'function'
		? (actualFutureLike) => after(actualFutureLike, futureLike)
		: actualFutureLike.finally(callback);
}

export default {
	of,
	map,
	make,
	merge,
	oneOf,
	spawn,
	first,
	after,
	failed,
	settle,
	recover,
	mapErr,
	isThenable
}

