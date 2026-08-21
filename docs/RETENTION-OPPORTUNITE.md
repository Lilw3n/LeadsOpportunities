# Rétention visiteurs — ne pas partir sans devis

## Problème

Des visiteurs arrivent, ne remplissent rien, et repartent. Chaque départ = **opportunité manquée** (économies mutuelle, taux, acquéreurs, conformité VTC…).

## Module

| Fichier | Rôle |
|---------|------|
| `js/retention-opportunity.js` | Exit-intent, idle, bannière, retour d'onglet |
| `css/retention-opportunity.css` | Modal + bannière |

### Déclencheurs

1. **Exit-intent** (souris vers le haut) après 8 s  
2. **Idle ~55 s** si le visiteur a commencé à interagir  
3. **Bannière** à 25 s si zéro interaction  
4. **Retour d'onglet** s'il est parti après avoir touché le formulaire  

Max **2 affichages / session**. Jamais après lead envoyé. Désactiver : `data-retention="off"` sur `<body>`.

### Copy par besoin

`data-retention-need` sur le body : `sante`, `credit_immo`, `auto`, `habitation`, `vtc`, `vendeur`, `acheteur`, `rachat`, `default`.

Angles utilisés :

- Partir = **perdre des économies**  
- Sans devis = **acheter / assurer à l'aveugle**  
- Vendeur sans dépôt = **acquéreurs qui passent ailleurs**  
- Gratuit / ORIAS / rappel 15 min  

## Brancher une page

```html
<link rel="stylesheet" href="../css/retention-opportunity.css" />
…
<body data-retention-need="sante">
…
<script src="../js/retention-opportunity.js"></script>
```

## Idées complémentaires (suite)

1. **SMS / e-mail abandon** (si téléphone ou e-mail partiel capturé) — déjà partiellement via `quote-intelligence` draft  
2. **Retarget Meta** audience `JourneyFormStart` sans `Lead` (voir `ads/retargeting-assets.md`)  
3. **Progress bar** « 70 % — encore 1 minute pour votre devis »  
4. **Social proof** live (« 12 devis mutuelle Nancy cette semaine »)  
5. **Sticky CTA mobile** « Continuer mon devis »  
6. **Quiz 3 questions** ultra-court avant le formulaire long  
7. **Comparateur « avant / après »** (ex. mensualité actuelle vs simulée)  

## Vérif

`npm run verify:retention`
