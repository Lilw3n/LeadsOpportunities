/**
 * POST /api/lead — Reception des demandes (devis, contact).
 * Optionnel: definir LEAD_WEBHOOK_URL (Zapier, Make, endpoint interne) pour relayer le JSON.
 */
module.exports = async (req, res) => {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const webhookUrl = process.env.LEAD_WEBHOOK_URL;

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Invalid JSON body" });
    }
  }
  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const safePayload = {
    source: body.source || "unknown",
    vertical: body.vertical || "",
    createdAt: new Date().toISOString(),
    ...body,
  };

  console.log("[lead]", JSON.stringify(safePayload).slice(0, 2000));

  if (webhookUrl) {
    try {
      const r = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(safePayload),
      });
      if (!r.ok) {
        console.warn("[lead] webhook status", r.status);
      }
    } catch (e) {
      console.error("[lead] webhook error", e);
      return res.status(502).json({ ok: false, error: "Webhook relay failed" });
    }
  }

  return res.status(200).json({ ok: true });
};
