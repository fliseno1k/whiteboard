import { Canvas } from "./canvas";
import { Viewport } from "./viewport";

export type GridOptions = {
	size: number;
	steps: number;
	visible: boolean;
};

export type RenderOptions = {
	viewport: Viewport;
	canvas: Canvas;
};

/**
 * Draws canvas grid
 */
export class Grid {
	/**
	 * Size of single grid cell
	 */
	private size: GridOptions["size"];

	/**
	 * Number of lines inside single grid cell
	 */
	private steps: GridOptions["steps"];

	/**
	 * Need to show grid
	 */
	private visible: GridOptions["visible"];

	public constructor(options: GridOptions) {
		const { size, steps, visible } = options;

		this.size = options.size;
		this.steps = options.steps;
		this.visible = options.visible;
	}

	/**
	 * Toggle grid visibility
	 * @param next - is grid pattern should to be present
	 */
	public toggle(next: GridOptions["visible"]): void {
		this.visible = next;
	}

	/**
	 * Render grid
	 */
	public render(options: RenderOptions): void {
		if (!this.visible) {
			return;
		}

		this.renderGridPattern(options);
	}

	/**
	 * Render grid pattern on canvas
	 */
	private renderGridPattern(options: RenderOptions): void {
		const { canvas, viewport } = options;

		const [vOffsetX, vOffsetY] = [viewport.offsetX, viewport.offsetY];

		const lineOffsetX = (vOffsetX % this.size) + this.size;
		const lineOffsetY = (vOffsetY % this.size) + this.size;

		const cellSize = this.steps * this.size;

		const [width, height] = canvas.size.map((v) => v / viewport.scale);

		const lineBolding = [() => this.setNoneBoldStyles(canvas), () => this.setBoldStyles(canvas)];

		canvas.context.save();
		viewport.applyTransform(canvas);

		canvas.setStyles({
			lineCap: "round",
			lineJoin: "round",
			globalAlpha: 1.0,
		});

		const centerX = -vOffsetX + width / 2 - ((width / 2) % this.size) + lineOffsetX;
		const centerY = -vOffsetY + height / 2 - ((height / 2) % this.size) + lineOffsetY;

		let isBold = false;

		for (let x = 0; centerX + x < -vOffsetX + width + lineOffsetX; x += this.size) {
			const nextLeftX = centerX - x - this.size;
			isBold = this.steps > 1 && nextLeftX % cellSize === 0;
			lineBolding[+isBold]();

			canvas.line(nextLeftX, -vOffsetY, nextLeftX, Math.ceil(-vOffsetY + height));

			const nextRightX = centerX + x;

			isBold = this.steps > 1 && nextRightX % cellSize === 0;
			lineBolding[+isBold]();

			canvas.line(nextRightX, -vOffsetY, nextRightX, Math.ceil(-vOffsetY + height));
		}

		for (let y = 0; centerY + y < -vOffsetY + height + lineOffsetY; y += this.size) {
			const nextTopY = centerY - y - this.size;
			isBold = this.steps > 1 && nextTopY % cellSize === 0;
			lineBolding[+isBold]();

			canvas.line(-vOffsetX, nextTopY, Math.ceil(-vOffsetX + width), nextTopY);

			const nextBottomY = centerY + y;
			isBold = this.steps > 1 && nextBottomY % cellSize === 0;
			lineBolding[+isBold]();

			canvas.line(-vOffsetX, nextBottomY, Math.ceil(-vOffsetX + width), nextBottomY);
		}

		canvas.context.restore();
	}

	/**
	 * Set canvas styles for bold line
	 */
	private setBoldStyles(canvas: RenderOptions["canvas"]): void {
		canvas.setStyles({
			strokeStyle: "#2d2d2d",
			lineDash: [],
		});
	}

	/**
	 * Set canvas styles for none-bold line
	 */
	private setNoneBoldStyles(canvas: RenderOptions["canvas"]): void {
		canvas.setStyles({
			strokeStyle: "#252423",
			lineDash: [],
		});
	}
}
