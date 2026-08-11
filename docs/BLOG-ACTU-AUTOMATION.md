# Blog actu automatique — leads ultra qualifiés

Objectif : publier **1 à 5 articles par jour** liés à l’actualité (équivalent Cafeyn, pages d’accueil Edge/Firefox, Google News, Bing, Yahoo, etc.) avec CTA **questionnaires** et leads qualifiés — **sans login Cafeyn**.

## Quel canal utiliser ?

| Canal | Quand | Qualité |
|-------|-------|---------|
| **Cursor Automations** | Auto 1 à 5×/jour avec PR de revue | Même commande `npm run blog:actu:auto` |
| **Commande manuelle** | Test, sélection du jour, correction ponctuelle | Identique à l'automation |
| **GitHub Actions** (optionnel) | Si vous ajoutez un workflow dédié autour des commandes npm | Identique si les mêmes secrets sont configurés |

**Ne lancez pas les deux en parallèle** — risque de doublons.

### Préparer l'exécution

1. Environnement qui lance `npm run blog:actu:auto` :
   - `GEMINI_API_KEY` (recommandé pour qualité IA)
   - optionnel : `OPENAI_API_KEY`, `POCKET_*`
2. Vercel → `BLOG_ACTU_INGEST_SECRET` + `DATABASE_URL` pour la file Cafeyn/inbox
3. Exécuter une fois `database/blog-actu-queue.sql` sur Neon
4. Planifier `npm run blog:actu:auto -- --count=1` à `--count=5` via Cursor Automation, cron ou workflow maison

### Cafeyn — sans stocker votre mot de passe

**Ne donnez jamais email/mot de passe Cafeyn** à un agent, GitHub ou Vercel. Guide complet : **`docs/SETUP-ACTU-CAFEYN.md`**.

**Équivalent automatique** :
- **RSS** des mêmes journaux (17 flux `sourceType: cafeyn`)
- **Favori Cafeyn** : sur un article ouvert dans Cafeyn (vous êtes connecté), clic → file serveur **prioritaire**

1. Vercel : `BLOG_ACTU_INGEST_SECRET` = un mot de passe long (ex. `openssl rand -hex 24`)
2. `blog/actu-inbox.html` → enregistrer le jeton → glisser **« Sauver actu Cafeyn »** dans la barre de favoris
3. Sur Cafeyn : ouvrir un article → clic favori → **Envoyer à la file serveur**
4. Prochain run `npm run blog:actu:auto` traite cet article en priorité (`status: queued`)

## Automatisation 100 % (recommandé)

Chaque exécution collecte dans des familles de sources explicites :

| Plateforme | Flux utilisés |
|------------|---------------|
| **Cafeyn** | Figaro, Parisien, Libé, Ouest-France, Sud Ouest, Midi Libre, La Dépêche, Nice-Matin, DNA, Le Progrès, Le Monde, L'Express, Capital… |
| **Edge / MSN** | Bing News RSS utilisé comme équivalent page d’accueil Edge : France, actu, économie, assurance, mutuelle, immobilier, santé |
| **Firefox / Mozilla** | France Info (titres/santé/éco), 20 Minutes, France 24, Mediapart, RFI, BFMTV, Europe 1, HuffPost, Courrier international + Pocket |
| **Google News** | 20+ requêtes assurance + sujets chauds France (**Coupe du monde 2026**, matchs, Bleus, Mbappé, supporters, voyage) |
| **Bing News** | Requêtes dédiées France, assurance, mutuelle, emprunteur, sinistre |
| **Yahoo** | Yahoo Actualités France + Yahoo Finance |

**Sélection** :
- `--count=3` → **1 article Cafeyn + 1 Edge + 1 Firefox** à chaque run si le vivier le permet
- `--count=4` ou `--count=5` → ajoute une rotation Google News / Bing News / Yahoo
- `--count=1` → rotation automatique sur les plateformes disponibles

Les candidats Google/Bing/Yahoo disposent de quotas et compteurs séparés ; `aggregator` ne sert plus que de secours.

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

### Planification — 1 à 5× par jour

Cette branche fournit les scripts, pas un workflow GitHub imposé. Vous pouvez planifier la commande via Cursor Automations, un cron serveur, ou un workflow GitHub que vous ajoutez séparément.

- Exemple cron UTC : `6h, 9h, 12h, 15h, 18h` (≈ 5 publications/jour)
- Commande : `npm run blog:actu:auto -- --count=1`
- En revue manuelle : `npm run blog:actu:auto -- --dry-run --count=3`

**Secrets à configurer dans l'environnement d'exécution** :

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
| **Cafeyn** (Figaro, Parisien, Libé, Ouest-France…) | RSS publics des **mêmes journaux** (`sourceType: cafeyn`) + favori sécurisé |
| **Edge** (MSN actu) | Bing News RSS (`sourceType: edge`) car les endpoints MSN directs ne sont pas fiables |
| **Firefox** (France Info, 20 Minutes) | RSS Franceinfo + 20 Minutes + Pocket optionnel |
| **Google News** | Google News RSS France et requêtes assurance (`sourceType: google`) |
| **Bing** | Bing News RSS dédié (`sourceType: bing`) |
| **Yahoo** | Yahoo Actualités / Yahoo Finance RSS (`sourceType: yahoo`) |
| **Pocket** (sauvegardes) | API Pocket si tokens configurés |

**Ne communiquez jamais vos login Cafeyn** : CGU, risque compte, et blocage technique.

Configuration des flux : **`data/blog-actu-feeds.json`** (~55 sources testées).

## Pipeline détaillé

```
RSS publics + queue manuelle + Pocket
        ↓
blog-actu-candidates.json (score leadScore)
        ↓
auto-actu-publish (rotation cafeyn → edge → firefox → google/bing/yahoo)
        ↓
blog-actu-pending.json → blog:build → blog/*.html
        ↓
blog-actu-published.json (archive)
        ↓
Vercel après commit/merge
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

## Automation Cursor

Si vous préférez un agent humain en boucle : **`docs/CURSOR-DAILY-ACTU.md`**.

Pour la production sans intervention, planifiez la même commande dans l'outil de votre choix.
