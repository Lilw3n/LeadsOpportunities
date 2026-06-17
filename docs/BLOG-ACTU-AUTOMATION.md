# Blog actu automatique — leads ultra qualifiés

Objectif : publier **régulièrement des articles orientés leads** liés à l’actualité (équivalent Cafeyn, Edge, Firefox) avec CTA **questionnaires** et leads qualifiés — **sans login Cafeyn**.

## Quel canal utiliser ?

| Canal | Quand | Qualité |
|-------|-------|---------|
| **GitHub Actions** (principal) | Auto 5×/jour, push `main` → Vercel | **Identique à Cursor** si `GEMINI_API_KEY` + `--strict-quality` |
| **Cursor Automations** | Secours si GitHub échoue, ou relecture PR manuelle | Même commande `npm run blog:actu:auto` |

**Ne lancez pas les deux en parallèle** — risque de doublons.

### Activer GitHub (recommandé)

1. GitHub → Settings → Secrets → Actions :
   - `GEMINI_API_KEY` (obligatoire pour qualité IA)
   - `DATABASE_URL` (file Cafeyn bookmarklet)
   - `BLOG_ACTU_INGEST_SECRET` (jeton inbox / favori Cafeyn)
   - optionnel : `OPENAI_API_KEY`, `POCKET_*`
2. Vercel → mêmes variables (`BLOG_ACTU_INGEST_SECRET`, `DATABASE_URL`)
3. Exécuter une fois `database/blog-actu-queue.sql` sur Neon
4. Le workflow `.github/workflows/blog-actu-auto.yml` tourne seul

### Cafeyn — sans stocker votre mot de passe

**Ne donnez jamais email/mot de passe Cafeyn** à un agent, GitHub ou Vercel. Guide complet : **`docs/SETUP-ACTU-CAFEYN.md`**.

**Équivalent automatique** :
- **RSS** des mêmes journaux (17 flux `sourceType: cafeyn`)
- **Favori Cafeyn** : sur un article ouvert dans Cafeyn (vous êtes connecté), clic → file serveur **prioritaire**

1. Vercel : `BLOG_ACTU_INGEST_SECRET` = un mot de passe long (ex. `openssl rand -hex 24`)
2. `blog/actu-inbox.html` → enregistrer le jeton → glisser **« Sauver actu Cafeyn »** dans la barre de favoris
3. Sur Cafeyn : ouvrir un article → clic favori → **Envoyer à la file serveur**
4. Prochain run GitHub publie cet article en priorité (`status: queued`)

## Automatisation 100 % (recommandé)

Chaque exécution **reprend explicitement Cafeyn, Edge et Firefox** :

| Plateforme | Flux utilisés |
|------------|---------------|
| **Cafeyn** | Figaro, Parisien, Libé, Ouest-France, Sud Ouest, Midi Libre, La Dépêche, Nice-Matin, DNA, Le Progrès, Le Monde, L'Express, Capital… |
| **Edge** | Bing News : France, actu, économie, assurance, mutuelle, immobilier, santé |
| **Firefox** | France Info (titres/santé/éco), France 24, Mediapart, RFI, BFMTV, Europe 1, HuffPost, Courrier international + Pocket |
| **Google News** | 20+ requêtes assurance + **Coupe du monde 2026** (matchs, Bleus, Mbappé, supporters, voyage) |

**Sélection** :
- `--count=3` (ou plus) → **1 article Cafeyn + 1 Edge + 1 Firefox** à chaque run
- `--count=1` → rotation automatique (cafeyn → edge → firefox) sur les 5 crons/jour

Les candidats Google News restent en secours, mais ne remplacent plus les 3 plateformes.

```bash
# 2 articles par run en production par defaut (BLOG_ACTU_AUTO_COUNT=2)
npm run blog:actu:auto

# Les 3 plateformes en une fois (recommandé pour test)
npm run blog:actu:auto -- --count=3

# Test sans écrire
npm run blog:actu:auto -- --dry-run

# Sans clé IA (texte enrichi par niche)
npm run blog:actu:auto -- --no-ai
```

### GitHub Actions — 5× par jour

Workflow : **`.github/workflows/blog-actu-auto.yml`**

