const Stripe = require("stripe");

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  return new Stripe(secretKey, {
    apiVersion: "2024-11-20.acacia",
  });
}

function toStripeAmount(eurAmount) {
  return Math.round(Number(eurAmount) * 100);
}

module.exports = {
  getStripeClient,
  toStripeAmount,
};
