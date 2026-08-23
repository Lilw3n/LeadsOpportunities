/**
 * Enrichit massivement le volume horaire de l'Académie (formation longue).
 * Usage: node scripts/expand-academie-hours.cjs && npm run academie:build
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const file = path.join(ROOT, "data/academie-curriculum.json");
const data = JSON.parse(fs.readFileSync(file, "utf8"));

function L(slug, title, duration, summary, sections, cta) {
  return { slug, title, duration, summary, sections, cta };
}
function S(h, p) {
  return { h, p };
}

const BANK = {
  assurance: [
    L("bases-contrat-assurance", "Bases du contrat d’assurance", "30 min", "Formation, objet, garanties, exclusions, nullité.", [
      S("Éléments constitutifs", "Un contrat d’assurance repose sur un risque, une prime, une garantie et un sinistre. Sans risque assurable ou avec fausse déclaration, le contrat peut être remis en cause."),
      S("Obligations des parties", "L’assureur couvre selon les termes ; l’assuré déclare exactement et paie la prime. Le courtier s’assure que ces obligations sont comprises avant signature."),
      S("Preuve et documents", "Conditions générales, particulières, IPID, avenants : conservez la version remise au client et la date de remise."),
    ], { href: "/methode.html", label: "Méthode cabinet" }),
    L("ipid-dic", "IPID et documents d’information", "25 min", "Contenu IPID, remise, preuve, produits concernés.", [
      S("À quoi sert l’IPID", "Document normalisé pour comparer les produits non-vie. Il ne remplace pas le conseil, il le structure."),
      S("Remise et traçabilité", "Quand, comment, preuve de remise. En litige, l’absence de preuve pèse contre le distributeur."),
      S("Limites", "L’IPID résume : les exclusions fines restent dans les CG. Signalez-le explicitement au client."),
    ], { href: "/academie/assurance/devoir-de-conseil.html", label: "Devoir de conseil" }),
    L("gestion-portefeuille", "Gestion de portefeuille et avenants", "30 min", "Échéances, révisions, changements de situation.", [
      S("Vie du contrat", "Mariage, déménagement, changement de véhicule, nouvel associé : chaque événement peut exiger un avenant."),
      S("Revue annuelle", "Calendrier d’appels d’échéance, comparatif à garanties équivalentes, détection de sous-assurance."),
      S("Résiliation et remplacement", "Ne jamais résilier avant attestation de remplacement — risque de rupture de garantie."),
    ], { href: "/landings/rappel.html", label: "Planifier une revue" }),
    L("sous-assurance-surassurance", "Sous-assurance et surassurance", "25 min", "Règle proportionnelle, capital mobilier, reconstruction.", [
      S("Sous-assurance", "Capital déclaré inférieur à la valeur réelle : règle proportionnelle possible. Qualifiez correctement les valeurs."),
      S("Surassurance", "Payer trop pour un capital irréaliste. L’intérêt du client n’est pas la prime la plus haute."),
      S("Méthode de chiffrage", "Inventaire, valeur à neuf vs vétusté, dépendances, objets de valeur à déclarer séparément."),
    ], { href: "/assurance-habitation/", label: "Habitation" }),
    L("catastrophes-naturelles", "Catastrophes naturelles et périls climatiques", "30 min", "Régime cat nat, sécheresse, inondation, franchise légale.", [
      S("Régime français", "Arrêté de catastrophe naturelle, franchise légale, délais de déclaration. Expliquez le process avant le sinistre."),
      S("Exposition géographique", "Zone inondable, argile, littoral : impact tarification et conseil prévention."),
      S("Preuves après sinistre", "Photos datées, factures, expertises : préparer le client à constituer le dossier."),
    ], { href: "/assurance-habitation/", label: "Guide habitation" }),
    L("assurance-construction", "Assurance construction (DO / RC décennale)", "35 min", "Dommages-ouvrage, décennale, acteurs, calendrier chantier.", [
      S("Qui doit s’assurer", "Maître d’ouvrage, constructeurs, artisans : cartographiez les polices avant ouverture de chantier."),
      S("DO et délais", "La DO facilite l’indemnisation rapide ; la décennale couvre la responsabilité sur 10 ans. Ne confondez pas les deux."),
      S("Pièces chantier", "Marchés, PV réception, avenants : un dossier incomplet bloque le sinistre construction."),
    ], { href: "/landings/devis.html", label: "Demander conseil" }),
    L("cyber-particulier-tpe", "Cyber : particuliers et TPE", "25 min", "Fraude, ransomware, extensions, exclusions.", [
      S("Risques fréquents", "Hameçonnage, fraude au président, rançongiciel. Qualifiez le niveau digital du client."),
      S("Lecture de garantie", "Plafonds bas, exclusions négligence, conditions de sauvegarde : lisez avant de vendre « cyber » comme un gadget."),
      S("Prévention", "Le conseil inclut les gestes de base : MFA, sauvegardes, procédures de paiement."),
    ], { href: "/landings/devis.html", label: "Devis" }),
    L("flotte-auto-pro", "Flotte auto et usage professionnel", "30 min", "Parc, conducteurs, bonus flotte, gestion des sinistres.", [
      S("Déclarer le parc", "Nombre de véhicules, usages, conducteurs occasionnels. Un véhicule oublié = trou de garantie."),
      S("Sinistralité flotte", "Fréquence et coût moyen : argumentez prévention et franchises."),
      S("Attestations", "Besoins location longue durée, salariés en déplacement : process de délivrance rapide."),
    ], { href: "/landings/devis.html?need=auto", label: "Devis auto" }),
    L("multirisque-pro", "Multirisque professionnelle", "35 min", "Locaux, contenu, perte d’exploitation, RC.", [
      S("Cartographier l’entreprise", "Activité NAF, locaux, stocks, dépendance fournisseurs, CA."),
      S("Perte d’exploitation", "Période d’indemnisation, marge, délais d’expertise. Souvent sous-calibrée."),
      S("Extensions critiques", "Bris de machine, marchandise transportée, cyber : selon métier."),
    ], { href: "/landings/devis.html", label: "Devis pro" }),
    L("compare-equivalence", "Atelier : construire une équivalence", "40 min", "Méthode ligne à ligne pour mutuelle et emprunteur.", [
      S("Grille type", "Listez postes, plafonds, franchises, carences, exclusions. Remplissez deux colonnes A/B."),
      S("Écarts matériels", "Ne retenez que les écarts qui changent le scénario client (ex. ITT 90 vs 30 jours)."),
      S("Restitution", "1 page client : scénarios, écarts, recommandation motivée, prix en dernier."),
    ], { href: "/academie/assurance/lire-un-devis.html", label: "Analyse de devis" }),
    L("cas-vtc-malusse", "Cas pratique : VTC malussé / résilié", "35 min", "Brief, marchés possibles, discours client.", [
      S("Recueil", "Coefficient, motif de résiliation, sinistres, véhicule, CA courses."),
      S("Stratégie", "Compagnies spécialisées, franchises élevées, usage strictement déclaré."),
      S("Attestation plateforme", "Délais et conformité Uber/Bolt : ne promettez pas une date irréaliste."),
    ], { href: "/landings/vtc.html", label: "Parcours VTC" }),
    L("cas-emprunteur-sante", "Cas pratique : emprunteur avec surprimes", "40 min", "Questionnaire, surprimes, exclusions, alternatives.", [
      S("Cadre médical", "Questionnaire, délais, droit à l’oubli quand applicable. Pas de diagnostic sauvage : orientez vers le process assureur."),
      S("Négociation banque", "Équivalence malgré surprime : documentez et anticipez le refus d’équivalence."),
      S("Plan B", "Quotité, différé, autre délégation, recalibrage du projet immobilier."),
    ], { href: "/landings/credit-immo.html", label: "Dossier emprunteur" }),
    L("relation-compagnies", "Relation compagnies et délégations", "30 min", "Réseaux, délégations de gestion, niveaux de service.", [
      S("Connaître son réseau", "Délais devis, niches acceptées, qualité sinistre. Un cabinet vit sur la fiabilité des partenaires."),
      S("Escalade", "Quand monter un dossier bloqué : interlocuteurs, pièces, délais raisonnables."),
      S("Indépendance du conseil", "La qualité de relation ne doit pas biaiser le choix produit."),
    ], { href: "/methode.html", label: "Méthode" }),
    L("parcours-client-assurance", "Parcours client assurance bout en bout", "35 min", "Lead → conseil → souscription → suivi.", [
      S("Entrée", "Source du lead, urgence, consentement, premier brief 10 minutes."),
      S("Milieu", "Comparatif, restitution, objections, closing éthique."),
      S("Sortie / suivi", "Remise documents, rappel J+30, revue annuelle."),
    ], { href: "/landings/devis.html", label: "Mettre en pratique" }),
    L("atelier-mutuelle-famille", "Atelier : mutuelle famille vs solo", "30 min", "Calibration optique/dentaire/hospi selon foyer.", [
      S("Profilage", "Âges, enfants, soins prévus, budget mensuel max."),
      S("Choix de niveau", "Évitez le « tout haut de gamme » systématique : sur-mesure = devoir de conseil."),
      S("Présentation", "3 options (essentiel / confort / renforcé) avec écarts expliqués."),
    ], { href: "/landings/sante.html", label: "Devis mutuelle" }),
  ],
  pret: [
    L("anatomy-offre-pret", "Anatomie d’une offre de prêt", "35 min", "Clauses, conditions, délais de réflexion, CAD.", [
      S("Mentions clés", "Taux, durée, tableaux, assurance, conditions suspensives internes banque."),
      S("Délai de réflexion", "Respect légal et bonnes pratiques d’explication avant acceptation."),
      S("CAD et déblocage", "Conditions précédant le déblocage des fonds chez le notaire."),
    ], { href: "/credit-immo/", label: "Hub crédit" }),
    L("revenus-pris-en-compte", "Revenus pris en compte par les banques", "30 min", "CDI, variables, indéterminés, fonciers, TNS.", [
      S("Revenus stables", "Salaires, pensions : abattements éventuels sur variables."),
      S("TNS / dirigeants", "Bilans, rémunération, dividendes : ce que chaque banque accepte."),
      S("Revenus locatifs", "Quotité retenue (souvent partielle) et cohérence avec le projet."),
    ], { href: "/academie/pret/capacite-emprunt.html", label: "Capacité" }),
    L("charges-retenues", "Charges retenues et saut de charge", "30 min", "Crédits, pensions, loyer résiduel, reste à vivre.", [
      S("Liste exhaustive", "Partez des relevés : crédits, pensions, loyers, leasing."),
      S("Saut de charge", "Passage loyer → mensualité : argumenter si reste à vivre solide."),
      S("Restitution client", "Montrez l’effort avant/après pour éviter la surprise à l’offre."),
    ], { href: "/academie/pret/cadre-hcsf.html", label: "HCSF" }),
    L("garantie-caution-hypotheque", "Garantie du prêt : caution vs hypothèque", "30 min", "Coûts, délais, mainlevée, critères banque.", [
      S("Caution", "Fonctionnement, coût, délais d’accord."),
      S("Hypothèque", "Frais notariés, rang, mainlevée à la revente."),
      S("Intégration au plan", "Toujours budgéter la garantie dans le besoin de financement."),
    ], { href: "/academie/finance/garanties-financement.html", label: "Garanties finance" }),
    L("ptz-approfondi", "PTZ approfondi : cas et pièges", "35 min", "Zones, plafonds, travaux, quotités.", [
      S("Éligibilité fine", "Composition foyer, revenus N-2, zone, nature du bien."),
      S("Travaux dans l’ancien", "Seuils et justificatifs : anticiper devis."),
      S("Erreurs fréquentes", "Mauvais millésime de revenus, zone mal lue, cumul d’aides mal articulé."),
    ], { href: "/academie/pret/ptz-aides.html", label: "PTZ" }),
    L("investissement-locatif-financement", "Financer un investissement locatif", "40 min", "Effort, fiscalité de base, banques frileuses / ouvertes.", [
      S("Différences vs RP", "Apport, taux, assurance, prise en compte des loyers."),
      S("Stress test", "Vacance, charges de copro, travaux : scénario prudent."),
      S("Présentation banque", "Business plan simple + cohérence patrimoniale."),
    ], { href: "/landings/credit-immo.html", label: "Étude locative" }),
    L("rachat-pret-immo", "Rachat de prêt immobilier", "35 min", "IRA, frais, break-even, dossier concurrent.", [
      S("Calcul de rentabilité", "Économie d’intérêts vs frais : mois de break-even."),
      S("Stratégie concurrentielle", "Offre externe pour négocier avec la banque actuelle."),
      S("Assurance associée", "Profiter du mouvement pour revoir la délégation."),
    ], { href: "/renegociation-pret/", label: "Renégociation" }),
    L("pret-in-fine-relais-avance", "In fine, relais et avances", "35 min", "Mécaniques, risques, clients concernés.", [
      S("In fine", "Intérêts seuls + capital au terme : profil patrimoine."),
      S("Relais", "Pont vente/achat : quotité et plan B."),
      S("Avance / différé", "Usages chantier et VEFA : caler avec le notaire."),
    ], { href: "/landings/pret-relais.html", label: "Prêt relais" }),
    L("vefa-construction", "VEFA et construction : déblocages", "40 min", "Appels de fonds, CAD, assurance DO.", [
      S("Calendrier VEFA", "Pourcentage par étape, pénalités, délais."),
      S("Contrôle des appels", "Vérifier conformité avant déblocage."),
      S("Assurances associées", "DO, RC, emprunteur : timing critique."),
    ], { href: "/landings/credit-immo.html", label: "Dossier VEFA" }),
    L("co-emprunteur-avance", "Co-emprunteurs : montages avancés", "30 min", "Quotités, revenus asymétriques, caution.", [
      S("Asymétrie de revenus", "Comment les banques pondèrent."),
      S("Quotités d’assurance", "100/100 vs 50/50 : impact décès."),
      S("Sortie du prêt", "Désolidarisation : conditions et délais."),
    ], { href: "/academie/pret/co-emprunteur.html", label: "Co-emprunteur" }),
    L("refus-typologies", "Typologies de refus et plans d’action", "40 min", "Matrice motif → corrective → délai.", [
      S("Motifs financiers", "Endettement, apport, RAV."),
      S("Motifs risque", "Santé, métier, bien atypique, fichiers."),
      S("Plan d’action daté", "Ce qu’on corrige en 15 jours vs 3 mois."),
    ], { href: "/academie/pret/pret-refuse.html", label: "Prêt refusé" }),
    L("note-synthese-atelier", "Atelier : rédiger une note de synthèse", "45 min", "Template, ton banque, annexes.", [
      S("Structure type", "Profil / projet / plan / vigilances / banques cibles."),
      S("Style", "Factuel, chiffré, sans lyrisme commercial."),
      S("Annexes", "Pièces indexées, relevés commentés, tableau d’endettement."),
    ], { href: "/academie/pret/note-synthese.html", label: "Note de synthèse" }),
    L("relation-banques-partenaires", "Animer un réseau de banques", "30 min", "Appétences, feedback, priorisation dossiers.", [
      S("Cartographie", "Qui prend quoi (TNS, SCI, primo, locatif)."),
      S("Feedback loop", "Motifs de refus pour améliorer le prochain dossier."),
      S("Éthique", "Ne pas « arrosage » toutes les banques sans stratégie."),
    ], { href: "/academie/banque/", label: "Cours Banque" }),
    L("cas-primo-nancy", "Cas : primo-accédant Grand Nancy", "40 min", "Budget local, PTZ, apport, timeline.", [
      S("Marché local", "Fourchettes Nancy / Jarville / Varangéville : coller au réel."),
      S("Montage", "Apport, PTZ éventuel, assurance, délai compromis."),
      S("Restitution", "Plan de financement + prochaines pièces."),
    ], { href: "/pret-immobilier/nancy/", label: "Prêt Nancy" }),
    L("cas-refus-35", "Cas : refus endettement 35 %", "40 min", "Recalibrage prix / durée / RAC préalable.", [
      S("Diagnostic", "Charges oubliées ? Variables surpondérées ?"),
      S("Options", "Baisser prix, allonger, co-emprunteur, RAC conso d’abord."),
      S("Choix", "Décision client documentée."),
    ], { href: "/blog/pret-refuse-endettement-35-hcsf-solutions.html", label: "Guide 35 %" }),
  ],
  immobilier: [
    L("marche-local-lecture", "Lire un marché local", "30 min", "Prix/m², délais de vente, stocks.", [
      S("Indicateurs", "Annonces, DVF, délais moyens, écarts agence/particulier."),
      S("Conseils acquéreur", "Fourchette d’offre réaliste."),
      S("Conseils vendeur", "Prix de départ vs prix de marché."),
    ], { href: "/recherche-bien/nancy/", label: "Recherche Nancy" }),
    L("estimation-argumentee", "Estimation argumentée", "35 min", "Comparables, ajustements, discours.", [
      S("Méthode comparables", "Surface, état, étage, extérieurs, DPE."),
      S("Ajustements", "Travaux, vue, nuisances."),
      S("Restitution écrite", "1 page chiffrée pour éviter les débats émotionnels."),
    ], { href: "/immobilier/", label: "Hub immo" }),
    L("mandat-types", "Types de mandats et exclusivités", "30 min", "Simple, exclusif, semi-exclusif : implications.", [
      S("Cadre", "Obligations de moyens, publicité du mandat."),
      S("Exclusivité", "Avantages/inconvénients pour vendeur et négo."),
      S("Traçabilité", "Comptes-rendus de visite et relances."),
    ], { href: "/academie/immobilier/mandat-honoraires.html", label: "Mandat & honoraires" }),
    L("visite-qualification", "Visite et qualification acquéreur", "30 min", "Questions, budget réel, financement déjà calé.", [
      S("Avant visite", "Preuve de financement / simulation."),
      S("Pendant", "Grille d’observation (humidité, bruit, charges)."),
      S("Après", "Feedback structuré au vendeur."),
    ], { href: "/landings/acheteur-immo.html", label: "Parcours acquéreur" }),
    L("offre-negociation", "Négociation d’offre", "35 min", "Stratégie, contre-offres, clauses.", [
      S("Ancrage", "Offre sous marché argumentée vs offensive."),
      S("Clauses", "Suspensives, délais, séquestre."),
      S("Éthique", "Pas de fausse offre pour « tester »."),
    ], { href: "/academie/immobilier/offre-achat-compromis.html", label: "Offre & compromis" }),
    L("notaire-sequencement", "Notaire : séquencement du dossier", "30 min", "Pièces, purges, signature, fonds.", [
      S("Rôle du notaire", "Sécurité juridique et déblocage."),
      S("Points de friction", "Urbanisme, hypothèques, indivision."),
      S("Coordination prêt", "CAD et date de signature."),
    ], { href: "/immobilier/", label: "Hub" }),
    L("copropriete", "Copropriété : lire les charges", "30 min", "PV AG, fonds travaux, procédures.", [
      S("Documents clés", "Règlement, AG, appels de fonds, dettes syndic."),
      S("Alertes", "Procédures, ravalement voté, fonds travaux insuffisant."),
      S("Impact prix / prêt", "Charges élevées = effort global."),
    ], { href: "/landings/acheteur-immo.html", label: "Recherche" }),
    L("location-saisonniere-cadre", "Location et saisonnier : cadre", "25 min", "Réglementation, assurance PNO, fiscalité de base.", [
      S("Autorisations", "Commune, copro, changement d’usage."),
      S("Assurances", "PNO, villégiature, RC."),
      S("Financement", "Banques plus sélectives sur saisonnier pur."),
    ], { href: "/assurance-habitation/", label: "Habitation / PNO" }),
    L("viager-bases", "Viager : bases professionnelles", "30 min", "Bouquet, rente, occupation, risques.", [
      S("Mécanique", "Bouquet + rente, droit d’usage."),
      S("Due diligence", "Âge, occupation, charges."),
      S("Financement", "Souvent cash / montage spécifique."),
    ], { href: "/blog/viager-occupe-libre-bouquet-rente-2026.html", label: "Guide viager" }),
    L("succession-indivision", "Succession et indivision", "35 min", "Acte de notoriété, soulte, blocages.", [
      S("Cartographier", "Héritiers, dettes, occupation."),
      S("Sorties", "Licitation, rachat de parts, mandat de vente."),
      S("Financement soulte", "Pièces juridiques + capacité."),
    ], { href: "/academie/immobilier/vendre-3d.html", label: "Ventes 3D" }),
    L("passoire-plan-travaux", "Passoire énergétique : plan travaux", "35 min", "Audit, devis, aides, narration banque.", [
      S("Prioriser", "Gestes à fort impact vs budget."),
      S("Aides", "Cadre évolutif : vérifier éligibilité au cas par cas."),
      S("Intégrer au prêt", "Envelope travaux dans le financement."),
    ], { href: "/academie/immobilier/dpe-passoire.html", label: "DPE" }),
    L("reseau-apporteurs-immo", "Réseau apporteurs immo", "25 min", "Notaires, négo, chasseurs : règles du jeu.", [
      S("Qualité du signalement", "Brief complet vs simple numéro de téléphone."),
      S("Feedback", "Retour systématique pour fidéliser."),
      S("Conformité", "Rémunérations et transparence."),
    ], { href: "/negociateur-immobilier/", label: "Négociateur" }),
    L("cas-vente-divorce", "Cas : vente en divorce", "40 min", "Calendrier judiciaire, prix, relogement.", [
      S("Acteurs", "Avocats, juge, notaire, banque."),
      S("Prix sous contrainte", "Arbitrer vitesse vs optimisation."),
      S("Relogement / rachat", "Soulte et prêt associé."),
    ], { href: "/landings/acheteur-immo.html?role=vendeur", label: "Parcours vendeur" }),
    L("cas-achat-investisseur", "Cas : investisseur 1er locatif", "40 min", "Rendement, vacance, financement.", [
      S("Chiffres", "Rendement brut/net simplifié."),
      S("Risques", "Vacance, travaux, locataire."),
      S("Banque", "Apport et expérience locative."),
    ], { href: "/landings/credit-immo.html", label: "Financement" }),
    L("atelier-brief-acquereur", "Atelier : brief acquéreur en 15 min", "30 min", "Grille de questions et scoring.", [
      S("Questions obligatoires", "Budget, apport, délai, secteur, veto."),
      S("Scoring interne", "Chaud / tiède / non financable."),
      S("Next step", "Simulation prêt ou visites."),
    ], { href: "/landings/acheteur-immo.html", label: "Brief" }),
  ],
  banque: [
    L("bilan-lecture-rapide", "Lecture rapide d’un bilan TNS", "40 min", "SIG, dette, CAF, points d’alerte.", [
      S("Comptes clés", "CA, EBE, résultat, capitaux propres."),
      S("Dette", "DF / CAF, échéancier."),
      S("Questions au dirigeant", "Ce que les chiffres ne disent pas."),
    ], { href: "/academie/finance/credit-pro.html", label: "Crédit pro" }),
    L("lcb-ft-bases", "LCB-FT : bases opérationnelles", "35 min", "Vigilance, gel des avoirs, déclarations.", [
      S("Connaissance client renforcée", "Quand monter d’un cran."),
      S("Opérations atypiques", "Montants, pays, cash."),
      S("Posture cabinet", "Alerte interne, pas d’investigation sauvage."),
    ], { href: "/academie/banque/kyc-conformite.html", label: "KYC" }),
    L("analyse-releves", "Analyser 3 mois de relevés", "35 min", "Méthode de revue compte courant.", [
      S("Grille", "Revenus, dépenses fixes, jeux, découverts, impayés."),
      S("Commenter", "Note factuelle pour la banque."),
      S("Coaching client", "Corriger avant dépôt du dossier."),
    ], { href: "/academie/banque/scoring-bancaire.html", label: "Scoring" }),
    L("packages-bancaires", "Packages et frais bancaires", "25 min", "Comparer autrement que le taux.", [
      S("Coût annuel", "Carte, assurances, commissions."),
      S("Services utiles", "Découvert autorisé, appli, international."),
      S("Négociation", "Que demander en contrepartie d’un prêt."),
    ], { href: "/academie/banque/offre-bancaire.html", label: "Offre bancaire" }),
    L("epargne-logement", "Épargne logement et apports", "30 min", "PEL/CEL, déblocage, stratégie apport.", [
      S("Utilisation", "Droits à prêt, délais."),
      S("Justificatifs", "Attestations à prévoir."),
      S("Arbitrage", "Garder un matelas de précaution."),
    ], { href: "/academie/banque/comptes-epargne.html", label: "Comptes & épargne" }),
    L("tresorerie-entreprise-avance", "Trésorerie entreprise avancée", "40 min", "BFR, financement court terme, covenants.", [
      S("BFR", "Stock, clients, fournisseurs."),
      S("Outils", "Découvert, affacturage, Dailly."),
      S("Alertes", "Covenants et points de rupture."),
    ], { href: "/academie/banque/tresorerie-trc.html", label: "TRC" }),
    L("comite-roleplay", "Atelier : roleplay comité", "45 min", "Pitch 5 minutes + objections.", [
      S("Pitch", "Structure chronométrée."),
      S("Objections", "Endettement, métier, bien."),
      S("Debrief", "Améliorer la note de synthèse."),
    ], { href: "/academie/banque/relation-banque.html", label: "RDV banque" }),
    L("relation-charge-affaires", "Relation durable avec le chargé d’affaires", "25 min", "Rythme, transparence, dossiers prioritaires.", [
      S("Cadence", "Points réguliers, pas seulement en urgence."),
      S("Transparence", "Annoncer les points faibles tôt."),
      S("Priorisation", "Ne pas saturer avec des dossiers non prêts."),
    ], { href: "/banque/", label: "Hub Banque" }),
    L("cas-tns-saisonnalite", "Cas : TNS à revenus saisonniers", "40 min", "Moyennes, provisoire, caution.", [
      S("Lecture revenus", "Moyenne N-1/N-2, à-vals."),
      S("Garanties", "Caution, nantissement."),
      S("Discours", "Expliquer la saisonnalité sans la cacher."),
    ], { href: "/landings/rappel.html", label: "Étude TNS" }),
    L("cas-ficp-sortie", "Cas : sortie de FICP", "35 min", "Plan, délais, alternatives.", [
      S("État des lieux", "Dettes, échéanciers."),
      S("Régularisation", "Preuves à obtenir."),
      S("Après radiation", "Reconstruire le scoring."),
    ], { href: "/academie/banque/fichiers-ficp-fcc.html", label: "FICP/FCC" }),
  ],
  finance: [
    L("rac-pieces-dossier", "RAC : dossier pièces et timeline", "35 min", "Checklist complète et séquence.", [
      S("Pièces", "Identité, revenus, crédits, biens, relevés."),
      S("Timeline", "Compromis éventuel, mainlevées, notariale."),
      S("Points de blocage", "Fichiers, hypothèque de 2e rang, reste à vivre."),
    ], { href: "/landings/rachat.html", label: "Étude RAC" }),
    L("rac-vs-rachat-immo", "RAC vs rachat de prêt immo seul", "30 min", "Choisir le bon outil.", [
      S("Objectifs différents", "Assainir vs baisser le taux."),
      S("Coûts", "Comparatif sur 5/10/15 ans."),
      S("Décision", "Critères client (mensualité vs coût total)."),
    ], { href: "/academie/finance/rachat-credits.html", label: "RAC" }),
    L("conso-responsable", "Crédit conso responsable", "30 min", "Usure, durée, surendettement.", [
      S("Cadre", "TAEG, durée max selon objet."),
      S("Signaux d’alerte", "Empilement, jeux, découverts."),
      S("Orientation", "Quand orienter vers RAC ou pause."),
    ], { href: "/landings/conso.html", label: "Conso" }),
    L("pret-pro-garanties", "Crédit pro : package garanties", "35 min", "BPI, caution, nantissement, hypothèque.", [
      S("Cartographie", "Qui garantit quoi."),
      S("Coût", "Impact sur le projet."),
      S("Sortie", "Mainlevées et cessions."),
    ], { href: "/academie/finance/credit-pro.html", label: "Crédit pro" }),
    L("lease-vs-credit", "Crédit-bail vs crédit classique", "30 min", "Arbitrage matériel / véhicule.", [
      S("Mécanique", "Propriété, option d’achat."),
      S("Comptable / cash", "Effet trésorerie."),
      S("Fin de contrat", "Restitution, levée d’option."),
    ], { href: "/finance/", label: "Finance" }),
    L("restructuration-dettes", "Restructuration de dettes", "40 min", "Priorités créanciers, plan, communication.", [
      S("Cartographier", "Dettes fiscales, sociales, bancaires, fournisseurs."),
      S("Plan", "Échéanciers réalistes."),
      S("Acteurs", "Expert-comptable, banque, éventuellement procédures."),
    ], { href: "/landings/rachat.html", label: "Étude" }),
    L("pret-relais-atelier", "Atelier prêt relais chiffré", "45 min", "Quotité, intérêts, scénarios vente.", [
      S("Hypothèses", "Prix net vendeur, délai, décote."),
      S("Tableau", "Mensualités / intérêts pendant le pont."),
      S("Plan B", "3 scénarios datés."),
    ], { href: "/landings/pret-relais.html", label: "Relais" }),
    L("cashflow-personnel", "Cash-flow personnel du foyer", "30 min", "Budget, épargne, projet.", [
      S("Méthode", "Revenus – charges – objectif épargne."),
      S("Stress", "Perte d’emploi, taux variable résiduel."),
      S("Lien crédit", "Ce que la banque voit vs réalité vécue."),
    ], { href: "/academie/finance/endettement-global.html", label: "Endettement" }),
    L("ethique-cas", "Éthique : cas de conflits", "35 min", "Commission vs intérêt client.", [
      S("Cas 1", "Produit plus commissionné moins adapté."),
      S("Cas 2", "Pression partenaire apporteur."),
      S("Décision", "Documentation et arbitrage."),
    ], { href: "/academie/finance/ethique-iobsp.html", label: "Éthique IOBSP" }),
    L("cas-rac-surendettement-risque", "Cas : frontière surendettement", "40 min", "Quand ne pas forcer un RAC.", [
      S("Signaux", "Restes à vivre négatifs, incidents répétés."),
      S("Orientation", "Structures d’aide, pause, réalisme."),
      S("Responsabilité", "Ne pas aggraver la situation."),
    ], { href: "/academie/finance/rachat-credits.html", label: "RAC" }),
  ],
  conformite: [
    L("registre-reclamations", "Tenir un registre de réclamations", "30 min", "Process, délais, réponses types.", [
      S("Entrée", "Canal, date, objet, pièces."),
      S("Traitement", "Accusé, investigation, réponse motivée."),
      S("Sortie", "Clôture, médiation, enseignements."),
    ], { href: "/academie/conformite/controle-acpr.html", label: "Contrôle ACPR" }),
    L("piste-audit", "Piste d’audit documentaire", "35 min", "Ce qu’un contrôleur doit retrouver en 15 min.", [
      S("Dossier type", "Besoins, conseil, proposition, contrat, échanges."),
      S("Nommage", "Conventions de fichiers et CRM."),
      S("Exercice", "Audit croisé interne trimestriel."),
    ], { href: "/methode.html", label: "Méthode" }),
    L("gouvernance-produits", "Gouvernance et ciblage produits", "30 min", "Pour qui le produit est conçu.", [
      S("Marché cible", "Ne pas vendre hors cible."),
      S("Informations fabricant", "Utiliser les docs compagnies."),
      S("Revue", "Produits problématiques : alerte et retrait."),
    ], { href: "/academie/conformite/dda-pratique.html", label: "DDA" }),
    L("remuneration-transparence", "Transparence sur la rémunération", "25 min", "Expliquer sans jargon.", [
      S("Modèle courtage", "Commission compagnie."),
      S("Ce qu’il faut dire", "Niveau de détail adapté."),
      S("Ce qu’il ne faut pas faire", "Dissimuler un conflit évident."),
    ], { href: "/academie/conformite/conflits-interets.html", label: "Conflits d’intérêts" }),
    L("marketing-meta-conforme", "Campagnes Meta / Google conformes", "35 min", "Promesses, preuves, consentement leads.", [
      S("Claims", "Pas de taux magique."),
      S("Landing", "Finalité, ORIAS, CGU."),
      S("Preuve consentement", "Conservation et opposition."),
    ], { href: "/academie/conformite/publicite-conforme.html", label: "Publicité" }),
    L("rgpd- durees", "RGPD : durées de conservation", "30 min", "Leads, clients, contentieux.", [
      S("Bases légales", "Exécution contrat, obligation légale, intérêt légitime."),
      S("Durées types", "Cadre indicative à formaliser en cabinet."),
      S("Purge", "Process annuel."),
    ], { href: "/politique-confidentialite.html", label: "Confidentialité" }),
    L("sous-traitance-ops", "Sous-traitance et prestataires", "25 min", "CRM, call center, hébergeur : contrats.", [
      S("DPA", "Clauses données."),
      S("Accès", "Qui voit les dossiers clients."),
      S("Incident", "Notification et responsabilités."),
    ], { href: "/academie/conformite/rgpd-donnees.html", label: "RGPD" }),
    L("orias-modifications", "ORIAS : modifications et contrôles", "25 min", "Changements d’activité, dirigeants, adresses.", [
      S("Déclarer tôt", "Éviter l’écart registre / réalité."),
      S("Pièces", "Assurances RC pro, diplômes, casiers selon cas."),
      S("Vérification publique", "Le client peut contrôler : anticipation."),
    ], { href: "/academie/conformite/orias-categories.html", label: "ORIAS" }),
    L("cas-reclamation-sinistre", "Cas : réclamation sinistre mal géré", "40 min", "Chronologie, réponse, médiation.", [
      S("Faits", "Retard, pièces manquantes, malentendu garantie."),
      S("Réponse", "Reconnaissance partielle, plan d’action."),
      S("Prévention", "Checklist post-souscription."),
    ], { href: "/academie/assurance/sinistre-reclamations.html", label: "Sinistre" }),
    L("atelier-audit-interne", "Atelier : audit interne 10 dossiers", "45 min", "Grille de notation conformité.", [
      S("Grille", "Besoins, IPID, motivation, pièces."),
      S("Scoring", "Vert / orange / rouge."),
      S("Plan correctif", "Formation ciblée."),
    ], { href: "/academie/conformite/formation-continue.html", label: "Formation continue" }),
  ],
};

const TARGET_HOURS = {
  assurance: "20 h",
  pret: "18 h",
  immobilier: "16 h",
  banque: "12 h",
  finance: "14 h",
  conformite: "10 h",
};

data.updated = new Date().toISOString().slice(0, 10);
data.hub.title = "Académie pro | Formation longue courtier, IOBSP, banque (90 h+)";
data.hub.description =
  "Parcours de formation longue niveau courtier ORIAS / IOBSP / banque : plus de 90 heures de cours (assurance, prêt, immo, finance, conformité). Leads Opportunities.";
data.hub.h1 = "Académie pro : un vrai volume de formation";
data.hub.lead =
  "Plus de 90 heures de cours structurés (leçons 25–45 min, cas pratiques, ateliers). Niveau attendu en cabinet de courtage et en montage bancaire — pas un simple glossaire.";

let added = 0;
for (const course of data.courses) {
  const pack = BANK[course.id] || [];
  const have = new Set(course.lessons.map((l) => l.slug));
  for (const lesson of pack) {
    if (!have.has(lesson.slug)) {
      course.lessons.push(lesson);
      have.add(lesson.slug);
      added += 1;
    }
  }
  if (TARGET_HOURS[course.id]) course.duration = TARGET_HOURS[course.id];
  course.level = (course.level || "").replace(/Débutant.*/, "Formation longue pro");
  if (!/Formation longue|niveau/.test(course.level)) {
    course.level = "Formation longue pro";
  }
}

const totalLessons = data.courses.reduce((n, c) => n + c.lessons.length, 0);
fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
console.log("added", added, "lessons; total", totalLessons);
data.courses.forEach((c) => console.log("-", c.id, c.duration, c.lessons.length + " leçons"));
