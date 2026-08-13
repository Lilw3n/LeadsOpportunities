# Documentation intelligente Prêt Immo

Hub unique qui croise **grilles de taux** + **fiches produits** + **pièces / réglementaire**.

## Accès
[`crm-pret-immo-docs.html`](../crm-pret-immo-docs.html)

## Moteur
[`js/crm-pret-doc-search.js`](../js/crm-pret-doc-search.js)

### Corrélation projets IMMO
Axes : **Prêt immo · PTZ · Prêt relais · Prêt conso · Travaux** (+ RAC, SCPI, SCI, HYPO, PVH).

| Source | Signal → besoins docs |
|--------|------------------------|
| Rubrique dossier | `immo` → immo + pièces immo · `rac` → rac + pièces rac · etc. |
| Case PTZ / Relais (simulateur) | `projet.ptz` / `projet.relais` |
| Type « Travaux » ou montant travaux | → `renov` |
| Statut logement | locataire / propriétaire / hébergé (listes RAC) |
| Banque saisie | partenaire détecté |

Liens : Mes dossiers **📑** · simulateur **Documentation liée** · URL `?dossierId=&project=ptz&need=…`

### Ce qui est compris automatiquement
| Signal | Exemples |
|--------|----------|
| Âge / senior | `62 ans`, `plus de 60`, `retraitée` |
| Profil | locataire, propriétaire, primo, retraite |
| Besoin | RAC, SCPI, PVH, PTZ, relais, travaux, conso, SCI… |
| Intention | éligible, taux, critères, pièces, réglementaire, assurance |
| Partenaire | CFCAL, Credit Lift, Creatis, MMB, SYGMA, Cibfinance… |
| Région | Réunion, Antilles, DOM-TOM |

### Sorties
- **Compris :** résumé du parsing
- **Parcours conseillé :** étapes d’orientation (dont listes de pièces / IOBSP)
- **Conseils** (règles draft des catalogues)
- **Résultats scorés** (badge Grille / Fiche / Pièces), groupables par source, partenaire ou catégorie

### Ranking (anti-bruit)
- Besoin métier (RAC, SCPI…) : match **catégorie / tag / titre / needs** obligatoire
- Intention « taux » → priorise les **grilles** ; « pièces » / « réglementaire » → catalogue **pièces**
- Filtre partenaire / région strict si détecté
- Coupure **relative** au top score + plafond (~28 docs ciblés)

## Exemples
- `personne de 62 ans retraitée, propriétaire, éligible RAC ?`
- `taux RAC CFCAL avec garantie`
- `liste pièces RAC locataire`
- `liste pièces dossier crédit immobilier`
- `IOBSP demande entrée en relation`
- `DocuSign lutte anti blanchiment`
- `locataire sans garantie Credit Lift`
- `SCPI nantissement CFCAL`

## Catalogues
- Grilles : `data/pret-grilles-taux.json`
- Fiches : `data/pret-fiches-produits.json`
- Pièces / réglementaire : `data/pret-pieces-reglementaires.json` — voir [`CRM-PRET-PIECES.md`](./CRM-PRET-PIECES.md)
- Import fichiers : `docs/pret-grilles/_inbox/` · `docs/pret-fiches/_inbox/` · `docs/pret-pieces/_inbox/`
