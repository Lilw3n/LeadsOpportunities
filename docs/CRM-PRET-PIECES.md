# Pièces dossier & documents réglementaires

Catalogue unifié dans la **Documentation intelligente** Prêt Immo  
[`crm-pret-immo-docs.html`](../crm-pret-immo-docs.html) — filtre source **Pièces / réglementaire**.

## Origine

Listes de pièces et docs portail type **Cibfinance / Cibassur** (usage professionnel exclusif, non contractuel, ne pas remettre à la clientèle). Tracking des téléchargements recommandé.

## Catégories

| Famille | Catégories |
|---------|------------|
| Listes de pièces | Crédit immo · SCI · SCPI · RAC (propriétaire / locataire / hébergé) · Hypo trésorerie · Trésorerie · PVH |
| IOBSP | Entrée en relation · Convention / annexes honoraires · Fiches renseignements · Mise en place IMMO |
| Conformité | Acquisition client DocuSign · LCB-FT · Procédure commercialisation RAC · Publicité |
| IAS | Info pré-contractuelle · Guide Cibassur |
| Indicateur | Demande entrée en relation (indicateur d’affaires) |

## Fichiers

- Catalogue : [`data/pret-pieces-reglementaires.json`](../data/pret-pieces-reglementaires.json)
- Noms exacts (Téléchargements) : [`scripts/pret-pieces-download-list.txt`](../scripts/pret-pieces-download-list.txt)
- Inbox import : [`docs/pret-pieces/_inbox/`](./pret-pieces/_inbox/)

```bash
npm run pret:pieces:build   # régénère le JSON
# copier les PDF dans docs/pret-pieces/_inbox/
npm run pret:pieces:import  # range dans docs/pret-pieces/<catégorie>/
```

Tant que les PDF ne sont pas importés, le statut reste **À déposer** (`pending_upload`).

## Recherche NL (exemples)

- `liste pièces RAC locataire`
- `liste pièces dossier crédit immobilier`
- `liste pièces SCI` / `SCPI` / `PVH`
- `IOBSP demande entrée en relation`
- `DocuSign lutte anti blanchiment`
- `convention honoraires Cibfinance`
- `information pré-contractuelle assurance IAS`

Voir aussi [`CRM-PRET-DOC-SEARCH.md`](./CRM-PRET-DOC-SEARCH.md).
