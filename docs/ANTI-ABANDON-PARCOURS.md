# Anti-abandon parcours / questionnaires

## Problemes traites

1. Formulaires longs (7–8 etapes) → abandon mid-funnel  
2. Mur adresse en fin de parcours  
3. Pas de sortie « rappel » une fois le parcours commence  

## Correctifs

| Element | Detail |
|---------|--------|
| Bouton **Etre rappele maintenant** | Injecte par `landings/quote-wizard.js` des l'etape 2 ; envoie avec tel+email (+ RGPD), sans exiger le reste |
| Nudges mid-funnel | Bandeau `.wizard-benefit-nudge` selon verticale / etape |
| Adresse facultative | `street`, `cityFull`, `postalCode` (sauf CP etape 1 sante) sur sante, credit, vtc, acheteur |
| Champs alleges | Surface credit, situation familiale, dates d'effet, etc. |
| Tracking | GA4 `journey_early_callback` + event journey `wizard_early_finish` |

## Verif

```bash
npm run verify:anti-abandon
```

## Suite possible

- Retarget Meta audience `form_abandon_14d` (voir `ads/retargeting-assets.md`)  
- SMS rappel si draft `quote-intelligence` a capture le tel  
