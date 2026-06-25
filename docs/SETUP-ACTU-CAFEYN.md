# Mise en route — actu auto GitHub + Cafeyn (15 min)

Guide pas à pas. **Ne communiquez jamais votre email/mot de passe Cafeyn** à Cursor, GitHub, Vercel ou ce dépôt.

---

## Pourquoi pas le login Cafeyn ?

| Ce que vous pensez | Réalité |
|--------------------|---------|
| « Il faut email + mot de passe Cafeyn » | Oui **pour vous** dans l’app / le site Cafeyn |
| « Le bot peut se connecter avec » | **Non** — CGU Cafeyn, risque de bannissement, pas d’API officielle, sessions anti-bot |
| « Comment récupérer mes articles Cafeyn ? » | **1)** RSS automatique (mêmes journaux) **2)** Favori 1 clic (vous êtes déjà connecté) |

Le favori = vous lisez Cafeyn **normalement** (avec votre login) → 1 clic → article en file prioritaire. **Aucun mot de passe stocké.**

Si un agent ou un script demande vos identifiants Cafeyn, arrêtez l'exécution : le pipeline doit fonctionner avec les flux RSS publics, Yahoo/Google/Bing/Firefox, Pocket optionnel, ou le favori sécurisé par `BLOG_ACTU_INGEST_SECRET`.

---

## Étape 1 — Générer le jeton inbox (2 min)

Sur votre Mac / PC, terminal :

```bash
openssl rand -hex 24
```

Copiez le résultat (ex. `a3f8b2…`). C’est votre **`BLOG_ACTU_INGEST_SECRET`** — pas votre mot de passe Cafeyn.

---

## Étape 2 — Neon : créer la table file (3 min)

1. Ouvrez [https://console.neon.tech](https://console.neon.tech)
2. Projet déjà utilisé pour Leads Opportunities
3. **SQL Editor** → New query
4. Collez tout le contenu de `database/blog-actu-queue.sql` :

```sql
CREATE TABLE IF NOT EXISTS blog_actu_queue (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT DEFAULT '',
  source TEXT DEFAULT 'cafeyn',
  note TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  added_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS blog_actu_queue_status_idx ON blog_actu_queue (status, added_at DESC);
```

5. **Run** → message succès

Vous avez déjà `DATABASE_URL` dans Vercel (voir `CONNECT.md`).

---

## Étape 3 — Vercel : variables (5 min)

[https://vercel.com](https://vercel.com) → projet **Leads Opportunities** → **Settings** → **Environment Variables**

| Nom | Valeur | Environnements |
|-----|--------|----------------|
| `BLOG_ACTU_INGEST_SECRET` | le jeton `openssl` étape 1 | Production, Preview |
| `DATABASE_URL` | déjà présent — sinon copier depuis Neon | Production, Preview |
| `GEMINI_API_KEY` | clé [Google AI Studio](https://aistudio.google.com/apikey) | Production, Preview |

**Redeploy** le projet après ajout.

---

## Étape 4 — GitHub Actions : secrets (3 min)

GitHub → repo **LeadsOpportunities** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret | Valeur |
|--------|--------|
| `GEMINI_API_KEY` | même clé qu’à l’étape 3 |
| `DATABASE_URL` | même URI Neon |
| `BLOG_ACTU_INGEST_SECRET` | même jeton étape 1 |

Optionnel : `OPENAI_API_KEY`, `POCKET_CONSUMER_KEY`, `POCKET_ACCESS_TOKEN`

Mergez la PR **#32** (workflow `.github/workflows/blog-actu-auto.yml`) sur `main`.

---

## Étape 5 — Favori Cafeyn (2 min, une fois)

1. Connectez-vous à **Cafeyn** comme d’habitude (email + mot de passe **uniquement sur le site Cafeyn**)
2. Ouvrez : `https://www.leadsopportunities.fr/blog/actu-inbox.html`
3. Collez le **jeton** (étape 1) → **Enregistrer le jeton**
4. Glissez le bouton vert **« Sauver actu Cafeyn »** dans la barre de favoris

### Usage quotidien (10 secondes)

1. Article intéressant sur **Cafeyn**
2. Clic sur le favori **Sauver actu Cafeyn**
3. Page inbox → **Envoyer à la file serveur**
4. Au prochain run GitHub (max ~3 h), article **prioritaire** publié sur le blog

---

## Étape 6 — Vérifier que ça tourne

**GitHub** → **Actions** → *Blog actu auto* → **Run workflow** (count = 1)

Ou en local :

```bash
npm run blog:actu:auto -- --dry-run --count=3
npm run blog:actu:verify-quality
```

---

## Récapitulatif secrets

| Secret | Cafeyn ? | Rôle |
|--------|----------|------|
| Email / MDP Cafeyn | ❌ **jamais** | Votre login perso sur cafeyn.com uniquement |
| `BLOG_ACTU_INGEST_SECRET` | ❌ | Jeton technique favori → API |
| `GEMINI_API_KEY` | ❌ | Rédaction articles |
| `DATABASE_URL` | ❌ | File d’attente Neon |

---

## Dépannage

| Problème | Solution |
|----------|----------|
| « Non autorisé » sur inbox | Vérifier `BLOG_ACTU_INGEST_SECRET` identique Vercel + inbox |
| « DATABASE_URL requis » | Variable Vercel + secret GitHub + SQL Neon exécuté |
| Pas d’article Cafeyn spécifique | Utiliser le favori ; le RSS ne voit que les flux publics |
| Qualité insuffisante | Ajouter `GEMINI_API_KEY` sur GitHub |

Voir aussi `docs/BLOG-ACTU-AUTOMATION.md`.
