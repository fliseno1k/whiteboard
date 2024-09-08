import "./style.css";

// types

type Point = [number, number];

const enum Mouse {
	LEFT, // main button (left button)
	WHEEL, // auxiliary button (wheel or middle button)
	RIGHT, // secondary button (right button)
}

// state like
let enabled = true;
let scale = 1;
let origin = [0.0, 0.0];
let gridSize = [8, 8];
let down = [0, 0];
let isPinching = false;
let initialDistance = 0;
let initialScale = 0;
let touchPoint: Point = [0, 0];

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
canvasEl.addEventListener("touchstart", ifEnabled(touchStart));
canvasEl.addEventListener("touchmove", ifEnabled(touchMove));
canvasEl.addEventListener("touchend", ifEnabled(touchEnd));
canvasEl.addEventListener("touchcancel", ifEnabled(debugCanvasEvent));
canvasEl.addEventListener("dblclick", ifEnabled(debugCanvasEvent));
canvasEl.addEventListener("wheel", ifEnabled(wheel));
canvasEl.addEventListener("dragover", ifEnabled(debugCanvasEvent));
canvasEl.addEventListener("drop", ifEnabled(debugCanvasEvent));
canvasEl.addEventListener("keydown", ifEnabled(debugCanvasEvent));

// window event listeners
window.addEventListener("resize", fit);
window.addEventListener("DOMContentLoaded", fit);

function ifEnabled<Fn extends (..._: any) => any, T extends Parameters<Fn>>(fn: Fn) {
	return (...args: T) => {
		if (!enabled) return;
		fn(...args);
	};
}

function debugCanvasEvent(e: Event | PointerEvent | TouchEvent | WheelEvent) {
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

function wheel(e: WheelEvent) {
	e.preventDefault();
	wheelCanvas(e);
}

function touchStart(e: TouchEvent) {
	isPinching = e.touches.length === 2;
	focus();

	if (isPinching) {
		const xd = e.touches[0].clientX - e.touches[1].clientX;
		const yd = e.touches[0].clientY - e.touches[1].clientY;

		initialScale = scale;
		initialDistance = Math.sqrt(xd * xd + yd * yd);
	}
}

function touchMove(e: TouchEvent) {
	if (!isPinching || e.touches.length !== 2) return;

	const xd = e.touches[0].clientX - e.touches[1].clientX;
	const yd = e.touches[0].clientY - e.touches[1].clientY;
	const currentDistance = Math.sqrt(xd * xd + yd * yd);

	const rect = canvasEl.getBoundingClientRect();
	const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
	const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;

	let _p: Point = [cx - rect.left, cy - rect.top];
	let p: Point = [_p[0] * pixelRatio, _p[1] * pixelRatio];

	const p1 = globalCoordTransformRev(touchPoint);
	const p2 = globalCoordTransformRev(p);
	const scale = currentDistance / initialDistance;

	setScale(initialScale * scale);
	moveOrigin(p2[0] - p1[0], p2[1] - p1[1]);
	touchPoint = p;
}

function touchEnd(e: TouchEvent) {
	e.stopImmediatePropagation();
	isPinching = false;
	initialScale = 1;
	initialDistance = 0;
	touchPoint = [-1, -1];
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

function setScale(next: number) {
	if (next < 0.1) {
		next = 0.1;
	}

	if (next > 10) {
		next = 10;
	}

	scale = next;
	repaint();
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
	g.fillStyle = "#242424";
	g.fillRect(0, 0, canvasEl.width, canvasEl.height);
}

function globalTransform() {
	g.translate(origin[0] * scale * pixelRatio, origin[1] * scale * pixelRatio);
	g.scale(scale * pixelRatio, scale * pixelRatio);
}

function drawGrid() {
	const sz = getSize();

	g.save();
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

	g.strokeStyle = "#C0C0C0";
	g.lineWidth = thick;
	g.lineCap = "round";
	g.lineJoin = "round";
	g.globalAlpha = 1.0;
	g.setLineDash([].map((v) => v * thick));

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

function line(x1: number, y1: number, x2: number, y2: number) {
	g.beginPath();
	g.moveTo(x1, y1);
	g.lineTo(x2, y2);
	g.stroke();
}

function wheelCanvas(e: WheelEvent) {
	const dx = -e.deltaX;
	const dy = -e.deltaY;
	e.preventDefault();

	if (e.ctrlKey || e.metaKey) {
		const p = CCSPointFromPointerEvent(e);
		const h = getSize()[1] / (pixelRatio * 4);
		const p1 = globalCoordTransformRev(p);
		setScale(scale * (1 + dy / h));

		const p2 = globalCoordTransformRev(p);
		moveOrigin(p2[0] - p1[0], p2[1] - p1[1]);
	} else {
		moveOrigin(dx, dy);
	}
}

function CCSPointFromPointerEvent(e: PointerEvent | WheelEvent): Point {
	const rect = canvasEl.getBoundingClientRect();
	let _p = [e.clientX - rect.left, e.clientY - rect.top];
	let p = [_p[0] * pixelRatio, _p[1] * pixelRatio];
	return p as Point;
}

function focus() {
	canvasEl.focus();
}

function createTouchEvent(element: HTMLCanvasElement, ratio: number, e: TouchEvent): CanvasPointerEvent {
	const isDoubleTouch = e.touches.length === 2;
	const rect = element.getBoundingClientRect();

	const cx = isDoubleTouch ? (e.touches[0].clientX + e.touches[1].clientX) / 2 : e.touches[0].clientX;
	const cy = isDoubleTouch ? (e.touches[0].clientY + e.touches[1].clientY) / 2 : e.touches[0].clientY;
	const p = [(cx - rect.left) * ratio, (cy - rect.top) * ratio];

	const options = {
		button: 0,
		shiftKey: false,
		altKey: false,
		ctrlKey: false,
		metaKey: false,
		touchDistance: 0,
	};

	if (isDoubleTouch) {
		const xd = e.touches[0].clientX - e.touches[1].clientX;
		const yd = e.touches[0].clientY - e.touches[1].clientY;
		options.touchDistance = Math.sqrt(xd * xd + yd * yd);
	}

	return new CanvasPointerEvent(p[0], p[1], options);
}

function createPointerEvent(element: HTMLCanvasElement, ratio: number, e: PointerEvent): CanvasPointerEvent {
	const rect = element.getBoundingClientRect();
	const [x, y] = [(e.clientX - rect.left) * ratio, (e.clientY - rect.top) * ratio];
	return new CanvasPointerEvent(x, y, e);
}

class CanvasPointerEvent {
	/**
	 * X-position in CCS (Canvas coord-system)
	 */
	x: number;

	/**
	 * Y-position in CCS (Canvas coord-system)
	 */
	y: number;

	button: number;
	shiftDown: boolean;
	altDown: boolean;
	ctrlDown: boolean;
	ModDown: boolean;
	leftButtonDown: boolean;
	touchDistance: number;

	constructor(
		x: number,
		y: number,
		e: {
			button: number;
			shiftKey: boolean;
			altKey: boolean;
			ctrlKey: boolean;
			metaKey: boolean;
			touchDistance?: number;
		},
	) {
		this.x = x;
		this.y = y;
		this.button = e.button;
		this.shiftDown = e.shiftKey;
		this.altDown = e.altKey;
		this.ctrlDown = e.ctrlKey;
		this.ModDown = e.metaKey || e.ctrlKey;
		this.leftButtonDown = false;
		this.touchDistance = e.touchDistance || 0;
	}
}
