---
name: loca-translate
description: Use to translate missing strings for one or more target languages from within the translator's Claude Code session — you (the AI) produce the translations, preserving placeholders, injecting glossary proper nouns, and keeping reserved words untranslated. Whether the result needs review before export depends on the project's requireApproval setting.
---

# loca-translate

Translate the platform's missing strings for the requested target language(s). YOU,
the **translator's** Claude Code AI, do the translating. "Translator" is whoever
holds the MCP token for this session — often a dev, but it may equally be a PM or
anyone else with write access; this skill does not assume a fixed role. There is no
embedded AI provider on the platform (BYO-AI: the platform never calls an AI;
translation happens here in your Claude Code session). Whether the written
translation needs review before it can be exported depends on the project's
`requireApproval` setting — see step 5.

## Inputs
- Target language(s) (language codes, e.g. `zh-CN`, `ja-JP`).
- Optional key filter (prefix or namespace).

## Steps

1. **List what needs translating:**
   ```
   loca_list_strings({ filter: "missing", lang: <code>, keyPrefix?: <prefix> })
   ```
   Returns untranslated entries. Each entry carries a `source` (text in the
   project's configured source language, default `zh-CN`), its `key`, and any
   existing `context`.

2. **Fetch the glossary once** with `loca_get_glossary` (optionally per `lang`).
   Decide behavior from **`doNotTranslate` and `translations`** (not `type` — `type`
   is only a reference note):
   - **Entries with `translations[<lang>]`** — use that value as the consistent
     rendering for the term wherever it appears.
   - **Entries with `doNotTranslate: true`** — the term must appear verbatim
     (untranslated) in the output.

3. **Translate each `source` string into the target language.** You MUST:
   - **Preserve every placeholder verbatim**, including bare `{0}`, `{1}`, … and
     reference-style `{0:>Item_Name}` tokens. Dropping or reformatting
     a placeholder index causes a hard-reject on write.
   - **Named placeholders** such as `{name}` or `{user.first_name}` are checked too (project setting
     `placeholderStyle: auto`, the default): keep exactly the same set as the source — a missing one is
     rejected with `placeholder_missing`, an invented one with `placeholder_extra`. Braces with spaces or
     quotes (JSON like `{ "a": 1 }`) are not placeholders, and ICU-quoted `'{name}'` is literal text.
   - **ICU MessageFormat** (`{count, plural, one {# item} other {# items}}`, `select`,
     `selectordinal`): keep every argument name (`{count}`) and the `#`, always keep an
     `other` branch, use the **target language's** plural keywords (ja/zh/ko: only `other`;
     ru/uk/pl: `one`/`few`/`many`/`other`; `=0`-style exact matches are always allowed), and keep
     `select` keys unchanged. Violations are rejected with `icu_invalid` / `icu_argument_missing`.
   - **Inject consistent proper-noun translations** from the glossary (step 2) —
     do not invent ad-hoc renderings for known terms.
   - **Keep reserved / do-not-translate words verbatim and untranslated** — copy
     them into the translation exactly as they appear in `source`.

4. **Write the results:**
   ```
   loca_write_translations({
     items: [ { key, lang: <code>, text: <translatedText> }, ... ]
   })
   ```
   The API **HARD-VALIDATES** placeholders and reserved words on every write. A
   translation that drops a `{0}` placeholder (or a reference-style
   `{0:>Item_Name}` token) or contains a reserved word that was not preserved
   verbatim is rejected with a 400 error. Fix the offending translation(s) —
   ensure all `{n}` / `{n:>...}` tokens are preserved exactly and all reserved
   words appear verbatim — then retry `loca_write_translations` with the corrected
   items.

5. **Submit for review, if the project requires it.** Whether review is needed
   depends on the project's `requireApproval` setting (from `loca_whoami`):
   - **`requireApproval: false` (default):** the write in step 4 is already
     sufficient — `loca-render` can export it immediately. Calling
     `loca_request_review` is optional and not on the critical path.
   - **`requireApproval: true`:** languages are approved one at a time in the Web
     UI, so call:
     ```
     loca_request_review({ lang: <code>, note?: <optional note> })
     ```
     to mark the language pending review. If your current role has no approve
     capability (RBAC), requesting review is all you can do here — someone with
     approve permission (e.g. a PM) must approve in the Web UI before
     `loca-render` will export it.

## Output
- Number of strings translated, and — when `requireApproval` is on — a note that
  the language is now pending review.

## Translation concurrency (dev-side, decoupled from the platform)

Translation is compute-bound; the bottleneck is your **AI provider's rate/cost**, not LocaGlint:

- **Parallelize by language**: languages are independent — one worker per language (naturally parallel).
- **The concurrency ceiling** is set by the AI's rate limits (requests/min, tokens/min) and cost — nothing to do with the platform.
- **Decouple translate from write-back**: translate first, then write everything back with `locaglint-mcp sync` (the platform only imposes limits — 10MB body / 30s / row locks — at the write-back stage, which sync handles). Don't spin up N naked writers against the same project.

See the demo doc `docs/translation-concurrency.md`.

## Boundaries
- This skill never approves languages itself — `loca_request_review` only requests
  review. When `requireApproval` is on, approval happens per-language in the Web
  UI by whoever holds approve permission (RBAC); that may or may not be you.
- Translation happens here in Claude Code; the platform never calls an AI provider.
- No profile CLI subcommand is needed for this workflow — all steps go through the
  MCP data plane (`loca_list_strings`, `loca_get_glossary`, `loca_write_translations`,
  `loca_request_review`).
