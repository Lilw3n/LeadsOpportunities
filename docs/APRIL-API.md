# API APRIL (API Store) — connexion courtier

Page CRM : [`/crm-april.html`](../crm-april.html)  
Client : [`api/_lib/april-client.js`](../api/_lib/april-client.js)  
Route : `GET|POST /api/crm/april`

## App perso vs tutoriel « application Test »

Le tutoriel API Store montre l’**application Test** (`00134-…`) et l’**API Test** à titre d’exemple.
Vous utilisez **vos** identifiants (ex. `12598-…`) — c’est correct pour la prod.

| Étape | Ce que ça prouve |
|---|---|
| Jeton OAuth OK | Client ID + secret valides, app enregistrée |
| firstCall OK | App **abonnée** à l’API Test + bon gateway API |

Si le jeton passe mais firstCall échoue : API Store → **Catalogue** → **API Test** → **S’abonner** → choisir votre application.

## Auth (doc APRIL)

OAuth2 **client_credentials** (machine-to-machine, pas de redirect utilisateur) :

1. `POST {oauthGateway}/apistore/oauth/token?grant_type=client_credentials&client_id=…&client_secret=…`
2. Appels suivants : header `Authorization: Bearer <access_token>`
3. Smoke-test : `POST {apiGateway}/apistore-test/firstCall/` → `{"status":"success"}`

**Deux gateways en préprod** (doc API Store) :
- OAuth : `https://ppr-am-gateway.april.fr`
- API (firstCall et appels métier) : `https://ppr-api-gateway.april.fr`

`PARTNER_APRIL_GATEWAY` = OAuth · `PARTNER_APRIL_API_GATEWAY` = appels API (défaut ci-dessus).
Override complet firstCall : `PARTNER_APRIL_FIRST_CALL_URL`.

## Variables Vercel

| Variable | Obligatoire | Rôle |
|---|---|---|
| `PARTNER_APRIL_CLIENT_ID` | oui | Identifiant application API Store (ex. `00134-xxxxx`) |
| `PARTNER_APRIL_CLIENT_SECRET` | oui | Secret (jamais committer — régénérer si exposé) |
| `PARTNER_APRIL_GATEWAY` | non | Gateway **OAuth** (défaut `https://ppr-am-gateway.april.fr`) |
| `PARTNER_APRIL_API_GATEWAY` | non | Gateway **API** firstCall / métier (défaut `https://ppr-api-gateway.april.fr`) |
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

Smoke-test live avec l’**application Test** du tutoriel (sans toucher aux secrets Vercel perso) :

```bash
npm run april:smoke-test
```

Attendu : `tokenOk: true` + `firstCall.data.status === "success"`.

Support APRIL : `api@april.com`
