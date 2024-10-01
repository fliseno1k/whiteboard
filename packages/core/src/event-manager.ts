import { EVENT, noop } from "./utils";
import { Whiteboard } from "./whiteboard";

/**
 * Manage event handling and work delegation to current editor tools
 */
export class EventManager {
	private isPanning: boolean;

	private panStartCoords: [number, number];

	/**
	 * Active pointer events set
	 */
	private readonly pointers: Map<PointerEvent["pointerId"], PointerEvent>;

	/**
	 * Whiteboard
	 */
	private readonly whiteboard: Whiteboard;

	public constructor(whiteboard: Whiteboard) {
		this.whiteboard = whiteboard;

		this.isPanning = false;
		this.panStartCoords = [0, 0];

		this.pointers = new Map();
	}

	/**
	 * Attach common events handlers
	 */
	public attatchEvents(): void {
		const canvasElement = this.whiteboard.canvas.element;

		canvasElement.addEventListener(EVENT.POINTER_DOWN, this.handlePointerDown);
		canvasElement.addEventListener(EVENT.POINTER_MOVE, this.handlePointerMove);
		canvasElement.addEventListener(EVENT.POINTER_UP, this.handlePointerUp);
		canvasElement.addEventListener(EVENT.POINTER_CANCEL, this.handlePointerCancel);

		canvasElement.addEventListener(EVENT.TOUCH_START, noop);
		canvasElement.addEventListener(EVENT.TOUCH_MOVE, noop);
		canvasElement.addEventListener(EVENT.TOUCH_END, noop);
		canvasElement.addEventListener(EVENT.TOUCH_CANCEL, noop);

		canvasElement.addEventListener(EVENT.DOUBLE_CLICK, noop);
		canvasElement.addEventListener(EVENT.WHEEL, noop, { passive: true });

		canvasElement.addEventListener(EVENT.DRAG_OVER, noop);
		canvasElement.addEventListener(EVENT.KEYDOWN, noop);
	}

	/**
	 * Detach previously added events handlers
	 */
	public detachEvents(): void {
		const canvasElement = this.whiteboard.canvas.element;

		canvasElement.removeEventListener(EVENT.POINTER_DOWN, this.handlePointerDown);
		canvasElement.removeEventListener(EVENT.POINTER_MOVE, this.handlePointerMove);
		canvasElement.removeEventListener(EVENT.POINTER_UP, this.handlePointerUp);
		canvasElement.removeEventListener(EVENT.POINTER_CANCEL, this.handlePointerCancel);
	}

	private handlePointerDown = (event: PointerEvent): void => {
		event.preventDefault();

		this.pointers.set(event.pointerId, event);
		this.whiteboard.canvas.element.setPointerCapture(event.pointerId);

		const { offsetX, offsetY } = event;

		if (this.shouldStartPanning(event)) {
			this.isPanning = true;
			this.panStartCoords = [offsetX, offsetY];
		} else {
			this.proccessPointerEvent(event);
		}
	};

	private handlePointerMove = (event: PointerEvent): void => {
		event.preventDefault();

		if (this.pointers.has(event.pointerId)) {
			this.pointers.set(event.pointerId, event);

			if (this.isPanning) {
				this.updatePan(event);
			} else {
				this.proccessPointerEvent(event);
			}
		}
	};

	private handlePointerUp = (event: PointerEvent): void => {
		event.preventDefault();

		this.pointers.delete(event.pointerId);

		if (this.isPanning) {
			this.endPan();
		} else {
			this.proccessPointerEvent(event);
		}
	};

	private handlePointerCancel = (event: PointerEvent): void => {
		event.preventDefault();

		this.pointers.delete(event.pointerId);

		if (this.isPanning) {
			this.endPan();
		} else {
			this.proccessPointerEvent(event);
		}
	};

	private proccessPointerEvent(event: PointerEvent): void {}

	private shouldStartPanning(event: PointerEvent): boolean {
		return event.button === 1 || event.button === 2 || event.shiftKey;
	}

	private updatePan(event: PointerEvent): void {
		const scale = this.whiteboard.viewport.scale;
		const deltaX = (event.offsetX - this.panStartCoords[0]) / scale;
		const deltaY = (event.offsetY - this.panStartCoords[1]) / scale;

		this.whiteboard.viewport.offsetX += deltaX;
		this.whiteboard.viewport.offsetY += deltaY;

		this.panStartCoords = [event.offsetX, event.offsetY];

		this.whiteboard.render();
	}

	private endPan(): void {
		this.isPanning = false;
	}
}
