const Stripe = require("stripe");

function cleanStripeSecret(value) {
  return String(value || "")
    .trim()
    .replace(/^['"]+|['"]+$/g, "");
}

function getStripeSecretKey() {
  return cleanStripeSecret(process.env.STRIPE_SECRET_KEY);
}

function getStripeWebhookSecret() {
  return cleanStripeSecret(process.env.STRIPE_WEBHOOK_SECRET);
}

function getStripeAppUrl() {
  const raw = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://www.leadsopportunities.fr";
  let appUrl = cleanStripeSecret(raw)
    .replace(/[\r\n\t]/g, "")
    .replace(/\/$/, "");

  if (appUrl && appUrl.indexOf("http://") !== 0 && appUrl.indexOf("https://") !== 0) {
    appUrl = "https://" + appUrl;
  }

  try {
    const parsed = new URL(appUrl);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.origin;
    }
  } catch {
    // Fall through to the production URL when an env var was pasted incorrectly.
  }

  return "https://www.leadsopportunities.fr";
}

function getStripeClient() {
  const secretKey = getStripeSecretKey();
  if (!secretKey) return null;
  return new Stripe(secretKey, {
    apiVersion: "2024-11-20.acacia",
  });
}

function toStripeAmount(eurAmount) {
  const amount = Number(eurAmount);
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100);
}

function fromStripeAmount(amountCents) {
  return Number(amountCents || 0) / 100;
}

module.exports = {
  cleanStripeSecret,
  getStripeSecretKey,
  getStripeWebhookSecret,
  getStripeAppUrl,
  getStripeClient,
  toStripeAmount,
  fromStripeAmount,
};
