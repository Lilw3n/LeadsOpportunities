# Buchet Immobilier — blog CRM / stats (même ligne que LO)

`www.buchetimmobilier.com` et `www.leadsopportunities.fr` partagent le **même dépôt** (`Lilw3n/LeadsOpportunities`) mais peuvent être deux projets Vercel.

## Fonctionnalités alignées

| Page | Rôle |
|------|------|
| `/crm-blog-stats.html` | Stats blog : dates, titres cliquables, clics CTA, **article source des leads**, questionnaires |
| `/blog-questionnaires.html` | Mapping article → devis / questionnaire (`?q=slug`) |
| `/blog/` | Articles (filtre immo auto sur host Buchet) |
| `js/site-host-brand.js` | Détection host Buchet vs LO (URLs publiques, libellés) |

Attribution lead → article :
1. `utm_content` / `blog_article` (bridge questionnaire + visite article)
2. landing / referrer `/blog/…`
3. dernier `journey_events` du `visitor_id` avant le lead

## Déployer Buchet

Si `/crm-blog-stats.html` ou `/blog/` renvoient **404** sur Buchet alors que LO est OK : le projet Vercel Buchet n’est pas à jour.

1. Vercel → projet lié à `buchetimmobilier.com`
2. Git : même repo `Lilw3n/LeadsOpportunities`, branche `main`
3. **Redeploy** (Production) sur le dernier commit `main`
4. Vérif : `PROD_ORIGIN=https://www.buchetimmobilier.com npm run verify:buchet-blog-crm`

Option Deploy Hook :
```bash
VERCEL_DEPLOY_HOOK=<hook-buchet> npm run deploy:trigger
```

## Vérifs

```bash
npm run verify:blog-stats-crm
PROD_ORIGIN=https://www.leadsopportunities.fr npm run verify:buchet-blog-crm
PROD_ORIGIN=https://www.buchetimmobilier.com npm run verify:buchet-blog-crm
```
