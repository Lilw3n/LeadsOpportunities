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
2. CRM connecte en admin → [test-drive.html](https://www.leadsopportunities.fr/test-drive.html).
3. Ou API : `GET /api/drive/status` avec header `Authorization: Bearer {token CRM}`.

Reponse attendue : `"ok": true`, nom du dossier racine, liste d’enfants.

4. Dans `test-drive.html`, cliquer **Créer dossier test lead**.
   - Le site cree/verifie `Clients_LeadsOpportunities/test lead`.
   - Le site depose `piece-identite-test.txt` dans ce dossier.
5. Cliquer **Créer contact CRM Test Lead**.
   - Le CRM cree le contact.
   - Le site cree automatiquement le dossier client et ses 5 sous-dossiers.

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
| Upload simule | Variables absentes | Renseigner JSON + FOLDER_ID sur Vercel |
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
