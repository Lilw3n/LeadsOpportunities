# AGENTS.md — Leads Opportunities

## Scripts utiles

- `npm run blog:build` — régénère tous les articles blog
- `npm run blog:actu:fetch` — récupère candidats actu (RSS + queue)
- `npm run blog:actu:draft -- --top=2` — ébauches dans `data/blog-actu-pending.json`
- `npm run blog:actu:publish` — blog + sitemap SEO
- `npm run seo:build` — sitemaps
- `npm run build:clarity` — après modif `js/clarity-source.mjs`

## Blog actu (leads qualifiés)

Voir **`docs/BLOG-ACTU-AUTOMATION.md`** pour le pipeline complet (Cafeyn, Edge, automation Cursor).

Résumé agent :
1. `npm run blog:actu:daily` — sélection intelligente (leadScore)
2. Enrichir `data/blog-actu-pending.json` (article long, CTA questionnaire)
3. `npm run blog:actu:publish`
4. PR + merge

Prompt automation quotidien : **`docs/CURSOR-DAILY-ACTU.md`**

## Cursor Cloud

- Branches : `cursor/<nom>-3a54`
- Ne pas scraper Cafeyn (login) — utiliser `data/blog-actu-queue.json` ou `blog/actu-inbox.html`
