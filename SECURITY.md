# Security Policy

## Supported versions

Security fixes are applied to the **current `main` branch** only. Older tags or forks are not officially supported unless stated otherwise by maintainers.

| Version / branch | Supported |
| ---------------- | --------- |
| `main` (latest)  | Yes       |
| Other branches   | No        |

## Reporting a vulnerability

If you believe you have found a security vulnerability in SignalForge, please **do not** open a public GitHub issue.

Instead, report it privately by email:

**yasinjir@outlook.com**

Include as much detail as possible:

- Description of the issue and potential impact
- Steps to reproduce
- Affected components (frontend, backend, auth, deployment, etc.)
- Any proof-of-concept or logs (avoid sharing real user data or production secrets)

We will acknowledge receipt when possible and work on a fix or mitigation. Please allow reasonable time for investigation before public disclosure.

## What to expect

- We may ask for additional information to reproduce or assess the report.
- We will not share your contact details without permission unless required by law.
- Coordinated disclosure is appreciated; we will aim to communicate timelines when we can.

## Out of scope (generally)

The following are usually **not** treated as sole security issues on their own:

- Missing security headers on demo deployments without demonstrated impact
- Social engineering or physical attacks
- Issues in third-party services (Supabase, Vercel) — report those to the respective vendors
- Known MVP limitations documented in the README (e.g. mock generation pipelines)

Thank you for helping keep SignalForge and its users safe.
