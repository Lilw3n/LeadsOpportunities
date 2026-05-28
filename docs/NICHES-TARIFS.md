# Tarifs indicatifs niches — comment les modifier

## Fichier principal (assurance animaux)

`data/niche-tariffs-animaux.json`

### Tarifs plancher par formule

Chaque formule a :

- `minMonthlyChien` — prix de base mensuel chien (ex. 3,90 pour Accident)
- `minMonthlyChat` — prix de base mensuel chat

**Exemple** : pour afficher 19,35 € sur la carte vitrine labrador :

```json
"teasers": [
  {
    "petType": "chien",
    "title": "Assurance Chien",
    "subtitle": "Pour un labrador de 5 ans",
    "formulaId": "zen70",
    "overrideFrom": 19.35
  }
]
```

Sans `overrideFrom`, le prix est **calculé** à partir des min + âge + options.

### Modificateurs

- `modifiers.franchiseNone.monthlyAdd` — supplément si sans franchise
- `modifiers.prevention` — supplément mensuel par pack prévention
- `modifiers.fraction` — facteur trimestriel / annuel
- `ageFactors` — coefficient selon tranche d’âge
- `multiPetDiscountPercent` — réduction 2e animal (défaut 20 %)

### Formules disponibles

| ID | Nom |
|----|-----|
| accident | Formule Accident |
| hospi | Formule Hospi |
| zen50 | Formule Zen 50 |
| zen70 | Formule Zen 70 |
| zen80 | Formule Zen 80 (recommandée) |
| zen100 | Formule Zen 100 |

## Parcours utilisateur

1. **Vos animaux** — chien/chat, race, âge, date d’effet, multi-animaux  
2. **Votre tarif** — tableau comparatif + franchise / prévention / fractionnement  
3. **Coordonnées** — envoi lead CRM avec `petMonthlyIndicative`, `petFormula`, `petsJson`

Landing : `/landings/animaux.html`  
Config : `js/pet-journey.js`

## Prochaines niches

Dupliquer le modèle :

1. `data/niche-tariffs-<niche>.json`
2. `js/<niche>-journey.js` (ou généraliser `js/niche-journey.js`)
3. Landing dédiée
