# Mandats immobiliers — formes & documents CRM

## Objectif

Aider l’agence à choisir et rédiger un **mandat** (vente, location, recherche, estimation) en distinguant :

| Badge | Sens |
|-------|------|
| **Général** | Droit / infos applicables à tout intermédiaire (loi Hoguet, mentions obligatoires, formes Simple / Exclusif / Semi-exclusif). |
| **Agence** | Usages réseau (priorité pub, co-listing, n° archive, barèmes) — à adapter, ce n’est pas une règle légale unique. |

Page : `/crm-immo-documents.html`

## Comparatif (catalogue)

Fichier : `data/immo-mandat-formes.json`  
Module : `js/crm-immo-mandat-formes.js` · styles `css/crm-immo-mandats.css`

### Formes

- **Simple** — plusieurs agences possibles ; vente directe du mandant possible.
- **Exclusif** — un seul intermédiaire ; exclusivité forte.
- **Semi-exclusif** — un seul pro ; vente directe souvent réservée sous conditions d’honoraires (**définition variable selon réseaux** → badge Agence).

### Types → `doc_type`

| Type fiche bien | Document CRM |
|-----------------|--------------|
| Vente | `mandat_vente` |
| Location | `mandat_location` |
| Recherche | `mandat_recherche` |
| Estimation | `autre` (souvent hors mandat Hoguet strict) |

Aligné sur les champs fiche : `forme_mandat`, `type_mandat`, `n_mandat`, dates, `mandat_hors_etablissement`, etc. (`js/crm-immo-property-schema.js`).

## Formulaire « mandat de vente sans exclusivité »

Inspiré de la structure type réseaux (ex. modèles Laforêt), **sans aucune marque ni coordonnées d’agence en dur**.

| Élément | Rôle |
|---------|------|
| `data/immo-mandat-vente-simple-form.json` | Schéma des sections / champs |
| `js/crm-immo-mandat-form.js` | Rendu, mémorisation profil agence, génération clauses + parties |
| Bouton **Formulaire mandat sans exclusivité** | Sur `/crm-immo-documents.html` |

### Remplir → aperçu → imprimer (type Favoriz)

Le formulaire suit le flux observé sur les outils type Favoriz :

1. **Article 1 — Désignation du mandataire** : prose légale à trous (enseigne, société, capital, RCS, CPI, RCP, TVA…).
2. **Toggles OUI/NON** qui ouvrent des champs :
   - établissement secondaire
   - compte séquestre (sinon mention « ne devant recevoir ni détenir… »)
   - caisse de garantie (organisme, adresse, n° adhérent)
   - ORIAS
   - liens capitalistiques banque / autre
3. **Aperçu live** à droite = rendu type mandat rempli.
4. **Aperçu / imprimer** ouvre une fenêtre prête pour l’impression.

L’enseigne n’est **jamais** figée (Laforêt, Favoriz, etc.) : vous complétez l’agence de votre choix, ou liez seulement le nom depuis les barèmes.

### PDF source

Déposer `mandat_de_vente_sans_exclusivite_*.pdf` dans `docs/immo-mandats/_inbox/` pour caler libellés exacts du réseau (toujours sans figer une enseigne).

## Workflow

1. Filtrer un bien (optionnel) — le comparatif se synchronise sur la fiche.
2. Choisir forme + type ; filtrer **Droit / général** ou **Pratiques agence**.
3. **Formulaire sans exclusivité** : remplir agence (libre) + mandant + bien + prix + honoraires → **Appliquer au document**.
4. Ou **Créer un brouillon mandat** / **Préremplir depuis le bien**.
5. Lien honoraires : `/crm-agency-fees.html`.

## PDF réseau (inbox)

Le fichier Windows `comparatif _differentes-formes_des_mandats.pdf` n’est pas versionné tant qu’il n’est pas déposé ici :

```
docs/immo-mandats/_inbox/
```

Voir `docs/immo-mandats/_inbox/README.md`. Après dépôt, enrichir `data/immo-mandat-formes.json` (libellés réseau, clauses maison) en gardant les tags `audience`.

## Limites

- Brouillon CRM ≠ acte signé conforme.
- Le semi-exclusif n’a pas de définition légale unique : toujours coller au modèle du réseau.
- E-signature / PDF final : à venir.
