/**
 * Vérifie la configuration Stripe (variables d'environnement + API si clé présente).
 * Usage : npm run verify:stripe
 */
const { getStripeClient, getStripeSecretKey, getStripeWebhookSecret, getStripeAppUrl } = require("../api/_lib/stripe");

async function main() {
  const key = getStripeSecretKey();
  const webhook = getStripeWebhookSecret();
  const appUrl = getStripeAppUrl();

  console.log("=== Stripe — vérification ===\n");
  console.log("STRIPE_SECRET_KEY:", key ? (key.slice(0, 12) + "…") : "MANQUANT");
  console.log("STRIPE_WEBHOOK_SECRET:", webhook ? "présent" : "MANQUANT");
  console.log("APP_URL:", appUrl);
  console.log("Webhook URL:", appUrl + "/api/stripe/webhook");
  console.log("Checkout API:", appUrl + "/api/stripe/create-checkout-session");

  if (!key) {
    console.error("\n❌ Configurez STRIPE_SECRET_KEY sur Vercel (sk_test_ ou sk_live_).");
    process.exit(1);
  }

  const stripe = getStripeClient();
  if (!stripe) {
    console.error("\n❌ Client Stripe non initialisé.");
    process.exit(1);
  }

  try {
    const account = await stripe.accounts.retrieve();
    const mode = key.indexOf("sk_live_") === 0 ? "live" : "test";
    console.log("\n✅ Connexion Stripe OK");
    console.log("   Compte:", account.id);
    console.log("   Mode:", mode);
    console.log("   Paiements activés:", account.charges_enabled ? "oui" : "non");
    console.log("   Virements activés:", account.payouts_enabled ? "oui" : "non");
    if (!webhook) {
      console.warn("\n⚠️  STRIPE_WEBHOOK_SECRET manquant — ajoutez un endpoint webhook sur:");
      console.warn("   " + appUrl + "/api/stripe/webhook");
      console.warn("   Événement requis : checkout.session.completed");
    } else {
      console.log("\n✅ Webhook secret configuré");
    }
    process.exit(0);
  } catch (e) {
    console.error("\n❌ Erreur API Stripe:", e.message);
    process.exit(1);
  }
}

main();
