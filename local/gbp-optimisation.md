## Google Business Profile - Setup et optimisation

## 1) Informations profil
- **Categorie principale**: Courtier d'assurances
- **Categories secondaires**:
  - Assurance automobile (segment VTC)
  - Assurance sante
  - Courtier en prets immobiliers
- **Description type (750 caracteres max)**:
  - "Nous accompagnons les particuliers et professionnels sur 3 besoins prioritaires: assurance VTC, assurance sante et credit/immo. Notre equipe vous repond rapidement avec des solutions claires, adaptees a votre profil et a votre budget. Devis, comparaison et accompagnement de dossier avec un conseiller dedie."
- **Zones desservies**:
  - Paris, Lyon, Marseille (et extension selon capacite)
- **Services a ajouter dans GBP**:
  - Devis assurance VTC
  - Comparatif assurance sante
  - Simulation credit immo

## 2) Process avis clients
- **Quand demander l'avis**: apres contact qualifie ou signature.
- **Canaux officiels** (priorite) :
  1. **Trustpilot** — CRM → *Avis officiels* (`/crm-reviews-official.html`) : Business Unit ID + lien profil + templates SMS/e-mail (`{{trustpilot}}`, `{{google}}`).
  2. **Google Business Profile** — lien avis dans le meme ecran CRM (`GOOGLE_REVIEW_URL` / champ Google).
- **Script SMS/email** : generer depuis le CRM (boutons Copier SMS / Copier e-mail), ou :
  - "Merci pour votre confiance. Votre avis nous aide beaucoup. Pouvez-vous partager votre retour ici: [lien Trustpilot ou GBP]"
- **Regle de reponse**:
  - repondre a 100% des avis sous 48h
  - personnaliser avec service mentionne (VTC/Sante/Credit)
- **Site public** : bloc `#avis-officiels` (TrustBox) — les notes / AggregateRating SEO ne s'affichent que si cochees **verifiees** dans le JSON (`data/reviews-official.json`).

## 3) Plan posts GBP (4 semaines)
- Semaine 1: cas client VTC + conseil devis rapide.
- Semaine 2: post pedagogique remboursements sante.
- Semaine 3: checklist dossier credit immo.
- Semaine 4: preuve sociale + rappel delai de reponse.

## 4) Cohérence locale (NAP)
- Garder la meme orthographe Nom/Adresse/Telephone sur:
  - site
  - GBP
  - annuaires/citations
- Ajouter un bloc NAP sur les pages locales pour coherence SEO.
