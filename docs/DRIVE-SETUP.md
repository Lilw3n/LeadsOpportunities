# Configuration Google Drive — courtier972@gmail.com

Le site cree automatiquement cette arborescence pour chaque **contact CRM** :

```
Clients_LeadsOpportunities/          ← dossier racine (GOOGLE_DRIVE_FOLDER_ID)
  └── 2026/
        └── Dupont_Jean/             ← Nom_Prenom (lisible)
              └── ct_xxx/            ← identifiant CRM (technique)
                    ├── 01_identite/
                    ├── 02_justificatifs_revenus/
                    ├── dpe/         ← ou type de pièce (checklist)
                    └── …
```

`ct_…` = ID technique du contact dans le CRM (`crm_contacts.id`). Il n’apparaît plus
en préfixe du dossier visible.

Biens immobiliers (dépôt vendeur) :

```
Immo/2026/Dupont_Jean_Nancy/prop_xxxx/05_diagnostics/
```

---

## Important — Gmail perso vs compte de service

Sur **courtier972@gmail.com** (Gmail personnel, pas Google Workspace) :

| Action | Compte de service | OAuth courtier972 |
|--------|-------------------|-------------------|
| Creer dossiers dans un dossier partage | OK | OK |
| **Deposer photos / fichiers** | **Refuse** (quota = 0) | **OK** |

Erreur typique si seul le compte de service est configure :

```json
{
  "ok": false,
  "error": "Service Accounts do not have storage quota..."
}
```

Le dossier `Immo/2026/prop_xxx/` peut etre cree, mais l'upload de photos echoue.

**Solution production** : ajouter `GOOGLE_DRIVE_REFRESH_TOKEN` (OAuth du courtier) en plus du JSON compte de service (optionnel).

---

## Methode recommandee — OAuth refresh token (uploads + Gmail perso)

### 1. Google Cloud Console

