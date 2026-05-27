# Tracking SEO/SEA — Leads Opportunities

## Objectif

Tous les leads payants doivent remonter avec :

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `visitor_id`
- `landing_slug`
- `seo_city`
- `seo_product`

Le tracking est lu par `js/attribution.js`, puis envoyé avec le lead via `api/lead.js`.

## Variables Vercel

### Google Ads

- `GOOGLE_ADS_ID`
- `GOOGLE_ADS_CONVERSION_LEAD`
- `GOOGLE_ADS_CONVERSION_PHONE`
- `GOOGLE_ADS_CONVERSION_WHATSAPP`

### Social ads

- `META_PIXEL_ID`
- `TIKTOK_PIXEL_ID`
- `PINTEREST_TAG_ID`

Ces valeurs sont injectées par `api/google-config-env`, puis utilisées par `google-config.js` et `landings/tracking.js`.

## Format UTM recommandé

### Google Ads

```text
utm_source=google
utm_medium=cpc
utm_campaign=vtc-paris-leads
utm_content=annonce-1
```

### Instagram / Facebook

```text
utm_source=meta
utm_medium=paid_social
utm_campaign=mutuelle-famille-antilles
utm_content=video-1
```

### TikTok

```text
utm_source=tiktok
utm_medium=paid_social
utm_campaign=vtc-jeunes-chauffeurs
utm_content=short-1
```

### Pinterest

```text
utm_source=pinterest
utm_medium=paid_social
utm_campaign=guide-assurance-habitation
utm_content=infographie-1
```

## Campagnes prioritaires

1. VTC / taxi : landing `landings/vtc.html`
2. Mutuelle santé : landing `landings/sante.html`
3. Crédit immobilier : landing `landings/credit-immo.html`
4. Assurance auto/habitation/prévoyance : landing `landings/devis.html?need=...`

## Test rapide

Ouvrir une landing avec UTM, par exemple :

```text
https://www.leadsopportunities.fr/landings/sante.html?utm_source=meta&utm_medium=paid_social&utm_campaign=test-leads&utm_content=test-1
```

Puis remplir un formulaire test et vérifier dans le dashboard :

- source / medium / campaign
- `visitor_id`
- `seo_city` si page SEO ville
- `lead_touchpoints`
