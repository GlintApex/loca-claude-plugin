#!/usr/bin/env node
// Structural checks for the marketplace + plugin: JSON manifests parse, versions agree with the
// pinned MCP package, and every skill has frontmatter whose name matches its directory.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const read = (p) => JSON.parse(readFileSync(path.join(root, p), 'utf8'));
const errors = [];
const fail = (m) => errors.push(m);

const market = read('.claude-plugin/marketplace.json');
const plugin = read('plugins/loca/.claude-plugin/plugin.json');
const mcp = read('plugins/loca/.mcp.json');

if (market.name !== 'glintapex') fail('marketplace name must be "glintapex"');
const entry = market.plugins.find((p) => p.name === 'loca');
if (!entry) fail('marketplace must list plugin "loca"');
if (plugin.name !== 'loca') fail('plugin name must be "loca"');
if (entry && entry.version !== plugin.version) fail(`marketplace version ${entry.version} != plugin version ${plugin.version}`);

const server = mcp.mcpServers?.locaglint;
if (!server) fail('.mcp.json must define mcpServers.locaglint');
else {
  const pkg = server.args[server.args.indexOf('-p') + 1];
  if (pkg !== `@glintapex/loca-mcp@${plugin.version}`) fail(`.mcp.json must pin @glintapex/loca-mcp@${plugin.version}, got ${pkg}`);
  if (server.env?.LOCAGLINT_TOKEN !== '${LOCAGLINT_TOKEN}') fail('LOCAGLINT_TOKEN must come from the environment, never a literal');
}

const skillsDir = path.join(root, 'plugins/loca/skills');
const skills = existsSync(skillsDir) ? readdirSync(skillsDir) : [];
if (skills.length === 0) fail('no skills found');
for (const name of skills) {
  const text = readFileSync(path.join(skillsDir, name, 'SKILL.md'), 'utf8');
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) { fail(`${name}: missing frontmatter`); continue; }
  const fm = Object.fromEntries(m[1].split('\n').map((l) => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()]));
  if (fm.name !== name) fail(`${name}: frontmatter name "${fm.name}" does not match directory`);
  if (!fm.description) fail(`${name}: empty description`);
  for (const ref of text.matchAll(/@glintapex\/loca-mcp(@[^\s`"']+)?/g)) {
    if (ref[1] !== `@${plugin.version}`) fail(`${name}: unpinned or mismatched package reference "${ref[0]}"`);
  }
}

if (errors.length) {
  for (const e of errors) console.error(`validate: ${e}`);
  process.exit(1);
}
console.log(`validate: OK (plugin ${plugin.name}@${plugin.version}, ${skills.length} skills)`);
