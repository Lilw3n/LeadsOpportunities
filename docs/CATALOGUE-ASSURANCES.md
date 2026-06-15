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
  - `npm run blog:sitemap` — sitemap dédié aux articles blog
  - `npm run blog:build` — tout en une fois
  - `npm run blog:regular` — ajoute le prochain article planifié dans le manifeste généré
  - `npm run blog:regular-build` — publie le prochain article, régénère le blog, le RSS, le sitemap blog et la carte questionnaire

Sections blog : **actu** (présidentielles, Ligue des champions, Coupe du monde, GTA 6, canicule en France, gaming, people, inflation…), santé, habitat, auto, prévoyance, pro, patrimoine, finance, animaux, VTC.

Pour un nouvel article : ajouter une entrée dans le manifeste (avec `blocks`), puis `npm run blog:build`.

## Publication régulière d'articles

- **Calendrier éditorial** : `data/blog-generation-plan.json`
- **Sortie générée** : `scripts/blog-generated-articles.cjs` (ne pas éditer à la main)
- **Workflow GitHub Actions** : `.github/workflows/blog-regular-articles.yml`

Le workflow s'exécute le lundi et le jeudi à 07:00 UTC. Il sélectionne le prochain sujet non publié, l'ajoute au manifeste généré, reconstruit les pages blog, le RSS, le sitemap blog et la carte questionnaire, puis committe les changements.

Pour publier manuellement un sujet précis :

```bash
npm run blog:regular -- --topic=mutuelle-senior-reste-a-charge-2026
npm run blog:build
```

## SEO emprunteur

Produit géo #12 : `assurance-emprunteur/` (189 villes). Pilier : `assurance-emprunteur/index.html`.
