## Architecture SEO orientee conversion

Objectif: transformer le trafic organique en leads qualifies via un funnel `article -> page service -> landing`.

## 1) Silos par verticale

### VTC (priorite 1)
- **Page pilier**: `/assurance-vtc/`
- **Pages transactionnelles**:
  - `/assurance-vtc/devis-rapide/`
  - `/assurance-vtc/tarif/`
  - `/assurance-vtc/jeune-chauffeur/`
- **Pages informationnelles**:
  - `/assurance-vtc/garanties-obligatoires/`
  - `/assurance-vtc/franchise-comment-ca-marche/`
- **Pages locales**:
  - `/assurance-vtc/paris/`
  - `/assurance-vtc/lyon/`
  - `/assurance-vtc/marseille/`

### Sante (priorite 2)
- **Page pilier**: `/assurance-sante/`
- **Pages transactionnelles**:
  - `/assurance-sante/comparatif/`
  - `/assurance-sante/devis/`
  - `/assurance-sante/petit-budget/`
- **Pages informationnelles**:
  - `/assurance-sante/remboursement-optique/`
  - `/assurance-sante/remboursement-dentaire/`
- **Pages locales**:
  - `/assurance-sante/paris/`
  - `/assurance-sante/lyon/`
  - `/assurance-sante/marseille/`

### Credit/Immo (priorite 3)
- **Page pilier**: `/credit-immo/`
- **Pages transactionnelles**:
  - `/credit-immo/simulation/`
  - `/credit-immo/courtier/`
  - `/credit-immo/rachat-credit/`
- **Pages informationnelles**:
  - `/credit-immo/taux-pret/`
  - `/credit-immo/frais-de-dossier/`
- **Pages locales**:
  - `/credit-immo/paris/`
  - `/credit-immo/lyon/`
  - `/credit-immo/marseille/`

## 2) Templates de pages
- **Page pilier**
  - cible une intention principale forte
  - contient liens vers transactionnel + local
  - CTA sticky vers landing verticale
- **Page longue traine**
  - repond a 1 besoin precis (mot-cle principal + variantes)
  - 1 bloc preuve + 1 bloc objection + 1 CTA
- **Page locale**
  - coherence NAP/zone avec Google Business Profile
  - ajout elements de contexte local (delai, disponibilite)

## 3) Maillage interne (regles)
- Chaque article info pousse minimum:
  - 1 lien vers page service transactionnelle
  - 1 lien vers landing verticale
- Chaque page service renvoie:
  - vers 1 page locale
  - vers 1 article de reassurance
  - vers la landing verticale (CTA haut + bas de page)
- Ancre recommandee:
  - "obtenir un devis"
  - "comparer les offres"
  - "simulation rapide"

## 4) Plan de contenu minimum (30 jours)
- VTC: 3 contenus (1 pilier + 2 longue traine)
- Sante: 3 contenus (1 pilier + 2 longue traine)
- Credit/Immo: 3 contenus (1 pilier + 2 longue traine)

## 4bis) Cadence lead-gen recurrente
- Source: `scripts/blog-leadgen-calendar.cjs`
- Rythme cible: 1 article par semaine, publie par date `publishDate`
- Verticales alternees: sante, animaux, VTC, habitation, credit, RC Pro, prevoyance
- Chaque article contient:
  - 1 intention longue traine orientee probleme concret
  - 1 bloc `bridge` vers le questionnaire
  - 2 a 4 liens internes vers page pilier, landing ou article de reassurance
- Publication: workflow `.github/workflows/blog-leadgen.yml` + commande `npm run blog:publish-scheduled`

## 5) Meta/Schema de base
- Title oriente intention + benefice.
- Meta description avec promesse + action.
- FAQ schema sur pages service et pages longues traines.

## 6) Alignement catalogue courtier (APRIL ON)
- **Sante** : angles Marketplace (12+ formules), postes hospitalisation/dentaire/optique, migration adherent.
- **VTC** : angle acquisition VTC, produit courtier Auto Pro (usage professionnel).
- **Credit/Immo** : credit via La Centrale de Financement + 6 formules assurance emprunteur (Reprise incluse).
- Reference detaillee : `offres/april-on-inventaire.md`
- Landings production : `/landings/sante.html`, `/landings/vtc.html`, `/landings/credit-immo.html`
