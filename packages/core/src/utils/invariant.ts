import { isProduction } from "./env";

/**
 * Invariant error text message
 */
const prefix: string = "Invariant failed";

/**
 * Invariant function that throws an erro if condition fails
 */
export function invariant(condition: any, message: string | (() => string)): asserts condition {
	if (condition) {
		return;
	}

	if (isProduction) {
		throw new Error(prefix);
	}

	const provided: string | undefined = typeof message === "function" ? message() : message;
	const value: string = provided ? `${prefix}: ${provided}` : prefix;
	throw new Error(value);
}
