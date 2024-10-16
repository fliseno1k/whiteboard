import { Whiteboard } from "./whiteboard";

export type GridOptions = {
	size: number;
	steps: number;
	visible: boolean;
};

/**
 * Draws canvas grid
 */
export class Grid {
	/**
	 * Grid options
	 */
	private options: GridOptions;

	/**
	 * Whiteboard instance
	 */
	private readonly whiteboard: Whiteboard;

	public constructor(whiteboard: Whiteboard, options: GridOptions) {
		this.whiteboard = whiteboard;
		this.options = Object.assign({}, options);
	}

	/**
	 * Toggle grid visibility
	 * @param next - is grid pattern should to be present
	 */
	public toggle(next: GridOptions["visible"]): void {
		this.options.visible = next;
	}

	/**
	 * Render grid
	 */
	public render(): void {
		if (!this.options.visible) {
			return;
		}

		this.renderGridPattern();
	}

	/**
	 * Render grid pattern on canvas
	 */
	private renderGridPattern(): void {
		const { canvas, viewport } = this.whiteboard;
		const { size, steps } = this.options;

		const offsetX = (viewport.offsetX % size) - size;
		const offsetY = (viewport.offsetY % size) - size;

		const [width, height] = canvas.size;

		const actualGridSize = size * viewport.scale;

		const spaceWidth = 1 / viewport.scale;

		canvas.context.save();
		viewport.applyTransform();

		canvas.setStyles({
			lineCap: "round",
			lineJoin: "round",
			globalAlpha: 1.0,
		});

		let isBold = false;

		this.setBoldStyles();

		for (let x = -offsetX; x < offsetX + width + size; x += size) {
			const isBold = steps > 1 && Math.round(x - scrollX) % (steps * size) === 0;
			if (!isBold && actualGridSize < 10) {
				continue;
			}

			const lineWidth = Math.min(1 / viewport.scale, isBold ? 4 : 1);
			const lineDash = [lineWidth * 3, spaceWidth + (lineWidth + spaceWidth)];
			canvas.context.lineWidth = lineWidth;

			canvas.setStyles({ lineDash: isBold ? [] : lineDash });

			canvas.line(x, offsetY - size, x, Math.ceil(offsetY + height + size));
		}

		// for (let y = 0; centerY + y < -vOffsetY + height + lineOffsetY; y += size) {
		// 	const nextTopY = centerY - y - size;
		// 	isBold = steps > 1 && nextTopY % cellSize === 0;
		// 	lineBolding[+isBold]();

		// 	canvas.line(-vOffsetX, nextTopY, Math.ceil(-vOffsetX + width), nextTopY);

		// 	const nextBottomY = centerY + y;
		// 	isBold = steps > 1 && nextBottomY % cellSize === 0;
		// 	lineBolding[+isBold]();

		// 	canvas.line(-vOffsetX, nextBottomY, Math.ceil(-vOffsetX + width), nextBottomY);
		// }

		canvas.context.restore();
	}

	/**
	 * Set canvas styles for bold line
	 */
	private setBoldStyles(): void {
		this.whiteboard.canvas.setStyles({
			strokeStyle: "#2d2d2d",
			lineDash: [],
		});
	}

	/**
	 * Set canvas styles for none-bold line
	 */
	private setNoneBoldStyles(): void {
		this.whiteboard.canvas.setStyles({
			strokeStyle: "#252423",
			lineDash: [],
		});
	}
}
