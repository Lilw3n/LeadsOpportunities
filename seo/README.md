# SEO Leads Opportunities

## Silos publies

| Silo | URL pilier | Landing conversion |
|------|------------|-------------------|
| VTC | `/assurance-vtc/` | `/landings/vtc.html` |
| Sante | `/assurance-sante/` | `/landings/sante.html` |
| Sante collective | `/assurances/` (hub) | `/landings/sante-collective.html` |
| Pret immobilier | `/pret-immobilier/` | `/landings/credit-immo.html` |
| Recherche de bien | `/recherche-bien/` | `/landings/acheteur-immo.html` |
| Finance | `/finance/` | `/landings/questionnaire.html?need=rachat` |
| Banque | `/banque/` | `/landings/rappel.html?need=banque` |
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
- **16 produits** : VTC, sante, credit immo, pret immo, recherche de bien, finance, banque, auto, habitation, emprunteur, prevoyance, animaux, chien, chat, chasse, equitation
- villes × produits = pages locales ville (`/{produit}/{ville}/`)
- **101 departements** × produits = pages departement (`/{produit}/departement/{slug}/`)
- **24 regions** × produits = pages region (`/{produit}/region/{slug}/`)
- hubs `/villes/`, `/departements/`, `/regions/` par produit
- hub national `/france/`, `/france/regions/`, `/france/departements/`
- grille « Par produit ou departement » sur `/france/departement/{slug}/`

Sitemaps (index Google) :
- `sitemap.xml` (index)
- `sitemap-main.xml`, `sitemap-geo.xml`, `sitemap-france.xml`

Verification : `npm run verify:seo-geo-piliers`

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
