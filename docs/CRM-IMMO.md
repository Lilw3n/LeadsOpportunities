# CRM Immobilier — inventaire, matching, documents

## Objectif

Module CRM pour piloter l’activité immobilière **sans scraper** Leboncoin / SeLoger / ParuVendu : saisie manuelle + URL d’annonce, liaison prospects, matching acquéreur ↔ biens, édition de documents.

Le **crédit immobilier** (prêt / courtage) est relié depuis les barèmes via deep link → landings `credit-immo` / `acheteur-immo` + collecte de pièces (`docs/FINANCEMENT-DEMANDE-PRET.md`).

## Pages

| Page | Rôle |
|------|------|
| `/landings/acheteur-immo.html` | **Vitrine publique** : filtres + cartes d’annonces (mandats matchables) puis alerte / dossier |
| `/crm-immo-properties.html` | **Piges** : panneau filtres (Recherche / Où / Qui / Quoi / Quand) + barre d’actions (SMS, suivi, affecter, export, print) |
| `/crm-immo-property.html?id=` | **Fiche intelligente** : sections conditionnelles + composition unités + pièces |
| `/crm-immo-matching.html` | Critères acquéreur + score vs biens actifs |
| `/crm-immo-documents.html` | Éditeur mandats / offres / compromis (fondation) |
| `/crm-agency-fees.html` | Barèmes honoraires + financement acheteur |

Sidebar : groupe **Immobilier**.

## Matching (score 0–100)

Critères scorés :

- type de bien
- géographie (ville, CP, département, rayon km si lat/lng)
- surface min/max
- pièces / chambres
- budget FAI ou net vendeur
- dépendances (garage, parking, cave, jardin, terrasse, balcon, ascenseur, piscine)

Implémentation : `js/crm-immo-matcher.js` (navigateur + Node).

## Données

- **Local** : `localStorage` clé `lo_crm_immo_v1` (fonctionne immédiatement)
- **Neon** : tables `crm_immo_*` (`database/crm-immo-properties.sql`) via `/api/crm/immo`
- Sync : le store tente l’API puis retombe en local

## API

`GET/POST/DELETE /api/crm/immo`

- `entity=all|property|criteria|party|document|match`
- Auth CRM (`requireCrm`)

`GET /api/immo-listings` — **public**, sans authentification.

- Mandats au statut matchable uniquement (prospection, estimation, mandat, sous offre, réservé SRU)
- Champs publics : titre, type, ville, CP, pièces, surface, prix FAI, DPE, tags (garage, jardin…)
- **Jamais** : notes, e-mail, téléphone, adresse précise, contacts vendeur
- Si aucun mandat : annonces d’illustration (`source: "demo"`)

Implémentation : `js/immo-public-listings-lib.js` + `api/_lib/routes/public-immo-listings.js`.

`questionnaire.html?need=acheteur-immo` redirige vers la vitrine (sauf `?wizard=1`).

## Documents (fondation)

Types : mandat vente / recherche, bon de visite, offre d’achat, compromis, diagnostics, honoraires.

Prochaines étapes possibles : templates HTML/PDF (comme devis assurance), Drive, e-signature.

## Hors scope volontaire

- Scraping / login portails
- Demande de prêt depuis barèmes (FAI/net/apport/durée préremplis) + checklist docs — `docs/FINANCEMENT-DEMANDE-PRET.md`
- Crédit immo CRM natif étendu (évolution possible au-delà des landings)
