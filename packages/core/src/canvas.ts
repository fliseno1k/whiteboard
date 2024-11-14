import { invariant } from "./utils";

export type CanvasStyleSheet = Partial<
	Pick<CanvasRenderingContext2D, "lineCap" | "lineJoin" | "globalAlpha" | "strokeStyle" | "fillStyle" | "lineWidth"> & {
		lineDash: Parameters<CanvasRenderingContext2D["setLineDash"]>[0];
	}
>;

export type Dimension = {
	width: number;
	height: number;
};

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

	/**
	 * Canvas memoized bounding rect
	 */
	private memoBoundingRect: DOMRect;

	/**
	 * Canvas memoized DPR size
	 */
	private memoDPRSize: Dimension;

	public constructor(element: HTMLCanvasElement) {
		let _context = element.getContext("2d");
		invariant(_context, "Failed to get 2D context from canvas");

		this.context = _context;
		this.element = element;

		this.memoBoundingRect = this.element.getBoundingClientRect();
		this.memoDPRSize = {
			width: this.element.width,
			height: this.element.height,
		};
	}

	/**
	 * Measure html canvas element bounding rect
	 */
	public measureBoundingRect(): Readonly<DOMRect> {
		return this.memoBoundingRect;
	}

	/**
	 * Measure html canvas element DPR size
	 */
	public measureDPRSize(): Readonly<Dimension> {
		return this.memoDPRSize;
	}

	/**
	 * Set canvas styles
	 */
	public setStyles(styleSheet: CanvasStyleSheet): Canvas {
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
	public resize(width: number, height: number, dpr: number): void {
		this.element.width = Math.floor(width * dpr);
		this.element.height = Math.floor(height * dpr);
		this.element.style.width = width + "px";
		this.element.style.height = height + "px";

		this.memoBoundingRect = this.element.getBoundingClientRect();
		this.memoDPRSize.width = this.element.width;
		this.memoDPRSize.height = this.element.height;
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
