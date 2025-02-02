import type { Whiteboard } from "../../whiteboard";
import { NativeEventType } from "../event_type";
import { Gesture } from "./gesture";

export class PanGesture extends Gesture {
	private pointerId: number | null = null;

	private lastCoords: Array<number> = [0, 0];

	private readonly eventSwitchMap: Record<PointerEvent["type"], (event: PointerEvent) => void> = {
		[NativeEventType.POINTERDOWN]: this.onPointerDown,
		[NativeEventType.POINTERMOVE]: this.onPointerMove,
		[NativeEventType.POINTERUP]: this.onPointerUp,
	};

	constructor(whiteboard: Whiteboard) {
		super(whiteboard);
	}

	public onEvent(event: PointerEvent): void {
		this.eventSwitchMap[event.type]?.(event);
	}

	private onPointerDown(event: PointerEvent): void {
		if (!this.shouldStartPanning(event)) return;

		this._isActive = true;
		this.pointerId = event.pointerId;
		this.lastCoords = [event.offsetX, event.offsetY];

		// TODO: update cursor
	}

	private onPointerMove(event: PointerEvent): void {
		if (!this.isActive || event.pointerId !== this.pointerId) return;

		const { offsetX, offsetY } = event;
		const scale = this.whiteboard.viewport.scale;
		const deltaX = (offsetX - this.lastCoords[0]) / scale;
		const deltaY = (offsetY - this.lastCoords[1]) / scale;

		this.lastCoords = [offsetX, offsetY];

		this.whiteboard.viewport.translateBy(deltaX, deltaY);
		this.whiteboard.render();

		// TODO: update cursor
	}

	private onPointerUp(event: PointerEvent): void {
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
