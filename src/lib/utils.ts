export function throttle<Args extends unknown[]>(
	fn: (...args: Args) => void,
	ms: number,
) {
	let last = 0;
	return function (...args: Args) {
		const now = Date.now();
		if (now - last >= ms) {
			fn(...args);
			last = now;
		}
	};
}
