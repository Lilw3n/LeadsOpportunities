## Stripe setup (Leads Opportunities)

Cette implementation est inspiree de:
- `F:\Cursor Sites\Location véhicules`
- `F:\Cursor Sites\Star Stable Online`

avec une separation explicite pour ne pas confondre les paiements.

## 1) Fichiers ajoutes
- `api/_lib/stripe.js`
- `api/stripe/create-checkout-session.js`
- `api/stripe/webhook.js`
- `paiement.html`
- `paiement.js`
- `paiement-success.html`
- `.env.example`

## 2) Variables d'environnement (Vercel)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL=https://leads-opportunities.vercel.app`
- `COMPANY_CODE=LEADSOPP`

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

## 6) Evolution recommandee
- brancher webhook -> CRM / base client
- ajouter mapping paiement -> dossier devis
- ajouter remboursement/annulation si besoin
