# Go-live Tiime + Make (après vérif identité)

État actuel codé : **compte Tiime créé**, pièce d’identité en attente, Make à créer.

## 1. Dès que Tiime valide la pièce d’identité

1. Ouvre `/crm-e-invoicing.html`
2. Clique **Tiime vérifié → Active** (ou statut PDP = Active)
3. Dans Tiime : confirme que tu es bien renseigné pour la **réception** (annuaire PA)
4. Informe tes fournisseurs B2B si besoin (checklist CRM)

## 2. Dès que le compte Make Free est créé

1. Make → **Create a new scenario** → **Webhooks → Custom webhook**
2. Copie l’URL `https://hook….make.com/…`
3. Vercel → Project → Settings → Environment Variables :

```
MAKE_EINVOICE_WEBHOOK_URL=https://hook….make.com/xxxx
MAKE_EINVOICE_WEBHOOK_SECRET=<génère une longue chaîne aléatoire>
```

4. **Redeploy** Vercel (`main` après merge, ou preview de la PR)
5. CRM → **Compte Make créé** puis **Tester webhook Make**
6. Complète le scénario (Drive + e-mail) : voir `docs/MAKE-TIIME-EINVOICE.md` + `data/make-blueprints/einvoice-crm-to-make.json`
7. Scénario retour : HTTP POST `https://www.leadsopportunities.fr/api/webhooks/make-einvoice`  
   Header `Authorization: Bearer {MAKE_EINVOICE_WEBHOOK_SECRET}`

## 3. Test de bout en bout

1. CRM → générer une facture Factur-X test  
2. Vérifier que Make reçoit `invoice_issued` (Drive + mail)  
3. Créer la même facture dans Tiime Free (circuit PA)  
4. Optionnel : Make renvoie `tiime_supplier_invoice` → apparaît dans « Factures reçues »

## 4. Deploy

Après merge de la PR facturation :

- Vercel redeploy `main`
- Vérifier : `npm run verify:e-invoicing`
- Prod mailbox check si besoin (AGENTS.md)

## Rappel 0 €

- Tiime Free = PDP  
- Make Free = automation  
- Pas d’API Tiime payante requise pour ce parcours
