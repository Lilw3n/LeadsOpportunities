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
  - `npm run blog:leadgen` — affiche les articles lead-gen planifiés, publiables et manquants
  - `npm run blog:build` — tout en une fois
  - `npm run blog:publish-scheduled` — publie les articles lead-gen échus, puis met à jour SEO/sitemaps

Sections blog : **actu** (présidentielles, Ligue des champions, Coupe du monde, GTA 6, canicule en France, gaming, people, inflation…), santé, habitat, auto, prévoyance, pro, patrimoine, finance, animaux, VTC.

Pour un nouvel article : ajouter une entrée dans le manifeste (avec `blocks`), puis `npm run blog:build`.

## Articles réguliers pour générer des leads

- **Calendrier** : `scripts/blog-leadgen-calendar.cjs`
- **Cadence** : 1 article lead-gen par semaine, daté via `publishDate`
- **Publication automatique** : `.github/workflows/blog-leadgen.yml` vérifie le calendrier chaque lundi à 7h UTC
- **Comportement** : seuls les articles dont la date est atteinte sont ajoutés au manifeste, générés en HTML, injectés dans l’index blog, le RSS, l’admin map et les sitemaps
- **Conversion** : chaque article contient un bloc `bridge` et un CTA vers le questionnaire/landing de la verticale (santé, animaux, VTC, habitation, crédit, RC Pro, prévoyance)

Pour ajouter une nouvelle vague : ajouter des objets au tableau `LEADGEN_ARTICLES`, avec `file`, `publishDate`, `section`, `cta`, `blocks`, `related` et si possible `faq`. Tester avec :

```bash
npm run blog:leadgen
npm run blog:publish-scheduled
```

## SEO emprunteur

Produit géo #12 : `assurance-emprunteur/` (189 villes). Pilier : `assurance-emprunteur/index.html`.
