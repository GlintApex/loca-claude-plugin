#!/usr/bin/env node
// Talks to the plugin's MCP server over stdio exactly as Claude Code would (no LLM, no dependencies):
// initialize → tools/list (expects 16 loca_* tools) → optionally loca_list_projects when LOCAGLINT_TOKEN is set.
//
// usage: node scripts/mcp-smoke.mjs [package-spec]
//   package-spec defaults to the version pinned in plugins/loca/.mcp.json; pass a local .tgz to test before release.
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';

const mcp = JSON.parse(readFileSync(new URL('../plugins/loca/.mcp.json', import.meta.url), 'utf8')).mcpServers.locaglint;
const pinned = mcp.args[mcp.args.indexOf('-p') + 1];
const spec = process.argv[2] ?? pinned;
const env = {
  ...process.env,
  LOCAGLINT_API_BASE: process.env.LOCAGLINT_API_BASE ?? 'https://loca.glintapex.com',
  LOCAGLINT_TOKEN: process.env.LOCAGLINT_TOKEN ?? 'smoke-no-token',
};
const child = spawn('npx', ['-y', '-p', spec, 'locaglint-mcp'], { env, stdio: ['pipe', 'pipe', 'inherit'] });
let buf = '';
const waiters = new Map();
child.stdout.on('data', (d) => {
  buf += d;
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    const msg = JSON.parse(line);
    waiters.get(msg.id)?.(msg); waiters.delete(msg.id);
  }
});
let id = 0;
const call = (method, params) => new Promise((resolve, reject) => {
  const n = ++id;
  const t = setTimeout(() => reject(new Error(`${method} timed out`)), 120000);
  waiters.set(n, (m) => { clearTimeout(t); resolve(m); });
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: n, method, params }) + '\n');
});
const fail = (m) => { console.error(`✘ ${m}`); child.kill(); process.exit(1); };
try {
  const init = await call('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'loca-plugin-smoke', version: '0' } });
  if (init.error) fail(`initialize: ${JSON.stringify(init.error)}`);
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  const list = await call('tools/list', {});
  const names = list.result.tools.map((t) => t.name);
  if (names.length !== 16 || !names.every((n) => n.startsWith('loca_'))) fail(`unexpected tools: ${names.join(', ')}`);
  console.log(`✓ ${spec}: ${names.length} tools`);
  if (process.env.LOCAGLINT_TOKEN) {
    const r = await call('tools/call', { name: 'loca_list_projects', arguments: {} });
    if (r.result?.isError || r.error) fail(`loca_list_projects: ${JSON.stringify(r.result?.content ?? r.error).slice(0, 300)}`);
    console.log(`✓ loca_list_projects against ${env.LOCAGLINT_API_BASE}: ${JSON.parse(r.result.content[0].text).length} project(s)`);
  } else {
    console.log('… LOCAGLINT_TOKEN not set: skipped the authenticated call');
  }
} finally {
  child.kill();
}
