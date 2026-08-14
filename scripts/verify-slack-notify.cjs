#!/usr/bin/env node
var Slack = require("../api/_lib/slack-notify");
var failed = 0;
function assert(cond, msg) {
  if (!cond) {
    failed++;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}
process.env.SLACK_BOT_TOKEN = "xoxe.xoxp-1-" + Buffer.from("2-2-111111-222222-abcdef").toString("base64");
delete process.env.SLACK_WEBHOOK_URL;
assert(Slack.slackConfigured(), "token détecté");
assert(Slack.getToken().indexOf("xoxe.") === 0, "xoxe conservé pour l’API");
delete process.env.SLACK_BOT_TOKEN;
process.env.SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/T/B/x";
assert(Slack.slackConfigured(), "webhook détecté");
if (failed) process.exit(1);
console.log("\nContrôles Slack notify OK.");
