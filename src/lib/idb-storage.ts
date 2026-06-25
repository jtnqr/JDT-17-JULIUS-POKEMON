import { openDB } from 'idb';

const DB_NAME = 'pokemon-bronze-db';
const STORE_NAME = 'keyval';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(STORE_NAME);
  },
});

export const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const val = await (await dbPromise).get(STORE_NAME, name);
    return val ?? null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await (await dbPromise).put(STORE_NAME, value, name);
  },
  removeItem: async (name: string): Promise<void> => {
    await (await dbPromise).delete(STORE_NAME, name);
  },
};