1. [Google Cloud Console](https://console.cloud.google.com/) — meme projet que le login CRM.
2. Activer **[Google Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com)**.
3. **APIs et services → Identifiants → Client OAuth** (celui deja utilise pour le CRM).
4. **URI de redirection autorisees** — ajouter si besoin :
   - `https://www.leadsopportunities.fr/api/auth/google-callback`
   - `https://developers.google.com/oauthplayground` (option Playground)

### 2. Dossier racine sur le Drive courtier

1. [Google Drive](https://drive.google.com/) avec **courtier972@gmail.com**.
2. Dossier : `Clients_LeadsOpportunities`.
3. Copier l'ID dans l'URL :
   - `https://drive.google.com/drive/folders/19b0BAIySKxIDyc7ZTFwkp865Jk3nzs-Q` → `GOOGLE_DRIVE_FOLDER_ID`.

Lien direct (votre dossier) :  
https://drive.google.com/drive/folders/19b0BAIySKxIDyc7ZTFwkp865Jk3nzs-Q

### 3. Obtenir le refresh token

**Option A — depuis le CRM (recommande)**

1. Admin CRM → [test-drive.html](https://www.leadsopportunities.fr/test-drive.html)
2. **Obtenir refresh token (OAuth)** → connexion **courtier972@gmail.com**
3. Copier le token affiche → Vercel `GOOGLE_DRIVE_REFRESH_TOKEN` → **Redeploy**

**Option B — OAuth Playground**

1. Ouvrir [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/).
2. Engrenage en haut a droite → cocher **Use your own OAuth credentials**.
3. Renseigner **OAuth Client ID** et **OAuth Client secret** (Vercel : `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`).
4. Dans la liste des APIs, choisir **Drive API v3** → scope :
   - `https://www.googleapis.com/auth/drive`
5. **Authorize APIs** → se connecter avec **courtier972@gmail.com** → autoriser.
6. **Exchange authorization code for tokens**.
7. Copier le **`refresh_token`** (longue chaine) → Vercel :

| Variable | Valeur |
|----------|--------|
| `GOOGLE_DRIVE_FOLDER_ID` | `19b0BAIySKxIDyc7ZTFwkp865Jk3nzs-Q` |
| `GOOGLE_DRIVE_REFRESH_TOKEN` | refresh_token du Playground |
| `GOOGLE_DRIVE_USER_EMAIL` | `courtier972@gmail.com` (optionnel, informatif) |

8. **Redeploy** Vercel.

### 4. Tester

1. CRM admin → [test-drive.html](https://www.leadsopportunities.fr/test-drive.html)
2. **Verifier la connexion** → `"uploadConfigured": true`, `"uploadTest": { "ok": true }`
3. **Creer dossier test lead** → fichier `piece-identite-test.txt` depose sans erreur quota.

API : `GET /api/drive/status` (Bearer token admin CRM).

---

## Compte de service (optionnel — structure dossiers)

Utile en complement pour lister / creer l'arborescence si vous le souhaitez. **Ne suffit pas** pour les uploads sur Gmail perso.

1. [Google Cloud Console](https://console.cloud.google.com/) → **Compte de service** → cle JSON.
2. Partager `Clients_LeadsOpportunities` au `client_email` du JSON (**Editeur**).
3. Vercel : `GOOGLE_SERVICE_ACCOUNT_JSON` = JSON complet sur une ligne.

Sans `GOOGLE_DRIVE_REFRESH_TOKEN`, les photos vendeur restent sur le site mais l'upload Drive est simule ou echoue.

---

## Methode temporaire — access token manuel (~1 h)

1. [OAuth Playground](https://developers.google.com/oauthplayground/) (memes etapes, scope Drive).
2. Copier **Access token** → Vercel `GOOGLE_DRIVE_ACCESS_TOKEN`.
3. Expire rapidement — reserve aux tests.

---

## Depannage

| Erreur | Cause | Solution |
|--------|--------|----------|
| **Service Accounts do not have storage quota** | Upload via compte de service sur Gmail perso | Ajouter `GOOGLE_DRIVE_REFRESH_TOKEN` |
| Dossier cree, pas de photos | Idem | Idem + redeploy |
| Upload simule | Pas de token OAuth | `GOOGLE_DRIVE_REFRESH_TOKEN` |
| File not found | Dossier non partage au compte de service | Partager en Editeur (si SA utilise) |
| 403 Insufficient permissions | Role Lecteur | Passer en **Editeur** |
| invalid_grant (refresh) | Refresh token revoque / mal copie | Regenerer via Playground |

---

## Test avec un contact existant

```
GET /api/drive/status?contactId=ct_VOTRE_ID
Authorization: Bearer {lo_token admin}
```

---

## Immobilier — photos vendeur

```
Clients_LeadsOpportunities/
  └── Immo/
        └── 2026/
              └── prop_xxx_Ville_Titre/
                    └── 01_photos_publiques/   ← photos deposees via formulaire vendeur
```

Formulaire : [acheteur-immo.html#deposer-bien](https://www.leadsopportunities.fr/landings/acheteur-immo.html#deposer-bien)

API CRM : `POST /api/drive/immo` — UI fiche bien → **Immo cloud** (`crm-immo-property.html`).

---

## Liens utiles

| Ressource | URL |
|-----------|-----|
| Dossier racine | https://drive.google.com/drive/folders/19b0BAIySKxIDyc7ZTFwkp865Jk3nzs-Q |
| Google Cloud Console | https://console.cloud.google.com/ |
| Drive API | https://console.cloud.google.com/apis/library/drive.googleapis.com |
| OAuth Playground | https://developers.google.com/oauthplayground/ |
| Test Drive prod | https://www.leadsopportunities.fr/test-drive.html |
| Doc Google (Shared Drives) | https://developers.google.com/workspace/drive/api/guides/about-shareddrives |
| Vercel env vars | https://vercel.com/dashboard |
