import type { Whiteboard } from "../whiteboard";
import type { Gesture } from "./types";

export abstract class BaseGesture implements Gesture {
	protected _isActive: boolean;

	protected whiteboard: Whiteboard;

	public get isActive(): boolean {
		return this._isActive;
	}

	public constructor(whiteboard: Whiteboard) {
		this._isActive = false;
		this.whiteboard = whiteboard;
	}

	public abstract reset(): void;

	public abstract onPointerDown(event: PointerEvent): void;

	public abstract onPointerMove(event: PointerEvent): void;

	public abstract onPointerUp(event: PointerEvent): void;
}
