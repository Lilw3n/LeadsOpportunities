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
- Checkout API: `/api/stripe/create-checkout-session`
- Webhook API: `/api/stripe/webhook`

Evenement minimum a ecouter:
- `checkout.session.completed`

## 5) Test local
1. Lancer le site
2. Aller sur `/paiement.html`
3. Remplir formulaire et payer en mode test Stripe
4. Verifier redirection vers `/paiement-success.html`

## 6) Evolution recommandee
- brancher webhook -> CRM / base client
- ajouter mapping paiement -> dossier devis
- ajouter remboursement/annulation si besoin
