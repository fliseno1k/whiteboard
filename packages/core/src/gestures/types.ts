export interface Gesture {
	/**
	 * Is gesture active
	 */
	get isActive(): boolean;

	/**
	 * Gesture pointerDown event handler
	 */
	onPointerDown(event: PointerEvent): void;

	/**
	 * Gesture pointerMove event handler
	 */
	onPointerMove(event: PointerEvent): void;

	/**
	 * Gesture pointerUp event handler
	 */
	onPointerUp(event: PointerEvent): void;

	/**
	 * Reset inner state to initial|default
	 */
	reset(): void;
}
