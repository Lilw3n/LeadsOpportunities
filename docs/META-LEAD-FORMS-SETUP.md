# Meta Lead Ads — questionnaires express par vertical

Guide pour créer dans **Meta Ads Manager** les formulaires instantanés alignés sur vos landings et le CRM Leads Opportunities.

Référence technique : `config/meta-lead-forms.json` · Webhook : `/api/webhooks/meta-lead` · Doc générale : [META-ADS-AUTOMATION.md](./META-ADS-AUTOMATION.md)

## Budget pub — 1 €/jour max

- **Plafond global : 1 €/jour** pour tout le compte Meta (`997768686183548`)
- **Une seule campagne / annonce active** — ne pas lancer une pub par vertical ou par article
- Les 6 formulaires servent à **préparer** les assets ; la pub payante reste **unique** jusqu’à validation CPL
- Voir `ads_policy` dans `config/meta-lead-forms.json`

---

## Principe : court, pertinent, prérempli

| Règle | Pourquoi |
|-------|----------|
| **1 à 3 questions métier** max | Taux de complétion Meta > questionnaire site long |
| **Coordonnées préremplies** (nom, email, tel, ville, CP) | Facebook remplit si l'utilisateur est connecté |
| **Choix multiples** plutôt que texte libre | Mapping CRM fiable + montage devis rapide |
| **1 formulaire = 1 vertical** | Campagnes et audiences ciblées par produit |

Champs préremplis Meta à activer sur **chaque** formulaire :

- Nom complet (`full_name`)
- Prénom / Nom (`first_name`, `last_name`)
- E-mail (`email`)
- Téléphone (`phone_number`)
- Ville (`city`)
- Code postal (`post_code`)

---

## Priorité par thèmes blog (trafic & conversion)

Ordre recommandé pour vos campagnes (articles les plus consultés / meilleurs leads) :

| Priorité | Template | Vertical | Articles blog liés |
|----------|----------|----------|-------------------|
| 1 | `vtc_express` | VTC | vtc-premiere-course, assurance-vtc-moins-cher, uber-bolt-heetch |
| 2 | `sante_express` | Mutuelle | mutuelle-5-criteres, questionnaire-mutuelle, inflation-mutuelle |
| 3 | `credit_immo_express` | Crédit / emprunteur | loi-lemoine, economiser-lemoine, taux-credit-2026 |
| 4 | `habitation_express` | Habitation | locataire-proprietaire, sous-assurance-sinistre |
| 5 | `auto_express` | Auto | jeune-conducteur, bonus-malus |
| 99 | `rappel_universal` | Tous produits | Retargeting large / lookalike |

---

## Création automatique (API Graph — recommandé)

Les formulaires peuvent être **créés directement sur votre page Facebook** sans copier-coller manuel dans Ads Manager.

### Étape 1 — Classement blog + leads CRM

```bash
npm run meta:forms:rank
```

Produit `data/meta-blog-form-ranking.json` :
- priorité depuis `ads/meta-blog-conversions.csv`
- leads CRM comptés si `DATABASE_URL` est défini (referrer / landing blog)
- GA4 / Clarity : consultez les dashboards (événements `blog_cta_click`, `blog_read_complete` par slug)

### Étape 2 — Simulation (sans publier)

```bash
npm run meta:forms:plan
```

### Étape 3 — Création sur Meta (page `1183829618147455`)

Sur Vercel, vérifiez **`META_PAGE_ACCESS_TOKEN`** (permissions `pages_manage_ads`, `leads_retrieval`).

En local ou CI :

```bash
export META_PAGE_ACCESS_TOKEN="votre_token_page"
export META_PAGE_ID="1183829618147455"
npm run meta:forms:create
```

Le script :
1. Crée les 6 formulaires (`vtc_express`, `sante_express`, etc.)
2. Enregistre les **`form_id`** dans `config/meta-lead-forms.json`
3. Log dans `data/meta-lead-forms-created.json`

Un seul template :

```bash
node scripts/meta-create-lead-forms.cjs --create --template=vtc_express
```

