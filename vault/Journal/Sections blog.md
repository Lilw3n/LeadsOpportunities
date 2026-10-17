---
generated: false
tags:
  - journal
  - seo
  - blog
---

# Sections du blog

Note manuelle. `npm run vault:seo` ne l’écrase pas.

La page est `/blog/` : https://www.leadsopportunities.fr/blog/

Les articles ne sont plus une seule liste. Chaque section du manifeste (`scripts/blog-articles-manifest.cjs`) a un titre, une couleur et ses cartes. Le générateur est `scripts/generate-blog-index.cjs`. Les titres `h2` à l’intérieur d’un article ont une barre colorée dans `blog/blog.css`.

## Ancres

- `#articles-metiers` — 25 guides des métiers cités (garage, MRP, RC Pro, bâtiment, transport, flotte, TNS, bateau…)
- `#blog-sections` — mosaïque des sections
- `#blog-section-pro` — professionnel et RC Pro
- `#blog-section-partenariat` — niches pro
- `#blog-section-collective` — santé collective
- `#blog-section-vtc` — VTC
- `#blog-section-sante` — mutuelle individuelle
- `#blog-section-finance` — crédit et immobilier

## SEO qui mène au devis

Les articles métiers (`leadSeo`) ne reçoivent pas le bloc générique ni la liste « Mots-clés » dans la balise description. La requête vient du silo :

- [[Silos/garage]] — assurance garage automobile
- [[Silos/mrp]] — multirisque professionnelle
- [[Silos/rc-pro]] — responsabilité civile professionnelle
- [[Silos/metiers-batiment]] — assurance métiers du bâtiment
- [[Silos/transport-logistique]] — assurance transport marchandises
- [[Silos/transport-voyageurs]] — assurance transport de voyageurs
- [[Silos/collective]] — mutuelle collective entreprise

Chaque page a une FAQ « Comment demander un devis », un fil d’Ariane, et un lien vers le questionnaire. Régénérer seulement ces pages : `node scripts/generate-blog-articles.cjs --lead-seo`. Ne pas lancer `blog:build --force`.

File d’indexation : les six guides sont dans `scripts/seo-gsc-priority-urls.cjs`, à côté des landings.

Suivi CRM : `/crm-blog-stats.html`. Chaque article montre ses clics et les questionnaires vraiment envoyés (e-mail ou téléphone). Une vue, une saisie CRM ou un formulaire vide ne compte pas comme lead.

Silos liés : [[Silos/garage]], [[Silos/mrp]], [[Silos/rc-pro]], [[Silos/decennale]], [[Silos/collective]], [[Silos/metiers-batiment]], [[Silos/transport-logistique]], [[Silos/transport-voyageurs]].

Carte du cluster : [[Journal/Cluster pro et transport]].
