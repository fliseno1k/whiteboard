/**
 * Function used to restrict a value to a specific range
 */
export function clamp(x: number, min: number, max: number): number {
	return Math.max(min, Math.min(x, max));
}

/**
 *  Generator of clamp function with predefined range
 */
export function genClamp(min: number, max: number) {
	return (x: number) => clamp(x, min, max);
}
