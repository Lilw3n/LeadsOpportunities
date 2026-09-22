# Forum SEO — thèmes, Q/R, Facebook

## Idée

Google indexe les **questions en langage naturel**. Facebook (groupes, partage de liens) fonctionne comme un second moteur : un bon `og:title` + `og:image` fait circuler le fil.

Le dossier **`/forum/`** expose :

| Élément | Rôle |
|---------|------|
| Hub `/forum/` | Thèmes + cloud de tournures longue traîne |
| Thème `/forum/{slug}/` | Liste de fils + formulaire demande |
| Fil `/forum/{slug}/{question}.html` | Q/R seed SEO + schema `QAPage` + `DiscussionForumPosting` + share Facebook |

Les **nouvelles** questions du public passent par `POST /api/lead` (`source=forum`) → CRM / e-mail `contact@leadsopportunities.fr`. Les fils seed restent des pages HTML statiques (SEO stable).

## Build

```bash
npm run forum:build
npm run verify:forum-seo
# inclus dans seo:build
```

Source des thèmes / phrases : `data/forum-themes.json`.

## Ajouter un thème ou un fil

1. Éditer `data/forum-themes.json` (titre en **forme question**, phrases proches, réponse courtier).
2. `npm run forum:build`
3. Vérifier OG + mailto sur la page.

## Facebook

- Chaque thème / fil a `og:type=article`, image large, description courte.
- Bouton **Partager sur Facebook** (`facebook.com/sharer`).
- UTM : `utm_source=forum` sur les questionnaires ; le formulaire injecte `utm_source=forum` / `utm_medium=ask_form`.

## Contact

- Mailto partout : `contact@leadsopportunities.fr`
- Tél. : 06 51 36 62 22
