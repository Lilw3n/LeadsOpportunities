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
- Pas d’annonces d’illustration : grille vide tant qu’aucun bien n’est collé (URL) ou saisi au CRM

Implémentation : `js/immo-public-listings-lib.js` + `api/_lib/routes/public-immo-listings.js`.

`POST /api/immo-listing-submit` — dépôt de bien (vendeur) ou URL collée (acquéreur).

- Rôle `acheteur` | `vendeur` | `les_deux` (vend et rachète)
- Saisie manuelle **sans URL** pour un vendeur (ville obligatoire)
- Détecte le portail si URL (Leboncoin, SeLoger, ParuVendu…)
- Parties CRM : vendeur (déposant ou infos collées) ; acquéreur si recherche / double casquette ; critères de rachat si `les_deux`
- `mandateHunt` : mission **aller chercher le mandat** (acquéreur uniquement)
- **Pas de scraping**

Catalogue : `js/immo-listing-portals-lib.js`.

## Recherche de bien & chasse au mandat

Un client envoie l'URL d'une annonce repérée ailleurs (Leboncoin, PAP, autre agence) : le négociateur
part à la recherche du bien, démarche le vendeur et va chercher le mandat. Secteur : `js/immo-secteur-lib.js`
(Node + navigateur).

| Zone | Règle | Mission CRM (`metadata.mandate.status`) |
|------|-------|-----------------------------------------|
| `coeur` | département **54** ou ville du cœur de secteur (Varangéville, Saint-Nicolas-de-Port, Dombasle, Nancy…) | `a_demarcher` |
| `proche` | reste du **Grand Est** (08, 10, 51, 52, 55, 57, 67, 68, 88) | `a_qualifier` |
| `hors` | autre département | `a_relayer` (confrère ; on garde prêt + assurances) |
| `inconnu` | ni ville ni code postal | — |

Effets côté API :

- `metadata.mandate` + `metadata.sector` sur le bien, note « Mission : aller chercher le mandat »
- `a_contacter` forcé (il faut joindre le vendeur), partie acquéreur annotée
- `lead_score` majoré (+15 cœur, +8 proche, +3 hors, plafond 95) ; payload `site_leads` : `mandateHunt`, `mandateStatus`, `sectorZone`
- Vendeur / double casquette : `mandateHunt` ignoré (il est déjà le mandant)

Côté public (`/landings/acheteur-immo.html`) : section `#mandat`, case « allez chercher le mandat »
dans le dépôt d'URL, badge de secteur en direct depuis la ville / le code postal, case
`mandateSearch` dans l'alerte acquéreur. Deep link : `?mandat=1#mandat` (need `mandat-immo`).

## Documents (fondation)

Types : mandat vente / recherche, bon de visite, offre d’achat, compromis, diagnostics, honoraires.

Prochaines étapes possibles : templates HTML/PDF (comme devis assurance), Drive, e-signature.

## Hors scope volontaire

- Scraping / login portails
- Demande de prêt depuis barèmes (FAI/net/apport/durée préremplis) + checklist docs — `docs/FINANCEMENT-DEMANDE-PRET.md`
- Crédit immo CRM natif étendu (évolution possible au-delà des landings)
