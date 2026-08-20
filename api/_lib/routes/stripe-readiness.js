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
            { label: "Config Stripe CRM", href: base + "/crm-stripe.html" },
            { label: "Accueil", href: base + "/" },
          ],
        }
      );
    }
  }

  const user = await requireCrm(req, res);
  if (!user) return;

  const stripe = getStripeClient();
  const secretKey = getStripeSecretKey();
  const webhookSecret = getStripeWebhookSecret();
  const hasSecret = !!secretKey;
  const hasWebhookSecret = !!webhookSecret;
  const appUrl = base;

  if (!stripe) {
    var missing = {
      ok: false,
      fullyConfigured: false,
      hasSecret,
      hasWebhookSecret,
      appUrl,
      error: "STRIPE_SECRET_KEY manquant",
      expectedSecretPrefix: "sk_test_ ou sk_live_",
      webhookUrl: appUrl + "/api/stripe/webhook",
      requiredEvent: "checkout.session.completed",
      crmConfigUrl: appUrl + "/crm-stripe.html",
      checks: [
        {
          id: "secret",
          ok: false,
          label: "Clé secrète (STRIPE_SECRET_KEY)",
          detail: "Absente sur Vercel — aucun paiement possible",
        },
        {
          id: "webhook",
          ok: hasWebhookSecret,
          label: "Secret webhook (STRIPE_WEBHOOK_SECRET)",
          detail: hasWebhookSecret ? "Présent" : "Manquant",
        },
      ],
      nextSteps: [
        "Stripe Dashboard → Developers → API keys → copier Secret key (sk_live_ ou sk_test_)",
        "Vercel → Settings → Environment Variables → STRIPE_SECRET_KEY (Production)",
        "Ajouter STRIPE_WEBHOOK_SECRET (whsec_…) après création du webhook",
        "Redeploy le projet Production",
      ],
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
      fullyConfigured: !!(hasSecret && hasWebhookSecret && account.charges_enabled),
      hasSecret,
      hasWebhookSecret,
      appUrl,
      accountId: account.id,
      mode: secretKey.indexOf("sk_live_") === 0 ? "live" : "test",
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      webhookUrl: appUrl + "/api/stripe/webhook",
      requiredEvent: "checkout.session.completed",
      crmConfigUrl: appUrl + "/crm-stripe.html",
      paiementUrl: appUrl + "/paiement.html",
      stripeDashboardWebhooks: "https://dashboard.stripe.com/webhooks",
      checks: [
        {
          id: "secret",
          ok: true,
          label: "Clé secrète (STRIPE_SECRET_KEY)",
          detail: secretKey.indexOf("sk_live_") === 0 ? "Mode live — encaissements réels" : "Mode test — cartes de test uniquement",
        },
        {
          id: "webhook",
          ok: hasWebhookSecret,
          label: "Secret webhook (STRIPE_WEBHOOK_SECRET)",
          detail: hasWebhookSecret
            ? "Présent — les paiements peuvent mettre à jour les devis CRM"
            : "Manquant — Checkout marche mais le CRM ne verra pas les paiements",
        },
        {
          id: "charges",
          ok: !!account.charges_enabled,
          label: "Encaissements Stripe",
          detail: account.charges_enabled ? "Activés" : "Désactivés sur le compte Stripe",
        },
        {
          id: "payouts",
          ok: !!account.payouts_enabled,
          label: "Virements (payouts)",
          detail: account.payouts_enabled ? "Activés" : "À activer dans le Dashboard Stripe",
        },
      ],
      nextSteps: hasWebhookSecret
        ? []
        : [
            "Ouvrir Stripe Dashboard → Developers → Webhooks → Add endpoint",
            "URL : " + appUrl + "/api/stripe/webhook",
            "Événement : checkout.session.completed",
            "Copier le signing secret (whsec_…) dans Vercel → STRIPE_WEBHOOK_SECRET",
            "Redeploy Production",
          ],
    };
    return readinessPage(req, res, 200, ready, {
      title: ready.fullyConfigured ? "Stripe prêt" : "Stripe partiellement configuré",
      lead: ready.fullyConfigured
        ? "Compte joignable, webhook présent — vous pouvez encaisser et synchroniser les devis."
        : "La clé secrète répond, mais il manque encore une pièce (souvent le webhook).",
      tone: ready.fullyConfigured ? "ok" : "warn",
      links: [
        { label: "Configurer dans le CRM", href: appUrl + "/crm-stripe.html", primary: true },
        { label: "Page paiement", href: appUrl + "/paiement.html" },
        { label: "Dashboard Stripe", href: "https://dashboard.stripe.com/webhooks" },
      ],
    });
  } catch (e) {
    var failed = {
      ok: false,
      fullyConfigured: false,
      hasSecret,
      hasWebhookSecret,
      appUrl,
      error: e.message,
      webhookUrl: appUrl + "/api/stripe/webhook",
      crmConfigUrl: appUrl + "/crm-stripe.html",
      checks: [
        {
          id: "secret",
          ok: true,
          label: "Clé secrète",
          detail: "Présente mais l’API Stripe refuse la connexion",
        },
        {
          id: "api",
          ok: false,
          label: "Compte Stripe",
          detail: e.message,
        },
      ],
      nextSteps: [
        "Vérifier que STRIPE_SECRET_KEY n’a pas d’espaces / guillemets sur Vercel",
        "Utiliser la Secret key du bon mode (test vs live)",
        "Redeploy après correction",
      ],
    };
    return readinessPage(req, res, 200, failed, {
      title: "Stripe injoignable",
      lead: "La clé est présente mais l’API Stripe a renvoyé une erreur.",
      tone: "warn",
    });
  }
};
