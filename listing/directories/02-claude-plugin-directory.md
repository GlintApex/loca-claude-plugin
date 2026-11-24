# 2. Claude Code plugin directory

**Method**: users can already add the marketplace themselves (`/plugin marketplace add GlintApex/loca-claude-plugin`).
Listing in Anthropic's plugin directory is a submission through the developer portal.

**Prepared**
- `plugins/loca` passes `claude plugin validate --profile directory --strict` (icon `.claude-plugin/icon.png`, 512×512 brand file).
- `scripts/plugin-smoke.sh`: installs into a throwaway config and checks 7 skills + 1 MCP server.
- `scripts/mcp-smoke.mjs`: starts the pinned MCP server over stdio and checks 16 tools (+ `loca_list_projects` with a token).
- Copy: `../copy.md`; icon: `../assets/icon-512.png` (the portal takes the icon only on first save — use this file).

## Before submitting
1. npm release done; run `scripts/sync-from-locaglint.sh <LocaGlint checkout> <version>` so `.mcp.json`, plugin.json,
   marketplace.json and skills pin the released version; commit, tag `v<version>`.
2. `scripts/plugin-smoke.sh GlintApex/loca-claude-plugin` and `LOCAGLINT_TOKEN=… node scripts/mcp-smoke.mjs`.

## Approvals needed
- Submitting in the developer portal (public listing; the directory also runs its own safety scan and policy review).
