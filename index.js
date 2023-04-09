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

export default {
	of,
	make,
	merge,
	oneOf,
	spawn,
	first,
	failed,
	settle,
	isThenable
}

