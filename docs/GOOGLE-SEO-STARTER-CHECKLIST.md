# Checklist Google SEO Starter → Leads Opportunities

Source : [Bien débuter en SEO](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=fr) + Essentiels, contenus people-first, QAPage, DiscussionForumPosting.

## Exploration & indexation

| Recommandation Google | Statut site |
|----------------------|-------------|
| Sitemap XML | `sitemap.xml` + `sitemap-main` (blog, forum, landings) |
| robots.txt n’interdit pas CSS/JS | `Allow: /css/`, `/js/`, `/assets/`, `/forum/`, `/blog/` |
| Pages privées en `Disallow` / noindex | CRM, dashboard, api, external |
| Liens internes vers pages importantes | Accueil → Forum ; Nancy 54 ; landings mutuelle/VTC/crédit |
| Canonical | Pages forum / blog / home |

## Comprendre le contenu

| Recommandation | Statut |
|----------------|--------|
| `<title>` unique descriptif | Forum / blog générés |
| Meta description | Oui |
| Hiérarchie H1 → H2 | 1 H1 par fil / thème |
| Données structurées | Organization, QAPage, DiscussionForumPosting, BreadcrumbList, FAQ blog |
| Texte d’ancrage descriptif | Liens « Lire la réponse à « … » », pas « cliquez ici » |
| Images / alt | Logos avec alt marque |

## Apparence & confiance (YMYL assurance/crédit)

| Recommandation | Statut |
|----------------|--------|
| E-E-A-T : qui a écrit | Bloc Wendy Buchet + ORIAS + Person schema |
| Contenu people-first | Réponses courtier, pas stuffing |
| Date visible | `<time datetime>` sur fils forum |
| Contact clair | mailto + téléphone |

## Mobile & UX

| Recommandation | Statut |
|----------------|--------|
| Viewport | Oui |
| Partage social (découverte) | Open Graph + Facebook sharer |

## UGC / forum

Les demandes du formulaire public partent en **lead CRM** (`source=forum`), pas en posts HTML publics — évite le spam UGC. Si un jour des posts users sont publiés : `rel="nofollow ugc"` sur leurs liens (consigne Google starter).

## Vérif

```bash
npm run forum:build
npm run verify:forum-seo
npm run verify:google-seo-starter
```

## Patience

Google : les effets SEO se mesurent en **semaines / mois**. Utiliser Search Console (inspection d’URL, couverture, performances).
