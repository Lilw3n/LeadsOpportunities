# Migrations Neon — ordre d execution

Executer chaque fichier SQL dans la console Neon (SQL Editor), dans cet ordre :

1. `users.sql`
2. `google-auth.sql`
3. `site_leads.sql`
4. `site_leads-acquisition.sql`
5. `site_leads-lead-mgmt.sql`
6. `tariff-funnel.sql`
7. `crm.sql`
8. `crm-modules.sql`
9. `crm-modules-v2.sql`
10. `crm-quotes.sql`
11. `integrations-calendar-drive-stripe.sql`
12. `lead-enrichment.sql`
13. `pro-accounting.sql`
14. `lead-private-workflow.sql`
15. `crm-products.sql`
16. `stripe-payment-links.sql` (suivi liens Stripe + notifications paiement)

Puis verifier avec `node scripts/verify-prod-readiness.cjs` (variables d env requises).
