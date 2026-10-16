---
generated: false
tags:
  - journal
  - modeles
---

# Modèles IA disponibles ici

Note manuelle. `npm run vault:seo` ne l’écrase pas.

Constat du 16 octobre 2026, pour l’agent qui travaille dans ce dépôt.

## Claude Opus 5.5

Oui. On peut lancer un sous-agent **Claude Opus 5.5** (niveaux high, medium, max, xhigh, et variantes rapides).

L’agent principal de cette session reste Grok 4.7. Opus 5.5 s’utilise en lui confiant une tâche, pas en remplaçant toute la conversation.

## OpenAI Astra

Non, pas depuis cet agent. **GPT-6 Astra** (`gpt-6-astra`) existe chez OpenAI, mais il n’est pas dans la liste des modèles que cet environnement peut appeler.

Le modèle OpenAI disponible ici est **GPT-5.6 Sol** (high, medium, max, xhigh, et variantes rapides).

## À retenir

- SEO, maillage, coffre : rester dans `vault/` ([[Accueil]]).
- Pour un passage Opus 5.5 : le demander explicitement.
- Ne pas supposer qu’Astra est branché tant que `gpt-6-astra` n’apparaît pas dans les modèles de l’agent.
