import { clamp } from "./math";
import { Whiteboard } from "./whiteboard";

export const MAX_OFFSET = 5000;

/**
 * Encapsulates all the transformation logic required
 * for panning (translation) and zooming (scaling),
 * providing a centralized and consistent way to handle view adjustments
 */
export class Viewport {
	/**
	 * Horizontal translation offset
	 */
	private _offsetX!: number;

	/**
	 * Vertical translation offset
	 */
	private _offsetY!: number;

	/**
	 * Scaling factor
	 */
	private _scale!: number;

	/**
	 * Whiteboard instance
	 */
	private readonly whiteboard: Whiteboard;

	constructor(whiteboard: Whiteboard) {
		this.whiteboard = whiteboard;

		this.scale = 1;
		this.offsetX = 0;
		this.offsetY = 0;
	}

	/**
	 * Get viewport the xy-direction offset
	 */
	public get offset(): Array<number> {
		return [this._offsetX, this._offsetY];
	}

	/**
	 * Get viewport the x-direction translation offset
	 */
	public get offsetX(): number {
		return this._offsetX;
	}

	/**
	 * Set viewport the x-direction translation offset
	 */
	public set offsetX(value: number) {
		const [width] = this.whiteboard.canvas.size;

		const minOffsetX = -MAX_OFFSET * this.scale + width;
		const maxOffsetX = MAX_OFFSET * this.scale;

		this._offsetX = clamp(value, minOffsetX, maxOffsetX);
	}

	/**
	 * Get viewport the y-direction translation offset
	 */
	public get offsetY(): number {
		return this._offsetY;
	}

	/**
	 * Set viewport the y-direction translation offset
	 */
	public set offsetY(value: number) {
		const [_, height] = this.whiteboard.canvas.size;

		const minOffsetY = -MAX_OFFSET * this.scale + height;
		const maxOffsetY = MAX_OFFSET * this.scale;

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
		const [width, height] = this.whiteboard.canvas.size;

		const minScaleX = width / (2 * MAX_OFFSET);
		const minScaleY = height / (2 * MAX_OFFSET);

		this._scale = clamp(value, Math.max(minScaleX, minScaleY), 10);
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

		this.translate(worldAfterZoom[0] - worldBeforeZoom[0], worldAfterZoom[1] - worldBeforeZoom[1]);
	}

	/**
	 * Convert screen coordinates to world coordinates.
	 * @param x - The x-coordinate in screen space.
	 * @param y - The y-coordinate in screen space.
	 */
	public screenToWorld(x: number, y: number): [number, number] {
		const canvas = this.whiteboard.canvas;
		const rect = canvas.element.getBoundingClientRect();

		const canvasX = (x - rect.left) * this.whiteboard.ratio; // +
		const canvasY = (y - rect.top) * this.whiteboard.ratio; // +

		const worldX = canvasX / this.whiteboard.ratio / this._scale - this._offsetX;
		const worldY = canvasY / this.whiteboard.ratio / this._scale - this._offsetX;

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
