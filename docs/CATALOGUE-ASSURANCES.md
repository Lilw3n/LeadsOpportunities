# Catalogue assurances & blog

## Hub public

- **URL** : `/assurances/` — grille filtrable (toutes les prestations de `js/service-catalog.js`)
- **Meta** : `data/assurances-hub-meta.json` (SEO, blog, mots-clés, featured)
- **Ancienne page** : `nos-services.html` (liste détaillée, lien vers le hub)

## Blog

- **Manifeste** : `scripts/blog-articles-manifest.cjs` (sections + contenu)
- **Commandes** :
  - `npm run blog:articles` — génère les HTML manquants
  - `npm run blog:index` — régénère `blog/index.html`
  - `npm run blog:feed` — RSS
  - `npm run blog:build` — tout en une fois
  - `npm run blog:scheduled` — publie les articles leads dus selon `scripts/blog-lead-calendar.cjs`

Sections blog : **actu** (présidentielles, Ligue des champions, Coupe du monde, GTA 6, canicule en France, gaming, people, inflation…), santé, habitat, auto, prévoyance, pro, patrimoine, finance, animaux, VTC.

Pour un nouvel article manuel : ajouter une entrée dans le manifeste (avec `blocks`), puis `npm run blog:build`.

Pour une publication régulière orientée leads : ajouter l'article dans `scripts/blog-lead-calendar.cjs` avec `publishAt`. Le workflow `Publication articles leads` s'exécute chaque lundi, régénère le blog et commit les pages si un article devient publiable. Test local :

```bash
BLOG_PUBLISH_DATE=2026-07-20 npm run blog:scheduled
```

## SEO emprunteur

Produit géo #12 : `assurance-emprunteur/` (189 villes). Pilier : `assurance-emprunteur/index.html`.
