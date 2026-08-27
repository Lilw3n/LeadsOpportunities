## Structure SEA prete a lancer (sans diffusion immediate)

## 1) Campagnes (ordre de lancement)
1. `FR_Search_VTC_HotIntent`
2. `FR_Search_VTC_IDF` — Paris / IDF / CDG / Orly (P1 étude marché)
3. `FR_Search_Sante_HotIntent` (Paused tant que VTC rentable)
4. `FR_Search_CreditImmo_HotIntent` (Paused)
5. `FR_Search_VSP_HotIntent` — voiture sans permis (Search **explicite**)

Import prod : **`ads/google-ads-editor-ready-utm.csv`** (pas le CSV localhost).

## 2) Groupes d'annonces par campagne

### VTC HotIntent
- `devis_assurance_vtc`
- `assurance_vtc_tarif`

### VTC IDF
- `assurance_vtc_paris`
- `assurance_vtc_idf`

### Sante
- `devis_sante`

### Credit/Immo
- `simulation_credit_immo`

### VSP (voiture sans permis)
- `devis_assurance_vsp`
- `assurance_sans_permis`
- `permis_am_bsr`

## 3) Exemples mots-cles (requete large moderee + expression + exact)
- VTC:
  - "devis assurance vtc"
  - [assurance vtc tarif]
  - "assurance chauffeur vtc"
- Sante:
  - "comparatif assurance sante"
  - [devis mutuelle sante]
  - "assurance sante pas cher"
- Credit/Immo:
  - "simulation credit immo"
  - [courtier pret immobilier]
  - "rachat credit immobilier"
- VSP:
  - "assurance voiture sans permis"
  - [assurance voiture sans permis]
  - "devis vsp"

## 4) Mots-cles negatifs de depart
- gratuit
- emploi
- stage
- formation
- definition
- wikipedia
- pdf
- modele lettre
- forum

## 5) Assets RSA (base)

### VTC - titres
- Devis Assurance VTC Rapide
- Comparez Les Offres VTC
- Conseiller VTC Dedie
- Reponse En Moins De 15 Min
- Garanties Et Franchises Claires

### Sante - titres
- Comparez Votre Assurance Sante
- Couverture Claire Et Adaptee
- Devis Sante Sans Engagement
- Conseiller Sante Disponible
- Remboursements Expliques Simplement

### Credit/Immo - titres
- Lancez Votre Simulation Immo
- Courtier Credit A Vos Cotes
- Faisabilite Etape Par Etape
- Reponse Rapide Sur Votre Projet
- Accompagnement Dossier Complet

### VSP - titres (Google : on dit « sans permis »)
- Devis Voiture Sans Permis
- Assurance Sans Permis
- Quadricycle Leger RC
- Permis AM BSR Devis
- Comparez Les Offres VSP

### Descriptions generiques (adapter par verticale)
- Obtenez une orientation claire et un devis adapte a votre besoin.
- Un conseiller dedie vous accompagne sans jargon ni perte de temps.
- Comparez les solutions et avancez avec un plan simple et concret.
- Demande rapide, rappel prioritaire, accompagnement jusqu'a la decision.

## 6) Extensions
- Sitelinks: Devis, FAQ, Avis clients, Contact.
- Accroches: Sans engagement, Reponse rapide, Expert dedie.
- Appel: numero principal actif heures ouvrables.
