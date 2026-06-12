const { applyApiGuards, parseJsonBody } = require("../security");
const { requireDashboardAdmin } = require("../dashboard-admin");
const { getMessageById, saveOutbound } = require("../mail-store");
const { sendViaResend } = require("../mail-send");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!(await requireDashboardAdmin(req, res))) return;

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};

  const to = String(body.to || "").trim();
  const subject = String(body.subject || "").trim();
  const text = String(body.body || body.text || "").trim();
  const replyToId = body.replyToId || body.replyTo || null;

  if (!to || to.indexOf("@") === -1) {
    return res.status(400).json({ error: "Destinataire invalide" });
  }
  if (!subject || !text) {
    return res.status(400).json({ error: "Objet et message requis" });
  }

  let inReplyTo = null;
  let threadKey = to.toLowerCase();
  if (replyToId) {
    const ref = await getMessageById(replyToId);
    if (ref && ref.message_id) inReplyTo = ref.message_id;
    if (ref && ref.thread_key) threadKey = ref.thread_key;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function linkifyHtml(text) {
    const parts = String(text || "").split(/(https?:\/\/[^\s<>"']+)/g);
    return parts
      .map((part) => {
        if (/^https?:\/\//.test(part)) {
          const safe = escapeHtml(part);
          return (
            '<a href="' +
            safe +
            '" style="color:#2563eb;font-weight:600" target="_blank" rel="noopener noreferrer">' +
            safe +
            "</a>"
          );
        }
        return escapeHtml(part).replace(/\n/g, "<br>");
      })
      .join("");
  }

  const html =
    "<div style=\"font-family:Inter,Arial,sans-serif;font-size:15px;line-height:1.5;color:#0f172a\">" +
    linkifyHtml(text) +
    "</div>";

  const headers = {};
  if (inReplyTo) headers["In-Reply-To"] = inReplyTo;

  const sent = await sendViaResend({
    to,
    subject,
    html,
    text,
    headers: Object.keys(headers).length ? headers : undefined,
  });

  if (!sent.ok) {
    return res.status(502).json({ ok: false, error: sent.error });
  }

  const saved = await saveOutbound({
    to,
    subject,
    bodyText: text,
    inReplyTo,
    threadKey,
  });

  return res.status(200).json({
    ok: true,
    messageId: saved.id,
    resendId: sent.resendId,
  });
};
