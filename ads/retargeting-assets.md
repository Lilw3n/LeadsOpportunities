## Retargeting preconfigure (sans diffusion immediate)

## 1) Audiences a creer
- `all_lp_visitors_30d`: visiteurs de landing pages 30 jours.
- `no_lead_30d`: visiteurs LP sans `form_submit`.
- `form_abandon_14d`: `form_start` sans `form_submit`.
- `high_engagement_30d`: visiteurs pages service > 60 secondes.

## 2) Messages par niveau de maturite

### Audience: no_lead_30d
- Message 1 (preuve): "Des solutions claires deja choisies par des clients comme vous."
- Message 2 (friction): "Devis rapide en quelques etapes, sans engagement."

### Audience: form_abandon_14d
- Message 1 (rappel): "Votre demande est presque finalisee."
- Message 2 (urgence douce): "Un conseiller peut vous rappeler rapidement aujourd'hui."

### Audience: high_engagement_30d
- Message 1 (accompagnement): "Passez de l'information a l'action avec un expert dedie."
- Message 2 (benefice): "Comparez simplement et choisissez plus sereinement."

## 3) Formats creatifs
- 3 visuels statiques par verticale:
  - format carre 1080x1080
  - format story 1080x1920
  - format paysage 1200x628
- 1 script video court (15-20 sec) par verticale:
  - probleme
  - solution claire
  - CTA

## 4) Frequence et exclusions (preconisations)
- Cap de frequence: 2-3 impressions/jour/utilisateur.
- Exclure les convertis (`form_submit`) pour eviter la surpression.
- Exclure audiences non pertinentes (trafic hors geographie cible).
