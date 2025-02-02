import type { Whiteboard } from "../../whiteboard";

/** Provides a contract for gesture handling logic. */
export abstract class Gesture {
	/** Is gesture processing */
	protected _isActive: boolean;

	protected whiteboard: Whiteboard;

	/** Returns gesture processing status */
	public get isActive(): boolean {
		return this._isActive;
	}

	public constructor(whiteboard: Whiteboard) {
		this._isActive = false;
		this.whiteboard = whiteboard;
	}

	/** Event handler */
	public abstract onEvent(event: PointerEvent): void;

	/** Resets internal state */
	protected abstract reset(): void;
}
