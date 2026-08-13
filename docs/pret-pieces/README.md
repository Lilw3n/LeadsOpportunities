# Pièces dossier & documents réglementaires (IOBSP / IAS / conformité)

Sources portail type Cibfinance — **usage professionnel uniquement**, non contractuel.

## Déposer les PDF

1. Copier les fichiers depuis `Téléchargements` vers `_inbox/`
2. `npm run pret:pieces:import`
3. Les fichiers sont rangés dans `docs/pret-pieces/<catégorie>/`

Noms attendus : voir `scripts/pret-pieces-download-list.txt`

## Catalogue

- Données : `data/pret-pieces-reglementaires.json`
- Rebuild : `npm run pret:pieces:build`
- Recherche unifiée : `crm-pret-immo-docs.html` (source « Pièces / réglementaire »)
