import { Whiteboard } from "@whiteboard/core";
import "./style.css";

const holder = document.querySelector(".whiteboard-holder");

if (!holder) {
	throw new Error("Whiteboard holder element not present");
}

const whiteboard = new Whiteboard(holder as HTMLDivElement);
whiteboard.fit();

// // types

// type Point = [number, number];

// const enum Mouse {
// 	LEFT, // main button (left button)
// 	WHEEL, // auxiliary button (wheel or middle button)
// 	RIGHT, // secondary button (right button)
// }

// // state like
// let enabled = true;
// let scale = 1;
// let origin = [0.0, 0.0];

// let gridSize = [16, 16];
// let gridStep = 5;

// let down = [0, 0];
// let isPinching = false;
// let initialDistance = 0;
// let initialScale = 0;
// let touchPoint: Point = [0, 0];

// const activeButtons = new Set<Mouse>();

// // initialize canvas
// const canvasEl = document.querySelector("canvas#whiteboard") as HTMLCanvasElement;
// const g = canvasEl.getContext("2d") as CanvasRenderingContext2D;
// canvasEl.tabIndex = 0; // enable focus
// canvasEl.style.touchAction = "none"; // prevent pointer cancel event in mobile;
// canvasEl.style.outline = "none"; // remove focus outline;

// // pixel ratio
// const pixelRatio = window.devicePixelRatio ?? 1;

// // canvas event listeners
// canvasEl.addEventListener("pointerdown", ifEnabled(pointerDown));
// canvasEl.addEventListener("pointermove", ifEnabled(pointerMove));
// canvasEl.addEventListener("pointerup", ifEnabled(pointerUp));
// canvasEl.addEventListener("touchstart", ifEnabled(touchStart));
// canvasEl.addEventListener("touchmove", ifEnabled(touchMove));
// canvasEl.addEventListener("touchend", ifEnabled(touchEnd));
// canvasEl.addEventListener("touchcancel", ifEnabled(debugCanvasEvent));
// canvasEl.addEventListener("dblclick", ifEnabled(debugCanvasEvent));
// canvasEl.addEventListener("wheel", ifEnabled(wheel));
// canvasEl.addEventListener("dragover", ifEnabled(debugCanvasEvent));
// canvasEl.addEventListener("drop", ifEnabled(debugCanvasEvent));
// canvasEl.addEventListener("keydown", ifEnabled(debugCanvasEvent));

// // window event listeners
// window.addEventListener("resize", fit);
// window.addEventListener("DOMContentLoaded", fit);

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
	g.fillStyle = "#1b1715";
	g.fillRect(0, 0, canvasEl.width, canvasEl.height);
}

function globalTransform() {
	g.translate(origin[0] * scale * pixelRatio, origin[1] * scale * pixelRatio);
	g.scale(scale * pixelRatio, scale * pixelRatio);
}

const GridLineColor = {
	Bold: "#2d2d2d",
	Regular: "#252423",
} as const;

const lineBolding = [setNoneBoldStyles, setBoldStyles];

function drawGrid() {
	const [width, height] = getSize().map((v) => v / scale / pixelRatio);

	/**
	 * X|Y translate from origin point (0, 0)
	 */
	const [scrollX, scrollY] = origin;

	/**
	 * Offset from left edge to the first vertical line
	 */
	const offsetX = (scrollX % gridSize[0]) + gridSize[0];

	/**
	 * Offset from top edge to the first vertical line
	 */
	const offsetY = (scrollY % gridSize[0]) + gridSize[0];

	const gridCellSize = gridStep * gridSize[0];

	g.save();
	globalTransform();

	g.lineCap = "round";
	g.lineJoin = "round";
	g.globalAlpha = 1.0;

	const centerX = Math.round(-scrollX + width / 2 - ((width / 2) % gridSize[0]) + offsetX);
	const centerY = Math.round(-scrollY + height / 2 - ((height / 2) % gridSize[0]) + offsetY);

	let isBold = false;

	for (let x = 0; centerX + x < -scrollX + width + offsetX; x += gridSize[0]) {
		const nextLeftX = centerX - x - gridSize[0];
		isBold = gridStep > 1 && nextLeftX % gridCellSize === 0;
		lineBolding[+isBold]();

		line(nextLeftX, -scrollY, nextLeftX, Math.ceil(-scrollY + height));

		const nextRightX = centerX + x;

		isBold = gridStep > 1 && nextRightX % gridCellSize === 0;
		lineBolding[+isBold]();

		line(nextRightX, -scrollY, nextRightX, Math.ceil(-scrollY + height));
	}

	for (let y = 0; centerY + y < -scrollY + height + offsetY; y += gridSize[0]) {
		const nextTopY = centerY - y - gridSize[0];
		isBold = gridStep > 1 && nextTopY % gridCellSize === 0;
		lineBolding[+isBold]();

		line(-scrollX, nextTopY, Math.ceil(-scrollX + width), nextTopY);

		const nextBottomY = centerY + y;
		isBold = gridStep > 1 && nextBottomY % gridCellSize === 0;
		lineBolding[+isBold]();

		line(-scrollX, nextBottomY, Math.ceil(-scrollX + width), nextBottomY);
	}

	g.restore();
}

function setBoldStyles() {
	g.lineWidth = Math.min(1 / scale, 4);
	g.strokeStyle = GridLineColor.Bold;
	g.setLineDash([]);
}

function setNoneBoldStyles() {
	const lineWidth = 3 / scale;

	g.lineWidth = Math.min(1 / scale, 1);
	g.strokeStyle = GridLineColor.Regular;
	g.setLineDash([lineWidth, lineWidth]);
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
