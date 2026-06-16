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

## Option heatmaps (cartes de chaleur)

Pour voir visuellement où les gens cliquent :

- [Microsoft Clarity](https://clarity.microsoft.com/) — gratuit, enregistrements + heatmaps  
- Ajoutez le snippet Clarity dans `google-config.js` ou via variable d’environnement si vous l’activez plus tard

## Regénérer les articles après modification

```bash
npm run blog:build
```

Puis déployer sur Vercel.

## Fichiers concernés

- `js/blog-reading-analytics.js` — logique de tracking  
- `scripts/generate-blog-articles.cjs` — injection script + `data-blog-*` sur `<body>`  
- `scripts/generate-blog-index.cjs` — tracking sur l’index blog
