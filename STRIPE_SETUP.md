## Stripe setup (Leads Opportunities)

Cette implementation est inspiree de:
- `F:\Cursor Sites\Location véhicules`
- `F:\Cursor Sites\Star Stable Online`

avec une separation explicite pour ne pas confondre les paiements.

## 1) Fichiers principaux
- `api/_lib/stripe.js`
- `api/stripe/[action].js`
- `api/_lib/routes/stripe-create-checkout-session.js`
- `api/_lib/routes/stripe-create-checkout-for-quote.js`
- `api/_lib/routes/stripe-session-status.js`
- `api/_lib/routes/stripe-readiness.js`
- `api/stripe/webhook.js`
- `paiement.html`
- `paiement.js`
- `paiement-success.html`
- `.env.example`

## 2) Variables d'environnement (Vercel)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL=https://leads-opportunities.vercel.app`
- ou `APP_URL=https://leads-opportunities.vercel.app`
- `COMPANY_CODE=LEADSOPP`

Le projet peut utiliser le meme compte Stripe que `location-vehicules-reunion`, mais il faut creer un webhook dedie a ce domaine car le `STRIPE_WEBHOOK_SECRET` est propre a chaque endpoint.

## 3) Separation des flux (important)
Dans Stripe, utilise:
- un prefix metadata `companyCode=LEADSOPP`
- des produits Stripe dedies a ce site
- un statement descriptor dedie (si dispo)

Ainsi, tes paiements restent distincts des autres apps de la meme entreprise.

## 4) Endpoint Stripe a configurer
- Checkout public (montant verifie si devis): `/api/stripe/create-checkout-session`
- Checkout CRM (devis uniquement, JWT): `/api/stripe/create-checkout-for-quote`
- Statut session: `/api/stripe/session-status?session_id=...`
- Readiness admin: `/api/stripe/readiness`
- Webhook API: `/api/stripe/webhook`

Evenement minimum a ecouter:
- `checkout.session.completed`

Evenements optionnels comme dans le projet location:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

## 5) Test local
1. Lancer le site
2. Aller sur `/paiement.html`
3. Remplir formulaire et payer en mode test Stripe
4. Verifier redirection vers `/paiement-success.html`

## 5 bis) Test production CRM
1. Connectez-vous au CRM en admin.
2. Ouvrez `/api/stripe/readiness` avec le header `Authorization: Bearer {lo_token}`.
3. Verifiez `ok: true`, `hasWebhookSecret: true`, et `requiredEvent=checkout.session.completed`.
4. Creez un devis CRM, puis ouvrez `/crm-quote-payment.html?quoteId=qte_...`.
5. Payez en mode test Stripe et verifiez : devis `acompte_paye`, activite CRM, ligne `pro_revenue`.

## 5 ter) Etat Vercel actuel a verifier
Dans Vercel > Settings > Environment Variables, ajouter en Production:
- `STRIPE_SECRET_KEY` : cle secrete du compte Stripe (`sk_test_...` pour test, `sk_live_...` pour prod).
- `STRIPE_WEBHOOK_SECRET` : secret du webhook cree pour `https://leads-opportunities.vercel.app/api/stripe/webhook`.
- `NEXT_PUBLIC_APP_URL` ou `APP_URL` : `https://leads-opportunities.vercel.app`.

## 6) Evolution recommandee
- brancher webhook -> CRM / base client
- ajouter mapping paiement -> dossier devis
- ajouter remboursement/annulation si besoin
