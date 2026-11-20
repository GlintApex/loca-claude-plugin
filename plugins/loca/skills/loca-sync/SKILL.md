---
name: loca-sync
description: Use at a version freeze point to promote new keys accumulated in DevelopingKeys.txt and import existing partial translation files into LocaGlint without losing human work — fills only empty slots by default (client-side guard); pass --overwrite to replace existing values. Run after loca-init. References loca_list_strings to determine which slots are untranslated before writing.
---

# loca-sync

**This is a freeze-point (打点式 / version freeze point) skill, not a continuous sync.**
It runs at a version freeze point, not throughout ongoing development. The key truth
source lives in the game repo itself; during development, devs accumulate new keys
plus their source-language text (project's configured source language, default
`zh-CN`) in a scratch file, `DevelopingKeys.txt`. At freeze time, this skill reads
that file as the promotion input for new keys (step 0 below), then syncs
already-translated language files as before.

**Freeze-point order:** sync (new keys + source text) → `loca_create_snapshot({
gameVersion })` to freeze a snapshot → (translator) translates → (reviewed per the
project's `requireApproval` setting) → `loca-render` writes back to the game config.

Bring already-translated strings onto the platform. By default this is additive:
it fills only empty slots and never clobbers an existing human translation. Use
`--overwrite` only when you intend to replace existing values.

The fill-empty guarantee is enforced CLIENT-SIDE (by this skill) — the server's
`loca_write_translations` always overwrites whatever it receives. You must filter
the items to write BEFORE calling the tool.

## Inputs
- (Optional) `DevelopingKeys.txt` — a dev-side scratch file accumulating new keys plus
  their source-language text during development. If present, read its contents and
  reshape them into an `entries` array for `loca_upsert_keys`
  (`{ key, namespace: "label", source }`), then write it — promoting the new keys —
  before the per-language sync steps below. `DevelopingKeys.txt` has no fixed line
  format — it is whatever the dev team has agreed on; this skill just parses out
  key + source-language text (YAGNI: no draft state in this milestone).
- One or more existing per-language translation files (in the project's file format, see the project's profile).

## Steps

0. **If `DevelopingKeys.txt` is provided, promote its new keys first.** Parse the
   file's key + source-language pairs into `entries: [{ key, namespace: "label",
   source }, ...]` and call `loca_upsert_keys` (same shape as `loca-init`) to
   create/update them on the platform, before doing the per-language sync below and
   before calling `loca_create_snapshot`.

1. For each language file, convert it to platform-shaped rows:
   ```
   npx -y -p @glintapex/loca-mcp@0.0.0 locaglint-profile parse-for-sync <file>
   ```
   This prints:
   ```json
   { "languageCode": "zh-CN", "items": [ { "key": "Foo_001", "text": "..." }, ... ] }
   ```
   Note: `items` entries contain only `key` and `text` — there is **no `lang` field**
   in the CLI output; `languageCode` lives at the top level only.

2. **DEFAULT — fetch the untranslated set to avoid clobbering human work.**
   Unless `--overwrite` was explicitly requested, call:
   ```
   loca_list_strings({ filter: "untranslated", lang: <languageCode> })
   ```
   This returns only the strings that currently lack a non-empty translation for
   that language. Build a Set of those `key` values — call it `untranslatedKeys`.

   From the `parse-for-sync` items, keep only items whose `key` is in
   `untranslatedKeys`. Items not in that set already have a human translation and
   must be silently skipped (their count feeds the "skipped" report).

   With `--overwrite` (user-explicit): skip this step and write ALL items.

3. **CRITICAL — expand `languageCode` into every item's `lang` before calling the
   tool.** The tool requires per-item `lang`; `parse-for-sync` intentionally omits
   it. Build the payload from the filtered (or full, with `--overwrite`) items:
   ```
   loca_write_translations({
     items: filteredItems.map(({ key, text }) => ({
       key,
       lang: languageCode,   // top-level languageCode injected here
       text,
     }))
   })
   ```

4. Call `loca_write_translations` with the assembled payload.
   - The API hard-validates placeholders and reserved words on write; a row that
     drops a `{0}`-style placeholder or mangles a reserved word is rejected with a
     400 error — fix the affected row and retry.

## Output
- Number of translations imported, plus a conflict report: how many keys were
  skipped because they already had a human translation (i.e. were not in the
  `untranslated` set), unless `--overwrite` was used.

## Bulk-importing translations (use `locaglint-mcp sync`)

When syncing a whole batch of already-translated files back to the platform, **do NOT have the AI generate the payload row by row** — routing MB-scale data through the LLM token stream truncates/corrupts it. Use instead:

    npx -y -p @glintapex/loca-mcp@0.0.0 locaglint-mcp sync --dir <dir of per-language translation files> [--lang ja,fr] [--overwrite] [--concurrency N] [--dry-run] [--report out.json]

- Data flows entirely in-process, byte-exact; by default only fills slots the platform still has empty (`--overwrite` replaces all).
- Auto-batches at ~800KB (server single-request limit is 10MB) with per-language bounded concurrency; validation-rejected rows are isolated by binary search, good rows are still written, and violations go to `--report`.

> **On "writes must go through MCP"**: the real rule is (1) don't bypass server-side validation, (2) don't route bulk data through the LLM. `locaglint-mcp sync` and `loca_write_translations` hit the **same** `/translations` endpoint with the **same** validation and the **same** ApiKey — so it complies. Small interactive writes can still use the `loca_write_translations` tool.

## Boundaries
- Never overwrite human translations without an explicit `--overwrite`.
- The fill-empty guard is implemented HERE (client-side via `loca_list_strings`),
  NOT by the server. Do not assume the server or `loca_write_translations` has any
  fill-empty or overwrite parameter — it does not.
- The CLI (`locaglint-profile parse-for-sync`) does format conversion only — no
  network, no database. All data reads and writes go through the MCP data plane
  (`loca_list_strings`, `loca_write_translations`, plus `loca_upsert_keys` for the
  optional `DevelopingKeys.txt` promotion step).
- This skill runs at freeze points, not continuously. `DevelopingKeys.txt` is a
  dev-side scratch file with no server-side representation until this skill
  promotes it via `loca_upsert_keys`.
