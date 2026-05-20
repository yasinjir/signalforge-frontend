# SignalForge Frontend — Deployment

This document covers deploying the SignalForge frontend to Vercel and verifying production against the live backend.

## Prerequisites

- Frontend repository connected to a Vercel project
- Backend deployed at https://signalforge-api.vercel.app
- Git push access to trigger redeploys

## Vercel environment variable

In the Vercel project for **signalforge-frontend**, set:

| Name | Value | Environments |
| ---- | ----- | ------------ |
| `VITE_API_BASE_URL` | `https://signalforge-api.vercel.app` | Production, Preview (recommended) |

**Important:** Do not append `/api`. The frontend calls paths such as `/projects` and `/projects/:id/workspace` directly on the backend base URL.

### How to set the variable

1. Open the project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Go to **Settings → Environment Variables**
3. Add `VITE_API_BASE_URL` with value `https://signalforge-api.vercel.app`
4. Apply to **Production** (and **Preview** if you want preview deployments to hit the live API)

## Redeploy after env change

Vite inlines `import.meta.env.VITE_*` at **build time**. Changing an env var in Vercel does not affect already-built assets until you redeploy.

1. Save the environment variable in Vercel
2. Trigger a new deployment:
   - **Option A:** Push a commit to the connected branch (`main`)
   - **Option B:** Vercel Dashboard → **Deployments** → **Redeploy** on the latest deployment (use “Redeploy with existing Build Cache” only if the env var was already set before that build)

After deploy completes, hard-refresh the browser (or use a private window) to avoid cached JS bundles.

## Backend dependency

The frontend requires a healthy SignalForge API. Verify the backend before testing the UI:

| Check | URL | Expected |
| ----- | --- | -------- |
| Health | https://signalforge-api.vercel.app/api/health | `200 OK` |
| Projects | https://signalforge-api.vercel.app/projects | `200 OK`, JSON array (may be `[]`) |

If health or projects fail, fix the backend first; the frontend will show API errors until the backend is reachable.

## How to test production

Frontend URL: https://signalforge-frontend.vercel.app

### Smoke test checklist

1. **Load app** — landing page renders without console errors
2. **Projects page** — navigate to **Projects**
   - Empty DB: “No projects yet” card
   - With data: project cards from `GET /projects`
3. **Sync** — click **Sync backend projects**; list updates without stale “Failed to fetch” after success
4. **Create project** — **Create project** → submit form → lands on **Inputs**
5. **Run flow** — generate Insights → Report → PRD → Tasks (each step should call the backend)
6. **Hydrate workspace** — return to **Projects** → **Open project** on an existing row
   - Network: `GET https://signalforge-api.vercel.app/projects/{id}/workspace` → `200`
   - UI shows stored input and latest outputs for the project’s `currentStage`
7. **Refresh** — reopen the same project; stored outputs still load from workspace

### DevTools checks

- **Network:** requests go to `https://signalforge-api.vercel.app/...` (not `localhost`, not `/api/projects` unless your backend is configured that way)
- **No CORS errors** on `GET /projects` or `GET /projects/:id/workspace`
- **Failed requests:** error banner should show the API message; a later successful request should clear the error

## Local vs production

| | Local dev | Production |
| --- | --- | --- |
| API base | `http://localhost:3000` (default) or `.env` | `VITE_API_BASE_URL` on Vercel |
| Env file | Copy from `.env.example` to `.env` | Set in Vercel dashboard |
| Build | `npm run build` | Vercel runs `npm run build` |

## Troubleshooting

| Symptom | Likely cause | Fix |
| ------- | ------------ | --- |
| API calls go to `localhost` in production | `VITE_API_BASE_URL` not set at build time | Set env var in Vercel and redeploy |
| “Failed to fetch” but Network shows 200 | Stale bundle or old error state | Hard refresh; confirm latest deploy |
| CORS errors | Backend CORS config | Fix backend allowed origins (frontend URL) |
| Empty projects after create | Backend DB or list endpoint | Check `GET /projects` in browser |
| Workspace empty on open | Workspace endpoint or no saved outputs | Check `GET /projects/:id/workspace` response |

## Related docs

- [README.md](../README.md) — local setup, product flow, API overview
