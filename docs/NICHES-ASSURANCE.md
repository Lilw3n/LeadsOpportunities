# Assurances de niche — strategie SEO & landings

Objectif : **percer sur des requetes peu concurrentielles** avec des silos dedies (pages SEO + landings + devis express), au lieu de se battre uniquement sur « assurance auto » ou « mutuelle ».

## Fichiers cles

| Fichier | Role |
|---------|------|
| `seo/niches.json` | Catalogue des niches (priorite, statut, URLs) |
| `scripts/niche-pages.cjs` | Definitions pages SEO (injectees dans `generate-seo-pages.cjs`) |
| `niches/index.html` | Hub public (spotlight, stats, filtres, roadmap) |
| `js/niches-hub.js` + `css/niches-hub.css` | Rendu dynamique depuis `seo/niches.json` |
| `landings/animaux.html` | Questionnaire complet |
| `landings/animaux-express.html` | Rappel 30 sec |

## Parcours devis (type comparateur)

- Landing : `/landings/animaux.html`
- **3 etapes** : Vos animaux → Votre tarif (tableau formules) → Coordonnees
- **Tarifs modifiables** : `data/niche-tariffs-animaux.json` (voir `docs/NICHES-TARIFS.md`)

## Generer les pages SEO

```bash
npm run seo:build
```

Cela cree notamment :

- `/assurance-animaux/` (pilier)
- `/assurance-animaux/chien/` + longue traine (`pas-cher`, `chiot`, `senior`, `prix`, `mutuelle`)
- `/assurance-animaux/chat/` + longue traine (`pas-cher`, `chaton`, `senior`, `prix`)
- `/assurance-animaux/comparatif/`, `/tarif/`, `/mutuelle/`, `/chiot/`, `/senior/`, `/nac/`
- `/assurance-animaux/santevet/`, `/bulle-bleue/`, `/devis-rapide/`, `/pas-cher/`
- `/assurance-animaux/villes/` + **189 pages ville** (`/assurance-animaux/paris/`, etc.)
- `/assurance-animaux/departements/` + pages departement

## Niches prevues (ordre de priorite)

1. **Assurance animaux** — LIVE (+ geo chien/chat par ville)
2. **Assurance chasse** — LIVE (189 villes)
3. **Assurance equitation** — LIVE (189 villes)
4. Silos geo : `/assurance-chien/{ville}/`, `/assurance-chat/{ville}/`
4. Assurance instrument musique
5. Assurance materiel photo / video
6. Assurance bateau plaisance
7. Caravane / camping-car
8. Assurance scolaire

Pour activer une nouvelle niche :

1. Ajouter l entree dans `seo/niches.json` (`status: "live"`).
2. Dupliquer le bloc `ANIMAUX_PAGES` dans `scripts/niche-pages.cjs` (nouveau silo).
3. Creer `landings/<niche>.html` (+ express si utile).
4. Ajouter le service dans `js/service-catalog.js`.
5. Lancer `npm run seo:build` et deployer.

## Meta Ads / Google Ads

- 1 campagne = 1 niche = 1 landing dediee.
- Mots-cles longue traine : « assurance chien pas cher », « mutuelle chat comparatif », etc.
- UTM : `utm_campaign=niche_animaux&utm_source=google`

## Partenaires a developper (animaux)

- Santévet, Bulle Bleue, Kozoo (specialistes)
- Reseau courtage April / AXA selon produits

Mettre a jour `partnershipStatus` dans le memo grossistes CRM quand un accord est signe.
