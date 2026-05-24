# Regles comptabilite pro — Leads Opportunities

Document de reference (validation expert-comptable requise).

## Categories `pro_expenses`

| category | Exemples |
|----------|----------|
| logiciel | Vercel, Resend, Stripe fees, Cursor, Make, HeyGen, WithAllo |
| ads | Google Ads, Meta Ads |
| leads_achat | Achat leads partenaires |
| deplacement | Essence, péages, train (justificatif Drive) |
| frais_maison | Quote-part bureau télétravail |
| salaire | Collaborateurs, futurs salaries |
| autre | Divers |

## Revenus `pro_revenue`

- Acomptes Stripe (`stripe_session_id`, `quote_id`)
- Commissions apporteurs (saisie manuelle)

## ROI marketing

Lier `utm_campaign` des leads convertis aux depenses `ads` du mois.

## Export

`GET /api/crm/pro-accounting?action=export&month=2026-05` (admin JWT) → CSV
