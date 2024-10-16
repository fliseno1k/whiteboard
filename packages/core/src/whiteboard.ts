import { Canvas } from "./canvas";
import { EventManager } from "./event-manager";
import { Grid } from "./grid";
import { Viewport } from "./viewport";

export class Whiteboard {
	/**
	 * Editor root html element
	 */
	public readonly holder: HTMLElement;

	/**
	 * Pixel ratio value
	 */
	public readonly ratio: number;

	/**
	 * Wrapper around canvas
	 */
	public readonly canvas: Canvas;

	/**
	 * Canvas viewport
	 */
	public readonly viewport: Viewport;

	/**
	 * Canvas grid renderer
	 */
	public readonly grid: Grid;

	/**
	 * Canvas events manager
	 */
	private readonly eventManager: EventManager;

	/**
	 * @param editorHolder - element into which canvas will be putted
	 */
	public constructor(editorHolder: HTMLElement) {
		this.holder = editorHolder;
		this.ratio = window.devicePixelRatio || 1;

		const canvasElement = this.createCanvas();
		this.holder.appendChild(canvasElement);

		this.grid = new Grid(this, { size: 16, steps: 5, visible: true });
		this.canvas = new Canvas(canvasElement, this.ratio);
		this.viewport = new Viewport(this);
		this.eventManager = new EventManager(this);

		this.eventManager.attatchEvents();
	}

	/**
	 * Fit editor (canvas) size to the holder (parent) element
	 */
	public fit(): void {
		const rect = this.holder.getBoundingClientRect();
		this.canvas.resize(rect.width, rect.height, this.ratio);

		this.render();
	}

	/**
	 * Render canvas content
	 */
	public render(): void {
		requestAnimationFrame(() => {
			this.cleaBackground();

			this.grid.render();

			this.canvas.context.save();
			this.viewport.applyTransform();
			this.canvas.setStyles({ strokeStyle: "#fff" });
			// this.canvas.line(-4990, -4990, 4990, -4990);
			this.canvas.line(-4950, 4990, -4950, -4990);
			// this.canvas.line(4990, 4990, -4990, 4990);
			// this.canvas.line(-4990, 4990, -4990, -4990);
			this.canvas.context.restore();

			console.log(this.viewport.offsetX);
		});
	}

	/**
	 *
	 */
	private cleaBackground(): void {
		this.canvas.context.fillStyle = "#1b1715";
		this.canvas.context.fillRect(0, 0, ...this.canvas.size);
	}

	/**
	 * Creates canvas html element
	 */
	private createCanvas(): HTMLCanvasElement {
		const canvasElement = document.createElement("canvas");

		canvasElement.tabIndex = 0;
		canvasElement.style.outline = "none";
		canvasElement.style.touchAction = "none";
		canvasElement.style.imageRendering = "pixelated";

		return canvasElement;
	}
}
