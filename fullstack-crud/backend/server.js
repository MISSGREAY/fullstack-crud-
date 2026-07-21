import express from "express";
import cors from "cors";
import {
  listNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
} from "./db.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Simulate a touch of realistic network latency so the frontend's
// loading states are actually visible during local dev/demo. Set
// SIMULATE_LATENCY=0 to disable.
const LATENCY_MS = process.env.SIMULATE_LATENCY !== undefined
  ? Number(process.env.SIMULATE_LATENCY)
  : 350;
app.use((req, res, next) => {
  if (LATENCY_MS > 0) {
    setTimeout(next, LATENCY_MS);
  } else {
    next();
  }
});

function validateNotePayload(body, { partial = false } = {}) {
  const errors = [];
  if (!partial || body.title !== undefined) {
    if (typeof body.title !== "string" || body.title.trim().length === 0) {
      errors.push("title is required and must be a non-empty string");
    } else if (body.title.length > 120) {
      errors.push("title must be 120 characters or fewer");
    }
  }
  if (!partial || body.body !== undefined) {
    if (typeof body.body !== "string" || body.body.trim().length === 0) {
      errors.push("body is required and must be a non-empty string");
    } else if (body.body.length > 2000) {
      errors.push("body must be 2000 characters or fewer");
    }
  }
  return errors;
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// GET /api/notes - list all notes
app.get("/api/notes", async (req, res) => {
  try {
    const notes = await listNotes();
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load notes" });
  }
});

// GET /api/notes/:id - fetch a single note
app.get("/api/notes/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "id must be an integer" });
    }
    const note = await getNote(id);
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load note" });
  }
});

// POST /api/notes - create a note
app.post("/api/notes", async (req, res) => {
  try {
    const errors = validateNotePayload(req.body || {});
    if (errors.length) return res.status(400).json({ error: errors.join("; ") });
    const note = await createNote({
      title: req.body.title.trim(),
      body: req.body.body.trim(),
    });
    res.status(201).json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create note" });
  }
});

// PUT /api/notes/:id - update a note (partial updates allowed)
app.put("/api/notes/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "id must be an integer" });
    }
    const errors = validateNotePayload(req.body || {}, { partial: true });
    if (errors.length) return res.status(400).json({ error: errors.join("; ") });

    const payload = {};
    if (req.body.title !== undefined) payload.title = req.body.title.trim();
    if (req.body.body !== undefined) payload.body = req.body.body.trim();

    const note = await updateNote(id, payload);
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update note" });
  }
});

// DELETE /api/notes/:id - delete a note
app.delete("/api/notes/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "id must be an integer" });
    }
    const ok = await deleteNote(id);
    if (!ok) return res.status(404).json({ error: "Note not found" });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

// Fallback 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`FieldLog API listening on http://localhost:${PORT}`);
});
