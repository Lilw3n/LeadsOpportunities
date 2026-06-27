/**
 * Images hero + figure inline par article blog.
 * Applique automatiquement si l'article n'a pas deja heroImage dans le manifeste.
 */

function img(src, alt, caption) {
  return { src: src, alt: alt, caption: caption || "" };
}

var I = {
  seniorsCouple: img(
    "./images/sante/seniors-couple.jpg",
    "Couple de seniors heureux — mutuelle sante adaptee",
    "Photo Unsplash — accompagnement sante senior."
  ),
  seniorDoctor: img(
    "./images/sante/senior-doctor.jpg",
    "Senior en consultation medicale avec un professionnel de sante",
    "Consultation medicale — role de la mutuelle."
  ),
  hospitalCare: img(
    "./images/sante/hospital-care.jpg",
    "Personnel soignant et patient en etablissement de sante",
    "Hospitalisation : verifier les garanties de votre mutuelle."
  ),
  familyHealth: img(
    "./images/sante/family-health.jpg",
    "Famille avec enfants — couverture mutuelle collective ou individuelle",
    "Mutuelle famille : optique, dentaire et soins courants."
  ),
  dentalCare: img(
    "./images/sante/dental-care.jpg",
    "Soin dentaire — remboursement mutuelle optique et dentaire",
    "Postes dentaire et optique souvent sous-rembourses par la Secu."
  ),
  optique: img(
    "./images/sante/optique-lunettes.jpg",
    "Choix de lunettes en magasin d'optique",
    "Optique : comparez les plafonds mutuelle avant d'acheter."
  ),
  medecinConsult: img(
    "./images/sante/medecin-consultation.jpg",
    "Consultation chez le medecin generaliste",
    "Soins courants et teleconsultation selon votre contrat."
  ),
  seniorSmile: img(
    "./images/sante/senior-souriant.jpg",
    "Personne agee souriante en bonne sante",
    "Bien choisir sa mutuelle des 60 ans et plus."
  ),
  analyseMed: img(
    "./images/sante/analyse-medicale.jpg",
    "Laboratoire d'analyses medicales",
    "Depistages et analyses : verifiez le remboursement mutuelle."
  ),
  chambreHosp: img(
    "./images/sante/hospitalisation-chambre.jpg",
    "Chambre d'hospitalisation moderne",
    "Garantie hospitalisation : chambre particuliere, forfait journalier."
  ),
  medicaments: img(
    "./images/sante/medicaments.jpg",
    "Medicaments et ordonnance sur plan de travail",
    "Medicaments non rembourses ou partiellement pris en charge."
  ),
  mutuelleDocs: img(
    "./images/sante/mutuelle-documents.jpg",
    "Documents et contrat de complementaire sante",
    "Questionnaire mutuelle : listez vos besoins avant de comparer."
  ),
  maisonFamille: img(
    "./images/habitat/maison-famille.jpg",
    "Maison avec jardin — assurance habitation",
    "Multirisque habitation : locataire ou proprietaire."
  ),
  appartLoc: img(
    "./images/habitat/appartement-locataire.jpg",
    "Salon d'appartement en location",
    "Assurance habitation locataire : obligations et garanties."
  ),
  sinistre: img(
    "./images/habitat/sinistre-degats.jpg",
    "Intervention apres sinistre dans un logement",
    "Sous-assurance : risque en cas de sinistre majeur."
  ),
  bailleur: img(
    "./images/habitat/bailleur-cles.jpg",
    "Clefs et maison — proprietaire bailleur PNO",
    "PNO : assurance proprietaire non occupant."
  ),
  canicule: img(
    "./images/habitat/canicule-maison.jpg",
    "Maison sous forte chaleur estivale",
    "Canicule : degats des eaux et secheresse des sols."
  ),
  caniculeSoleil: img(
    "./images/canicule/chaleur-soleil-maison.jpg",
    "Fort soleil estival sur un logement — canicule en France",
    "Vague de chaleur : anticiper habitation et sante."
  ),
  caniculeSecheresse: img(
    "./images/canicule/secheresse-fissures.jpg",
    "Sol sec et fissures — secheresse des fondations",
    "Secheresse : fissures et mouvement de terrain a declarer."
  ),
  caniculeInondation: img(
    "./images/canicule/inondation-degats-eaux.jpg",
    "Degats des eaux apres orage violent — cave ou piece humide",
    "Orage post-canicule : inondation de cave et degats des eaux."
  ),
  caniculeSenior: img(
    "./images/canicule/senior-hydratation.jpg",
    "Personne agee en periode de forte chaleur — prevention coup de chaleur",
    "Seniors : hydratation, mutuelle et soins d'urgence."
  ),
  caniculeUrgences: img(
    "./images/canicule/urgences-chaleur.jpg",
    "Consultation medicale — urgences liees a la chaleur",
    "Coup de chaleur : teleconsultation et hospitalisation mutuelle."
  ),
  caniculeToiture: img(
    "./images/canicule/prevention-toiture.jpg",
    "Maison a entretenir avant l'ete — toiture et evacuations",
    "Prevention : gouttieres, toiture et declaration sinistre."
  ),
  caniculeSeniorsCouple: img(
    "./images/canicule/seniors-couple-ete.jpg",
    "Couple de seniors en periode estivale — prevention canicule",
    "Seniors : rester au frais et bien couverts cote mutuelle."
  ),
  caniculeLogementFrais: img(
    "./images/canicule/logement-frais-senior.jpg",
    "Interieur de logement ventile — senior a l'abri de la chaleur",
    "Astuces logement : stores, ventilation, pieces fraiches."
  ),
  caniculeClimat: img(
    "./images/canicule/climat-chaleur-extreme.jpg",
    "Chaleur extreme et ciel estival — futur climatique en France",
    "Canicules plus frequentes : anticiper mutuelle et habitation."
  ),
  caniculePolitique: img(
    "./images/canicule/politique-canicule-france.jpg",
    "Politique publique et canicule en France",
    "Plans gouvernementaux et complement mutuelle seniors."
  ),
  caniculeHydratation: img(
    "./images/canicule/hydratation-prevention.jpg",
    "Hydratation et prevention coup de chaleur",
    "Boire regulierement : reflexe numero un des seniors."
  ),
  caniculeSolaire: img(
    "./images/canicule/panneaux-solaires-toiture.jpg",
    "Panneaux solaires photovoltaiques sur toiture — canicule et autoconsommation",
    "Canicule : produire sa propre electricite limite la dependance au reseau."
  ),
  caniculeMaisonSolaire: img(
    "./images/canicule/maison-panneaux-solaires.jpg",
    "Maison equipee de panneaux solaires",
    "Photovoltaique : financement, aides publiques et assurance habitation."
  ),
  voiture: img(
    "./images/auto/voiture-route.jpg",
    "Voiture sur route — assurance auto",
    "Assurance auto : garanties, franchise et bonus-malus."
  ),
  jeuneCond: img(
    "./images/auto/jeune-conducteur.jpg",
    "Jeune conducteur au volant",
    "Jeune permis : tarifs et options d'assurance auto."
  ),
  bonusMalus: img(
    "./images/auto/bonus-malus.jpg",
    "Tableau de bord voiture sportive",
    "Bonus-malus : impact sur la prime annuelle."
  ),
  f1voyage: img(
    "./images/auto/formule1-voyage.jpg",
    "Voiture de sport — voyage et assurance auto a l'etranger",
    "Grands prix et deplacements : assurance voyage + auto."
  ),
  chienVet: img(
    "./images/animaux/chien-veterinaire.jpg",
    "Chien chez le veterinaire",
    "Assurance chien : frais veterinaires et prevention."
  ),
  chatSoin: img(
    "./images/animaux/chat-soin.jpg",
    "Chat domestique — assurance animaux",
    "Assurance chat : soins, puces et urgences."
  ),
  chiotChaton: img(
    "./images/animaux/chiot-chaton.jpg",
    "Chiot et chaton — assurer tot ou tard",
    "Chiot / chaton : age ideal pour souscrire."
  ),
  chienProm: img(
    "./images/animaux/chien-promenade.jpg",
    "Proprietaire promenant son chien",
    "Assurance chien : prevention et frais veterinaires au quotidien."
  ),
  chienEauCanicule: img(
    "./images/animaux/canicule-chien-eau.jpg",
    "Chien qui boit de l'eau en periode de forte chaleur",
    "Canicule : hydrater son chien plusieurs fois par jour."
  ),
  oiseauEauCanicule: img(
    "./images/animaux/canicule-oiseau-eau.jpg",
    "Oiseau pres de l'eau — canicule et oiseaux de jardin",
    "Oiseaux : baignoire peu profonde et point d'eau frais."
  ),
  vtcChauffeur: img(
    "./images/vtc/chauffeur-vtc.jpg",
    "Chauffeur VTC devant son vehicule",
    "Assurance VTC : RC pro et vehicule."
  ),
  taxiVille: img(
    "./images/vtc/taxi-ville.jpg",
    "Taxi en ville la nuit",
    "Uber, Bolt, Heetch : attestation valide obligatoire."
  ),
  vtcPhone: img(
    "./images/vtc/vtc-smartphone.jpg",
    "Chauffeur avec application mobile VTC",
    "Premiere course : checklist assurance VTC."
  ),
  creditCles: img(
    "./images/finance/credit-immo-cles.jpg",
    "Clefs et maison — credit immobilier",
    "Pret immo : taux, apport et assurance emprunteur."
  ),
  signaturePret: img(
    "./images/finance/signature-pret.jpg",
    "Signature de contrat de pret immobilier",
    "Erreurs a eviter avant de signer son pret."
  ),
  budgetFam: img(
    "./images/finance/budget-famille.jpg",
    "Budget familial et documents financiers",
    "Rachat de credit et capacite d'endettement."
  ),
  famProtect: img(
    "./images/prevoyance/famille-protection.jpg",
    "Famille reunie — prevoyance et protection",
    "Prevoyance : securiser les revenus du foyer."
  ),
  obseques: img(
    "./images/prevoyance/deces-obseques.jpg",
    "Bougie et fleurs — assurance deces et obseques",
    "Capital deces et frais d'obseques."
  ),
  indepBureau: img(
    "./images/prevoyance/independant-bureau.jpg",
    "Independant au bureau — prevoyance TNS",
    "Arret de travail et maintien de revenus independants."
  ),
  epargneRetraite: img(
    "./images/patrimoine/epargne-retraite.jpg",
    "Epargne et retraite — assurance-vie",
    "Patrimoine : diversification et fiscalite."
  ),
  artisan: img(
    "./images/pro/artisan-chantier.jpg",
    "Artisan sur chantier — RC Pro",
    "RC Pro freelance et artisan : garanties essentielles."
  ),
  freelance: img(
    "./images/pro/freelance-laptop.jpg",
    "Equipe freelance en reunion",
    "RC Pro et responsabilite civile professionnelle."
  ),
  voyageFoot: img(
    "./images/actu/voyage-foot.jpg",
    "Voyage avion — assurance sante et bagages",
    "Coupe du monde et deplacements : mutuelle et voyage."
  ),
  divorce: img(
    "./images/actu/divorce-couple.jpg",
    "Couple en discussion — separation et assurances",
    "Divorce : habitation, emprunteur et beneficiaires."
  ),
  politique: img(
    "./images/actu/politique-france.jpg",
    "Assemblee et politique francaise",
    "Actualite et impact sur pret, impots et prevoyance."
  ),
  factures: img(
    "./images/actu/inflation-factures.jpg",
    "Factures et inflation — mutuelle et pouvoir d'achat",
    "Hausse des cotisations mutuelle en 2026."
  ),
  iaBureau: img(
    "./images/actu/ia-bureau.jpg",
    "Intelligence artificielle au travail — assurance et metiers",
    "IA et tarification assurance en 2026."
  ),
  retroGaming: img(
    "./images/actu/collection-retro.jpg",
    "Collection retro gaming",
    "Collections et assurance habitation."
  ),
};

