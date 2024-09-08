import { Canvas } from "./graphics";
import { EVENT, noop } from "./utils";

export class Editor {
	/**
	 * Editor root html element
	 */
	private readonly parent: HTMLElement;

	/**
	 * Canvas instance
	 */
	private canvas!: Canvas;

	public constructor(editorHolder: HTMLElement) {
		this.parent = editorHolder;

		this.initCanvas();
		this.subscribeOnCanvasEvents();
	}

	/**
	 * Creates & inserts canvas html element
	 */
	private initCanvas(): void {
		const pixelRatio = window.devicePixelRatio ?? 1;
		const canvasElement = document.createElement("canvas");

		canvasElement.tabIndex = 0;
		canvasElement.style.touchAction = "none";
		canvasElement.style.outline = "none";

		this.parent.appendChild(canvasElement);
		this.canvas = new Canvas(canvasElement, pixelRatio);
	}

	/**
	 * Init canvas events listeners
	 */
	private subscribeOnCanvasEvents(): void {
		const canvasElement = this.canvas.getElement();

		canvasElement.addEventListener(EVENT.POINTER_DOWN, noop);
		canvasElement.addEventListener(EVENT.POINTER_MOVE, noop);
		canvasElement.addEventListener(EVENT.POINTER_UP, noop);

		canvasElement.addEventListener(EVENT.TOUCH_START, noop);
		canvasElement.addEventListener(EVENT.TOUCH_MOVE, noop);
		canvasElement.addEventListener(EVENT.TOUCH_END, noop);
		canvasElement.addEventListener(EVENT.TOUCH_CANCEL, noop);

		canvasElement.addEventListener(EVENT.DOUBLE_CLICK, noop);
		canvasElement.addEventListener(EVENT.WHEEL, noop);

		canvasElement.addEventListener(EVENT.DRAG_OVER, noop);
		canvasElement.addEventListener(EVENT.KEYDOWN, noop);
	}
}
