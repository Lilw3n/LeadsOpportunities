/**
 * Envoi générique Slack Incoming Webhook.
 */
async function sendSlackText(text) {
  var url = (process.env.SLACK_WEBHOOK_URL || "").trim();
  if (!url) {
    return { ok: false, error: "SLACK_WEBHOOK_URL non défini" };
  }
  try {
    var r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: String(text || "") }),
    });
    if (!r.ok) {
      var body = await r.text().catch(function () { return ""; });
      return { ok: false, error: "Slack HTTP " + r.status + (body ? ": " + body.slice(0, 120) : "") };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

module.exports = { sendSlackText };
