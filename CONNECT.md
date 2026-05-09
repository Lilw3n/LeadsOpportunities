# Connexions — Leads Opportunities

Site en ligne : [https://leads-opportunities.vercel.app](https://leads-opportunities.vercel.app)

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
| `LEAD_NOTIFICATION_EMAIL` | Ex. `courtier972@gmail.com` |
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

---

## 4. Google Analytics 4 & Google Ads

- GA4 : [https://analytics.google.com](https://analytics.google.com) — ID de mesure type `G-XXXXXXXX` dans **Admin** → **Flux de donnees** → ton flux Web.
- Google Ads : [https://ads.google.com](https://ads.google.com) — conversions et balises `AW-…` ; lier GA4 et Ads si besoin.

Les IDs sont a renseigner dans `google-config.js` (racine du site). Evenements utiles deja envoyes : `generate_lead`, `wizard_step`, `qualified_lead`, conversions Ads sur formulaire / tel / WhatsApp.

Doc Ads conversions : [https://support.google.com/google-ads/answer/6331314](https://support.google.com/google-ads/answer/6331314)

---

## 5. Suivi des prospects dans l’interface

- **Admin (table des leads)** : [https://leads-opportunities.vercel.app/admin.html](https://leads-opportunities.vercel.app/admin.html)  
  Connexion compte admin, puis coller **`LEADS_ADMIN_TOKEN`** (identique a celui sur Vercel).
- **Espace client (historique local navigateur)** : [https://leads-opportunities.vercel.app/espace-client.html](https://leads-opportunities.vercel.app/espace-client.html)

---

## 6. Stripe (acomptes)

Dashboard : [https://dashboard.stripe.com](https://dashboard.stripe.com)

Voir `STRIPE_SETUP.md` dans le depot.

---

## 7. ORIAS (mention legale courtier)

Verification inscription : [https://www.orias.fr](https://www.orias.fr)
