## Tracking plan (GA4/GTM compatible)

## 1) Evenements obligatoires
- `ab_variant_seen`
  - params: `variant`, `page`
- `cta_click`
  - params: `variant`, `label`, `page`
- `form_start`
  - params: `variant`, `page`
- `form_submit`
  - params: `variant`, `page`, `vertical`
- `phone_click`
  - params: `variant`, `page`, `vertical`
- `whatsapp_click`
  - params: `variant`, `page`, `vertical`

## 2) Conversions a remonter
- Primaire: `form_submit`
- Secondaires: `phone_click`, `whatsapp_click`

## 3) Naming conventions
- Verticales:
  - `vtc`
  - `sante`
  - `credit_immo`
- Source/canal:
  - `seo`
  - `local`
  - `sea`
  - `retargeting`

## 4) UTM standard
- `utm_source`: google, meta, linkedin, partner
- `utm_medium`: cpc, organic, referral, retargeting
- `utm_campaign`: verticale_objectif_periode
- `utm_content`: variant_crea_message

## 5) Controle qualite hebdo
- Tester tous les events sur les 3 landings.
- Verifier coherence params (`vertical`, `variant`).
- Verifier conversion principale remontee dans analytics.
