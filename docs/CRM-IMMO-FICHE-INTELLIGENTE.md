# Fiche bien intelligente

Référence métier (captures CRM) adaptée et réorganisée :

## Onglets
Description · Pièces · Images · Immo cloud · **Vendeurs & acquéreurs** · Historique · Statistiques

L’onglet **Vendeurs & acquéreurs** accepte un nombre **illimité** de personnes (ex. 8 héritiers sur la même maison), avec rôle, quote-part %, contact CRM et principal.

## Sections Description (ordre)
1. **Composition** — terrain → maison → appartements loués (unités imbriquées)
2. Localisation
3. Aspects financiers
4. Surfaces
5. Intérieur / Extérieur (selon type)
6. Copropriété (appart / immeuble)
7. Terrain (terrain / maison / complexe)
8. Bail (location ou unité louée)
9. Mandat
10. Diagnostics
11. Visites
12. Commentaires
13. Gestion
14. Travaux
15. Rapport d’estimation
16. Pièces justificatives (checklist Requis / Reçu, conditionnelle)

## Intelligence
- Affichage des sections/champs selon `property_type` + `transaction`
- Type `complexe` + unités pour multi-strates
- Checklist docs adaptée (maison / copro / terrain / financement / loué)
- Sync champs clés vers la liste Piges (ville, prix, surface, DPE…)

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