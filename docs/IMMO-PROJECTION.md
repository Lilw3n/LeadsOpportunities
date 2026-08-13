# Projection financière immobilière

Outil pour **se projeter après achat** : pas seulement la mensualité de prêt, mais le **coût de possession** croisé avec revenus, apport et patrimoine.

## Accès

| Surface | URL |
|---------|-----|
| CRM (conseiller) | [`/crm-pret-immo-projection.html`](../crm-pret-immo-projection.html) — menu Prêts → **Projection acheteur** |
| Public (SEO) | [`/credit-immo/projection/`](../credit-immo/projection/) |
| Fiche bien CRM | bouton **Projection acheteur** (préremplit prix, surface, CP, DPE, travaux, foncière) |

Lib : [`js/immo-projection-lib.js`](../js/immo-projection-lib.js) (navigateur + Node).

## Ce qui est corrélé

1. **Acquisition** — prix, travaux, frais notaire / garantie, apport, patrimoine résiduel  
2. **Crédit** — mensualité H.A. + assurance emprunteur, durée, taux  
3. **Possession mensuelle**  
   - taxe foncière (/12)  
   - électricité + gaz (DPE / surface / chauffage, ou saisie)  
   - eau (selon foyer)  
   - charges / copro  
   - assurance habitation (MRH)  
   - provision entretien / travaux  
4. **Budget foyer** — salaires, crédits en cours, loyer actuel (comparaison)  
5. **Ratios** — DTI banque vs **DTI réel**, reste à vivre / personne, effort budgétaire  
6. **Stress** — taux +1 %, énergie +25 %  
7. **Verdict** — confortable / tendu / hors budget + alertes (apport, trésorerie, HCSF)

Les champs vides (foncière, énergie, eau, MRH, charges) sont **estimés** (indicatif France).

## Deep links

`FinanceDeepLink.projectionCrmUrl` / `projectionPublicUrl` — params : `propertyPrice`, `apport` / `downPayment`, `income`, `travaux`, `surface`, `cp`, `dpe`, `patrimoine`, `taxeFonciere`, `propertyId`.

## Limites

- Pas une étude bancaire ni un avis fiscal officiel.  
- Taxe foncière / DPE = ordres de grandeur si non saisis.  
- Le loyer actuel disparaît du budget « après achat » (hypothèse résidence principale).
