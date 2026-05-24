# Tarifs indicatifs et suivi funnel

## Migration

Exécuter sur Neon (après `site_leads-acquisition.sql`) :

```bash
psql $DATABASE_URL -f database/tariff-funnel.sql
```

## APIs

| Route | Usage |
|-------|--------|
| `POST /api/tariff-quote` | Devis indicatif interne (à partir des réponses questionnaire) |
| `POST /api/eligibility-check` | Blocages / alertes / partenaires éligibles |
| `POST /api/lead-progress` | Sauvegarde étape, abandon, brouillon |

## Catalogue

Fichier `data/tariff-catalog.json` — bases annuelles, garanties, modificateurs (bonus, sinistres, âge), règles métier.

Exemple : **âge > 75 ans** → blocage devis auto VTC (`AGE_75_PLUS`). Entre 70 et 75 → alerte + surprime indicative.

## Parcours

- **Express** : `landings/devis-rapide.html` (`journey=quick`)
- **Complet** : `landings/vtc.html` (6 étapes, contrôle éligibilité à l’étape conducteur)

## Dashboard

Les champs `eligibility`, `tariffQuote` et `funnel` sont stockés dans `site_leads.payload` à la soumission finale.

Analyse abandons : requêtes sur `lead_funnel_events` ou `payload->'funnel'->'events'`.
