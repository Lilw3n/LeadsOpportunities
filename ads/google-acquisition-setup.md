## Connexion acquisition Google (checklist)

## 1) Renseigner les IDs Google
Dans `google-config.js`, remplace:
- `G-XXXXXXXXXX` par ton ID GA4
- `AW-XXXXXXXXXX` par ton ID Google Ads
- les IDs conversion:
  - `adsLeadConversionId`
  - `adsPhoneConversionId`
  - `adsWhatsappConversionId`

Format attendu: `AW-XXXXXXXXXX/abcDEFgHijK`.

## 2) Evenements deja envoyes
- Landings:
  - `form_submit` (conversion lead)
  - `phone_click` (conversion appel)
  - `whatsapp_click` (conversion WhatsApp)
  - `ab_variant_seen`, `form_start`, `cta_click`
- Homepage:
  - `generate_lead` sur formulaire contact

## 3) Parametres marketing transmis
Les params suivants sont captures et envoyes:
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `gclid`

## 4) Verification rapide
1. Ouvrir une landing avec UTM:
   - `?utm_source=google&utm_medium=cpc&utm_campaign=test&utm_content=ad1`
2. Soumettre formulaire / cliquer appel / WhatsApp
3. Controler dans:
   - Google Tag Assistant
   - DebugView GA4
   - Conversions Google Ads

## 5) Prochaine etape recommandee
- Lier Google Ads <-> GA4
- Importer conversions GA4 vers Ads
- Activer enchere `Maximiser les conversions` puis `CPA cible` apres volume suffisant
