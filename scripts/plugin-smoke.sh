#!/usr/bin/env bash
# Installs this marketplace + plugin into a throwaway Claude Code config (your own config is untouched)
# and checks the component inventory: 7 loca-* skills and 1 MCP server.
# usage: scripts/plugin-smoke.sh [marketplace source]   (default: this checkout; use GlintApex/loca-claude-plugin for the published repo)
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
src="${1:-$root}"
cfg="$(mktemp -d)"
trap 'rm -rf "$cfg"' EXIT
export CLAUDE_CONFIG_DIR="$cfg"
claude plugin validate --profile directory --strict "$root/plugins/loca" >/dev/null
claude plugin marketplace add "$src" >/dev/null
claude plugin install loca@glintapex >/dev/null
details="$(claude plugin details loca@glintapex)"
echo "$details" | grep -q 'Skills (7)' || { echo "✘ expected 7 skills"; echo "$details"; exit 1; }
echo "$details" | grep -q 'MCP servers (1)' || { echo "✘ expected 1 MCP server"; echo "$details"; exit 1; }
for s in loca-init loca-glossary loca-sync loca-translate loca-render loca-status loca-feedback; do
  echo "$details" | grep -q "$s" || { echo "✘ missing skill $s"; exit 1; }
done
echo "✓ marketplace glintapex → plugin loca installed: 7 skills, 1 MCP server"
