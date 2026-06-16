# Blog leads - calendrier editorial

Objectif : publier regulierement des articles SEO qui conduisent vers un questionnaire ou une landing, puis mesurer leur contribution aux leads via GA4.

## Principe

- Les briefs editoriaux sont dans `data/blog-lead-content-plan.json`.
- `npm run blog:lead:publish` publie le prochain article dont `publishAt` est arrive.
- Les articles publies sont materialises dans `scripts/blog-lead-articles.generated.cjs`.
- `npm run blog:build` regenere les pages HTML, l'index, le flux RSS et le mapping questionnaire.

## Cadence recommandee

Publier 1 article par semaine, en alternant les verticales a forte intention :

- Sante : mutuelle senior, TNS, hospitalisation, optique/dentaire.
- VTC : vehicule, RC pro, plateformes, renouvellement.
- Habitation : locataire, colocation, PNO, sous-assurance.
- Finance : emprunteur, Lemoine, rachat, metiers a risque.
- Pro : RC Pro, freelance, artisan, activite digitale.

## Commandes

Previsualiser le prochain article sans ecrire de fichier :

```bash
npm run blog:lead:preview
```

Publier le prochain article du calendrier :

```bash
npm run blog:lead:publish
npm run blog:build
```

Forcer une date de publication pour recette :

```bash
npm run blog:lead:publish -- --date=2026-06-23 --count=1
```

Publier tous les articles dus si une semaine a ete manquee :

```bash
npm run blog:lead:publish -- --all
npm run blog:build
```

## Checklist conversion

Chaque brief doit contenir :

- un mot-cle principal avec intention devis ou comparaison ;
- une douleur concrete qui justifie une prise de contact ;
- un CTA vers `landings/questionnaire.html` ou une landing verticale ;
- 2 ou 3 liens internes vers articles/pages service ;
- des documents a preparer pour raccourcir le parcours lead.

## Mesure

Apres publication, suivre dans GA4 :

- `blog_article_view` par `article_slug` ;
- `blog_scroll_depth` pour verifier la lecture ;
- `blog_cta_click` pour mesurer les clics vers questionnaire/landing ;
- leads entrants avec source/UTM si le parcours les conserve.

Voir aussi `docs/BLOG-ANALYTICS.md`.
