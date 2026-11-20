# LocaGlint plugin for Claude Code

> **Pre-release.** The plugin pins `@glintapex/loca-mcp@0.0.0`, a placeholder: it cannot be
> installed until the first public `@glintapex/loca-mcp` release, at which point this repository
> is re-synced to that version.

[LocaGlint](https://docs.glintapex.com/loca) is a game localization platform built for AI coding
agents. This plugin gives Claude Code the LocaGlint MCP server and seven `loca-*` skills:

| Skill | What it does |
|---|---|
| `/loca-status` | Shows who you are connected as and the current project. |
| `/loca-init` | Seeds the platform with keys from your source-language file. |
| `/loca-glossary` | Manages proper nouns and do-not-translate terms. |
| `/loca-sync` | Uploads existing translations and new keys. |
| `/loca-translate` | Translates in your own Claude Code session; placeholders and glossary terms are hard-validated on write. |
| `/loca-render` | Writes approved translations back to your game files. |
| `/loca-feedback` | Sends feedback to the LocaGlint team. |

LocaGlint never calls an AI provider: translation happens in your session.

## Install

```text
/plugin marketplace add GlintApex/loca-claude-plugin
/plugin install loca@glintapex
```

## Authenticate

1. Sign in to the LocaGlint web app and create a personal access token on the **API Token** page.
2. Make it available to Claude Code as `LOCAGLINT_TOKEN`, using one of:
   - your shell: `export LOCAGLINT_TOKEN=...` before starting `claude`;
   - `~/.claude/settings.json`: `{ "env": { "LOCAGLINT_TOKEN": "..." } }`;
   - a git-ignored project file `.claude/settings.local.json` with the same `env` block.

Never put the token in a committed file. The plugin ships no default token.

Optional variables: `LOCAGLINT_API_BASE` (default `https://loca.glintapex.com`) and
`LOCAGLINT_PROJECT_ID` (default project for every tool call).

OAuth sign-in through a remote MCP server is planned; the token-based setup will keep working for
CLI and CI use.

## Set up a game repository

Run `/loca-init` in your game repository. If the repository has no `.locaglint.json` yet, the skill
creates one with:

```bash
npx -y -p @glintapex/loca-mcp locaglint-mcp init --no-skills --no-mcp
```

## Without the plugin

Any MCP client can run the server directly; see the
[`@glintapex/loca-mcp` package](https://www.npmjs.com/package/@glintapex/loca-mcp).

## Versioning

The plugin version always equals the pinned `@glintapex/loca-mcp` version, so the MCP server and the
skills never drift apart. Maintainers update both with:

```bash
scripts/sync-from-locaglint.sh <path-to-source-checkout> <version>
```

## Support

Issues: <https://github.com/GlintApex/loca-claude-plugin/issues> · Security: see [SECURITY.md](SECURITY.md)
· Contact: support@glintapex.com

## License

MIT
