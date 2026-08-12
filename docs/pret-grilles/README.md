# Dépôt des grilles (PDF / XLS)

## Import automatique (recommandé)

1. Copiez **tous** vos PDF (même avec `(1)` `(2)`) dans `_inbox/`
2. Lancez : `npm run pret:grilles:import`

Le script déduplique via [`scripts/pret-grilles-manifest.json`](../../scripts/pret-grilles-manifest.json) et range dans :

```
docs/pret-grilles/
  _inbox/          ← dépôt brut
  rac/
  immo/
  sci/
  scpi/
  hypo_treso/
  treso/
  renov/
  relais/
  pvh/
```

Voir [`docs/CRM-PRET-GRILLES-TAUX.md`](../CRM-PRET-GRILLES-TAUX.md).
