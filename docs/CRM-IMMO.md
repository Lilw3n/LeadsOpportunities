# CRM Immobilier — inventaire, matching, documents

## Objectif

Module CRM pour piloter l’activité immobilière **sans scraper** Leboncoin / SeLoger / ParuVendu : saisie manuelle + URL d’annonce, liaison prospects, matching acquéreur ↔ biens, édition de documents.

Le **crédit immobilier** (prêt / courtage) est relié depuis les barèmes via deep link → landings `credit-immo` / `acheteur-immo` + collecte de pièces (`docs/FINANCEMENT-DEMANDE-PRET.md`).

## Pages

| Page | Rôle |
|------|------|
| `/landings/acheteur-immo.html` | **Vitrine publique** : casquettes acquéreur / vendeur / les deux, dépôt **manuel ou URL**, photos + description + capture |
| `/crm-immo-properties.html` | **Piges** : panneau filtres (Recherche / Où / Qui / Quoi / Quand) + barre d’actions (SMS, suivi, affecter, export, print) |
| `/crm-immo-property.html?id=` | **Fiche intelligente** : sections conditionnelles + composition unités + pièces |
| `/crm-immo-matching.html` | Critères acquéreur + score vs biens actifs |
| `/crm-immo-documents.html` | Éditeur mandats / offres / compromis (fondation) |
| `/crm-agency-fees.html` | Barèmes honoraires + financement acheteur |
| `/crm-relations.html` | **Relations & parrainage** : famille, SCI, héritiers, apporteurs |

Sidebar : groupe **Immobilier** + **Clients & dossiers** (relations).

## Relations entre personnes

On suit les **liens** (pas des promesses) :

- **Famille** : conjoint, Pacs, union libre, enfants, parents, fratrie, ex-conjoint + **statut matrimonial** sur la fiche
- **Patrimoine** : héritiers (succession)
- **Société** : associés SCI / indivision
- **Parrainage** = **apporteur d’affaires** (filleul → apporteur)

**Règle** : *Aucun engagement de rémunération n’est promis aux apporteurs d’affaires.*  
Pas de % / cadeau / « vous recevrez » sur le lien, ni sur les landings publiques. Un % d’apporteur n’existe que dans le calculateur d’honoraires **si un accord est déjà saisi sur le dossier**.

API : `GET/POST/DELETE /api/crm/relations`  
Tables : `crm_contact_relationships` + colonnes `share_pct`, `legal_form`, `capacity`, `entity_name` sur `crm_immo_parties`.

## Multi-propriétaires / parts

Sur la fiche bien, onglet **Personnes & parts** :

- plusieurs propriétaires, héritiers, usufruit / nue-propriété, associés SCI
- quote-part % (alerte si le total des rôles propriétaires ≠ 100 %)
- forme juridique (personne physique, SCI, indivision)

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

- **Local** : `localStorage` clés `lo_crm_immo_v1` (biens) et `lo_crm_relations_v1` (liens personnes)
- **Neon** : tables `crm_immo_*` (`database/crm-immo-properties.sql`) + `crm_contact_relationships` (`database/crm-contact-relationships.sql`) via `/api/crm/immo` et `/api/crm/relations`
- Sync : le store tente l’API puis retombe en local

## API

`GET/POST/DELETE /api/crm/immo`

- `entity=all|property|criteria|party|document|match`
- Auth CRM (`requireCrm`)

`GET /api/immo-listings` — **public**, sans authentification.

- Mandats au statut matchable uniquement (prospection, estimation, mandat, sous offre, réservé SRU)
- Champs publics : titre, type, ville, CP, pièces, surface, prix FAI, DPE, tags (garage, jardin…)
- **Jamais** : notes, e-mail, téléphone, adresse précise, contacts vendeur
- Pas d’annonces d’illustration : grille vide tant qu’aucun bien n’est collé (URL) ou saisi au CRM

Implémentation : `js/immo-public-listings-lib.js` + `api/_lib/routes/public-immo-listings.js`.

`POST /api/immo-listing-submit` — dépôt de bien (vendeur) ou URL collée (acquéreur).

- Rôle `acheteur` | `vendeur` | `les_deux` (vend et rachète)
- Saisie manuelle **sans URL** pour un vendeur (ville obligatoire)
- Détecte le portail si URL (Leboncoin, SeLoger, ParuVendu…)
- Parties CRM : vendeur (déposant ou infos collées) ; acquéreur si recherche / double casquette ; critères de rachat si `les_deux`
- **Pas de scraping**

Catalogue : `js/immo-listing-portals-lib.js`.

## Documents (fondation)

Types : mandat vente / recherche, bon de visite, offre d’achat, compromis, diagnostics, honoraires.

Prochaines étapes possibles : templates HTML/PDF (comme devis assurance), Drive, e-signature.

## Hors scope volontaire

- Scraping / login portails
- Demande de prêt depuis barèmes (FAI/net/apport/durée préremplis) + checklist docs — `docs/FINANCEMENT-DEMANDE-PRET.md`
- Crédit immo CRM natif étendu (évolution possible au-delà des landings)
