import { useEffect, useState, useCallback } from "react";
import * as api from "./api.js";
import "./App.css";

const emptyForm = { title: "", body: "" };

function formatTimestamp(ms) {
  const d = new Date(ms);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function App() {
  // --- list state ---
  const [notes, setNotes] = useState([]);
  const [listStatus, setListStatus] = useState("loading"); // loading | ready | error
  const [listError, setListError] = useState(null);

  // --- create form state ---
  const [form, setForm] = useState(emptyForm);
  const [createStatus, setCreateStatus] = useState("idle"); // idle | submitting | error
  const [createError, setCreateError] = useState(null);

  // --- per-row edit/delete state ---
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(emptyForm);
  const [rowStatus, setRowStatus] = useState({}); // id -> 'saving' | 'deleting'
  const [rowError, setRowError] = useState({}); // id -> message

  const loadNotes = useCallback(async () => {
    setListStatus("loading");
    setListError(null);
    try {
      const data = await api.fetchNotes();
      setNotes(data);
      setListStatus("ready");
    } catch (err) {
      setListError(err.message);
      setListStatus("error");
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      setCreateStatus("error");
      setCreateError("Title and body can't be empty.");
      return;
    }
    setCreateStatus("submitting");
    setCreateError(null);
    try {
      const note = await api.createNote({
        title: form.title.trim(),
        body: form.body.trim(),
      });
      setNotes((prev) => [note, ...prev]);
      setForm(emptyForm);
      setCreateStatus("idle");
    } catch (err) {
      setCreateStatus("error");
      setCreateError(err.message);
    }
  }

  function startEdit(note) {
    setEditingId(note.id);
    setEditDraft({ title: note.title, body: note.body });
    setRowError((prev) => ({ ...prev, [note.id]: null }));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(emptyForm);
  }

  async function handleSaveEdit(id) {
    if (!editDraft.title.trim() || !editDraft.body.trim()) {
      setRowError((prev) => ({ ...prev, [id]: "Title and body can't be empty." }));
      return;
    }
    setRowStatus((prev) => ({ ...prev, [id]: "saving" }));
    setRowError((prev) => ({ ...prev, [id]: null }));
    try {
      const updated = await api.updateNote(id, {
        title: editDraft.title.trim(),
        body: editDraft.body.trim(),
      });
      setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
      setEditingId(null);
      setRowStatus((prev) => ({ ...prev, [id]: undefined }));
    } catch (err) {
      setRowStatus((prev) => ({ ...prev, [id]: undefined }));
      setRowError((prev) => ({ ...prev, [id]: err.message }));
    }
  }

  async function handleDelete(id) {
    setRowStatus((prev) => ({ ...prev, [id]: "deleting" }));
    setRowError((prev) => ({ ...prev, [id]: null }));
    try {
      await api.deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setRowStatus((prev) => ({ ...prev, [id]: undefined }));
    } catch (err) {
      setRowStatus((prev) => ({ ...prev, [id]: undefined }));
      setRowError((prev) => ({ ...prev, [id]: err.message }));
    }
  }

  return (
    <div className="page">
      <header className="masthead">
        <div className="masthead-mark" aria-hidden="true">
          FL
        </div>
        <div>
          <h1>FieldLog</h1>
          <p className="masthead-sub">A running log of short field observations.</p>
        </div>
      </header>

      <main className="layout">
        <section className="entry-panel" aria-labelledby="new-entry-heading">
          <h2 id="new-entry-heading">New entry</h2>
          <form onSubmit={handleCreate} className="entry-form">
            <label className="field">
              <span>Title</span>
              <input
                type="text"
                value={form.title}
                maxLength={120}
                placeholder="Ridge at dawn"
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                disabled={createStatus === "submitting"}
              />
            </label>
            <label className="field">
              <span>Observation</span>
              <textarea
                value={form.body}
                maxLength={2000}
                rows={4}
                placeholder="What did you notice?"
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                disabled={createStatus === "submitting"}
              />
            </label>

            {createStatus === "error" && (
              <p className="error-text" role="alert">
                {createError}
              </p>
            )}

            <button type="submit" className="btn btn-primary" disabled={createStatus === "submitting"}>
              {createStatus === "submitting" ? "Logging entry…" : "Log entry"}
            </button>
          </form>
        </section>

        <section className="log-panel" aria-labelledby="log-heading">
          <div className="log-panel-head">
            <h2 id="log-heading">Log</h2>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={loadNotes}
              disabled={listStatus === "loading"}
            >
              {listStatus === "loading" ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          {listStatus === "loading" && (
            <ul className="entry-list" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <li key={i} className="entry-card entry-card-skeleton" aria-hidden="true">
                  <div className="skel skel-title" />
                  <div className="skel skel-line" />
                  <div className="skel skel-line short" />
                </li>
              ))}
            </ul>
          )}

          {listStatus === "error" && (
            <div className="empty-state error-state" role="alert">
              <p>Couldn't load entries.</p>
              <p className="error-text">{listError}</p>
              <button type="button" className="btn btn-primary" onClick={loadNotes}>
                Try again
              </button>
            </div>
          )}

          {listStatus === "ready" && notes.length === 0 && (
            <div className="empty-state">
              <p>No entries yet.</p>
              <p className="empty-sub">Log your first observation using the form.</p>
            </div>
          )}

          {listStatus === "ready" && notes.length > 0 && (
            <ul className="entry-list">
              {notes.map((note) => {
                const isEditing = editingId === note.id;
                const status = rowStatus[note.id];
                const error = rowError[note.id];
                return (
                  <li key={note.id} className="entry-card">
                    {isEditing ? (
                      <div className="entry-edit">
                        <label className="field">
                          <span>Title</span>
                          <input
                            type="text"
                            value={editDraft.title}
                            maxLength={120}
                            onChange={(e) =>
                              setEditDraft((d) => ({ ...d, title: e.target.value }))
                            }
                            disabled={status === "saving"}
                          />
                        </label>
                        <label className="field">
                          <span>Observation</span>
                          <textarea
                            rows={3}
                            value={editDraft.body}
                            maxLength={2000}
                            onChange={(e) =>
                              setEditDraft((d) => ({ ...d, body: e.target.value }))
                            }
                            disabled={status === "saving"}
                          />
                        </label>
                        {error && (
                          <p className="error-text" role="alert">
                            {error}
                          </p>
                        )}
                        <div className="entry-actions">
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => handleSaveEdit(note.id)}
                            disabled={status === "saving"}
                          >
                            {status === "saving" ? "Saving…" : "Save"}
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={cancelEdit}
                            disabled={status === "saving"}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="entry-card-head">
                          <h3>{note.title}</h3>
                          <time className="entry-timestamp" dateTime={new Date(note.updatedAt).toISOString()}>
                            {formatTimestamp(note.updatedAt)}
                          </time>
                        </div>
                        <p className="entry-body">{note.body}</p>

                        {error && (
                          <p className="error-text" role="alert">
                            {error}
                          </p>
                        )}

                        <div className="entry-actions">
                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => startEdit(note)}
                            disabled={status === "deleting"}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => handleDelete(note.id)}
                            disabled={status === "deleting"}
                          >
                            {status === "deleting" ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
