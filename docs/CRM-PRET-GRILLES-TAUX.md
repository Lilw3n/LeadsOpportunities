# Grilles des taux — documentation intelligente

Module CRM pour cataloguer les grilles partenaires (PDF/XLS) et les retrouver via un **moteur de recherche métier**.

## Accès
- Page : [`crm-pret-immo-grilles.html`](../crm-pret-immo-grilles.html)
- Catalogue : [`data/pret-grilles-taux.json`](../data/pret-grilles-taux.json)
- Moteur : [`js/crm-pret-grilles-lib.js`](../js/crm-pret-grilles-lib.js)
- Fichiers à déposer : `docs/pret-grilles/<categorie>/`

## Objectif
Répondre à des questions du type :
- « Personne de plus de 60 ans, est-elle éligible à un RAC ? »
- « RAC sans garantie / locataire »
- « SCPI nantissement en SCI »
- « RAC Réunion avec garantie »

Le moteur :
1. **parse** la requête (âge, besoins, région, bien oui/non) ;
2. **active** des règles d’éligibilité (`eligibilityRules`, statut `draft`) ;
3. **score** les documents du catalogue (catégorie, partenaire, tags, flags).

## Catégories
| id | Libellé |
|----|---------|
| `rac` | Regroupement de crédits (+ DOM-TOM) |
| `immo` | Crédit immobilier |
| `sci` | SCI |
| `scpi` | SCPI |
| `hypo_treso` | Prêt hypothécaire de trésorerie |
| `treso` | Trésorerie & prêt personnel |
| `renov` | Crédit rénovation |
| `relais` | Prêt relais |
| `pvh` | Prêt viager hypothécaire |

## Comment ajouter un document (quand vous l’envoyez)

1. Déposer le fichier dans `docs/pret-grilles/<categorie>/`  
   Ex. `docs/pret-grilles/rac/07-2026-cfcal-avec-garantie.pdf`
2. Dans `data/pret-grilles-taux.json`, trouver l’entrée (ou en créer une) et renseigner :
   ```json
   "status": "available",
   "path": "./docs/pret-grilles/rac/07-2026-cfcal-avec-garantie.pdf"
   ```
3. Compléter les **critères extraits** dans la règle ou dans `notes` / tags :
   - âge max en fin de prêt
   - LTV / ratio hypo
   - montant min/max
   - avec / sans garantie
   - région
4. Passer `confidence` de la règle de `draft` → `validated` une fois relu.

### Schéma document
```json
{
  "id": "rac-cfcal-avec",
  "category": "rac",
  "partner": "cfcal",
  "title": "CFCAL RAC avec garantie",
  "filename": "07 2026 CFCAL avec garantie.pdf",
  "kind": "grille",
  "period": "2026-07",
  "region": "metropole",
  "tags": ["rac", "avec_garantie", "hypo"],
  "status": "pending_upload",
  "path": "",
  "flags": [],
  "notes": ""
}
```

### Schéma règle d’éligibilité
```json
{
  "id": "rac-senior-60",
  "label": "RAC — emprunteur 60 ans et +",
  "when": { "ageMin": 60, "needAny": ["rac"] },
  "preferCategories": ["rac", "pvh"],
  "preferTags": ["avec_garantie", "senior"],
  "advice": "…",
  "confidence": "draft",
  "todoValidate": ["âge max fin de prêt par banque"]
}
```

## Exemples de recherche
| Requête | Effet attendu |
|---------|----------------|
| `personne de plus de 60 ans éligible RAC` | Règle senior + grilles RAC/HYPO/PVH |
| `RAC sans garantie locataire` | Tags `sans_garantie` / conso |
| `financement SCPI nantissement` | Grilles SCPI CFCAL / Credit Lift |
| `RAC Réunion avec garantie` | Région `reunion` + tag garantie |

## Limites (volontaires)
- Pas d’extraction automatique OCR des PDF (pour l’instant) : vous envoyez les fichiers, on enrichit le JSON.
- Aucun taux chiffré inventé : seuls les **noms de fichiers / partenaires** issus de vos écrans sont catalogués.
- Les conseils restent **draft** jusqu’à validation humaine après lecture des grilles.
