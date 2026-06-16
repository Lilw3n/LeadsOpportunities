# Blog actu automatique — leads ultra qualifiés

Objectif : publier **souvent** des articles liés à l’actualité (Cafeyn, Edge, journaux) qui orientent vers vos **questionnaires** et génèrent des leads qualifiés.

## Ce qui est automatique vs manuel

| Étape | Automatique ? | Comment |
|-------|---------------|---------|
| Détecter l’actu (RSS) | ✅ `npm run blog:actu:fetch` | Google News, Franceinfo, Le Monde… |
| Lire Cafeyn / Edge pour vous | ❌ | Pas d’accès login (légal + technique) |
| Coller une actu Cafeyn | ✅ 2 min | Page `blog/actu-inbox.html` |
| Rédiger l’article complet | 🤖 Agent Cursor | Enrichit le brouillon |
| Mettre en ligne | ✅ après merge PR | Vercel déploie |

**Cafeyn / Edge / Mozilla** : vous lisez l’actu comme aujourd’hui → vous copiez **titre + lien** dans la boîte actu → l’agent fait le reste.

## Démarrage rapide

```bash
# 1. Récupérer candidats (RSS + file manuelle)
npm run blog:actu:fetch

# 2. Voir l'état
npm run blog:actu:status

# 3. Créer 2 ébauches d'articles
npm run blog:actu:draft -- --top=2

# 4. (Agent Cursor) enrichir data/blog-actu-pending.json — contenu long, FAQ, angle lead

# 5. Publier HTML + sitemap
npm run blog:actu:publish
```

## Workflow Cafeyn (recommandé)

1. Lisez un article sur **Cafeyn** (Midi Libre, Parents, etc.)
2. Ouvrez **https://www.leadsopportunities.fr/blog/actu-inbox.html** (après déploiement)
3. Collez titre + URL + note (« lien mutuelle », « chien guide », etc.)
4. **Copier le JSON** → envoyez à Cursor : *« Ajoute à blog-actu-queue et crée l’article »*
5. L’agent enrichit, lance `blog:actu:publish`, ouvre une PR → **merge** → article en ligne

Alternative : éditez directement `data/blog-actu-queue.json` :

```json
{
  "items": [
    {
      "id": "cafeyn-001",
      "title": "Votre titre d'actu",
      "url": "https://...",
      "source": "cafeyn",
      "note": "Angle assurance animaux / habitation",
      "status": "pending",
      "addedAt": "2026-06-16T12:00:00.000Z"
    }
  ]
}
```

## Automation Cursor (souvent / quotidien)

Dans **Cursor → Automations → New Automation** :

| Paramètre | Valeur |
|-----------|--------|
| Déclencheur | **Scheduled** (ex. tous les jours 7h) ou **Manuel** |
| Branche | `main` |
| Instructions | Copier le prompt ci-dessous |

### Prompt automation (à coller)

```
Tu es l'éditeur blog assurance de Leads Opportunities (courtier ORIAS, leads qualifiés).

1. Lance `npm run blog:actu:fetch` puis `npm run blog:actu:status`
2. Lis data/blog-actu-queue.json et data/blog-actu-candidates.json
3. Choisis les 2 meilleurs sujets PAS encore publiés (priorité: file manuelle Cafeyn/Edge, puis RSS)
4. Pour chaque sujet:
   - Rédige un article COMPLET (8+ blocs, angle assurance concret, CTA questionnaire)
   - Ajoute dans data/blog-actu-pending.json (section actu/sante/auto/etc. selon sujet)
   - Lien fort vers questionnaire: ../landings/questionnaire.html?need=XXX&journey=standard&utm_source=blog&utm_medium=actu
5. Lance `npm run blog:actu:publish`
6. Commit, push branche cursor/blog-actu-YYYYMMDD-3a54, ouvre PR draft
7. Ne duplique jamais un slug existant dans blog/

Règles éditoriales: accroche actu → risque réel → checklist → CTA questionnaire. Ton conseiller, pas journaliste pur.
```

## Fichiers du pipeline

| Fichier | Rôle |
|---------|------|
| `data/blog-actu-feeds.json` | Flux RSS publics |
| `data/blog-actu-keywords.json` | Actu → section assurance + CTA |
| `data/blog-actu-queue.json` | Vos actus Cafeyn / Edge (manuel) |
| `data/blog-actu-candidates.json` | Sortie du fetch |
| `data/blog-actu-pending.json` | Articles prêts à générer en HTML |
| `data/blog-actu-state.json` | URLs déjà traitées |
| `blog/actu-inbox.html` | Formulaire copier-coller |
| `scripts/blog-actu-lib.cjs` | Logique commune |

## Leads ultra qualifiés — bonnes pratiques

1. **CTA questionnaire** en milieu et fin d’article (`{ type: "bridge" }`)
2. **UTM** : `utm_source=blog&utm_medium=actu&utm_campaign={need}`
3. **Clarity + GA4** : tags `article_slug`, events `blog_cta_click` (déjà en place)
4. **Sujets qui convertissent** : sinistre habitation, hausse mutuelle, jeune conducteur, VTC, animaux, Lemoine
5. **Actu people / sport / gaming** : comme vos articles GTA 6, Ligue des champions — accroche large, conversion assurance

## Limites légales

- Ne **copiez pas** le texte intégral des journaux (Cafeyn) : réécrivez avec votre angle conseil assurance.
- Citez la source dans l’article (« selon les informations relayées par… ») sans plagiat.
- RSS publics : titres + résumés pour inspiration uniquement.

## Après publication

```bash
npm run blog:actu:publish   # blog:build + seo:build
```

Merge PR → Vercel → Google indexe en quelques jours (Search Console).
