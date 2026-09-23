# Analytics blog — lecture et clics

Ce guide explique comment mesurer **jusqu’où les visiteurs lisent** et **où ils cliquent** sur les articles du blog.

## Outil principal : Google Analytics 4 (GA4)

Le site envoie déjà des événements via la propriété **G-JX8E35693F**.  
Le script `js/blog-reading-analytics.js` est chargé sur :

- chaque article `blog/*.html` (généré par `npm run blog:build`)
- la page `blog/index.html`

### Événements envoyés

| Événement | Quand | Paramètres utiles |
|-----------|--------|-------------------|
| `blog_article_view` | Ouverture d’un article | `article_slug`, `article_section`, `article_tag` |
| `blog_scroll_depth` | Scroll 25 %, 50 %, 75 %, 90 %, 100 % | `percent_scrolled` |
| `blog_read_complete` | Scroll 100 % | `read_complete` |
| `blog_section_view` | Bloc visible à l’écran | `section_name` : `intro`, `bridge_mid`, `bridge_footer`, `faq`, `related_links` |
| `blog_cta_click` | Clic sur un bouton (`.btn`) | `link_text`, `link_zone`, `need` |
| `blog_link_click` | Clic sur un lien texte | `link_url`, `link_zone` |
| `blog_faq_open` | Ouverture d’une question FAQ | `faq_question` |
| `blog_engagement` | Fin de visite (onglet fermé / navigation) | `time_on_page_sec`, `max_scroll_percent` |
| `blog_card_click` | Clic carte sur `blog/index.html` | `link_text`, `card_tag` |

## Voir les données dans GA4 (15 min de config)

### 1. Vérifier que les événements arrivent

1. [Google Analytics](https://analytics.google.com) → propriété Leads Opportunities  
2. **Rapports** → **Temps réel** → ouvrez un article blog en navigation privée  
3. Vous devez voir `blog_article_view`, puis `blog_scroll_depth` en scrollant

### 2. Rapport « Profondeur de lecture par article »

1. **Exploration** → **Exploration libre**  
2. Technique : **Analyse de cohorte** ou tableau libre  
3. **Dimensions** : `article_slug`, `percent_scrolled` (événement `blog_scroll_depth`)  
4. **Métrique** : Nombre d’événements  
5. Filtre : Nom de l’événement = `blog_scroll_depth`

Vous voyez combien de sessions atteignent 25 %, 50 %, 75 %, 100 % par article.

### 3. Rapport « Clics CTA »

1. **Exploration libre**  
2. Lignes : `article_slug`  
3. Colonnes : `link_text` ou `link_zone`  
4. Filtre : événement = `blog_cta_click`  
5. Métrique : Nombre d’événements

Comparez par exemple **Questionnaire auto** vs **Rappel auto** sur `assurance-auto-bonus-malus`.

### 4. Enregistrer des dimensions personnalisées (recommandé)

**Admin** → **Affichage des données** → **Définitions personnalisées** → **Créer une dimension personnalisée** :

| Nom | Portée | Paramètre d’événement |
|-----|--------|------------------------|
| Article blog | Événement | `article_slug` |
| Section blog | Événement | `section_name` |
| Zone clic | Événement | `link_zone` |
| Profondeur scroll | Événement | `percent_scrolled` |

Attendre 24–48 h pour l’historique enrichi.

## Search Console ≠ comportement on-site

**Performances** dans Search Console = impressions et clics **depuis Google** (0 clic avec 241 impressions = normal au début).

Pour **lecture et clics dans la page**, utilisez **GA4** (ou un outil heatmap ci-dessous).

## Option heatmaps (cartes de chaleur) — Microsoft Clarity

Clarity est intégré via le package officiel [`@microsoft/clarity`](https://www.npmjs.com/package/@microsoft/clarity), bundlé en `js/clarity-init.js` et chargé par `google-config.js` sur **toutes les pages**.

Projet actif : **`x7yqp46fj9`** (modifiable via `CLARITY_PROJECT_ID` sur Vercel).

### Activer / modifier

1. ID par défaut dans `google-config.js` ou variable Vercel `CLARITY_PROJECT_ID`
2. Après modification de `js/clarity-source.mjs` : `npm run build:clarity`
3. **Redeploy** sur Vercel

### Tags et événements Clarity (blog)

En plus des heatmaps natives, le blog envoie des **Smart events** et **tags** filtrables dans Clarity :

| Clarity | Déclencheur |
|---------|-------------|
| Tag `article_slug` | Ouverture article |
| Event `blog_scroll_50`, `blog_scroll_75`… | Profondeur de scroll |
| Event `blog_cta_click` + tag `last_cta` | Clic bouton CTA |
| Upgrade `cta_click` / `read_complete` | Sessions prioritaires dans les replays |
| Tag `section_seen` | Bloc FAQ / CTA milieu vu |

### Ce que vous voyez dans Clarity

| Rapport | Usage blog |
|---------|------------|
| **Heatmaps** | Où les visiteurs cliquent sur l’article (CTA milieu vs bas) |
| **Scroll maps** | Jusqu’où ils descendent visuellement |
| **Enregistrements** | Replay d’une session réelle sur `assurance-auto-bonus-malus` |
| **Filtres** | Par URL : `/blog/assurance-auto-bonus-malus.html` |

Complémentaire à GA4 : GA4 = chiffres agrégés ; Clarity = vision qualitative.

## CRM — stats concrètes sur le site

Page CRM : **`/crm-blog-stats.html`** (sidebar → *Stats blog & forum*).

API : `GET /api/crm/blog-stats?days=30` (auth CRM).

Données affichées :
- pages vues `/blog` et `/forum` (`journey_events.page_view`)
- clics CTA / lectures 100 % (`blog_cta_click`, `blog_read_complete` — miroir first-party depuis `js/blog-reading-analytics.js`)
- leads CRM dont landing/UTM touche blog ou forum
- inventaire d’articles publiés + liens GA4 / Clarity / Search Console

Vérif : `npm run verify:blog-stats-crm`

## Regénérer les articles après modification

```bash
npm run blog:build
```

Puis déployer sur Vercel.

## Fichiers concernés

- `js/blog-reading-analytics.js` — tracking GA4 + miroir Neon (`/api/journey-event`)
- `crm-blog-stats.html` / `crm-blog-stats.js` — dashboard CRM
- `api/_lib/blog-stats.js` + `api/_lib/routes/crm-blog-stats.js`
- `js/clarity-source.mjs` + `js/clarity-init.js` — package `@microsoft/clarity` (rebuild : `npm run build:clarity`)
- `google-config.js` — charge Clarity si `CLARITY_PROJECT_ID` est défini
- `scripts/generate-blog-articles.cjs` — injection script + `data-blog-*` sur `<body>`
- `scripts/generate-blog-index.cjs` — tracking sur l’index blog
