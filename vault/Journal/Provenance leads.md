---
generated: false
tags:
  - journal
  - leads
---

# Provenance des leads

Note manuelle. `npm run vault:seo` ne l’écrase pas.

Constat du 16 octobre 2026. La base Neon n’était pas lisible depuis l’agent (pas de `DATABASE_URL` ici, accès Vercel non ouvert). Les noms et les comptes réels se lisent une fois connecté au CRM.

## Ce qui n’est pas un lead entrant

- **Saisie CRM** : `source` vaut `crm`, commence par `crm_` ou par `crm-` (`crm_create_complete`, `crm_staff_upload`, `crm-agenda`…). C’est une fiche tapée à la main.
- **Test Meta** : IP en `57.141…` (plage Facebook / Meta, preview pub). Même avec un `fbclid`, ce n’est pas un prospect. Ne pas bloquer cette plage.

## Leads que vous n’avez pas créés

Page CRM **Origine des leads** : `/crm-sources.html`, bloc « Leads que vous n’avez pas saisis ». Le compte porte sur 7, 30 ou 90 jours, toute la base.

| Origine | Signe |
| --- | --- |
| Pub Meta | `meta_lead_ads` ou `fbclid`, IP hors 57.141 |
| Pub Google | `gclid` ou `msclkid` |
| Pub TikTok | `ttclid` |
| Assurance VTC France | plateforme ou source `assurancevtcfrance` |
| Withallo | source ou plateforme `withallo` |
| Formulaire du site | le reste (landing, accueil, rappel) |

Dans le tableau de bord, filtre **Origine → Entrants**. Ce filtre ne s’applique qu’à la page affichée (250 lignes max). Pour le total de la période, rester sur `/crm-sources.html`.

La colonne et la fiche affichent le libellé (Pub Meta, Formulaire du site, etc.). Le survol de la cellule garde `source`, `utm_source` et `utm_campaign`.

## Ce qui peut rapporter

Sur `/dashboard.html?section=leads`, le bloc **Clients à rappeler** ne garde qu’un mobile ou un fixe français laissé dans un questionnaire. Le 06 51 36 62 22 du cabinet, les exemples (`06 12 34 56 78`) et les indicatifs hors France n’y figurent pas. L’ordre est VTC, mutuelle, professionnel, emprunteur, prêt. Le bouton note l’appel (`contacted`). Le prix reste chez le grossiste.

Sur `/blog/`, quatre devis sont en tête : VTC, mutuelle, commerce, prêt.
