# Checklist au retour — Search Console (15–30 min)

Tout le **technique + mots-clés** est déjà sur le site. Il ne reste que **ton compte Google**.

---

## Jour 1 — Obligatoire

- [ ] [Search Console](https://search.google.com/search-console) → propriété `https://www.leadsopportunities.fr/`
- [ ] **Vérifier** la propriété (balise déjà dans le HTML)
- [ ] **Sitemaps** → `https://www.leadsopportunities.fr/sitemap.xml` → statut Réussi
- [ ] **Indexation** : 10–15 URLs/jour via *Inspection de l’URL* → *Demander l’indexation*

Liste à copier :

```bash
npm run gsc:urls
```

**Ordre jour 1 :** accueil → landings VTC / santé / crédit → piliers `/assurance-vtc/`, `/assurance-sante/`, `/credit-immo/` → `/methode.html`

---

## Jour 2–3

- [ ] Suite des URLs `gsc:urls` (Paris, Lyon, Marseille, articles blog)
- [ ] [Bing Webmaster](https://www.bing.com/webmasters) + même sitemap
- [ ] Fiche **Google Business Profile** + lien site

---

## J+7

- [ ] Google : `site:leadsopportunities.fr`
- [ ] GSC → **Performances** : noter les 5 premières requêtes avec impressions
- [ ] `npm run verify:gsc` (doit être tout [OK])

---

## Semaine 2 (10 min)

- [ ] Requêtes **impressions ↑ / clics faibles** → ajuster title + description (voir `data/seo-page-meta.json`)
- [ ] Clarity : filtre **Pays = France**
- [ ] Leads `qualified_lead` par landing (GA4)

---

## Docs utiles

| Fichier | Contenu |
|---------|---------|
| `docs/GSC-SOLO-GUIDE.md` | Guide complet |
| `data/seo-keyword-clusters.json` | 5 clusters mots-clés |
| `data/seo-page-meta.json` | Titles/descriptions optimisés par URL |
| `docs/INDEXATION-GOOGLE-URGENT.md` | Indexation + délais |

---

## Si problème

Copie le message exact GSC (*URL exclue*, *Erreur serveur*, etc.) — on corrige côté code.
