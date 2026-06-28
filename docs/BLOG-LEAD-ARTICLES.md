# Articles evergreen pour generer des leads

Objectif : publier regulierement des articles non perissables qui attirent une intention forte (devis, changement de contrat, economie, sinistre) et renvoient vers les questionnaires Leads Opportunities.

## Difference avec le pipeline actu

| Pipeline | Role | Cadence |
|----------|------|---------|
| `blog:actu:auto` | Articles lies a l'actualite RSS / Cafeyn / Edge / Firefox | 5x/jour |
| `blog:lead:auto` | Articles evergreen issus d'un calendrier editorial oriente conversion | 2x/semaine |

Les deux pipelines reutilisent le meme rendu blog, les memes bridges questionnaire, le meme sitemap et la meme archive `data/blog-actu-published.json`.

## Commandes

```bash
# Voir le prochain article sans ecrire
npm run blog:lead:dry-run

# Publier 1 article evergreen lead
npm run blog:lead:auto

# Publier jusqu'a 3 articles
npm run blog:lead:auto -- --count=3

# Ajouter aux pending sans rebuild HTML/SEO
npm run blog:lead:auto -- --skip-publish
```

## Fichiers

| Fichier | Role |
|---------|------|
| `data/blog-lead-calendar.json` | Backlog de briefs : section, need, CTA, mots-cles, checklist, liens |
| `data/blog-lead-state.json` | Sujets deja publies pour eviter les doublons |
| `scripts/generate-lead-articles.cjs` | Selectionne le meilleur sujet disponible et publie |
| `.github/workflows/blog-lead-articles.yml` | Cron lundi + jeudi, declenchement manuel possible |

## Ajouter un sujet

Ajouter un objet dans `data/blog-lead-calendar.json` :

```json
{
  "id": "assurance-exemple",
  "priority": 75,
  "section": "sante",
  "need": "sante",
  "tag": "Mutuelle",
  "tagClass": "tag-sante",
  "file": "exemple-article-lead.html",
  "title": "Titre oriente recherche et intention devis",
  "description": "Description courte avec benefice concret.",
  "cardExcerpt": "Resume visible dans la grille blog.",
  "keywords": ["mot cle principal", "devis", "courtier ORIAS"],
  "angle": "Pourquoi ce sujet amene un lead qualifie.",
  "painPoints": ["Probleme 1", "Probleme 2"],
  "checklist": ["Action 1", "Action 2"],
  "related": [{ "href": "../landings/sante.html", "label": "Comparer une mutuelle" }]
}
```

Regles :

1. `id` unique, stable.
2. `file` unique et descriptif.
3. `need` aligne avec un questionnaire existant (`sante`, `habitation`, `vtc`, `emprunteur`, etc.).
4. `priority` elevee pour les sujets les plus proches d'une conversion.
5. Pas de copie de contenu externe : le brief sert uniquement a structurer un article original.

## Tracking lead

Les CTA generes ajoutent :

```text
utm_source=blog
utm_medium=lead_regular
utm_campaign=<need>
utm_content=<topic-id>
```

Dans GA4 / Clarity / CRM, filtrer `utm_medium=lead_regular` pour distinguer ces articles evergreen des articles actu (`actu_daily`).
