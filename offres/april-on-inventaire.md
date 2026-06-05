# Inventaire APRIL ON — reference courtier

Source : exploration extranet [april-on.fr](https://www.april-on.fr/home) (juin 2026).
Usage : alimenter landings, scripts commerciaux et contenus SEO/SEA.

---

## Navigation extranet

| Rubrique | Contenu cle |
|---|---|
| **Offres** | Mega-menu par cible (particuliers / professionnels / collectif) et par famille de produits |
| **Devis & Contrats** | Infos cles, devis, adhesions, contrats, actes de gestion, centre de relance |
| **Mon activite** | Suivi production et portefeuille |
| **Acces gestion** | Operations de gestion client |
| **Formations** | Parcours DDA et montee en competence |
| **Se developper** | Campagnes, kit com, API, tarificateurs encapsules, boutique, fiches conseil |
| **Actus** | Nouveautes produits et operations commerciales |
| **Contacts** | Support et interlocuteurs |

---

## Outils transverses

- **Marketplace** : comparateur multi-offres (Sante, Emprunteur)
- **Centre de relance** : dossiers en attente de suivi
- **QR Code courtier** : simulateur economies assurance emprunteur pour prospects
- **NOA** : assistant conversationnel conseil
- **Espace Assure** : suivi sinistres, integration Doctolib (prise de RDV)

---

## 1. Sante — particulier

### Acces devis
- Menu **Offres > La sante-preoyance > Sante**
- CTA : **Faire un devis** ou devis par produit
- URL parcours : `/market-place/health/client-needs`

### Produits identifies (gamme particulier)

| Produit | Particularite |
|---|---|
| APRIL Sante Optimale | Promo € gagnants |
| APRIL Simply Sante | Entree de gamme |
| APRIL Flexi Sante | Modularite |
| APRIL Vita Sante | Promo € gagnants |
| APRIL Only Sante \| Smart | Non responsable |
| APRIL Sante Peps | — |
| APRIL Sante Mix Proximite \| Smart | Reseau de soins |
| APRIL Sante Serenite \| Smart | Promo € gagnants |
| APRIL Sante Zen \| Smart | — |
| Protection Sante MALAKOFF HUMANIS \| Smart | Promo € gagnants |
| APRIL Tranquillite Sante \| Smart | — |
| Complementaire Senior GAN | Seniors, promo € gagnants |

### Parcours devis (3 etapes)
1. **Infos projet** — date d'effet, adherent existant, assures, nature du projet
2. **Liste des offres** — comparaison marketplace
3. **Envoi des offres** — transmission au prospect

### Criteres de tarification affiches
- **Assures** : civilite, date de naissance, code postal, regime obligatoire, statut
- **Garanties** : hospitalisation, soins courants, dentaire, optique (niveaux % BR ou €)
- **Renforts** : protheses auditives, medecines naturelles
- **Filtre** : contrats responsables uniquement
- **Options** : deductibilite loi Madelin (panier)

### Operations commerciales (actu)
- **€ gagnants** : du 20 mai au 15 juillet 2026 sur Sante du Particulier
- **Sante Metallurgie** : offre sectorielle
- **APRIL x Doctolib** : parcours de soins simplifie via Espace Assure

---

## 2. Auto / VTC

### Acces devis
- Menu **Offres > Le dommage > Auto**
- Produits : Auto Aggrave, Auto Standard, **Auto Pro**, Auto Collection Prestige, Auto Collection
- Tarificateur unique (hors Auto Sans Permis)
- URL parcours : `auto.april-on.fr`

### Produits Auto

| Produit | Usage |
|---|---|
| Auto Aggrave | Profils risque eleve |
| Auto Standard | Particulier classique |
| **Auto Pro** | Usage professionnel (VTC a positionner ici) |
| Auto Collection Prestige | Vehicules de collection haut de gamme |
| Auto Collection | Vehicules de collection |

### Parcours devis Auto Pro
- **Devis Express** : pour courtiers habitues
- **Devis Pas a Pas** : guide etape par etape
- Etapes : client → vehicule → usage → garanties → tarif

### Point d'attention VTC
- **Aucun libelle « VTC »** dans l'extranet
- Le segment chauffeur pro passe par **Auto Pro**
- Cote acquisition : conserver le vocabulaire VTC/chauffeur sur les landings

---

## 3. Credit / Immo — assurance emprunteur + partenaire credit

### Acces devis
- Menu **Offres > L'emprunteur > Assurance de pret**
- Partenariat **La Centrale de Financement** pour le credit immobilier
- CTA : **Faire un devis** via Marketplace Emprunteur

### Produits assurance de pret

| Produit | Positionnement |
|---|---|
| APRIL Assurance de Pret Equilibre | Equilibre garanties / prix |
| APRIL Assurance de Pret Essentiel | Entree de gamme |
| APRIL Assurance de Pret Integrale | Couverture large |
| APRIL Assurance de Pret Optimum + | Haut de gamme |
| APRIL Assurance de Pret Horizon | — |
| APRIL Reprise | Reprise de contrat existant |

### Outils prospect
- **Simulateur d'economies** assurance emprunteur
- Accessible via **QR Code personnel** du courtier
- **Marketplace Emprunteur** : comparaison multi-offres

---

## 4. Mapping production Leads Opportunities

| Fichier | Alignement |
|---|---|
| `landings/sante.html` | Marketplace Sante, 12+ formules, criteres par poste |
| `landings/vtc.html` | Auto Pro, devis express/pas a pas |
| `landings/credit-immo.html` | Assurance emprunteur + La Centrale de Financement |
| `offres/offres-prioritaires.md` | Promesses, objections, preuves |
| `ads/google-ads-editor-ready-utm.csv` | URLs production + angles APRIL |
