export function isThenable(value) {
	return value !== null && typeof value === 'object' && 'then' in value && typeof value.then === 'function';
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

export function merge(...futureLikes) {
	return Promise.all(futureLikes);
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
	return Promise.race(futureLikes);
}

export default {
	of,
	merge,
	spawn,
	first,
	failed,
	isThenable
}

