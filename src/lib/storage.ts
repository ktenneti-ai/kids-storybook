"use client";

import type { Story } from "./types";

/**
 * Local-only persistence for finished storybooks, using IndexedDB (not
 * localStorage — a full 10-page book with a character reference, a cover,
 * and every page image easily runs several megabytes of base64 image data,
 * well past localStorage's ~5-10MB per-origin limit). Every story a user
 * finishes generating (or regenerates) is saved here automatically, so
 * reopening the app doesn't require paying for and waiting on a full
 * regeneration. This is per-browser/per-device only — there's no server-side
 * database (see the "Stateless by design" note in the README).
 */

const DB_NAME = "storystars";
const DB_VERSION = 1;
const STORE_NAME = "stories";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available in this environment."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveStory(story: Story): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(story);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** All saved stories, most recently created first. */
export async function listStories(): Promise<Story[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => {
      const stories = request.result as Story[];
      stories.sort((a, b) => b.createdAt - a.createdAt);
      resolve(stories);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteStory(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
