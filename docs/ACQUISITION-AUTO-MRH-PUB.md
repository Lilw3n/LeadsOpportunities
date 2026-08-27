# Acquisition auto / MRH — pub, blog, SEO, mots-clés, backlinks

Playbook pour convertir le cluster **assurance auto** + **habitation (MRH)** (courtier / grossiste) sans brûler le budget.

## 1. Articles blog (éducatifs → bridge)

Piliers à pousser (Meta *blog_then_bridge* → landing devis) :

| Article | Campagne UTM | Intent |
|---------|--------------|--------|
| `tarif-assurance-auto-2026.html` | `auto_blog_convert` | Prix / CRM |
| `assurance-auto-courtier-grossiste-comparatif-2026.html` | `auto_blog_convert` | Grossiste |
| `resilier-assurance-auto-loi-hamon-2026.html` | `auto_blog_convert` | Changer |
| `assurance-auto-paris-ile-de-france-2026.html` | `auto_blog_convert` | Local IDF |
| `assurance-auto-nancy-varangeville-54.html` | `auto_blog_convert` | Local 54 |
| `assurance-habitation-courtier-grossiste-mrh-2026.html` | `habitation_blog_convert` | Grossiste MRH |
| `changer-assurance-habitation-loi-hamon.html` | `habitation_blog_convert` | Hamon MRH |
| `assurance-habitation-vol-cambriolage-2026.html` | `habitation_blog_convert` | Vol |
| `assurance-habitation-*-nancy-varangeville-54.html` | `habitation_blog_convert` | Local 54 |

File complète : `ads/meta-blog-conversions.csv` (priorités 33–50).

## 2. Pub Search (intent chaud → devis / page ville)

- `ads/google-auto-search.csv` — campagne `FR_Search_Auto_HotIntent`
- `ads/google-habitation-search.csv` — `FR_Search_Habitation_HotIntent`
- Fusion UTM : `ads/google-ads-editor-ready-utm.csv`

**Règle :** mots-clés chauds (`devis`, `courtier`, `tous risques`, `changer`) → `/landings/devis.html?need=auto|habitation`.  
Mots-clés **ville** (`assurance auto paris`, `assurance habitation nancy`) → page SEO `/assurance-*/[ville]/`.

Villes couvertes Search : Paris, Lyon, Marseille, Bordeaux, Lille, Toulouse, Nantes, Nice, Strasbourg, Nancy, Varangéville.

## 3. SEO local + mots-clés

- 317 villes × auto + habitation (et 15 autres silos)
- Meta keywords locales (ville + région + dept + cluster)
- Clusters : `data/seo-keyword-clusters.json` (`auto`, `habitation`, `nancy-local`)
- Indexation : `npm run gsc:urls` (pilier + blogs + villes Paris/Lyon/Nancy/Varangéville)

## 4. Backlinks internes (maillage)

Source unique : `scripts/seo-long-term-related.cjs` → `AUTO_MRH`.

Chaque article auto/MRH pointe vers :

- hubs `/assurance-auto/` et `/assurance-habitation/`
- annuaires `/villes/`
- pages ville Paris / Lyon / Nancy / Varangéville
- autres articles du cluster
- landings devis + agence Varangéville / Nancy 54

Les hubs piliers auto/habitation injectent aussi ce cluster (blog + landings) dans « pages liées ».

**Backlinks externes** (hors code) : fiche Google Business, bio Facebook/Instagram, signature mail, PagesJaunes — voir `docs/INDEXATION-GOOGLE-URGENT.md`.

## 5. Budget recommandé

| Canal | Quand | Budget |
|-------|-------|--------|
| Meta blog-convert | Article avec bridge organique OK | 1–5 €/j, 1 créatif |
| Meta SEO ville | Retarget ou lookalike FR | 3–5 €/j |
| Google Search | KW devis/ville | CPC contrôlé, negative emploi/forum |
| Retarget rappel | `JourneyFormStart` sans Lead | 3 €/j |

Pas de pub sur articles actu internationaux / gaming.

## 6. Vérifs

```bash
npm run verify:auto-mrh
npm run verify:acquisition-priorites
npm run gsc:urls
```
