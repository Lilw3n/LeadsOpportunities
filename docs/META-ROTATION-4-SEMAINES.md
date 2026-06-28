# Meta — rotation intelligente 4 semaines (1 €/jour)

Une **seule campagne Meta active** à la fois. Le site, le CRM et le dashboard affichent automatiquement le **vertical de la semaine**.

```bash
npm run meta:rotation:status   # plan + semaine active + CPL
npm run meta:rotation:build    # régénère data/meta-campaign-rotation-active.json
```

---

## Plan 4 semaines

| Sem. | ID | Vertical | Pub | Form template |
|------|-----|----------|-----|---------------|
| **ACTU** | `sante_senior_canicule` | **Mutuelle canicule** | **Canicule EN COURS** | `sante_express` |
| S1 | `vtc_discret` | VTC | Charges pro (discret) | `vtc_express` |
| S2 | `sante_senior_canicule` | Mutuelle | Canicule seniors | `sante_express` |
| S3 | `vsp_citadine_discret` | VSP | Citadine légère (discret) | `vsp_express` |
| S4 | `credit_lemoine` | Emprunteur | Loi Lemoine | `credit_immo_express` |

**Override actu** (`actu_override` dans le JSON) : tant que la canicule est d’actualité, le site et le CRM poussent **mutuelle seniors** avant la rotation S1 VTC.

Puis le cycle reprend (S1 VTC → …).

**Override actif jusqu’au** : 14 juillet 2026 (modifiable dans `config/meta-campaign-rotation.json`).

**Début cycle** : `epoch_start` dans `config/meta-campaign-rotation.json` (30 juin 2026).

---

## Intelligence intégrée

| Composant | Rôle |
|-----------|------|
| `config/meta-campaign-rotation.json` | Plan + règles CPL |
| `api/_lib/meta-campaign-rotation.js` | Moteur (semaine active, stats DB) |
| `GET /api/acquisition-focus` | Site public — hero + CTA focus |
| `GET /api/crm/meta-rotation` | CRM acquisition — panel Meta |
| `GET /api/dashboard/meta-rotation` | Dashboard admin |
| `js/acquisition-focus.js` | Home : bannière + carte hero mise en avant |

### Règles CPL

- **Couper** si CPL > **25 €** après leads ou ~7 € dépensés sans conversion
- **Vertical le moins cher historique** : VTC
- **Retargeting abandon** (fallback) : 2–3× moins cher que froid — activer quand assez de `JourneyFormStart`

---

## Activer manuellement (Ads Manager)

1. `npm run meta:rotation:status` → copier headline, form_id, UTM
2. **Pause** les autres campagnes
3. **1 campagne** · **1 €/jour** · formulaire de la semaine
4. Leads → webhook → `crm-meta-inbox.html` → CRM

---

## Fichiers liés

- `docs/META-VSP-PUB-DISCRETE.md` — détail VSP semaine 3
- `docs/ACQUISITION-BLOG-CONVERSION.md` — stratégie CPL globale
- `config/meta-campaign-vsp-discret.json` — spec VSP seule (hors rotation possible)
