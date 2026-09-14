# Fiche bien intelligente

Référence métier (captures CRM) adaptée et réorganisée :

## Onglets
Description · Pièces · Images · Immo cloud · Vendeur · Historique · Statistiques

## Sections Description (ordre)
1. **Composition** — arbre multi-niveaux (terrain → immeuble/maison → étage → appart/local) ; chaque nœud a sa barre noire + totaux globaux/par branche. Voir [`CRM-IMMO-COMPOSITION-SCHEMA.md`](./CRM-IMMO-COMPOSITION-SCHEMA.md).
2. Localisation
3. Aspects financiers
4. Surfaces
5. Intérieur / Extérieur (selon type)
6. Copropriété (appart / immeuble)
7. Terrain (terrain / maison / complexe)
8. **Location — dossier / visite / bail** (si location) — pipeline rémunération (barème + part agent), PDF dossier / bon de visite / projet de bail
9. Bail (champs juridiques)
10. Mandat
11. Diagnostics
12. Visites (accès / consignes)
13. Commentaires
14. Gestion
15. Travaux
16. **Estimation & mandat** — formulaire honoraires → PDF estimation / projet de mandat (aussi `/estimation-mandat.html`)
17. Rapport d’estimation (détail)
18. Pièces justificatives (checklist Requis / Reçu, conditionnelle)

## Création de bien
Depuis **Piges → + Bien** : seed automatique de la composition (lots) + ouverture de la fiche intelligente (`?wizard=1`). En location, ouverture directe du pipeline dossier/visite/bail.

## Intelligence
- Affichage des sections/champs selon `property_type` + `transaction`
- Type `complexe` + unités pour multi-strates
- Checklist docs adaptée (maison / copro / terrain / financement / loué)
- Sync champs clés vers la liste Piges (ville, prix, surface, DPE…)
- Libs : `js/crm-immo-ops-lib.js` + `js/crm-immo-ops-ui.js` · vérif `npm run verify:immo-ops-pipeline`
## Statuts pipeline
1 Prospection · 2 Estimation · 3 Mandat en cours · 4 Suspendu · 5 Sous offre · 6 Réservé - SRU · 7 Compromis · 8 Vendu / Loué · 10 Archivé · 11 A supprimer

Matching acquéreur : uniquement les statuts « matchables » (prospection → réservé SRU, hors suspendu / compromis / clos).

Anciens codes migrés : `active`→mandat, `under_offer`→compromis, `sold`→vendu_loue, `archived`→archive.

## Suivi pipeline
Page [`crm-immo-suivi.html`](../crm-immo-suivi.html) :
- Suivi des ventes
- Suivi des locations
- Suivi des offres (sous offre / SRU / compromis)
- Sorties de stock ventes
- Sorties de stock locations

Groupement par statut métier + KPI (nb, Σ FAI / net).

## Images & Immo cloud (Google Drive)
- **Images** : galerie publique, images confidentielles, liens médias (visite virtuelle, 360°, vidéo…)
- **Immo cloud** : dossier Drive par bien sous `Immo/YYYY/{id}_{ville}_{titre}/` avec sous-dossiers :
  - `01_photos_publiques` · `02_photos_confidentielles`
  - `03_documents_publics` · `04_documents_confidentiels`
  - `05_diagnostics` · `06_mandat_pieces`
  - `07_medias_3d_video` · `08_documents_imprimes`
- Classement auto selon nom/MIME (DPE → diagnostics, mandat → mandat, image → photos…)
- API : `POST /api/drive/immo` (`ensure` | `upload` | `list` | `classify`)
- Config : même `GOOGLE_SERVICE_ACCOUNT_JSON` + `GOOGLE_DRIVE_FOLDER_ID` que le Drive contacts (`docs/DRIVE-SETUP.md`)
- Sans Drive configuré : mode local intelligent (localStorage) pour ne pas bloquer l’agent