# CRM Immobilier — inventaire, matching, documents

## Objectif

Module CRM pour piloter l’activité immobilière **sans scraper** Leboncoin / SeLoger / ParuVendu : saisie manuelle + URL d’annonce, liaison prospects, matching acquéreur ↔ biens, édition de documents.

Le **crédit immobilier** (prêt / courtage) est relié depuis les barèmes via deep link → landings `credit-immo` / `acheteur-immo` + collecte de pièces (`docs/FINANCEMENT-DEMANDE-PRET.md`).

## Pages

| Page | Rôle |
|------|------|
| `/landings/acheteur-immo.html` | **Vitrine publique** : casquettes acquéreur / vendeur / les deux, dépôt **manuel ou URL**, photos + description + capture, **chasse de mandat** sur secteur |
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
- `mandateMission` (défaut **vrai**) : mission « aller chercher le mandat » + secteur (voir ci-dessous)
- **Pas de scraping**

Catalogue : `js/immo-listing-portals-lib.js`.

## Chasse de mandat (recherche de bien)

Promesse publique : **l'acquéreur envoie un lien d'annonce, le négociateur va chercher le mandat**
auprès du vendeur, principalement sur sa localité territoriale.

Secteur : `js/immo-secteur-lib.js` (navigateur + Node) — seule source de vérité.

| Niveau | Règle | Conséquence |
|--------|-------|-------------|
| `coeur` | commune de la liste `CORE_CITIES` | déplacement direct |
| `territoire` | département `54` | prise en main, mandat visé |
| `proche` | départements limitrophes (`55`, `57`, `88`, `67`…) | déplacement à caler |
| `hors` | autre département | confrère local (apport d'affaires) |
| `inconnu` | ni ville ni CP | on redemande la localisation |

Éditer le secteur = éditer `CORE_CITIES` / `CORE_DEPARTMENTS` / `NEAR_DEPARTMENTS` dans la lib.
La landing lit le libellé via `secteurLabel()` (`[data-secteur-label]`) et affiche le verdict en
direct sous la case mission (`[data-secteur-feedback]`).

Côté CRM, chaque bien déposé enregistre :

- `metadata.mandate` = `{ requested, kind, label }` — `kind` : `chasse` (acquéreur), `vente` (vendeur), `vente_recherche` (double casquette)
- `metadata.secteur` = `{ level, short, department, canHunt, needsPartner }`
- `notes` : mission mandat + secteur + rappel « confrère local » si hors secteur
- `a_contacter` forcé à vrai quand on doit aller chercher le mandat
- `lead_score` : +10 en secteur (`coeur` / `territoire`), −10 hors secteur

Vérification : `npm run verify:mandat`.

## Documents (fondation)

Types : mandat vente / recherche, bon de visite, offre d’achat, compromis, diagnostics, honoraires.

Prochaines étapes possibles : templates HTML/PDF (comme devis assurance), Drive, e-signature.

## Hors scope volontaire

- Scraping / login portails
- Demande de prêt depuis barèmes (FAI/net/apport/durée préremplis) + checklist docs — `docs/FINANCEMENT-DEMANDE-PRET.md`
- Crédit immo CRM natif étendu (évolution possible au-delà des landings)
