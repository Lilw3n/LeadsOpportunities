# Pack Buchet Immobilier / DiddyImmo

Export autonome du **CRM immobilier** (piges, fiches, barèmes, matching, visites, APIs) depuis [Leads Opportunities](https://www.leadsopportunities.fr), prêt à :

1. **Déployer sur Vercel** en pointant le Root Directory sur `diddy-immo/` (projet `buchet-immobilier` ou nouveau), **ou**
2. **Copier / pousser** vers le dépôt `Lilw3n/DiddyImmo` dès que l’app GitHub Cursor a accès à ce repo.

## Contenu

| Zone | Rôle |
|------|------|
| `crm-immo-*.html` + `js/crm-immo-*` | CRM piges, fiche bien, pubs, matching, suivi, utilisateurs |
| `crm-agency-fees.*` | Barèmes / honoraires / partage |
| `immobilier/` | Hub public achat · location · syndic · visites |
| `bareme-honoraires/` | Grille publique |
| `api/` | Routes immo + auth + drive immo (Neon / JWT) |
| `database/*.sql` | Schémas piges / réseau / tour access |
| `docs/` | Référentiels CRM immo |

## Variables d’environnement (Vercel)

Minimum pour un go-live API :

- `DATABASE_URL` — Neon Postgres
- `JWT_SECRET` (ou équivalent utilisé dans `api/_lib/auth.js`)
- Optionnel Drive : secrets Google OAuth / service account déjà utilisés côté LO
- `APP_URL` — URL publique du déploiement Buchet

## Déploiement Vercel

1. Importer le repo (LO ou DiddyImmo après copie).
2. **Root Directory** = `diddy-immo` (si le pack reste dans LO) **ou** `.` (si c’est la racine DiddyImmo).
3. Framework : Other / static + Serverless Functions (`api/`).
4. Lier le domaine `buchet-immobilier` / custom.

## Pousser vers DiddyImmo (quand l’accès GitHub est OK)

```bash
# Depuis la racine LO, après clone local de DiddyImmo :
rsync -a --delete \
  --exclude node_modules --exclude .git \
  diddy-immo/ /chemin/vers/DiddyImmo/
cd /chemin/vers/DiddyImmo
git add -A && git commit -m "Import pack CRM immo Buchet depuis LO" && git push
```

Dans Cursor Cloud : environnement multi-repo **ou** agent démarré sur l’env DiddyImmo après *All repositories* + Save sur l’installation GitHub App.

## Vérif locale

```bash
cd diddy-immo && npm run verify:pack
```

## Limites de ce pack

- Pas le site Next.js éventuel déjà sur Buchet : ce pack est le **CRM / parcours immo HTML + API** LO.
- Sidebar CRM peut encore pointer vers des pages assurance non incluses — les écrans immo listés sur `index.html` sont couverts.
- Le token agent Cloud actuel n’a **pas** le droit de créer/pousser sur `Lilw3n/DiddyImmo` tant que l’installation GitHub n’inclut pas ce dépôt.
