import "./style.css";


// types 

const enum Mouse {
	LEFT, // main button (left button)
	WHEEL, // auxiliary button (wheel or middle button)
	RIGHT, // secondary button (right button)
};

// predefined

const AUTOSCROLL_STEP = 2;
const AUTOSCROLL_SPEED = 20; // speed in 1..1000
const AUTOSCROLL_MARGIN = 30; // px

// state like
let enabled = true;
let scale = 1;
let origin = [0.0, 0.0];
let gridSize = [8, 8];
let down = [0, 0];
let dx = 0;
let dy = 0;
let timerId = null;

const speed = Math.round(AUTOSCROLL_SPEED / 1000);
const activeButtons = new Set<Mouse>();

// initialize canvas
const canvasEl = document.querySelector("canvas#whiteboard") as HTMLCanvasElement;
const g = canvasEl.getContext("2d") as CanvasRenderingContext2D;
canvasEl.tabIndex = 0; // enable focus
canvasEl.style.touchAction = "none"; // prevent pointer cancel event in mobile;
canvasEl.style.outline = "none"; // remove focus outline;

// pixel ratio
const pixelRatio = window.devicePixelRatio ?? 1;

// canvas event listeners
canvasEl.addEventListener("pointerdown", ifEnabled(pointerDown));
canvasEl.addEventListener("pointermove", ifEnabled(pointerMove));
canvasEl.addEventListener("pointerup", ifEnabled(pointerUp));
canvasEl.addEventListener("pointercancel", ifEnabled(debugCanvasEvent));
canvasEl.addEventListener("touchstart", ifEnabled(debugCanvasEvent));
canvasEl.addEventListener("touchmove", ifEnabled(debugCanvasEvent));
canvasEl.addEventListener("touchend", ifEnabled(debugCanvasEvent));
canvasEl.addEventListener("touchcancel", ifEnabled(debugCanvasEvent));
canvasEl.addEventListener("dblclick", ifEnabled(debugCanvasEvent));
canvasEl.addEventListener("wheel", ifEnabled(wheel));
canvasEl.addEventListener("dragover", ifEnabled(debugCanvasEvent));
canvasEl.addEventListener("drop", ifEnabled(debugCanvasEvent));
canvasEl.addEventListener("keydown", ifEnabled(debugCanvasEvent));

// window event listeners
window.addEventListener('resize', fit);
window.addEventListener('DOMContentLoaded', fit);


function ifEnabled<Fn extends (..._: any) => any, T extends Parameters<Fn>>(fn: Fn) {
	return (...args: T) => {
		if (!enabled) return;
		fn(...args);
	};
}

function debugCanvasEvent(e: Event) {
	console.log(`[canvas event]: ${e.type}`);
}

function pointerDown(e: PointerEvent) {
	activeButtons.add(e.button);

	if (activeButtons.has(Mouse.LEFT)) {
		down = [e.offsetX, e.offsetY];
	}
}

function pointerUp(e: PointerEvent) {
	if (activeButtons.has(e.button) && e.button === Mouse.LEFT) {
		activeButtons.delete(e.button);
		down = [0, 0];
	}
}

function pointerMove(e: PointerEvent) {
	if (activeButtons.has(Mouse.LEFT)) {
		let dx = (e.offsetX - down[0]) / scale;
		let dy = (e.offsetY - down[1]) / scale;
		moveOrigin(dx, dy);
		down = [e.offsetX, e.offsetY];
	}
}

function wheel(e: PointerEvent) {
  wheelCanvas(e);
}

function moveOrigin(dx: number, dy: number) {
	setOrigin(origin[0] + dx, origin[1] + dy);

}

function setOrigin(x: number, y: number) {
    origin = [x, y];
    repaint();
  }

function fit() {
	const rect = (canvasEl.parentElement as HTMLElement).getBoundingClientRect();
	setSize(rect.width, rect.height);
}

function setSize(width: number, height: number) {
    canvasEl.width = width;
    canvasEl.height = height;
    canvasEl.width = Math.floor(width * pixelRatio);
    canvasEl.height = Math.floor(height * pixelRatio);
    canvasEl.style.width = width + "px";
    canvasEl.style.height = height + "px";

	repaint();
}

function getSize(): [number, number] {
	return [canvasEl.width, canvasEl.height];
}

function globalCoordTransformRev(point: [number, number]): number[] {
    const x = point[0] / pixelRatio / scale - origin[0];
    const y = point[1] / pixelRatio / scale - origin[1];
    return [x, y];
}

function repaint() {
	clearBackground();
	drawGrid();
}

function clearBackground() {
	g.fillStyle = '#242424';
    g.fillRect(0, 0, canvasEl.width, canvasEl.height);
}

function globalTransform() {
    g.translate(
      origin[0] * scale * pixelRatio,
      origin[1] * scale * pixelRatio
    );
    g.scale(scale * pixelRatio, scale * pixelRatio);
}

function drawGrid() {
	const sz = getSize();

	g.save()
	globalTransform();

	const p1 = globalCoordTransformRev([0, 0]);
	const p2 = globalCoordTransformRev(sz);

	let w = gridSize[0] * 2;
	let h = gridSize[1] * 2;
	let thick = Math.max(Math.round(1 / scale), 1);
	if (scale < 0.2) {
		w = gridSize[0] * 16;
		h = gridSize[1] * 16;
	} else if (scale < 0.4) {
		w = gridSize[0] * 8;
		h = gridSize[1] * 8;
	} else if (scale < 0.8) {
		w = gridSize[0] * 4;
		h = gridSize[1] * 4;
	}
	const wc = Math.floor((p2[0] - p1[0]) / w);
	const wh = Math.floor((p2[1] - p1[1]) / h);

	g.strokeStyle = '#C0C0C0';
	g.lineWidth = thick;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.globalAlpha = 1.0;
    g.setLineDash(
      [].map((v) => v * thick)
    );

	for (let i = 0; i <= wc + w; i++) {
		const x = p1[0] + i * w - (p1[0] % w);
		line(x, p1[1], x, p2[1]);
	}

	for (let i = 0; i <= wh + h; i++) {
		const y = p1[1] + i * h - (p1[1] % h);
		line(p1[0], y, p2[0], y);
	}

	g.restore();
}

function line(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
) {
    g.beginPath();
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);
    g.stroke();
}

function timerHandler() {
	let scrolled = false;

	if (dx !== 0) {
	  let x = Math.round(origin[0] + dx);
	  if (origin[0] !== x) {
      origin[0] = x;
      scrolled = true;
	  }
	}

	if (dy !== 0) {
	  let y = Math.round(origin[1] + this.dy);
	  if (origin[1] !== y) {
      origin[1] = y;
      scrolled = true;
	  }
	}

	if (scrolled) {
	  repaint(true);
	}
};

function wheelCanvas(e: PointerEvent) {
  const [x, y] = CCSPointFromPointerEvent(e);
  const dx = -e.deltaX;
  const dy = -e.deltaY;
  const h = getSize()[1] / (pixelRatio * 4);
  moveOrigin(dx, dy);
}

function CCSPointFromPointerEvent(e: PointerEvent): [number, number] {
  const rect = canvasEl.getBoundingClientRect();
  let _p = [e.clientX - rect.left, e.clientY - rect.top];
  let p = [_p[0] * pixelRatio, _p[1] * pixelRatio];
  return p;
}