/** Unique ID */
export type UUID = string;

/** Unique ID generation function */
export const generateUUID: () => UUID =
	"crypto" in Window ? () => crypto.randomUUID() : () => Date.now().toString(36) + Math.random().toString(36).substr(2);
