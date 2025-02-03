export class Renderer {
	/** Rendering target HTML element */
	public readonly domElement: HTMLCanvasElement;

	/** Device pixel ratio */
	private pixelRation: number;

	constructor() {
		this.domElement = this.createRenderingTarget();
		this.pixelRation = window.devicePixelRatio || 1;
	}

	/** Resize rendering target HTML element  */
	public resize(width: number, height: number): void {
		this.domElement.width = Math.floor(width * this.pixelRation);
		this.domElement.height = Math.floor(height * this.pixelRation);

		this.domElement.style.width = width + "px";
		this.domElement.style.height = height + "px";
	}

	/** Repaint scene */
	public paint(): void {}

	/** Create rendering target HTML element */
	private createRenderingTarget(): HTMLCanvasElement {
		const domElement = document.createElement("canvas");
		domElement.tabIndex = 0;
		domElement.style.touchAction = "none";
		domElement.style.outline = "none";

		return domElement;
	}
}
