/**
 * Ops immo : seed création, pipeline location (dossier/visite/bail/rémunération),
 * estimation + mandat personnel (formulaire → PDF).
 */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CrmImmoOps = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  "use strict";

  function uid(prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
  }

  function num(v) {
    if (v == null || v === "") return 0;
    var n = Number(String(v).replace(",", ".").replace(/\s/g, ""));
    return isNaN(n) ? 0 : n;
  }

  function round2(n) {
    return Math.round(num(n) * 100) / 100;
  }

  function emptyDossier(extra) {
    return Object.assign(
      {
        id: uid("dos"),
        candidat_nom: "",
        candidat_prenom: "",
        candidat_tel: "",
        candidat_email: "",
        revenus_mensuels: "",
        garant: "",
        statut: "a_completer",
        pieces: {
          piece_identite: false,
          justificatif_domicile: false,
          contrat_travail: false,
          avis_imposition: false,
          bulletins_salaire: false,
          garant_id: false,
        },
        notes: "",
        created_at: new Date().toISOString(),
      },
      extra || {}
    );
  }

  function emptyVisite(extra) {
    return Object.assign(
      {
        id: uid("vis"),
        date: "",
        heure: "",
        dossier_id: "",
        unit_id: "",
        statut: "planifiee",
        present: false,
        notes: "",
        created_at: new Date().toISOString(),
      },
      extra || {}
    );
  }

  function emptyBail(extra) {
    return Object.assign(
      {
        id: uid("bail"),
        dossier_id: "",
        unit_id: "",
        type_bail: "Nu (loi 89)",
        date_debut: "",
        date_fin: "",
        loyer_hc: "",
        charges: "",
        depot_garantie: "",
        statut: "brouillon",
        notes: "",
        created_at: new Date().toISOString(),
      },
      extra || {}
    );
  }

  function normalizeLocationOps(raw) {
    var o = raw && typeof raw === "object" ? Object.assign({}, raw) : {};
    o.dossiers = Array.isArray(o.dossiers) ? o.dossiers.map(function (d) { return emptyDossier(d); }) : [];
    o.visites = Array.isArray(o.visites) ? o.visites.map(function (v) { return emptyVisite(v); }) : [];
    o.baux = Array.isArray(o.baux) ? o.baux.map(function (b) { return emptyBail(b); }) : [];
    o.remuneration = o.remuneration && typeof o.remuneration === "object" ? Object.assign({}, o.remuneration) : {};
    o.remuneration.zone = o.remuneration.zone || "hors";
    o.remuneration.surface_m2 = o.remuneration.surface_m2 != null ? o.remuneration.surface_m2 : "";
    o.remuneration.part_agent_pct = o.remuneration.part_agent_pct != null ? o.remuneration.part_agent_pct : 50;
    o.remuneration.notes = o.remuneration.notes || "";
    o.remuneration.override_ttc = o.remuneration.override_ttc != null ? o.remuneration.override_ttc : "";
    return o;
  }

  function dossierCompleteness(d) {
    d = emptyDossier(d || {});
    var keys = Object.keys(d.pieces || {});
    var ok = keys.filter(function (k) { return !!d.pieces[k]; }).length;
    return { total: keys.length, ok: ok, pct: keys.length ? Math.round((ok / keys.length) * 100) : 0 };
  }

  function computeLocationRemuneration(ops, Bareme) {
    ops = normalizeLocationOps(ops);
    var rem = ops.remuneration;
    var BaremeLib = Bareme || (root && root.BaremeHonorairesLib) || null;
    var surface = num(rem.surface_m2);
    var result = {
      ok: false,
      zone: rem.zone,
      surface_m2: surface,
      agence_ttc: 0,
      bailleur_ttc: 0,
      locataire_ttc: 0,
      agent_ttc: 0,
      part_agent_pct: num(rem.part_agent_pct) || 50,
      lines: null,
      source: "manual",
    };
    if (rem.override_ttc !== "" && rem.override_ttc != null) {
      result.ok = true;
      result.agence_ttc = round2(rem.override_ttc);
      result.source = "override";
    } else if (BaremeLib && BaremeLib.computeLocationHabitation && surface > 0) {
      var calc = BaremeLib.computeLocationHabitation(surface, rem.zone);
      if (calc && calc.ok) {
        result.ok = true;
        result.agence_ttc = calc.totalAgenceTtc;
        result.bailleur_ttc = calc.bailleurTtc;
        result.locataire_ttc = calc.locataireTtc;
        result.lines = calc.lines;
        result.source = "bareme";
      }
    }
    result.agent_ttc = round2(result.agence_ttc * (result.part_agent_pct / 100));
    return result;
  }

  function locationPipelineStats(ops) {
    ops = normalizeLocationOps(ops);
    return {
      dossiers: ops.dossiers.length,
      dossiers_ok: ops.dossiers.filter(function (d) {
        return d.statut === "valide" || dossierCompleteness(d).pct >= 80;
      }).length,
      visites: ops.visites.length,
      visites_faites: ops.visites.filter(function (v) {
        return v.statut === "faite" || v.present;
      }).length,
      baux: ops.baux.length,
      baux_signes: ops.baux.filter(function (b) {
        return b.statut === "signe" || b.statut === "actif";
      }).length,
    };
  }

  function emptyEstimationMandat(extra) {
    return Object.assign(
      {
        client_nom: "",
        client_prenom: "",
        client_tel: "",
        client_email: "",
        client_adresse: "",
        bien_adresse: "",
        bien_ville: "",
        bien_cp: "",
        bien_type: "appartement",
        bien_surface: "",
        bien_pieces: "",
        transaction: "vente",
        type_mandat: "simple",
        objet_mandat: "vente",
        valeur_estimee_basse: "",
        valeur_estimee: "",
        valeur_estimee_haute: "",
        prix_souhaite: "",
        loyer_estime: "",
        honoraires_mode: "pourcent",
        honoraires_pct: 5,
        honoraires_forfait: "",
        charge_honoraires: "vendeur",
        comparables: "",
        points_forts: "",
        points_faibles: "",
        recommandation: "",
        date_estimation: "",
        duree_mandat_mois: 3,
        notes_privees: "",
      },
      extra || {}
    );
  }

  function normalizeEstimationMandat(raw) {
    return emptyEstimationMandat(raw && typeof raw === "object" ? raw : {});
  }

  function computeMandatHonoraires(est) {
    est = normalizeEstimationMandat(est);
    var base =
      est.transaction === "location"
        ? num(est.loyer_estime) * 12
        : num(est.valeur_estimee) || num(est.prix_souhaite);
    var mode = est.honoraires_mode || "pourcent";
    var ttc = mode === "forfait" ? num(est.honoraires_forfait) : round2(base * (num(est.honoraires_pct) / 100));
    var ht = round2(ttc / 1.2);
    return {
      base: base,
      mode: mode,
      honoraires_ht: ht,
      honoraires_ttc: ttc,
      tva: round2(ttc - ht),
      charge: est.charge_honoraires || "vendeur",
    };
  }

  function seedUnitsForCreate(propertyType, transaction, Dossier) {
    var empty = function (type) {
      if (Dossier && Dossier.emptyUnit) return Dossier.emptyUnit(type);
      return {
        id: uid("unit"),
        type: type || "appartement",
        label: "",
        parent_id: null,
        transaction: transaction || "vente",
      };
    };
    var tx = transaction || "vente";
    var type = propertyType || "appartement";
    var units = [];

    if (type === "appartement" || type === "parking" || type === "local") {
      var u = empty(type === "parking" ? "dependance" : type === "local" ? "local" : "appartement");
      u.label = type === "appartement" ? "Lot principal" : type === "local" ? "Local" : "Parking";
      u.transaction = tx;
      if (tx === "location") u.occupation = "vide";
      units.push(u);
      return units;
    }
    if (type === "maison") {
      var terrain = empty("terrain");
      terrain.label = "Terrain / parcelle";
      var maison = empty("maison");
      maison.label = "Maison";
      maison.parent_id = terrain.id;
      maison.transaction = tx;
      if (tx === "location") maison.occupation = "vide";
      units.push(terrain, maison);
      return units;
    }
    if (type === "immeuble" || type === "complexe") {
      var foncier = empty("terrain");
      foncier.label = "Parcelle";
      var immeuble = empty("immeuble");
      immeuble.label = "Immeuble";
      immeuble.parent_id = foncier.id;
      var etage = empty("etage");
      etage.label = "RDC / 1er";
      etage.parent_id = immeuble.id;
      var apt = empty("appartement");
      apt.label = "Appartement 1";
      apt.parent_id = etage.id;
      apt.transaction = tx;
      if (tx === "location") apt.occupation = "vide";
      units.push(foncier, immeuble, etage, apt);
      return units;
    }
    if (type === "terrain") {
      var t = empty("terrain");
      t.label = "Parcelle";
      t.transaction = tx;
      units.push(t);
      return units;
    }
    var fallback = empty("appartement");
    fallback.label = "Lot";
    fallback.transaction = tx;
    units.push(fallback);
    return units;
  }

  function ensureLocationOpsOnProperty(prop) {
    prop = prop || {};
    if (!prop.details || typeof prop.details !== "object") prop.details = {};
    prop.details.location_ops = normalizeLocationOps(prop.details.location_ops);
    return prop.details.location_ops;
  }

  function ensureEstimationMandatOnProperty(prop) {
    prop = prop || {};
    if (!prop.details || typeof prop.details !== "object") prop.details = {};
    var base = prop.details.estimation_mandat || {};
    if (!base.bien_ville && prop.city) base.bien_ville = prop.city;
    if (!base.bien_cp && prop.postal_code) base.bien_cp = prop.postal_code;
    if (!base.bien_adresse && prop.address) base.bien_adresse = prop.address;
    if (!base.bien_type && prop.property_type) base.bien_type = prop.property_type;
    if (!base.bien_surface && prop.surface_m2) base.bien_surface = prop.surface_m2;
    if (!base.transaction && prop.transaction) base.transaction = prop.transaction;
    if (!base.valeur_estimee && prop.price_net) base.valeur_estimee = prop.price_net;
    if (!base.prix_souhaite && prop.price_fai) base.prix_souhaite = prop.price_fai;
    prop.details.estimation_mandat = normalizeEstimationMandat(base);
    return prop.details.estimation_mandat;
  }

  return {
    uid: uid,
    emptyDossier: emptyDossier,
    emptyVisite: emptyVisite,
    emptyBail: emptyBail,
    normalizeLocationOps: normalizeLocationOps,
    dossierCompleteness: dossierCompleteness,
    computeLocationRemuneration: computeLocationRemuneration,
    locationPipelineStats: locationPipelineStats,
    emptyEstimationMandat: emptyEstimationMandat,
    normalizeEstimationMandat: normalizeEstimationMandat,
    computeMandatHonoraires: computeMandatHonoraires,
    seedUnitsForCreate: seedUnitsForCreate,
    ensureLocationOpsOnProperty: ensureLocationOpsOnProperty,
    ensureEstimationMandatOnProperty: ensureEstimationMandatOnProperty,
    // aliases UI
    ensureLocationOpsOnProperty: ensureLocationOpsOnProperty,
    locationPipelineStats: locationPipelineStats,
    dossierCompleteness: dossierCompleteness,
    emptyDossier: emptyDossier,
    emptyVisite: emptyVisite,
    emptyBail: emptyBail,
    normalizeLocationOps: normalizeLocationOps,
    computeLocationRemuneration: computeLocationRemuneration,
    ensureEstimationMandatOnProperty: ensureEstimationMandatOnProperty,
    normalizeEstimationMandat: normalizeEstimationMandat,
    computeMandatHonoraires: computeMandatHonoraires,
    seedUnitsForCreate: seedUnitsForCreate,
  };
});
