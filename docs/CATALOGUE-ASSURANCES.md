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
  - `npm run blog:publish-due` — publie les articles leads dus selon `scripts/blog-lead-editorial-calendar.cjs`, puis régénère blog, RSS, admin map et sitemap

Sections blog : **actu** (présidentielles, Ligue des champions, Coupe du monde, GTA 6, canicule en France, gaming, people, inflation…), santé, habitat, auto, prévoyance, pro, patrimoine, finance, animaux, VTC.

Pour un nouvel article manuel : ajouter une entrée dans le manifeste (avec `blocks`), puis `npm run blog:build`.

Pour des articles réguliers orientés leads : ajouter une entrée planifiée dans `scripts/blog-lead-editorial-calendar.cjs` avec `scheduledAt`, `leadIntent`, `cta`, `blocks` et `related`. Le workflow `.github/workflows/blog-lead-articles.yml` tourne le lundi et le jeudi matin, lance `npm run blog:publish-due`, puis ouvre une PR si un article est dû. Pour tester une date :

```bash
BLOG_PUBLISH_DATE=2026-06-18 npm run blog:publish-due
```

## SEO emprunteur

Produit géo #12 : `assurance-emprunteur/` (189 villes). Pilier : `assurance-emprunteur/index.html`.
