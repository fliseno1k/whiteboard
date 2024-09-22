import { Canvas } from "./canvas";
import { genClamp } from "./math";

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
	 * Clamp function for {@link _offsetX offsetX} argument
	 */
	private readonly clampOffsetX: (value: number) => number;

	/**
	 * Clamp function for {@link _offsetY offsetY} argument
	 */
	private readonly clampOffsetY: (value: number) => number;

	/**
	 * Clamp function for {@link _scale scale} argument
	 */
	private readonly clampScale: (value: number) => number;

	public constructor() {
		this._scale = 1;
		this._offsetX = 0;
		this._offsetY = 0;

		this.clampScale = genClamp(0.1, 10);
		this.clampOffsetX = genClamp(-5000, 5000);
		this.clampOffsetY = genClamp(-5000, 5000);
	}

	/**
	 * Get viewport horizontal translation offset
	 */
	public get offsetX(): number {
		return this._offsetX;
	}

	public set offsetX(value: number) {
		this._offsetX = this.clampOffsetX(value);
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
		this._offsetY = this.clampOffsetY(value);
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
	 * Applies the current scale and translation to the canvas context.
	 */
	public applyTransform(canvas: Canvas): void {
		canvas.context.setTransform(this._scale, 0, 0, this._scale, this._offsetX, this._offsetY);
	}

	/**
	 * Resets the canvas transformation to the default state.
	 */
	public resetTransform(canvas: Canvas): void {
		canvas.context.setTransform(1, 0, 0, 1, 0, 0);
	}

	/**
	 * Translates the viewport by specified amounts
	 * @param dx - amount to translate in the x-direction
	 * @param dy - amount to translate in the y-direction
	 */
	public translate(dx: number, dy: number): void {
		this.offsetX += dx;
		this.offsetY += dy;
	}

	/**
	 * Adjusts the viewport to zoom at a specific point.
	 * @param x - The x-coordinate to zoom around.
	 * @param y - The y-coordinate to zoom around.
	 * @param scale - The factor by which to zoom.
	 */
	public zoomAtPoint(x: number, y: number, scale: number): void {
		const newScale = this._scale * scale;
		const deltaScale = newScale - this._scale;

		this.offsetX -= ((x - this._offsetX) * deltaScale) / newScale;
		this.offsetY -= ((y - this._offsetY) * deltaScale) / newScale;

		this.scale = newScale;
	}

	/**
	 * Converts screen coordinates to world coordinates.
	 * @param x - The x-coordinate in screen space.
	 * @param y - The y-coordinate in screen space.
	 * @param canvas - The HTMLCanvasElement.
	 */
	public screenToWorld(x: number, y: number, ratio: number, canvas: Canvas): [number, number] {
		const [width, height] = canvas.size;
		const rect = canvas.element.getBoundingClientRect();

		const canvasX = (x - rect.left) * (width / rect.width);
		const canvasY = (y - rect.top) * (height / rect.height);

		// Account for device pixel ratio if necessary
		const devicePixelRatio = window.devicePixelRatio || 1;
		const adjustedX = canvasX / devicePixelRatio;
		const adjustedY = canvasY / devicePixelRatio;

		// Inverse viewport transformations
		const worldX = (adjustedX - this._offsetX) / this._scale;
		const worldY = (adjustedY - this._offsetY) / this._scale;

		return [worldX, worldY];
	}

	/**
	 * Converts world coordinates to canvas coordinates.
	 * @param x - The x-coordinate in world space.
	 * @param y - The y-coordinate in world space.
	 */
	public worldToCanvas(x: number, y: number): [number, number] {
		const canvasX = x * this._scale + this._offsetX;
		const canvasY = y * this._scale + this._offsetY;

		return [canvasX, canvasY];
	}

	/**
	 * Converts canvas coordinates to world coordinates.
	 * @param x - The x-coordinate in canvas space.
	 * @param y - The y-coordinate in canvas space.
	 */
	public canvasToWorld(x: number, y: number): [number, number] {
		const worldX = (x - this._offsetX) / this._scale;
		const worldY = (y - this._offsetY) / this._scale;

		return [worldX, worldY];
	}
}
