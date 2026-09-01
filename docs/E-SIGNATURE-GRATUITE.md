# Signature électronique gratuite (SES)

Module CRM **sans abonnement SaaS** pour faire signer un document par lien client.

## Où

| Page | Rôle |
|---|---|
| [`/crm-e-signature.html`](../crm-e-signature.html) | Créer une demande, copier le lien, voir les signatures |
| [`/landings/signature-electronique.html?t=…`](../landings/signature-electronique.html) | Page publique client (canvas + consentement) |

Menu CRM → **Signature électronique**.

## Parcours

1. CRM → titre + texte du document → **Créer le lien**
2. Copier le lien → SMS / e-mail / messagerie
3. Le client signe (souris ou doigt) + coche le consentement
4. CRM → **PDF signé** (Imprimer → Enregistrer en PDF)

## Preuve conservée (Neon)

- Image de signature (PNG base64)
- Nom / e-mail
- Horodatage
- IP + user-agent
- Consentement exprès

Table : `e_signature_requests` (créée automatiquement au 1er appel API).

## Limites juridiques (important)

Ce module produit une **signature électronique simple (SES)** — utile pour bons de visite, avenants, acceptation de devis, attestations.

Pour un **mandat exclusif**, un **compromis**, ou tout acte nécessitant une **signature qualifiée eIDAS**, utilisez un prestataire de confiance :

- [Yousign](https://yousign.com) (offre d’essai / packs)
- DocuSign, Adobe Sign, etc.

Le PDF généré rappelle cette distinction.

## API

```
GET  /api/crm/e-signature?action=list
POST /api/crm/e-signature?action=create
GET  /api/crm/e-signature?action=get&id=…
POST /api/crm/e-signature?action=cancel
GET  /api/crm/e-signature?action=public-get&token=…
POST /api/crm/e-signature?action=public-sign
```

## Vérif

```bash
npm run verify:e-signature
```
