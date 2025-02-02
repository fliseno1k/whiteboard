import type { UID, Registry } from "../utils";
import type { Gesture } from "./gestures";
import type { Plugin } from "./plugins";
import type { Dispatchable } from "./types";

/**
 * The Interaction Engine is responsible for
 * handling user inputs (mouse, touch, stylus, keyboard)
 * and translating them into actions on the whiteboard scene.
 * The interface should be modular, extensible, and event-driven.
 */
export class InteractionEngine implements Dispatchable {
	/** Captured pointer evens */
	private readonly pointers: Map<PointerEvent["pointerId"], PointerEvent> = new Map();

	constructor(
		/** Gestures registry */
		private readonly gesturesRegistry: Registry<Gesture>,
		/** Plugins registry */
		private readonly pluginsRegistry: Registry<Plugin>,
	) {}

	/** Dispatch event to gestures and/or plugins */
	public dispatch(event: Event): void {
		if (this.processGestures(event)) {
			return;
		}

		this.processPlugins(event);
	}

	/** Register gesture */
	public registerGesture(gesture: Gesture): GestureUID {
		return this.gesturesRegistry.register(gesture);
	}

	/** Unregister gesture */
	public unregisterGesture(gestureUID: UID): boolean {
		return this.gesturesRegistry.unregister(gestureUID);
	}

	/** Register gesture */
	public registerPlugin(plugin: Plugin): PluginUID {
		return this.pluginsRegistry.register(plugin);
	}

	/** Unregister gesture */
	public unregisterPlugin(pluginUID: PluginUID): boolean {
		return this.pluginsRegistry.unregister(pluginUID);
	}

	/**
	 * Process gestures
	 * @returns true if any gestures is active
	 */
	private processGestures(event: Event): boolean {
		if (!this.isPointerEvent(event)) {
			return false;
		}

		let isAnyGestureActive = 0;
		for (const gesture of this.gesturesRegistry) {
			gesture.onEvent(event);
			isAnyGestureActive += +gesture.isActive;
		}

		return isAnyGestureActive > 0;
	}

	/** Process plugins */
	private processPlugins(event: Event): void {
		for (const plugin of this.pluginsRegistry) {
			plugin.onEvent(event);
		}
	}

	/** Check if an {@link Event | event} is a {@link PointerEvent} */
	private isPointerEvent(event: Event): event is PointerEvent {
		return event instanceof PointerEvent;
	}
}

type PluginUID = UID;
type GestureUID = UID;
