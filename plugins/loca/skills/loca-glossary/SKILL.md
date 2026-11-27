---
name: loca-glossary
description: Use to import a project glossary (dev-maintained JSON/CSV) into LocaGlint — proper-noun terms plus reserved / do-not-translate words. Run after loca-init and before loca-translate so the translator has consistent terminology.
---

# loca-glossary

Load the dev-maintained glossary onto the platform so later translation calls can
inject consistent proper-noun translations and keep reserved words untranslated.

## Inputs
- A glossary file (JSON or CSV) maintained by the dev. There is no profile CLI
  subcommand for glossary files — the format is simple enough that you read and
  parse it directly.

## Glossary File Shape

Each row (JSON object or CSV record) should provide fields that map to the
platform `GlossaryEntry`:

| Field            | Type                    | Notes                                              |
|------------------|-------------------------|----------------------------------------------------|
| `term`           | `string`                | The source term (e.g. `"StarCoins"`)              |
| `type`           | `string` (recommended `"proper"` \| `"term"`, default `"term"`) | Reference note / category only — **no enforcement**. Via MCP only `"proper"` or `"term"` are accepted. |
| `doNotTranslate` | `boolean`               | **The only enforced signal**: `true` = the term must be kept verbatim (hard-validated on write) |
| `translations`   | `Record<string,string>` | (optional) preferred per-language translations for the term |

`type` is just a label for translators/AI (proper = proper noun, term = general term). Whether a term is kept verbatim is decided solely by `doNotTranslate`.

Example JSON:
```json
[
  { "term": "StarCoins", "type": "proper", "doNotTranslate": false,
    "translations": { "zh-CN": "星币", "ja-JP": "スターコイン" } },
  { "term": "BETA", "type": "term", "doNotTranslate": true }
]
```

## Steps

1. Read the glossary file (JSON array or CSV rows) and shape each row into a
   `GlossaryEntry` object:
   - `term` — the source term.
   - `type` — reference note only; use `"proper"` (proper noun) or `"term"` (general
     term), default `"term"`. Not enforced by the platform.
   - `doNotTranslate` — `true` if the term must be kept verbatim (this is the only
     enforced field). Set it regardless of `type`.
   - `translations` (optional) — per-language preferred translation of the term,
     keyed by language code.
2. Pass the shaped array to `loca_upsert_glossary` to batch-create or update the
   entries on the platform:
   ```
   loca_upsert_glossary({ entries: [ ...GlossaryEntry[] ] })
   ```

## Output
- Number of glossary terms imported vs. updated.

## Boundaries
- Reserved words flagged here are later enforced on write by the API's hard
  validation (see loca-translate) — this skill only registers them.
- No profile CLI subcommand exists for glossary parsing; do NOT invoke
  `locaglint-profile` for this step.
