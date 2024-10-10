import { Whiteboard } from "./whiteboard";

export interface Gesture {
	isGestureActive(): boolean;

	onPointerDown(event: PointerEvent): void;

	onPointerMove(event: PointerEvent): void;

	onPointerUp(event: PointerEvent): void;

	reset(): void;
}

export abstract class BaseGesture implements Gesture {
	/**
	 * Is gesture active
	 */
	protected isActive: boolean;

	/**
	 * Whiteboard instance ref
	 */
	protected whiteboard: Whiteboard;

	public constructor(whiteboard: Whiteboard) {
		this.isActive = false;
		this.whiteboard = whiteboard;
	}

	/**
	 * Is gesture active
	 */
	public isGestureActive(): boolean {
		return this.isActive;
	}

	/**
	 * Resets inner state to initial|default
	 */
	public reset(): void {
		this.isActive = false;
	}

	/**
	 * Gesture pointerDown event handler
	 */
	public abstract onPointerDown(event: PointerEvent): void;

	/**
	 * Gesture pointerMove event handler
	 */
	public abstract onPointerMove(event: PointerEvent): void;

	/**
	 * Gesture pointerUp event handler
	 */
	public abstract onPointerUp(event: PointerEvent): void;
}

export class PanGesture extends BaseGesture {
	public onPointerDown(event: PointerEvent): void {}

	public onPointerMove(event: PointerEvent): void {}

	public onPointerUp(event: PointerEvent): void {}
}

export class PinchGesture extends BaseGesture {
	public onPointerDown(event: PointerEvent): void {}

	public onPointerMove(event: PointerEvent): void {}

	public onPointerUp(event: PointerEvent): void {}
}
