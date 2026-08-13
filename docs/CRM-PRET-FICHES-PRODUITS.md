# Fiches produits — documentation intelligente

Même logique que les [grilles de taux](./CRM-PRET-GRILLES-TAUX.md), pour les **fiches produits** partenaires.

## Accès
- Page : [`crm-pret-immo-fiches.html`](../crm-pret-immo-fiches.html)
- Catalogue : [`data/pret-fiches-produits.json`](../data/pret-fiches-produits.json)
- Manifeste : [`scripts/pret-fiches-manifest.json`](../scripts/pret-fiches-manifest.json)
- Inbox : `docs/pret-fiches/_inbox/`

## Types de prêt ≠ partenaires

| Filtre | Contenu |
|--------|---------|
| **Type de prêt** | SCI, Crédit immobilier, Hypo trésorerie, PVH, SCPI, Trésorerie, Rénovation, RAC, Relais |
| **Partenaire** | BANK B, CFCAL, CGI, CML, CMT, CREATIS, Credit Lift, LBP, MMB, SYGMA… |
| **Région** | Métropole, DOM-TOM Antilles / Réunion (pas un partenaire) |

Les dossiers filesystem peuvent encore porter un nom partenaire ; le catalogue expose la **catégorie métier** déduite des tags.
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
