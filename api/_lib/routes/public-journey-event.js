const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { addJourneyEvent } = require("../journey-store");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = getClientIp(req);
  const rl = rateLimit("journey-event:" + ip, 120, 60 * 1000);
  if (!rl.allowed) return res.status(429).json({ ok: false, error: "Trop de requetes" });

  const parsed = parseJsonBody(req, 32768);
  if (parsed.error) return res.status(400).json({ ok: false, error: parsed.error });
  const body = parsed.body || {};
  if (!body.event_type) {
    return res.status(400).json({ ok: false, error: "event_type requis" });
  }

  try {
    const out = await addJourneyEvent(body);
    return res.status(200).json({ ok: true, stored: out.ok !== false });
  } catch (e) {
    console.error("[journey-event]", e);
    return res.status(200).json({ ok: true, stored: false });
  }
};
