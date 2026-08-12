# Plateforme multi-marques (interne)

> Vision SaaS / revente : voir [`docs/SAAS-REVENTE.md`](./docs/SAAS-REVENTE.md)  
> (Phase 1 = white-label 1 cabinet / 1 déploiement · Phase 2 = multi-tenant).

Ce depot est la marque **Leads Opportunities**. Pour dupliquer le modele sur un autre site sans melanger les paiements ou les metadonnees Stripe :

- Copier le projet et adapter `COMPANY_CODE`, les titres SEO, `google-config.js` et les URLs canoniques.
- Utiliser un projet Vercel et des variables d'environnement **distincts** pour Stripe (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`).
- Optionnel : definir `LEAD_WEBHOOK_URL` par marque pour router les demandes vers un outil CRM ou un sheet dedie.

Les demandes front passent par `POST /api/lead` et sont journalisees cote serveur ; le relais webhook est facultatif.