/** file -> { hero, figure } keys into I */
var MAP = {
  /* Sante & mutuelle */
  "mutuelle-sante-hospitalisation-2026.html": { hero: "chambreHosp", figure: "hospitalCare" },
  "mutuelle-remboursement-optique-dentaire-2026.html": { hero: "optique", figure: "dentalCare" },
  "mutuelle-sante-famille-petit-budget-2026.html": { hero: "familyHealth", figure: "seniorsCouple" },
  "mutuelle-sante-5-criteres.html": { hero: "seniorDoctor", figure: "mutuelleDocs" },
  "questionnaire-mutuelle-quel-niveau-choisir.html": { hero: "mutuelleDocs", figure: "medecinConsult" },
  "mutuelle-obesite-medicaments-rembourses-juin-2026.html": { hero: "medicaments", figure: "seniorDoctor" },
  "cadmium-depistage-rembourse-mutuelle-2026.html": { hero: "analyseMed", figure: "medecinConsult" },
  "lieu-de-r-xe9-sidence-intoxication-chronique-analyse-d-urine-cinq-questi.html": {
    hero: "analyseMed",
    figure: "mutuelleDocs",
  },
  "inflation-mutuelle-hausse-2026.html": { hero: "factures", figure: "seniorSmile" },

  /* Habitat */
  "assurance-habitation-locataire-proprietaire-2026.html": { hero: "appartLoc", figure: "maisonFamille" },
  "assurance-emprunteur-loi-lemoine-2026.html": { hero: "creditCles", figure: "signaturePret" },
  "pno-bailleur-proprietaire-non-occupant.html": { hero: "bailleur", figure: "maisonFamille" },
  "assurance-habitation-sous-assurance-sinistre.html": { hero: "sinistre", figure: "appartLoc" },
  "assurance-emprunteur-combien-economiser-lemoine.html": { hero: "signaturePret", figure: "creditCles" },
  "canicule-degats-eaux-assurance-habitation.html": { hero: "canicule", figure: "sinistre" },
  "canicule-mutuelle-coup-chaleur-seniors-2026.html": { hero: "caniculeSenior", figure: "caniculeUrgences" },
  "canicule-secheresse-fissures-catastrophe-naturelle-assurance.html": {
    hero: "caniculeSecheresse",
    figure: "caniculeToiture",
  },
  "canicule-orage-inondation-cave-assurance-locataire.html": {
    hero: "caniculeInondation",
    figure: "sinistre",
  },
  "canicule-seniors-astuces-moins-chaud-mutuelle.html": {
    hero: "caniculeLogementFrais",
    figure: "caniculeHydratation",
  },
  "canicule-futur-climatique-seniors-assurance-mutuelle.html": {
    hero: "caniculeClimat",
    figure: "caniculeSeniorsCouple",
  },
  "canicule-plan-gouvernement-seniors-mutuelle.html": {
    hero: "caniculePolitique",
    figure: "caniculeSenior",
  },
  "canicule-lacunes-pouvoirs-publics-mutuelle-seniors.html": {
    hero: "caniculeUrgences",
    figure: "mutuelleDocs",
  },
  "canicule-panneaux-solaires-pret-aides-financer.html": {
    hero: "caniculeSolaire",
    figure: "caniculeMaisonSolaire",
  },
  "canicule-animaux-eau-chien-chat-oiseaux-assurance.html": {
    hero: "chienEauCanicule",
    figure: "chatSoin",
  },
  "people-divorce-assurance-habitation-emprunteur.html": { hero: "divorce", figure: "appartLoc" },
  "darmanin-securite-habitation-assurance-emprunteur.html": { hero: "maisonFamille", figure: "creditCles" },
  "presidentielle-2027-melenchon-saint-denis-habitation-pret.html": { hero: "politique", figure: "creditCles" },
  "zelda-ocarina-time-collection-assurance-habitation.html": { hero: "retroGaming", figure: "maisonFamille" },

  /* Auto */
  "assurance-auto-jeune-conducteur-2026.html": { hero: "jeuneCond", figure: "voiture" },
  "assurance-auto-bonus-malus.html": { hero: "bonusMalus", figure: "voiture" },
  "formule-1-grands-prix-assurance-voyage-auto.html": { hero: "f1voyage", figure: "voyageFoot" },

  /* Animaux */
  "chat-puces-tiques-assurance-remboursement.html": { hero: "chatSoin", figure: "chienVet" },
  "assurance-animaux-comment-choisir.html": { hero: "chienVet", figure: "chatSoin" },
  "assurance-chien-frais-veterinaires.html": { hero: "chienProm", figure: "chienVet" },
  "assurance-chat-guide-complet.html": { hero: "chatSoin", figure: "chiotChaton" },
  "assurance-chiot-chaton-quand-assurer.html": { hero: "chiotChaton", figure: "chienVet" },
  "comparatif-santevet-bulle-bleue-kozoo.html": { hero: "chienVet", figure: "chienProm" },

  /* VTC */
  "assurance-vtc-moins-cher-2026.html": { hero: "vtcChauffeur", figure: "taxiVille" },
  "assurance-vtc-rc-pro-garanties.html": { hero: "taxiVille", figure: "vtcChauffeur" },
  "assurance-vtc-creation-chauffeur.html": { hero: "vtcPhone", figure: "vtcChauffeur" },
  "assurance-vtc-uber-bolt-heetch.html": { hero: "vtcChauffeur", figure: "vtcPhone" },
  "assurance-vtc-renouvellement-resiliation.html": { hero: "taxiVille", figure: "vtcPhone" },
  "comparatif-vtc-zephir-solly-azar.html": { hero: "vtcChauffeur", figure: "taxiVille" },
  "assurance-vtc-franchise-garanties-2026.html": { hero: "taxiVille", figure: "vtcChauffeur" },
  "vtc-premiere-course-checklist-assurance.html": { hero: "vtcPhone", figure: "vtcChauffeur" },

  /* Finance */
  "pret-immo-erreurs-a-eviter.html": { hero: "signaturePret", figure: "creditCles" },
  "taux-credit-immobilier-2026-frais-dossier.html": { hero: "creditCles", figure: "budgetFam" },
  "rachat-credit-immobilier-guide-2026.html": { hero: "budgetFam", figure: "signaturePret" },
  "emprunteur-non-residents-investissement-immobilier-2026.html": { hero: "maisonFamille", figure: "signaturePret" },
  "trump-politique-us-taux-pret-assurance-emprunteur.html": { hero: "politique", figure: "creditCles" },
  "gta-6-pret-immobilier-budget-gaming.html": { hero: "creditCles", figure: "budgetFam" },

  /* Prevoyance & patrimoine */
  "assurance-deces-obseques-prevoyance.html": { hero: "obseques", figure: "famProtect" },
  "prevoyance-independants-guide.html": { hero: "indepBureau", figure: "famProtect" },
  "assurance-vie-epargne-retraite-patrimoine.html": { hero: "epargneRetraite", figure: "budgetFam" },
  "elections-presidentielles-prevoyance-patrimoine.html": { hero: "politique", figure: "epargneRetraite" },
  "g7-evian-prevoyance-patrimoine-credit-2026.html": { hero: "epargneRetraite", figure: "politique" },

  /* Pro */
  "rc-pro-freelance-artisan-guide.html": { hero: "artisan", figure: "freelance" },

  /* Actu divers */
  "assurance-streamer-gaming-setup-materiel.html": {
    hero: "retroGaming",
    figure: "freelance",
  },
  "ia-metiers-assurance-tarification-2026.html": { hero: "iaBureau", figure: "freelance" },
  "ligue-champions-assurance-voyage-deplacement.html": { hero: "voyageFoot", figure: "voiture" },
  "coupe-monde-2026-assurance-voyage-sante.html": { hero: "voyageFoot", figure: "familyHealth" },
  "coupe-monde-voyage-assurance-sante-etranger-2026.html": { hero: "voyageFoot", figure: "medecinConsult" },
};

