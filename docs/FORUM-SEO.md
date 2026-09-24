# Forum — questions = SEO

## Principe

Le **forum** (`/forum/`) est à la fois :

1. **Un vrai forum** — thèmes, liste de questions, fils Q/R, formulaire « poser une question »
2. **Un silo SEO** — chaque question en langage naturel = page indexable (`QAPage` + `DiscussionForumPosting`)

Les gens cherchent en phrases (« combien ça coûte vraiment », « mon prêt est refusé »). Ces tournures **sont** notre SEO : on les transforme en fils stables, partageables (Facebook OG), avec CTA devis / contact.

| Élément | Rôle |
|---------|------|
| Hub `/forum/` | Stats, thèmes, **tableau de toutes les questions**, formulaire hub |
| Thème `/forum/{slug}/` | Liste des fils du thème + formulaire |
| Fil `/forum/{slug}/{question}.html` | Question + réponse courtier + recherches associées + related |

Les **nouvelles** questions du public passent par `POST /api/lead` (`source=forum`) → CRM / `contact@leadsopportunities.fr`. Les fils seed restent du HTML statique (SEO stable).

## Build

```bash
npm run forum:build
npm run verify:forum-seo
# inclus dans seo:build
```

Source : `data/forum-themes.json` (thèmes + questions + réponses + phrases longue traîne).

## Ajouter une question SEO

1. Éditer `data/forum-themes.json` — titre en **forme question**, `excerpt`, `answer`, `phrases[]`
2. `npm run forum:build`
3. Vérifier OG + schema + mailto

## Facebook

- `og:type=article`, image large, description courte
- Bouton **Partager** (`facebook.com/sharer`)
- UTM : `utm_source=forum` sur questionnaires ; formulaire → `utm_source=forum` / `utm_medium=ask_form`

## Contact

- Mailto : `contact@leadsopportunities.fr`
- Tél. : 06 51 36 62 22
