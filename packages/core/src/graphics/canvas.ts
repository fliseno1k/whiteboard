import { invariant } from "../utils";

/**
 * Wrapper on top of native html canvas element
 */
export class Canvas {
	/**
	 * Native canvas html element
	 */
	private readonly domElement: HTMLCanvasElement;

	/**
	 * Canvas rendering context
	 */
	private readonly context: CanvasRenderingContext2D;

	/**
	 * Origin point that refers to a fixed reference position
	 */
	private origin: [number, number] = [0, 0];

	/**
	 * Pixel radio of user's device
	 */
	private readonly pixelRatio: number;

	/**
	 * Canvas scale
	 */
	private scale: number = 1;

	public constructor(domElement: HTMLCanvasElement, pixelRatio: number) {
		this.domElement = domElement;
		this.pixelRatio = pixelRatio;

		let _context = domElement.getContext("2d");
		invariant(_context, "Failed to get 2D context from canvas");

		this.context = _context;
	}

	/**
	 * Returns canvas dom element
	 */
	public getElement(): HTMLCanvasElement {
		return this.domElement;
	}

	/**
	 * Returns size of canvas dom element
	 */
	public readSize(): [number, number] {
		const { width, height } = this.domElement;

		return [width, height];
	}

	/**
	 * Translates global context to canvas one
	 */
	public globalTransform(): Canvas {
		const multiplier = this.scale * this.pixelRatio;

		this.context.scale(multiplier, multiplier);
		this.context.translate(this.origin[0] * multiplier, this.origin[1] * multiplier);

		return this;
	}

	/**
	 * Saves canvas entire state
	 */
	public save(): Canvas {
		this.context.save();

		return this;
	}

	/**
	 * Resets the rendering context to its default state
	 */
	public restore(): Canvas {
		this.context.restore();

		return this;
	}

	/**
	 * Repaints canvas contents
	 */
	public repaint(): Canvas {
		return this;
	}
}
