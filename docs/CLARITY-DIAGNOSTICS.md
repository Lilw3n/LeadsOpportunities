# Clarity — clics et diagnostics UX

Projet : **x7yqp46fj9** · Script : `js/clarity-init.js` (rebuild : `npm run build:clarity`)

## Ce qui est enregistré automatiquement

Sur **toutes les pages** (accueil, landings, blog, SEO), chaque clic envoie des **tags** et **événements** Clarity :

| Tag Clarity | Exemple | Usage dashboard |
|-------------|---------|-----------------|
| `last_click_zone` | `hero`, `contact_form`, `navigation` | Où sur la page |
| `last_click_label` | `Devis gratuit`, `Assurance VTC` | Quel élément |
| `last_click_type` | `link`, `button`, `phone` | Type d’action |
| `last_click_url` | `/landings/vtc.html` | Destination |
| `page_section` | `home`, `blog`, `seo`, `landing` | Type de page |

### Événements diagnostic

| Événement | Déclenché quand |
|-----------|-----------------|
| `click_cta` | Bouton / zone CTA (hero, contact, mobile…) |
| `click_zone_*` | Par zone (`click_zone_hero`, `click_zone_contact_form`…) |
| `dead_click` | Clic sur zone non cliquable (frustration) |
| `rage_click` | 3+ clics rapides au même endroit |
| `priority_click` | Session marquée prioritaire (CTA important) |

Clarity détecte aussi nativement **rage clicks** et **dead clicks** dans le tableau de bord.

## Voir où les gens cliquent (heatmaps)

1. [clarity.microsoft.com](https://clarity.microsoft.com) → projet **x7yqp46fj9**
2. **Cartes thermiques** → choisir une URL (ex. `/` ou `/landings/vtc.html`)
3. Onglet **Clics** : carte des zones les plus cliquées

## Filtrer les enregistrements par clic

1. **Enregistrements** → **Filtres**
2. **Balises personnalisées** :
   - `last_click_zone` = `contact_form` → sessions qui ont cliqué le formulaire
   - `last_click_label` contient `Devis`
   - `page_section` = `home`

Sessions avec **rage_click** ou **dead_click** : filtre **Événements personnalisés** → `rage_click` / `dead_click`.

## Zones nommées sur l’accueil

Attributs `data-clarity-zone` / `data-clarity-label` sur les blocs clés :

- `hero` — bannière principale
- `contact_form` — formulaire devis
- `mobile_cta` — bouton fixe mobile

Pour nommer un bouton ailleurs :

```html
<a href="..." data-clarity-label="Questionnaire mutuelle">Comparer</a>
<section data-clarity-zone="pricing">...</section>
```

## Questionnaires / landings

Les étapes wizard envoient déjà `lo:wizard_step` → tags `wizard_step`, `vertical`, événement `wizard_step_N`.

## Fichiers

- `js/clarity-click-diagnostics.mjs` — logique clics + diagnostics
- `js/clarity-source.mjs` — bundle dans `clarity-init.js`
- `js/blog-reading-analytics.js` — lecture + clics blog (GA4 + miroir Clarity)
