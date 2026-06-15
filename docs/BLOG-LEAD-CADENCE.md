# Cadence articles lead-gen

Le blog publie des articles orientes leads depuis `scripts/blog-lead-article-calendar.cjs`.

## Ajouter un article planifie

1. Ajouter un objet dans `articles` avec `file`, `publishAt`, `section`, `leadIntent`, `keywords`, `cta`, `blocks` et `related`.
2. Ajouter si besoin une entree dans `data/blog-questionnaire-map.json` pour personnaliser l'accroche du pont vers le questionnaire.
3. Lancer `npm run blog:lead-calendar` pour verifier la date et le statut.
4. Lancer `npm run blog:build` pour generer les articles publies a la date du jour.

Pour simuler une publication future :

```bash
BLOG_BUILD_DATE=2026-06-29 npm run blog:build
```

## Automatisation

Le workflow `.github/workflows/blog-lead-cadence.yml` s'execute chaque lundi matin. Il regenere le blog avec la date UTC du jour et commit les fichiers generes uniquement si un article planifie devient publiable.

La cadence recommandee est un article par semaine, centre sur une intention de devis ou de questionnaire : mutuelle, animaux, VTC, RC Pro, emprunteur, habitation, prevoyance ou niche.
