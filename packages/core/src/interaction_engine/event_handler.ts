import { NativeEventType } from "./event_type";
import type { Dispatchable } from "./types";

export class EventHandler {
	/** Switch off for event listeners */
	private abortController: AbortController | null = null;

	/**
	 * Start listening and reacting on HTML events
	 *
	 * @param element - the element to which event listeners are attached
	 * @param delegate - the entity to which event handling is delegated
	 */
	public connect(element: HTMLElement, delegate: Dispatchable): void {
		this.disconnect();
		this.abortController = new AbortController();
		const { signal } = this.abortController;

		const config: [Event["type"], AddEventListenerOptions][] = [
			[NativeEventType.CLICK, { signal }],
			[NativeEventType.DBLCLICK, { signal }],
			[NativeEventType.AUXCLICK, { signal }],
			[NativeEventType.KEYDOWN, { signal }],
			[NativeEventType.KEYPRESS, { signal }],
			[NativeEventType.KEYUP, { signal }],
			[NativeEventType.POINTERDOWN, { signal }],
			[NativeEventType.POINTERMOVE, { signal }],
			[NativeEventType.POINTERUP, { signal }],
			[NativeEventType.POINTERUP, { signal }],
			[NativeEventType.WHEEL, { signal }],
		];

		for (const [eventType, options] of config) {
			element.addEventListener(eventType, (event) => delegate.dispatch(event), options);
		}
	}

	/** Stop listening and reacting on HTML events */
	public disconnect(): void {
		this.abortController?.abort();
	}
}
