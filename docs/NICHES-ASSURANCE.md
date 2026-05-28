# Assurances de niche — strategie SEO & landings

Objectif : **percer sur des requetes peu concurrentielles** avec des silos dedies (pages SEO + landings + devis express), au lieu de se battre uniquement sur « assurance auto » ou « mutuelle ».

## Fichiers cles

| Fichier | Role |
|---------|------|
| `seo/niches.json` | Catalogue des niches (priorite, statut, URLs) |
| `scripts/niche-pages.cjs` | Definitions pages SEO (injectees dans `generate-seo-pages.cjs`) |
| `niches/index.html` | Hub public listant toutes les niches |
| `landings/animaux.html` | Questionnaire complet |
| `landings/animaux-express.html` | Rappel 30 sec |

## Generer les pages SEO

```bash
npm run seo:build
```

Cela cree notamment :

- `/assurance-animaux/` (pilier)
- `/assurance-animaux/chien/`
- `/assurance-animaux/chat/`
- `/assurance-animaux/comparatif/`
- `/assurance-animaux/remboursement-veterinaire/`

## Niches prevues (ordre de priorite)

1. **Assurance animaux** — LIVE
2. Assurance chasse
3. Assurance equitation
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
