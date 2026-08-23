# Audit SERP — Leads Opportunities (août 2026)

Vérification manuelle / outils web des positions Google pour les mots-clés demandés.

## Verdict court

| Requête | Site visible page 1 ? | Commentaire |
|---------|----------------------|-------------|
| `assurance` | Non | Impossible court terme (comparateurs + assureurs nationaux) |
| `mutuelle` | Non | Idem (Que Choisir, LesFurets, Meilleurtaux…) |
| `crédit` / `prêt` | Non | Banques + gros courtiers nationaux |
| `assurance VTC devis` | Non (top = spécialistes VTC) | Concurrentiel ; pages `/assurance-vtc/` à pousser |
| `courtier assurance Nancy` | Non | Concurrent local (As-surance, A-Z…) — **priorité SEO** |
| `crédit immobilier Nancy` | Non | Artémis, Crédilia, Négocial… — **priorité SEO** |
| `mutuelle santé devis` | Non | Comparateurs — viser `mutuelle Nancy` / longue traîne |
| `leadsopportunities.fr` / marque | Oui | Accueil + france + landings indexés |
| `site:leadsopportunities.fr` | Oui | Des centaines d’URL déjà indexables |

**Conclusion :** ne pas apparaître sur `assurance` / `mutuelle` / `crédit` seuls est **normal**. Le levier réel = **local Nancy 54 + niches (VTC, prêt refusé, emprunteur) + indexation GSC + Google Business**.

## Ce qui a été corrigé / boosté dans le repo

1. Hub **`/nancy-54/`** (était 404 alors que des pages y pointaient).
2. Titres / meta accueil orientés **courtier + mutuelle + crédit + Nancy**.
3. Liens internes footer + GSC priority + sitemap.
4. Cluster mots-clés local dans `data/seo-keyword-clusters.json`.
5. Script `npm run seo:serp-audit` — rappel des cibles (pas un scraper Google live).

## Actions Wendy (hors code) — obligatoires pour progresser

1. [Search Console](https://search.google.com/search-console) → Performances : filtrer France, 28 jours.
2. Indexer (10–15/jour) : `npm run gsc:urls` — **prioriser** `/nancy-54/`, `/agence-varangeville/`, `/credit-immo/nancy/`, `/assurance-sante/nancy/`.
3. Google Business Profile : catégories Assurance + Courtage crédit, posts hebdo (textes déjà sur `/agence-varangeville/`).
4. SEA : ne pas concurrencer `assurance` seul à 0 € — campagnes exactes locales (`courtier Nancy`, `mutuelle Nancy`) + remarketing.

## Requêtes cibles (gagnables)

- courtier Nancy / courtier Varangéville / Wendy Buchet
- mutuelle Nancy / mutuelle santé Nancy
- crédit immobilier Nancy / prêt immobilier Nancy
- assurance emprunteur / prêt immobilier refusé
- assurance VTC + ville (Paris, Lyon…)
- Leads Opportunities (marque)
