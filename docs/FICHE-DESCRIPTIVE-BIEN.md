# Fiche descriptive du bien (PDF éditable)

Page : [`/landings/fiche-descriptive-bien.html`](../landings/fiche-descriptive-bien.html)

## Objectif

Produire une **fiche descriptive du bien** présentable, alignée sur le questionnaire vendeur (Laforêt) et la fiche CRM intelligente, puis l’**éditer** et l’**exporter en PDF** via le navigateur (`Imprimer` → `Enregistrer au format PDF`).

Le fichier PDF source fourni localement (`fiche_descriptive_du_bien.pdf`) n’est pas versionné : le modèle HTML/PDF du site reprend les rubriques standard d’une fiche descriptive française (identification, prix, surfaces, descriptif, copro, DPE, propriétaires).

## Parcours

1. **Questionnaire** (`/landings/acheteur-immo.html?role=vendeur`)  
   - `Fiche descriptive PDF` → aperçu immédiat  
   - `Éditer fiche PDF` → transfert des champs `sell*` vers l’éditeur
2. **Éditeur** — brouillons dans `localStorage` (`lo_fiche_descriptive_drafts_v1`)
3. **CRM** (`/crm-immo-property.html`) — `Imprimer / PDF` (fiche riche) + `Éditer fiche PDF`

## Code

- `js/fiche-descriptive-bien-lib.js` — mapping form / CRM → sections PDF
- `js/fiche-descriptive-bien-page.js` — UI éditeur
- `js/acheteur-immo-fiche-descriptive.js` — pont questionnaire
- `js/print-document-lib.js` — `fromProperty` délègue à la fiche descriptive si dispo

## Vérif

```bash
npm run verify:fiche-descriptive
```
