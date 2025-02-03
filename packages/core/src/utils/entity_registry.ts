import { type UUID, generateUUID } from "./unique_id";

/** Manages the registration and unregistration of entities. */
export class Registry<Entity> {
	/** Registered {@link Entity | entities} pool */
	private readonly pool: Map<UUID, Entity> = new Map();

	/**
	 * Register entity
	 * @returns UID of the registered {@link Entity}
	 */
	public register(entity: Entity): UUID {
		const id = generateUUID();
		this.pool.set(id, entity);

		return id;
	}

	/**
	 * Unregister entity
	 * @returns true if an {@link Entity} in the {@link Registry} existed and has been removed, or false if the {@link Entity} does not exist.
	 */
	public unregister(entityUID: UUID): boolean {
		return this.pool.delete(entityUID);
	}

	/** Clear pool of registered entities */
	public clear(): void {
		this.pool.clear();
	}

	/** Returns an iterator that iterates over the entities in the pool. */
	*[Symbol.iterator](): IterableIterator<Entity> {
		for (const [_, entity] of this.pool) {
			yield entity;
		}
	}
}
