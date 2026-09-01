# API APRIL (API Store) — connexion courtier

Page CRM : [`/crm-april.html`](../crm-april.html)  
Client : [`api/_lib/april-client.js`](../api/_lib/april-client.js)  
Route : `GET|POST /api/crm/april`

## Auth (doc APRIL)

OAuth2 **client_credentials** (machine-to-machine, pas de redirect utilisateur) :

1. `POST {gateway}/apistore/oauth/token?grant_type=client_credentials&client_id=…&client_secret=…`
2. Appels suivants : header `Authorization: Bearer <access_token>`
3. Smoke-test : `POST {gateway}/apistore-test/firstCall/` → `{"status":"success"}`

Gateway préprod par défaut : `https://ppr-am-gateway.april.fr`  
(modifiable via `PARTNER_APRIL_GATEWAY` ou URLs complètes `PARTNER_APRIL_OAUTH_URL` / `PARTNER_APRIL_FIRST_CALL_URL`).

## Variables Vercel

| Variable | Obligatoire | Rôle |
|---|---|---|
| `PARTNER_APRIL_CLIENT_ID` | oui | Identifiant application API Store (ex. `00134-xxxxx`) |
| `PARTNER_APRIL_CLIENT_SECRET` | oui | Secret (jamais committer — régénérer si exposé) |
| `PARTNER_APRIL_GATEWAY` | non | Base gateway (défaut préprod `https://ppr-am-gateway.april.fr`) |
| `PARTNER_APRIL_ENV` | non | `preprod` / `prod` (affichage) |
| `PARTNER_APRIL_API_KEY` + `PARTNER_APRIL_API_BASE` | non | Legacy fallback |

Après ajout des variables : **Redeploy** Vercel.

### Checklist rapide (API Store → CRM)

1. API Store → Applications → noter **client_id** + **client_secret**
2. Vercel Production → coller `PARTNER_APRIL_CLIENT_ID` + `PARTNER_APRIL_CLIENT_SECRET`
3. Redeploy
4. Ouvrir [`/crm-april.html`](https://www.leadsopportunities.fr/crm-april.html) → **Test complet**
5. Attendu : `{"status":"success"}` sur firstCall

## Sécurité

- Les secrets ne sont **jamais** renvoyés au navigateur (statut = booléens + hint tronqué).
- Tests `token` / `firstCall` réservés au rôle **admin**.
- Si un secret a été exposé (capture, chat) : le **régénérer** dans l’API Store.
- Respecter quotas / rate-limit APRIL — pas de scraping ni reconstruction de données hors prospects réels.

## Usage CRM

1. Ouvrir `/crm-april.html` (Hub assurance → API APRIL).
2. Vérifier le statut (verts = variables présentes).
3. **Tester jeton** puis **Test complet**.
4. Les devis métier APRIL (santé, emprunteur…) s’ajouteront ensuite sur le même client `April.request(...)`.

## Dispatch leads

`config/partners.json` → partenaire `april` en mode `oauth_client_credentials`.  
Si OAuth configuré, `adapters.sendApi` utilise le jeton APRIL ; sinon fallback clé legacy.

## Vérif

```bash
npm run verify:april-api
```

Support APRIL : `api@april.com`
