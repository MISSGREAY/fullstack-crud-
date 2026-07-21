# FieldLog (frontend)

A React + Vite UI for the FieldLog API: log short field observations,
edit them in place, and delete them — with real loading and error
states on every action (initial load, create, save, delete).

## Run locally

Make sure the backend is running first (see `../backend/README.md`),
then:

```bash
npm install
npm run dev       # http://localhost:5173
```

By default the app talks to `http://localhost:4000/api`. Override this
by copying `.env.example` to `.env` and setting `VITE_API_BASE`.

## What's implemented

- **Create** — form with client + server validation, disabled/loading
  submit button, inline error message on failure.
- **Read** — skeleton placeholders while the list loads, a distinct
  empty state, and a distinct error state with a retry button.
- **Update** — inline edit mode per entry, save/cancel, per-row
  saving state and per-row error message.
- **Delete** — per-row deleting state and per-row error message (e.g.
  if the item was already deleted elsewhere).
- All state is local React state (`useState`/`useEffect`) — no global
  state library needed for a single resource like this.

## Build

```bash
npm run build     # outputs to dist/
npm run preview   # serve the production build locally
```
