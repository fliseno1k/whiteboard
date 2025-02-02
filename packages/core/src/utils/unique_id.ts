/** Unique ID */
export type UID = string;

/** Unique ID generation function */
export const uid =
	"crypto" in Window ? () => crypto.randomUUID() : () => Date.now().toString(36) + Math.random().toString(36).substr(2);
