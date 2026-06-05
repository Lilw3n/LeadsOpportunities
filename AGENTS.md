# AGENTS.md

## Cursor Cloud specific instructions

### Vue d'ensemble

Monorepo **Leads Opportunities** : site marketing + landings + CRM + API serverless Vercel. Pas de framework frontend (HTML/JS/CSS statiques) ; backend = fonctions Node dans `api/`.

### Démarrage local (obligatoire pour les routes `/api/*`)

```bash
npm install
npx vercel dev --listen 3000 --yes --local
```

- **`--local`** : évite la connexion OAuth Vercel (indispensable en VM Cloud Agent sans compte lié).
- Sans `vercel dev`, un simple serveur statique ne sert **pas** les routes API.
- Les variables d'environnement ne sont **pas** tirées de Vercel en mode `--local` : copier `.env.example` vers `.env` et renseigner les clés pour les flux complets (Neon, Resend, Google OAuth, Stripe).

### Scripts npm utiles

| Commande | Rôle |
|----------|------|
| `npm run verify:prod` | Vérifie les variables d'environnement requises (échoue si `.env` incomplet — comportement attendu). |
| `npm run niche:sync` | Synchronise `seo/niches.json` → `data/niches-admin.json`. |
| `npm run seo:build` | Régénère les pages SEO (long, ~3600 fichiers). |
| `npm run blog:build` | Régénère le blog. |

### Lint / tests

Aucun linter ni suite de tests automatisés configurés. Validation manuelle via `docs/PROD-CHECKLIST.md` et pages de test HTML (`crm-eligibility-test.html`, etc.).

### Services externes (hors repo)

Pour un parcours E2E complet : Neon (`DATABASE_URL`), JWT (`JWT_SECRET` ≥ 32 car.), Resend, Google OAuth, Stripe. Voir `CONNECT.md` et `.env.example`.

### Gotchas

- `vercel dev` sans `--local` bloque sur l'authentification Vercel (flux device OAuth).
- `POST /api/lead` et `POST /api/journey-event` répondent même sans DB (scoring côté serveur, `stored: false` si `DATABASE_URL` absent).
- Les redirections `has: host` dans `vercel.json` sont ignorées en dev local (avertissement Vercel normal).
