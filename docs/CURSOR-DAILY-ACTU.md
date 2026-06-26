# Automation Cursor — secours (GitHub = principal)

**Par défaut utilisez GitHub Actions** — même qualité, gratuit, sans consommer votre abo Cursor.

Cursor Automation = **secours** si le workflow GitHub échoue ou pour relecture manuelle avant merge.

Voir **`docs/BLOG-ACTU-AUTOMATION.md`** section « Quel canal utiliser ».

---

## Cursor vs GitHub Actions

| | **Cursor Automations** | **GitHub Actions** |
|---|------------------------|-------------------|
| Coût | Inclus dans l’abo + usage agent (Max Mode) | Gratuit (minutes GitHub) |
| Rédaction IA | Oui (secrets Cursor) | Oui (secrets GitHub) |
| Sans clé IA | Oui (`--no-ai`) | Oui (`--no-ai`) |
| Merge auto | PR draft → vous mergez | Push `main` auto possible |
| Idéal si | Vous voulez tout piloter depuis Cursor | Publication 100 % sans intervention |

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

Objectif : publier des articles actu Cafeyn + Edge/Bing + Firefox/Pocket + Google News + Yahoo vers les questionnaires.

Étapes obligatoires :
1. npm install
2. npm run blog:actu:auto -- --count=1
   (ou --count=5 pour Cafeyn + Edge/Bing + Firefox/Pocket + Google News + Yahoo)
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

## Fréquence et rotation des sources

| `--count` | Comportement |
|-----------|--------------|
| `1` | 1 article par run ; rotation **Cafeyn → Edge/Bing → Firefox/Pocket → Google News → Yahoo** |
| `3` | **1 Cafeyn + 1 Edge/Bing + 1 Firefox/Pocket** à chaque run |
| `5` | **1 article par canal** : Cafeyn + Edge/Bing + Firefox/Pocket + Google News + Yahoo |

Exemple **5×/jour avec toutes les sources** : 5 automations à `count=1` (rotation auto) **ou** 1 run large à `count=5`.

---

## Votre routine (optionnel, 2 min)

1. Lisez Cafeyn / Edge / Firefox comme d’habitude
2. Si un titre vous intéresse : `blog/actu-inbox.html` → JSON → `data/blog-actu-queue.json`
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
npm run verify:clarity
```

Voir aussi **`docs/BLOG-ACTU-AUTOMATION.md`** pour le détail technique du pipeline.
