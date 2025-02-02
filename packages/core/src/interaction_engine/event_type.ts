import type { InteractionEngine } from "./interaction_engine";

/**
 * Names of native events that are special to {@link InteractionEngine}. These are not all
 * event types that are legal to use in HTML, but these are the ones
 * that are treated specially.
 */
export const enum NativeEventType {
	/**
	 * Mouse middle click.
	 */
	AUXCLICK = "auxclick",

	/**
	 * The click event.
	 */
	CLICK = "click",

	/**
	 * The dblclick event.
	 */
	DBLCLICK = "dblclick",

	/**
	 * The keydown event.
	 */
	KEYDOWN = "keydown",

	/**
	 * The keypress event.
	 */
	KEYPRESS = "keypress",

	/**
	 * The keyup event.
	 */
	KEYUP = "keyup",

	/**
	 * The mouseup event.
	 */
	MOUSEUP = "mouseup",

	/**
	 * The mousedown event.
	 */
	MOUSEDOWN = "mousedown",

	/**
	 * The mouseover event.
	 */
	MOUSEOVER = "mouseover",

	/**
	 * The mouseout event.
	 */
	MOUSEOUT = "mouseout",

	/**
	 * The mouseenter event.
	 */
	MOUSEENTER = "mouseenter",

	/**
	 * The mouseleave event.
	 */
	MOUSELEAVE = "mouseleave",

	/**
	 * The mousemove event.
	 */
	MOUSEMOVE = "mousemove",

	/**
	 * The pointerup event.
	 */
	POINTERUP = "pointerup",

	/**
	 * The pointerdown event.
	 */
	POINTERDOWN = "pointerdown",

	/**
	 * The pointerover event.
	 */
	POINTEROVER = "pointerover",

	/**
	 * The pointerout event.
	 */
	POINTEROUT = "pointerout",

	/**
	 * The pointerenter event.
	 */
	POINTERENTER = "pointerenter",

	/**
	 * The pointerleave event.
	 */
	POINTERLEAVE = "pointerleave",

	/**
	 * The pointermove event.
	 */
	POINTERMOVE = "pointermove",

	/**
	 * The pointercancel event.
	 */
	POINTERCANCEL = "pointercancel",

	/**
	 * The gotpointercapture event is fired when
	 * Element.setPointerCapture(pointerId) is called on a mouse input, or
	 * implicitly when a touch input begins.
	 */
	GOTPOINTERCAPTURE = "gotpointercapture",

	/**
	 * The lostpointercapture event is fired when
	 * Element.releasePointerCapture(pointerId) is called, or implicitly after a
	 * touch input ends.
	 */
	LOSTPOINTERCAPTURE = "lostpointercapture",

	/**
	 * The touchstart event.
	 */
	TOUCHSTART = "touchstart",

	/**
	 * The touchend event.
	 */
	TOUCHEND = "touchend",

	/**
	 * The touchmove event.
	 */
	TOUCHMOVE = "touchmove",

	/**
	 * The wheel event.
	 */
	WHEEL = "wheel",

	/**
	 * The resize event.
	 */
	RESIZE = "resize",
}
