import { type Gesture, PanGesture, PinchGesture } from "./gestures";
import { EVENT, noop } from "./utils";
import { Whiteboard } from "./whiteboard";

/**
 * Manage event handling and work delegation to current editor tools
 */
export class EventManager {
	/**
	 * Active pointer events set
	 */
	private readonly pointers: Map<PointerEvent["pointerId"], PointerEvent>;

	/**
	 * Gestures list
	 */
	private readonly gestures: Array<Gesture>;

	/**
	 * Active gestures list
	 */
	private readonly activeGestures: Set<Gesture>;

	/**
	 * Whiteboard
	 */
	private readonly whiteboard: Whiteboard;

	constructor(whiteboard: Whiteboard) {
		this.whiteboard = whiteboard;

		this.pointers = new Map();

		this.gestures = [new PanGesture(whiteboard), new PinchGesture(whiteboard)];
		this.activeGestures = new Set();
	}

	public attatchEvents(): void {
		const canvasElement = this.whiteboard.canvas.element;

		canvasElement.addEventListener(EVENT.POINTER_DOWN, this.handlePointerDown);
		canvasElement.addEventListener(EVENT.POINTER_MOVE, this.handlePointerMove);
		canvasElement.addEventListener(EVENT.POINTER_UP, this.handlePointerUp);
		canvasElement.addEventListener(EVENT.POINTER_CANCEL, this.handlePointerCancel);

		canvasElement.addEventListener(EVENT.DOUBLE_CLICK, noop);
		canvasElement.addEventListener(EVENT.WHEEL, this.handleWheel, { passive: true });

		canvasElement.addEventListener(EVENT.DRAG_OVER, noop);
		canvasElement.addEventListener(EVENT.KEYDOWN, noop);
	}

	public detachEvents(): void {
		const canvasElement = this.whiteboard.canvas.element;

		canvasElement.removeEventListener(EVENT.POINTER_DOWN, this.handlePointerDown);
		canvasElement.removeEventListener(EVENT.POINTER_MOVE, this.handlePointerMove);
		canvasElement.removeEventListener(EVENT.POINTER_UP, this.handlePointerUp);
		canvasElement.removeEventListener(EVENT.POINTER_CANCEL, this.handlePointerCancel);

		canvasElement.removeEventListener(EVENT.WHEEL, this.handleWheel);
	}

	private handlePointerDown = (event: PointerEvent): void => {
		event.preventDefault();

		this.pointers.set(event.pointerId, event);
		this.whiteboard.canvas.element.setPointerCapture(event.pointerId);

		this.gestures.forEach((gesture) => gesture.onPointerDown(event));
		this.updateActiveGestures();

		if (this.isAnyGestureActive()) return;

		this.proccessPointerEvent(event);
	};

	private handlePointerMove = (event: PointerEvent): void => {
		event.preventDefault();

		if (!this.pointers.has(event.pointerId)) return;

		this.pointers.set(event.pointerId, event);

		this.gestures.forEach((gesture) => gesture.onPointerMove(event));

		if (this.isAnyGestureActive()) return;

		this.proccessPointerEvent(event);
	};

	private handlePointerUp = (event: PointerEvent): void => {
		event.preventDefault();

		this.pointers.delete(event.pointerId);
		this.whiteboard.canvas.element.releasePointerCapture(event.pointerId);

		this.gestures.forEach((gesture) => gesture.onPointerUp(event));
		this.updateActiveGestures();

		if (this.isAnyGestureActive()) return;

		this.proccessPointerEvent(event);
	};

	private handlePointerCancel = (event: PointerEvent): void => {
		this.handlePointerUp(event);
	};

	private handleWheel = (event: WheelEvent): void => {
		if (event.ctrlKey || event.metaKey) {
			const z = this.scaleFromWheelEvent(event);
			const { clientX: x, clientY: y } = event;

			this.whiteboard.viewport.zoomAtPoint(x, y, z);
		} else {
			const dx = -event.deltaX;
			const dy = -event.deltaY;

			this.whiteboard.viewport.translate(dx, dy);
		}

		this.whiteboard.render();
	};

	private proccessPointerEvent(event: PointerEvent): void {}

	private isAnyGestureActive(): boolean {
		return this.activeGestures.size > 0;
	}

	private updateActiveGestures(): void {
		this.activeGestures.clear();

		this.gestures.forEach((gesture) => gesture.isActive && this.activeGestures.add(gesture));
	}

	private scaleFromWheelEvent(event: WheelEvent): number {
		const zoomSensitivity = 0.01;

		return Math.exp(-event.deltaY * zoomSensitivity);
	}
}
