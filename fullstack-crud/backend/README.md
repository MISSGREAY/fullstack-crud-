# FieldLog API (backend)

A small Express API providing CRUD for a single resource: **notes**.
Data is persisted to a local `data.json` file, so it survives server
restarts without needing a real database installed.

## Endpoints

| Method | Path              | Description                        |
|--------|-------------------|-------------------------------------|
| GET    | `/api/health`     | Health check                        |
| GET    | `/api/notes`      | List all notes (newest first)       |
| GET    | `/api/notes/:id`  | Get a single note                   |
| POST   | `/api/notes`      | Create a note `{ title, body }`     |
| PUT    | `/api/notes/:id`  | Update a note `{ title?, body? }`   |
| DELETE | `/api/notes/:id`  | Delete a note                       |

Validation: `title` (≤120 chars) and `body` (≤2000 chars) must be
non-empty strings on create; on update they're optional but validated
if present. Errors return `{ "error": "..." }` with an appropriate
4xx/5xx status.

## Run locally

```bash
npm install
npm start        # http://localhost:4000
```

For development with auto-restart on file changes:

```bash
npm run dev
```

### Simulated latency

By default each request has ~350ms of artificial latency added, so a
connected frontend's loading states are actually visible instead of
resolving instantly. Disable it with:

```bash
SIMULATE_LATENCY=0 npm start
```

## Tech

Node.js + Express, no database server required (JSON file storage in
`db.js`). Swap `db.js` for a real database (Postgres, SQLite, etc.)
without touching the route handlers — they only call the exported
`listNotes/getNote/createNote/updateNote/deleteNote` functions.
