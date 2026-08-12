# Financement → demande de prêt

Pont intelligent entre **Barèmes / Financement** (`crm-agency-fees.html`) et les questionnaires publics de prêt.

## Flux
1. CRM : calcule FAI / net vendeur, part de chacun, capacité acheteur (apport, durée, revenus).
2. CTA **Demande de prêt** / **Parcours acquéreur** → landings préremplies.
3. Après envoi du lead : dépôt de pièces (`devis-document-config` : `credit-immo`, `acheteur-immo`) via tracking / `upload-document.html`.

## Params URL
`propertyPrice` / `prixFai` · `prixNet` · `priceMode` · `downPayment` / `apport` · `loanDuration` / `duree` · `income` · `propertyId` · `contactId` · `utm_source`

Helper : `js/finance-deep-link.js`

## Entrées
- Barèmes → boutons CTA + copie de lien
- Fiche bien → **Financement / prêt** (préremplit barèmes avec prix FAI/net + `propertyId`)
- Landings : `landings/credit-immo.html`, `landings/acheteur-immo.html`
