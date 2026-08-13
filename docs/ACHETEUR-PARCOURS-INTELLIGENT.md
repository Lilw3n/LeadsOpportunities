# Parcours acquéreur intelligent

Objectif : **conditionner** le visiteur pour collecter les données utiles métier :

1. **Bien recherché** → matching / visites (type, surface, pièces, secteur, budget max, dépendances)
2. **Prêt / budget** → faisabilité + filtre des biens visitables
3. **Assurance emprunteur (ADE)** → liée automatiquement si prêt coché
4. Habitation / PNO / locataire → seulement si sélectionnés

## Landing

[`landings/acheteur-immo.html`](../landings/acheteur-immo.html) + [`js/acheteur-immo-wizard.js`](../js/acheteur-immo-wizard.js)

- Cases **prêt** + **emprunteur** précochées
- Bannière « parcours intelligent » dynamique
- `buyerNeeds` envoyé en **tableau** (`tracking.js` / `quote-intelligence.js`)
- Types de bien alignés matcher (`appartement`, `maison`…)

## CRM matching

[`js/crm-immo-lead-to-criteria.js`](../js/crm-immo-lead-to-criteria.js) mappe le payload lead → fiche critères.

Sur [`crm-immo-matching.html`](../crm-immo-matching.html) :

1. Coller l’id lead (ou `?leadId=`)
2. **Importer critères depuis ce lead**
3. Enregistrer → lancer le matching
4. Lien optionnel **simulation prêt préremplie**

URL : `/crm-immo-matching.html?leadId=<id>`

## Accès épuré (visiteurs informés)

[`js/acheteur-parcours-focus.js`](../js/acheteur-parcours-focus.js) + [`css/acheteur-parcours-focus.css`](../css/acheteur-parcours-focus.css)

Mode **focus** activé si :

- `#demande` dans l’URL
- `propertyPrice`, `apport`, `revenus`… (deep link CRM / barèmes)
- `utm_source=negociateur` ou source CRM

Effets : hero minimal, partenaires / FAQ masqués, bannière récap des infos préremplies, scroll direct vers le formulaire.

Entrées directes : hub [`immobilier/`](../immobilier/), [`landings/`](../landings/), lien négociateur avec `#demande`.
