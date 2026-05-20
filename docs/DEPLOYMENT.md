# SignalForge Frontend — Deployment

This document covers deploying the SignalForge frontend to Vercel and verifying production against the live backend.

## Prerequisites

- Frontend repository connected to a Vercel project
- Backend deployed at https://signalforge-api.vercel.app
- Git push access to trigger redeploys

## Vercel environment variables

In the Vercel project for **signalforge-frontend**, set:

| Name | Value | Environments |
| ---- | ----- | ------------ |
| `VITE_API_BASE_URL` | `https://signalforge-api.vercel.app` | Production, Preview (recommended) |
| `VITE_SUPABASE_URL` | Your Supabase project URL | Production, Preview |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview |

**Important:** Do not append `/api` to `VITE_API_BASE_URL`. The frontend calls paths such as `/projects` and `/projects/:id/workspace` directly on the backend base URL.

**Authentication:** After sign-in, the frontend attaches the Supabase access token to product API requests:

```
Authorization: Bearer <supabase_access_token>
```

Obtain `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from Supabase **Project Settings → API**. Use the anon (public) key only — never commit the service role key to the frontend.

### How to set the variables

1. Open the project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Go to **Settings → Environment Variables**
3. Add all three `VITE_*` variables
4. Apply to **Production** (and **Preview** if preview deployments should authenticate against Supabase)

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
| Health | https://signalforge-api.vercel.app/api/health | `200 OK` (public, no auth) |
| Projects | https://signalforge-api.vercel.app/projects | `401` without token; `200` with valid Bearer token |

Product endpoints require `Authorization: Bearer <supabase_access_token>`. Test projects from the browser only after signing in through the frontend, or with a valid token from Supabase.

If health or projects fail, fix the backend first; the frontend will show API errors until the backend is reachable.

## How to test production

Frontend URL: https://signalforge-frontend.vercel.app

### Smoke test checklist

1. **Load app** — auth screen renders (or session restores to landing)
2. **Sign in** — use a Supabase account; product app loads after successful auth
3. **Sign out** — **Sign out** in top nav returns to auth screen and clears project state
4. **Projects page** — navigate to **Projects**
   - Empty account: “No projects yet” card
   - With data: project cards from authenticated `GET /projects`
5. **Sync** — click **Sync backend projects**; list updates without stale errors after success
6. **Create project** — **Create project** → submit form → lands on **Inputs**
7. **Run flow** — generate Insights → Report → PRD → Tasks (requests include Bearer token)
8. **Hydrate workspace** — return to **Projects** → **Open project**
   - Network: `GET .../projects/{id}/workspace` → `200` with `Authorization` header
9. **Session expiry** — if backend returns `401`, user sees “Your session expired. Please sign in again.” and is signed out

### DevTools checks

- **Network:** requests go to `https://signalforge-api.vercel.app/...` with `Authorization: Bearer ...` on product routes
- **No CORS errors** on authenticated `GET /projects` or workspace calls
- **Failed requests:** error banner should show the API message; a later successful request should clear the error

## Local vs production

| | Local dev | Production |
| --- | --- | --- |
| API base | `http://localhost:3000` (default) or `.env` | `VITE_API_BASE_URL` on Vercel |
| Supabase | `.env` from `.env.example` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` on Vercel |
| Env file | Copy from `.env.example` to `.env` | Set in Vercel dashboard |
| Build | `npm run build` | Vercel runs `npm run build` |

## Troubleshooting

| Symptom | Likely cause | Fix |
| ------- | ------------ | --- |
| Auth screen only, cannot sign in | Missing or wrong Supabase env vars | Set `VITE_SUPABASE_*` in Vercel and redeploy |
| API calls go to `localhost` in production | `VITE_API_BASE_URL` not set at build time | Set env var in Vercel and redeploy |
| `401` on all product routes | Expired session or backend JWT config | Sign in again; verify backend Supabase JWT secret |
| “Failed to fetch” but Network shows 200 | Stale bundle or old error state | Hard refresh; confirm latest deploy |
| CORS errors | Backend CORS config | Fix backend allowed origins (frontend URL) |
| Empty projects after create | Backend DB or list endpoint | Check `GET /projects` in browser |
| Workspace empty on open | Workspace endpoint or no saved outputs | Check `GET /projects/:id/workspace` response |

## Related docs

- [README.md](../README.md) — local setup, product flow, API overview
