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

Puis mettre a jour `sitemap.xml` (fragment dans `seo/generated-sitemap-fragment.xml`).

## Docs

- `architecture-seo.md` — plan silos et maillage
- `keyword-clusters-seo-sea.csv` — clusters mots-cles SEO/SEA
- `../local/gbp-optimisation.md` — Google Business Profile
- `../ads/` — structure SEA et CSV Google Ads

## Checklist post-deploy

1. Soumettre `sitemap.xml` dans Google Search Console
2. Verifier indexation des URLs `/assurance-vtc/`, `/assurance-sante/`, `/credit-immo/`
3. Lier les articles blog vers les pages piliers (deja en place sur les pages generees)
