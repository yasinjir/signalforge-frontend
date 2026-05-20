# SignalForge Frontend

A product operations interface for converting raw feedback into insights, reports, PRDs, and execution-ready tasks.

SignalForge gives product teams one structured workflow: collect inputs, generate insight, produce a report and PRD, and prepare execution-ready tasks for delivery planning.

## Tech stack

- **React** — UI
- **TypeScript** — type-safe application code
- **Vite** — dev server and production build
- **Vercel** — frontend hosting
- **Backend API** — [SignalForge API](https://signalforge-api.vercel.app)

## Production URLs

| Service  | URL |
| -------- | --- |
| Frontend | https://signalforge-frontend.vercel.app |
| Backend  | https://signalforge-api.vercel.app |

## Local setup

```bash
npm install
copy .env.example .env
npm run dev
```

On macOS/Linux, use `cp .env.example .env` instead of `copy`.

The dev server runs at `http://localhost:5173` by default.

## Environment variables

| Variable | Description |
| -------- | ----------- |
| `VITE_API_BASE_URL` | Base URL for the SignalForge backend API (no `/api` suffix) |

**Local development** — point at a running backend:

```env
VITE_API_BASE_URL=http://localhost:3000
```

**Production / preview against deployed API** — use the Vercel backend:

```env
VITE_API_BASE_URL=https://signalforge-api.vercel.app
```

If `VITE_API_BASE_URL` is not set, the app falls back to `http://localhost:3000`.

Do not commit `.env` or `.env.local`. Use `.env.example` as the template.

## Build

```bash
npm run build
```

Output is written to `dist/`. Preview the production build locally:

```bash
npm run preview
```

## Deployment

Deploy to Vercel (or any static host that runs `npm run build`).

**Required Vercel environment variable:**

```env
VITE_API_BASE_URL=https://signalforge-api.vercel.app
```

Set this in the Vercel project **Settings → Environment Variables** for Production (and Preview if desired). Redeploy after changing env vars so Vite bakes the value into the build.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for redeploy steps and production smoke tests.

## Current product flow

```
Project → Inputs → Insights → Report → PRD → Tasks
```

1. **Project** — create a project with name, initiative, and context
2. **Inputs** — paste raw feedback or use sample content
3. **Insights** — generate structured themes, pain points, and priority cues
4. **Report** — generate an executive summary and findings
5. **PRD** — generate and edit a product requirements draft
6. **Tasks** — generate user stories, work buckets, and acceptance criteria

## Current API integration

The frontend talks to the backend at `VITE_API_BASE_URL` (routes do **not** use an `/api` prefix).

| Action | Method | Path |
| ------ | ------ | ---- |
| List projects | `GET` | `/projects` |
| Create project | `POST` | `/projects` |
| Add input | `POST` | `/projects/:projectId/inputs` |
| Generate insights | `POST` | `/projects/:projectId/insights/generate` |
| Generate report | `POST` | `/projects/:projectId/reports/generate` |
| Generate PRD | `POST` | `/projects/:projectId/prd/generate` |
| Update PRD | `PATCH` | `/projects/:projectId/prd/latest` |
| Generate tasks | `POST` | `/projects/:projectId/tasks/generate` |
| **Hydrate workspace** | `GET` | `/projects/:projectId/workspace` |

Opening a project calls `GET /projects/:id/workspace` and loads stored inputs, latest insight, report, PRD, and tasks into the UI.

API client: `src/lib/api.ts`  
Main app state and flow: `src/App.tsx`

## Known MVP limitations

- **No login yet** — there is no Supabase Auth or session handling in the frontend
- **Shared project list** — projects are currently global, not scoped to a user
- **Deterministic outputs** — backend generation is mock-like / deterministic, not real LLM output
- **No real AI pipeline** — LLM integration is planned for a later phase
- **Basic error UX** — errors appear inline; no toast/retry patterns yet
- **No delete/archive** — projects cannot be removed from the UI yet

## Next backlog

- Supabase Auth (signup, login, session)
- User-specific projects (no global shared list after auth)
- Better error and toast UX with retry
- Delete or archive project endpoints and UI
- Real LLM generation with persisted outputs
- Richer loading states (per-step, skeleton UI)
- Workspace autosave as users edit PRD and inputs

## Repository layout

```
src/
  App.tsx          # Main product flow and UI
  lib/api.ts       # API client and types
  main.tsx         # React entry
  styles.css       # Global styles
docs/
  DEPLOYMENT.md    # Vercel deployment and production testing
```
