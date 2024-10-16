import { Canvas } from "./canvas";
import { clamp, genClamp } from "./math";
import { Whiteboard } from "./whiteboard";

/**
 * Encapsulates all the transformation logic required
 * for panning (translation) and zooming (scaling),
 * providing a centralized and consistent way to handle view adjustments
 */
export class Viewport {
	/**
	 * Horizontal translation offset
	 */
	private _offsetX: number;

	/**
	 * Vertical translation offset
	 */
	private _offsetY: number;

	/**
	 * Scaling factor
	 */
	private _scale: number;

	/**
	 * Clamp function for {@link _scale scale} argument
	 */
	private readonly clampScale: (value: number) => number;

	/**
	 * Whiteboard instance
	 */
	private readonly whiteboard: Whiteboard;

	public constructor(whiteboard: Whiteboard) {
		this._scale = 1;
		this._offsetX = 0;
		this._offsetY = 0;

		this.clampScale = genClamp(0.1, 10);

		this.whiteboard = whiteboard;
	}

	/**
	 * Get viewport horizontal translation offset
	 */
	public get offsetX(): number {
		return this._offsetX;
	}

	public set offsetX(value: number) {
		const [width] = this.whiteboard.canvas.size;

		const minOffsetX = -5000 * this.scale + width;
		const maxOffsetX = 5000 * this.scale;

		this._offsetX = clamp(value, minOffsetX, maxOffsetX);
	}

	/**
	 * Get viewport vertical translation offset
	 */
	public get offsetY(): number {
		return this._offsetY;
	}

	/**
	 * Set viewport vertical translation offset
	 */
	public set offsetY(value: number) {
		const [_, height] = this.whiteboard.canvas.size;

		const minOffsetY = -5000 * this.scale + height;
		const maxOffsetY = 5000 * this.scale;

		this._offsetY = clamp(value, minOffsetY, maxOffsetY);
	}

	/**
	 * Get viewport scale factor
	 */
	public get scale(): number {
		return this._scale;
	}

	/**
	 * Set viewport scale factor
	 */
	public set scale(value: number) {
		this._scale = this.clampScale(value);
	}

	/**
	 * Apply the current scale and translation to the canvas context.
	 */
	public applyTransform(): void {
		this.whiteboard.canvas.context.setTransform(this._scale, 0, 0, this._scale, this._offsetX, this._offsetY);
	}

	/**
	 * Reset the canvas transformation to the default state.
	 */
	public resetTransform(): void {
		this.whiteboard.canvas.context.setTransform(1, 0, 0, 1, 0, 0);
	}

	/**
	 * Translate the viewport by specified amounts
	 * @param dx - amount to translate in the x-direction
	 * @param dy - amount to translate in the y-direction
	 */
	public translate(dx: number, dy: number): void {
		this.offsetX += dx;
		this.offsetY += dy;
	}

	/**
	 * Adjust the viewport to zoom at a specific point.
	 * @param x - The screen x-coordinate to zoom around.
	 * @param y - The screen y-coordinate to zoom around.
	 * @param scale - The factor by which to zoom.
	 */
	public zoomAtPoint(x: number, y: number, scale: number): void {
		const worldBeforeZoom = this.screenToWorld(x, y);

		this.scale *= scale;

		const worldAfterZoom = this.screenToWorld(x, y);

		this.offsetX += ((worldAfterZoom[0] - worldBeforeZoom[0]) * this._scale) / this.whiteboard.ratio;
		this.offsetY += ((worldAfterZoom[1] - worldBeforeZoom[1]) * this._scale) / this.whiteboard.ratio;
	}

	/**
	 * Convert screen coordinates to world coordinates.
	 * @param x - The x-coordinate in screen space.
	 * @param y - The y-coordinate in screen space.
	 */
	public screenToWorld(x: number, y: number): [number, number] {
		const canvas = this.whiteboard.canvas;
		const rect = canvas.element.getBoundingClientRect();

		const canvasX = (x - rect.left) * this.whiteboard.ratio;
		const canvasY = (y - rect.top) * this.whiteboard.ratio;

		const worldX = (canvasX - this._offsetX) / this._scale;
		const worldY = (canvasY - this._offsetY) / this._scale;

		return [worldX, worldY];
	}

	/**
	 * Converts world coordinates to canvas coordinates.
	 * @param x - The x-coordinate in world space.
	 * @param y - The y-coordinate in world space.
	 */
	public worldToCanvas(x: number, y: number): [number, number] {
		const canvasX = (x * this._scale + this._offsetX) / this.whiteboard.ratio;
		const canvasY = (y * this._scale + this._offsetY) / this.whiteboard.ratio;

		return [canvasX, canvasY];
	}

	/**
	 * Convert canvas coordinates to world coordinates.
	 * @param x - The x-coordinate in canvas space.
	 * @param y - The y-coordinate in canvas space.
	 */
	public canvasToWorld(x: number, y: number): [number, number] {
		const worldX = (x * this.whiteboard.ratio - this._offsetX) / this._scale;
		const worldY = (y * this.whiteboard.ratio - this._offsetY) / this._scale;

		return [worldX, worldY];
	}
}
