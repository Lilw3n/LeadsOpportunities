# Meta — campagnes prêtes (activation 1 €/jour)

File d’attente : **`config/meta-campaigns-queue.json`** · CSV : **`ads/meta-campaigns-ready.csv`**

```bash
npm run meta:campaigns:status
```

---

## Règle d’or

| Contrainte | Valeur |
|------------|--------|
| Budget compte | **1 €/jour max** |
| Campagnes / annonces actives | **1 seule** |
| Activation | **Manuelle** — une ligne à la fois |

Ne pas lancer plusieurs campagnes en parallèle : vous dépasseriez le budget ou dilueriez les 1 €.

---

## Segments préparés

| Priorité | ID | Cible | Discret ? | Formulaire |
|----------|-----|-------|-----------|------------|
| 1 | `senior_mutuelle_canicule` | Seniors 58–75, mutuelle + canicule | Non | Mutuelle express |
| 2 | `vtc_couts_discret` | Pro transport, charges élevées | **Oui** | VTC express |
| 3 | `vsp_citadine_discret` | Citadine / léger urbain (VSP en CRM) | **Oui** | Auto express |
| 4 | `mutuelle_collective_entreprise` | TPE / dirigeants / RH | Non | Rappel universal |
| 5 | `pret_assurance_emprunteur` | Prêt immo / Lemoine | Non | Crédit express |
| 6 | `mutuelle_famille_reserve` | Famille (hors canicule) | Réserve | Mutuelle express |

**Discret** = copie pub **sans** VTC, Uber, VSP, BSR, noms concurrents — le détail est dans le formulaire / CRM (`crm-private-offer-matching` pour VSP).

---

## Activer UNE campagne (Ads Manager)

1. **Meta Ads Manager** → **Créer** → Objectif **Prospects** / **Leads**
2. **Budget campagne** : **1,00 €** / jour (pas plus)
3. **1 ensemble de publicités**, **1 annonce**
4. **Formulaire instantané** : `form_id` de la ligne (colonne CSV)
5. **Ciblage** : France, français, tranche d’âge + intérêts du JSON
6. **Textes** : copier headline + primary depuis JSON ou CSV
7. **URL optionnelle** : article blog (UTM déjà dans le JSON)
8. Marquer `active: true` **uniquement** pour cette campagne dans `config/meta-campaigns-queue.json` (suivi interne)

### Première recommandée (juin–été)

**`senior_mutuelle_canicule`** — angle canicule + articles blog déjà publiés.

---

## Rotation (quand changer)

Après **~7 jours** ou **5 clics** sans Lead :

- **Lead reçu** → laisser tourner ou optimiser créatif
- **0 Lead** → pause campagne, activer la **priorité suivante** dans `rotation_order`

Ordre suggéré :

1. Senior canicule  
2. VTC discret  
3. VSP discret  
4. Mutuelle collective entreprise  
5. Prêt / emprunteur  

---

## VTC / VSP — concurrent qui surveille

- Pas de marque concurrente en ciblage ou texte
- UTM internes génériques (`meta_pro_mobilite_convert`, `meta_auto_citadine_convert`)
- Ad Library reste publique — discrétion = **message générique**, pas ciblage « espion »
- Qualification VSP : **crm-private-offer-matching.html** (interne)

---

## Checklist avant activation

- [ ] Webhook Meta OK (`META_VERIFY_TOKEN`)
- [ ] `META_PAGE_ACCESS_TOKEN` avec `pages_manage_ads` + `leads_retrieval`
- [ ] Formulaires **· LO 2026** actifs sur la page
- [ ] Budget **1 €/jour** saisi dans Ads Manager
- [ ] **Une seule** campagne en statut Actif
- [ ] Test lead → **crm-meta-inbox.html**

---

## Fichiers liés

- `config/meta-lead-forms.json` — `form_id` par vertical
- `docs/META-ADS-AUTOMATION.md` — pixel, webhook, CAPI
- `docs/ACQUISITION-BLOG-CONVERSION.md` — validation organique avant scale
