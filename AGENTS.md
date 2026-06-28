# AGENTS.md — Leads Opportunities

## Scripts utiles

- `npm run blog:build` — régénère tous les articles blog
- `npm run blog:actu:fetch` — récupère candidats actu (RSS + queue)
- `npm run blog:actu:draft -- --top=2` — ébauches dans `data/blog-actu-pending.json`
- `npm run blog:actu:publish` — blog + sitemap SEO
- `npm run blog:lead:auto` — publie un article evergreen oriente leads
- `npm run blog:lead:dry-run` — previsualise le prochain article lead
- `npm run seo:build` — sitemaps
- `npm run build:clarity` — après modif `js/clarity-source.mjs`

## Blog actu (leads qualifiés)

Voir **`docs/BLOG-ACTU-AUTOMATION.md`** pour le pipeline complet.

**Automatisation 1–5×/jour (sans login Cafeyn)** :
```bash
npm run blog:actu:auto              # 1 article
npm run blog:actu:auto -- --count=3 # jusqu'à 5
```
CI : **`.github/workflows/blog-actu-auto.yml`** (cron 5×/jour + secrets `GEMINI_API_KEY`).

Sources : RSS journaux Cafeyn, MSN Edge, France Info Firefox — voir `data/blog-actu-feeds.json`.

Résumé agent manuel :
1. `npm run blog:actu:daily` — sélection intelligente (leadScore)
2. Enrichir `data/blog-actu-pending.json` (article long, CTA questionnaire)
3. `npm run blog:actu:publish`
4. PR + merge

Prompt automation quotidien : **`docs/CURSOR-DAILY-ACTU.md`**

## Blog evergreen (generation de leads)

Voir **`docs/BLOG-LEAD-ARTICLES.md`** pour le calendrier editorial hors actualite.

**Automatisation 2x/semaine** :
```bash
npm run blog:lead:auto              # 1 article evergreen
npm run blog:lead:auto -- --count=3 # jusqu'a 5
```
CI : **`.github/workflows/blog-lead-articles.yml`** (cron lundi + jeudi).

Backlog : `data/blog-lead-calendar.json` ; anti-doublons : `data/blog-lead-state.json`.

## Ciblage marché France

- Libs : `scripts/france-audience-lib.cjs` (scoring actu, `noindex` international), `scripts/france-brand.cjs` (meta + logo).
- Doc : **`docs/TRAFIC-FRANCE.md`**
- SEO/SEA (geo API, garde formulaires, `qualified_lead`) : **`docs/SEO-SEA-FRANCE-CIBLAGE.md`**
- Acquisition blog → conversion (0 € test, pub intelligente) : **`docs/ACQUISITION-BLOG-CONVERSION.md`** + `ads/meta-blog-conversions.csv`
- Corrélation analytics (GA4, Clarity, GSC, Meta, CRM) : **`docs/TRACKING-CORRELATION.md`**
- Clarity : tag `market_intent=FR` — filtrer le dashboard par pays France.
- Actu internationale existante : `noindex,follow` ; la pipeline auto ignore les nouveaux sujets US/gaming sans angle FR.

## Cursor Cloud

- Branches : `cursor/<nom>-3a54`
- Ne pas scraper Cafeyn (login) — RSS équivalents + `blog:actu:auto` + optionnel `blog/actu-inbox.html`
