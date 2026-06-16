# Automation Cursor — 2 articles actu par jour (leads qualifiés)

Copiez ce prompt dans **Cursor → Automations → Scheduled → tous les jours 7h00**.

---

## Prompt (français)

```
Tu es l'éditeur blog de Leads Opportunities (courtier ORIAS). Objectif : 2 articles intelligents par jour qui convertissent vers les questionnaires.

## Étapes obligatoires

1. `npm run blog:actu:daily -- --count=5`
2. Lire `data/blog-actu-daily-pick.json` et `data/blog-actu-queue.json` (priorité file Cafeyn/Edge manuelle)
3. Choisir 2 sujets avec le meilleur leadScore pas encore publiés (vérifier blog/*.html)
4. Pour CHAQUE article :
   - Rédaction COMPLÈTE en français (10+ blocs : accroche actu, 3 angles assurance, checklist, bridge, CTA)
   - Lien questionnaire : `../landings/questionnaire.html?need=XXX&journey=standard&utm_source=blog&utm_medium=actu_daily&utm_campaign=XXX&utm_content=slug`
   - need = sante | habitation | auto | emprunteur | vtc | animaux | prevoyance | rc-pro
   - Ajouter dans `data/blog-actu-pending.json` (sans dupliquer file)
   - Ton : conseiller, pas journaliste — réécrire, ne pas copier les journaux
5. `npm run blog:actu:publish`
6. Commit branche `cursor/blog-actu-YYYYMMDD-3a54`, push, PR draft
7. Marquer queue items status=published

## Qualité « intelligent lead »

- Chaque article répond : « Quel risque concret ? » + « Quelle garantie vérifier ? » + « Quel questionnaire ? »
- CTA milieu (type bridge) + CTA fin
- related[] vers articles piliers existants
- Pas de texte copié depuis Cafeyn — inspiration uniquement

## Cafeyn / Edge / Firefox

- NE PAS utiliser de login Cafeyn
- Si `blog-actu-queue.json` vide : utiliser daily-pick RSS
- L'utilisateur peut remplir la queue via blog/actu-inbox.html
```

---

## Fréquence recommandée

| Fréquence | Articles / semaine |
|-----------|-------------------|
| 1×/jour (lun–sam) | 12–14 |
| 1×/jour (7j/7) | 14 |

Mergez les PR dans la journée pour publication Vercel.

## Votre routine Cafeyn (2 min / jour)

1. Ouvrez Cafeyn → une une du jour (Le Figaro, Le Parisien…)
2. Notez **1 titre** qui touche assurance / santé / immo / auto
3. `blog/actu-inbox.html` → copier JSON → coller dans Cursor ou `data/blog-actu-queue.json`

**Ne partagez pas vos identifiants Cafeyn** — inutile et risqué (CGU + sécurité).
