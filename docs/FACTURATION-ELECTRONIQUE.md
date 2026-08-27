# Facturation électronique — Leads Opportunities

**Échéance critique : 1er septembre 2026** — obligation de **recevoir** des factures électroniques via une **plateforme agréée (PDP)** pour toute entreprise assujettie à la TVA établie en France.

## Calendrier (officiel)

| Obligation | Date | Qui |
|---|---|---|
| **Réception** e-invoicing | **01/09/2026** | Toutes les entreprises concernées |
| **Émission** + e-reporting | 01/09/2026 | Grandes entreprises & ETI |
| **Émission** + e-reporting | **01/09/2027** | PME, TPE, micro / EI |

Leads Opportunities (EI, SIREN `810 571 513`) → **réception au 01/09/2026**, émission au **01/09/2027** (sauf anticipation volontaire).

Sources : [impots.gouv.fr](https://www.impots.gouv.fr/facturation-electronique) · [Service-Public Entreprendre](https://entreprendre.service-public.gouv.fr/actualites/A15683) · assistance **0 806 807 807**.

## Ce que ce n’est PAS

- Un PDF envoyé par e-mail **n’est pas** une facture électronique conforme.
- Ce CRM **n’est pas** une PDP : il prépare l’identité, la checklist, le registre et l’export **Factur-X / CII**.
- La transmission légale passe par une **plateforme agréée** (ou un outil compta / banque / expert-comptable raccordé).

## Module CRM

- UI : `/crm-e-invoicing.html`
- API : `/api/crm/e-invoicing` (`sub=status|received|issued|xml`)
- Config défaut : `config/e-invoicing.json`
- SQL : `database/e-invoicing.sql` (+ `ensureEInvoicingSchema`)
- Lib : `api/_lib/e-invoicing.js` (mentions + XML CII profil minimum)
- Vérif : `npm run verify:e-invoicing`

### Actions immédiates (avant le 1er sept.)

1. Choisir une PDP / outil compatible → [liste des plateformes agréées](https://www.impots.gouv.fr/liste-des-plateformes-agreees-pdp)
2. Désigner la plateforme de **réception** et renseigner l’annuaire
3. Cocher la checklist dans le CRM (trajectoire documentée)
4. Compléter SIRET / n° TVA dans le module
5. Brief expert-comptable ; conserver les preuves d’engagement

Pendant le démarrage, l’admin fiscale indique qu’il n’y aura pas de sanctions automatiques si une **trajectoire sérieuse** est engagée (pas d’inertie). Continuer à traiter / payer les factures reçues par e-mail ou papier.

## Mix intelligent (0 €)

**Règle :** une seule PDP légale de réception. Pas de « 5 PDP en parallèle ».

| Rôle | Outil | Prix | Pour LO |
|---|---|---|---|
| **PDP légale** | **Tiime** | 0 € | Recommandé — réception + factu |
| Commercial | CRM LO + Stripe | déjà là | Devis, acomptes, registre |
| Automation | **Make Free** | 0 € | Pont CRM → Drive/mail → Tiime |
| Compta (option) | Indy | 0 € | Seulement si tu gères seul |
| Banque (option) | Shine | selon offre | Compte pro, pas 2ᵉ PDP |
| Plan B | Abby | 0 € | À la place de Tiime, pas en plus |
| Plus tard | Odoo | free → payant | Trop lourd pour l’EI court terme |

Config : `config/e-invoicing-stack.json` · UI : panneau « Mix intelligent » sur `/crm-e-invoicing.html`.  
Pont Make : **`docs/MAKE-TIIME-EINVOICE.md`** · blueprint `data/make-blueprints/einvoice-crm-to-make.json`.

## Mentions obligatoires (émission)

À ajouter sur les factures émises (GE/ETI dès 2026, PME/micro dès 2027) :

- SIREN du client
- Adresse de livraison si ≠ adresse de facturation
- Nature : biens / services / mixte
- Mention TVA sur les débits si option

## Export Factur-X

`POST /api/crm/e-invoicing` avec `action: "issue"` génère un XML CII (profil minimum Factur-X).  
**À transmettre ensuite via la PDP** — le téléchargement XML seul ne remplace pas le circuit légal.

## Conservation

Documents électroniques : **6 ans** sur support informatique.
