# SEO Leads Opportunities

## Silos publies

| Silo | URL pilier | Landing conversion |
|------|------------|-------------------|
| VTC | `/assurance-vtc/` | `/landings/vtc.html` |
| Sante | `/assurance-sante/` | `/landings/sante.html` |
| Credit immo | `/credit-immo/` | `/landings/credit-immo.html` |

## Regenerer les pages

```bash
node scripts/generate-seo-pages.cjs
```

Genere automatiquement :
- pages piliers + intent (devis, tarif, comparatif…)
- **~54 villes × 3 produits** (VTC, sante, credit immo) = 162 pages locales
- hubs `/assurance-vtc/villes/`, `/assurance-sante/villes/`, `/credit-immo/villes/`
- hub national `/france/`
- `sitemap.xml` complet (toutes les URLs)

Liste des villes : `seo/france-cities.json` (ajouter une ligne = regen).

## Docs

- `architecture-seo.md` — plan silos et maillage
- `keyword-clusters-seo-sea.csv` — clusters mots-cles SEO/SEA
- `../local/gbp-optimisation.md` — Google Business Profile
- `../ads/` — structure SEA et CSV Google Ads

## Checklist post-deploy

1. Soumettre `sitemap.xml` dans Google Search Console
2. Verifier indexation des URLs `/assurance-vtc/`, `/assurance-sante/`, `/credit-immo/`
3. Lier les articles blog vers les pages piliers (deja en place sur les pages generees)
