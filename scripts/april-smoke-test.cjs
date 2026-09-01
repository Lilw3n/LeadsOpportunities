#!/usr/bin/env node
/**
 * Smoke-test APRIL avec l’application Test du tutoriel API Store.
 * N’utilise pas les secrets Vercel prod — creds publics doc ou env dédiées.
 *
 * Usage:
 *   npm run april:smoke-test
 *   PARTNER_APRIL_TEST_CLIENT_ID=… PARTNER_APRIL_TEST_CLIENT_SECRET=… npm run april:smoke-test
 */
var April = require("../api/_lib/april-client");

var TEST_CLIENT_ID =
  process.env.PARTNER_APRIL_TEST_CLIENT_ID || "00134-25346";
var TEST_CLIENT_SECRET =
  process.env.PARTNER_APRIL_TEST_CLIENT_SECRET ||
  "D9mwvETbCu6moRI6NddeyWwmlmgPe8WKY7sln1vE2BQ";

process.env.PARTNER_APRIL_CLIENT_ID = TEST_CLIENT_ID;
process.env.PARTNER_APRIL_CLIENT_SECRET = TEST_CLIENT_SECRET;
process.env.PARTNER_APRIL_GATEWAY =
  process.env.PARTNER_APRIL_GATEWAY || "https://ppr-am-gateway.april.fr";
process.env.PARTNER_APRIL_API_GATEWAY =
  process.env.PARTNER_APRIL_API_GATEWAY || "https://ppr-api-gateway.april.fr";

April.clearTokenCache();

April.testConnection()
  .then(function (result) {
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) {
      console.error("\nÉchec smoke-test API Test APRIL.");
      process.exit(1);
    }
    console.log("\nOK — jeton OAuth + firstCall {\"status\":\"success\"} (application Test doc API Store).");
    process.exit(0);
  })
  .catch(function (err) {
    console.error(err.message || err);
    process.exit(1);
  });
