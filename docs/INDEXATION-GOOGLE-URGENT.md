# Indexation Google — guide urgent (Leads Opportunities)

**Constat (juin 2026)** : une recherche `site:leadsopportunities.fr` sur Google renvoie **aucune page** (vérifié le 15/06/2026). Ce n’est pas un bug du site : Google n’a **pas encore indexé** le domaine (site récent et/ou propriété Search Console non finalisée).

Le site est **techniquement prêt** (robots, sitemaps, balises, redirections www). Ce guide décrit ce que **vous** devez faire aujourd’hui — l’indexation ne peut pas être forcée instantanément par le code seul.

---

## Étape 1 — Google Search Console (30 min, indispensable)

1. Ouvrez [Google Search Console](https://search.google.com/search-console).
2. **Ajouter une propriété** → type **Préfixe d’URL** : `https://www.leadsopportunities.fr/`
3. **Vérification** : la balise est déjà sur l’accueil :
   - `google-site-verification` = `ScnkvjLBpwnI_QIExLhB1bMxxvGnNZSmiqFgexE9x64`
   - Cliquez sur **Vérifier** dans Search Console.
4. Menu **Sitemaps** → ajoutez : `https://www.leadsopportunities.fr/sitemap.xml`
5. Attendez le statut **Réussi** (parfois quelques heures).

---

## Étape 2 — Demander l’indexation des pages clés (15 min)

Dans Search Console → **Inspection de l’URL**, testez puis **Demander l’indexation** pour :

| Priorité | URL |
|----------|-----|
| 1 | `https://www.leadsopportunities.fr/` |
| 2 | `https://www.leadsopportunities.fr/nos-services.html` |
| 3 | `https://www.leadsopportunities.fr/landings/vtc.html` |
| 4 | `https://www.leadsopportunities.fr/landings/sante.html` |
| 5 | `https://www.leadsopportunities.fr/landings/sante-collective.html` |
| 6 | `https://www.leadsopportunities.fr/landings/credit-immo.html` |
| 7 | `https://www.leadsopportunities.fr/landings/devis.html` |
| 8 | `https://www.leadsopportunities.fr/blog/mutuelle-collective-obligations-employeur-ani.html` |
| 9 | `https://www.leadsopportunities.fr/france/` |
| 10 | `https://www.leadsopportunities.fr/blog/` |

Limite Google : quelques dizaines de demandes par jour — concentrez-vous sur l’accueil et les landings d’abord.

---

## Étape 3 — Vérifier que tout répond bien (2 min)

Ouvrez dans le navigateur (doit afficher du XML ou une page, **pas** d’erreur 500) :

- `https://www.leadsopportunities.fr/robots.txt`
- `https://www.leadsopportunities.fr/sitemap.xml`
- `https://www.leadsopportunities.fr/sitemap-main.xml`

Test Google : tapez `site:leadsopportunities.fr` — les premières pages peuvent apparaître sous **3 à 14 jours** après les étapes 1–2.

---

## Étape 4 — Signaux hors Google (accélère la découverte)

### Fiche Google Business Profile

Créez ou revendiquez votre fiche **Google Business** (nom, adresse ou zone, téléphone, site = `https://www.leadsopportunities.fr`). C’est souvent la **première** apparition sur Google Maps / recherche locale.

### Liens entrants (backlinks)

Google découvre plus vite un site **lié depuis ailleurs** :

- Page Facebook / Instagram (lien vers le site dans la bio)
- Signature e-mail `contact@leadsopportunities.fr`
- Annuaires pro (PagesJaunes, etc.) si pertinents
- Partenaires courtiers (un lien « site web »)

### Bing (bonus automatique sur le site)

Le déploiement envoie des signaux **IndexNow** + ping sitemap Bing via le cron quotidien. Pour Bing Webmaster Tools : [https://www.bing.com/webmasters](https://www.bing.com/webmasters) → ajoutez le site + sitemap (même URL que Google).

---

## Étape 5 — Délais réalistes

| Situation | Délai typique |
|-----------|----------------|
| Première indexation (accueil + quelques pages) | 3–14 jours |
| Pages SEO locales (centaines d’URLs) | plusieurs semaines |
| Positionnement sur des requêtes concurrentielles (« assurance VTC ») | mois + contenu + autorité |

**Les pubs Meta/Google ne remplacent pas le SEO** : elles amènent du trafic payant ; l’indexation organique passe par Search Console et le temps.

---

## Automatisation côté site (déjà en place)

- Cron Vercel : après la sync messagerie, ping sitemap + **IndexNow** (URLs prioritaires).
- Fichier clé IndexNow : `https://www.leadsopportunities.fr/7c4e9f2a1b8d6035leadsop.txt`
- Déclenchement manuel (si `CRON_SECRET` est défini sur Vercel) :

```bash
curl -H "Authorization: Bearer VOTRE_CRON_SECRET" "https://www.leadsopportunities.fr/api/mailbox/cron-sync"
```

La réponse JSON inclut un bloc `seo` avec le résultat des pings.

---

## Checklist rapide

- [ ] Propriété Search Console vérifiée (`https://www.leadsopportunities.fr/`)
- [ ] Sitemap soumis et sans erreur
- [ ] Indexation demandée pour l’accueil + 5–7 URLs clés
- [ ] Fiche Google Business créée / à jour
- [ ] Lien site sur Facebook + e-mail pro
- [ ] Dans 7 jours : retester `site:leadsopportunities.fr`

---

## Besoin d’aide ?

Si Search Console affiche **« URL exclue »**, **« Bloquée par robots.txt »** ou **« Erreur serveur »** sur une URL précise, copiez le message exact — on pourra corriger côté technique.

Voir aussi `CONNECT.md` (section Search Console).
