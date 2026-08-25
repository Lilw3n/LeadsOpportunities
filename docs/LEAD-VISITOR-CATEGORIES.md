# Catégories visiteurs / IP (CRM)

Affichage **sans blocage** : badge + intention à côté de l’IP.

## Lib

`js/lead-visitor-category-lib.js` → `window.LeadVisitorCategory`

| Id | Badge | Intention typique |
|----|-------|-------------------|
| `bot_meta` | Plage Meta | WHOIS Meta (`57.141.*`…) — souvent preview ; **Nommer** prioritaire |
| `named` | (libellé manuel) | IP / préfixe nommé dans le CRM (ex. « mon pote ») |
| `bot_cloud` | Bot cloud | Scan AWS/GCP |
| `test` | Test | Emails `example.com` / flood / audit |
| `prospect` | Prospect | Contact + score élevé — à traiter |
| `abandon` | Abandon | Contact puis départ — rappel possible |
| `noise` | Bruit | Wizard sans contact |
| `unknown` | À voir | Pas assez de signaux |

## Où

- `dashboard.html` → colonne IP + fiche détail + filtre « Tous visiteurs »
- `crm-leads.html` / `crm-leads.js` → colonne IP / navigateur

## Libellés manuels (nommer une IP)

API : `GET/POST /api/dashboard/ip-label`

- Nommer une IP exacte **ou** un préfixe `57.141.0.` (/24) / `57.141.` (/16)
- Affiché à côté de l’IP dans le dashboard (badge 👤)
- Hypothèse manuelle : vous pouvez vous tromper, le libellé reste éditable

Exemple : toutes les `57.141.0.*` = preview Meta ; si un ami passe aussi par un VPN rare, notez-le sur l’IP exacte.