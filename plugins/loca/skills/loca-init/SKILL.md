---
name: loca-init
description: Use to bootstrap a LocaGlint project from the project's configured source-language file(s) — parses the source-language localization file (default `zh-CN`, per project `sourceLangCode`) and creates/updates string keys (with source-language defaults) on the platform. Run this first, before glossary/sync/translate.
---

# loca-init

Seed the platform's string table from the project's existing source-language file. You
convert the local game file to platform-shaped key rows with the profile CLI, then write
them through the MCP data plane. You never touch bytes through MCP, and you never call
the API through the CLI — format conversion and data writes stay separate.

## Inputs
- Path to the project's existing source-language localization file (e.g. `zh-CN.json`
  when `sourceLangCode` is the default `zh-CN`).

## Steps
0. If the project root has no `.locaglint.json` yet (typical right after installing the
   Claude Code plugin, which already provides the skills and MCP config), scaffold only the
   project config:
   ```
   npx -y -p @glintapex/loca-mcp@0.0.0 locaglint-mcp init --no-skills --no-mcp
   ```
   Without the plugin, drop both flags to also write `.mcp.json` and copy the skills.
1. Confirm context with `loca_whoami` (project + write permission). It also returns
   `sourceLangCode` and `requireApproval` — use them to pick the source file below and
   to know the review path later skills will follow.
2. Shell out to convert the source file into key rows:
   ```
   npx -y -p @glintapex/loca-mcp@0.0.0 locaglint-profile parse-for-init <sourceFile>
   ```
   This prints `{ "entries": [ { "key", "source", "namespace": "label" }, ... ] }`.
   The CLI does format conversion only — no network, no database. Which local file
   counts as "source" is decided by the project's `sourceLangCode`, never hardcoded
   to English. This skill is a **freeze-point action** (打点式): it seeds keys once at
   bootstrap and is not a continuous sync — ongoing key growth during development is
   captured later via `loca-sync`'s `DevelopingKeys.txt` flow at the next freeze point.
3. Pass that `entries` array to `loca_upsert_keys` to batch-create/update keys with
   their source-language default (`source`). The platform assigns stable row IDs; keys
   are matched by their business `key`.

## File format (profile)

The file format of your game's localization files is handled by a **profile**, configured once per
project: `"profileModule"` in `.locaglint.json`, the `LOCAGLINT_PROFILE_MODULE` env var, or
`--profile-module <name>` on the command line. Built-in formats: `json-flat`, `json-nested`, `next-intl`,
`csv`, `unity-csv`, `i2-csv`, `godot-csv`, `gridly-csv`; a project-specific format can instead be an npm
package or local module that exports a profile. If a `locaglint-profile` / `locaglint-mcp sync|render`
command reports that no profile is configured, ask the user which format the project uses.

## Output
- Number of keys created vs. updated, and a short diff of what changed.

## Boundaries
- File-format specifics live in the CLI and the project's profile, not in MCP calls.
- Do not invent translations here — this seeds source/keys only.
