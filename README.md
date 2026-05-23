# SignalForge Frontend

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An **open-source** product operations interface for converting raw feedback into insights, reports, PRDs, and execution-ready tasks.

SignalForge gives product teams one structured workflow: collect inputs, generate insight, produce a report and PRD, and prepare execution-ready tasks for delivery planning.

## Open-source status

SignalForge is being developed as an open-source product operations platform.

This repository is the frontend application, released under the [MIT License](LICENSE). Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). For security concerns, see [SECURITY.md](SECURITY.md). All participants are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Tech stack

- **React** — UI
- **TypeScript** — type-safe application code
- **Vite** — dev server and production build
- **Vercel** — frontend hosting
- **Supabase Auth** — signup, sign-in, session tokens
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
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous (public) key for client auth |

**Local development** — point at a running backend and your Supabase project:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

**Production / preview against deployed API** — use the Vercel backend and Supabase:

```env
VITE_API_BASE_URL=https://signalforge-api.vercel.app
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
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

**Required Vercel environment variables:**

```env
VITE_API_BASE_URL=https://signalforge-api.vercel.app
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
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

**Authentication:** Users sign in with Supabase Auth. The frontend sends the Supabase access token on product API requests:

```
Authorization: Bearer <supabase_access_token>
```

The backend health endpoint (`/api/health`) remains public. Product routes require a valid token.

API client: `src/lib/api.ts`  
Supabase client: `src/lib/supabase.ts`  
Main app state and flow: `src/App.tsx`

## Known MVP limitations

- **Email/password auth only** — no OAuth providers in the UI yet
- **User-scoped projects** — backend filters by authenticated user; shared/global lists are removed
- **Deterministic outputs** — backend generation is mock-like / deterministic, not real LLM output
- **No real AI pipeline** — LLM integration is planned for a later phase
- **Basic error UX** — errors appear inline; no toast/retry patterns yet
- **No delete/archive** — projects cannot be removed from the UI yet

## Next backlog

- OAuth / SSO providers via Supabase
- Better error and toast UX with retry
- Delete or archive project endpoints and UI
- Real LLM generation with persisted outputs
- Richer loading states (per-step, skeleton UI)
- Workspace autosave as users edit PRD and inputs

## Repository layout

```
src/
  App.tsx          # Main product flow, auth UI, and state
  lib/api.ts       # API client, types, auth token provider
  lib/supabase.ts  # Supabase client
  main.tsx         # React entry
  styles.css       # Global styles
docs/
  DEPLOYMENT.md    # Vercel deployment and production testing
```
