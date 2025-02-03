import { type UUID, generateUUID } from "./utils";

export type TraverseCallback = (obj: Object2D, parent: Object2D | null) => void;

/** Atomic representation of renderable object */
export class Object2D {
	/** Object's unique id */
	public readonly id: UUID = generateUUID();

	/** Parent {@link Object2D | object} */
	public parent: Object2D | null = null;

	/** Chilrder objects */
	public children: Array<Object2D> = [];

	/** Object top */
	public top: number = 0;

	/** Object right */
	public right: number = 0;

	/** Object bottom */
	public bottom: number = 0;

	/** Object left */
	public left: number = 0;

	constructor() {}

	/** Traverse all objects in breath-first order */
	public traverse(fun: TraverseCallback, parent: Object2D | null = null) {
		fun(this, parent);
		for (let i = this.children.length - 1; i >= 0; i--) {
			const s = this.children[i];
			s.traverse(fun, this);
		}
	}

	/** Compute geometries how to draw the shape */
	public render(): void {}

	/** Draw the computed geometries of the shape on the canvas */
	public draw(): void {}
}
