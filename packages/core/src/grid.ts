import type { CanvasStyleSheet } from "./canvas";
import type { Whiteboard } from "./whiteboard";

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
	private readonly options: GridOptions;

	/**
	 * Whiteboard instance
	 */
	private readonly whiteboard: Whiteboard;

	public constructor(whiteboard: Whiteboard, options: GridOptions) {
		this.options = Object.assign({}, options);
		this.whiteboard = whiteboard;
	}

	/**
	 * Toggle grid visibility
	 * @param next - is grid pattern should to be present
	 */
	public toggle(visible: GridOptions["visible"]): void {
		this.options.visible = visible;
	}

	/**
	 * Render grid
	 */
	public render(): void {
		if (!this.options.visible) return;

		const { canvas, viewport } = this.whiteboard;

		const [width, height] = canvas.size.map((v) => v / viewport.scale);
		const [offsetX, offsetY] = viewport.offset.map((v) => v / viewport.scale);

		const cellSize = this.options.size * this.options.steps;
		const actualGridSize = this.options.size * viewport.scale;

		const lineOffsetX = (offsetX % this.options.size) - this.options.size;
		const lineOffsetY = (offsetY % this.options.size) - this.options.size;

		canvas.context.save();
		viewport.applyTransform();

		canvas.setStyles({
			lineCap: "round",
			lineJoin: "round",
			globalAlpha: 1.0,
		});

		for (let x = lineOffsetX; x < lineOffsetX + width; x += this.options.size) {
			const isBold = Math.round(x - offsetX) % cellSize === 0;

			if (!isBold && actualGridSize < 14) {
				continue;
			}

			canvas.setStyles((isBold ? this.getBoldStyles : this.getNoneBoldStyles)(viewport.scale));
			canvas.line(-offsetX + x, -offsetY, -offsetX + x, -offsetY + height);
		}

		for (let y = lineOffsetY; y < lineOffsetY + height; y += this.options.size) {
			const isBold = Math.round(y - offsetY) % cellSize === 0;

			if (!isBold && actualGridSize < 14) {
				continue;
			}

			canvas.setStyles(isBold ? this.getBoldStyles(viewport.scale) : this.getNoneBoldStyles(viewport.scale));
			canvas.line(-offsetX, -offsetY + y, -offsetX + width, -offsetY + y);
		}

		canvas.context.restore();
	}

	/**
	 * Get canvas styles for bold grid line
	 */
	private getBoldStyles(scale: number): CanvasStyleSheet {
		return {
			lineDash: [],
			lineWidth: Math.min(1 / scale, 1),
			strokeStyle: "#243642",
		};
	}

	/**
	 * Get canvas styles for none-bold grid line
	 */
	private getNoneBoldStyles(scale: number): CanvasStyleSheet {
		const spaceWidth = 1 / scale;
		const lineWidth = Math.min(1 / scale, 4);

		return {
			lineDash: [lineWidth * 3, spaceWidth + (lineWidth + spaceWidth)],
			lineWidth,
			strokeStyle: "#387478",
		};
	}
}
