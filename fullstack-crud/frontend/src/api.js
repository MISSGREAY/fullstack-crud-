const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (networkErr) {
    throw new Error(
      "Can't reach the server. Check that the backend is running and try again."
    );
  }

  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no body to parse
  }

  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export function fetchNotes() {
  return request("/notes");
}

export function createNote({ title, body }) {
  return request("/notes", {
    method: "POST",
    body: JSON.stringify({ title, body }),
  });
}

export function updateNote(id, { title, body }) {
  return request(`/notes/${id}`, {
    method: "PUT",
    body: JSON.stringify({ title, body }),
  });
}

export function deleteNote(id) {
  return request(`/notes/${id}`, { method: "DELETE" });
}
