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

Sections blog : **actu** (présidentielles, Ligue des champions, Coupe du monde, GTA 6, canicule en France, gaming, people, inflation…), santé, habitat, auto, prévoyance, pro, patrimoine, finance, animaux, VTC.

Pour un nouvel article : ajouter une entrée dans le manifeste (avec `blocks`), puis `npm run blog:build`.

**Actu automatique (Cafeyn, Edge, RSS)** : voir `docs/BLOG-ACTU-AUTOMATION.md` — `npm run blog:actu:fetch`, boîte `blog/actu-inbox.html`, automation Cursor.

## SEO emprunteur

Produit géo #12 : `assurance-emprunteur/` (189 villes). Pilier : `assurance-emprunteur/index.html`.
