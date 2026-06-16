# Blog actu automatique — leads ultra qualifiés

Objectif : publier **1 à 5 articles par jour** liés à l’actualité (équivalent Cafeyn, Edge, Firefox) avec CTA **questionnaires** et leads qualifiés — **sans login Cafeyn**.

## Automatisation 100 % (recommandé)

Chaque exécution **reprend explicitement Cafeyn, Edge et Firefox** :

| Plateforme | Flux utilisés |
|------------|---------------|
| **Cafeyn** | RSS publics des titres équivalents au kiosque : Figaro, Parisien, Libé, Ouest-France, Midi Libre, Nice-Matin, Le Monde, Challenges, Capital, L'Obs, La Dépêche… |
| **Edge** | Bing News RSS (équivalent page d'accueil Edge/MSN — pas de RSS MSN public fiable) |
| **Firefox** | France Info, France 24, BFMTV, Europe 1, Public Sénat, Mediapart, Courrier international + Pocket API |
| **Agrégateurs** | Google News général/thématique + Yahoo Actualités RSS |

**Sélection** :
- `--count=3` (ou plus) → **1 article Cafeyn + 1 Edge + 1 Firefox** à chaque run
- `--count=1` → rotation automatique (cafeyn → edge → firefox) sur les 5 crons/jour

Les candidats Google News et Yahoo restent en complément, mais ne remplacent plus les 3 plateformes.

```bash
# 1 article (rotation cafeyn/edge/firefox selon l'heure)
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

- Cron UTC : `6h, 9h, 12h, 15h, 18h` (≈ 5 publications/jour)
- Déclenchement manuel : onglet **Actions** → *Blog actu auto* → *Run workflow*
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
| **Cafeyn** (`https://www.cafeyn.co/fr/newsstand`) | Page dynamique non scrapée ; RSS publics des **mêmes titres** (`sourceType: cafeyn`) |
| **Edge** / page d'accueil MSN | Bing News RSS avec requêtes France, économie, assurance, mutuelle, immobilier, auto (`sourceType: edge`) |
| **Firefox** / Pocket | RSS Franceinfo, France 24, BFMTV, Europe 1, Public Sénat, Mediapart, Courrier international + API Pocket |
| **Google News** | RSS général France + requêtes assurance, habitation, santé, immobilier, auto, consommation |
| **Yahoo Actualités** | RSS public global `https://fr.news.yahoo.com/rss` |
| **Pocket** (sauvegardes) | API Pocket si tokens configurés |

**Ne communiquez jamais vos login Cafeyn** : ils ne sont pas nécessaires, exposent le compte, peuvent violer les CGU et ne doivent pas être stockés dans le dépôt. Si un accès authentifié devenait indispensable, il faudrait passer par un coffre de secrets (GitHub/Vercel Secrets), jamais par le chat ni par un fichier.

Configuration des flux : **`data/blog-actu-feeds.json`** (sources RSS publiques multi-plateformes).

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
