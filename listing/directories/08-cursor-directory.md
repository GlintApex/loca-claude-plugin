# 8. Cursor MCP directory (cursor.directory)

**Method**: "Submit" on cursor.directory (sign in with GitHub), MCP server type.
**Fields**: name LocaGlint · description = one-liner · repository URL · logo `../assets/icon-400.png` ·
install config:
```json
{ "mcpServers": { "locaglint": { "command": "npx", "args": ["-y", "-p", "@glintapex/loca-mcp", "locaglint-mcp"],
  "env": { "LOCAGLINT_API_BASE": "https://loca.glintapex.com", "LOCAGLINT_TOKEN": "<your token>" } } } }
```
## Approvals needed
- Signing in and submitting.
