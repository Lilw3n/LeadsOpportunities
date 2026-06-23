# Trafic France — ciblage marché et analytics

Ce guide décrit comment Leads Opportunities oriente le trafic et le contenu vers le **marché français** (métropole + DOM-TOM).

## Objectif

Réduire le bruit analytics (visiteurs US / international sans intention d’achat assurance FR) et concentrer SEO, actu et campagnes sur des leads qualifiables en France.

## Ce qui est en place

### Marque et meta SEO

- Balises `geo.region=FR`, `og:locale=fr_FR`, `content-language=fr` sur l’accueil, le blog et les pages SEO.
- Logo avec baseline **« Courtier assurance · France · ORIAS »** (`scripts/france-brand.cjs`).

### Blog actu

- **Scoring** : `scripts/france-audience-lib.cjs` pénalise les sujets internationaux (World Cup USA, Trump, GTA, F1, gaming…) et booste mutuelle, ORIAS, villes FR.
- **Publication auto** : `auto-actu-publish.cjs` ignore les candidats actu clairement internationaux.
- **Robots** : articles actu internationaux existants en `noindex,follow` (toujours accessibles, pas indexés Google).

Fichiers concernés : voir `INTL_ACTU_FILES` dans `france-audience-lib.cjs`.

### Microsoft Clarity

- Tag custom **`market_intent=FR`** sur toutes les pages (bundle `clarity-init.js`).
- Filtrez le dashboard Clarity : **Pays = France** pour les métriques business.
- Tags utiles : `page_section`, `article_niche`, `last_click_zone`, `wizard_step`.

Voir aussi `docs/CLARITY-DIAGNOSTICS.md`.

### Campagnes pub (complément)

Pour Google Ads / Meta, voir `docs/SEO-SEA-FRANCE-CIBLAGE.md` (branche `cursor/seo-sea-france-targeting-3a54`) : geo-hint API, garde formulaires, conversion `qualified_lead`.

## Search Console

1. Propriété **www.leadsopportunities.fr** — pays cible France dans les rapports.
2. Surveiller les requêtes avec intent FR (`mutuelle`, `devis assurance`, `ORIAS`, noms de villes).
3. Les pages `noindex` actu internationales disparaîtront progressivement de l’index (normal).

## Regénérer le site

```bash
npm run build:clarity    # après modif clarity-source.mjs
npm run blog:build       # articles + index blog
npm run seo:build        # ~3600 pages SEO
```

## Ajouter un article actu international (exception)

Dans `blog-articles-manifest.cjs` :

```js
audience: "international",
```

Ou laisser la détection automatique via mots-clés (`world cup`, `trump`, etc.).
