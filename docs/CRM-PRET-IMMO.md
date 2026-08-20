# Prêt Immo — dossiers & simulations

Module CRM inspiré du parcours courtier (Mes dossiers / Effectuer simulation).

## Guide rapide (à quoi ça sert)

Panneau interactif dans le CRM : script [`js/crm-pret-guide.js`](../js/crm-pret-guide.js) (ouvert par défaut sur Mes dossiers + Documentation).

| Zone | Rôle |
|------|------|
| **Mes dossiers** | Suivi des dossiers (réf., position, banque, produit) |
| **Simulation** | Chiffrage IMMO / RAC / SCI / SCPI / CONSO / HYPO / viager |
| **Documentation** | Recherche grilles + fiches liée au projet (PTZ, relais, travaux…) |
| **Grilles / Fiches** | Barèmes partenaires et conditions d’éligibilité |
| **PVH** | Calculette capital dû (intérêts capitalisés) |

### PDF Bureau (`Desktop\pret`)

L’agent cloud **ne peut pas** lire `C:\Users\…\Desktop\pret`.  
Catalogue indexé (~201 fiches, ~39 grilles) mais statut **`pending_upload`** tant que les fichiers ne sont pas dans le repo :

```bash
# copier les PDF depuis le Bureau vers :
docs/pret-fiches/_inbox/
docs/pret-grilles/_inbox/
npm run pret:fiches:import
npm run pret:grilles:import
```

## Projection publique (acquéreur)

Simulateur **coût réel du logement** : [`landings/projection-achat.html`](../landings/projection-achat.html)  
Prêt + taxe foncière + énergie/eau + copro + travaux + salaire / apport / patrimoine / reste à vivre.  
Moteur : [`js/achat-projection-lib.js`](../js/achat-projection-lib.js) — tests : `npm run verify:projection`.

## Accès
- Liste : [`crm-pret-immo.html`](../crm-pret-immo.html)
- Simulateur : [`crm-pret-immo-sim.html`](../crm-pret-immo-sim.html)
- Coordonnées : [`crm-pret-immo-coord.html`](../crm-pret-immo-coord.html)
- **Documentation intelligente** (hub) : [`crm-pret-immo-docs.html`](../crm-pret-immo-docs.html) — voir [`CRM-PRET-DOC-SEARCH.md`](./CRM-PRET-DOC-SEARCH.md)
- Grilles des taux : [`crm-pret-immo-grilles.html`](../crm-pret-immo-grilles.html) — voir [`CRM-PRET-GRILLES-TAUX.md`](./CRM-PRET-GRILLES-TAUX.md)
- Fiches produits : [`crm-pret-immo-fiches.html`](../crm-pret-immo-fiches.html) — voir [`CRM-PRET-FICHES-PRODUITS.md`](./CRM-PRET-FICHES-PRODUITS.md)
- **Assurance immo** (switcher) : [`crm-assurance-immo.html`](../crm-assurance-immo.html) — ADE / MRH
- Sidebar Immobilier → **Prêts** / **Assurance immo**

## Menu switcher (4 piliers)
Composant [`js/crm-immo-finance-nav.js`](../js/crm-immo-finance-nav.js) + [`css/crm-immo-finance-nav.css`](../css/crm-immo-finance-nav.css) :

1. **Prêts** — dossiers / sims / docs / barèmes  
2. **Assurance immo** — ADE / MRH ([`crm-assurance-immo.html`](../crm-assurance-immo.html))  
3. **Patrimoine** — retraite, mutuelle, invalidité, famille ([`crm-patrimoine.html`](../crm-patrimoine.html))  
4. **Banque & épargne** — trésorerie / placements ([`crm-banque-epargne.html`](../crm-banque-epargne.html))

Barèmes : charges forfaitaires + **revenu imposable estimé** (abattement micro) — voir [`BAREMES-KPI-REF.md`](./BAREMES-KPI-REF.md).

## Navigation
- **Mes dossiers** — tableau (date, rubrique, réf., emprunteur, co-emprunteur, dép., apporteur, réseau, utilisateurs, position, DDP, montant, banque, produit, archive)
- **Effectuer simulation** — RAC (Propriétaire / Locataire / Hébergé), IMMO, SCI, SCPI, CONSO, HYPO, VIAGER, PVH calculette
- **Transmettre coordonnées** — [`crm-pret-immo-coord.html`](../crm-pret-immo-coord.html) : fiche légère indicateur d’affaires (responsable, emprunteur/co, logement, notes, option délégation)
- **Documentation** — hub unique (grilles + fiches), corrélé aux projets (PTZ, relais, conso, travaux, prêt immo)
- **Grille des taux** / **Fiches produits** — catalogues dédiés
- Liens vers demande publique + barèmes FAI

Sur un dossier IMMO : cases **PTZ** / **Prêt relais**, montant **Travaux** → la doc se filtre automatiquement (icône 📑 liste + bouton *Documentation liée* simulateur).

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
