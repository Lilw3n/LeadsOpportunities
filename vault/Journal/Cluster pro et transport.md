---
generated: false
tags:
  - journal
  - seo
  - pro
---

# Cluster pro et transport

Note manuelle. `npm run vault:seo` ne l’écrase pas.

Ouvert le 16 octobre 2026. Le coffre reste la carte : [[Accueil]], puis les silos générés.

## Codex et GPT-6 Astra

Le VSIX officiel **Codex** (`openai.chatgpt`, version 26.51007.21434, linux-x64) a été téléchargé depuis le marketplace VS Code. Le paquet fait environ 350 Mo. Son manifeste ne cite pas Astra. Le bundle parle de `gpt-6.1-sol`, `gpt-6-luna` et `gpt-5.3-codex`, et l’extension se connecte à un compte ChatGPT. L’installer dans cet agent ne rend pas GPT-6 Astra appelable. Le travail SEO de ce cluster est donc fait avec les modèles déjà branchés ici. Détail : [[Journal/Modeles IA]].

## SEO des articles

Les titres suivent la requête du silo (garage automobile, MRP, RC Pro, métiers du bâtiment, transport marchandises, transport de voyageurs). La description invite au devis, sans liste de mots-clés. Détail : [[Journal/Sections blog]].

## Où les lire sur le blog

La page publique est [[Journal/Sections blog]]. Ancres une fois la branche publiée :

- https://www.leadsopportunities.fr/blog/#articles-metiers
- https://www.leadsopportunities.fr/blog/#blog-section-pro
- https://www.leadsopportunities.fr/blog/#blog-section-collective
- https://www.leadsopportunities.fr/blog/#blog-section-partenariat

## Parcours publiés

| Métier | Landing | Blog | Questionnaire |
| --- | --- | --- | --- |
| Garage et négociant auto | `/landings/garage-negociant-auto.html` | guide garage | `rc-pro` |
| Multirisque professionnelle | `/landings/multirisque-professionnelle.html` | guide MRP | `mrp` |
| RC Pro | `/landings/rc-pro.html` | guide RC Pro | `rc-pro` |
| Métiers du bâtiment | `/landings/metiers-batiment.html` | guide bâtiment | `decennale` |
| Décennale | `/landings/decennale.html` | déjà en ligne | `decennale` |
| Santé collective | `/landings/sante-collective.html` | déjà en ligne | `collective` |
| Transport / logistique | `/landings/transport-logistique.html` | guide marchandises | `rc-pro` |
| Transport de voyageurs | `/landings/transport-voyageurs.html` | guide voyageurs | `rc-pro` |
| VTC | `/assurance-vtc/` | déjà en ligne | `vtc` |
| Convoyage | `/landings/convoyage-vehicules.html` | déjà en ligne | `rc-pro` |

Le VTC et l’autocar ne partagent pas le même formulaire. Le convoyage ne transporte pas de passagers. La MRP ne remplace pas la RC ni la décennale.

## Maillage

Les groupes vivent dans `scripts/seo-long-term-related.cjs` (`PARTENARIAT`). Régénérer le coffre : `npm run vault:seo`. Vérifier : `npm run verify:pro-metiers`.
