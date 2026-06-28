# Connexions — Leads Opportunities

Site en ligne : [https://www.leadsopportunities.fr](https://www.leadsopportunities.fr)

Depot GitHub : [https://github.com/Lilw3n/LeadsOpportunities](https://github.com/Lilw3n/LeadsOpportunities)

---

## 1. Vercel (variables d’environnement)

Tableau de bord : [https://vercel.com/dashboard](https://vercel.com/dashboard)

Chemin : ton projet **LeadsOpportunities** (ou import GitHub) → **Settings** → **Environment Variables**.

Ajouter / verifier (voir aussi `.env.example`) :

| Variable | Role |
|----------|------|
| `DATABASE_URL` | URI Postgres Neon (onglet **Connection details** du projet Neon) |
| `RESEND_API_KEY` | Cle API [Resend](https://resend.com/api-keys) |
| `LEAD_NOTIFICATION_EMAIL` | Un ou plusieurs e-mails, separes par une virgule (ex. `courtier972@gmail.com,contact@leadsopportunities.fr`) |
| `LEAD_NOTIFY_INCLUDE_MAILBOX` | `true` (defaut) : ajoute aussi `MAILBOX_ADDRESS` aux alertes formulaire |
| `LEAD_FROM_EMAIL` | Expéditeur verifie chez Resend |
| `LEADS_ADMIN_TOKEN` | Secret au choix pour charger les leads dans `/admin.html` |
| `LEAD_WEBHOOK_URL` | Optionnel (Zapier, Make, n8n) |
| `SLACK_WEBHOOK_URL` | Optionnel — alertes leads Slack (Incoming Webhook, plan gratuit) · **`docs/SLACK-WITHALLO-NOTIFS.md`** |
| `WITHALLO_WEBHOOK_SECRET` | Optionnel — quand WithAllo actif · webhook entrant `/api/webhooks/withallo` |
| `STRIPE_*` | Deja pour les paiements |

Apres modification : **Redeploy** le dernier deploiement ou push sur `main`.

---

## 2. Neon (base des leads)

Console Neon : [https://console.neon.tech](https://console.neon.tech)

Projet dedie **LeadsOpportunities** : [https://console.neon.tech/app/projects/broad-poetry-27324931](https://console.neon.tech/app/projects/broad-poetry-27324931)

- Onglet **Dashboard** → **Connect** : copier **`DATABASE_URL`** (pooler recommande pour Vercel).
- La table `site_leads` est deja creee sur ce projet.

**Securite :** si une cle de connexion a ete exposee, regenere le mot de passe du role dans Neon (**Roles** / **Reset password**) puis mets a jour `DATABASE_URL` sur Vercel.

---

## 3. Resend (e-mail a chaque lead)

- Compte / API : [https://resend.com](https://resend.com)
- Cles API : [https://resend.com/api-keys](https://resend.com/api-keys)
- Domaines (expéditeur prod) : [https://resend.com/domains](https://resend.com/domains)

En test, Resend autorise `onboarding@resend.dev` comme expéditeur (sans verifier le domaine).

**Erreur 403 « domain is not verified »** : Resend refuse `contact@leadsopportunities.fr` tant que le domaine n’est pas verifie.

- **Solution rapide (quelques minutes)** — sur Vercel, temporairement :
  - `MAILBOX_FROM` = `Leads Opportunities <onboarding@resend.dev>`
  - `LEAD_FROM_EMAIL` = `Leads Opportunities <onboarding@resend.dev>`
  - Puis **Redeploy**. Les e-mails partent ; l’expéditeur affiche `onboarding@resend.dev`.
- **Solution prod** — [resend.com/domains](https://resend.com/domains) → **Add domain** → `leadsopportunities.fr` → copier les enregistrements **SPF** et **DKIM** dans la zone DNS o2switch (cPanel) → attendre **Verified** → remettre :
  - `MAILBOX_FROM` = `Leads Opportunities <contact@leadsopportunities.fr>`

Pour **repondre depuis le dashboard** (`/dashboard.html` → Messagerie), le domaine doit etre **Verified** chez Resend (ou utiliser l’expéditeur test ci-dessus).

---

## 3b. Messagerie dashboard (lire + repondre)

1. **Neon** : executer `database/mailbox.sql` dans le SQL Editor (une fois).
2. **Vercel** — variables supplementaires :

| Variable | Exemple |
|----------|---------|
| `MAIL_IMAP_HOST` | **`mail.sodium.o2switch.net`** (certificat o2switch ; login = `contact@leadsopportunities.fr`) |
| `MAIL_IMAP_TLS_SERVERNAME` | `mail.sodium.o2switch.net` (defaut auto si non renseigne) |
| `MAIL_IMAP_PORT` | `993` |
| `MAIL_IMAP_USER` | `contact@leadsopportunities.fr` |
| `MAIL_IMAP_PASS` | mot de passe boite o2switch |
| `MAILBOX_ADDRESS` | `contact@leadsopportunities.fr` |
| `MAILBOX_FROM` | `Leads Opportunities <contact@leadsopportunities.fr>` |
| `MAIL_IMAP_TLS_INSECURE` | `true` seulement si erreur certificat TLS |

3. **Dashboard** : connexion compte **admin** → **Messagerie** — les e-mails `contact@` sont importes automatiquement (ouverture de la page, toutes les 8 min) et via cron Vercel toutes les **15 min** si `CRON_SECRET` est defini.
4. **Variables sync** : `MAILBOX_AUTO_SYNC=true`, `MAILBOX_AUTO_SYNC_MINUTES=8`, `CRON_SECRET` (aleatoire, pour `/api/mailbox/cron-sync`).
5. **Reponse** : envoi via **Resend** (pas SMTP o2switch depuis Vercel).

Lien direct : `https://www.leadsopportunities.fr/dashboard.html?section=mailbox`

---

## 4. Google Analytics 4, Google Ads et Search Console (leads & campagnes)

### Ce que le site envoie deja

- **GA4** : `generate_lead` (formulaire accueil), `qualified_lead` (score serveur), `wizard_step` (landings multi-etapes), `begin_checkout` (paiement).
- **Google Ads** : evenements `conversion` avec les libelles que tu configures (formulaire lead, clic tel, WhatsApp).

Les pages chargent d’abord `/api/google-config-env` puis `google-config.js` : les **variables d’environnement Vercel** remplacent les placeholders du fichier si elles sont renseignées.

| Variable Vercel | Exemple | Role |
|-----------------|---------|------|
| `GA4_MEASUREMENT_ID` | `G-ABC1DEFGHI` | Propriete GA4 → **Admin** → **Flux de donnees** → flux **Web** → **ID de mesure** |
| `GOOGLE_ADS_ID` | `AW-123456789` | Compte Google Ads → **Outils** → **Balises Google** / setup global (prefixe AW-) |
| `GOOGLE_ADS_CONVERSION_LEAD` | `AW-123456789/xyzABC` | Conversion **Soumission de formulaire** (ou import depuis GA4) |
| `GOOGLE_ADS_CONVERSION_PHONE` | `AW-123456789/abcDEF` | Conversion **Clic sur numero** (optionnel) |
| `GOOGLE_ADS_CONVERSION_WHATSAPP` | `AW-123456789/ghiJKL` | Conversion **WhatsApp** (optionnel) |
| `META_PIXEL_ID` | `4470774303164658` | Pixel Meta Leads Opportunities (client) |
| `META_CAPI_TOKEN` | token CAPI Events Manager | Conversions API Meta (serveur) |
| `META_APP_SECRET` | secret app Facebook | Signature webhook Lead Ads |
| `META_VERIFY_TOKEN` | chaîne aléatoire | Vérification webhook GET |
| `META_PAGE_ACCESS_TOKEN` | token page longue durée | Récupération leads Graph API |
| `META_PAGE_ID` | `1183829618147455` | Page Facebook liée aux Lead Ads |
| `CLARITY_PROJECT_ID` | `abc1def2gh` | [Microsoft Clarity](https://clarity.microsoft.com/) → Projet → **Paramètres** → ID du projet (heatmaps + replays) |
| `GEMINI_API_KEY` | clé Google AI | GitHub Actions / Cursor — rédaction articles actu (`blog:actu:auto`) |
| `BLOG_ACTU_INGEST_SECRET` | jeton long aléatoire | Favori Cafeyn → `blog/actu-inbox.html` → file prioritaire (avec `DATABASE_URL`) |

Guide Meta Ads complet : **`docs/META-ADS-AUTOMATION.md`**

Apres modification sur Vercel : **Redeploy**. En local sans `vercel dev`, l’URL `/api/google-config-env` n’existe pas : le site garde les valeurs par defaut de `google-config.js` (tu peux y mettre tes IDs pour les tests).

### Etapes GA4 (premiere fois)

1. Ouvre [Google Analytics](https://analytics.google.com) → **Admin** (roue dentee) → **Creer une propriete** (ou choisis la propriete existante).
2. **Flux de donnees** → **Ajouter un flux** → **Web** → URL du site : `https://www.leadsopportunities.fr` (ou ton domaine perso).
3. Copie l’**ID de mesure** `G-…` → colle-le dans Vercel comme `GA4_MEASUREMENT_ID`.
4. Dans GA4 : **Admin** → **Flux de donnees** → ton flux → active **Signalisation Google** (parametres du flux) si tu veux les donnees demographiques.
5. Pour verifier en direct : **Admin** → **DebugView** (avec l’extension Chrome « Google Analytics Debugger » ou un appareil de test).

### Etapes Google Ads (conversions pour optimiser les encheres)

1. [Google Ads](https://ads.google.com) → **Objectifs** → **Conversions** → **Nouvelle action de conversion** → **Site Web**.
2. Categorie recommandee pour un lead : **Soumettre un formulaire de contact** ou **Demande de devis**.
3. Choisis **Installer la balise vous-meme** : tu obtiens un libelle du type `AW-123456789/LabelAutoGenere` → mets-le dans `GOOGLE_ADS_CONVERSION_LEAD`.
4. Pour le tag global `AW-…` seul : souvent le meme prefixe que la conversion ; place-le dans `GOOGLE_ADS_ID`.
5. **Lier GA4 et Google Ads** : Google Ads → **Outils** → **Liaisons** → **Google Analytics (GA4)** — cela permet d’importer les conversions GA4 et les audiences.

### Search Console (SEO, pas les leads directs)

**Urgent si le site n’apparait pas sur Google** : guide pas-a-pas → [`docs/INDEXATION-GOOGLE-URGENT.md`](docs/INDEXATION-GOOGLE-URGENT.md).

1. [Search Console](https://search.google.com/search-console) → **Ajouter une propriete** → URL prefix `https://www.leadsopportunities.fr/`.
2. Verifie la propriete (balise HTML deja sur l’accueil : `I3CAH3KoD216Gpr7VbJ6-p3IM4vGizTzxW0HsqG-HKU`).
3. Soumets le sitemap : `https://www.leadsopportunities.fr/sitemap.xml`.
4. **Inspection d’URL** → demande d’indexation pour l’accueil, `nos-services.html`, landings VTC/sante/credit, `france/`.
5. Cron Vercel (`/api/mailbox/cron-sync`) envoie aussi un ping sitemap + IndexNow (Bing) chaque matin si `CRON_SECRET` est defini.

### Documentation Google

- Conversions Ads : [Creer des conversions sur un site Web](https://support.google.com/google-ads/answer/6331314)
- Lier GA4 et Ads : [Lier Google Analytics 4 a Google Ads](https://support.google.com/google-ads/answer/7519530)

Voir aussi `ads/google-acquisition-setup.md` pour les UTM et les campagnes.

### Parcours prospects (abandons / stop points)

- Tous les parcours envoient des evenements vers `POST /api/journey-event` (page vue, debut formulaire, abandon, lead envoye).
- Rapport admin dispo via `GET /api/dashboard/journey-dropoffs?days=14`.
- Table Neon creee automatiquement : `journey_events` (script manuel si besoin : `database/journey-events.sql`).
- Creation rapide de parcours (mode hybride, sans backoffice) via console navigateur :
  - `window.Parcours.create({ id: "meta_retargeting_7j", label: "Meta Retargeting 7j", type: "source", sourceMatchers: ["facebook","instagram","retargeting"], crmWorkflow: ["new","questionnaire","quote_sent","follow_up"] })`
  - `window.Parcours.setActive("meta_retargeting_7j")`
  - `window.Parcours.list()` pour verifier les parcours actifs/custom.
  - `window.Parcours.remove("meta_retargeting_7j")` pour supprimer.
- Les formulaires site et landings envoient maintenant `parcours_id`, `parcours_label` et `parcours_workflow` dans chaque lead.

---

## 5. Suivi des prospects dans l’interface

- **Admin (table des leads)** : [https://www.leadsopportunities.fr/admin.html](https://www.leadsopportunities.fr/admin.html)  
  Connexion compte admin, puis coller **`LEADS_ADMIN_TOKEN`** (identique a celui sur Vercel).
- **Espace client (historique local navigateur)** : [https://www.leadsopportunities.fr/espace-client.html](https://www.leadsopportunities.fr/espace-client.html)

---

## 6. Stripe (acomptes)

Dashboard : [https://dashboard.stripe.com](https://dashboard.stripe.com)

Voir `STRIPE_SETUP.md` dans le depot.

---

## 7. ORIAS (mention legale courtier)

Verification inscription : [https://www.orias.fr](https://www.orias.fr)
