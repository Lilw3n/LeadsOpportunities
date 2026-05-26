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
  getStripeClient,
  toStripeAmount,
  fromStripeAmount,
};