var SECTION_DEFAULT = {
  sante: { hero: "seniorDoctor", figure: "familyHealth" },
  habitat: { hero: "maisonFamille", figure: "appartLoc" },
  auto: { hero: "voiture", figure: "jeuneCond" },
  animaux: { hero: "chienVet", figure: "chatSoin" },
  vtc: { hero: "vtcChauffeur", figure: "taxiVille" },
  finance: { hero: "creditCles", figure: "signaturePret" },
  prevoyance: { hero: "famProtect", figure: "obseques" },
  patrimoine: { hero: "epargneRetraite", figure: "budgetFam" },
  pro: { hero: "artisan", figure: "freelance" },
  actu: { hero: "politique", figure: "factures" },
};

function hasVisualBlock(blocks) {
  return (blocks || []).some(function (b) {
    return b.type === "figure" || b.type === "gallery";
  });
}

function applyArticleImages(article) {
  if (!article || article.heroImage) return article;
  var cfg = MAP[article.file] || SECTION_DEFAULT[article.section];
  if (!cfg) return article;

  var heroDef = I[cfg.hero];
  var figureDef = cfg.figure ? I[cfg.figure] : null;
  if (!heroDef) return article;

  article.heroImage = {
    src: heroDef.src,
    alt: heroDef.alt,
    caption: heroDef.caption,
  };

  if (figureDef && !hasVisualBlock(article.blocks)) {
    var blocks = article.blocks ? article.blocks.slice() : [];
    var insertAt = 0;
    for (var i = 0; i < blocks.length; i++) {
      if (blocks[i].type === "p") {
        insertAt = i + 1;
        break;
      }
    }
    blocks.splice(insertAt, 0, {
      type: "figure",
      src: figureDef.src,
      alt: figureDef.alt,
      caption: figureDef.caption,
    });
    article.blocks = blocks;
  }

  return article;
}

module.exports = { applyArticleImages, MAP, I };
