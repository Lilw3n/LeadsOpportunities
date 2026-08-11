# Blog leads auto — articles evergreen de conversion

Objectif : publier regulierement des articles **non dependants de l'actualite** pour capter des visiteurs avec intention forte, puis les envoyer vers un **questionnaire lead**.

## Commandes

```bash
npm run blog:leads:auto
npm run blog:leads:auto -- --count=2
npm run blog:leads:auto -- --dry-run
```

Le script :

1. lit `data/blog-lead-article-plan.json`,
2. choisit les prochains sujets non publies,
3. genere un article avec bloc `{ type: "bridge" }`,
4. ajoute les UTM `utm_medium=lead_evergreen`,
5. lance `npm run blog:actu:publish` pour regenerer blog + SEO,
6. archive l'article via `data/blog-actu-published.json`.

## Cadence GitHub Actions

Workflow : `.github/workflows/blog-leads-auto.yml`

- Lundi, mercredi, vendredi a 07:30 UTC
- 1 article par run par defaut
- Declenchement manuel possible avec `count` de 1 a 3

Cette cadence complete `blog-actu-auto.yml` :

- `blog-actu-auto` = sujets chauds depuis RSS / actu,
- `blog-leads-auto` = contenus evergreen choisis pour convertir.

## Sujets prioritaires

Le plan initial couvre les verticales les plus convertissantes :

| Verticale | Intention |
|-----------|-----------|
| VTC | Attestation plateforme, RC Pro, renouvellement |
| Mutuelle | Famille, budget, optique/dentaire/hospitalisation |
| Emprunteur | Loi Lemoine, economie sur le pret |
| Habitation | Degats des eaux, locataire, capital mobilier |
| Animaux | Chien/chat, urgence veterinaire, plafond |
| RC Pro | Freelance, litige client, protection juridique |

## Ajouter un sujet

Ajouter une entree dans `data/blog-lead-article-plan.json` avec :

- `id` unique,
- `priority`,
- `section`, `need`, `tag`, `tagClass`,
- `slug`, `title`, `description`,
- `intent`, `pain`, `trigger`, `leadPromise`,
- `checklist`,
- `faq`.

Le script evite les doublons via :

- `data/blog-lead-articles-state.json`,
- les fichiers deja presents dans `blog/`,
- les articles pending/publies du pipeline actu.

## Tracking leads

Les boutons questionnaire portent :

```text
utm_source=blog
utm_medium=lead_evergreen
utm_campaign=<need>_lead_content
utm_content=<topic_id>
```

Dans GA4 / Clarity / CRM, filtrer `utm_medium=lead_evergreen` pour comparer ces articles aux articles d'actualite (`utm_medium=actu_daily`).
