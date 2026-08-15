# SEO Leads Opportunities

## Silos publies

| Silo | URL pilier | Landing conversion |
|------|------------|-------------------|
| VTC | `/assurance-vtc/` | `/landings/vtc.html` |
| Sante | `/assurance-sante/` | `/landings/sante.html` |
| Sante collective | `/assurances/` (hub) | `/landings/sante-collective.html` |
| Credit immo | `/credit-immo/` | `/landings/credit-immo.html` |

## Regenerer les pages

```bash
node scripts/generate-seo-pages.cjs
```

VTC **Île-de-France** (priorité) : hub `/assurance-vtc/ile-de-france/`, aéroports CDG/Orly, La Défense, gares, 20 arrondissements, photos `images/seo/vtc/`.

```bash
npm run seo:images   # photos Unsplash locales
npm run seo:build
npm run verify:seo-vtc-idf
```

```bash
node scripts/generate-seo-pages.cjs
```

Commande tout-en-un :

```bash
npm run seo:build
```

Genere automatiquement :
- **6 produits** : VTC, sante, credit immo, auto, habitation, prevoyance
- **189 villes** × 6 produits = pages locales ville
- **95 departements** × 6 produits = pages departement
- **18 regions** + hubs villes/departements
- hub national `/france/`, `/france/regions/`, `/france/departements/`
- **~1846 pages HTML** et **~1875 URLs** dans les sitemaps

Sitemaps (index Google) :
- `sitemap.xml` (index)
- `sitemap-main.xml`, `sitemap-geo.xml`, `sitemap-france.xml`

Donnees : `seo/france-cities.json`, `seo/france-departments.json`, `seo/france-regions.json`

## Docs

- `architecture-seo.md` — plan silos et maillage
- `keyword-clusters-seo-sea.csv` — clusters mots-cles SEO/SEA
- `../local/gbp-optimisation.md` — Google Business Profile
- `../ads/` — structure SEA et CSV Google Ads

## Checklist post-deploy

1. Soumettre `sitemap.xml` dans Google Search Console
2. Verifier indexation des URLs `/assurance-vtc/`, `/assurance-sante/`, `/credit-immo/`
3. Lier les articles blog vers les pages piliers (deja en place sur les pages generees)
