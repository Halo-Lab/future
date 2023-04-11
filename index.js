function isFunction(value) {
	return typeof value === 'function'
}

function isObject(value) {
	return value != null && typeof value === 'object'
}

export function isThenable(value) {
	return isObject(value) && isFunction(value.then)
}

function isIterable(value) {
	return isObject(value) && isFunction(value[Symbol.iterator])
}

export function spawn(callback, parameters = []) {
	return new Promise((resolve, reject) => {
		try {
			const result = callback(...parameters)

			isThenable(result) ? result.then(resolve, reject) : resolve(result)
		} catch (error) {
			reject(error)
		}
	})
}

function flatFutureLikes(futureLikes) {
	return futureLikes.length === 1 && isIterable(futureLikes[0])
		? futureLikes[0]
		: futureLikes
}

export function merge(...futureLikes) {
	return Promise.all(flatFutureLikes(futureLikes))
}

export function of(value) {
	return Promise.resolve(value)
}

export function failed(value) {
	return spawn(async () => {
		throw await value
	})
}

export function first(...futureLikes) {
	return Promise.race(flatFutureLikes(futureLikes))
}

export function make(executor) {
	return new Promise(executor)
}

export function oneOf(...futureLikes) {
	return Promise.any(flatFutureLikes(futureLikes))
}

export function settle(...futureLikes) {
	return Promise.all(
		Array.from(flatFutureLikes(futureLikes)).map(
			(like) => like.then((ok) => ({ ok }), (err) => ({ err }))
		)
	)
}

export function map(futureLike, callback) {
	return isFunction(futureLike)
		? (actualFutureLike) => map(actualFutureLike, futureLike)
		: futureLike.then(callback)
}

export function mapErr(futureLike, callback) {
	return isFunction(futureLike)
		? (actualFutureLike) => mapErr(actualFutureLike, futureLike)
		: futureLike.then(null, (error) => failed(callback(error)))
}

export function recover(futureLike, callback) {
	return isFunction(futureLike)
		? (actualFutureLike) => recover(actualFutureLike, futureLike)
		: actualFutureLike.then(null, callback)
}

export function after(futureLike, callback) {
	return isFunction(futureLike)
		? (actualFutureLike) => after(actualFutureLike, futureLike)
		: actualFutureLike.then(
			(value) => of(callback()).then(() => value),
			(error) => of(callback()).then(() => failed(error))
		)
}

export default {
	of,
	is: isThenable,
	map,
	make,
	oneOf,
	merge,
	spawn,
	first,
	after,
	mapErr,
	settle,
	failed,
	recover,
}

