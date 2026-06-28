# Ciblage France — SEO, SEA et ROI

Guide pour réduire le trafic hors France et optimiser les campagnes Google Ads / Meta.

## Problème

Des visites depuis d'autres pays génèrent du trafic sans conversion (courtier ORIAS = France + DOM-TOM uniquement).

## Ce que le site fait maintenant (code)

| Mécanisme | Effet |
|-----------|--------|
| `GET /api/geo-hint` | Détecte le pays via en-têtes Vercel (`x-vercel-ip-country`) |
| `js/geo-france-guard.js` | Bannière + blocage formulaires pour visiteurs hors France |
| `POST /api/lead` | Refuse les leads si pays ≠ France/DOM-TOM |
| Meta `hreflang`, `og:locale`, `geo.region` | Signaux SEO « site français » |
| Conversion `qualified_lead` (score ≥ 50) | Optimisation Google Ads sur leads qualifiés, pas seulement les clics |
| Consent Mode v2 | Meilleure modélisation conversions en France (CNIL) |

## Actions Google Ads (interface — obligatoire)

1. **Emplacements** : cibler **France** uniquement.
2. **Exclusions** : exclure tous les pays sauf France (ou « Présence : personnes en France »).
3. **Langue** : **Français** (pas « toutes les langues »).
4. **Conversions** :
   - Principale : soumission formulaire (`GOOGLE_ADS_CONVERSION_LEAD`)
   - Secondaire : lead qualifié score ≥ 50 (`GOOGLE_ADS_CONVERSION_QUALIFIED_LEAD`)
5. **Enchères** : après ~30 conversions/mois → **CPA cible** sur la conversion qualifiée.
6. **Mots-clés négatifs** : `english`, `usa`, `uk`, `india`, `jobs`, `salary`, `free download`, etc.

Variables Vercel à renseigner (voir `.env.example`) :

```
GOOGLE_ADS_ID=AW-...
GOOGLE_ADS_CONVERSION_LEAD=AW-.../...
GOOGLE_ADS_CONVERSION_QUALIFIED_LEAD=AW-.../...
GOOGLE_ADS_CONVERSION_PHONE=AW-.../...
```

## Actions Meta Ads

1. **Emplacements** : France uniquement.
2. **Langue** : Français.
3. Renseigner `META_PIXEL_ID` + `META_CAPI_TOKEN` sur Vercel.
4. Lead Ads natifs : webhook `POST /api/webhooks/meta-lead` — voir **`docs/META-ADS-AUTOMATION.md`**.
5. Exclure audiences Lookalike hors France.

## Search Console / SEO

1. Propriété `https://www.leadsopportunities.fr/` — pays cible **France** dans les paramètres internationaux.
2. Sitemap : `https://www.leadsopportunities.fr/sitemap.xml`
3. Après déploiement des changements SEO pages locales : `npm run seo:build` puis redeploy.

## Mesure dans GA4

Créer une exploration avec :

- Dimension : `visitor_country` (événement `audience_geo_check`)
- Filtre : `in_france_audience = no`
- Comparer avec conversions `generate_lead` / `qualified_lead`

## Fichiers CSV campagnes

Importer depuis `ads/google-ads-editor-ready-utm.csv` — campagnes préfixées `FR_Search_*`.
