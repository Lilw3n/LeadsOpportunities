# Documentation intelligente Prêt Immo

Hub unique qui croise **grilles de taux** + **fiches produits**.

## Accès
[`crm-pret-immo-docs.html`](../crm-pret-immo-docs.html)

## Moteur
[`js/crm-pret-doc-search.js`](../js/crm-pret-doc-search.js)

### Ce qui est compris automatiquement
| Signal | Exemples |
|--------|----------|
| Âge / senior | `62 ans`, `plus de 60`, `retraitée` |
| Profil | locataire, propriétaire, primo, retraite |
| Besoin | RAC, SCPI, PVH, travaux, trésorerie… |
| Intention | éligible, taux, critères, pièces, assurance |
| Partenaire | CFCAL, Credit Lift, Creatis, MMB, SYGMA… |
| Région | Réunion, Antilles, DOM-TOM |

### Sorties
- **Compris :** résumé du parsing
- **Parcours conseillé :** étapes d’orientation
- **Conseils** (règles draft des catalogues)
- **Résultats scorés** (badge Grille / Fiche), groupables par source, partenaire ou catégorie

### Ranking (anti-bruit)
- Besoin métier (RAC, SCPI…) : match **catégorie / tag / titre** obligatoire
- Intention « taux » → priorise les **grilles** ; « pièces » → **fiches** internes
- Filtre partenaire / région strict si détecté
- Coupure **relative** au top score + plafond (~28 docs ciblés)

## Exemples
- `personne de 62 ans retraitée, propriétaire, éligible RAC ?`
- `taux RAC CFCAL avec garantie`
- `pièces indispensables RAC hypo Creatis`
- `locataire sans garantie Credit Lift`
- `SCPI nantissement CFCAL`

## Catalogues
- Grilles : `data/pret-grilles-taux.json`
- Fiches : `data/pret-fiches-produits.json`
- Import fichiers : `docs/pret-grilles/_inbox/` · `docs/pret-fiches/_inbox/`
