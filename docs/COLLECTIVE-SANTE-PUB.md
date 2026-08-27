# Santé collective — blog, SEO, pubs

Pack **mutuelle / assurance santé collective** (B2B employeur, ANI, PME/TPE).

## Conversion (déjà en place)

| Élément | URL |
|--------|-----|
| Landing | `/landings/sante-collective.html` |
| Express | `/landings/devis-express.html?need=collective` |
| Questionnaire | `/landings/questionnaire.html?need=collective` |

## SEO

| Élément | URL |
|--------|-----|
| Pilier | `/assurance-sante-collective/` |
| ANI | `/assurance-sante-collective/ani/` |
| PME | `/assurance-sante-collective/pme/` |
| DUE | `/assurance-sante-collective/due/` |
| Panier | `/assurance-sante-collective/panier-de-soins/` |

Génération : `scripts/niche-collective-pages.cjs` → `npm run seo:build`.

## Blog (8 articles)

Source : `scripts/blog-collective-articles.cjs` → `npm run blog:build`.

Pilier : `/blog/mutuelle-collective-entreprise-guide-2026.html`

## Google Ads

- Fichier : `ads/google-collective-search.csv`
- Config : `config/google-campaign-collective.json` (**ready / active**)
- Campagne : `FR_Search_Collective_HotIntent`
- Import aussi dans `ads/google-ads-editor-ready-utm.csv`
- Landing principale : `sante-collective.html`
- Budget départ : **5 €/jour**

Négatifs utiles : `gratuit`, `particulier`, `senior` (évite le trafic mutuelle individuelle).

### Activer Google (2 min)
1. Ouvre [Google Ads](https://ads.google.com/aw/campaigns)
2. Ads Editor → Importer `ads/google-collective-search.csv`
3. Publier la campagne `FR_Search_Collective_HotIntent`

## Meta

- Fichier priorité : `ads/meta-collective-priorite.csv` (**1 €/jour**)
- Config : `config/meta-campaign-collective.json`
- Blog bridges : lignes `collective_*` dans `ads/meta-blog-conversions.csv`
- Statut terminal : `npm run meta:collective`

### Activer Meta (2 min)
1. Ouvre [Ads Manager](https://www.facebook.com/adsmanager/manage/campaigns?act=997768686183548)
2. Nouvelle campagne → Conversions / Lead → budget **1 €/jour**
3. URL : `https://www.leadsopportunities.fr/landings/sante-collective.html?utm_source=meta&utm_medium=paid_social&utm_campaign=collective_direct_convert`
4. Copier headline + texte depuis `npm run meta:collective` (ou le CSV)
5. Ciblage : 28–60 ans, France, intérêts PME / RH / entrepreneuriat

Aussi visible dans CRM : `/crm-pubs.html`

## Vérif

```bash
npm run verify:collective
npm run niche:sync
npm run blog:build
npm run seo:build
```

## Différence avec mutuelle individuelle

| | Individuelle (`sante`) | Collective |
|--|----------------------|------------|
| Acheteur | Particulier / famille | Employeur |
| Landing | `/landings/sante.html` | `/landings/sante-collective.html` |
| SEO | `/assurance-sante/` | `/assurance-sante-collective/` |
| Intent | Remboursement, canicule | ANI, DUE, budget PME |
