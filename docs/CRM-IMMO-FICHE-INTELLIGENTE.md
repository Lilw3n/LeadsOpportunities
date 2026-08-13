# Fiche bien intelligente + commerciale

## Deux modes sur le même bien

Page [`crm-immo-property.html`](../crm-immo-property.html) :

| Mode | URL | Usage |
|------|-----|--------|
| **Fiche commerciale** (défaut) | `?id=…&view=commercial` | Présentation agent / partage |
| **Édition** | `?id=…&view=edition` | Saisie sections conditionnelles |

Basculer via le switcher en haut de page.

## Fiche commerciale (mieux qu’un clone portail)

- En-tête REF + type + ville + pièces + surface + prix
- Onglets **Fiche commerciale** · **Diaporama** · **Documents publics**
- Actions **Partager** (lien) · **Fiche technique** (impression)
- Grille : héros + récit | caractéristiques groupées | contacts (agence / vendeur)
- Écart **prix annonce → prix FAI** si les deux sont renseignés
- Liens Matching + Financement

Fichiers : [`js/crm-immo-fiche-commerciale.js`](../js/crm-immo-fiche-commerciale.js) · [`css/crm-immo-fiche-commerciale.css`](../css/crm-immo-fiche-commerciale.css)

## Édition (onglets agent)

Description · Pièces · Images · Immo cloud · Vendeur · Historique · Statistiques

### Sections Description (ordre)
1. **Composition** — terrain → maison → appartements loués (unités imbriquées)
2. Localisation
3. Aspects financiers (+ **prix annonce d’origine**)
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
- Rôle partie **Agence mandataire** pour la carte contact commerciale

## Liste piges
[`crm-immo-properties.html`](../crm-immo-properties.html) — boutons **Fiche commerciale** / **Édition** / **Rapide**

## Statuts pipeline
1 Prospection · 2 Estimation · 3 Mandat en cours · 4 Suspendu · 5 Sous offre · 6 Réservé - SRU · 7 Compromis · 8 Vendu / Loué · 10 Archivé · 11 A supprimer

Matching acquéreur : uniquement les statuts « matchables ».

## Suivi / cloud
Voir aussi [`crm-immo-suivi.html`](../crm-immo-suivi.html) et la section Images & Immo cloud ci-dessous.

## Images & Immo cloud (Google Drive)
- **Images** : galerie publique, images confidentielles, liens médias
- **Immo cloud** : dossier Drive par bien sous `Immo/YYYY/{id}_{ville}_{titre}/`
- API : `POST /api/drive/immo` — config `docs/DRIVE-SETUP.md`
