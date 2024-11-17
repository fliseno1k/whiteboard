import { clamp } from "./math";
import { MAX_SCALE, MIN_SCALE } from "./viewport";
import type { Whiteboard } from "./whiteboard";

export type GridOptions = {
	size: number;
	steps: number;
	visible: boolean;
};

export type GridPreset = {
	scaleTreshold: number;
	spaceMultiplier: number;
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

	private readonly gridPresets: Array<GridPreset>;

	public constructor(whiteboard: Whiteboard, options: GridOptions) {
		this.options = Object.assign({}, options);
		this.whiteboard = whiteboard;

		this.gridPresets = this.computeGridPresets(MIN_SCALE, MAX_SCALE, this.options.steps, 1);
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

		const sizingPreset = this.gridPresets.find((preset) => preset.scaleTreshold >= viewport.scale)!;
		const adaptiveSize = this.options.size * sizingPreset.spaceMultiplier;
		const cellSize = this.options.steps * adaptiveSize;

		const lineOffsetX = (offsetX % adaptiveSize) - adaptiveSize;
		const lineOffsetY = (offsetY % adaptiveSize) - adaptiveSize;
		const lineOpacity = this.calculateGridLevelOpacity(viewport.scale, sizingPreset.scaleTreshold, 0, 1);

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

	private computeGridPresets(min: number, max: number, steps: number, initialScale: number = 1): Array<GridPreset> {
		const left: Array<GridPreset> = [];
		const right: Array<GridPreset> = [
			{
				scaleTreshold: 1,
				spaceMultiplier: 1,
			},
		];

		let powerLeft = 0;
		let prevScaleLeft = initialScale;
		while (prevScaleLeft > min) {
			powerLeft -= 1;
			prevScaleLeft = steps ** powerLeft;

			left.push({
				scaleTreshold: prevScaleLeft,
				spaceMultiplier: steps ** Math.abs(powerLeft),
			});
		}

		let powerRight = 0;
		let prevScaleRight = initialScale;
		while (prevScaleRight < max) {
			powerRight += 1;
			prevScaleRight = steps ** powerRight;

			right.push({
				scaleTreshold: prevScaleRight,
				spaceMultiplier: 1 / steps ** powerRight,
			});
		}

		return left.reverse().concat(right);
	}
}
