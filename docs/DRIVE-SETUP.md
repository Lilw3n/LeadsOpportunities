# Configuration Google Drive — courtier972@gmail.com

Le site cree automatiquement cette arborescence pour chaque **contact CRM** :

```
Clients_LeadsOpportunities/          ← dossier racine (GOOGLE_DRIVE_FOLDER_ID)
  └── 2026/
        └── ct_xxx_Dupont_Jean/
              ├── 01_identite/
              ├── 02_justificatifs_revenus/
              ├── 03_contrats_existants/
              ├── 04_vehicule_ou_bien/
              └── 05_devis_signes/
```

---

## Methode recommandee : compte de service (stable sur Vercel)

### 1. Google Cloud Console

1. Ouvrir [Google Cloud Console](https://console.cloud.google.com/) (meme projet que OAuth login).
2. **APIs et services** → **Bibliotheque** → activer **Google Drive API**.
3. **APIs et services** → **Identifiants** → **Creer des identifiants** → **Compte de service**.
4. Nom : `leads-opportunities-drive`.
5. Creer une **cle JSON** et telecharger le fichier (gardez-le secret).

### 2. Dossier sur le Drive du courtier

1. Connectez-vous sur [Google Drive](https://drive.google.com/) avec **courtier972@gmail.com**.
2. Creer un dossier : `Clients_LeadsOpportunities`.
3. Ouvrir le dossier → copier l’**ID** dans l’URL :
   - `https://drive.google.com/drive/folders/XXXXXXXX` → `XXXXXXXX` = `GOOGLE_DRIVE_FOLDER_ID`.

### 3. Partager le dossier au compte de service

1. Dans le JSON telecharge, notez `client_email` (ex. `leads-opportunities-drive@xxx.iam.gserviceaccount.com`).
2. Clic droit sur `Clients_LeadsOpportunities` → **Partager**.
3. Ajouter cet email avec le role **Editeur**.

Sans ce partage, l’API renvoie « File not found » ou acces refuse.

### 4. Variables Vercel

| Variable | Valeur |
|----------|--------|
| `GOOGLE_DRIVE_FOLDER_ID` | ID du dossier racine (etape 2) |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Contenu **complet** du fichier JSON (une ligne) |

**Astuce Vercel** : coller tout le JSON dans la valeur (minifier si besoin sur [jsonformatter.org](https://jsonformatter.org/json-minify)).

Ne commitez **jamais** le JSON dans Git.

### 5. Redeployer puis tester

1. Vercel → redeploy du projet.
2. CRM admin → [crm-depot-drive.html](https://www.leadsopportunities.fr/crm-depot-drive.html) (hub Drive + o2switch + Stripe).
3. Ou API : `GET /api/drive/status` avec header `Authorization: Bearer {token CRM}`.

Reponse attendue : `"ok": true`, nom du dossier racine, liste d’enfants, ping copie o2switch.

4. Dans `test-drive.html`, cliquer **Créer dossier test lead**.
   - Le site cree/verifie `Clients_LeadsOpportunities/test lead`.
   - Le site depose `piece-identite-test.txt` dans ce dossier.
5. Cliquer **Créer contact CRM Test Lead**.
   - Le CRM cree le contact.
   - Le site cree automatiquement le dossier client et ses sous-dossiers.

Le depot public (`POST /api/external/upload` et parcours devis) cree un **prospect** si l’e-mail n’existe pas encore, puis range le fichier dans le sous-dossier du type de piece.

---

## Copie de secours o2switch

Vercel n’a pas de disque persistant. En renfort du Drive, le site peut poster une copie vers un script PHP sur o2switch.

1. Dans cPanel o2switch, deposer `o2switch/lo-docs-backup.php` dans `public_html/` (ex. `public_html/lo-docs-backup.php`).
2. Copier `o2switch/lo-docs-backup.config.example.php` → `lo-docs-backup.config.php` (meme dossier) et renseigner un **secret long**.
3. Les fichiers sont ecrits par defaut dans `../lo-docs-data/` (hors webroot). Verifier que PHP peut ecrire ce dossier.
4. `php.ini` : `post_max_size` et `upload_max_filesize` >= 16M.
5. Variables Vercel :

| Variable | Valeur |
|----------|--------|
| `O2SWITCH_BACKUP_URL` | `https://VOTRE-DOMAINE/lo-docs-backup.php` |
| `O2SWITCH_BACKUP_SECRET` | le meme secret que le fichier config PHP |

Si Drive est indisponible mais o2switch repond : le depot reussit en mode `backupOnly`. En production, un faux succes « simule » n’est plus renvoye.

---

## Verifier Stripe

Meme hub CRM : bouton **Verifier Stripe** → `GET /api/stripe/readiness`.

Attendu : `ok: true`, `mode` test ou live, `chargesEnabled`, `hasWebhookSecret`. Webhook : `https://www.leadsopportunities.fr/api/stripe/webhook` evenement `checkout.session.completed`.

---

## Methode alternative : token OAuth manuel (expire ~1 h)

Utile pour un test rapide uniquement.

1. [OAuth Playground](https://developers.google.com/oauthplayground/) → engrenage → cocher **Use your own OAuth credentials** (Client ID / Secret du projet).
2. Scope : `https://www.googleapis.com/auth/drive`.
3. Autoriser avec **courtier972@gmail.com** → **Exchange authorization code for tokens**.
4. Copier **Access token** → Vercel `GOOGLE_DRIVE_ACCESS_TOKEN`.

Le token expire ; preferer le compte de service en production.

---

## Depannage

| Erreur | Cause | Solution |
|--------|--------|----------|
| Upload simule | Variables absentes (dev seulement) | Renseigner JSON + FOLDER_ID sur Vercel |
| backupOnly | Drive HS, copie o2switch OK | Reconnecter Drive ; les fichiers sont sur o2switch |
| Ping o2switch 401 | Secret different | Aligner `O2SWITCH_BACKUP_SECRET` et le PHP |
| File not found | Dossier non partage | Partager au `client_email` du compte de service |
| 403 Insufficient permissions | Role Lecteur seulement | Passer en **Editeur** |
| invalid_grant (service account) | JSON mal copie | Re-coller le JSON entier sur une ligne |

---

## Test avec un contact existant

```
GET /api/drive/status?contactId=ct_VOTRE_ID
Authorization: Bearer {lo_token admin}
```

Cree l’arborescence client si elle n’existe pas encore.

---

## Immobilier — Immo cloud

Même credentials. Arborescence biens :

```
{GOOGLE_DRIVE_FOLDER_ID}/
  └── Immo/
        └── 2026/
              └── prop_xxx_Ville_Titre/
                    ├── 01_photos_publiques/
                    ├── 02_photos_confidentielles/
                    ├── 03_documents_publics/
                    ├── 04_documents_confidentiels/
                    ├── 05_diagnostics/
                    ├── 06_mandat_pieces/
                    ├── 07_medias_3d_video/
                    └── 08_documents_imprimes/
```

API CRM : `POST /api/drive/immo` avec `{ action: "ensure"|"upload"|"list"|"classify", property, … }`  
UI : fiche bien → onglets **Images** / **Immo cloud** (`crm-immo-property.html`).
