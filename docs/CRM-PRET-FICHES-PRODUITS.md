# Fiches produits — documentation intelligente

Même logique que les [grilles de taux](./CRM-PRET-GRILLES-TAUX.md), pour les **fiches produits** partenaires.

## Accès
- Page : [`crm-pret-immo-fiches.html`](../crm-pret-immo-fiches.html)
- Catalogue : [`data/pret-fiches-produits.json`](../data/pret-fiches-produits.json)
- Manifeste : [`scripts/pret-fiches-manifest.json`](../scripts/pret-fiches-manifest.json)
- Inbox : `docs/pret-fiches/_inbox/`

## Sections cataloguées
IMMO · HYPO TRESO · PVH · Trésorerie · Rénovation · BANK B · CFCAL · CGI · CML · CMT · CREATIS · DOM-TOM Antilles / Réunion · LBP · MMB · SYGMA

## Recherche métier (exemples)
| Requête | Orientation |
|---------|-------------|
| `60 ans retraite RAC` | CGI fiche retraite, PVH, RAC hypo |
| `locataire sans garantie` | CFCAL / SYGMA / CGI locataire |
| `RAC Réunion avec garantie` | Fiches DOM-TOM Réunion |
| `travaux rénovation` | HYPO RENOV + BANK B travaux |

## Import
```bash
# déposer les PDF/XLS/DOCX dans docs/pret-fiches/_inbox/
npm run pret:fiches:import
# (re)sync noms depuis une liste Téléchargements
node scripts/sync-pret-fiches-download-list.cjs && npm run pret:fiches:build
```

Liste de référence : [`scripts/pret-fiches-download-list.txt`](../scripts/pret-fiches-download-list.txt) (~176 uniques).  
Nouveautés mappées : gamme **Credit Lift** (UNILIFT, MINILIFT, CONSOLIFT, HYPOLIFT…), **SCPI CFCAL/CACF**, normes **SCI**, Investys Patrimonial.

Les fichiers restent `pending_upload` tant qu’ils ne sont pas déposés (chemins Windows `f:\…` inaccessibles à l’agent).
