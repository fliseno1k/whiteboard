// import { Whiteboard } from "@whiteboard/core";
import { EventHandler, InteractionEngine, Registry } from "@whiteboard/core";
import "./style.css";

const holder = document.querySelector(".whiteboard-holder");

if (!holder) {
	throw new Error("Whiteboard holder element not present");
}

new EventHandler(new InteractionEngine(new Registry(), new Registry())).connect(holder as HTMLDivElement);

// const whiteboard = new Whiteboard(holder as HTMLDivElement);
// whiteboard.fitParent();
// whiteboard.enable();
