# Meta — pub discrète VSP uniquement (1 €/jour)

Configuration **VSP seule** : copie pub générique (« citadine légère »), qualification VSP dans le **formulaire Meta** et le **CRM privé**.

```bash
npm run meta:vsp:discret
```

Fichiers :

| Fichier | Rôle |
|---------|------|
| `config/meta-campaign-vsp-discret.json` | Campagne unique VSP |
| `ads/meta-vsp-discret.csv` | Copier-coller Ads Manager |
| `config/vsp-market-rules.json` | Règles légales 14 ans / BSR-ASSR |
| `config/meta-lead-forms.json` | Formulaire `vsp_express` |

---

## Règle d’or

| Contrainte | Valeur |
|------------|--------|
| Budget | **1 €/jour** |
| Campagnes actives | **1 seule** (VSP discrète) |
| Mots interdits dans la pub | VSP, sans permis, BSR, ASSR, Aixam, Ligier… |

**Ne pas** lancer mutuelle, VTC ou auto en parallèle sur le même compte.

---

## Formulaire Meta (prêt)

| Champ | Valeur |
|-------|--------|
| **form_id** | `1023485613566134` |
| **Nom** | Citadine légère — Devis express (Meta) |
| **Template** | `vsp_express` |
| **Questions** | Âge (14–15 inclus), année naissance, BSR/AM |

Le détail VSP (BSR, ASSR, matching AMI/FMA/Solly) reste **dans le formulaire et le CRM**, pas dans l’annonce visible dans la bibliothèque publicitaire.

---

## Activer dans Meta Ads Manager

1. **Pause** toute campagne existante sur le compte `997768686183548`.
2. **Créer** → Objectif **Prospects** / **Leads**.
3. **Budget campagne** : **1,00 €** / jour.
4. **1 ensemble de publicités**, **1 annonce**.
5. **Formulaire instantané** : sélectionner **Citadine légère — Devis express (Meta)** (`1023485613566134`).
6. **Ciblage** :
   - France, français
   - **16–45 ans** (ou 14–45 si l’interface le permet)
   - Intérêts : Automobile, Ville, Mobilité urbaine, Petites voitures
   - **Éviter** les intérêts « sans permis » / « VSP »
7. **Textes annonce** (copier depuis le CSV ou le JSON) :

   - **Titre** : Petite citadine : bien assurée ?
   - **Texte principal** : Véhicule léger en ville — comparez les garanties sans engagement. Devis express en 3 minutes, coordonnées préremplies si connecté.
   - **Description** : France · devis gratuit · courtier ORIAS
   - **CTA** : Comparer

8. **Visuel** : citadine urbaine générique — pas de logo marque VSP.
9. Publier → vérifier le lead dans `crm-meta-inbox.html` puis `crm-private-offer-matching.html`.

---

## Après réception d’un lead

1. Webhook : `GET/POST /api/webhooks/meta-lead` (déjà configuré).
2. CRM → **Matching VSP privé** : acteur recommandé (AMI 3F, FMA, Solly Azar).
3. Lead **14–15 ans** : tag `conduite_14_15_rappel_16` — assurance partenaire souvent dès 16 ans.
4. Né **avant 1988** : BSR/AM suffit · Né **1988+** : ASSR + BSR à confirmer.

---

## Suivi interne

Marquer `"active": true` dans `config/meta-campaign-vsp-discret.json` quand la pub est en ligne (suivi repo uniquement).
