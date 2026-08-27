# AGENTS.md — Leads Opportunities

## Scripts utiles

- `npm run blog:build` — régénère tous les articles blog
- `npm run meta:rotation:status` — semaine Meta active + CPL (1 €/jour)
- CRM **Gestion pubs** : `/crm-pubs.html` — liens Meta/Google/TikTok Ads Manager
- CRM **Origine leads** : `/crm-sources.html` — UTM, gclid, fbclid, ttclid
- `npm run blog:actu:fetch` — récupère candidats actu (RSS + queue)
- `npm run blog:actu:draft -- --top=2` — ébauches dans `data/blog-actu-pending.json`
- `npm run blog:actu:publish` — blog + sitemap SEO
- `npm run seo:build` — sitemaps
- `npm run academie:build` — régénère `/academie/` (cours métiers)
- `npm run build:clarity` — après modif `js/clarity-source.mjs`
- **Facturation électronique (01/09/2026)** : `/crm-e-invoicing.html` · Tiime pending ID + Make go-live `docs/MAKE-TIIME-GOLIVE.md` · `npm run verify:e-invoicing`

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

## Ciblage marché France

- Libs : `scripts/france-audience-lib.cjs` (scoring actu, `noindex` international), `scripts/france-brand.cjs` (meta + logo).
- **SEO prêt local 54 (IMPÉRATIF)** : `scripts/nancy-bassin-pret-lib.cjs` — Nancy, Jarville, Varangéville, communes métropole. Hub `/pret-immobilier/nancy-metropole/`. Vérif : `npm run verify:nancy-bassin-pret`. Toute page SEO prêt/crédit doit renvoyer vers le bassin nancéien. Orthographe : **Varangéville** uniquement (pas Varengeville).
- Doc : **`docs/TRAFIC-FRANCE.md`**, **`docs/GSC-SOLO-GUIDE.md`**
- Étude de marché (verticales, concurrence, reco 90 j) : **`docs/ETUDE-MARCHE-LEADS-OPPORTUNITIES.md`**
- Exécution priorités 90 j (Meta canicule, VTC IDF, tunnel immo) : **`docs/ACQUISITION-PRIORITES-90J.md`** · `npm run verify:acquisition-priorites`
- Niches + actu (incendies Gironde, eau, présidentielle, chasse, équitation) : **`docs/PLAN-VISIBILITE-NICHES.md`** · `npm run verify:niches-actu` · `npm run gsc:niches`
- Prêt immobilier refusé → solutions : `npm run verify:pret-refuse` · landing `/landings/credit-immo.html#pret-refuse`
- Search Console : `npm run verify:gsc` · URLs prioritaires : `npm run gsc:urls`
- SEO/SEA (geo API, garde formulaires, `qualified_lead`) : **`docs/SEO-SEA-FRANCE-CIBLAGE.md`**
- Acquisition blog → conversion (0 € test, pub intelligente) : **`docs/ACQUISITION-BLOG-CONVERSION.md`** + `ads/meta-blog-conversions.csv`
- Corrélation analytics (GA4, Clarity, GSC, Meta, CRM) : **`docs/TRACKING-CORRELATION.md`**
- Clarity : tag `market_intent=FR` — filtrer le dashboard par pays France.
- Actu internationale existante : `noindex,follow` ; la pipeline auto ignore les nouveaux sujets US/gaming sans angle FR.

## Cursor Cloud

- Branches : `cursor/<nom>-3a54`
- Ne pas scraper Cafeyn (login) — RSS équivalents + `blog:actu:auto` + optionnel `blog/actu-inbox.html`
- **Redeploy Vercel** : après merge CRM/messagerie, vérifier prod : `curl -sSL https://www.leadsopportunities.fr/js/dashboard-mailbox.js | wc -c` doit être **> 50000** (ancienne prod ≈ 46453). Sinon : Vercel Dashboard → **Redeploy** sur `main`, ou `VERCEL_DEPLOY_HOOK=<url> npm run deploy:trigger`.
- **Réponses questionnaires** : `dashboard.html?section=mailbox` → onglet **Questionnaires** ; aussi `dashboard.html?section=leads` (clic sur une ligne).
- **Neon** : `DATABASE_URL` sur Vercel ; `api/_lib/ensure-schema.js` ajoute les colonnes `site_leads` manquantes au premier appel API.
