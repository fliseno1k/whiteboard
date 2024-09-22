import { Canvas } from "./canvas";
import { Grid } from "./grid";
import { Viewport } from "./viewport";

export class Whiteboard {
	/**
	 * Editor root html element
	 */
	private readonly holder: HTMLElement;

	/**
	 * Pixel ratio value
	 */
	private readonly ratio: number;

	/**
	 * Wrapper around canvas
	 */
	private readonly canvas: Canvas;

	/**
	 * Canvas viewport
	 */
	private readonly viewport: Viewport;

	/**
	 * Canvas grid renderer
	 */
	private readonly grid: Grid;

	/**
	 *
	 * @param editorHolder - elemtn into which canvas will be putted
	 */
	public constructor(editorHolder: HTMLElement) {
		this.holder = editorHolder;
		this.ratio = window.devicePixelRatio || 1;

		const canvasElement = this.createCanvas();
		this.holder.appendChild(canvasElement);

		this.canvas = new Canvas(canvasElement, this.ratio);
		this.viewport = new Viewport();
		this.grid = new Grid({ size: 16, steps: 5, visible: true });
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
	 * Creates canvas html element
	 */
	private createCanvas(): HTMLCanvasElement {
		const canvasElement = document.createElement("canvas");

		canvasElement.tabIndex = 0;
		canvasElement.style.outline = "none";
		canvasElement.style.touchAction = "none";

		return canvasElement;
	}

	/**
	 * Render canvas content
	 */
	private render(): void {
		this.grid.render({
			canvas: this.canvas,
			viewport: this.viewport,
		});
	}
}
