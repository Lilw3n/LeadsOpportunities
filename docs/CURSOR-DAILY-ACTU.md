# Automation Cursor — actu blog planifiée

Cursor Automation peut lancer le pipeline actu avec revue en PR, sans demander ni stocker de login Cafeyn.

Voir **`docs/BLOG-ACTU-AUTOMATION.md`** section « Quel canal utiliser ».

---

## Cursor vs commande manuelle

| | **Cursor Automations** | **Commande manuelle** |
|---|------------------------|-------------------|
| Déclenchement | Planifié | À la demande |
| Rédaction IA | Oui (secrets Cursor) | Oui si variables locales disponibles |
| Sans clé IA | Oui (`--no-ai`) | Oui (`--no-ai`) |
| Revue | PR → vous mergez | Changements locaux à relire |
| Idéal si | Publication régulière avec contrôle | Test, debug, sélection ponctuelle |

---

## Configuration Cursor (une fois)

### 1. Secrets (équivalent du tableau GitHub)

**[cursor.com/dashboard](https://cursor.com/dashboard) → Cloud Agents → Secrets** (ou Environment du repo) :

| Secret | Obligatoire | Rôle |
|--------|-------------|------|
| `GEMINI_API_KEY` | Recommandé | Rédaction IA (Gemini) |
| `OPENAI_API_KEY` | Optionnel | Secours si Gemini échoue |
| `POCKET_CONSUMER_KEY` | Optionnel | Actu Pocket Firefox |
| `POCKET_ACCESS_TOKEN` | Optionnel | Idem |

Pas besoin de dupliquer sur GitHub si vous n’utilisez **que** Cursor.

### 2. Repo connecté

- GitHub connecté à Cursor, accès **lecture/écriture** sur `LeadsOpportunities`
- Branche de travail : `main` (ou laisser l’agent créer `cursor/blog-actu-…`)

### 3. Nouvelle automation

**Cursor → Automations → New Automation**

| Paramètre | Valeur |
|-----------|--------|
| **Trigger** | Scheduled |
| **Fréquence** | 5×/jour — crons UTC : `0 6,9,12,15,18 * * *` |
| **Repo** | `LeadsOpportunities` |
| **Branche** | `main` |
| **Créer une PR** | Oui (recommandé) — vous mergez → Vercel déploie |

---

## Prompt à coller dans l’automation

```
Tu es l'agent blog Leads Opportunities (courtier ORIAS).

Objectif : publier des articles actu Cafeyn + Edge + Firefox vers les questionnaires.

Étapes obligatoires :
1. npm install
2. npm run blog:actu:auto -- --count=1
   (ou --count=3 pour 1 article par plateforme en une fois)
3. Si aucun changement, terminer sans commit.
4. Sinon : git add data/blog-actu-*.json blog/*.html sitemap*.xml seo/
5. Commit message : chore(blog): actu auto Cursor
6. Push branche cursor/blog-actu-auto-3a54
7. Ouvrir une PR draft vers main

Règles :
- Ne jamais demander de login Cafeyn
- Ne pas dupliquer un slug existant dans blog/
- Les articles doivent avoir CTA questionnaire utm_medium=actu_daily
```

**Variante sans clé IA** (texte enrichi local, pas de Gemini) :

```
npm run blog:actu:auto -- --no-ai --count=1
```

---

## Fréquence et rotation des 3 plateformes

| `--count` | Comportement |
|-----------|--------------|
| `1` | 1 article par run ; rotation **Cafeyn → Edge → Firefox** sur la journée (5 runs = 5 articles) |
| `3` | **1 Cafeyn + 1 Edge + 1 Firefox** à chaque run |

Exemple **5×/jour avec les 3 sources** : 5 automations à `count=1` (rotation auto) **ou** 1–2 runs/jour à `count=3`.

---

## Votre routine (optionnel, 2 min)

1. Lisez Cafeyn / Edge / Firefox comme d’habitude
2. Si un titre vous intéresse : `blog/actu-inbox.html` → favori sécurisé → file serveur
3. L’automation Cursor le priorise au prochain run

---

## Publier en ligne

1. L’automation ouvre une **PR draft**
2. Vous **mergez** sur GitHub (2 clics)
3. **Vercel** déploie automatiquement

---

## Test manuel avant d’activer le cron

Dans Cursor, agent sur le repo :

```bash
npm run blog:actu:auto -- --dry-run --count=3
npm run blog:actu:status
```

Voir aussi **`docs/BLOG-ACTU-AUTOMATION.md`** pour le détail technique du pipeline.
