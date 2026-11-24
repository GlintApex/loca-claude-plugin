# Listing copy (shared by every directory)

All text below is final copy for submissions. Keep wording identical across directories.

## Name
LocaGlint

## One-liner (≤ 80 characters)
- EN: Game localization in your AI coding agent: validated writes, browser review. (78)
- 中文：在 AI 编码助手里做游戏本地化：写入即校验，浏览器里审核。

## Short description (≤ 100 characters, used by the MCP Registry)
Game localization from your AI agent: sync strings, validated writes, review, render to game files.

## Long description (EN, ≤ 300 words)
LocaGlint is a game localization platform built for AI coding agents. Developers work from Claude Code or any MCP client: `/loca-init` seeds every string from your source file, `/loca-translate` translates missing strings in your own agent session, and `/loca-render` writes approved text back into engine-ready files. Producers review, edit and approve one language at a time in the browser.

Every write is checked on the server: a translation that drops a `{0}` placeholder, changes a do-not-translate glossary term or breaks a length limit is rejected on the spot, not weeks later in QA. Every string keeps a permanent ID, so inserting, renaming or deleting rows never shifts translations onto the wrong keys. Snapshots freeze the table for each game version.

LocaGlint never calls an AI provider. Translation runs with the model you already use, so there is no per-word or per-credit AI charge. Built-in formats include Unity JSON and Localization CSV, I2 Localization, Godot CSV, CSV, Excel and flat or nested JSON.

The MCP server (`@glintapex/loca-mcp`) runs locally over stdio and talks only to the LocaGlint API you configure, using a personal access token.

## 长描述（中文）
LocaGlint 是为 AI 编码助手设计的游戏本地化平台。开发者在 Claude Code 或任意 MCP 客户端中工作：`/loca-init` 从源语言文件建立全部字符串，`/loca-translate` 在你自己的 Agent 会话里翻译缺失的字符串，`/loca-render` 把已批准的译文写回引擎可用的文件。制作人在浏览器中按语言审核、修改并批准。

每次写入都在服务端校验：丢失 `{0}` 占位符、改动术语表中的保留词或超出长度限制的译文会被当场拒绝，而不是几周后在 QA 才发现。每条字符串都有永久 ID，插入、改名、删除行都不会让译文错位。快照可以按游戏版本冻结整张表。

LocaGlint 不调用任何 AI 供应商，翻译使用你已经在用的模型，因此没有按字数或按点数收取的 AI 费用。内置格式包括 Unity JSON 与 Localization CSV、I2 Localization、Godot CSV、CSV、Excel、扁平或嵌套 JSON。

MCP 服务器（`@glintapex/loca-mcp`）在本地以 stdio 方式运行，只与你配置的 LocaGlint API 通信，使用个人访问令牌认证。

## Categories
Localization · Developer Tools · Productivity (pick the closest each directory offers)

## Keywords
localization, l10n, i18n, game development, unity, godot, translation, mcp, claude code

## Install
- Claude Code plugin: `/plugin marketplace add GlintApex/loca-claude-plugin` then `/plugin install loca@glintapex`
- Any MCP client (stdio): `npx -y -p @glintapex/loca-mcp locaglint-mcp`
- Environment: `LOCAGLINT_TOKEN` (required, secret), `LOCAGLINT_API_BASE` (default `https://loca.glintapex.com`), `LOCAGLINT_PROJECT_ID` (optional)

## Tools (16)
| Tool | Purpose |
|---|---|
| loca_whoami | Current user, project and permissions |
| loca_list_projects | Projects the token can access |
| loca_list_strings | List strings with filters (language, status, key prefix) |
| loca_get_string | One string by key |
| loca_get_languages | Project languages and approval state |
| loca_get_glossary | Glossary, optionally by language |
| loca_upsert_glossary | Create/update glossary terms (do-not-translate is enforced) |
| loca_upsert_keys | Create/update string keys in bulk |
| loca_write_translations | Write translations (placeholders, glossary, length checked) |
| loca_request_review | Ask a reviewer to approve a language |
| loca_get_review_status | Per-language review status |
| loca_export_approved | Export approved / non-empty translations |
| loca_create_snapshot | Freeze the table for a game version |
| loca_list_snapshots | List snapshots |
| loca_restore_snapshot | Restore a snapshot |
| loca_submit_feedback | Send feedback to the LocaGlint team |

## Links
| Purpose | URL | Status |
|---|---|---|
| Website | https://glintapex.com/loca | built, **not deployed** (needs approval) |
| Pricing | https://glintapex.com/loca/pricing | built, **not deployed** |
| Docs | https://docs.glintapex.com/loca | not live yet |
| Privacy policy | https://glintapex.com/privacy | live |
| Terms of service | https://glintapex.com/terms | live (Beta) |
| Security overview | https://glintapex.com/security | draft, **not deployed** |
| Sub-processors | https://glintapex.com/subprocessors | draft, **not deployed** |
| DPA | https://glintapex.com/dpa | draft, **not deployed** |
| Source / issues | https://github.com/GlintApex/loca-claude-plugin | public |
| Package | https://www.npmjs.com/package/@glintapex/loca-mcp | **not published** |
| Contact | support@glintapex.com · security@glintapex.com | live |

## Privacy statement (for directory forms)
The LocaGlint MCP server runs on the user's machine and sends data only to the LocaGlint API configured in `LOCAGLINT_API_BASE`, authenticated with the user's personal access token. It does not call any AI provider and collects no telemetry. Data handling on the LocaGlint service is described in the privacy policy and the sub-processor list.