**Limites :** sans token Meta valide, l’agent ne peut pas cliquer à votre place dans Business Manager — le script fait le travail dès que le token est configuré.

---

## Création dans Meta Ads Manager

1. **Page** : `1183829618147455`
2. **Outils** → **Formulaires instantanés** → **Créer**
3. Type : **Plus de volume** (moins de friction)
4. Intro : copier le champ `intro` du template JSON
5. Questions : copier-coller ci-dessous
6. Champs contact : activer les champs préremplis listés plus haut
7. Politique de confidentialité : URL de votre site
8. Après création : noter le **form_id** et l’ajouter dans `config/meta-lead-forms.json` :

```json
"forms": {
  "VOTRE_FORM_ID_META": {
    "template": "vtc_express",
    "vertical": "vtc",
    "campaign": "meta_vtc_convert",
    "landing": "/landings/devis-rapide.html"
  }
}
```

9. Webhook page déjà configuré → `https://www.leadsopportunities.fr/api/webhooks/meta-lead`

---

## Template 1 — VTC express (`vtc_express`)

**Intro :** Devis assurance VTC en 30 secondes — 3 questions + vos coordonnées (préremplies Facebook si connecté).

| # | Question | Type | Options |
|---|----------|------|---------|
| 1 | Sur quelle plateforme roulez-vous ? | Choix multiple | Uber · Bolt · Heetch · Plusieurs plateformes · Pas encore inscrit |
| 2 | Votre statut VTC ? | Choix multiple | Carte VTC en cours · Carte VTC obtenue · Société / SARL · Auto-entrepreneur |
| 3 | Code postal d'activité | Réponse courte | (texte libre) |

**Landing cible :** `/landings/devis-rapide.html`  
**Campagne UTM :** `utm_campaign=meta_vtc_convert`

---

## Template 2 — Mutuelle express (`sante_express`)

**Intro :** Comparez votre mutuelle — 3 questions ciblées, sans questionnaire long.

| # | Question | Type | Options |
|---|----------|------|---------|
| 1 | Pour qui cherchez-vous une mutuelle ? | Choix multiple | Moi seul · Couple · Famille avec enfant(s) · Senior |
| 2 | Votre priorité santé ? | Choix multiple | Optique & dentaire · Hospitalisation · Consultations / médecines douces · Budget le plus bas |
| 3 | Avez-vous déjà une mutuelle ? | Choix multiple | Oui — je veux comparer · Non — première mutuelle · Oui — trop cher |

**Landing :** `/landings/sante.html`  
**Campagne :** `meta_sante_convert`

---

## Template 3 — Crédit / emprunteur (`credit_immo_express`)

**Intro :** Étude crédit ou assurance emprunteur — 3 questions pour préparer votre dossier.

| # | Question | Type | Options |
|---|----------|------|---------|
| 1 | Votre projet ? | Choix multiple | Achat résidence principale · Investissement locatif · Rachat de crédit · Assurance emprunteur (Loi Lemoine) |
| 2 | Où en êtes-vous ? | Choix multiple | Je cherche encore · Bien identifié · Offre acceptée / compromis · Déjà emprunteur — renégocier |
| 3 | Budget ou montant approximatif ? | Choix multiple | Moins de 150 000 € · 150 000 – 300 000 € · Plus de 300 000 € · Je ne sais pas encore |

**Landing :** `/landings/credit-immo.html`  
**Campagne :** `meta_credit_convert`

---

## Template 4 — Habitation (`habitation_express`)

**Intro :** Assurance habitation — locataire ou propriétaire en 3 questions.

| # | Question | Type | Options |
|---|----------|------|---------|
| 1 | Vous êtes ? | Choix multiple | Locataire · Propriétaire occupant · Propriétaire bailleur (PNO) · Colocation |
| 2 | Type de logement ? | Choix multiple | Appartement · Maison · Studio · Autre |
| 3 | Surface approximative ? | Choix multiple | Moins de 40 m² · 40 – 80 m² · 80 – 120 m² · Plus de 120 m² |

