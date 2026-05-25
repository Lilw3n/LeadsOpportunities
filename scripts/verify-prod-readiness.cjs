#!/usr/bin/env node
/**
 * Verification configuration prod (local ou CI)
 * Usage: node scripts/verify-prod-readiness.cjs
 */
const required = [
  "DATABASE_URL",
  "JWT_SECRET",
  "RESEND_API_KEY",
  "LEAD_NOTIFICATION_EMAIL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
];

const recommended = [
  "GOOGLE_DRIVE_FOLDER_ID",
  "GOOGLE_SERVICE_ACCOUNT_JSON",
  "GOOGLE_DRIVE_ACCESS_TOKEN",
  "LEAD_WEBHOOK_URL",
  "WITHALLO_WEBHOOK_SECRET",
  "NEXT_PUBLIC_APP_URL",
];

var ok = true;
console.log("=== LeadsOpportunities — verification prod ===\n");

required.forEach(function (k) {
  var v = process.env[k];
  if (!v || String(v).length < 3) {
    console.log("[MANQUANT] " + k);
    ok = false;
  } else {
    console.log("[OK] " + k);
  }
});

console.log("\n--- Recommande ---");
recommended.forEach(function (k) {
  var v = process.env[k];
  console.log(v ? "[OK] " + k : "[OPTIONNEL] " + k);
});

if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.log("\n[WARN] JWT_SECRET devrait faire au moins 32 caracteres");
  ok = false;
}

console.log(ok ? "\nPret pour les tests manuels (checklist docs/PROD-CHECKLIST.md)" : "\nCompleter les variables avant prod.");
process.exit(ok ? 0 : 1);
