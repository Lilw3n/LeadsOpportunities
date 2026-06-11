#!/usr/bin/env node
/**
 * Test connexion Google Drive (memes variables que Vercel).
 * Usage: node scripts/verify-drive.cjs
 * (charger .env local ou: vercel env pull && source .env)
 */
const { isDriveConfigured, getRootFolderId, testDriveConnection } = require("../api/_lib/google-drive-auth");

async function main() {
  console.log("=== Verification Google Drive ===\n");

  var hasSa = !!(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "").trim();
  var hasToken = !!(process.env.GOOGLE_DRIVE_ACCESS_TOKEN || "").trim();
  var folderId = getRootFolderId();

  console.log("GOOGLE_SERVICE_ACCOUNT_JSON : " + (hasSa ? "[OK]" : "[MANQUANT]"));
  console.log("GOOGLE_DRIVE_ACCESS_TOKEN    : " + (hasToken ? "[OK]" : "[optionnel]"));
  console.log("GOOGLE_DRIVE_FOLDER_ID       : " + (folderId ? "[OK] " + folderId.slice(0, 12) + "…" : "[MANQUANT]"));

  if (!isDriveConfigured() || !folderId) {
    console.log("\nDrive non pret — voir docs/DRIVE-SETUP.md");
    process.exit(1);
  }

  console.log("\nTest API Drive en cours…");
  var test = await testDriveConnection();
  if (!test.ok) {
    console.log("\n[ECHEC] " + (test.error || "inconnu"));
    if (test.hint) console.log("Astuce: " + test.hint);
    process.exit(1);
  }

  console.log("\n[OK] Connexion Drive reussie");
  console.log("Auth          : " + test.authSource);
  if (test.serviceAccountEmail) console.log("Compte service: " + test.serviceAccountEmail);
  console.log("Dossier racine: " + test.rootFolder.name + " (" + test.rootFolder.id + ")");
  if (test.sampleChildren && test.sampleChildren.length) {
    console.log("Exemples enfants:");
    test.sampleChildren.forEach(function (f) {
      console.log("  - " + f.name);
    });
  }
  console.log("\nLes uploads landing (VTC/sante/credit) creeront:");
  console.log("  {racine}/{annee}/leads/{leadId_email}/ + sous-dossiers 01_…05_");
  process.exit(0);
}

main().catch(function (e) {
  console.error(e);
  process.exit(1);
});
