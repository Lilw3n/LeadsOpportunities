/**
 * GET /api/stripe/readiness — verifie la configuration Stripe cote CRM.
 */
const { getAuthUser } = require("../auth");
const { getStripeAppUrl, getStripeClient, getStripeSecretKey, getStripeWebhookSecret } = require("../stripe");
const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const { wantsHtml, sendApiResult } = require("../api-browser-page");

function appBase() {
  try {
    return (getStripeAppUrl() || "https://www.leadsopportunities.fr").replace(/\/$/, "");
  } catch (e) {
    return "https://www.leadsopportunities.fr";
  }
}

function readinessPage(req, res, status, payload, extras) {
  extras = extras || {};
  var base = appBase();
  var ok = !!(payload && payload.ok);
  var rows = (extras.rows || []).slice();
  if (payload) {
    if (payload.mode) rows.push({ label: "Mode", value: String(payload.mode) });
    if (payload.accountId) rows.push({ label: "Compte", value: String(payload.accountId) });
    if (payload.hasSecret != null) {
      rows.push({ label: "STRIPE_SECRET_KEY", value: payload.hasSecret ? "Présente" : "Manquante" });
    }
    if (payload.hasWebhookSecret != null) {
      rows.push({
        label: "STRIPE_WEBHOOK_SECRET",
        value: payload.hasWebhookSecret ? "Présent" : "Manquant",
      });
    }
    if (payload.webhookUrl) rows.push({ label: "URL webhook", value: String(payload.webhookUrl) });
    if (payload.chargesEnabled != null) {
      rows.push({ label: "Encaissements", value: payload.chargesEnabled ? "Activés" : "Désactivés" });
    }
    if (payload.payoutsEnabled != null) {
      rows.push({ label: "Payouts", value: payload.payoutsEnabled ? "Activés" : "Désactivés" });
    }
    if (payload.error) rows.push({ label: "Détail", value: String(payload.error) });
  }
  return sendApiResult(req, res, {
    status: status,
    tone: extras.tone || (status >= 400 ? "error" : ok ? "ok" : "warn"),
    title: extras.title || (ok ? "Stripe prêt" : "Contrôle Stripe"),
    lead:
      extras.lead ||
      (ok
        ? "La clé secrète répond et le compte Stripe est joignable."
        : "Vérification de la configuration paiements (réservée aux admins CRM)."),
    rows: rows,
    links: extras.links || [
      { label: "Ouvrir le CRM", href: base + "/crm.html", primary: true },
      { label: "Connexion", href: base + "/auth.html" },
      { label: "Page paiement", href: base + "/paiement.html" },
    ],
    hint: extras.hint,
    json: payload,
  });
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  var base = appBase();

  if (req.method !== "GET") {
    return sendApiResult(req, res, {
      status: 405,
      allow: "GET",
      tone: "warn",
      title: "Contrôle Stripe",
      lead: "Cet endpoint n’accepte que les requêtes GET authentifiées (admin CRM).",
      links: [
        { label: "Connexion CRM", href: base + "/auth.html", primary: true },
        { label: "Accueil", href: base + "/" },
      ],
      json: { error: "Method not allowed" },
    });
  }

  if (wantsHtml(req)) {
    var decoded = await getAuthUser(req);
    if (!decoded) {
      return readinessPage(
        req,
        res,
        401,
        { ok: false, error: "Non authentifie", appUrl: base },
        {
          title: "Connexion requise",
          lead:
            "Le contrôle Stripe est réservé aux administrateurs connectés au CRM. Connectez-vous, puis rouvrez cette page.",
          tone: "error",
          hint: "Ouvrez d’abord la page de connexion, puis revenez sur /api/stripe/readiness.",
          links: [
            { label: "Se connecter", href: base + "/auth.html", primary: true },
            { label: "Dashboard", href: base + "/dashboard.html" },
            { label: "Accueil", href: base + "/" },
          ],
        }
      );
    }
  }

  const user = await requireCrm(req, res);
  if (!user) return;

  if (user.role !== "admin" && user.crmRole !== "admin") {
    return readinessPage(
      req,
      res,
      403,
      { ok: false, error: "Admin requis", appUrl: base },
      {
        title: "Accès admin requis",
        lead: "Seul un administrateur CRM peut consulter l’état de configuration Stripe.",
        tone: "error",
      }
    );
  }

  const stripe = getStripeClient();
  const secretKey = getStripeSecretKey();
  const webhookSecret = getStripeWebhookSecret();
  const hasSecret = !!secretKey;
  const hasWebhookSecret = !!webhookSecret;
  const appUrl = base;

  if (!stripe) {
    var missing = {
      ok: false,
      hasSecret,
      hasWebhookSecret,
      appUrl,
      error: "STRIPE_SECRET_KEY manquant",
      expectedSecretPrefix: "sk_test_ ou sk_live_",
    };
    return readinessPage(req, res, 200, missing, {
      title: "Stripe non configuré",
      lead: "Ajoutez STRIPE_SECRET_KEY sur Vercel, puis redeployez.",
      tone: "warn",
    });
  }

  try {
    const account = await stripe.accounts.retrieve();
    var ready = {
      ok: true,
      hasSecret,
      hasWebhookSecret,
      appUrl,
      accountId: account.id,
      mode: secretKey.indexOf("sk_live_") === 0 ? "live" : "test",
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      webhookUrl: appUrl + "/api/stripe/webhook",
      requiredEvent: "checkout.session.completed",
    };
    return readinessPage(req, res, 200, ready, {
      title: "Stripe prêt",
      lead: "Compte joignable — vérifiez aussi le webhook checkout.session.completed.",
      tone: "ok",
      links: [
        { label: "Ouvrir le CRM", href: appUrl + "/crm.html", primary: true },
        { label: "Webhook (info)", href: appUrl + "/api/stripe/webhook" },
        { label: "Paiement", href: appUrl + "/paiement.html" },
      ],
    });
  } catch (e) {
    var failed = {
      ok: false,
      hasSecret,
      hasWebhookSecret,
      appUrl,
      error: e.message,
    };
    return readinessPage(req, res, 200, failed, {
      title: "Stripe injoignable",
      lead: "La clé est présente mais l’API Stripe a renvoyé une erreur.",
      tone: "warn",
    });
  }
};
