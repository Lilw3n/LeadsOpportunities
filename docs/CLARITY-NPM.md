# Microsoft Clarity — installation NPM (projet x7yqp46fj9)

Conforme à [npmjs.com/package/@microsoft/clarity](https://www.npmjs.com/package/@microsoft/clarity) et au tableau de bord Clarity → **Installer à l'aide de NPM**.

## Déjà fait dans ce dépôt

```bash
npm install @microsoft/clarity
```

```javascript
// js/clarity-source.mjs
import Clarity from "@microsoft/clarity";
Clarity.init("x7yqp46fj9");  // ou GOOGLE_TRACKING.clarityProjectId
```

Le navigateur charge le bundle : **`/js/clarity-init.js`** (généré par `npm run build:clarity`).

Pages concernées : `index.html`, blog, landings — via :

```html
<script src="/api/google-config-env"></script>
<script src="/google-config.js"></script>
<script src="/js/clarity-init.js" defer></script>
```

## Commandes

```bash
npm install
npm run build:clarity    # regénère js/clarity-init.js
npm run verify:clarity   # contrôle installation
```

## Vercel (optionnel)

Variable `CLARITY_PROJECT_ID` = `x7yqp46fj9` (sinon valeur par défaut dans `google-config.js`).

## « J'ai installé le code, pourquoi pas de données ? »

| Cause | Solution |
|-------|----------|
| Délai Clarity | Attendre **2–4 h** après première visite |
| Page d'accueil / landings | Accepter cookies **« Tout accepter »** (Clarity démarre après consentement) |
| **Blog** | Clarity actif **sans** cookies — testez `/blog/` |
| Bloqueur pub | Désactiver uBlock sur leadsopportunities.fr |
| Bundle pas à jour | `npm run build:clarity` + redeploy Vercel |

## Vérifier en production

1. Ouvrez `https://www.leadsopportunities.fr/blog/`
2. F12 → Network → filtre `clarity` → requête vers `clarity.ms/tag/x7yqp46fj9?ref=npm`
3. Tableau de bord Clarity → le statut « installation » se valide sous 24 h
