# Automatisation Make / n8n — 3 scenarios

Configurer `LEAD_WEBHOOK_URL` sur Vercel vers votre scenario Make ou n8n.

## Scenario 1 — Lead chaud (score >= 70)

**Declencheur** : Webhook POST JSON depuis `/api/lead`

**Filtre** : `leadScore >= 70`

**Actions** :

1. Email Resend ou Gmail → `courtier972@gmail.com` (sujet urgent)
2. Creer evenement Google Calendar via CRM (ou appeler `/api/crm/events` avec JWT service)
3. Optionnel : SMS Slack « Rappeler sous 2 h »

**Payload utile** : `leadId`, `email`, `phone`, `vertical`, `seo_city`, `crossSell.opportunities`

## Scenario 2 — Lead non traite J+1

**Declencheur** : Cron quotidien 9h

**Action Make** : HTTP GET `https://www.leadsopportunities.fr/api/dashboard/leads?status=new&olderThan=24h` (avec token admin)

**Actions** :

1. Email relance interne liste des leads
2. Webhook vers CRM pour `next_followup_at`

## Scenario 3 — Acompte Stripe paye

**Declencheur** : Webhook Stripe parallele OU ecouter payload enrichi si vous dupliquez depuis `checkout.session.completed`

**Actions** :

1. Email client « pieces a fournir » (modele Resend)
2. Appel interne pour `ensureClientDriveFolders(contactId)` (future route)
3. Tache CRM « Collecte pieces » J+1

## WithAllo

URL : `POST https://www.leadsopportunities.fr/api/webhooks/withallo`  
Header : `Authorization: Bearer {WITHALLO_WEBHOOK_SECRET}`

Leads WithAllo passent par la meme deduplication email/telephone que le site.

## Scenario 4 — Facturation électronique Tiime (0 €)

Voir **`docs/MAKE-TIIME-EINVOICE.md`**.

- Sortie CRM : `MAKE_EINVOICE_WEBHOOK_URL` (events `invoice_issued`, `invoice_received_registered`)
- Entrée Make : `POST /api/webhooks/make-einvoice` + `MAKE_EINVOICE_WEBHOOK_SECRET`
- PDP : Tiime Free (pas d’API partenaire requise pour le parcours Drive/mail)
