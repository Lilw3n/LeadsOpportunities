/**
 * Suggestions intelligentes dossier immo — priorisées selon type, année, occupation, etc.
 * Critères FR (vente / location) : DPE, ERP, plomb <1949, amiante <1997, Carrez, gaz/élec >15 ans…
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.CrmImmoSuggestions = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var YEAR_NOW = new Date().getFullYear();

  function num(v) {
    if (v == null || v === "") return null;
    var n = Number(String(v).replace(/\s/g, "").replace(",", "."));
    return isFinite(n) ? n : null;
  }

  function filled(v) {
    if (v == null) return false;
    if (typeof v === "boolean") return v;
    var s = String(v).trim();
    return s !== "" && s !== "any" && s !== "non_renseigne";
  }

  function dig(obj, path) {
    var cur = obj;
    for (var i = 0; i < path.length; i++) {
      if (!cur || typeof cur !== "object") return null;
      cur = cur[path[i]];
    }
    return cur;
  }

  function buildContext(property) {
    property = property || {};
    var details = property.details || {};
    var loc = details.localisation || {};
    var surfaces = details.surfaces || {};
    var interieur = details.interieur || {};
    var diag = details.diagnostics || {};
    var exterieur = details.exterieur || {};
    var units = Array.isArray(property.units) ? property.units : [];
    var type = property.property_type || property.type || "appartement";
    var tx = property.transaction || "vente";
    var year =
      num(dig(details, ["identification", "annee_construction"])) ||
      num(dig(details, ["general", "annee_construction"])) ||
      num(dig(details, ["surfaces", "annee_construction"])) ||
      num(loc.annee_construction) ||
      num(property.annee_construction) ||
      num(diag.annee_construction);
    var yearGaz = num(diag.annee_installation_gaz) || num(interieur.annee_installation_gaz);
    var yearElec = num(diag.annee_installation_elec) || num(interieur.annee_installation_elec);
    var chauffage = String(interieur.chauffage || diag.chauffage || "").toLowerCase();
    var hasGaz =
      /gaz/.test(chauffage) ||
      String(interieur.alimentation_gaz || "").toLowerCase() === "yes" ||
      String(diag.gaz || "").toLowerCase() === "yes" ||
      !!yearGaz;
    var hasElecHeat = /élec|elec|electrique/.test(chauffage);
    var hasRented = units.some(function (u) {
      return u && (u.transaction === "location" || u.loue || u.occupation === "loue" || u.status === "loue");
    });
    var isLogement = ["appartement", "maison", "immeuble", "complexe"].indexOf(type) >= 0;
    var isCopro = type === "appartement" || type === "immeuble" || type === "complexe";
    var isAppart = type === "appartement";
    var surfaceCarrez =
      num(surfaces.surface_carrez) ||
      num(property.surface_carrez) ||
      units.reduce(function (acc, u) {
        return acc + (num(u.surface_carrez) || 0);
      }, 0);
    var surfaceHab =
      num(surfaces.surface_habitable) ||
      num(property.surface_m2) ||
      units.reduce(function (acc, u) {
        return acc + (num(u.surface_m2) || num(u.surface_habitable) || 0);
      }, 0);
    var docs = property.docs_checklist || {};
    function docRecu(id) {
      return !!(docs[id] && (docs[id].recu || docs[id].received));
    }
    function diagDone(key) {
      var map = {
        dpe: {
          flags: ["dpe", "soumis_affichage_dpe"],
          dates: ["date_dpe", "date_audit_energetique"],
          extras: ["n_ademe", "conso_energie_primaire", "conso_energie_finale", "classe_dpe", "dpe_classe"],
          docs: ["dpe"],
        },
        erp: { flags: ["erp"], dates: ["date_erp"], docs: ["erp"] },
        carrez: { flags: ["carrez"], dates: ["date_carrez"], docs: ["carrez"] },
        amiante: { flags: ["amiante"], dates: ["date_amiante"], docs: ["amiante"] },
        plomb: { flags: ["plomb"], dates: ["date_plomb"], docs: ["plomb"] },
        termites: { flags: ["termites", "parasitaire"], dates: ["date_termites", "date_parasitaire"], docs: ["termites", "parasite"] },
        gaz: { flags: ["diag_gaz", "gaz"], dates: ["date_gaz"], docs: ["gaz"] },
        elec: { flags: ["diag_elec", "elec"], dates: ["date_elec"], docs: ["elec"] },
        assainissement: {
          flags: ["diag_assainissement"],
          dates: ["date_assainissement"],
          docs: ["assain_col", "assain_non", "assain_conf"],
        },
        bruit: { flags: ["bruit"], dates: ["date_bruit"], docs: ["bruit"] },
      };
      var conf = map[key] || { flags: [key], dates: ["date_" + key], docs: [key] };
      var i;
      for (i = 0; i < (conf.flags || []).length; i++) {
        var v = diag[conf.flags[i]];
        if (v === "yes" || v === true) return true;
      }
      for (i = 0; i < (conf.dates || []).length; i++) {
        if (filled(diag[conf.dates[i]])) return true;
      }
      for (i = 0; i < (conf.extras || []).length; i++) {
        if (filled(diag[conf.extras[i]])) return true;
      }
      for (i = 0; i < (conf.docs || []).length; i++) {
        if (docRecu(conf.docs[i])) return true;
      }
      return false;
    }

    return {
      property: property,
      type: type,
      transaction: tx,
      year: year,
      yearGaz: yearGaz,
      yearElec: yearElec,
      hasGaz: hasGaz,
      hasElecHeat: hasElecHeat,
      hasRented: hasRented,
      isLogement: isLogement,
      isCopro: isCopro,
      isAppart: isAppart,
      surfaceCarrez: surfaceCarrez,
      surfaceHab: surfaceHab,
      diag: diag,
      surfaces: surfaces,
      interieur: interieur,
      exterieur: exterieur,
      loc: loc,
      units: units,
      docs: docs,
      docRecu: docRecu,
      diagDone: diagDone,
      age: year != null ? YEAR_NOW - year : null,
      ageGaz: yearGaz != null ? YEAR_NOW - yearGaz : null,
      ageElec: yearElec != null ? YEAR_NOW - yearElec : null,
    };
  }

  function push(list, item) {
    if (!item || !item.id) return;
    if (list.some(function (x) { return x.id === item.id; })) return;
    list.push(item);
  }

  /**
   * @returns {Array<{id,priority,category,title,why,action,sectionId,fieldId,docId,status}>}
   * priority: 1 critique, 2 important, 3 recommandé, 4 info
   * status: missing | check | done
   */
  function collectSuggestions(property) {
    var ctx = buildContext(property);
    var out = [];
    var d = ctx.diag;

    function missField(sectionId, fieldId) {
      var bag = (property.details && property.details[sectionId]) || {};
      return !filled(bag[fieldId]) && !filled(property[fieldId]);
    }

    // --- Année de construction : clé pour débloquer les diagnostics ---
    if (ctx.isLogement && ctx.year == null) {
      push(out, {
        id: "info_annee_construction",
        priority: 1,
        category: "info",
        title: "Renseigner l’année de construction",
        why: "Sans année, on ne peut pas trancher plomb (<1949), amiante (<1997), ni l’âge des installations.",
        action: "Localisation / Identification → Année de construction",
        sectionId: "localisation",
        fieldId: "annee_construction",
        status: "missing",
      });
    }

    // --- Surfaces ---
    if ((ctx.isAppart || ctx.type === "immeuble") && (ctx.transaction === "vente" || ctx.transaction === "location")) {
      if (!ctx.surfaceCarrez) {
        push(out, {
          id: "surface_carrez",
          priority: 1,
          category: "surface",
          title: "Surface loi Carrez",
          why: "Appartement / lot en copropriété : la surface Carrez est obligatoire en vente (et très utile en location).",
          action: "Surfaces → Surface Carrez (ou sur chaque lot en Composition)",
          sectionId: "surfaces",
          fieldId: "surface_carrez",
          docId: "carrez",
          status: "missing",
        });
      }
      if (!ctx.diagDone("carrez") && !ctx.docRecu("carrez")) {
        push(out, {
          id: "diag_carrez",
          priority: 1,
          category: "diagnostic",
          title: "Attestation / diagnostic loi Carrez",
          why: "Mesurage Carrez à joindre au dossier de vente (lots ≥ 8 m² en principe).",
          action: "Diagnostics → Carrez ou Pièces → Loi Carrez",
          sectionId: "diagnostics",
          fieldId: "carrez",
          docId: "carrez",
          status: "missing",
        });
      }
    }

    if (ctx.transaction === "location" && ctx.isLogement && !ctx.surfaceHab) {
      push(out, {
        id: "surface_boutin",
        priority: 1,
        category: "surface",
        title: "Surface habitable (loi Boutin)",
        why: "En location, la surface habitable doit figurer au bail.",
        action: "Surfaces → Surface habitable",
        sectionId: "surfaces",
        fieldId: "surface_habitable",
        status: "missing",
      });
    }

    if (ctx.isLogement && !ctx.surfaceHab && ctx.transaction === "vente") {
      push(out, {
        id: "surface_habitable",
        priority: 2,
        category: "surface",
        title: "Surface habitable",
        why: "Base d’annonce, estimation €/m² et cohérence avec Carrez.",
        action: "Surfaces → Surface habitable",
        sectionId: "surfaces",
        fieldId: "surface_habitable",
        status: "missing",
      });
    }

    // --- DPE ---
    if (ctx.type !== "terrain" && ctx.type !== "parking" && !ctx.diagDone("dpe") && !ctx.docRecu("dpe")) {
      push(out, {
        id: "diag_dpe",
        priority: 1,
        category: "diagnostic",
        title: "DPE (Diagnostic de performance énergétique)",
        why: "Obligatoire pour presque tous les logements en vente et en location (validité 10 ans).",
        action: "Diagnostics → DPE",
        sectionId: "diagnostics",
        fieldId: "dpe",
        docId: "dpe",
        status: "missing",
      });
    }

    // --- ERP ---
    if (!ctx.diagDone("erp") && !ctx.docRecu("erp")) {
      push(out, {
        id: "diag_erp",
        priority: 1,
        category: "diagnostic",
        title: "ERP — État des Risques et Pollutions",
        why: "À fournir à l’acquéreur / locataire (validité courte, ~6 mois).",
        action: "Diagnostics → ERP",
        sectionId: "diagnostics",
        fieldId: "erp",
        docId: "erp",
        status: "missing",
      });
    }

    // --- Plomb ---
    if (ctx.isLogement && (ctx.year == null || ctx.year < 1949)) {
      var plombStatus = ctx.diagDone("plomb") || ctx.docRecu("plomb") ? "done" : "missing";
      if (plombStatus === "missing") {
        push(out, {
          id: "diag_plomb",
          priority: ctx.year != null && ctx.year < 1949 ? 1 : 2,
          category: "diagnostic",
          title: "CREP — Constat de risque d’exposition au plomb",
          why:
            ctx.year != null && ctx.year < 1949
              ? "Construction " + ctx.year + " (< 1er janv. 1949) → CREP obligatoire pour un logement."
              : "Si le bâti est antérieur à 1949, le CREP (plomb) est obligatoire.",
          action: "Diagnostics → Plomb",
          sectionId: "diagnostics",
          fieldId: "plomb",
          docId: "plomb",
          status: "missing",
        });
      }
    }

    // --- Amiante ---
    if (
      ["appartement", "maison", "immeuble", "local", "complexe"].indexOf(ctx.type) >= 0 &&
      (ctx.year == null || ctx.year < 1997)
    ) {
      if (!ctx.diagDone("amiante") && !ctx.docRecu("amiante")) {
        push(out, {
          id: "diag_amiante",
          priority: ctx.year != null && ctx.year < 1997 ? 1 : 2,
          category: "diagnostic",
          title: "Diagnostic amiante",
          why:
            ctx.year != null && ctx.year < 1997
              ? "Permis / bâti avant le 1er juillet 1997 → amiante à vérifier (vente)."
              : "Si construction avant juillet 1997, le repérage amiante est requis en vente.",
          action: "Diagnostics → Amiante",
          sectionId: "diagnostics",
          fieldId: "amiante",
          docId: "amiante",
          status: "missing",
        });
      }
    }

    // --- Gaz ---
    if (ctx.isLogement) {
      var gazNeeded =
        ctx.hasGaz ||
        (ctx.ageGaz != null && ctx.ageGaz > 15) ||
        (ctx.year != null && ctx.age != null && ctx.age > 15 && /gaz/.test(String(ctx.interieur.chauffage || "").toLowerCase()));
      if (ctx.ageGaz != null && ctx.ageGaz > 15) gazNeeded = true;
      if (ctx.hasGaz && ctx.ageGaz == null) {
        push(out, {
          id: "info_annee_gaz",
          priority: 2,
          category: "info",
          title: "Année d’installation gaz",
          why: "Chauffage / alimentation gaz détecté : l’âge (> 15 ans) déclenche le diagnostic gaz.",
          action: "Diagnostics → Année installation gaz",
          sectionId: "diagnostics",
          fieldId: "annee_installation_gaz",
          status: "missing",
        });
      }
      if ((gazNeeded || (ctx.hasGaz && ctx.ageGaz == null)) && !ctx.diagDone("gaz") && !ctx.docRecu("gaz")) {
        push(out, {
          id: "diag_gaz",
          priority: ctx.ageGaz != null && ctx.ageGaz > 15 ? 1 : 2,
          category: "diagnostic",
          title: "Diagnostic gaz",
          why:
            ctx.ageGaz != null && ctx.ageGaz > 15
              ? "Installation gaz d’environ " + ctx.ageGaz + " ans (> 15 ans) → diagnostic obligatoire."
              : "Présence de gaz / chauffage gaz : vérifier si l’installation a plus de 15 ans.",
          action: "Diagnostics → Gaz",
          sectionId: "diagnostics",
          fieldId: "diag_gaz",
          docId: "gaz",
          status: "missing",
        });
      }
    }

    // --- Électricité ---
    if (ctx.isLogement) {
      if (ctx.ageElec == null && (ctx.hasElecHeat || ctx.age == null || (ctx.age != null && ctx.age > 15))) {
        push(out, {
          id: "info_annee_elec",
          priority: 3,
          category: "info",
          title: "Année d’installation électrique",
          why: "Si l’installation électrique a plus de 15 ans, le diagnostic électricité est obligatoire.",
          action: "Diagnostics → Année installation électrique",
          sectionId: "diagnostics",
          fieldId: "annee_installation_elec",
          status: "missing",
        });
      }
      if (
        ((ctx.ageElec != null && ctx.ageElec > 15) ||
          (ctx.year != null && ctx.age != null && ctx.age > 15 && ctx.ageElec == null) ||
          (ctx.year == null && ctx.ageElec == null)) &&
        !ctx.diagDone("elec") &&
        !ctx.docRecu("elec")
      ) {
        push(out, {
          id: "diag_elec",
          priority: ctx.ageElec != null && ctx.ageElec > 15 ? 1 : ctx.year == null ? 2 : 2,
          category: "diagnostic",
          title: "Diagnostic électricité",
          why:
            ctx.ageElec != null && ctx.ageElec > 15
              ? "Installation électrique ~" + ctx.ageElec + " ans (> 15 ans)."
              : "Contrôler si l’installation électrique a plus de 15 ans (souvent le cas sur bâti ancien).",
          action: "Diagnostics → Électricité",
          sectionId: "diagnostics",
          fieldId: "diag_elec",
          docId: "elec",
          status: "missing",
        });
      }
    }

    // --- Termites / mérule (zones) ---
    if (["appartement", "maison", "immeuble", "terrain", "complexe"].indexOf(ctx.type) >= 0) {
      if (!ctx.diagDone("termites") && !ctx.docRecu("termites")) {
        push(out, {
          id: "diag_termites",
          priority: 2,
          category: "diagnostic",
          title: "État relatif aux termites",
          why: "Obligatoire dans les zones déclarées par arrêté préfectoral — à vérifier pour ce secteur.",
          action: "Diagnostics → Termites + vérifier arrêté local",
          sectionId: "diagnostics",
          fieldId: "termites",
          docId: "termites",
          status: "check",
        });
      }
      if (ctx.type === "maison" || ctx.type === "terrain") {
        push(out, {
          id: "diag_merule",
          priority: 3,
          category: "diagnostic",
          title: "Information mérule (si zone)",
          why: "Dans certains départements, une information sur le risque mérule est exigée.",
          action: "Vérifier la zone / noter dans Diagnostics",
          sectionId: "diagnostics",
          fieldId: "info_diagnostics",
          status: "check",
        });
      }
    }

    // --- Bruit aérien ---
    if (!ctx.docRecu("bruit") && !ctx.diagDone("bruit")) {
      push(out, {
        id: "diag_bruit",
        priority: 3,
        category: "diagnostic",
        title: "Nuisances sonores aériennes",
        why: "Si le bien est en zone de bruit d’aéroport (PEB), document à annexer.",
        action: "Pièces → Nuisance sonore aérienne",
        docId: "bruit",
        status: "check",
      });
    }

    // --- Assainissement ---
    if (ctx.type === "maison" || ctx.type === "terrain" || ctx.type === "complexe") {
      if (!ctx.docRecu("assain_col") && !ctx.docRecu("assain_non")) {
        push(out, {
          id: "doc_assainissement",
          priority: 2,
          category: "document",
          title: "Assainissement (collectif ou non collectif)",
          why: "Maison / terrain : justifier le mode d’assainissement (et conformité SPANC si ANC).",
          action: "Pièces → Assainissement",
          docId: "assain_non",
          status: "missing",
        });
      }
    }

    // --- Copropriété ---
    if (ctx.isCopro && ctx.transaction === "vente") {
      [
        { id: "reglement_copro", title: "Règlement de copropriété / EDD", p: 1 },
        { id: "pv_ag", title: "PV d’AG (3 derniers)", p: 1 },
        { id: "pre_etat_date", title: "Pré-état daté / état daté", p: 1 },
        { id: "appels_fonds", title: "Appels de fonds récents", p: 2 },
        { id: "decompte_charges", title: "Décompte des charges", p: 2 },
        { id: "carnet_entretien", title: "Carnet d’entretien", p: 2 },
        { id: "dta", title: "Fiche synthétique / DTA", p: 2 },
      ].forEach(function (x) {
        if (!ctx.docRecu(x.id)) {
          push(out, {
            id: "copro_" + x.id,
            priority: x.p,
            category: "copro",
            title: x.title,
            why: "Lot en copropriété : pièce standard du dossier de vente.",
            action: "Pièces → Copropriété",
            docId: x.id,
            status: "missing",
          });
        }
      });
    }

    // --- Location / bien loué ---
    if (ctx.transaction === "location" || ctx.hasRented) {
      [
        { id: "bail_doc", title: "Bail et avenants", p: 1 },
        { id: "mobilier", title: "Inventaire du mobilier (si meublé)", p: 2 },
        { id: "autorisation_visite", title: "Autorisation de visite du locataire", p: 2 },
      ].forEach(function (x) {
        if (!ctx.docRecu(x.id)) {
          push(out, {
            id: "loc_" + x.id,
            priority: x.p,
            category: "location",
            title: x.title,
            why: ctx.hasRented ? "Au moins un lot est loué." : "Transaction location.",
            action: "Pièces justificatives / Bail",
            docId: x.id,
            status: "missing",
          });
        }
      });
      push(out, {
        id: "loc_edl",
        priority: 2,
        category: "location",
        title: "État des lieux (entrée / sortie)",
        why: "Obligatoire en location — à préparer / archiver.",
        action: "Documents location / cloud",
        status: "check",
      });
    }

    // --- Titre / identité ---
    if (ctx.transaction === "vente") {
      if (!ctx.docRecu("titre")) {
        push(out, {
          id: "doc_titre",
          priority: 1,
          category: "document",
          title: "Titre de propriété",
          why: "Pièce centrale du dossier vendeur.",
          action: "Pièces → Titre de propriété",
          docId: "titre",
          status: "missing",
        });
      }
      if (!ctx.docRecu("taxe_fonc")) {
        push(out, {
          id: "doc_taxe_fonc",
          priority: 2,
          category: "document",
          title: "Taxe foncière",
          why: "Utile pour charges, estimation et dossier notaire.",
          action: "Pièces → Taxe foncière",
          docId: "taxe_fonc",
          status: "missing",
        });
      }
    }

    // --- Maison / urbanisme ---
    if (ctx.type === "maison" || ctx.type === "terrain" || ctx.type === "complexe") {
      if (!ctx.docRecu("cadastre") && !ctx.docRecu("plan_cad")) {
        push(out, {
          id: "doc_cadastre",
          priority: 2,
          category: "document",
          title: "Plan / extrait cadastral",
          why: "Terrain ou maison : repérage parcelle et contenance.",
          action: "Localisation (réfs cadastre) + Pièces",
          sectionId: "localisation",
          docId: "cadastre",
          status: "missing",
        });
      }
      if ((ctx.type === "terrain" || ctx.type === "complexe") && !ctx.docRecu("cu")) {
        push(out, {
          id: "doc_cu",
          priority: 1,
          category: "document",
          title: "Certificat d’urbanisme",
          why: "Terrain / projet : connaître constructibilité et servitudes.",
          action: "Pièces terrain → CU",
          docId: "cu",
          status: "missing",
        });
      }
    }

    // --- Piscine ---
    if (String(ctx.exterieur.piscine || "").toLowerCase() === "yes" || ctx.exterieur.piscine === true) {
      push(out, {
        id: "secu_piscine",
        priority: 2,
        category: "document",
        title: "Sécurité piscine (norme)",
        why: "Piscine enterrée : dispositif de sécurité conforme à prévoir / justifier.",
        action: "Extérieur / pièces techniques",
        sectionId: "exterieur",
        status: "check",
      });
    }

    // --- Chauffage collectif / chaudière ---
    if (/collectif|gaz|chaudi/.test(String(ctx.interieur.chauffage || "").toLowerCase())) {
      if (!ctx.docRecu("chaudiere")) {
        push(out, {
          id: "doc_chaudiere",
          priority: 3,
          category: "document",
          title: "Entretien chaudière / attestation",
          why: "Chauffage détecté : attestation d’entretien annuelle utile (surtout location).",
          action: "Pièces → Entretien chaudière",
          docId: "chaudiere",
          status: "check",
        });
      }
    }

    // --- Classe DPE F/G (si renseignée) ---
    var classe = String(
      d.classe_dpe || d.dpe_classe || d.etiquette_dpe || d.conso_energie_primaire || d.conso_energie_finale || ""
    ).toUpperCase();
    if (/^[FG]$/.test(classe)) {
      push(out, {
        id: "dpe_passoire",
        priority: 1,
        category: "diagnostic",
        title: "Passoire énergétique (DPE " + classe + ")",
        why: "Location progressive interdite / obligations renforcées — anticiper travaux, audit et discours vendeur.",
        action: "Compléter Diagnostics / plan travaux",
        sectionId: "diagnostics",
        status: "check",
      });
      if (ctx.transaction === "vente" && (ctx.type === "maison" || (ctx.surfaceHab != null && ctx.surfaceHab >= 50))) {
        push(out, {
          id: "audit_energetique",
          priority: 1,
          category: "diagnostic",
          title: "Audit énergétique",
          why: "Souvent exigé en vente pour les passoires (maison ou logement ≥ 50 m² selon cas).",
          action: "Diagnostics → Date audit énergétique",
          sectionId: "diagnostics",
          fieldId: "date_audit_energetique",
          status: filled(d.date_audit_energetique) ? "done" : "missing",
        });
      }
    }

    // --- Construction récente : DO / décennale ---
    if (ctx.year != null && ctx.age != null && ctx.age <= 10 && (ctx.type === "maison" || ctx.type === "immeuble")) {
      if (!ctx.docRecu("dommage") && !ctx.docRecu("conformite")) {
        push(out, {
          id: "doc_do_decennale",
          priority: 2,
          category: "document",
          title: "Dommage-ouvrage / conformité / décennale",
          why: "Construction ~" + ctx.year + " (moins de 10 ans) : garanties constructeur à récupérer.",
          action: "Pièces maison → DO / conformité",
          docId: "dommage",
          status: "missing",
        });
      }
    }

    // --- Prix / loyer / pièces ---
    if (ctx.transaction === "vente" && !filled(property.price) && missField("finances", "prix_net") && missField("finances", "prix_fai")) {
      push(out, {
        id: "info_prix",
        priority: 1,
        category: "info",
        title: "Prix de vente",
        why: "Sans prix, l’annonce et le mandat restent incomplets.",
        action: "Aspects financiers → Prix",
        sectionId: "finances",
        fieldId: "prix_net",
        status: "missing",
      });
    }
    if (ctx.transaction === "location" && missField("finances", "loyer_hc") && missField("bail", "loyer_actuel") && !filled(property.price)) {
      push(out, {
        id: "info_loyer",
        priority: 1,
        category: "info",
        title: "Loyer hors charges",
        why: "Location : le loyer HC est indispensable au bail et à l’annonce.",
        action: "Finances / Bail → Loyer",
        sectionId: "finances",
        fieldId: "loyer_hc",
        status: "missing",
      });
    }
    if (ctx.isLogement && missField("surfaces", "nb_pieces") && !filled(property.rooms)) {
      push(out, {
        id: "info_nb_pieces",
        priority: 2,
        category: "info",
        title: "Nombre de pièces",
        why: "Critère d’annonce et de matching acquéreur / locataire.",
        action: "Surfaces → Nombre de pièces",
        sectionId: "surfaces",
        fieldId: "nb_pieces",
        status: "missing",
      });
    }
    if (
      (ctx.type === "maison" || ctx.type === "terrain" || ctx.type === "complexe") &&
      missField("surfaces", "surface_terrain") &&
      !filled(property.land_m2)
    ) {
      push(out, {
        id: "surface_terrain",
        priority: 2,
        category: "surface",
        title: "Surface du terrain",
        why: "Maison / terrain : surface parcelle attendue (annonce + estimation).",
        action: "Surfaces → Surface terrain",
        sectionId: "surfaces",
        fieldId: "surface_terrain",
        status: "missing",
      });
    }

    // --- Mandat ---
    if (missField("mandat", "n_mandat") && missField("mandat", "date_mandat")) {
      push(out, {
        id: "info_mandat",
        priority: 2,
        category: "info",
        title: "Références de mandat",
        why: "N° et date de mandat sécurisent la commercialisation et le suivi.",
        action: "Mandat → N° / date",
        sectionId: "mandat",
        fieldId: "n_mandat",
        status: "missing",
      });
    }

    // --- Copro : syndic / tantièmes (champs) ---
    if (ctx.isCopro) {
      if (missField("copropriete", "syndic") && missField("mandat", "syndic_mandat")) {
        push(out, {
          id: "info_syndic",
          priority: 2,
          category: "copro",
          title: "Coordonnées du syndic",
          why: "Nécessaire pour pré-état daté, charges et accès parties communes.",
          action: "Copropriété → Syndic",
          sectionId: "copropriete",
          fieldId: "syndic",
          status: "missing",
        });
      }
      if (missField("copropriete", "tantiemes") && missField("mandat", "tantiemes_mandat")) {
        push(out, {
          id: "info_tantiemes",
          priority: 3,
          category: "copro",
          title: "Tantièmes",
          why: "Utile pour charges, quote-part travaux et état daté.",
          action: "Copropriété → Tantièmes",
          sectionId: "copropriete",
          fieldId: "tantiemes",
          status: "missing",
        });
      }
    }

    // --- Location : zone tendue / encadrement ---
    if (ctx.transaction === "location" && ctx.isLogement) {
      var bail = (property.details && property.details.bail) || {};
      if (!filled(bail.zone_tendue) || bail.zone_tendue === "any") {
        push(out, {
          id: "loc_zone_tendue",
          priority: 3,
          category: "location",
          title: "Zone tendue / encadrement des loyers",
          why: "Selon la commune : préavis, complément de loyer, affichage encadrement.",
          action: "Bail → Zone tendue / encadrement",
          sectionId: "bail",
          fieldId: "zone_tendue",
          status: "check",
        });
      }
      if (!ctx.docRecu("identite")) {
        push(out, {
          id: "loc_identite_bailleur",
          priority: 2,
          category: "document",
          title: "Justificatif d’identité (bailleur)",
          why: "Dossier location / signature bail.",
          action: "Pièces → Identité",
          docId: "identite",
          status: "missing",
        });
      }
    }

    // --- Local pro ---
    if (ctx.type === "local") {
      push(out, {
        id: "local_bail_com",
        priority: 2,
        category: "info",
        title: "Bail commercial / professionnel",
        why: "Local pro : préciser destination, surface utile et type de bail.",
        action: "Bail / Surfaces utiles",
        sectionId: "bail",
        status: "check",
      });
      if (!ctx.surfaceHab && missField("surfaces", "surface_utile")) {
        push(out, {
          id: "local_surface_utile",
          priority: 1,
          category: "surface",
          title: "Surface utile (local)",
          why: "Base de loyer / prix au m² pour un local.",
          action: "Surfaces → Surface utile",
          sectionId: "surfaces",
          fieldId: "surface_utile",
          status: "missing",
        });
      }
    }

    // --- Parasitaire (complément termites) ---
    if (ctx.isLogement && !ctx.diagDone("termites") && !filled(d.parasitaire) && d.parasitaire !== "yes") {
      /* déjà couvert termites — suggestion info si maison bois / humidité */
      if (ctx.type === "maison") {
        push(out, {
          id: "diag_parasite_info",
          priority: 3,
          category: "diagnostic",
          title: "Diagnostic parasitaire élargi",
          why: "Maison : au-delà des termites, utile si humidité / zone à risque (mérule, etc.).",
          action: "Diagnostics → Parasitaire",
          sectionId: "diagnostics",
          fieldId: "parasitaire",
          docId: "parasite",
          status: "check",
        });
      }
    }

    // --- Adresse ---
    if (missField("localisation", "ville") && !filled(property.city)) {
      push(out, {
        id: "info_adresse",
        priority: 1,
        category: "info",
        title: "Adresse / ville",
        why: "Localisation minimale pour ERP, annonce et matching.",
        action: "Localisation",
        sectionId: "localisation",
        fieldId: "ville",
        status: "missing",
      });
    }

    // --- Photos / annonce ---
    if (!Array.isArray(property.images) || property.images.length < 3) {
      push(out, {
        id: "media_photos",
        priority: 3,
        category: "info",
        title: "Photos du bien (≥ 3)",
        why: "Annonce et dossier commercial : viser plusieurs vues (pièces, extérieurs, parties communes).",
        action: "Onglet Images",
        status: "missing",
      });
    }

    // Filtrer les "done"
    out = out.filter(function (s) {
      return s.status !== "done";
    });

    out.sort(function (a, b) {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return String(a.title).localeCompare(String(b.title), "fr");
    });
    return out;
  }

  function summary(property) {
    var all = collectSuggestions(property);
    var open = all.filter(function (s) {
      return s.status !== "done";
    });
    var crit = open.filter(function (s) {
      return s.priority === 1;
    }).length;
    var imp = open.filter(function (s) {
      return s.priority === 2;
    }).length;
    return {
      total: open.length,
      critique: crit,
      important: imp,
      recommande: open.filter(function (s) {
        return s.priority >= 3;
      }).length,
      items: open,
    };
  }

  /** Pour la checklist docs : un doc est « suggéré requis » si une suggestion critique/importante le pointe. */
  function isDocSuggestedRequired(docId, property) {
    var items = collectSuggestions(property);
    return items.some(function (s) {
      return s.docId === docId && s.priority <= 2 && s.status !== "done";
    });
  }

  function priorityLabel(p) {
    if (p === 1) return "Critique";
    if (p === 2) return "Important";
    if (p === 3) return "Recommandé";
    return "Info";
  }

  function renderPanelHtml(property, opts) {
    opts = opts || {};
    var sum = summary(property);
    var limit = opts.limit || 12;
    var items = sum.items.slice(0, limit);
    if (!items.length) {
      return (
        '<div class="immo-suggest-panel is-ok">' +
        "<strong>Suggestions</strong>" +
        "<p>Rien d’urgent : les infos clés semblent couvertes. Complétez l’année de construction si besoin pour affiner.</p>" +
        "</div>"
      );
    }
    var html =
      '<div class="immo-suggest-panel">' +
      '<div class="immo-suggest-head"><strong>Suggestions prioritaires</strong>' +
      '<span class="immo-suggest-counts">' +
      sum.critique +
      " critique(s) · " +
      sum.important +
      " important(s) · " +
      sum.total +
      " au total</span></div>" +
      "<p class=\"immo-suggest-intro\">Calculées selon type de bien, transaction, année, occupation, chauffage…</p>" +
      '<ul class="immo-suggest-list">';
    items.forEach(function (s) {
      html +=
        '<li class="immo-suggest-item prio-' +
        s.priority +
        '" data-suggest="' +
        s.id +
        '"' +
        (s.sectionId ? ' data-section="' + s.sectionId + '"' : "") +
        ">" +
        '<span class="immo-suggest-badge">' +
        priorityLabel(s.priority) +
        "</span>" +
        "<div><strong>" +
        s.title +
        "</strong>" +
        "<p class=\"why\">" +
        s.why +
        "</p>" +
        "<p class=\"action\">→ " +
        s.action +
        "</p></div></li>";
    });
    html += "</ul></div>";
    return html;
  }

  return {
    YEAR_NOW: YEAR_NOW,
    buildContext: buildContext,
    collectSuggestions: collectSuggestions,
    summary: summary,
    isDocSuggestedRequired: isDocSuggestedRequired,
    priorityLabel: priorityLabel,
    renderPanelHtml: renderPanelHtml,
  };
});
