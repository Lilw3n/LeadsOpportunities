# Checklist complète — déploiement + Search Console

**Temps total :** 30–45 min (réparti sur 3 jours).  
Le code est prêt sur GitHub `main` ; Google/Bing/Vercel exigent **ton compte**.

---

## Étape 0 — Déployer sur Vercel (5 min) — OBLIGATOIRE AVANT GSC

Le site prod doit afficher la nouvelle page avant d’indexer.

1. Ouvre le [tableau de bord Vercel](https://vercel.com/dashboard) → projet **LeadsOpportunities**
2. Onglet **Deployments** → vérifie qu’un déploiement récent correspond au commit `Pack SEO mots-clés`
3. Si absent ou en erreur : **Redeploy** sur le dernier déploiement `main` (ou **Deploy** depuis GitHub)
4. Contrôle dans le navigateur :
   - [https://www.leadsopportunities.fr/methode.html](https://www.leadsopportunities.fr/methode.html) → doit être **200** (pas 404)
   - [https://www.leadsopportunities.fr/sitemap.xml](https://www.leadsopportunities.fr/sitemap.xml) → doit contenir `methode.html`
   - Titre accueil doit contenir **« 2026 »** dans la balise title

---

## Jour 1 — Google Search Console (15 min)

### A. Ouvrir / créer la propriété

1. [Google Search Console — accueil](https://search.google.com/search-console)
2. Si besoin : **Ajouter une propriété** → **Préfixe d’URL** → `https://www.leadsopportunities.fr/`
3. Vérification **Balise HTML** — token déjà sur le site :
   ```
   I3CAH3KoD216Gpr7VbJ6-p3IM4vGizTzxW0HsqG-HKU
   ```
   Visible sur [l’accueil](https://www.leadsopportunities.fr/) (code source → `google-site-verification`)
4. Cliquer **Vérifier**

Liens directs (une fois la propriété créée) :

- [Sitemaps GSC](https://search.google.com/search-console/sitemaps?resource_id=https%3A%2F%2Fwww.leadsopportunities.fr%2F)
- [Inspection d’URL](https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Fwww.leadsopportunities.fr%2F)
- [Performances (requêtes)](https://search.google.com/search-console/performance/search-analytics?resource_id=https%3A%2F%2Fwww.leadsopportunities.fr%2F)

### B. Soumettre le sitemap

1. Menu **Sitemaps** (lien ci-dessus)
2. Nouveau sitemap : `sitemap.xml` (ou URL complète ci-dessous)
3. **Envoyer** → attendre statut **Réussi** (quelques heures)

URL à soumettre : [https://www.leadsopportunities.fr/sitemap.xml](https://www.leadsopportunities.fr/sitemap.xml)

### C. Demander l’indexation (10–15 URLs max / jour)

Dans **Inspection de l’URL** :

1. Coller l’URL
2. **Tester l’URL en direct**
3. **Demander l’indexation**

**Jour 1 — copier-coller ces 12 URLs :**

| # | URL | Ouvrir |
|---|-----|--------|
| 1 | Accueil | [Inspecter](https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Fwww.leadsopportunities.fr%2F&url=https%3A%2F%2Fwww.leadsopportunities.fr%2F) |
| 2 | Landing VTC | [Inspecter](https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Fwww.leadsopportunities.fr%2F&url=https%3A%2F%2Fwww.leadsopportunities.fr%2Flandings%2Fvtc.html) |
| 3 | Landing santé | [Inspecter](https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Fwww.leadsopportunities.fr%2F&url=https%3A%2F%2Fwww.leadsopportunities.fr%2Flandings%2Fsante.html) |
| 4 | Landing crédit | [Inspecter](https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Fwww.leadsopportunities.fr%2F&url=https%3A%2F%2Fwww.leadsopportunities.fr%2Flandings%2Fcredit-immo.html) |
| 5 | Pilier VTC | [Inspecter](https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Fwww.leadsopportunities.fr%2F&url=https%3A%2F%2Fwww.leadsopportunities.fr%2Fassurance-vtc%2F) |
| 6 | Pilier santé | [Inspecter](https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Fwww.leadsopportunities.fr%2F&url=https%3A%2F%2Fwww.leadsopportunities.fr%2Fassurance-sante%2F) |
| 7 | Pilier crédit | [Inspecter](https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Fwww.leadsopportunities.fr%2F&url=https%3A%2F%2Fwww.leadsopportunities.fr%2Fcredit-immo%2F) |
| 8 | Méthode E-E-A-T | [Inspecter](https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Fwww.leadsopportunities.fr%2F&url=https%3A%2F%2Fwww.leadsopportunities.fr%2Fmethode.html) |
| 9 | Nos services | [Inspecter](https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Fwww.leadsopportunities.fr%2F&url=https%3A%2F%2Fwww.leadsopportunities.fr%2Fnos-services.html) |
| 10 | Blog | [Inspecter](https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Fwww.leadsopportunities.fr%2F&url=https%3A%2F%2Fwww.leadsopportunities.fr%2Fblog%2F) |
| 11 | VTC Paris | [Inspecter](https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Fwww.leadsopportunities.fr%2F&url=https%3A%2F%2Fwww.leadsopportunities.fr%2Fassurance-vtc%2Fparis%2F) |
| 12 | Mutuelle Paris | [Inspecter](https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Fwww.leadsopportunities.fr%2F&url=https%3A%2F%2Fwww.leadsopportunities.fr%2Fassurance-sante%2Fparis%2F) |

Liste complète en local : `npm run gsc:urls`

---

## Jour 2 — Suite indexation + Bing (15 min)

**URLs jour 2** (10–15 max) :

- [VTC Lyon](https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Fwww.leadsopportunities.fr%2F&url=https%3A%2F%2Fwww.leadsopportunities.fr%2Fassurance-vtc%2Flyon%2F)
- [VTC Marseille](https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Fwww.leadsopportunities.fr%2F&url=https%3A%2F%2Fwww.leadsopportunities.fr%2Fassurance-vtc%2Fmarseille%2F)
- [Crédit Paris](https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Fwww.leadsopportunities.fr%2F&url=https%3A%2F%2Fwww.leadsopportunities.fr%2Fcredit-immo%2Fparis%2F)
- [Article VTC](https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Fwww.leadsopportunities.fr%2F&url=https%3A%2F%2Fwww.leadsopportunities.fr%2Fblog%2Fassurance-vtc-moins-cher-2026.html)
- [Article mutuelle](https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Fwww.leadsopportunities.fr%2F&url=https%3A%2F%2Fwww.leadsopportunities.fr%2Fblog%2Fmutuelle-sante-5-criteres.html)
- [Article crédit](https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Fwww.leadsopportunities.fr%2F&url=https%3A%2F%2Fwww.leadsopportunities.fr%2Fblog%2Fpret-immo-erreurs-a-eviter.html)

### Bing Webmaster Tools

1. [Bing Webmaster — ajouter un site](https://www.bing.com/webmasters/home)
2. Importer depuis Google (plus rapide) ou ajouter `https://www.leadsopportunities.fr/`
3. Soumettre le même sitemap : [sitemap.xml](https://www.leadsopportunities.fr/sitemap.xml)
4. Clé IndexNow déjà en place : [7c4e9f2a1b8d6035leadsop.txt](https://www.leadsopportunities.fr/7c4e9f2a1b8d6035leadsop.txt)

---

## Jour 3 — Google Business Profile (10 min)

1. [Google Business Profile](https://business.google.com/)
2. Créer ou revendiquer la fiche **Leads Opportunities** — Varangeville (54110)
3. Renseigner :
   - Site : [https://www.leadsopportunities.fr/](https://www.leadsopportunities.fr/)
   - Catégorie : courtier en assurance / agent d’assurance
   - ORIAS n° 15 005 935
4. Publier au moins 1 photo + horaires de rappel

---

## J+7 — Contrôle (10 min)

1. Recherche Google : [site:leadsopportunities.fr](https://www.google.com/search?q=site%3Aleadsopportunities.fr)
2. [Performances GSC](https://search.google.com/search-console/performance/search-analytics?resource_id=https%3A%2F%2Fwww.leadsopportunities.fr%2F) → noter les 5 premières requêtes avec impressions
3. En local : `npm run verify:gsc` (tout doit être `[OK]`)
4. [Microsoft Clarity](https://clarity.microsoft.com/) → filtre **Pays = France**
5. [Google Analytics](https://analytics.google.com/) → événements `qualified_lead` par landing

---

## Semaine 2 — Ajuster les mots-clés (10 min)

Pas dans GSC — sur le site :

| Fichier | Action |
|---------|--------|
| `data/seo-page-meta.json` | Modifier title + description des URLs qui ont des impressions mais peu de clics |
| `data/seo-keyword-clusters.json` | Enrichir longue traîne par métier |
| Puis | `npm run seo:build` + `npm run blog:build` + redeploy Vercel |

Guide détaillé : [docs/GSC-SOLO-GUIDE.md](./GSC-SOLO-GUIDE.md)

---

## Ce que l’agent ne peut pas faire à ta place

| Action | Pourquoi |
|--------|----------|
| Connexion Google / Bing | Compte perso + MFA |
| Vérifier propriété GSC | Clic « Vérifier » dans ton navigateur |
| Demander l’indexation | Quota GSC lié à ton compte |
| Redeploy Vercel | Accès dashboard Vercel (pas de token ici) |
| Google Business Profile | Revendication téléphone / courrier |

Copie-colle tout message d’erreur GSC (*URL exclue*, *Soft 404*, etc.) — correction côté code possible.
