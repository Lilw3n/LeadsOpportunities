/**
 * Valeur économique d’un lead formulaire (courtage ORIAS).
 * Montants indicatifs 1re année / honoraires one-shot — pas contractuels.
 * Navigateur : window.LeadValueLib  |  Node : module.exports
 */
(function (root) {
  var PRODUCTS = {
    "vendeur-immo": {
      label: "Mandat vendeur",
      dealEur: 9500,
      closeRate: 0.12,
      unit: "honoraires",
      note: "Honoraires agence estimés (vente ~200–300 k€).",
    },
    "acheteur-vendeur-immo": {
      label: "Vendre et racheter",
      dealEur: 14000,
      closeRate: 0.1,
      unit: "honoraires",
      note: "Double casquette : mandat + parcours acquéreur.",
    },
    "acheteur-immo": {
      label: "Acquéreur immobilier",
      dealEur: 2800,
      closeRate: 0.16,
      unit: "apport",
      note: "Apport d’affaire / accompagnement recherche.",
    },
    "credit-immo": {
      label: "Crédit immobilier",
      dealEur: 1800,
      closeRate: 0.2,
      unit: "courtage",
      note: "Courtage prêt (forfait / % du capital).",
    },
    rachat: {
      label: "Rachat de crédit",
      dealEur: 1600,
      closeRate: 0.18,
      unit: "courtage",
      note: "Courtage rachat / regroupement.",
    },
    renegociation: {
      label: "Renégociation de prêt",
      dealEur: 900,
      closeRate: 0.18,
      unit: "courtage",
    },
    conso: { label: "Crédit conso", dealEur: 280, closeRate: 0.15, unit: "courtage" },
    "credit-pro": { label: "Crédit pro", dealEur: 1200, closeRate: 0.12, unit: "courtage" },
    "credit-auto": { label: "Crédit / LOA véhicule", dealEur: 450, closeRate: 0.14, unit: "courtage" },
    vtc: { label: "Assurance VTC", dealEur: 320, closeRate: 0.26, unit: "commission", note: "1re année flotte / taxi-VTC." },
    auto: { label: "Assurance auto", dealEur: 180, closeRate: 0.22, unit: "commission" },
    taxi: { label: "Assurance taxi", dealEur: 300, closeRate: 0.22, unit: "commission" },
    moto: { label: "Deux-roues", dealEur: 90, closeRate: 0.18, unit: "commission" },
    flotte: { label: "Flotte pro", dealEur: 700, closeRate: 0.14, unit: "commission" },
    temporaire: { label: "Temporaire", dealEur: 70, closeRate: 0.2, unit: "commission" },
    sante: { label: "Mutuelle santé", dealEur: 160, closeRate: 0.22, unit: "commission" },
    prevoyance: { label: "Prévoyance", dealEur: 380, closeRate: 0.16, unit: "commission" },
    tns: { label: "Prévoyance TNS", dealEur: 420, closeRate: 0.16, unit: "commission" },
    deces: { label: "Décès / obsèques", dealEur: 180, closeRate: 0.14, unit: "commission" },
    collective: { label: "Mutuelle collective", dealEur: 900, closeRate: 0.1, unit: "commission" },
    habitation: { label: "Habitation / MRH", dealEur: 95, closeRate: 0.28, unit: "commission" },
    mrh: { label: "MRH", dealEur: 95, closeRate: 0.28, unit: "commission" },
    pno: { label: "PNO", dealEur: 110, closeRate: 0.22, unit: "commission" },
    emprunteur: { label: "Assurance emprunteur", dealEur: 420, closeRate: 0.24, unit: "commission" },
    "rc-pro": { label: "RC professionnelle", dealEur: 220, closeRate: 0.16, unit: "commission" },
    mrp: { label: "MRP", dealEur: 380, closeRate: 0.14, unit: "commission" },
    decennale: { label: "Décennale", dealEur: 520, closeRate: 0.12, unit: "commission" },
    "pj-pro": { label: "PJ pro", dealEur: 90, closeRate: 0.16, unit: "commission" },
    dirigeant: { label: "Homme clé", dealEur: 480, closeRate: 0.1, unit: "commission" },
    "assurance-vie": { label: "Assurance vie", dealEur: 450, closeRate: 0.1, unit: "commission" },
    retraite: { label: "Retraite supp.", dealEur: 380, closeRate: 0.1, unit: "commission" },
    gav: { label: "GAV", dealEur: 80, closeRate: 0.14, unit: "commission" },
    pj: { label: "Protection juridique", dealEur: 70, closeRate: 0.16, unit: "commission" },
    famille: { label: "Scolaire / famille", dealEur: 60, closeRate: 0.16, unit: "commission" },
    animaux: { label: "Assurance animaux", dealEur: 70, closeRate: 0.2, unit: "commission" },
    chasse: { label: "Chasse", dealEur: 80, closeRate: 0.14, unit: "commission" },
    equitation: { label: "Équitation", dealEur: 90, closeRate: 0.12, unit: "commission" },
    instrument: { label: "Instrument", dealEur: 85, closeRate: 0.12, unit: "commission" },
    "materiel-photo": { label: "Matériel photo", dealEur: 85, closeRate: 0.12, unit: "commission" },
    bateau: { label: "Bateau", dealEur: 160, closeRate: 0.1, unit: "commission" },
    caravane: { label: "Caravane", dealEur: 110, closeRate: 0.12, unit: "commission" },
    contact: { label: "Contact / autre", dealEur: 80, closeRate: 0.08, unit: "apport" },
    autre: { label: "Autre demande", dealEur: 80, closeRate: 0.08, unit: "apport" },
  };

  /** Affinités : si le profil colle, pousser un autre produit du catalogue. */
  var AFFINITIES = [
    { from: "vtc", to: "sante", fit: 0.88, reason: "Indépendant VTC : mutuelle TNS quasi systématique." },
    { from: "vtc", to: "prevoyance", fit: 0.82, reason: "Revenu d’activité à protéger (arrêt / invalidité)." },
    { from: "vtc", to: "tns", fit: 0.7, reason: "Statut TNS / micro : prévoyance Madelin." },
    { from: "vtc", to: "rc-pro", fit: 0.55, reason: "Société VTC : RC pro et flotte.", need: "company" },
    { from: "vtc", to: "credit-auto", fit: 0.6, reason: "Véhicule d’activité souvent financé (LOA / crédit)." },
    { from: "vtc", to: "auto", fit: 0.4, reason: "Véhicule perso en plus de l’usage VTC." },
    { from: "auto", to: "sante", fit: 0.55, reason: "Foyer auto : mutuelle souvent à renégocier." },
    { from: "auto", to: "habitation", fit: 0.5, reason: "Pack auto + habitation." },
    { from: "auto", to: "credit-auto", fit: 0.45, reason: "Crédit / LOA encore en cours." },
    { from: "sante", to: "prevoyance", fit: 0.62, reason: "Complément revenus si indépendant ou famille.", need: "self_or_family" },
    { from: "sante", to: "habitation", fit: 0.4, reason: "Foyer : MRH souvent oubliée." },
    { from: "credit-immo", to: "emprunteur", fit: 0.9, reason: "Délégation ADE : fort levier sur le dossier prêt." },
    { from: "credit-immo", to: "habitation", fit: 0.85, reason: "MRH obligatoire avant acte / déblocage." },
    { from: "credit-immo", to: "sante", fit: 0.45, reason: "Foyer en projet immo souvent sous-assuré." },
    { from: "credit-immo", to: "pno", fit: 0.35, reason: "Investissement locatif : PNO.", need: "invest" },
    { from: "acheteur-immo", to: "credit-immo", fit: 0.88, reason: "Acquéreur : montage prêt dans le même dossier." },
    { from: "acheteur-immo", to: "emprunteur", fit: 0.82, reason: "ADE à déléguer dès l’offre de prêt." },
    { from: "acheteur-immo", to: "habitation", fit: 0.8, reason: "Habitation de la future résidence." },
    { from: "acheteur-immo", to: "pno", fit: 0.4, reason: "Bien locatif / investissement.", need: "pno" },
    { from: "acheteur-immo", to: "rachat", fit: 0.5, reason: "Rachat pour dégager de la capacité.", need: "rachat" },
    { from: "acheteur-immo", to: "sante", fit: 0.35, reason: "Foyer acquéreur : mutuelle à revoir." },
    { from: "vendeur-immo", to: "credit-immo", fit: 0.55, reason: "Repli / rachat après vente, ou co-acquéreur." },
    { from: "vendeur-immo", to: "pno", fit: 0.4, reason: "Si le bien reste en stock / location." },
    { from: "vendeur-immo", to: "assurance-vie", fit: 0.45, reason: "Produit de la vente à placer." },
    { from: "acheteur-vendeur-immo", to: "credit-immo", fit: 0.9, reason: "Pont / prêt relais + nouveau financement." },
    { from: "acheteur-vendeur-immo", to: "emprunteur", fit: 0.85, reason: "ADE sur le nouveau prêt." },
    { from: "acheteur-vendeur-immo", to: "habitation", fit: 0.8, reason: "MRH du bien racheté." },
    { from: "rachat", to: "emprunteur", fit: 0.7, reason: "ADE du nouveau crédit." },
    { from: "rachat", to: "habitation", fit: 0.4, reason: "Patrimoine à réassurer après regroupement." },
    { from: "habitation", to: "pno", fit: 0.35, reason: "Second bien / locatif." },
    { from: "habitation", to: "emprunteur", fit: 0.4, reason: "Crédit immo en cours sans délégation.", need: "homeowner" },
    { from: "habitation", to: "sante", fit: 0.35, reason: "Foyer : mutuelle." },
    { from: "emprunteur", to: "habitation", fit: 0.7, reason: "ADE + MRH du bien financé." },
    { from: "emprunteur", to: "credit-immo", fit: 0.5, reason: "Renégociation du prêt porteur." },
    { from: "prevoyance", to: "sante", fit: 0.6, reason: "Couple mutuelle + prévoyance TNS." },
    { from: "tns", to: "sante", fit: 0.7, reason: "Indépendant : mutuelle Madelin." },
    { from: "tns", to: "rc-pro", fit: 0.5, reason: "Activité pro à couvrir." },
    { from: "rc-pro", to: "prevoyance", fit: 0.55, reason: "Dirigeant : homme clé / arrêt de travail." },
    { from: "rc-pro", to: "mrp", fit: 0.5, reason: "Local et matériel." },
    { from: "animaux", to: "habitation", fit: 0.4, reason: "Foyer avec animal : MRH responsabilité." },
    { from: "animaux", to: "sante", fit: 0.3, reason: "Foyer : mutuelle humaine en plus de l’animal." },
  ];

  function hyphen(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .replace(/_/g, "-")
      .replace(/\s+/g, "-");
  }

  function parsePayload(raw) {
    if (!raw) return {};
    if (typeof raw === "object") return raw;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return {};
    }
  }

  function yes(v) {
    var s = String(v == null ? "" : v).toLowerCase().trim();
    return s === "1" || s === "oui" || s === "yes" || s === "true";
  }

  function no(v) {
    var s = String(v == null ? "" : v).toLowerCase().trim();
    return s === "0" || s === "non" || s === "no" || s === "false";
  }

  function listNeeds(p) {
    var n = p.buyerNeeds || p.serviceSought || p.interestedProducts || [];
    if (typeof n === "string") n = n.split(/[,;]/);
    if (!Array.isArray(n)) n = [n];
    return n.map(hyphen).filter(Boolean);
  }

  function ageOf(p) {
    var dob = p.driverDob || p.birthDate || p.dob;
    if (!dob) return null;
    var d = new Date(dob);
    if (isNaN(d.getTime())) return null;
    var now = new Date();
    var a = now.getFullYear() - d.getFullYear();
    if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) a--;
    return a;
  }

  function profileSignals(p, primaryNeed) {
    var needs = listNeeds(p);
    var blob = (p.activity || "") + " " + (p.profession || "") + " " + (p.housingStatus || "") + " " + (p.homeStatus || "") + " " + (p.projectType || "") + " " + (p.vehicleOwnership || "") + " " + (p.financing || "");
    blob = blob.toLowerCase();
    var age = ageOf(p);
    var self =
      /vtc|taxi|uber|independant|auto-entrepreneur|liberal|tns/.test(blob + " " + primaryNeed) ||
      primaryNeed === "vtc" ||
      primaryNeed === "tns" ||
      yes(p.hasCompany);
    return {
      self_employed: self,
      company: yes(p.hasCompany) || /sasu|eurl|sarl|societe/.test(blob),
      no_sante: no(p.hasMutuelle) || (!p.hasMutuelle && !p.mutuelleMonthly),
      has_sante: yes(p.hasMutuelle),
      no_habitation: no(p.hasHabitation),
      homeowner: /proprietaire|owner/.test(blob) || primaryNeed === "vendeur-immo",
      invest: /invest|locatif|pinel/.test(blob) || needs.indexOf("pno") >= 0,
      wants_pret: needs.indexOf("pret") >= 0 || primaryNeed === "credit-immo" || primaryNeed === "acheteur-immo",
      wants_emprunteur: needs.indexOf("emprunteur") >= 0,
      wants_habitation: needs.indexOf("habitation") >= 0 || needs.indexOf("mrh") >= 0,
      wants_pno: needs.indexOf("pno") >= 0,
      wants_rachat: needs.indexOf("rachat") >= 0,
      vehicle_finance: /credit|loa|lld|leasing/.test(blob) || yes(p.hasCreditAuto),
      senior: age != null && age >= 55,
      family: /family|famille|couple/.test(String(p.householdType || p.household || "").toLowerCase()),
    };
  }

  function affinityAllowed(aff, sig) {
    if (aff.need === "company" && !sig.company) return false;
    if (aff.need === "pno" && !sig.wants_pno && !sig.invest) return false;
    if (aff.need === "rachat" && !sig.wants_rachat) return false;
    if (aff.need === "invest" && !sig.invest) return false;
    if (aff.need === "homeowner" && !sig.homeowner) return false;
    if (aff.need === "self_or_family" && !sig.self_employed && !sig.family) return false;
    if (aff.to === "sante" && sig.has_sante) return false;
    return true;
  }

  function kindFactor(kind, p, row) {
    var step = Number((row && row.questionnaire_step) || p.questionnaire_step || p.step || 0);
    var total = Number((row && row.questionnaire_total) || p.questionnaire_total || p.step_total || 0) || 0;
    if (kind === "express_callback") return 0.32;
    if (kind === "contact_request") return 0.42;
    if (total > 0) return Math.max(0.45, Math.min(1, 0.4 + 0.6 * (step / total)));
    if (p.journey === "full" || p.journey === "standard") return 0.85;
    if (p.journey === "express" || p.journey === "quick") return 0.55;
    return 0.6;
  }

  function contactQuality(p, row) {
    var email = String((row && row.email) || p.email || "");
    var phone = String((row && row.phone) || p.phone || "");
    var q = 0.55;
    if (email.indexOf("@") !== -1) q += 0.22;
    if (phone.replace(/\D/g, "").length >= 10) q += 0.23;
    return Math.min(1, q);
  }

  function expected(prod, factor) {
    if (!prod) return 0;
    return Math.round(prod.dealEur * prod.closeRate * factor);
  }

  function getClassifier() {
    if (typeof window !== "undefined" && window.FormLeadCategory) return window.FormLeadCategory;
    try {
      return require("./form-lead-category");
    } catch (e) {
      return null;
    }
  }

  function computeLeadValue(row) {
    row = row || {};
    var p = parsePayload(row.payload);
    var cat = getClassifier();
    var classed = row.formNeed
      ? {
          need: row.formNeed,
          needLabel: row.formNeedLabel,
          kind: row.formKind || "questionnaire",
          category: row.formCategory,
        }
      : cat && cat.classifyFormLead
        ? cat.classifyFormLead(row)
        : { need: hyphen(row.vertical || p.need || "autre"), kind: "questionnaire" };

    var need = hyphen(classed.need || "autre");
    if (need === "immo") need = "credit-immo";
    var primary = PRODUCTS[need] || PRODUCTS.autre;
    var kind = classed.kind || "questionnaire";
    var kf = kindFactor(kind, p, row);
    var cq = contactQuality(p, row);
    var factor = kf * cq;
    var sig = profileSignals(p, need);

    var primaryEur = expected(primary, factor);
    var extras = [];
    var seen = {};
    seen[need] = true;
    if (need === "habitation") seen.mrh = true;
    if (need === "mrh") seen.habitation = true;

    AFFINITIES.forEach(function (aff) {
      if (hyphen(aff.from) !== need) return;
      if (seen[aff.to]) return;
      if (!affinityAllowed(aff, sig)) return;
      var prod = PRODUCTS[aff.to];
      if (!prod) return;
      var boost = 1;
      if (aff.to === "credit-immo" && sig.wants_pret) boost = 1.15;
      if (aff.to === "emprunteur" && sig.wants_emprunteur) boost = 1.2;
      if (aff.to === "habitation" && sig.wants_habitation) boost = 1.2;
      if (aff.to === "pno" && sig.wants_pno) boost = 1.2;
      if (aff.to === "rachat" && sig.wants_rachat) boost = 1.15;
      var fit = Math.min(0.95, aff.fit * boost);
      var eur = expected(prod, factor * fit * 0.75);
      if (eur < 8) return;
      seen[aff.to] = true;
      extras.push({
        product: aff.to,
        label: prod.label,
        reason: aff.reason,
        fit: Math.round(fit * 100),
        expectedEur: eur,
        dealEur: prod.dealEur,
      });
    });

    extras.sort(function (a, b) {
      return b.expectedEur - a.expectedEur;
    });
    extras = extras.slice(0, 5);
    var upsideEur = extras.reduce(function (s, x) {
      return s + x.expectedEur;
    }, 0);
    var totalEur = primaryEur + upsideEur;
    var tier = "C";
    if (totalEur >= 1500) tier = "A+";
    else if (totalEur >= 600) tier = "A";
    else if (totalEur >= 200) tier = "B";

    return {
      need: need,
      needLabel: classed.needLabel || primary.label,
      kind: kind,
      primary: {
        product: need,
        label: primary.label,
        dealEur: primary.dealEur,
        closeRate: primary.closeRate,
        unit: primary.unit,
        note: primary.note || "",
        expectedEur: primaryEur,
      },
      completeness: Math.round(factor * 100),
      kindFactor: Math.round(kf * 100),
      contactQuality: Math.round(cq * 100),
      crossSell: extras,
      primaryEur: primaryEur,
      upsideEur: upsideEur,
      totalEur: totalEur,
      tier: tier,
    };
  }

  function applyToLead(row) {
    var v = computeLeadValue(row);
    row.valuePrimary = v.primaryEur;
    row.valueUpside = v.upsideEur;
    row.valueTotal = v.totalEur;
    row.valueTier = v.tier;
    row.valueCompleteness = v.completeness;
    row.valueCrossSell = v.crossSell;
    row.leadValue = v;
    return row;
  }

  var api = {
    PRODUCTS: PRODUCTS,
    AFFINITIES: AFFINITIES,
    computeLeadValue: computeLeadValue,
    applyToLead: applyToLead,
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LeadValueLib = api;
})(typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : this);
