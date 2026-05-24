# Intelligence multi-contrats (cross-sell)

## Objectif

Quand un prospect arrive sur un vertical (ex. **auto**, **VTC**), le système propose au **courtier** les autres contrats à aborder et les **questions clés** (ex. « Combien payez-vous de mutuelle ? », « Crédit auto en cours ? »).

Les données sont stockées dans `site_leads.payload.crossSell` à chaque soumission.

## API

`POST /api/cross-sell` — body = réponses questionnaire (mêmes champs que `/api/lead`).

## Configuration

Éditer `data/cross-sell-matrix.json` : produits, affinités `from` → `to`, triggers, questions courtier.

## Champs questionnaire (VTC)

- `hasMutuelle`, `mutuelleMonthly`
- `hasCreditAuto`, `creditAutoMonthly`
- `hasHabitation`, `hasCompany`
- `interestedProducts` (multi-select)

## Affichage

- **Dashboard** : détail lead → bloc « Multi-contrats — opportunités »
- **Landing VTC** : panneau interne si `?preview=1` ou compte admin connecté
