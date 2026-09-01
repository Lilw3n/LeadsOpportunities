# Google Workspace — DNS, mails CRM, Drive doublon

## État DNS (à garder pour bascule)

### MX (réception)
| Priorité | Destination | Rôle |
|---|---|---|
| **1** | `SMTP.GOOGLE.COM` | **Principal** — Google Workspace |
| **10** | `mail.leadsopportunities.fr` | **Secours** — o2switch (ne pas supprimer) |

Si tu arrêtes l’abonnement Google : inverse ou mets o2switch en priorité **1** et retire / monte Google.

### DKIM (écran « Ajouter une clé de validation »)
Dans o2switch → Éditeur de zone → **+ Ajouter** :

| Champ | Valeur |
|---|---|
| Type | TXT |
| Nom | `google._domainkey` |
| Valeur | coller **toute** la chaîne `v=DKIM1; k=rsa; p=…` (2048 bits) |
| TTL | le plus bas possible |

Puis dans Workspace → **Commencer l’authentification**.  
Vérif : `dig +short TXT google._domainkey.leadsopportunities.fr`

### SPF (envoi)
Un seul TXT SPF sur la racine, exemple :

```txt
v=spf1 ip4:109.234.166.232 include:_spf.google.com include:spf.jabatus.fr ~all
```

(Garde Resend/SES `include:` si déjà présents sur d’autres hôtes.)

---

## Mails dans le site (`dashboard.html?section=mailbox`)

1. Google Admin → utilisateur `contact@` → **Mot de passe d’application** (IMAP).
2. Vercel :
   - `MAIL_IMAP_PROVIDER=both`
   - `MAIL_IMAP_PASS_WORKSPACE=<mot de passe d'application>`
   - `MAIL_IMAP_PASS_O2SWITCH=<mdp o2switch actuel>` (secours)
3. Redeploy → Messagerie → **Synchroniser IMAP**.
4. **Anciens e-mails** (reçus sur o2switch avant Google Workspace) : bouton **Historique o2switch** dans la messagerie CRM. Chaque clic importe ~40 messages ; le bouton enchaîne les lots automatiquement tant qu’il reste de l’historique sur le serveur o2switch.
5. Boutons : **Gmail Workspace** + **o2switch Roundcube (secours)**.

Prérequis historique : `MAIL_IMAP_PASS_O2SWITCH` + `MAIL_IMAP_PROVIDER=both`. Les mails déjà migrés dans Gmail ne sont pas sur o2switch — utilisez la sync Workspace pour ceux-là.

---

## Drive doublon (`contact@` + `courtier972`)

1. Sur le Drive **contact@** (Workspace) : créer un dossier `Clients_LO_Miroir`.
2. Le partager en **Éditeur** avec `courtier972@gmail.com`.
3. Copier l’ID dossier → Vercel `GOOGLE_DRIVE_MIRROR_FOLDER_ID`.
4. Vercel aussi :
   - `GOOGLE_DRIVE_MIRROR=true`
   - `GOOGLE_DRIVE_SHARE_EMAILS=courtier972@gmail.com,contact@leadsopportunities.fr`
5. Redeploy — chaque upload est **partagé** avec contact@ et **copié** dans le miroir si l’ID est défini.

Doc Drive générale : [`DRIVE-SETUP.md`](./DRIVE-SETUP.md).

## Vérif code

```bash
npm run verify:workspace-mail-drive
npm run verify:mailbox-loading
```

## Checklist Vercel (obligatoire pour les e-mails CRM)

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | URL Neon (messagerie + leads) |
| `MAIL_IMAP_PROVIDER` | `both` |
| `MAIL_IMAP_USER` | `contact@leadsopportunities.fr` |
| `MAIL_IMAP_PASS_WORKSPACE` | Mot de passe d'application Google (Admin → contact@ → IMAP) |
| `MAIL_IMAP_PASS_O2SWITCH` | Mot de passe boîte o2switch (Roundcube) |

Après toute modification : **Redeploy** Production. Vérif prod :

```bash
curl -sSL https://www.leadsopportunities.fr/js/dashboard-mailbox.js | wc -c
# doit être ≈ 69900 (fix messagerie sept. 2026)
curl -sSL https://www.leadsopportunities.fr/dashboard.html | grep -c Historique
# doit afficher 1 (bouton Historique o2switch)
```