**Landing :** `/landings/devis.html?need=habitation`  
**Campagne :** `meta_habitation_convert`

---

## Template 5 — Auto (`auto_express`)

**Intro :** Assurance auto — 3 questions pour un devis ciblé.

| # | Question | Type | Options |
|---|----------|------|---------|
| 1 | Votre profil conducteur ? | Choix multiple | Jeune conducteur (&lt; 3 ans) · Conducteur expérimenté · Second véhicule · Flotte pro |
| 2 | Formule souhaitée ? | Choix multiple | Tiers simple · Tiers étendu · Tous risques · Je ne sais pas |
| 3 | Bonus-malus actuel ? | Choix multiple | 50 ou moins · 51 – 80 · 81 – 100 · Plus de 100 / malus |

**Landing :** `/landings/devis.html?need=auto`  
**Campagne :** `meta_auto_convert`

---

## Template 6 — Rappel universel (`rappel_universal`)

**Intro :** Un conseiller vous rappelle — indiquez votre besoin en 1 question.

| # | Question | Type | Options |
|---|----------|------|---------|
| 1 | Quel produit vous intéresse ? | Choix multiple | Mutuelle santé · Assurance VTC · Crédit / emprunteur · Habitation · Auto · Autre assurance |

**Landing :** `/landings/rappel.html`  
**Campagne :** `meta_rappel_convert`  
**Usage :** retargeting blog, lookalike leads, annonces génériques

---

## Ce que le CRM enregistre automatiquement

À réception webhook, le serveur :

1. Récupère le lead via **Graph API** (`META_PAGE_ACCESS_TOKEN`)
2. Mappe les réponses → champs devis (`vtcPlatform`, `householdType`, etc.)
3. Calcule `devis_summary`, `questionnaire_step/total`, score lead
4. Insère dans `site_leads` + CRM contact si e-mail présent
5. Envoie **CAPI Lead** pour optimisation campagne

### Où voir les leads dans le CRM

| Page | Rôle |
|------|------|
| `crm-meta-inbox.html` | Boîte Meta — résumé devis + actions rapides |
| `crm-acquisition.html` | Pipeline kanban multi-sources |
| `crm-lead-detail.html` | Fiche complète + panel Meta |
| `dashboard.html` | Modal lead avec bloc Meta |

---

## Lier annonces blog → formulaire Meta

**Phase actuelle : une seule annonce, 1 €/jour max.** Ne pas créer d’annonce par article.

Quand vous lancez la **première** pub (vertical prioritaire #1 = VTC) :

- **Creative** : visuel article + accroche issue du H1
- **Formulaire** : template `vtc_express` (ou vertical choisi — un seul)
- **Budget** : 1 €/jour dans Ads Manager
- **UTM** : `utm_source=meta&utm_medium=paid_social&utm_campaign=<campaign du template>`

Les autres templates / articles restent en réserve — pas de campagnes parallèles.

---

## Checklist mise en production

- [ ] Variables Vercel : `META_PIXEL_ID`, `META_PAGE_ACCESS_TOKEN`, `META_APP_SECRET`, `META_VERIFY_TOKEN`
- [ ] Redeploy Vercel
- [ ] Webhook page abonné à `leadgen`
- [ ] 6 formulaires créés + `form_id` dans `config/meta-lead-forms.json`
- [ ] Test : soumettre un lead test → vérifier `crm-meta-inbox.html`
- [ ] Events Manager : événement `Lead` (CAPI) reçu
- [ ] **Budget pub : 1 €/jour max**, **1 seule annonce** active (pas de multiplication)
- [ ] CPL organique validé avant scale (voir `docs/ACQUISITION-BLOG-CONVERSION.md`)

---

## Données Facebook autorisées

Meta préremplit selon le profil utilisateur et les autorisations du formulaire. Le webhook reçoit aussi :

- `ad_id`, `campaign_id`, `form_id`, `platform` (Facebook / Instagram)
- Horodatage lead, identifiant leadgen

Les données sont stockées dans `payload` JSON du lead CRM — **ne pas** demander plus de champs que nécessaire (RGPD + taux de complétion).
