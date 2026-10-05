# EventBook

React + Vite frontend with a connected Express backend.

## Local setup

Use Node.js 24 or newer. Install dependencies in both `client` and `server`.
Configure MongoDB in `server/.env` using `server/.env.example` as a guide.

From `client`:

```powershell
npm.cmd run dev
```

Open http://localhost:5173. This command runs the website and the Express API in
one process. MongoDB must be reachable for event creation, saved bookings and
contact enquiries. Existing accounts are preserved in the local SQLite database.
After backend code changes, restart the development server.

## Checks

```powershell
npm.cmd run test:auth
npm.cmd run build
npm.cmd run lint
npm.cmd test --prefix ../server
```

See [backend documentation](../server/README.md) for API routes, MongoDB
integration tests, standalone startup, deployment and remaining launch work.
Payments remain explicitly labelled as demo; no money is charged or ticket issued.
