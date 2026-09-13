# Schéma de composition immo (multi-niveaux)

## Synthèse

Un dossier « complexe / immeuble » n’est plus une fiche plate : c’est un **arbre**.  
Chaque nœud (terrain, immeuble, étage, appart…) a :

1. sa **propre barre noire** (identité, loyers, pièces, bail, médias) ;
2. un **rattachement** `parent_id` vers le niveau au-dessus ;
3. des **totaux remontés** (loyers réel / prévisionnel, pièces, baux) au niveau global et par branche.

```mermaid
flowchart TB
  subgraph foncier["1. Foncier"]
    T["Terrain / parcelle<br/>cadastre · surface · viabilisation"]
  end
  subgraph bati["2. Bâti"]
    I["Immeuble / maison<br/>enveloppe · structure"]
  end
  subgraph niveaux["3. Niveaux"]
    E0["Étage RDC"]
    E1["Étage 1"]
    E2["Étage 2"]
  end
  subgraph lots["4. Lots"]
    A1["Appart RDC<br/>loyer · pièces · bail"]
    A2["Appart 1er<br/>loyer · pièces · bail"]
    A3["Appart 2e<br/>loyer · pièces · bail"]
    L["Local pro"]
    D["Dépendance / cave"]
  end
  T --> I
  I --> E0
  I --> E1
  I --> E2
  I --> D
  E0 --> A1
  E1 --> A2
  E2 --> A3
  E0 --> L
```

## Niveaux métier

| Niveau | Type unité | Infos typiques | Agrégats utiles |
|--------|------------|----------------|-----------------|
| Terrain | `terrain` | cadastre, surface foncière, PLU | surface |
| Immeuble / maison | `immeuble`, `maison` | enveloppe, année, structure | Σ lots, Σ loyers |
| Étage | `etage` | niveau, parties communes étage | Σ lots de l’étage |
| Appartement / local | `appartement`, `local` | loyer réel/prévisionnel, pièces, bail | point de détail |
| Dépendance | `dependance` | cave, garage, local technique | surface / médias |

## Flux UI

1. **Composition** → synthèse + totaux globaux + **schéma arborescent**
2. Clic **Fiche (barre noire)** sur un nœud → sidebar noire scoped à ce nœud
3. Saisie loyers / pièces / bail au niveau lot → totaux recalculés à la remontée

## Exemple chiffré (preset immeuble)

```
Terrain 420 m²
└─ Immeuble A 280 m²
   ├─ RDC
   │  └─ Apt 1 — loyer réel 580 € · 2 pcs / 1 ch
   ├─ 1er
   │  └─ Apt 2 — loyer réel 640 € · 3 pcs / 2 ch
   ├─ 2e
   │  └─ Apt 3 — prévisionnel 720 € · 3 pcs / 2 ch
   └─ Cave 12 m²
```

**Totaux globaux attendus** : loyers réels 1 220 € · prévisionnels 2 020 € · 8 pièces · 5 chambres · 2 baux actifs.

## API lib (`crm-immo-dossier-lib.js`)

- `buildCompositionTree(units)` — arbre parent→enfants
- `subtreeTotals(units, rootId, includeRoot)` — totaux d’une branche
- `unitTotals(units)` — totaux globaux
- `COMPOSITION_LEVELS` — rôles métier (foncier / bâti / niveau / lot / annexe)

## Variantes courantes

- **Maison sur terrain** : terrain → maison → (évent. dépendances) — pas d’étages
- **Complexe** : terrain → plusieurs bâtis → lots
- **Copro simple** : immeuble → appartements (étages optionnels)
