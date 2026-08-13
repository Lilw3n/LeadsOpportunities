# Consentement appel téléphone (opt-in) — loi 11/08/2026

## Objectif

Recueillir un **consentement explicite** sur le site pour autoriser un rappel / une prospection téléphonique commerciale, conformément au cadre FR (opt-in depuis le 11 août 2026).  
Ce n’est **pas** un contournement : c’est le mode légal prévu (consentement préalable).

> Outil technique — ne remplace pas un avis juridique.

## Règles appliquées dans le produit

| Exigence | Implémentation |
|----------|----------------|
| Acte positif clair | Case `phone_consent` dédiée, **non précochée** |
| Spécifique | Texte indiquant les services (besoin / vertical) |
| Durée ≤ 12 mois | `phone_consent_expires_at` = +12 mois, sans tacite |
| Preuve | Texte versionné + date + URL + IP serveur |
| Retrait | Mention + ancre `#prospection-telephonique` dans la politique |

Case **traitement** (`rgpd`) séparée de l’opt-in **appel** (`phone_consent`).

## Fichiers clés

- `js/phone-consent.js` — texte versionné `phone_optin_v1_2026-08`, HTML, enrichissement payload, `data-phone-consent-mount`
- `api/_lib/phone-consent.js` — normalisation serveur
- `api/_lib/routes/public-lead.js` — preuve dans payload + colonnes Neon ; **400** si rappel sans opt-in
- `api/_lib/ensure-schema.js` — colonnes `phone_consent*`
- CRM : `js/crm-lead-payload-view.js` → bloc « Preuve consentement téléphone »

## Parcours couverts

Accueil, nos-services, rappel / callback, questionnaire & devis, landings VTC / santé / crédit / acheteur, express.

## CRM

Sur la fiche lead : badge **Opt-in appel OK** ou **Pas d’opt-in appel**, avec date, expiration, version, page, IP et texte exact.

## Limites

- Meta Lead Ads : pas d’opt-in site natif — ne pas appeler sans preuve équivalente du formulaire Meta.
- Les leads anciens sans `phone_consent` ne doivent pas être démarchés par téléphone à froid.
