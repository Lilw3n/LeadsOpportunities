#!/usr/bin/env node
/** Config MCP Allo pour les appels — exemple + gitignore, sans secret. */
var fs = require("fs");
var path = require("path");
var root = path.join(__dirname, "..");
var failed = 0;
function ok(c, m) {
  if (!c) {
    failed++;
    console.log("FAIL", m);
  } else console.log("OK  ", m);
}
function read(r) {
  return fs.readFileSync(path.join(root, r), "utf8");
}

var ex = read(".cursor/mcp.json.example");
ok(ex.indexOf("https://mcp.withallo.com/mcp") >= 0, "URL MCP Allo");
ok(ex.indexOf("YOUR_ALLO_API_KEY") >= 0, "placeholder clé (pas de secret)");
ok(!/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(ex), "exemple sans UUID secret");

var gi = read(".gitignore");
ok(gi.indexOf(".cursor/mcp.json") >= 0, ".cursor/mcp.json gitignoré");

var doc = read("docs/ALLO-MCP-APPELS.md");
ok(doc.indexOf("mcp.withallo.com/mcp") >= 0, "doc MCP appels");
ok(doc.indexOf("Bearer") >= 0 && doc.indexOf("pas de préfixe") >= 0, "doc auth clé brute");
ok(doc.indexOf("/api/webhooks/withallo") >= 0, "doc lien webhook CRM");

var slack = read("docs/SLACK-WITHALLO-NOTIFS.md");
ok(slack.indexOf("ALLO-MCP-APPELS.md") >= 0, "lien depuis Slack/WithAllo");

if (fs.existsSync(path.join(root, ".cursor/mcp.json"))) {
  var local = read(".cursor/mcp.json");
  ok(local.indexOf("YOUR_ALLO_API_KEY") === -1, "mcp.json local présent (clé réelle hors git)");
}

if (failed) {
  console.log(failed + " échec(s)");
  process.exit(1);
}
console.log("\nOK verify-allo-mcp-appels");
