# Mandats, partenaires & partage d'honoraires

## Objectif produit

1. **Négociateurs, notaires, avocats, apporteurs** peuvent s'inscrire et se connecter (`/partenaires-immo/`).
2. **Chaque bien** peut avoir **plusieurs liens** d'annonces (Leboncoin, SeLoger…).
3. Le **mandat** est renseigné (forme, dates, réf.).
4. La **durée du mandat** n'est visible que pour le **propriétaire** et **Wendy (admin)** — pas les partenaires, pas le public.
5. Logique **entrée / sortie** : vendeur cherche acquéreur → SEO hub `/vendeur-cherche-acquereur/`.
6. **Partage d'honoraires** entrant / sortant / apporteur / notaire / avocat, avec notes légales.

## Pages

| URL | Rôle |
|-----|------|
| `/partenaires-immo/` | Hub partenaires |
| `/partenaires-immo/inscription.html` | Inscription |
| `/partenaires-immo/espace.html` | Connexion + biens liés |
| `/partenaires-immo/mandat-duree.html` | Durée mandat (owner + admin) |
| `/vendeur-cherche-acquereur/` | SEO vendeur → acquéreur |
| `/negociateur-immobilier/` | Landing partage lien acquéreurs |

## API

| Méthode | Route | Auth |
|---------|-------|------|
| POST | `/api/immo-network/register` | public |
| POST | `/api/immo-network/login` | public |
| GET | `/api/immo-network/me` | Bearer partenaire |
| GET | `/api/immo-network/properties` | Bearer partenaire |
| GET/POST | `/api/immo-network/links?op=links` | partenaire / admin |
| GET/POST | `/api/immo-network/fees` | partenaire / admin |
| POST | `/api/immo-network/grant` | **admin** (lier partenaire ↔ bien) |
| GET | `/api/immo-network/mandate-duration?propertyId=&ownerEmail=` | owner match / admin |

## Schéma Neon

Voir `database/crm-immo-network-mandats.sql` — tables :

- `crm_immo_network_partners`
- `crm_immo_property_links`
- `crm_immo_fee_agreements`
- `crm_immo_partner_property_access`
- colonnes mandat / `listing_urls_json` / `seo_*` sur `crm_immo_properties`

Runtime : `ensureImmoNetworkSchema()` dans `api/_lib/immo-network-store.js`.

## Libs JS

- `js/immo-mandate-acl-lib.js` — durée + ACL
- `js/immo-fee-share-legal-lib.js` — répartition + alertes légales
- `js/immo-property-links-lib.js` — multi-URLs

## Cadre légal (rappel opérationnel)

- Honoraires d'agence **affichés** et portés au mandat.
- Partage entrant/sortant : **convention écrite**.
- Apporteur : **pas de % promis** sur le site public ; convention préalable.
- Notaire : émoluments ≠ commission agence.
- Avocat : lettre de mission.

Le calculateur CRM (`crm-agency-fees.html` + `crm-agency-fees-lib.js`) reste la référence barèmes agence ; les `fee_agreements` tracent les parts partenaires par bien.

## Workflow Wendy

1. Valider les partenaires (`status`: pending → active) en base / admin.
2. Sur une fiche bien : renseigner mandat + liens + honoraires.
3. `POST /api/immo-network/grant` pour lier un partenaire au bien.
4. Owner : envoyer le lien `/partenaires-immo/mandat-duree.html`.

## SEO

Articles : `scripts/blog-vendeur-acquereur-seo-articles.cjs`  
Hub : `/vendeur-cherche-acquereur/`
