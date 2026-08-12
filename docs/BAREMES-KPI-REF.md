# Barèmes — format KPI de référence

Capture métier (à respecter par défaut sur `/crm-agency-fees.html`) :

1. **Honoraires agence** — total honoraires du mandat  
2. **Ta part (X %)** — part négociateur (ex. 85 % Portes Clés / 40 % Laforêt)  
3. **Charges (cotis.+IR+CFE…)** — réserve forfaitaire sur ta part = `(URSSAF+IR%) + CFE% + compta%`  
3bis. **Revenu imposable estimé** — `ta part × (1 − abattement micro)` (BIC services 50 %, BNC 34 %, commerce 71 %) — **indicatif**  
4. **Net estimé** — carte verte / highlight (`ta part − charges`)

Extras (part agence/réseau, autre négo, apporteur, collab) = **optionnels** via cases à cocher, jamais dans la rangée par défaut.

## Ce que ce n’est pas
- Pas un calcul URSSAF / IR officiel (pas d’ACRE, plafonds micro, IR progressif, CIPAV…)
- Les « charges » sont une **réserve de trésorerie** pour cotisations + impôt + CFE + compta
- Le revenu imposable estimé sert à visualiser l’assiette micro, pas à déclarer

Voir presets dans `js/crm-agency-fees-lib.js` → `TAX_PRESETS`.
