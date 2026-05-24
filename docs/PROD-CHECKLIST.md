# Checklist production — LeadsOpportunities

## Neon (SQL)

Executer dans l'ordre :

1. `database/users.sql`
2. `database/google-auth.sql`
3. `database/site_leads.sql` (+ acquisition, lead-mgmt si fichiers separes)
4. `database/crm.sql`
5. `database/crm-modules.sql`
6. `database/crm-quotes.sql`
7. `database/integrations-calendar-drive-stripe.sql`
8. `database/lead-enrichment.sql`
9. `database/pro-accounting.sql`

Voir aussi `database/README-MIGRATIONS.md`.

## Verification locale

```bash
npm run verify:prod
npm run blog:feed
```

## Vercel — variables obligatoires

- `DATABASE_URL`
- `JWT_SECRET` (min 32 caracteres)
- `RESEND_API_KEY` + `LEAD_NOTIFICATION_EMAIL=courtier972@gmail.com`
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
- `ADMIN_EMAILS=courtier972@gmail.com`
- `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL=https://leads-opportunities.vercel.app`

## Google Cloud

1. Activer **Google Calendar API** et **Google Drive API**
2. OAuth : redirect `https://leads-opportunities.vercel.app/api/auth/google-callback`
3. Scopes consentement : `calendar.events` pour l'agenda

## Agenda Google (courtier972@gmail.com)

1. Se connecter au CRM
2. Aller sur `/crm-calendar.html`
3. Cliquer **Connecter agenda Google** (compte courtier972@gmail.com)
4. Creer un evenement test → verifier dans Google Agenda

## Stripe

1. Webhook : `https://leads-opportunities.vercel.app/api/stripe/webhook`
2. Evenement : `checkout.session.completed`
3. Paiement devis : CRM connecte → `/crm-quote-payment.html?quoteId=qte_...`

## Google Drive

1. Creer dossier racine `Clients_LeadsOpportunities` sur le Drive du courtier
2. Partager au compte technique ou generer token OAuth Drive
3. Renseigner `GOOGLE_DRIVE_ACCESS_TOKEN` + `GOOGLE_DRIVE_FOLDER_ID`
4. Creer un contact CRM → sous-dossier `{annee}/{contact_id}/` auto

## Tests rapides

- [ ] Lead formulaire → email courtier972
- [ ] Dashboard stats/leads sans erreur
- [ ] Evenement CRM → Google Calendar
- [ ] Sync pull agenda (`crm-calendar.html` → Synchroniser depuis Google)
- [ ] Acompte devis Stripe (mode test puis live)
- [ ] Upload document → dossier client Drive
- [ ] Touchpoint page (`/api/lead-touchpoint` via attribution.js)
- [ ] Dedup lead (meme email 2x)
- [ ] Compta `/crm-pro-accounting.html`
- [ ] Make/n8n : `docs/automation-make-n8n.md`
