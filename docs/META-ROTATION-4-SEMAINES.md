# Meta — rotation P1 (VTC · Santé · Prêt) — 1 €/jour

Une **seule campagne Meta active** à la fois. Priorité site : **VTC**, **mutuelle santé**, **prêt immobilier**.

```bash
npm run meta:rotation:status   # plan + semaine active + CPL
npm run meta:rotation:build    # régénère data/meta-campaign-rotation-active.json
```

CSV pubs : `ads/meta-priorite-vtc-pret-sante.csv`

---

## Plan 3 semaines

| Sem. | ID | Vertical | Landing | Form |
|------|-----|----------|---------|------|
| **S1 (active)** | `vtc_discret` | **VTC** | `/landings/vtc.html` | `vtc_express` |
| S2 | `sante_senior_canicule` | **Mutuelle** | `/landings/sante.html` | `sante_express` |
| S3 | `credit_pret_immo` | **Prêt immo** | `/landings/credit-immo.html` | `credit_immo_express` |

VSP reste disponible hors cycle (`docs/META-VSP-PUB-DISCRETE.md`) — ne pas activer en parallèle du P1.

**Début cycle** : `epoch_start` = **2026-08-25** (lundi) — semaine 1 = VTC.

---

## Optimisation avec CAPI

Dans Ads Manager, conversion :

1. **Principal** : `Lead` (navigateur + serveur)
2. **Scale** : `qualified_lead` (score ≥ 50)
3. Audience retarget : `JourneyFormStart` sans `Lead` → `/landings/rappel.html`

Vérifier CAPI prod : `GET /api/meta-status` → `capi_configured: true`

---

## Règles CPL

- **Couper** si CPL > **25 €**
- Vertical le moins cher historique : **VTC**
- Retargeting abandon quand assez de `JourneyFormStart`

---

## Activer manuellement (Ads Manager)

1. `npm run meta:rotation:status` → copier headline, form_id, UTM
2. **Pause** les autres campagnes
3. **1 campagne** · **1 €/jour** · formulaire de la semaine · événement **Lead**
4. Importer textes depuis `ads/meta-priorite-vtc-pret-sante.csv`

---

## SEO aligné

Landings + hubs GSC déjà prioritaires (`npm run gsc:urls`) :

- `/landings/vtc.html` · `/assurance-vtc/`
- `/landings/sante.html` · `/assurance-sante/`
- `/landings/credit-immo.html` · `/credit-immo/` · `/pret-immobilier/`
