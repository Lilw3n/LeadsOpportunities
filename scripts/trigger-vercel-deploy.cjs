#!/usr/bin/env node
/**
 * Déclenche un redeploy Vercel via Deploy Hook (Settings → Git → Deploy Hooks).
 * Usage: VERCEL_DEPLOY_HOOK=https://api.vercel.com/v1/integrations/deploy/... npm run deploy:trigger
 */
const hook = process.env.VERCEL_DEPLOY_HOOK || process.env.VERCEL_DEPLOY_HOOK_URL;

if (!hook) {
  console.error("Variable VERCEL_DEPLOY_HOOK manquante.");
  console.error("Vercel → projet → Settings → Git → Deploy Hooks → Create Hook (branch: main)");
  console.error("Puis: VERCEL_DEPLOY_HOOK=<url> npm run deploy:trigger");
  process.exit(1);
}

fetch(hook, { method: "POST" })
  .then(function (res) {
    return res.text().then(function (body) {
      console.log("HTTP", res.status, body.slice(0, 200));
      if (!res.ok) process.exit(1);
      console.log("Redeploy Vercel déclenché. Attendre 1–3 min puis vérifier methode.html.");
    });
  })
  .catch(function (err) {
    console.error(err.message);
    process.exit(1);
  });
