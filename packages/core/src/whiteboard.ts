import { Canvas } from "./canvas";
import { Grid } from "./grid";
import { InputSurface } from "./input-surface";
import { Viewport } from "./viewport";

export class Whiteboard {
	/**
	 * Editor root html element
	 */
	public readonly parent: HTMLElement;

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
	private readonly inputSurface: InputSurface;

	/**
	 * @param parent - element into which canvas will be putted
	 */
	public constructor(parent: HTMLElement) {
		this.parent = parent;
		this.ratio = window.devicePixelRatio || 1;

		const canvasElement = this.createCanvas();
		this.parent.appendChild(canvasElement);

		this.canvas = new Canvas(canvasElement);
		this.viewport = new Viewport(this);
		this.inputSurface = new InputSurface(this);

		this.grid = new Grid(this, { size: 128, steps: 4, visible: true });
	}

	public enable(): void {
		this.inputSurface.connect();
	}

	public disable(): void {
		this.inputSurface.disconnect();
	}

	/**
	 * Fit editor (canvas) size to the holder (parent) element
	 */
	public fitParent(): void {
		const rect = this.parent.getBoundingClientRect();
		this.canvas.resize(rect.width, rect.height, this.ratio);

		this.render();
	}

	/**
	 * Render canvas content
	 */
	public render(): void {
		requestAnimationFrame(() => {
			this.clearCanvas();
			this.grid.render();
		});
	}

	/**
	 * Clear canvas
	 */
	private clearCanvas(): void {
		const { width, height } = this.canvas.measureDPRSize();

		this.canvas.context.fillStyle = "#1b1715";
		this.canvas.context.fillRect(0, 0, width, height);
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
