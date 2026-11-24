# 1. Official MCP Registry (registry.modelcontextprotocol.io)

**Method**: `mcp-publisher` CLI, namespace `com.glintapex/loca` verified by a DNS TXT record on the apex `glintapex.com`.
**Prepared**: `mcp-registry.server.json` (identical to `packages/mcp/server.json` in the source repo; schema 2025-12-11,
validated against the registry's JSON Schema with 0 errors). `package.json` of `@glintapex/loca-mcp` already carries
`"mcpName": "com.glintapex/loca"`. The release workflow job `publish-mcp-registry` automates every later version.

## Prerequisites
1. `@glintapex/loca-mcp` is published on npm (the registry checks `mcpName` in the published package).
2. One-time key and DNS record (approval needed: DNS change on production domain):
   ```bash
   openssl genpkey -algorithm Ed25519 -out mcp-registry-key.pem
   PUBLIC_KEY="$(openssl pkey -in mcp-registry-key.pem -pubout -outform DER | tail -c 32 | base64)"
   echo "glintapex.com. IN TXT \"v=MCPv1; k=ed25519; p=${PUBLIC_KEY}\""
   ```
   Add the TXT record at the apex of `glintapex.com` (Cloudflare, `CLOUDFLARE_API_TOKEN_GLINT`).
   Store the private key (hex) as the release secret `MCP_PRIVATE_KEY` in the (private) source repository and in sops; never in a file in git.

## Submit (first version, manual)
```bash
MCP_PRIVATE_KEY="$(openssl pkey -in mcp-registry-key.pem -noout -text | sed -n '/priv:/,/pub:/p' | sed '1d;$d' | tr -d ' :\n')" \
  mcp-publisher login dns --domain glintapex.com
# set "version" and packages[0].version to the published npm version first
mcp-publisher publish
curl -s "https://registry.modelcontextprotocol.io/v0/servers?search=com.glintapex"
```
Later versions: set repository variable `MCP_REGISTRY_PUBLISH=true`; the release job publishes after each npm release.

## Approvals needed
- DNS TXT record on `glintapex.com` apex.
- Running `mcp-publisher publish` (public listing).
