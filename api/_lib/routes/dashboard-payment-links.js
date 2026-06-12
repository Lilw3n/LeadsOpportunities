const { applyApiGuards, parseJsonBody } = require("../security");
const { requireDashboardAdmin } = require("../dashboard-admin");
const { getStripeClient } = require("../stripe");
const {
  listPaymentLinks,
  updateDossierStatus,
  syncPendingSessions,
  recordPaymentActivity,
} = require("../stripe-payment-store");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  if (!(await requireDashboardAdmin(req, res))) return;

  if (req.method === "GET") {
    const url = new URL(req.url, "http://localhost");
    const dossierStatus = url.searchParams.get("dossierStatus");
    const paymentStatus = url.searchParams.get("paymentStatus");
    const since = url.searchParams.get("since");
    const limit = url.searchParams.get("limit");

    const data = await listPaymentLinks({
      dossierStatus: dossierStatus || null,
      paymentStatus: paymentStatus || null,
      since: since || null,
      limit: limit || 50,
    });

    if (!data.ok) return res.status(500).json(data);
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const stripe = getStripeClient();
    if (!stripe) {
      return res.status(500).json({ error: "Stripe non configure." });
    }
    const result = await syncPendingSessions(stripe);
    if (!result.ok) return res.status(500).json(result);

    for (const link of result.newlyPaid || []) {
      await recordPaymentActivity(link);
    }

    return res.status(200).json(result);
  }

  if (req.method === "PATCH") {
    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const body = parsed.body || {};
    const linkId = body.id || body.linkId;
    const dossierStatus = body.dossierStatus || body.dossier_status;
    if (!linkId || !dossierStatus) {
      return res.status(400).json({ error: "id et dossierStatus requis" });
    }

    const result = await updateDossierStatus(linkId, dossierStatus);
    if (!result.ok) return res.status(result.error === "Lien introuvable" ? 404 : 400).json(result);
    return res.status(200).json(result);
  }

  res.setHeader("Allow", "GET, POST, PATCH");
  return res.status(405).json({ error: "Method not allowed" });
};
