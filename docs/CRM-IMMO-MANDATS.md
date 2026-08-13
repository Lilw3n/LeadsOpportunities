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

## Workflow

1. Filtrer un bien (optionnel) — le comparatif se synchronise sur la fiche.
2. Choisir forme + type ; filtrer **Droit / général** ou **Pratiques agence**.
3. **Créer un brouillon mandat** ou **Préremplir depuis le bien**.
4. Ajuster clauses / parties ; **Appliquer modèle forme** dans l’éditeur.
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
