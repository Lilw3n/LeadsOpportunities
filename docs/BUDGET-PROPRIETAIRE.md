# Budget propriétaire — projection coût de vie

Outil « ultra projection » pour l’acquéreur : **prêt + taxe foncière + énergies (élec / gaz) + eau + charges + MRH + travaux**, croisés avec **salaire, apport, épargne et patrimoine**.

## Accès

| Surface | URL |
| --- | --- |
| CRM | [`crm-budget-proprietaire.html`](../crm-budget-proprietaire.html) |
| Public (lead) | [`landings/budget-proprietaire.html`](../landings/budget-proprietaire.html) |
| Depuis fiche bien | bouton **Budget propriétaire** (préremplit prix, surface, DPE, TF, travaux) |
| Depuis barèmes FAI | CTA **Projection coût propriétaire** |

Menu Prêts → **Budget propriétaire** · Sidebar Immobilier.

## Libs

- [`js/crm-buyer-ownership-lib.js`](../js/crm-buyer-ownership-lib.js) — `project`, `projectWithFinance`, `fromProperty`
- [`js/crm-buyer-finance-lib.js`](../js/crm-buyer-finance-lib.js) — mensualité / DTI / LTV (travaux finançables via `travaux` + `financeTravaux`)
- UI : [`js/crm-budget-proprietaire-page.js`](../js/crm-budget-proprietaire-page.js) + [`css/crm-budget-proprietaire.css`](../css/crm-budget-proprietaire.css)

## Ce que calcule la projection

1. **Crédit** — mensualité amortissable + assurance emprunteur (taux bande auto ou manuel)
2. **Taxe foncière** — saisie €/an ou estimation % FAI selon type de bien (+ majoration légère métropoles)
3. **Énergies** — grille DPE €/m²/an (A→G) ou factures min/max du diagnostic ; split élec / chauffage
4. **Eau** — ~120 L/j/pers × tarif indicatif + abo
5. **Charges copro + MRH** — saisie ou ordre de grandeur
6. **Travaux** — cash immédiat et/ou inclus dans le prêt et/ou amortissement mensuel
7. **Patrimoine** — apport vs épargne liquide, mois de réserve restants, écart vs cible (défaut 6 mois)
8. **Effort réel** — TCO / revenus (complète le DTI bancaire HCSF ~35 %)
9. **vs loyer** — écart coût de possession / loyer actuel
10. **Stress** — taux +~1 pt, énergie +25 %, combo

## Verdicts

- `ok` — confortable  
- `vigilance` — effort 35–45 %  
- `warn` — DTI / réserve / reste à vivre tendu  
- `block` — cash signature > épargne liquide  

Indicatif courtier, **non contractuel**. Affiner avec avis de taxe foncière, factures et diagnostic DPE.
