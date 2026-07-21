# FieldLog — full-stack CRUD demo

A minimal but complete full-stack app: an Express API backend and a
React frontend, wired together over HTTP. The resource is **notes**
(short field observations), with full Create/Read/Update/Delete from
the UI, loading states, and error states on every action.

```
fullstack-crud/
├── backend/     Express API + JSON-file storage (see backend/README.md)
└── frontend/    React + Vite UI (see frontend/README.md)
```

## Quick start

Two terminals:

```bash
# terminal 1
cd backend
npm install
npm start          # http://localhost:4000

# terminal 2
cd frontend
npm install
npm run dev         # http://localhost:5173
```

Open http://localhost:5173 — create a note, edit it, delete it. Try
stopping the backend while the frontend is running to see the error
states (a "can't reach the server" message with a retry option).

---

## What I built vs. what's left for you to do

I wrote and tested the code (backend CRUD verified with curl against
every endpoint including validation/404 paths; frontend build verified
with `npm run build`; both servers run together and the UI talks to
the API successfully). I don't have the ability to push to your GitHub
account, record your screen, or post to your LinkedIn — those need
your accounts. Here's exactly how to finish each one.

### 1. Push to GitHub

Pick monorepo (simplest) or two repos — either is fine for the task.

**Monorepo:**
```bash
cd fullstack-crud
git init
git add .
git commit -m "FieldLog: full-stack CRUD (Express + React)"
git branch -M main
git remote add origin https://github.com/<your-username>/fieldlog.git
git push -u origin main
```
(Create the empty repo on GitHub first, or use `gh repo create fieldlog --public --source=. --push` if you have the GitHub CLI installed.)

**Two repos:** run the same steps separately inside `backend/` and
`frontend/`, pushing to `fieldlog-backend` and `fieldlog-frontend`.

### 2. Record the demo video

A simple, effective structure (60–90 seconds):
1. Show both terminals running (`npm start` / `npm run dev`) — proves it's a real backend, not mocked.
2. Create a note in the UI — point out the button showing a loading state before it appears in the list.
3. Edit that note — show the inline save state.
4. Delete it — show the deleting state.
5. Optional: stop the backend process and try an action, to show the error state working.

Screen recorders: QuickTime (Mac, Cmd+Shift+5), Xbox Game Bar (Windows,
Win+G), or `obs` (free, cross-platform) all work fine.

### 3. Post on LinkedIn

Write the post yourself so it sounds like you, but if useful, a
starting point:

> Built a full-stack CRUD app from scratch — Express API + React
> frontend, talking to a real backend (not a public API). Handled
> loading and error states on every action so it feels like a real
> product, not a demo. Code: [backend repo link] / [frontend repo
> link]. Video below 👇

Attach the video file directly to the LinkedIn post (native video gets
better reach than a link-out).

---

## Design notes

The UI leans into the "field notebook" idea the resource name
suggests: a dark ink-toned frame around warm paper-colored entry
cards, a serif display face (Fraunces) for headings, monospace
timestamps like log stamps, and a brass accent color rather than the
more common cream/terracotta combo. Backend responses have ~350ms of
simulated latency by default specifically so the loading states are
visible during your demo/recording — see `backend/README.md` to turn
that off.
