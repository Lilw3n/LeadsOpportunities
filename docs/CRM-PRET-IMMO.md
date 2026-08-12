# Prêt Immo — dossiers & simulations

Module CRM inspiré du parcours courtier (Mes dossiers / Effectuer simulation).

## Accès
- Liste : [`crm-pret-immo.html`](../crm-pret-immo.html)
- Simulateur : [`crm-pret-immo-sim.html`](../crm-pret-immo-sim.html)
- Sidebar Immobilier → **Prêt Immo (dossiers)**

## Navigation
- **Mes dossiers** — tableau (date, rubrique, réf., emprunteur, co-emprunteur, dép., apporteur, réseau, utilisateurs, position, DDP, montant, banque, produit, archive)
- **Effectuer simulation** — RAC (Propriétaire / Locataire / Hébergé), IMMO, SCI, SCPI, CONSO, HYPO, VIAGER, PVH calculette
- Liens vers demande publique + barèmes FAI

## Simulateur RAC / IMMO
Emprunteur & co · Logement · Propriété / Hébergement · Pro · Revenus / Charges · Crédits à reprendre · Retards · Synthèse (besoin total, CRD, reste à vivre, DTI) · Commentaires

Actions : Simuler · Enregistrer · Ouvrir demande publique (docs) · Transmettre (DDP)

## Pont barèmes
Depuis `crm-agency-fees.html` → **Créer dossier Prêt Immo** (montants préremplis via `js/finance-deep-link.js`).

Persistance : `localStorage` (`lo_crm_pret_immo_v1`) — sync API possible plus tard.
