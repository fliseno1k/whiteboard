import { invariant } from "./utils";

/**
 * Wrapper on top of native html canvas element
 */
export class Canvas {
	/**
	 * Native canvas html element
	 */
	public readonly element: HTMLCanvasElement;

	/**
	 * Canvas rendering context
	 */
	public readonly context: CanvasRenderingContext2D;

	public constructor(element: HTMLCanvasElement, ratio: number) {
		this.element = element;

		let _context = element.getContext("2d");
		invariant(_context, "Failed to get 2D context from canvas");

		this.context = _context;
	}

	/**
	 * Returns size of canvas dom element
	 */
	public get size(): [number, number] {
		const { width, height } = this.element;

		return [width, height];
	}

	/**
	 * Set canvas styles
	 */
	public setStyles(
		styleSheet: Partial<
			Pick<CanvasRenderingContext2D, "lineCap" | "lineJoin" | "globalAlpha" | "strokeStyle"> & {
				lineDash: Parameters<CanvasRenderingContext2D["setLineDash"]>[0];
			}
		>,
	): Canvas {
		const { lineDash, ...styles } = styleSheet;

		Object.assign(this.context, styles);

		if (lineDash) {
			this.context.setLineDash(lineDash);
		}

		return this;
	}

	/**
	 * Resize native canvas html element
	 */
	public resize(width: number, height: number, ratio: number): void {
		this.element.width = Math.floor(width * ratio);
		this.element.height = Math.floor(height * ratio);
		this.element.style.width = width + "px";
		this.element.style.height = height + "px";
	}

	/**
	 * Draw line
	 */
	public line(x1: number, y1: number, x2: number, y2: number): void {
		this.context.beginPath();
		this.context.moveTo(x1, y1);
		this.context.lineTo(x2, y2);
		this.context.stroke();
	}
}
