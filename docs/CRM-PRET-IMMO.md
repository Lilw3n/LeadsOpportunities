# Prêt Immo — dossiers & simulations

Module CRM inspiré du parcours courtier (Mes dossiers / Effectuer simulation).

## Accès
- Liste : [`crm-pret-immo.html`](../crm-pret-immo.html)
- Simulateur : [`crm-pret-immo-sim.html`](../crm-pret-immo-sim.html)
- Coordonnées : [`crm-pret-immo-coord.html`](../crm-pret-immo-coord.html)
- Sidebar Immobilier → **Prêt Immo (dossiers)**

## Navigation
- **Mes dossiers** — tableau (date, rubrique, réf., emprunteur, co-emprunteur, dép., apporteur, réseau, utilisateurs, position, DDP, montant, banque, produit, archive)
- **Effectuer simulation** — RAC (Propriétaire / Locataire / Hébergé), IMMO, SCI, SCPI, CONSO, HYPO, VIAGER, PVH calculette
- **Transmettre coordonnées** — [`crm-pret-immo-coord.html`](../crm-pret-immo-coord.html) : fiche légère indicateur d’affaires (responsable, emprunteur/co, logement, notes, option délégation)
- Liens vers demande publique + barèmes FAI

## Simulateurs (IMMO / SCI / SCPI / CONSO / HYPO / Viager / RAC)
Formulaire sections numérotées + **sidebar synthèse** (achat, apport, taux, mensualités H.A./A.C., DTI avant/après, RAV, ratio hypothécaire, solvabilité).

Champs projet selon la rubrique :
- **IMMO / SCI** — prix, travaux, frais (notaire, garantie, mandat…), assurances
- **SCPI** — parts × valeur + frais
- **CONSO** — montant projet + modal « Détail prêt conso »
- **HYPO / Viager** — valeur du bien, montant souhaité, ratio hypothécaire
- **RAC** — crédits à racheter, découvert, IRA / frais, besoin total

Commun : emprunteur & co · famille / logement · toggles patrimoine · banque · revenus / charges · résultat · commentaires

Actions : Simuler · Enregistrer · Enregistrer / demande publique · Transmettre (DDP)

## PVH — Calculette montant à rembourser
Page [`crm-pret-immo-pvh.html`](../crm-pret-immo-pvh.html) : capital dû à 5 / 10 / 15 / 20 ans en **différé total** (intérêts capitalisés mensuellement).  
Ex. 10 000 € à 6 % → 18 194 € à 10 ans.
