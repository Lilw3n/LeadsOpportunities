## Lead scoring simple (operationnel)

## Regle de score (100 points)
- **Profil cible** (max 30)
  - correspondance verticale/besoin: +20
  - zone geographique couverte: +10
- **Intention** (max 30)
  - formulaire complete: +20
  - demande de rappel immediat: +10
- **Qualite contact** (max 20)
  - numero valide: +10
  - disponibilite annoncee: +10
- **Urgence projet** (max 20)
  - projet < 30 jours: +20
  - projet 30-90 jours: +10

## Classes
- `Chaud`: 70-100
- `Tiede`: 40-69
- `Froid`: 0-39

## SLA recommande
- Chaud: rappel < 15 min
- Tiede: rappel < 2 h
- Froid: sequence nurture email/SMS
