import { Whiteboard } from "@whiteboard/core";
import "./style.css";

const holder = document.querySelector(".whiteboard-holder");

if (!holder) {
	throw new Error("Whiteboard holder element not present");
}

const whiteboard = new Whiteboard(holder as HTMLDivElement);
whiteboard.fitParent();
whiteboard.enable();
