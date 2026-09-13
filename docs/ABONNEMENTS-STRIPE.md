# Abonnements Stripe adaptables

Grille de formules type Lybox (`/app/user/plan`), éditable depuis le CRM, branchée sur Stripe Checkout `mode=subscription`.

## Liens (prod)

| Rôle | URL |
|------|-----|
| Page publique (choix de formule) | https://www.leadsopportunities.fr/abonnements/ |
| Confirmation après paiement | https://www.leadsopportunities.fr/paiement-success.html |
| Hub paiements | https://www.leadsopportunities.fr/paiements/ |
| CRM — éditer les formules | https://www.leadsopportunities.fr/crm-subscription-plans.html |
| CRM — hub Stripe (liens ponctuels) | https://www.leadsopportunities.fr/crm-stripe.html |

## APIs

| Méthode | Endpoint | Auth | Rôle |
|---------|----------|------|------|
| `GET` | `/api/subscription-plans` | public | Liste des formules **actives** (sanitisée) |
| `GET` | `/api/crm/subscription-plans` | CRM | Config complète + `canEdit` |
| `PUT` / `POST` | `/api/crm/subscription-plans` | CRM admin | Enregistrer la grille (JSON) |
| `POST` | `/api/stripe/create-subscription-checkout` | public (rate-limit) | Body `{ planId, interval, customerEmail? }` → URL Checkout |
| `GET` | `/api/stripe/session-status?session_id=` | public | Statut session (`mode`, `paid`, `planId`) |
| `POST` | `/api/stripe/webhook` | Stripe signature | Marque l’abonnement / lien paiement comme payé |

## Adapter les offres

1. Ouvrir **CRM → Formules d’abonnement**
2. Modifier titre, prix mensuel/annuel, features, CTA (`checkout` / `link` / `contact` / `disabled`), essai, Price ID Stripe optionnels
3. **Enregistrer** → visible tout de suite sur `/abonnements/`

Seed fichier : `config/subscription-plans.json` (fallback si la base n’a pas encore de payload).

Sans `stripePriceIdMonthly` / `Yearly`, Stripe reçoit un `price_data` récurrent généré à la volée (pratique tant que le volume d’utilisateurs est faible).

## Variables d’environnement

Déjà utilisées par le hub Stripe :

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL` ou `APP_URL` = `https://www.leadsopportunities.fr`

Webhook à garder sur `checkout.session.completed` (déjà en place).

## Vérif

```bash
npm run verify:subscription-plans
```
