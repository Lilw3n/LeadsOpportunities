# Santé collective — blog, SEO, pubs

Pack **mutuelle / assurance santé collective** (B2B employeur, ANI, PME/TPE).

## Conversion (déjà en place)

| Élément | URL |
|--------|-----|
| Landing | `/landings/sante-collective.html` |
| Express | `/landings/devis-express.html?need=collective` |
| Questionnaire | `/landings/questionnaire.html?need=collective` |

## SEO

| Élément | URL |
|--------|-----|
| Pilier | `/assurance-sante-collective/` |
| ANI | `/assurance-sante-collective/ani/` |
| PME | `/assurance-sante-collective/pme/` |
| DUE | `/assurance-sante-collective/due/` |
| Panier | `/assurance-sante-collective/panier-de-soins/` |

Génération : `scripts/niche-collective-pages.cjs` → `npm run seo:build`.

## Blog (8 articles)

Source : `scripts/blog-collective-articles.cjs` → `npm run blog:build`.

Pilier : `/blog/mutuelle-collective-entreprise-guide-2026.html`

## Google Ads

- Fichier : `ads/google-collective-search.csv`
- Campagne : `FR_Search_Collective_HotIntent`
- Import aussi dans `ads/google-ads-editor-ready-utm.csv`
- Landing principale : `sante-collective.html`

Négatifs utiles : `gratuit`, `particulier`, `senior` (évite le trafic mutuelle individuelle).

## Meta

Lignes `collective_*` dans `ads/meta-blog-conversions.csv` → bridge vers la landing collective.

## Vérif

```bash
npm run verify:collective
npm run niche:sync
npm run blog:build
npm run seo:build
```

## Différence avec mutuelle individuelle

| | Individuelle (`sante`) | Collective |
|--|----------------------|------------|
| Acheteur | Particulier / famille | Employeur |
| Landing | `/landings/sante.html` | `/landings/sante-collective.html` |
| SEO | `/assurance-sante/` | `/assurance-sante-collective/` |
| Intent | Remboursement, canicule | ANI, DUE, budget PME |
