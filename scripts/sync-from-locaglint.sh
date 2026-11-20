#!/usr/bin/env bash
# Sync the loca-* skills (English) from a LocaGlint checkout and pin every manifest to one
# @glintapex/loca-mcp version, so the MCP server and the skills always match.
#
# usage: scripts/sync-from-locaglint.sh <path-to-LocaGlint-checkout> <version>
set -euo pipefail
src="${1:?usage: $0 <LocaGlint checkout> <version>}"
ver="${2:?usage: $0 <LocaGlint checkout> <version>}"
root="$(cd "$(dirname "$0")/.." && pwd)"
dest="$root/plugins/loca/skills"

[[ "$ver" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$ ]] || { echo "bad version: $ver" >&2; exit 2; }
[ -d "$src/skills" ] || { echo "no skills/ in $src" >&2; exit 2; }

rm -rf "$dest"
mkdir -p "$dest"
for d in "$src"/skills/loca-*/; do
  name="$(basename "$d")"
  mkdir -p "$dest/$name"
  # English only; pin `npx -p @glintapex/loca-mcp` invocations to the plugin version
  sed -E "s#@glintapex/loca-mcp([^@/A-Za-z0-9-]|$)#@glintapex/loca-mcp@${ver}\1#g" "$d/SKILL.md" > "$dest/$name/SKILL.md"
done

node - "$root" "$ver" <<'NODE'
const fs = require('fs');
const path = require('path');
const [root, ver] = process.argv.slice(2);
const rw = (p, f) => { const j = JSON.parse(fs.readFileSync(p, 'utf8')); f(j); fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n'); };
rw(path.join(root, 'plugins/loca/.claude-plugin/plugin.json'), (j) => { j.version = ver; });
rw(path.join(root, '.claude-plugin/marketplace.json'), (j) => { for (const p of j.plugins) if (p.name === 'loca') p.version = ver; });
rw(path.join(root, 'plugins/loca/.mcp.json'), (j) => {
  const args = j.mcpServers.locaglint.args;
  const i = args.indexOf('-p');
  args[i + 1] = `@glintapex/loca-mcp@${ver}`;
});
NODE
echo "synced $(ls "$dest" | wc -l) skills, pinned @glintapex/loca-mcp@${ver}"
