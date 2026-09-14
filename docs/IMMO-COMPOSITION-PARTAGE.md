# Composition : dessin, synthèses, partage client

## Sur la fiche CRM (`crm-immo-property.html` → Composition)

1. **Synthèse courte** — phrase + KPIs (unités, loyers, Carrez…)
2. **Synthèse longue** — détail agrégé + cadastre / lecture du modèle
3. **Dessin intelligent** — SVG terrain → bâti → lots (`js/crm-immo-composition-draw.js`)
4. **Partage client** — publier un snapshot public (token)

## Utilisateur connecté

Oui : avec le lien `immo-composition-partage.html?token=…` un utilisateur **connecté** (`lo_token` + `lo_user`) peut :

- **voir** la synthèse publique (courte + longue + dessin) ;
- **sauvegarder sa propre copie** (fork) — **nouvelle** sauvegarde, sans écraser la vôtre.

## Couleurs d’auteur

| Couleur | Qui |
|---------|-----|
| Vert mandataire | Infos que vous avez publiées |
| Orange utilisateur | Champs modifiés sur la copie client |

## Fichiers

- `js/crm-immo-composition-draw.js`
- `js/crm-immo-composition-share-lib.js`
- `immo-composition-partage.html` + `js/immo-composition-share-page.js`
- Verify : `npm run verify:immo-composition-draw-share`
