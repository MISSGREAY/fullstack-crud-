// db.js
// Tiny file-backed "database" so the app has real persistence without
// requiring a native driver (sqlite3/postgres) to be installed.
// Swap this out for a real database in production.

import { readFile, writeFile } from "fs/promises";
import { existsSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "data.json");

if (!existsSync(DB_PATH)) {
  writeFileSync(DB_PATH, JSON.stringify({ notes: [], nextId: 1 }, null, 2));
}

// Extremely small mutex so concurrent requests don't clobber each other's
// writes to the JSON file.
let queue = Promise.resolve();
function withLock(fn) {
  const result = queue.then(fn);
  queue = result.catch(() => {});
  return result;
}

async function readDB() {
  const raw = await readFile(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

async function writeDB(data) {
  await writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

export function listNotes() {
  return withLock(async () => {
    const db = await readDB();
    return [...db.notes].sort((a, b) => b.createdAt - a.createdAt);
  });
}

export function getNote(id) {
  return withLock(async () => {
    const db = await readDB();
    return db.notes.find((n) => n.id === id) || null;
  });
}

export function createNote({ title, body }) {
  return withLock(async () => {
    const db = await readDB();
    const now = Date.now();
    const note = {
      id: db.nextId,
      title,
      body,
      createdAt: now,
      updatedAt: now,
    };
    db.notes.push(note);
    db.nextId += 1;
    await writeDB(db);
    return note;
  });
}

export function updateNote(id, { title, body }) {
  return withLock(async () => {
    const db = await readDB();
    const note = db.notes.find((n) => n.id === id);
    if (!note) return null;
    if (title !== undefined) note.title = title;
    if (body !== undefined) note.body = body;
    note.updatedAt = Date.now();
    await writeDB(db);
    return note;
  });
}

export function deleteNote(id) {
  return withLock(async () => {
    const db = await readDB();
    const idx = db.notes.findIndex((n) => n.id === id);
    if (idx === -1) return false;
    db.notes.splice(idx, 1);
    await writeDB(db);
    return true;
  });
}
