import type { Whiteboard } from "../whiteboard";
import { BaseGesture } from "./base-gesture";

export class PanGesture extends BaseGesture {
	/**
	 * Current pointer event id
	 */
	private pointerId: number | null = null;

	/**
	 * Last pointer event coords
	 */
	private lastCoords: Array<number> = [0, 0];

	constructor(whiteboard: Whiteboard) {
		super(whiteboard);
	}

	public onPointerDown(event: PointerEvent): void {
		if (!this.shouldStartPanning(event)) return;

		this._isActive = true;
		this.pointerId = event.pointerId;
		this.lastCoords = [event.offsetX, event.offsetY];

		// TODO: update cursor
	}

	public onPointerMove(event: PointerEvent): void {
		if (!this.isActive || event.pointerId !== this.pointerId) return;

		const { offsetX, offsetY } = event;
		const scale = this.whiteboard.viewport.scale;
		const deltaX = (offsetX - this.lastCoords[0]) / scale;
		const deltaY = (offsetY - this.lastCoords[1]) / scale;

		this.lastCoords = [offsetX, offsetY];

		this.whiteboard.viewport.translate(deltaX, deltaY);
		this.whiteboard.render();

		// TODO: update cursor
	}

	public onPointerUp(event: PointerEvent): void {
		if (this._isActive && event.pointerId === this.pointerId) {
			this.reset();
		}
	}

	public reset(): void {
		this._isActive = false;
		this.pointerId = null;
		this.lastCoords = [0, 0];

		// TODO: update cursor
	}

	private shouldStartPanning(event: PointerEvent): boolean {
		return (
			event.pointerType === "mouse" && (event.button === 1 || event.button === 2 || event.shiftKey || event.ctrlKey)
		);
	}
}
