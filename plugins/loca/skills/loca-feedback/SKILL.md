---
name: loca-feedback
description: Report a problem, confusion, or idea about LocaGlint (the platform, the MCP tools, or the loca-* skills) to the GlintApex support team. Use this whenever you hit a bug, a wrong/confusing behavior, a missing capability, or think of an improvement while doing localization work — support triages it and replies by email.
---

# loca-feedback

Send feedback about LocaGlint itself to the GlintApex support team. This closes the loop: when something in the tooling gets in your way, don't just work around it silently — file it, so it can be fixed for everyone.

## When to use

Offer to submit feedback (and, if the user agrees, do it) whenever:
- A `loca_*` tool errors, behaves unexpectedly, or its result contradicts what a skill said would happen.
- A skill's instructions are unclear, wrong, or don't match reality.
- The user is blocked or annoyed by a missing capability ("I wish I could …", "why can't it …").
- You or the user think of an improvement to the platform, MCP, or skills.

Don't file feedback about the game content or translations themselves — this channel is for the **LocaGlint product**, not for the localization data.

## Steps

1. Summarize the problem or idea in one or two sentences, in plain language the maintainer can act on. If it's a bug, include what you did, what happened, and what you expected.
2. Pick a `kind`:
   - `bug` — something is broken or behaves wrong.
   - `idea` — a suggestion / feature request / improvement.
   - `question` — you're unsure how something is meant to work (default if unclear).
3. Optionally attach a `context` object to help triage — e.g. `{ key, lang, skill, tool }` for whatever you were doing when it came up.
4. **Privacy notice before submitting**: tell the user "the feedback content (including any context you attach, which may contain game text) will be sent to the GlintApex support team", and only submit once they agree. Attach only the minimum context needed to reproduce.
5. Call `loca_submit_feedback({ content, kind, context })`. It returns `{ id, ref, status, message }`.
6. Tell the user it was submitted, give them the reference `ref`, and say support will reply by email.

## Output

Confirm submission with the returned reference `ref`, and echo back the one-line summary you sent, so the user knows exactly what was reported.

## Boundaries

- This only **submits** feedback (`loca_submit_feedback`). Feedback is not shown inside the customer project; GlintApex support handles it and replies by email.
- Prefer asking the user before submitting, unless they've already told you to file it. Keep one issue per submission — don't batch unrelated problems into one.
- Feedback records the org and project it came from (support can see where it came from); never include secrets or tokens.
