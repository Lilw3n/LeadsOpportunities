# Make + Tiime + CRM — facturation électronique à 0 €

Stack **gratuit** pour Leads Opportunities (EI) :

| Couche | Outil | Coût | Rôle |
|---|---|---|---|
| PDP légale | **Tiime Free** | 0 € | Réception / émission conforme PA |
| Automation | **Make Free** | 0 € (1 000 ops/mois) | Pont CRM ↔ Drive / e-mail / (Tiime) |
| Commercial | **CRM LO + Stripe** | déjà là | Devis, acomptes, Factur-X brouillon |

> L’API Tiime / module Make « Tiime Apps » est réservée partenaires ou offre **Business** (essai possible).  
> Le parcours **0 € durable** = webhooks Make + saisie / dépôt dans Tiime Free.

## Variables Vercel

```bash
MAKE_EINVOICE_WEBHOOK_URL=https://hook.eu2.make.com/xxxxxxxx   # Custom webhook Make (sortie CRM → Make)
MAKE_EINVOICE_WEBHOOK_SECRET=une_chaine_longue_secrete         # Auth entrée Make → CRM
```

Optionnel (fallback) : `MAKE_WEBHOOK_URL` / `MAKE_WEBHOOK_SECRET`.

## Endpoints

| Sens | URL | Auth |
|---|---|---|
| CRM → Make | URL du Custom webhook Make | — |
| Make → CRM | `POST /api/webhooks/make-einvoice` | `Authorization: Bearer {SECRET}` |
| Test CRM | `POST /api/crm/e-invoicing` `{ "action": "test-make" }` | JWT admin |

## Scénario A — 100 % gratuit (recommandé)

### A1. CRM → Make → Drive + mail

1. Make : **Custom webhook** (copie l’URL → `MAKE_EINVOICE_WEBHOOK_URL`)
2. Filtre : `event` = `invoice_issued`
3. **Google Drive** : créer fichier `.xml` avec `data.xmlCii` (nom = `data.invoiceNumber`)
4. **Email** (Gmail gratuit) : sujet `Facture {{data.invoiceNumber}} à saisir dans Tiime`
5. Corps : montants, SIREN client, lien Drive, checklist Tiime Free

Événements poussés par le CRM :
- `invoice_issued` — Factur-X généré
- `invoice_received_registered` — facture fournisseur saisie
- `make_ping` — test bouton CRM

### A2. Make → CRM (retour Tiime / manuel)

1. Make : déclencheur manuel ou Watch Drive / form
2. Module **HTTP** → `POST https://www.leadsopportunities.fr/api/webhooks/make-einvoice`
3. Header : `Authorization: Bearer {MAKE_EINVOICE_WEBHOOK_SECRET}`
4. Body exemples :

```json
{
  "event": "tiime_account_ready",
  "tiimeAccountEmail": "toi@email.fr",
  "pdpStatus": "active"
}
```

```json
{
  "event": "tiime_supplier_invoice",
  "direction": "received",
  "supplierName": "Vercel",
  "invoiceNumber": "INV-99",
  "amountTtc": 20,
  "invoiceDate": "2026-08-26",
  "tiimeInvoiceId": "tii_xxx"
}
```

## Scénario B — essai Tiime Business (optionnel)

Si tu actives l’essai Business / module Tiime Apps sur Make :
1. Webhook CRM `invoice_issued`
2. Module **Tiime** : créer facture (mapper SIREN, HT, TVA, libellé)
3. Tiime PA transmet au circuit légal

Quand l’essai expire : revenir au scénario A (Drive + saisie Tiime Free).

## Checklist mise en service

1. Compte Tiime Free + désignation PDP (CRM → Mix intelligent)
2. Compte Make Free + scénario A1
3. Vars Vercel + Redeploy
4. CRM → **Tester webhook Make**
5. Générer une facture test → vérifier Drive / mail
6. POST test inbound → facture apparaît dans « Factures fournisseurs reçues »

## Fichiers code

- `api/_lib/make-einvoice.js`
- `api/_lib/routes/webhook-make-einvoice.js`
- `data/make-blueprints/einvoice-crm-to-make.json`
- UI : panneau « Intégration Tiime + Make » sur `/crm-e-invoicing.html`
