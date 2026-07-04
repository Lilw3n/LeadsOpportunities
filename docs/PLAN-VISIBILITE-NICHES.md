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

Tu as **3 silos live** avec **189 villes** chacun :

| Niche | Requête principale | Pages money |
|-------|-------------------|-------------|
| **Chasse** | assurance chasse, rc chasseur | `/assurance-chasse/`, `/assurance-chasse/paris/` |
| **Équitation** | assurance équitation, rc équestre | `/assurance-equitation/`, `/assurance-equitation/lyon/` |
| **Animaux** | assurance chien pas cher | `/assurance-animaux/chien/pas-cher/`, `/comparatif/` |

**Actions contenu :**

- 1 article blog / niche / mois (chasse, équitation — **manquants aujourd’hui**)
- Partager les URLs niches sur Facebook / groupes chasse-équitation (backlinks légers)
- Google Business Profile Varangeville + lien site

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
- « assurance instrument musique » (quand silo activé)

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

Mots-clés exact : `assurance chasse`, `rc chasseur`, `assurance équitation`.
