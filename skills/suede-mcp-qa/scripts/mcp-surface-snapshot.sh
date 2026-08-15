#!/usr/bin/env bash
# mcp-surface-snapshot.sh — derive the live MCP surface, then diff it against the catalog.
#
# Runs one stdio session against the server (initialize, notifications/initialized,
# tools/list, resources/list, prompts/list), prints the names and counts the server
# actually returned, and compares them to the `mcp` block in mcp/catalog.json.
#
# Usage (from the repo root):
#   skills/suede-mcp-qa/scripts/mcp-surface-snapshot.sh
#   skills/suede-mcp-qa/scripts/mcp-surface-snapshot.sh path/to/server.mjs path/to/catalog.json
#
# Read-only: it starts the server, reads it, and writes nothing. Exit 0 = live surface
# and catalog agree; exit 1 = they drift (the server is ground truth, the catalog is not).

set -uo pipefail

SERVER="${1:-mcp/suede-skills-mcp.mjs}"
CATALOG="${2:-mcp/catalog.json}"

[ -f "$SERVER" ] || { echo "FAIL: server not found at $SERVER"; exit 1; }

REQS=$(cat <<'EOF'
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"surface-snapshot","version":"1.0.0"}}}
{"jsonrpc":"2.0","method":"notifications/initialized"}
{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}
{"jsonrpc":"2.0","id":3,"method":"resources/list","params":{}}
{"jsonrpc":"2.0","id":4,"method":"prompts/list","params":{}}
EOF
)

OUT=$(printf '%s\n' "$REQS" | node "$SERVER" 2>/tmp/mcp-surface-stderr.$$)
ERR=$(cat /tmp/mcp-surface-stderr.$$ 2>/dev/null); rm -f /tmp/mcp-surface-stderr.$$

if [ -z "$OUT" ]; then
  echo "FAIL: server produced no stdout. stderr was:"; printf '%s\n' "$ERR"; exit 1
fi
[ -n "$ERR" ] && { echo "NOTE: server wrote to stderr (healthy stderr should be empty):"; printf '%s\n' "$ERR"; }

MCP_OUT="$OUT" CATALOG_PATH="$CATALOG" node <<'NODE'
const fs = require('fs');
const lines = (process.env.MCP_OUT || '').split('\n').filter(Boolean);
const byId = {};
for (const l of lines) { try { const m = JSON.parse(l); if (m.id != null) byId[m.id] = m; } catch { console.log('NOTE: non-JSON line on stdout:', l.slice(0, 120)); } }
const names = (id, key, field) => ((byId[id] || {}).result?.[key] || []).map(x => x[field]).sort();
const live = {
  tools: names(2, 'tools', 'name'),
  resources: names(3, 'resources', 'uri'),
  prompts: names(4, 'prompts', 'name'),
};
console.log('protocolVersion:', (byId[1] || {}).result?.protocolVersion ?? 'MISSING — initialize did not answer');
let drift = false;
let catalog = null;
try { catalog = JSON.parse(fs.readFileSync(process.env.CATALOG_PATH, 'utf8')).mcp || {}; }
catch (e) { console.log(`NOTE: could not read ${process.env.CATALOG_PATH} — live counts only (${e.message})`); }
for (const k of ['tools', 'resources', 'prompts']) {
  console.log(`\n${k}: ${live[k].length} live`);
  live[k].forEach(n => console.log(`  ${n}`));
  if (!catalog) continue;
  const declared = (catalog[k] || []).slice().sort();
  const missing = declared.filter(n => !live[k].includes(n));
  const extra = live[k].filter(n => !declared.includes(n));
  if (missing.length || extra.length) {
    drift = true;
    if (missing.length) console.log(`  DRIFT: in catalog, not served: ${missing.join(', ')}`);
    if (extra.length) console.log(`  DRIFT: served, not in catalog: ${extra.join(', ')}`);
  } else {
    console.log(`  catalog agrees (${declared.length})`);
  }
}
console.log(drift ? '\nRESULT: DRIFT — the server is ground truth; update mcp/catalog.json to match.'
                  : '\nRESULT: live surface and catalog agree.');
process.exit(drift ? 1 : 0);
NODE
