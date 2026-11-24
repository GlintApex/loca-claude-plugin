---
name: loca-render
description: Render platform translations back into the game's per-language localization files. Prefer the single consolidated command `locaglint-mcp render`, which auto-derives the target directory, source language, approval gating, and per-language completeness — no parameter guessing. What gets exported depends on the project's requireApproval setting.
---

# loca-render

Turn platform translations back into the game's per-language localization files.
**What gets exported depends on the project's `requireApproval` setting:**
- **`requireApproval: false` (default):** all languages' **non-empty** translations
  are exported, regardless of per-language approval state.
- **`requireApproval: true`:** only languages **approved** per-language (by a PM in
  the Web UI) are exported; anything still `pending` is reported, not written.

Render is the exact inverse of parse — the produced files match the original
layout of the project's file format (its profile). **Render ≠ BAKE:** this produces game files from
platform data; any engine build/bake step (files → binary assets) is a separate project-side concern
and is NOT part of this workflow.

## Preferred: one command

```
npx -y -p @glintapex/loca-mcp@0.0.0 locaglint-mcp render [--lang all|<code,code>] [--snapshot <id>]
```

That's it. This single command does the whole pipeline in-process and writes the
files — **you don't pass `--dir`, `--out`, `--source-lang`, or approval flags.** It:

1. Reads `renderOutDir` from the project-root `.locaglint.json` (default
   `localization/out/`) and uses it as the output dir (renders in place). Profiles whose
   files carry language metadata (fonts / display names) also derive the language table
   from the existing files there; other profiles take it from the project's platform languages.
2. Reads the platform **source language** and **requireApproval** from `/context` —
   so the source-side text lands in the right file automatically.
3. Under `requireApproval: true`, restricts output to **approved** languages and
   reports the `pending` ones.
4. Exports the data (server already gates by approval) and renders each candidate
   language **per key**: an untranslated key is simply **omitted from that language's
   file, and the language still renders** (no more all-or-nothing skip when one key
   is missing). Only a language with **zero** translated keys is skipped (no empty
   file written). Partially rendered languages report how many keys were omitted.
   Profiles whose format requires every language file to carry the same keys write an empty
   string `""` for an untranslated key instead of omitting it; `sync` skips empty strings, so
   re-syncing the rendered files never writes them back as translations.
5. Writes one file per rendered language and prints a summary.

Options (all optional):
- `--lang all` (default) or a comma-separated subset, e.g. `--lang zh-CN,ja-JP`.
- `--snapshot <id>` — render a frozen version (from a prior `loca_create_snapshot`)
  instead of the live table.
- `--dir` / `--out` / `--source-lang` — advanced overrides; normally omit them, the
  command derives them.

Auth comes from the same env the MCP server uses (`LOCAGLINT_*`), exactly like
`locaglint-mcp sync`. No temp file, no per-file writing through the LLM.

## Reading the summary

The command prints:
- `已写 N 个文件: …` — the files written (one per rendered language).
- `未批准(跳过…)` — under `requireApproval`, languages still pending review (not
  rendered). Tell the user to approve them in the Web UI (dev/AI can only
  `loca_request_review`).
- `部分渲染(…写入N/省略M…)` — the language rendered, but M keys have no translation
  yet and are omitted from the file; translate them (loca-translate / loca-sync) and
  re-render to fill them in.
- `全未翻(未写文件…)` — a language with zero translated keys; no file written.
  Translate it first, then render.

## Advanced / fallback: the low-level path

Only if you need to inspect the intermediate data, or `locaglint-mcp render` is
unavailable, fall back to the two-step path:

1. `loca_get_review_status({ lang? })` — inspect per-language approval.
2. `loca_export_approved({ lang: <code>|"all", snapshot? })` — returns a **bare
   `StringEntry[]`** (no language table). Save it to e.g. `approved.json`.
3. `npx -y -p @glintapex/loca-mcp@0.0.0 locaglint-profile render --approved <file> --dir <existingFilesDir> --out <dir>
   --languages <codes|all> [--source-lang <code>]`. **`--dir` is required for profiles
   that derive the language table from existing files** — the bare array has no
   font/displayName metadata. Pass `--source-lang` explicitly when the
   project source language isn't `en-GB`.

This low-level CLI does format conversion only — no network, no database, no AI.

## File format (profile)

The file format of your game's localization files is handled by a **profile**, configured once per
project: `"profileModule"` in `.locaglint.json`, the `LOCAGLINT_PROFILE_MODULE` env var, or
`--profile-module <name>` on the command line. Built-in formats: `json-flat`, `json-nested`, `next-intl`,
`csv`, `unity-csv`, `i2-csv`, `godot-csv`, `gridly-csv`; a project-specific format can instead be an npm
package or local module that exports a profile. If a `locaglint-profile` / `locaglint-mcp sync|render`
command reports that no profile is configured, ask the user which format the project uses.

## Boundaries

- Under `requireApproval: true`, never render an unapproved language — approval is
  per-language, controlled in the Web UI. The consolidated command enforces this.
  **Approval gating and translation completeness are separate concerns**: unapproved
  → the whole language is skipped (`pending`); approved but missing a few keys →
  per-key partial render.
- **Render is a full regen from platform data, NOT a local merge.** Old keys' text
  already lives on the platform, so a full regen writes them back automatically — no
  need to hand-merge a new batch into the old JSON. Conversely, **keys deleted
  (soft-deleted) on the platform disappear from local files** on the next render:
  render output = the platform's current live key set. Just run `render` for an
  incremental batch.
- Render = translations → game files. It is NOT an engine build/bake step (files → binary assets).
- All data reads go through the platform data plane; the profile step only converts
  format.
