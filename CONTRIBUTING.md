# Contributing to SignalForge

Thank you for your interest in contributing. This document explains how to get started and what we expect from contributors.

## Project overview

SignalForge is an open-source product operations platform. This repository contains the **frontend**: a React + TypeScript app that turns raw product feedback into structured insights, reports, PRDs, and execution-ready tasks.

The frontend talks to the SignalForge backend API and uses Supabase Auth for sign-in. See [README.md](README.md) for architecture, environment variables, and deployment notes.

## Local setup

1. **Fork and clone** the repository.

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   ```bash
   cp .env.example .env
   ```

   On Windows:

   ```cmd
   copy .env.example .env
   ```

   Fill in values from `.env.example`. Do **not** commit `.env` or `.env.local`.

4. **Run the dev server:**

   ```bash
   npm run dev
   ```

5. **Verify the production build** before opening a pull request:

   ```bash
   npm run build
   ```

You need a running backend and Supabase project for full end-to-end flows. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for production URLs and smoke tests.

## Branches

- Base your work on the latest `main` branch.
- Use short, descriptive branch names, for example:
  - `feat/workspace-autosave`
  - `fix/auth-session-refresh`
  - `docs/deployment-notes`

Avoid committing directly to `main` unless you are a maintainer with that responsibility.

## Commits

- Write clear commit messages in the imperative mood (e.g. `Add workspace hydration`, `Fix 401 handling on token expiry`).
- Keep commits focused: one logical change per commit when possible.
- Do not include unrelated formatting or drive-by refactors in the same commit as a feature fix unless discussed first.

## Pull requests

1. Update your branch with the latest `main` (rebase or merge as appropriate).
2. Run `npm run build` and fix any TypeScript or build errors.
3. Open a pull request with:
   - A concise **summary** of what changed and why
   - **Test plan** steps (what you ran or how a reviewer can verify)
   - Screenshots or recordings for UI changes when helpful
4. Link related issues if applicable.
5. Respond to review feedback promptly.

Maintainers may request changes before merging.

## Coding style expectations

- **TypeScript** — prefer explicit types where they improve clarity; avoid `any` unless justified.
- **React** — functional components and hooks; match existing patterns in `src/App.tsx` and related files.
- **API client** — keep HTTP logic in `src/lib/api.ts`; do not hardcode secrets or tokens.
- **Naming** — use clear, consistent names aligned with the rest of the codebase.
- **Scope** — keep pull requests small and reviewable; split large changes when possible.
- **Comments** — only where behavior is non-obvious; prefer self-explanatory code.
- **Formatting** — match surrounding style (indentation, quotes, import order).

## Secrets and environment files

- **Never** commit `.env`, `.env.local`, API keys, Supabase service role keys, or other secrets.
- Use [`.env.example`](.env.example) as the template for required variables.
- If you accidentally commit a secret, rotate it immediately and contact maintainers.

## Security

If you discover a security vulnerability, follow [SECURITY.md](SECURITY.md). Do not open a public issue for security problems.

## Code of conduct

This project follows our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
