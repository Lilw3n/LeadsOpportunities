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
assert(Slack.getWebhookUrl().indexOf("https://") === 0, "webhook URL conservée");

process.env.SLACK_WEBHOOK_URL = "fc85fbf9b62af1997ca75d48395c0a8d";
delete process.env.SLACK_BOT_TOKEN;
assert(!Slack.getWebhookUrl(), "hash seul n'est pas une URL");
assert(Slack.webhookInvalid(), "webhook invalide détecté");
assert(!Slack.slackConfigured(), "hash seul ≠ configuré");

process.env.SLACK_BOT_TOKEN = "xoxb-test-token";
assert(Slack.slackConfigured(), "token OK malgré webhook invalide");
assert(Slack.slackStatus().token_ok, "statut token_ok");
assert(Slack.slackStatus().webhook_invalid, "statut webhook_invalid");
assert(Slack.defaultChannel() === "leads", "canal défaut leads");
process.env.SLACK_CHANNEL = "#alertes";
assert(Slack.defaultChannel() === "alertes", "SLACK_CHANNEL sans #");
delete process.env.SLACK_CHANNEL;
assert(Slack.channelHelpError("leads", "channel_not_found").indexOf("Canal Slack") >= 0, "aide canal");

assert(
  Slack.normalizeWebhookUrl("T00000000/B00000000/abcdef0123456789") ===
    "https://hooks.slack.com/services/T00000000/B00000000/abcdef0123456789",
  "chemin T/B/token → URL Slack"
);
assert(
  Slack.normalizeWebhookUrl("hooks.slack.com/services/T1/B2/x") ===
    "https://hooks.slack.com/services/T1/B2/x",
  "hooks.slack.com sans schéma"
);

delete process.env.SLACK_BOT_TOKEN;
Slack.sendSlackText("ping").then(function (res) {
  assert(!res.ok, "hash seul : envoi refusé");
  assert(String(res.error || "").indexOf("Failed to parse URL") < 0, "erreur sans Failed to parse URL");
  assert(String(res.error || "").indexOf("hooks.slack.com") >= 0, "message d'aide webhook");
  var pubs = require("fs").readFileSync(require("path").join(__dirname, "..", "crm-pubs.js"), "utf8");
  assert(pubs.indexOf("Le token bot suffit") >= 0, "hint webhook optionnel si token OK");
  assert(pubs.indexOf("pas le signing secret). Le test utilisera") < 0, "plus d'alerte rouge si token OK");

  if (failed) {
    console.log("\n" + failed + " échec(s)");
    process.exit(1);
  }
  console.log("\nContrôles Slack notify OK.");
});