- Cron UTC : `6h, 9h, 12h, 15h, 18h`
- Déclenchement manuel : onglet **Actions** → *Blog actu auto* → *Run workflow*
- Volume par run : `BLOG_ACTU_AUTO_COUNT` via **Settings → Secrets and variables → Actions → Variables** (défaut `2`, max `5`)
- Commit automatique sur `main` si nouveaux articles

**Secrets à configurer** (Settings → Secrets → Actions) :

| Secret | Obligatoire | Rôle |
|--------|-------------|------|
| `GEMINI_API_KEY` | Recommandé | Rédaction IA (Gemini Flash) |
| `OPENAI_API_KEY` | Optionnel | Fallback IA |
| `POCKET_CONSUMER_KEY` | Optionnel | Actu sauvegardées Firefox/Pocket |
| `POCKET_ACCESS_TOKEN` | Optionnel | Idem |

Sans clé IA, le pipeline utilise **`blog-actu-enrich.cjs`** (angles assurance par niche, CTA `utm_medium=actu_daily`).

## Sources sans identifiants Cafeyn / Edge / Firefox

| Ce que vous lisez | Ce que le bot utilise |
|-------------------|------------------------|
| **Cafeyn** (Figaro, Parisien, Libé, Ouest-France…) | RSS publics des **mêmes journaux** (`sourceType: cafeyn`) |
| **Edge** (MSN actu) | `https://www.msn.com/fr-fr/news/rss` |
| **Firefox** (France Info, 20 Minutes) | RSS Franceinfo + 20 Minutes |
| **Pocket** (sauvegardes) | API Pocket si tokens configurés |

**Ne communiquez jamais vos login Cafeyn** : CGU, risque compte, et blocage technique.

Configuration des flux : **`data/blog-actu-feeds.json`** (~55 sources testées).

## Pipeline détaillé

```
RSS + queue manuelle + Pocket
        ↓
blog-actu-candidates.json (score leadScore)
        ↓
auto-actu-publish (rotation cafeyn → edge → firefox → aggregator)
        ↓
blog-actu-pending.json → blog:build → blog/*.html
        ↓
blog-actu-published.json (archive)
        ↓
Vercel (push main)
```

## Commandes manuelles (debug / agent)

```bash
npm run blog:actu:fetch      # candidats seulement
npm run blog:actu:daily      # top N pour revue humaine
npm run blog:actu:status     # état pipeline
npm run blog:actu:publish    # rebuild HTML + SEO
```

### File manuelle (actu inbox)

1. **`blog/actu-inbox.html`** ou `data/blog-actu-queue.json`
2. Les items `status: pending` sont prioritaires dans `blog:actu:auto`

## Fichiers du pipeline

| Fichier | Rôle |
|---------|------|
| `data/blog-actu-feeds.json` | Flux RSS + config Pocket |
| `data/blog-actu-keywords.json` | Actu → section assurance + CTA |
| `data/blog-actu-queue.json` | Actus manuelles / Pocket |
| `data/blog-actu-candidates.json` | Sortie du fetch |
| `data/blog-actu-pending.json` | Articles avant HTML |
| `data/blog-actu-published.json` | Archives manifeste |
| `data/blog-actu-state.json` | URLs traitées, historique auto |
| `scripts/auto-actu-publish.cjs` | Orchestrateur principal |
| `scripts/blog-actu-enrich.cjs` | Rédaction sans IA |
| `scripts/generate-actu-article-ai.cjs` | Rédaction Gemini/OpenAI |

## Leads ultra qualifiés

1. **CTA questionnaire** — bloc `{ type: "bridge" }` + `ctaWithUtm` → `utm_medium=actu_daily`
2. **Clarity + GA4** — déjà en place sur le blog
3. **Sujets qui convertissent** : sinistre habitation, mutuelle, emprunteur, VTC, animaux

## Limites légales

- Ne **copiez pas** le texte intégral des journaux : réécriture angle conseil assurance.
- RSS : titres + résumés pour inspiration uniquement.

## Automation Cursor (alternative)

Si vous préférez un agent humain en boucle : **`docs/CURSOR-DAILY-ACTU.md`**.

Pour la production sans intervention : **GitHub Actions** ci-dessus suffit.
