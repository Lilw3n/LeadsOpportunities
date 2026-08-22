# Catégories visiteurs / IP (CRM)

Affichage **sans blocage** : badge + intention à côté de l’IP.

## Lib

`js/lead-visitor-category-lib.js` → `window.LeadVisitorCategory`

| Id | Badge | Intention typique |
|----|-------|-------------------|
| `bot_meta` | Bot Meta | Preview pub / crawler Facebook (`57.141.*`, `173.252.*`…) |
| `bot_cloud` | Bot cloud | Scan AWS/GCP |
| `test` | Test | Emails `example.com` / flood / audit |
| `prospect` | Prospect | Contact + score élevé — à traiter |
| `abandon` | Abandon | Contact puis départ — rappel possible |
| `noise` | Bruit | Wizard sans contact |
| `unknown` | À voir | Pas assez de signaux |

## Où

- `dashboard.html` → colonne IP + fiche détail + filtre « Tous visiteurs »
- `crm-leads.html` / `crm-leads.js` → colonne IP / navigateur

## Verif

```bash
npm run verify:lead-visitor-cat
```
