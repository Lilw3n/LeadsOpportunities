/**
 * 2e vague d'alimentation Académie (volume formation).
 * node scripts/expand-academie-hours-2.cjs && npm run academie:build
 */
const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "data/academie-curriculum.json");
const data = JSON.parse(fs.readFileSync(file, "utf8"));

const L = (slug, title, duration, summary, sections, cta) => ({
  slug, title, duration, summary, sections, cta,
});
const S = (h, p) => ({ h, p });

const PACK = {
  assurance: [
    L("responsabilite-civile-vie-privee", "RC vie privée et chef de famille", "30 min", "Périmètre, plafonds, défense pénale, assistance.", [
      S("Qui est couvert", "Assuré, conjoint, enfants : vérifier la définition du foyer."),
      S("Exclusions classiques", "Faute intentionnelle, activités pro non déclarées, sports à risque."),
      S("Lien habitation", "Souvent incluse en MRH : éviter les doublons inutiles."),
    ], { href: "/assurance-habitation/", label: "Habitation" }),
    L("protection-juridique", "Protection juridique", "25 min", "Domaines couverts, plafonds, libre choix de l’avocat.", [
      S("Utilité", "Litiges conso, voisinage, travail — selon formules."),
      S("Plafonds et franchises", "Lire les montants et délais de carence."),
      S("Conseil", "Ne pas vendre PJ comme produit miracle : cadrer les attentes."),
    ], { href: "/landings/devis.html", label: "Devis" }),
    L("assurance-scolaire", "Assurance scolaire et extrascolaire", "25 min", "Responsabilité, accidents corporels, voyages.", [
      S("Obligations", "Souvent exigée par l’établissement pour sorties."),
      S("Garanties utiles", "RC, corporels, rapatriement selon activités."),
      S("Foyer", "Vérifier si déjà couvert via MRH / mutuelle."),
    ], { href: "/landings/sante.html", label: "Mutuelle / foyer" }),
    L("dependance-aide", "Dépendance et aide à domicile", "35 min", "Niveaux GIR, rentes, délais, exclusions.", [
      S("Besoin réel", "Anticipation vs urgence familiale."),
      S("Lecture contrat", "Définition de la dépendance, barèmes, franchises."),
      S("Articulation", "APA, mutuelle, prévoyance : éviter les trous."),
    ], { href: "/assurance-prevoyance/", label: "Prévoyance" }),
    L("obsèques", "Assurance obsèques", "25 min", "Capital vs prestations, bénéficiaires, inflation.", [
      S("Deux logiques", "Capital libre vs contrat de prestations."),
      S("Pièges", "Frais non couverts, revalorisation insuffisante."),
      S("Conseil", "Comparer avec l’épargne déjà disponible."),
    ], { href: "/landings/devis.html", label: "Étude" }),
    L("animaux-approfondi", "Assurance animaux approfondie", "35 min", "Chirurgies, plafonds, carences, races exclues.", [
      S("Recueil", "Espèce, race, âge, antécédents, budget."),
      S("Tableau", "Plafond annuel, % remboursement, franchise."),
      S("Exclusions", "Maladies préexistantes, actes de confort."),
    ], { href: "/assurance-animaux/", label: "Animaux" }),
    L("bateau-loisirs", "Assurance bateau / loisirs nautiques", "30 min", "RC, corps, assistance, zones de navigation.", [
      S("Usage", "Plaisance, location, compétition."),
      S("Garanties", "Corps du navire, RC, vol, assistance."),
      S("Déclaration", "Longueur, moteur, lieu d’hivernage."),
    ], { href: "/assurances-niches.html", label: "Niches" }),
    L("atelier-ipid-compare", "Atelier : comparer 2 IPID", "40 min", "Exercice pratique ligne à ligne.", [
      S("Méthode", "Garanties, exclusions, obligations, zones géo."),
      S("Écarts matériels", "Ce qui change un sinistre type."),
      S("Restitution client", "1 page claire + recommandation."),
    ], { href: "/academie/assurance/ipid-dic.html", label: "IPID" }),
    L("cas-sinistre-habitation", "Cas : sinistre dégât des eaux", "40 min", "Déclaration, conventions, expertise, recours.", [
      S("Premiers gestes", "Sécurité, photos, déclaration dans les délais."),
      S("Interlocuteurs", "Assureurs, expert, syndic éventuel."),
      S("Rôle courtier", "Suivi, pièces, contestation motivée."),
    ], { href: "/academie/assurance/sinistre-reclamations.html", label: "Sinistres" }),
    L("cas-resiliation-infra-annuelle", "Cas : résiliation infra-annuelle", "30 min", "Hamon, Chatel, Lemoine — choisir le bon levier.", [
      S("Textes", "Selon produit (auto, affinitaire, emprunteur…)."),
      S("Process", "Préavis, lettre, attestation de remplacement."),
      S("Erreur fatale", "Résilier sans couverture de suite."),
    ], { href: "/methode.html", label: "Méthode" }),
    L("wholesale-vs-retail", "Wholesale / délégation : qui fait quoi", "30 min", "Courtier grossiste, compagnie, gestion déléguée.", [
      S("Chaîne", "Client → courtier → partenaire → compagnie."),
      S("SLA", "Délais devis et sinistre à connaître."),
      S("Responsabilité", "Le devoir de conseil reste local."),
    ], { href: "/academie/assurance/relation-compagnies.html", label: "Compagnies" }),
    L("tarification-signaux", "Signaux de tarification et sélection", "35 min", "Ce qui fait monter/baisser une prime.", [
      S("Risque objet", "Valeur, zone, usage, sinistralité."),
      S("Risque personne", "Âge, métier, antécédents."),
      S("Négociation", "Quand demander une dérogation — avec dossier."),
    ], { href: "/academie/assurance/lire-un-devis.html", label: "Devis" }),
  ],
  pret: [
    L("amortissement-table", "Lire un tableau d’amortissement", "30 min", "Capital, intérêts, assurance, IRA.", [
      S("Structure", "Échéance = intérêts + capital (+ assurance)."),
      S("Début vs fin", "Pourquoi les premières années sont « chères » en intérêts."),
      S("Simulation", "Comparer deux durées sur le coût total."),
    ], { href: "/credit-immo/simulation/", label: "Simulation" }),
    L("taux-usure", "Taux d’usure et TAEG", "30 min", "Plafonds, composition du TAEG, impact assurance.", [
      S("TAEG", "Ce qu’il inclut réellement."),
      S("Usure", "Quand un dossier passe au-dessus — leviers (durée, assurance, montant)."),
      S("Discours client", "Expliquer sans alarmisme."),
    ], { href: "/academie/pret/anatomy-offre-pret.html", label: "Offre de prêt" }),
    L("pret-vert-dpe", "Prêts « verts » et DPE", "30 min", "Conditions bancaires liées à la performance énergétique.", [
      S("Offres marché", "Bonus taux / conditions selon DPE ou travaux."),
      S("Preuves", "Diagnostics, devis, factures."),
      S("Montage", "Intégrer travaux dans le plan de financement."),
    ], { href: "/academie/immobilier/dpe-passoire.html", label: "DPE" }),
    L("sci-financement-avance", "SCI : financement avancé", "40 min", "IS/IR, caution associés, banques spécialisées.", [
      S("Fiscalité de base", "Impact sur le cash-flow et la banque."),
      S("Garanties", "Caution des associés, nantissement de parts."),
      S("Pièces", "Statuts, comptes, PV, organigramme."),
    ], { href: "/academie/immobilier/sci-investissement.html", label: "SCI" }),
    L("hebergement-famille", "Hébergement à titre gratuit et apport", "25 min", "Justificatifs, reste à vivre, crédibilité dossier.", [
      S("Attestation", "Contenu minimal attendu."),
      S("Cohérence", "Loyer théorique vs charges réelles."),
      S("Risque", "Dossier fragile si non documenté."),
    ], { href: "/academie/pret/apport.html", label: "Apport" }),
    L("donation-apport", "Donation et apport : sécuriser", "30 min", "Acte, délais, banque, notaire.", [
      S("Forme", "Don manuel vs acte notarié."),
      S("Traçabilité", "Origine des fonds, dates."),
      S("Calendrier", "Ne pas signer compromis trop tôt."),
    ], { href: "/academie/pret/apport.html", label: "Apport" }),
    L("pret-taux-mixte", "Taux mixte et phases", "30 min", "Période fixe puis variable / options.", [
      S("Mécanique", "Durées de phase, indices, caps."),
      S("Pour qui", "Profils patrimoine / horizon court."),
      S("Stress", "Scénarios de hausse à présenter."),
    ], { href: "/academie/pret/taux-duree-ira.html", label: "Taux & durée" }),
    L("modularite-report", "Modularité, report, pause d’échéances", "30 min", "Options contractuelles et coûts cachés.", [
      S("Modularité", "Hausse/baisse d’échéance : limites."),
      S("Report", "Différé partiel/total : impact durée et coût."),
      S("Conseil", "Lire l’offre avant de promettre la flexibilité."),
    ], { href: "/academie/pret/anatomy-offre-pret.html", label: "Offre" }),
    L("cas-investissement-lmnp", "Cas : financement LMNP", "40 min", "Loyers, meublé, banques, fiscalité de base.", [
      S("Brief", "Type de bien, ville, loyer net, charges."),
      S("Banque", "Quotité de loyer retenue, apport exigé."),
      S("Risques", "Vacance, réglementations location courte."),
    ], { href: "/landings/credit-immo.html", label: "Étude" }),
    L("cas-renego-concurrentielle", "Cas : renégo sous pression concurrente", "35 min", "Offre externe, conservation banque, timing.", [
      S("Chiffrage", "Break-even frais/IRA."),
      S("Négociation", "Que demander à la banque actuelle."),
      S("Assurance", "Revoir la délégation en même temps."),
    ], { href: "/renegociation-pret/", label: "Renégociation" }),
    L("atelier-plan-financement", "Atelier : plan de financement Excel mental", "45 min", "Construire le tableau emploi/ressources en live.", [
      S("Emplois", "Prix, frais, travaux, garantie."),
      S("Ressources", "Apport, PTZ, prêt principal, prêt complémentaire."),
      S("Équilibre", "Écarts et leviers d’ajustement."),
    ], { href: "/academie/pret/capacite-emprunt.html", label: "Capacité" }),
    L("veille-taux-method", "Veille taux : méthode cabinet", "25 min", "Sources, fréquence, discours client.", [
      S("Sources", "Partenaires, barèmes, pubs (avec filtre)."),
      S("Cadence", "Revue hebdo interne."),
      S("Client", "Ne jamais promettre un taux non confirmé."),
    ], { href: "/credit-immo/", label: "Hub crédit" }),
  ],
  immobilier: [
    L("photos-annonce", "Photos et annonce : qualité pro", "25 min", "Ce qui fait vendre / ce qui fait fuir.", [
      S("Standards", "Luminosité, pièces clés, extérieur."),
      S("Texte", "Faits, charges, DPE, sans survente."),
      S("Conformité", "Pas de discrimination dans la rédaction."),
    ], { href: "/immobilier/", label: "Hub immo" }),
    L("home-staging-bases", "Home staging : bases", "25 min", "Quand ça vaut le coût, discours vendeur.", [
      S("Objectifs", "Réduire délai / sécuriser prix."),
      S("Budget", "Gestes simples vs prestation."),
      S("Mesure", "Avant/après et feedback visites."),
    ], { href: "/landings/acheteur-immo.html?role=vendeur", label: "Vendeur" }),
    L("charges-copro-audit", "Audit express charges de copro", "35 min", "Lire 3 derniers PV AG.", [
      S("Grille", "Travaux votés, dettes, contentieux."),
      S("Questions syndic", "Fonds travaux, ravalement, toiture."),
      S("Impact offre", "Négociation prix argumentée."),
    ], { href: "/academie/immobilier/copropriete.html", label: "Copro" }),
    L("urbanisme-basics", "Urbanisme pour non-spécialistes", "35 min", "PLU, servitudes, permis, divisions.", [
      S("Docs", "Cadastre, PLU, certificats."),
      S("Alertes", "Servitudes, zones inondables, projets voisins."),
      S("Quand escalader", "Géomètre / avocat / notaire."),
    ], { href: "/immobilier/", label: "Hub" }),
    L("terrain-viabilise", "Terrain viabilisé vs isolé", "30 min", "Viabilisation, taxes, constructibilité.", [
      S("Coûts cachés", "Raccordements, étude de sol."),
      S("Financement", "Banques plus sélectives."),
      S("Calendrier", "Permis et délais."),
    ], { href: "/blog/acheter-terrain-nancy-metropole-54-2026.html", label: "Terrain Nancy" }),
    L("investissement-colocation", "Colocation / multipropriété", "30 min", "Rendement, gestion, risques locatifs.", [
      S("Chiffrage", "Loyers, vacance, usure."),
      S("Bail", "Cadre juridique simplifié à vérifier."),
      S("Banque", "Lecture prudence."),
    ], { href: "/landings/credit-immo.html", label: "Financement" }),
    L("chasse-bien", "Chasse immobilière : process", "30 min", "Mandat recherche, critères, reporting.", [
      S("Brief", "Critères durs / souples."),
      S("Sourcing", "Off-market, réseaux, portails."),
      S("Reporting", "Cadence client."),
    ], { href: "/landings/chasseur-bien.html", label: "Chasseur de bien" }),
    L("estimation-dvf", "Utiliser DVF / comparables ouverts", "35 min", "Méthode et limites des données publiques.", [
      S("Requête", "Périmètre, période, typologie."),
      S("Ajustements", "État, étage, travaux."),
      S("Limites", "Délais de publication, ventes atypiques."),
    ], { href: "/academie/immobilier/estimation-argumentee.html", label: "Estimation" }),
    L("cas-passoire-negociation", "Cas : négocier une passoire F/G", "40 min", "Décote, travaux, financement.", [
      S("Argumentaire", "Coût travaux vs prix affiché."),
      S("Plan", "Audit + devis avant offre ferme."),
      S("Banque", "Intégrer l’enveloppe travaux."),
    ], { href: "/academie/immobilier/passoire-plan-travaux.html", label: "Travaux DPE" }),
    L("cas-indivision-bloquee", "Cas : indivision bloquée", "40 min", "Sorties amiables et judiciaires (vue courtier/négo).", [
      S("Cartographie", "Parts, occupation, dettes."),
      S("Options", "Rachat, vente, licitation."),
      S("Financement", "Soulte et calendrier notaire."),
    ], { href: "/academie/immobilier/succession-indivision.html", label: "Indivision" }),
    L("atelier-pricing", "Atelier : grille de pricing vendeur", "45 min", "3 scénarios prix (ambitieux / marché / rapide).", [
      S("Inputs", "Comparables, délai souhaité, travaux."),
      S("Outputs", "Fourchette + discours."),
      S("Suivi", "Points à 15 jours."),
    ], { href: "/landings/acheteur-immo.html?role=vendeur", label: "Vendeur" }),
    L("ethics-immo", "Éthique immo : pratiques à éviter", "25 min", "Fausses offres, rétention d’info, discrimination.", [
      S("Interdits", "Ce qui expose civilement / pénalement."),
      S("Bonnes pratiques", "Transparence, traces écrites."),
      S("Signalement", "Quand remonter en interne."),
    ], { href: "/academie/conformite/", label: "Conformité" }),
  ],
  banque: [
    L("ouverture-compte-pro", "Ouverture compte pro : dossier", "30 min", "Pièces, bénéficiaires effectifs, activité.", [
      S("KYC pro", "Statuts, Kbis, identité dirigeants."),
      S("Bénéficiaires effectifs", "Transparence obligatoire."),
      S("Refus bancaire", "Motifs fréquents et alternatives."),
    ], { href: "/banque/", label: "Banque" }),
    L("moyens-paiement", "Moyens de paiement et fraudes", "30 min", "CB, virements, procédures de sécurisation.", [
      S("Fraudes types", "Phishing, faux IBAN, fraude au président."),
      S("Process client", "Double validation, callbacks."),
      S("Assurance", "Extensions cyber / fraude."),
    ], { href: "/academie/assurance/cyber-particulier-tpe.html", label: "Cyber" }),
    L("decouvert-negociation", "Négocier un découvert", "25 min", "Autorisation, taux, durée, sorties.", [
      S("Argumentaire", "Flux, saisonnalité, garanties."),
      S("Coût", "Agios vs solution structurée."),
      S("Sortie", "Plan de remboursement."),
    ], { href: "/academie/banque/tresorerie-trc.html", label: "TRC" }),
    L("affacturage-bases", "Affacturage : bases", "30 min", "Cession de créances, coûts, clients adaptés.", [
      S("Mécanique", "Financement du BFR clients."),
      S("Coûts", "Commission + financement."),
      S("Quand", "Croissance rapide / délais clients longs."),
    ], { href: "/academie/banque/tresorerie-entreprise-avance.html", label: "Trésorerie pro" }),
    L("notation-interne", "Notation interne banque", "30 min", "Ce qui influence la note entreprise.", [
      S("Critères", "Rentabilité, dette, comportement, secteur."),
      S("Signaux", "Retards, découverts chroniques."),
      S("Action", "Améliorer le dossier avant demande."),
    ], { href: "/academie/banque/scoring-bancaire.html", label: "Scoring" }),
    L("garantie-bpi", "Garanties publiques / BPI (vue courtier)", "35 min", "Rôle, limites, montage avec banque.", [
      S("Principe", "Partage de risque, pas un prêt isolé."),
      S("Dossier", "Projet, prévisionnel, banque partenaire."),
      S("Discours", "Ne pas promettre l’accord."),
    ], { href: "/academie/finance/pret-pro-garanties.html", label: "Garanties pro" }),
    L("cas-refus-compte", "Cas : refus d’ouverture de compte", "30 min", "Droit au compte, alternatives, posture.", [
      S("Motifs", "KYC, activité, historique."),
      S("Droit au compte", "Cadre et orientation Banque de France."),
      S("Accompagnement", "Dossier propre et réaliste."),
    ], { href: "/academie/banque/kyc-conformite.html", label: "KYC" }),
    L("atelier-note-banque", "Atelier : one-pager banque", "40 min", "Rédiger la page que le chargé d’affaires forward.", [
      S("Structure", "Qui / besoin / chiffres / mitigants."),
      S("Ton", "Factuel, court."),
      S("Review", "Peer review interne."),
    ], { href: "/academie/banque/relation-banque.html", label: "RDV banque" }),
  ],
  finance: [
    L("budget-previsionnel", "Budget prévisionnel foyer / TNS", "35 min", "12 mois glissants, stress test.", [
      S("Méthode", "Revenus, charges fixes, variables, épargne."),
      S("Stress", "-20 % revenus / +2 % taux."),
      S("Lien crédit", "Ce que ça change au montage."),
    ], { href: "/academie/finance/cashflow-personnel.html", label: "Cash-flow" }),
    L("rachat-hypothecaire", "RAC hypothécaire : points d’attention", "35 min", "Expertise, quotité, frais, délais notaire.", [
      S("Bien", "Valeur, liquidité, rang."),
      S("Coûts", "Notaire, garantie, IRA éventuels."),
      S("Client", "Transparence coût total vs mensualité."),
    ], { href: "/landings/rachat.html", label: "RAC" }),
    L("credit-travaux", "Crédit travaux : options", "30 min", "Conso affecté, prêt immo travaux, éco-prêts.", [
      S("Choix outil", "Selon montant et garantie."),
      S("Pièces", "Devis, TT, factures."),
      S("Contrôle déblocage", "Par étapes."),
    ], { href: "/landings/conso.html", label: "Conso / travaux" }),
    L("pret-personnel-vs-revolving", "Prêt perso vs revolving", "25 min", "Coûts, risques, quand refuser le revolving.", [
      S("Comparatif", "TAEG, durée, rigidité."),
      S("Dangers revolving", "Dettes persistantes."),
      S("Conseil", "Orienter vers amortissable ou RAC."),
    ], { href: "/academie/finance/conso-responsable.html", label: "Conso responsable" }),
    L("caution-personnelle", "Caution personnelle du dirigeant", "30 min", "Étendue, durée, risques patrimoniaux.", [
      S("Explication", "Ce que signe le dirigeant."),
      S("Négociation", "Plafonds, durée, solidité."),
      S("Éthique", "Consentement éclairé obligatoire."),
    ], { href: "/academie/finance/pret-pro-garanties.html", label: "Garanties" }),
    L("cession-fonds-financement", "Financer une cession / acquisition de fonds", "40 min", "Earn-out, stock, garantie d’actif.", [
      S("Brief", "Prix, stock, clients clés."),
      S("Banque", "Business plan + reprise."),
      S("Risques", "Dépendance dirigeant cédant."),
    ], { href: "/finance/", label: "Finance" }),
    L("cas-multi-credits-conso", "Cas : 6 crédits conso + loyer", "40 min", "Priorisation, RAC, arbitrages.", [
      S("Cartographie", "Taux, durées, IRA."),
      S("Scénarios", "RAC total vs partiel vs pause."),
      S("Décision", "Critères reste à vivre."),
    ], { href: "/landings/rachat.html", label: "RAC" }),
    L("atelier-cout-total", "Atelier : comparer au coût total", "45 min", "Mensualité vs coût vs durée — exercice.", [
      S("Méthode", "Tableau 3 colonnes."),
      S("Pièges", "Allongement « confort » trop cher."),
      S("Restitution", "Recommandation motivée."),
    ], { href: "/academie/finance/ethique-iobsp.html", label: "Éthique" }),
  ],
  conformite: [
    L("devoir-conseil-preuves", "Preuves du devoir de conseil", "30 min", "Emails, CRM, enregistrements, comptes-rendus.", [
      S("Standards mini", "Date, besoins, produit, motivation."),
      S("Supports", "CRM, mail, formulaire signé."),
      S("Exercice", "Compléter 5 dossiers incomplets."),
    ], { href: "/academie/assurance/devoir-de-conseil.html", label: "Devoir de conseil" }),
    L("orias-rc-pro", "RC professionnelle de l’intermédiaire", "30 min", "Obligations, sinistres types, plafonds.", [
      S("Pourquoi", "Erreur de conseil, omission, retard."),
      S("Police", "Vérifier garanties et franchises cabinet."),
      S("Déclaration", "Quand déclarer un sinistre RC pro."),
    ], { href: "/agence-varangeville/", label: "Cabinet" }),
    L("parrainage-apporteurs", "Apporteurs d’affaires : cadre", "30 min", "Conventions, rémunération, conformité.", [
      S("Qui peut apporter", "Limites réglementaires selon acte."),
      S("Convention", "Objet, rémunération, RGPD."),
      S("Traçabilité", "Lead source dans le CRM."),
    ], { href: "/landings/apporteur-affaires.html", label: "Apporteurs" }),
    L("archivage-numerique", "Archivage numérique sécurisé", "25 min", "Nommage, accès, sauvegarde, purge.", [
      S("Arborescence", "Client / produit / année."),
      S("Accès", "Besoin d’en connaître."),
      S("Purge", "Alignée RGPD."),
    ], { href: "/academie/conformite/rgpd-durees.html", label: "Durées RGPD" }),
    L("crise-reputation", "Gestion d’une crise réputation", "30 min", "Avis négatif, litige public, réseaux.", [
      S("Posture", "Faits, respect, pas d’escalade."),
      S("Interne", "Qui répond, délais."),
      S("Juridique", "Quand escalader."),
    ], { href: "/academie/conformite/registre-reclamations.html", label: "Réclamations" }),
    L("remote-conseil", "Conseil à distance : bonnes pratiques", "30 min", "Visio, identité, recueil, signature.", [
      S("Identification", "Vérifier le client."),
      S("Support", "Partage écran documents, enregistrement si cadre OK."),
      S("Signature", "Electronique et preuves."),
    ], { href: "/methode.html", label: "Méthode" }),
    L("cas-conflit-commission", "Cas : conflit commission vs client", "40 min", "Arbitrage documenté.", [
      S("Situation", "Produit A plus commissionné, B plus adapté."),
      S("Décision", "Choisir B et tracer."),
      S("Management", "Indicateurs cabinet hors seule prime."),
    ], { href: "/academie/conformite/conflits-interets.html", label: "Conflits" }),
    L("atelier-politique-interne", "Atelier : mini politique interne conformité", "45 min", "Rédiger 1 page process cabinet.", [
      S("Rubriques", "Conseil, réclamations, RGPD, pub."),
      S("Rôles", "Qui fait quoi."),
      S("Revue", "Semestrielle."),
    ], { href: "/academie/conformite/piste-audit.html", label: "Audit" }),
  ],
};

