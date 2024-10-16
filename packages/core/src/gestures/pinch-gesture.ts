import { Whiteboard } from "../whiteboard";
import { BaseGesture } from "./base-gesture";

export class PinchGesture extends BaseGesture {
	private initialScale: number = 1;

	private initialDistance: number = 0;

	private initialMidpoint: number[] = [0, 0];

	private readonly pointers = new Map<PointerEvent["pointerId"], PointerEvent>();

	constructor(whiteboard: Whiteboard) {
		super(whiteboard);
	}

	public onPointerDown(event: PointerEvent): void {
		this.pointers.set(event.pointerId, event);

		if (this.pointers.size !== 2) return;

		const [first, second] = this.pointers.values();

		this._isActive = true;
		this.initialScale = this.whiteboard.viewport.scale;
		this.initialDistance = this.getDistance(first, second);
		this.initialMidpoint = this.getMidpoint(first, second);
	}

	public onPointerMove(event: PointerEvent): void {
		if (!this.pointers.has(event.pointerId)) return;

		this.pointers.set(event.pointerId, event);

		if (!this._isActive) return;

		const [first, second] = this.pointers.values();
		const midpoint = this.getMidpoint(first, second);

		this.whiteboard.viewport.translate(midpoint[0] - this.initialMidpoint[0], midpoint[1] - this.initialMidpoint[1]);
		this.whiteboard.render();
	}

	public onPointerUp(event: PointerEvent): void {
		if (this._isActive && this.pointers.has(event.pointerId)) {
			this.reset();
		}
	}

	public reset(): void {
		this.pointers.clear();
		this._isActive = false;
		this.initialScale = 1;
		this.initialDistance = 0;
		this.initialMidpoint = [0, 0];
	}

	private getDistance(a: PointerEvent, b: PointerEvent): number {
		const dx = a.clientX - b.clientX;
		const dy = a.clientY - b.clientY;

		return Math.hypot(dx, dy);
	}

	private getMidpoint(a: PointerEvent, b: PointerEvent): number[] {
		return [(a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2];
	}
}
