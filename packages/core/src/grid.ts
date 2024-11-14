import { clamp } from "./math";
import { MAX_SCALE, MIN_SCALE } from "./viewport";
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

	private readonly gridSpacing: Array<unknown>;

	public constructor(whiteboard: Whiteboard, options: GridOptions) {
		this.options = Object.assign({}, options);
		this.whiteboard = whiteboard;

		this.gridSpacing = [
			{ threshold: 0, multiplier: 4 * 4 * 4 },
			{ threshold: 1, multiplier: 4 * 4 * 4 },
			{ threshold: 4, multiplier: 4 * 4 },
			{ threshold: 8, multiplier: 4 },
			{ threshold: 32, multiplier: 1 },
			{ threshold: 32 * 4, multiplier: 0.25 },
			{ threshold: 32 * 4 * 4, multiplier: 0.25 / 4 },
		];
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

		const canvasDPRSize = canvas.measureDPRSize();
		const [width, height] = [canvasDPRSize.width, canvasDPRSize.height].map((value) =>
			Math.round(value / viewport.scale),
		);
		const [offsetX, offsetY] = viewport.offset.map(Math.round);

		const actualGridSize = this.options.size * viewport.scale;

		const sizingPreset = this.gridSpacing.find((preset) => preset.threshold >= actualGridSize)!;
		const adaptiveSize = this.options.size * sizingPreset.multiplier;
		const cellSize = this.options.steps * adaptiveSize;

		const lineOffsetX = (offsetX % adaptiveSize) - adaptiveSize;
		const lineOffsetY = (offsetY % adaptiveSize) - adaptiveSize;
		const lineOpacity = this.calculateGridLevelOpacity(actualGridSize, sizingPreset.threshold, 0, 1);

		canvas.context.save();
		canvas.setStyles({
			strokeStyle: "#5B5B5B",
		});
		viewport.applyTransform();

		for (let x = lineOffsetX; x < lineOffsetX + width; x += adaptiveSize) {
			const isBold = Math.round(x - offsetX) % cellSize === 0;

			canvas.setStyles({
				globalAlpha: isBold ? 1 : lineOpacity,
				lineWidth: 1 / viewport.scale,
			});

			canvas.line(-offsetX + x, -offsetY, -offsetX + x, -offsetY + height);
		}

		for (let y = lineOffsetY; y < lineOffsetY + height; y += adaptiveSize) {
			const isBold = Math.round(y - offsetY) % cellSize === 0;

			canvas.setStyles({
				globalAlpha: isBold ? 1 : lineOpacity,
				lineWidth: 1 / viewport.scale,
			});

			canvas.line(-offsetX, -offsetY + y, -offsetX + width, -offsetY + y);
		}

		canvas.context.restore();
	}

	private calculateGridLevelOpacity(
		scale: number,
		scaleThreshold: number,
		minOpacity: number,
		maxOpacity: number,
	): number {
		const normalizedScale = (scale - scaleThreshold / 4) / (scaleThreshold - scaleThreshold / 4);

		const opacity = clamp(normalizedScale, minOpacity, maxOpacity);

		return opacity;
	}
}
