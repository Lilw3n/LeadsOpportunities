## Google Ads — voiture sans permis (Search)

Campagne **explicite** : les internautes tapent « assurance voiture sans permis ».  
À distinguer de la pub **Meta discrète** (`docs/META-VSP-PUB-DISCRETE.md`) qui dit « citadine légère ».

```bash
npm run verify:vsp
```

| Fichier | Rôle |
|---------|------|
| `config/google-campaign-vsp.json` | Campagne Search + checklist |
| `ads/google-vsp-search.csv` | Import Google Ads Editor |
| `ads/google-ads-editor-ready-utm.csv` | Fichier unique (VTC + VSP + …) |
| `landings/vsp.html` | Landing money |
| `/assurance-voiture-sans-permis/` | Silo SEO + villes |

---

## Activer dans Google Ads

1. **Google Ads Editor** → Compte France → Importer `ads/google-vsp-search.csv` (ou les lignes `FR_Search_VSP_HotIntent` du CSV UTM).
2. **Conversions** : lier GA4 `generate_lead` / `form_submit` (voir `ads/google-acquisition-setup.md`).
3. **Budget** : **5 €/jour** au départ (Search, pas 1 € Meta).
4. **Enchères** : Maximiser les conversions, puis CPA cible après ~30 conversions.
5. **Geo** : France, langue français.
6. **Annonces RSA** : titres avec « Sans Permis » / « VSP » / « Permis AM » — **autorisé sur Google**, interdit sur Meta.
7. Publier → tester `landings/vsp.html?utm_source=google&utm_medium=cpc&utm_campaign=vsp_search_hot`.
8. CRM : leads `need=vsp` → matching privé AMI / FMA / Solly (`crm-private-offer-matching.html`).

---

## Sitelinks (à créer dans Google Ads)

| Libellé | URL |
|---------|-----|
| Devis VSP | `https://www.leadsopportunities.fr/landings/vsp.html` |
| Permis AM | `https://www.leadsopportunities.fr/assurance-voiture-sans-permis/permis-am/` |
| Quadricycle | `https://www.leadsopportunities.fr/assurance-voiture-sans-permis/quadricycle/` |
| Tarif | `https://www.leadsopportunities.fr/assurance-voiture-sans-permis/tarif/` |

---

## Mots-clés (extrait)

- Phrase : `assurance voiture sans permis`, `devis vsp`, `assurance sans permis`, `assurance quadricycle leger`
- Exact : `[assurance voiture sans permis]`
- Négatifs : gratuit, emploi, formation, occasion, location, forum

---

## Après un lead

1. Questionnaire `?need=vsp` : âge, BSR/AM, ASSR, marque.
2. 14–15 ans : tag rappel 16 ans (mêmes règles que Meta).
3. Ne **pas** coller l’e-mail dans l’URL de reprise (jeton CRM).
