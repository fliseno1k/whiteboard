import { type Gesture, PanGesture, PinchGesture } from "./gestures";
import { EventType, noop } from "./utils";
import { Whiteboard } from "./whiteboard";

/**
 * A surface where user interactions are detected and processed
 */
export class InputSurface {
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

	/**
	 * Abort signal
	 */
	private abortController: AbortController | null;

	constructor(whiteboard: Whiteboard) {
		this.whiteboard = whiteboard;

		this.pointers = new Map();
		this.gestures = [new PanGesture(whiteboard), new PinchGesture(whiteboard)];
		this.activeGestures = new Set();
		this.abortController = null;
	}

	public connect(): void {
		this.abortController?.abort();
		this.abortController = new AbortController();

		const element = this.whiteboard.canvas.element;
		const signal = this.abortController.signal;

		element.addEventListener(EventType.DOUBLE_CLICK, noop, { signal });
		element.addEventListener(EventType.DRAG_OVER, noop, { signal });
		element.addEventListener(EventType.KEY_DOWN, noop, { signal });
		element.addEventListener(EventType.POINTER_CANCEL, this.handlePointerCancel.bind(this), { signal });
		element.addEventListener(EventType.POINTER_DOWN, this.handlePointerDown.bind(this), { signal });
		element.addEventListener(EventType.POINTER_MOVE, this.handlePointerMove.bind(this), { signal });
		element.addEventListener(EventType.POINTER_UP, this.handlePointerUp.bind(this), { signal });
		element.addEventListener(EventType.WHEEL, this.handleWheel.bind(this), { passive: false, signal });
	}

	public disconnect(): void {
		this.abortController?.abort();
	}

	private handlePointerDown(event: PointerEvent): void {
		event.preventDefault();

		this.pointers.set(event.pointerId, event);
		this.whiteboard.canvas.element.setPointerCapture(event.pointerId);

		this.gestures.forEach((gesture) => gesture.onPointerDown(event));
		this.updateActiveGestures();

		if (this.isAnyGestureActive()) return;

		this.proccessPointerEvent(event);
	}

	private handlePointerMove(event: PointerEvent): void {
		event.preventDefault();

		if (!this.pointers.has(event.pointerId)) return;

		this.pointers.set(event.pointerId, event);

		this.gestures.forEach((gesture) => gesture.onPointerMove(event));

		if (this.isAnyGestureActive()) return;

		this.proccessPointerEvent(event);
	}

	private handlePointerUp(event: PointerEvent): void {
		event.preventDefault();

		this.pointers.delete(event.pointerId);
		this.whiteboard.canvas.element.releasePointerCapture(event.pointerId);

		this.gestures.forEach((gesture) => gesture.onPointerUp(event));
		this.updateActiveGestures();

		if (this.isAnyGestureActive()) return;

		this.proccessPointerEvent(event);
	}

	private handlePointerCancel(event: PointerEvent): void {
		this.handlePointerUp(event);
	}

	private handleWheel(event: WheelEvent): void {
		event.preventDefault();

		if (event.ctrlKey || event.metaKey) {
			const z = this.scaleFromWheelEvent(event);
			const { clientX: x, clientY: y } = event;

			this.whiteboard.viewport.zoomAtPoint(x, y, z);
		} else {
			this.whiteboard.viewport.translateBy(-event.deltaX, -event.deltaY);
		}

		this.whiteboard.render();
	}

	private proccessPointerEvent(event: PointerEvent): void {}

	private isAnyGestureActive(): boolean {
		return this.activeGestures.size > 0;
	}

	private updateActiveGestures(): void {
		this.activeGestures.clear();

		this.gestures.forEach((gesture) => gesture.isActive && this.activeGestures.add(gesture));
	}

	private scaleFromWheelEvent(event: WheelEvent): number {
		const { deltaY } = event;

		const sign = Math.sign(deltaY);
		const MAX_STEP = 0.1 * 100;
		const absDelta = Math.abs(deltaY);
		let delta = deltaY;

		if (absDelta > MAX_STEP) {
			delta = MAX_STEP * sign;
		}

		const scale =
			this.whiteboard.viewport.scale -
			delta / 100 +
			Math.log10(Math.max(1, this.whiteboard.viewport.scale)) * -sign * Math.min(1, absDelta / 20);

		return scale;
	}
}
