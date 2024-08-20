import "./style.css";

// state like
let enabled = true;

// initialize canvas
const canvasEl = document.querySelector("canvas#whiteboard") as HTMLCanvasElement;
canvasEl.tabIndex = 0; // enable focus
canvasEl.style.touchAction = "none"; // prevent pointer cancel event in mobile;
canvasEl.style.outline = "none"; // remove focus outline;

// pixel ratio
const pixelRatio = window.devicePixelRatio ?? 1;

canvasEl.addEventListener("pointerdown", ifEnabled(debugCanvasEvent));
canvasEl.addEventListener("pointermove", ifEnabled(debugCanvasEvent));
canvasEl.addEventListener("pointerup", ifEnabled(debugCanvasEvent));
canvasEl.addEventListener("pointercancel", ifEnabled(debugCanvasEvent));
canvasEl.addEventListener("touchstart", ifEnabled(debugCanvasEvent));
canvasEl.addEventListener("touchmove", ifEnabled(debugCanvasEvent));
canvasEl.addEventListener("touchend", ifEnabled(debugCanvasEvent));
canvasEl.addEventListener("touchcancel", ifEnabled(debugCanvasEvent));
canvasEl.addEventListener("dblclick", ifEnabled(debugCanvasEvent));
canvasEl.addEventListener("wheel", ifEnabled(debugCanvasEvent));
canvasEl.addEventListener("dragover", ifEnabled(debugCanvasEvent));
canvasEl.addEventListener("drop", ifEnabled(debugCanvasEvent));
canvasEl.addEventListener("keydown", ifEnabled(debugCanvasEvent));

function ifEnabled<Fn extends (..._: any) => any, T extends Parameters<Fn>>(fn: Fn) {
	return (...args: T) => {
		if (!enabled) return;
		fn(...args);
	};
}

function debugCanvasEvent(e: Event) {
	console.log(`[canvas event]: ${e.type}`);
}
