---
name: loca-status
description: Confirm the MCP connection to LocaGlint and inspect the current project context (whoami). Run this first before any localization work, whenever you need to check which project / role / source language / approval setting you are operating under, or to troubleshoot a broken or wrong connection.
---

# loca-status

Confirm you are connected to the right LocaGlint project, and read the current context, before running any other loca-* skill. This is the orientation / health-check entry point.

## Steps

1. Call `loca_whoami`. A successful response means the MCP server is connected and your token authenticated.
2. Report the returned fields so the user knows exactly what the following skills will act on:
   - `projectId` — the project you are operating on (comes from `LOCAGLINT_PROJECT_ID` in `.mcp.json`).
   - `role` — your role (`dev` / `pm` / `admin`); it gates actions (e.g. only `pm`/`admin` may approve languages).
   - `sourceLangCode` — the source language (e.g. `zh-CN`); parse-for-init / translate / render all key off this.
   - `requireApproval` — if `true`, translations must be approved **per language** (by a PM in the Web UI) before `loca-render` will export that language; dev/AI can only `loca_request_review`.
3. Optionally call `loca_list_projects` to list every project this token can access (useful when the project id looks wrong).

## Output

Report `projectId`, `role`, `sourceLangCode`, and `requireApproval` — one line each — as a short "connected, here is your context" summary.

## If it fails

- **No `loca_*` tools available, or the call errors** → the MCP server is not connected. Check that `.mcp.json` has `env.LOCAGLINT_TOKEN` and `env.LOCAGLINT_PROJECT_ID` filled in, then reopen / reload the MCP client so it re-reads `.mcp.json`.
- **401 / unauthorized** → the token is wrong or revoked; issue a new one on the platform's API Tokens page and update `.mcp.json`.
- **Unexpected `projectId`** → `.mcp.json` points at a different project than intended; fix `env.LOCAGLINT_PROJECT_ID`.

## Boundaries

- Read-only: this skill only inspects context (`loca_whoami` / `loca_list_projects`) — it never writes.
- Run this first, or any time you want to re-check context. The lifecycle skills follow: loca-init → loca-glossary → loca-sync → loca-translate → loca-render.
