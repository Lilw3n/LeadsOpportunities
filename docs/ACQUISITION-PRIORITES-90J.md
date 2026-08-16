# Acquisition — priorités 90 jours (exécution)

Aligné sur **`docs/ETUDE-MARCHE-LEADS-OPPORTUNITIES.md`** §8.  
Budget Meta : **1 €/jour, 1 campagne** (`config/meta-campaign-rotation.json`).

```bash
npm run meta:rotation:status
npm run gsc:urls
npm run verify:acquisition-priorites
```

---

## P1 — En cours (été 2026)

| Axe | Livrable repo | Action manuelle |
|-----|---------------|-----------------|
| **Mutuelle canicule** | Override Meta jusqu’au **2026-09-30** ; `ads/meta-canicule-maintenant.csv` (4 créas) ; blog-convert priorités 5–8 | Ads Manager : garder 1 ad set 1 €/j sur seniors canicule ; A/B créas téléconsult / famille / vigilance |
| **VTC IDF** | `FR_Search_VTC_IDF` dans `ads/google-ads-editor-ready-utm.csv` ; hubs GSC IDF/Paris/CDG/Orly ; Meta lignes 1–4 | Importer CSV Google Ads Editor ; activer Search IDF (CPC contrôlé) |
| **GSC hubs** | `scripts/seo-gsc-priority-urls.cjs` (VTC IDF, prêt, recherche-bien, canicule, Lemoine) | `npm run gsc:urls` → Inspection d’URL + resoumettre `sitemap.xml` |

---

## P2 — Tunnel immo

| Étape | Landing | Ancre |
|-------|---------|-------|
| 1. Bien | `/landings/acheteur-immo.html` | bandeau `data-immo-step="bien"` + CTA crédit + « Projeter ce bien » sur annonces |
| 2. Projection | `/landings/projection-achat.html` | CTA crédit + emprunteur (`#formules`) |
| 3. Crédit | `/landings/credit-immo.html#demande` | retour recherche bien |
| 4. Emprunteur | `/landings/credit-immo.html#formules` | hash → étape active dans le bandeau |

Assets : `js/immo-parcours-strip.js` + `landings/css/immo-parcours.css`.  
Partenaires affichés = **crédit uniquement** (pas d’assureurs) — `npm run verify:partners-credit`.

### Bridges conversion (approfondi)

| Chemin | Fichier clé |
|--------|-------------|
| SEO VTC → landing + UTM | `js/seo-landing-bridge.js` (chargé via `france-seo-meta.js`) |
| Hub IDF dual CTA | `#demande` + devis express 30 sec |
| Zone VTC (Paris/CDG/Orly) | `js/vtc-zone-hint.js` sur `landings/vtc.html` |
| Blog canicule → mutuelle | outline **`/landings/sante.html`** (aligné Meta) + mid-bridge seniors |

---

## Fichiers pub à importer

| Fichier | Canal |
|---------|-------|
| `ads/google-ads-editor-ready-utm.csv` | **Google Ads Editor** (UTM prod) — campagne `FR_Search_VTC_IDF` Enabled |
| `ads/google-ads-editor-ready.csv` | Brouillon local (legacy localhost) — ne pas importer en prod |
| `ads/meta-canicule-maintenant.csv` | Meta — créas override canicule |
| `ads/meta-blog-conversions.csv` | Meta — file d’attente blog→bridge (VTC + canicule en tête) |

---

## Checklist hebdo

1. `npm run meta:rotation:status` — CPL + verdict  
2. CRM **Origine leads** (`/crm-sources.html`) — UTM `vtc_search_idf` / `meta_sante_*`  
3. Clarity + GA4 : sessions FR, `JourneyFormStart` → Lead  
4. Si canicule hors saison après le 30/09 : désactiver `actu_override` ou prolonger `valid_until`

---

## Références

- `docs/ETUDE-MARCHE-LEADS-OPPORTUNITIES.md`
- `docs/ACQUISITION-BLOG-CONVERSION.md`
- `docs/META-ROTATION-4-SEMAINES.md`
- `docs/SEO-SEA-FRANCE-CIBLAGE.md`
