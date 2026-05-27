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

En test, Resend autorise souvent `onboarding@resend.dev` comme expéditeur.

Pour **repondre depuis le dashboard** (`/dashboard.html` → Messagerie), verifie le domaine `leadsopportunities.fr` chez Resend et utilise :

- `LEAD_FROM_EMAIL` / `MAILBOX_FROM` = `Leads Opportunities <contact@leadsopportunities.fr>`

---

## 3b. Messagerie dashboard (lire + repondre)

1. **Neon** : executer `database/mailbox.sql` dans le SQL Editor (une fois).
2. **Vercel** — variables supplementaires :

| Variable | Exemple |
|----------|---------|
| `MAIL_IMAP_HOST` | `leadsopportunities.fr` (pas `mail.` si certificat refuse) |
| `MAIL_IMAP_PORT` | `993` |
| `MAIL_IMAP_USER` | `contact@leadsopportunities.fr` |
| `MAIL_IMAP_PASS` | mot de passe boite o2switch |
| `MAILBOX_ADDRESS` | `contact@leadsopportunities.fr` |
| `MAILBOX_FROM` | `Leads Opportunities <contact@leadsopportunities.fr>` |
| `MAIL_IMAP_TLS_INSECURE` | `true` seulement si erreur certificat TLS |

3. **Dashboard** : connexion compte **admin** → menu **Messagerie** → **Synchroniser la boite** (import IMAP) ou lire les demandes formulaire deja importees depuis `site_leads`.
4. **Reponse** : envoi via **Resend** (pas SMTP o2switch depuis Vercel).

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

1. [Search Console](https://search.google.com/search-console) → **Ajouter une propriete** → URL prefix `https://www.leadsopportunities.fr/`.
2. Verifie la propriete (balise HTML ou fichier DNS selon ce que Google propose).
3. Soumets le sitemap : `https://www.leadsopportunities.fr/sitemap.xml`.

### Documentation Google

- Conversions Ads : [Creer des conversions sur un site Web](https://support.google.com/google-ads/answer/6331314)
- Lier GA4 et Ads : [Lier Google Analytics 4 a Google Ads](https://support.google.com/google-ads/answer/7519530)

Voir aussi `ads/google-acquisition-setup.md` pour les UTM et les campagnes.

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
