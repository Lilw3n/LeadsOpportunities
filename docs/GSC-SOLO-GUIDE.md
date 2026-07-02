# Google Search Console — guide solo (Leads Opportunities)

Guide pour **travailler seul** : mise en place GSC, indexation, mots-clés, suivi hebdo.  
**Rappel :** on n’« ajoute » pas des mots-clés dans Search Console — GSC **affiche** les requêtes une fois que Google indexe vos pages.

---

## Étape 1 — Créer la propriété (15 min)

1. [Google Search Console](https://search.google.com/search-console)
2. **Ajouter une propriété** → **Préfixe d’URL** : `https://www.leadsopportunities.fr/`
3. Vérification **Balise HTML** — le token est dans `index.html` :
   ```html
   <meta name="google-site-verification" content="…" />
   ```
4. Cliquer **Vérifier**

Si vous changez de compte Google, mettez à jour **une seule** balise dans `index.html` + pages principales (blog générateur inclut déjà la balise).

---

## Étape 2 — Soumettre le sitemap (5 min)

1. Menu **Sitemaps**
2. Ajouter : `https://www.leadsopportunities.fr/sitemap.xml`
3. Attendre statut **Réussi** (quelques heures)

Vérifier dans le navigateur :

- `https://www.leadsopportunities.fr/robots.txt`
- `https://www.leadsopportunities.fr/sitemap.xml`

---

## Étape 3 — Demander l’indexation (priorité, 20 min)

**Limite Google :** ~10–15 demandes utiles par jour.

Liste officielle (générée par le repo) :

```bash
npm run gsc:urls
```

Ou :

```bash
npm run verify:gsc
```

Dans GSC → **Inspection de l’URL** → coller l’URL → **Tester l’URL live** → **Demander l’indexation**.

**Ordre recommandé (jour 1–2) :**

1. Accueil  
2. `nos-services.html`, `assurances/`, `france/`  
3. Landings VTC, santé, crédit immo, devis  
4. Piliers `assurance-vtc/`, `assurance-sante/`, `credit-immo/`  
5. `assurance-vtc/paris/`, `assurance-sante/paris/`  
6. Blog index + 3 articles VTC / mutuelle / crédit  

**Ne pas** demander 500 URLs d’un coup.

---

## Étape 4 — Bing (bonus, 10 min)

[Bing Webmaster Tools](https://www.bing.com/webmasters) → même site + sitemap.  
IndexNow est déjà configuré côté serveur (`api/_lib/seo-ping.js`).

---

## Étape 5 — Mots-clés sur le **site** (pas dans GSC)

Fichier de référence : **`data/seo-keyword-clusters.json`**

| Cluster | Requête principale | Pages money |
|---------|-------------------|-------------|
| VTC | assurance VTC | `/assurance-vtc/`, landing VTC |
| Mutuelle | mutuelle santé | `/assurance-sante/`, landing santé |
| Crédit | crédit immobilier | `/credit-immo/`, landing crédit |
| Animaux | assurance chien / chat | `/assurance-animaux/` |
| Habitation | assurance habitation | `/assurance-habitation/` |

**Règle :** 1 requête principale + 2–3 longue traîne par page (title, H1, 1er §, 1 FAQ).  
Pas de liste de 50 mots-clés en meta keywords.

---

## Étape 6 — Signaux hors Google (accélère la découverte)

- **Google Business Profile** (nom, zone, site web)
- Lien site en bio Facebook / Instagram / LinkedIn
- Signature mail `contact@leadsopportunities.fr`
- 1–2 annuaires pro pertinents (PagesJaunes, etc.)

Voir aussi `docs/INDEXATION-GOOGLE-URGENT.md`.

---

## Routine hebdomadaire (10 min / semaine)

| Où | Action |
|----|--------|
| **Performances** | Requêtes avec impressions ↑ et CTR faible → retoucher **title** + **meta description** |
| **Pages** | URLs qui gagnent des impressions → enrichir le contenu |
| **Indexation** | Pages importantes « Non indexées » → corriger ou demander indexation |
| **GA4 / Clarity** | Leads `qualified_lead` par landing — pas seulement le trafic |

Test Google : `site:leadsopportunities.fr` — premières pages souvent sous **7–14 jours** après étapes 1–3.

---

## Commandes repo utiles

```bash
npm run verify:gsc      # checklist technique + liste URLs
npm run gsc:urls        # liste seule pour copier-coller GSC
npm run seo:build       # régénère sitemaps + pages SEO
npm run blog:build      # régénère le blog
```

---

## Erreurs fréquentes GSC

| Message | Action |
|---------|--------|
| **URL exclue par noindex** | Normal pour actu internationale (GTA, etc.) |
| **Bloquée par robots.txt** | Vérifier `/api/`, `/crm/` — normal |
| **Dupliquée** | Vérifier canonical www |
| **Erreur serveur 5xx** | Tester l’URL en navigation privée |

Copiez le message exact si besoin d’aide technique.

---

## Délais réalistes (solo)

| Objectif | Délai |
|----------|-------|
| Premières pages indexées | 3–14 jours |
| Requêtes visibles dans Performances | 2–6 semaines |
| Positions sur « assurance VTC » / « mutuelle » | mois + contenu + liens |

---

## Checklist finale

- [ ] Propriété GSC vérifiée  
- [ ] Sitemap soumis OK  
- [ ] 10–15 URLs prioritaires indexées (demande manuelle)  
- [ ] Bing Webmaster (optionnel)  
- [ ] Google Business Profile  
- [ ] `npm run verify:gsc` sans [KO]  
- [ ] J+7 : retest `site:leadsopportunities.fr`  
- [ ] Semaine 2 : première lecture Performances  
