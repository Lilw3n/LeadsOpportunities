# Plan visibilité — niches & indexation Google

**Problème :** tu ne trouves pas ton accueil sur Google → ce n’est en général **pas** un bug technique, c’est surtout **l’absence d’indexation** + la **concurrence** sur les gros mots-clés.

---

## Pourquoi tu ne vois pas ton site

| Cause | Explication |
|-------|-------------|
| **Pas indexé** | `site:leadsopportunities.fr` vide = Google n’a pas encore enregistré le domaine (fréquent 3–14 jours après mise en ligne) |
| **GSC non fait** | Sans Search Console + sitemap + demandes d’indexation, Google découvre lentement |
| **Mauvaise requête** | « mutuelle », « assurance » = LesFurets, Assurland, Macif… tu n’apparaîtras pas tout de suite |
| **Prod en retard** | Si Vercel n’a pas redeployé, Google voit une version incomplète |
| **Pas de backlinks** | Aucun lien externe = faible priorité de crawl |

**Ce qui marche en attendant :** cibler des **niches peu concurrentielles** où tu as déjà **900+ pages** générées.

---

## Stratégie en 3 temps

### Temps 1 — Indexer l’essentiel (semaine 1)

**Toi (30 min) :** [Search Console](https://search.google.com/search-console) → vérifier propriété → sitemap `sitemap.xml` → **Demander l’indexation** (10–15 URLs/jour).

```bash
npm run gsc:urls          # cœur de métier
npm run gsc:niches        # niches chasse / équitation / animaux
```

**Ordre recommandé :**

1. [Accueil](https://www.leadsopportunities.fr/)
2. [Hub niches](https://www.leadsopportunities.fr/assurances-niches.html) ← **nouveau**
3. [Assurance chasse](https://www.leadsopportunities.fr/assurance-chasse/) ← **faible concurrence**
4. [RC chasseur](https://www.leadsopportunities.fr/assurance-chasse/rc-chasseur/)
5. [Assurance équitation](https://www.leadsopportunities.fr/assurance-equitation/)
6. [Animaux comparatif](https://www.leadsopportunities.fr/assurance-animaux/comparatif/)
7. [Chien pas cher](https://www.leadsopportunities.fr/assurance-animaux/chien/pas-cher/)
8. [Landing animaux](https://www.leadsopportunities.fr/landings/animaux.html)

### Temps 2 — Niches live (semaine 2–4)

Tu as **4 silos live** avec **189 villes** chacun :

| Niche | Requête principale | Pages money |
|-------|-------------------|-------------|
| **Chasse** | assurance chasse, rc chasseur | `/assurance-chasse/`, `/assurance-chasse/paris/` |
| **Équitation** | assurance équitation, rc équestre | `/assurance-equitation/`, `/assurance-equitation/lyon/` |
| **Animaux** | assurance chien pas cher | `/assurance-animaux/chien/pas-cher/`, `/comparatif/` |
| **VSP** | assurance voiture sans permis | `/assurance-voiture-sans-permis/`, `/landings/vsp.html` |

**Actions contenu (août 2026) :**

- Module blog **`scripts/blog-niches-actu-articles.cjs`** — incendies Gironde, restrictions d'eau, présidentielle 2027, chasse, équitation, animaux
- Module blog **`scripts/blog-vsp-articles.cjs`** — 10 articles VSP (tarifs, Ami, Aixam, 16 ans, Nancy / Varangéville)
- Vérif : `npm run verify:niches-actu` · `npm run verify:vsp`
- Partager les URLs niches + articles actu sur Facebook / groupes chasse-équitation
- Google Business Profile Varangeville + lien site
- GSC : `npm run gsc:niches` + `npm run gsc:urls`

### Temps 3 — Activer les niches « planned » (T3–T4 2026)

Questionnaire **déjà codé** pour :

- Instrument musique, matériel photo, bateau, caravane, scolaire

**Pour passer en live :** voir `docs/NICHES-ASSURANCE.md` — copier le silo animaux dans `niche-pages.cjs`, `npm run seo:build`, deploy.

Fichier stratégique : **`data/seo-niche-markets.json`**

---

## Où tu ne dois PAS te battre (pour l’instant)

- « mutuelle santé » seul
- « assurance auto »
- « Leads Opportunities » (marque inconnue de Google)

**Où tu peux gagner vite :**

- « assurance chasse [ville] »
- « rc chasseur devis »
- « assurance cheval pas cher »
- « assurance chien pas cher comparatif »
- « assurance voiture sans permis »
- « devis vsp » / « permis AM assurance »

---

## Fichiers utiles

| Fichier | Rôle |
|---------|------|
| `data/seo-niche-markets.json` | Plan marchés + URLs indexation |
| `seo/niches.json` | Catalogue 15 niches |
| `assurances-niches.html` | Hub public indexable |
| `docs/INDEXATION-GOOGLE-URGENT.md` | Accueil invisible — checklist |
| `docs/RETOUR-GSC-CHECKLIST.md` | Liens GSC pas à pas |

---

## Contrôle J+7

```bash
npm run verify:gsc
```

Google : `site:leadsopportunities.fr assurance chasse`  
→ tu dois voir au moins **1–3 pages** avant `site:leadsopportunities.fr` seul.

---

## SEA optionnel (CPC bas)

1 campagne Google Ads = 1 niche = 1 landing :

- Chasse → `?need=chasse`
- Équitation → `?need=equitation`
- Animaux → `/landings/animaux.html`
- **VSP** → `/landings/vsp.html` (Search explicite) — voir `docs/GOOGLE-VSP-PUB.md`

Mots-clés exact : `assurance chasse`, `rc chasseur`, `assurance équitation`.

---

## Actu niches août 2026 (mots-clés)

| Article | Requêtes cibles | Landing |
|---------|-----------------|---------|
| Incendies Gironde | incendies gironde, feux de forêt assurance habitation | habitation |
| Restrictions d'eau | restriction eau gironde, sécheresse habitation | habitation |
| Présidentielle checklist | présidentielle 2027 assurance | questionnaire |
| RC chasseur | assurance chasse, rc chasseur devis | `/landings/chasse.html` |
| RC équestre | assurance équitation, assurance cheval pas cher | `/landings/equitation.html` |
| Animaux + feux | évacuation chien chat incendie | `/landings/animaux.html` |

```bash
npm run blog:build
npm run verify:niches-actu
npm run gsc:niches
```
