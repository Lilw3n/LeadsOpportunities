# Articles reguliers pour generer des leads

Objectif : publier automatiquement des articles evergreen a forte intention de devis, en complement des articles d'actualite.

## Commande principale

```bash
npm run blog:leads:evergreen
npm run blog:leads:evergreen -- --count=2
npm run blog:leads:evergreen -- --topic=vtc-attestation-plateforme
npm run blog:leads:evergreen -- --dry-run
```

Le script :

1. lit `data/blog-lead-calendar.json` ;
2. choisit le prochain sujet non publie ;
3. genere un article long avec bloc `{ type: "bridge" }` ;
4. ajoute un CTA questionnaire avec `utm_medium=lead_evergreen` ;
5. reconstruit le blog + SEO ;
6. archive l'article dans le manifeste dynamique.

## Automatisation GitHub

Workflow : `.github/workflows/blog-leads-evergreen.yml`

- Cron : mardi et vendredi a 7h30 UTC.
- Publication : 1 article par run par defaut.
- Lancement manuel : onglet Actions -> *Blog leads evergreen*.
- Parametres manuels :
  - `count` : 1 a 5 articles ;
  - `topic` : ID exact du sujet dans `data/blog-lead-calendar.json`.

## Ajouter des sujets

Ajouter une entree dans `data/blog-lead-calendar.json` avec :

- `id` unique ;
- `file` HTML cible ;
- `section`, `need`, `tag`, `tagClass` ;
- `title`, `description`, `cardExcerpt` ;
- `leadIntent`, `hook`, `checklist`, `mistakes` ;
- `related` vers articles ou landings utiles.

Prioriser les niches qui convertissent deja :

1. mutuelle / sante ;
2. VTC ;
3. habitation ;
4. emprunteur ;
5. prevoyance independants ;
6. RC Pro ;
7. animaux.

## Difference avec le pipeline actu

| Pipeline | Frequence | Source | UTM |
|----------|-----------|--------|-----|
| `blog:actu:auto` | 5 fois par jour | RSS + queue + Pocket | `actu_daily` |
| `blog:leads:evergreen` | 2 fois par semaine | calendrier editorial | `lead_evergreen` |

Ne pas remplacer l'actu : les deux pipelines ont des intentions differentes. L'actu capte les sujets chauds ; l'evergreen construit un stock d'articles stables pour SEO, partage organique et retargeting.