const HOURS = {
  assurance: "28 h",
  pret: "26 h",
  immobilier: "24 h",
  banque: "18 h",
  finance: "20 h",
  conformite: "16 h",
};

data.updated = new Date().toISOString().slice(0, 10);
data.hub.title = "Académie pro | Formation longue courtier & IOBSP (130 h+)";
data.hub.description =
  "Formation longue ORIAS / IOBSP / banque : plus de 130 heures de cours (assurance, prêt, immobilier, finance, conformité). Cas pratiques et ateliers.";
data.hub.h1 = "Académie pro : formation longue, volume cabinet";
data.hub.lead =
  "130 h+ de cours (leçons 25–45 min, ateliers, cas). Destiné aux parcours type formation courtier / IOBSP / relation banque — enrichi en continu.";

let added = 0;
for (const course of data.courses) {
  const pack = PACK[course.id] || [];
  const have = new Set(course.lessons.map((l) => l.slug));
  for (const lesson of pack) {
    if (!have.has(lesson.slug)) {
      course.lessons.push(lesson);
      added++;
    }
  }
  if (HOURS[course.id]) course.duration = HOURS[course.id];
}

fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
const total = data.courses.reduce((n, c) => n + c.lessons.length, 0);
console.log("added", added, "total lessons", total);
data.courses.forEach((c) => console.log(c.id, c.duration, c.lessons.length));
