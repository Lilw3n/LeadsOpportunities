/**
 * Relations entre personnes + quote-parts immobilières.
 * Parrainage = apporteur d’affaires. Aucune rémunération n’est jamais promise.
 * Utilisable navigateur + Node.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.CrmPeopleRelations = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var NO_PROMISE =
    "Aucune rémunération n'est promise à l'avance aux apporteurs d'affaires. Si le dossier est mené jusqu'à sa conclusion (signature, déblocage ou contrat effectif), une reconnaissance pourra éventuellement être étudiée — sans engagement préalable.";

  var APPORTEUR_TAGLINE =
    "Orientez un projet immobilier, une assurance ou un financement : nous accompagnons votre contact de A à Z.";

  var APPORTEUR_COMPLETION =
    "Rien n'est garanti à l'avance. En revanche, lorsqu'un dossier aboutit vraiment (acte notarié, prêt débloqué, contrat signé), une reconnaissance peut être étudiée au cas par cas.";

  var PROMISE_KEY_RE =
    /promis|promise|reward|cadeau|gift|bonus_apporteur|commission_promise|remuneration_promise|recompense/i;

  var REL_TYPES = [
    { id: "conjoint", label: "Conjoint(e)", fromLabel: "Conjoint(e) de", toLabel: "Conjoint(e) de", group: "famille", symmetric: true },
    { id: "pacs", label: "Partenaire Pacs", fromLabel: "Pacsé(e) avec", toLabel: "Pacsé(e) avec", group: "famille", symmetric: true },
    { id: "union_libre", label: "Union libre", fromLabel: "En union libre avec", toLabel: "En union libre avec", group: "famille", symmetric: true },
    { id: "ex_conjoint", label: "Ex-conjoint(e)", fromLabel: "Ex-conjoint(e) de", toLabel: "Ex-conjoint(e) de", group: "famille", symmetric: true },
    { id: "enfant", label: "Enfant", fromLabel: "Enfant de", toLabel: "Parent de", group: "famille", symmetric: false },
    { id: "parent", label: "Parent", fromLabel: "Parent de", toLabel: "Enfant de", group: "famille", symmetric: false },
    { id: "frere_soeur", label: "Frère / sœur", fromLabel: "Frère ou sœur de", toLabel: "Frère ou sœur de", group: "famille", symmetric: true },
    { id: "heritier", label: "Héritier", fromLabel: "Héritier de", toLabel: "Succession ouverte envers", group: "patrimoine", symmetric: false },
    { id: "associe", label: "Associé (SCI / société)", fromLabel: "Associé de", toLabel: "Associé de", group: "societe", symmetric: true },
    { id: "parrainage", label: "Parrainage (apporteur)", fromLabel: "Parrainé par", toLabel: "A orienté (filleul)", group: "parrainage", symmetric: false },
  ];

  var MARITAL_STATUSES = [
    { id: "celibataire", label: "Célibataire" },
    { id: "marie", label: "Marié(e)" },
    { id: "pacse", label: "Pacsé(e)" },
    { id: "union_libre", label: "Union libre" },
    { id: "divorce", label: "Divorcé(e)" },
    { id: "separe", label: "Séparé(e)" },
    { id: "veuf", label: "Veuf / veuve" },
  ];

  var LEGAL_FORMS = [
    { id: "personne_physique", label: "Personne physique" },
    { id: "sci", label: "SCI" },
    { id: "indivision", label: "Indivision" },
    { id: "societe", label: "Société (autre)" },
    { id: "autre", label: "Autre" },
  ];

  var CAPACITIES = [
    { id: "plein", label: "Pleine propriété" },
    { id: "usufruit", label: "Usufruit" },
    { id: "nue_propriete", label: "Nue-propriété" },
    { id: "heritier", label: "Héritier (parts successorales)" },
    { id: "associe", label: "Associé (parts sociales)" },
    { id: "mandataire", label: "Mandataire / représentant" },
  ];

  var EXTRA_PARTY_ROLES = [
    { id: "heritier", label: "Héritier" },
    { id: "associe_sci", label: "Associé SCI" },
    { id: "usufruitier", label: "Usufruitier" },
    { id: "nu_proprietaire", label: "Nu-propriétaire" },
  ];

  var OWNERSHIP_ROLE_IDS = [
    "vendeur",
    "mandant",
    "heritier",
    "associe_sci",
    "usufruitier",
    "nu_proprietaire",
    "colocataire",
  ];

  function idsOf(list) {
    return list.map(function (x) {
      return x.id;
    });
  }

  function findById(list, id) {
    var key = String(id || "");
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === key) return list[i];
    }
    return null;
  }

  function isForbiddenKey(key) {
    return PROMISE_KEY_RE.test(String(key || ""));
  }

  function stripPromises(input) {
    if (input == null) return input;
    if (Array.isArray(input)) {
      return input.map(stripPromises);
    }
    if (typeof input !== "object") return input;
    var out = {};
    Object.keys(input).forEach(function (k) {
      if (isForbiddenKey(k)) return;
      out[k] = stripPromises(input[k]);
    });
    return out;
  }

  function hasForbiddenPromise(input) {
    if (input == null) return false;
    if (Array.isArray(input)) {
      return input.some(hasForbiddenPromise);
    }
    if (typeof input !== "object") return false;
    var keys = Object.keys(input);
    for (var i = 0; i < keys.length; i++) {
      if (isForbiddenKey(keys[i])) return true;
      if (hasForbiddenPromise(input[keys[i]])) return true;
    }
    return false;
  }

  function normalizeRelType(id) {
    return findById(REL_TYPES, id) ? String(id) : "";
  }

  function normalizeMarital(id) {
    return findById(MARITAL_STATUSES, id) ? String(id) : "";
  }

  function normalizeLegalForm(id) {
    return findById(LEGAL_FORMS, id) ? String(id) : "personne_physique";
  }

  function normalizeCapacity(id) {
    return findById(CAPACITIES, id) ? String(id) : "plein";
  }

  function parseShare(v) {
    if (v == null || v === "") return null;
    var n = Number(v);
    if (!isFinite(n)) return null;
    if (n < 0) n = 0;
    if (n > 100) n = 100;
    return Math.round(n * 100) / 100;
  }

  function normalizeRelationship(input) {
    var o = stripPromises(input || {});
    var relType = normalizeRelType(o.rel_type);
    if (!relType) {
      throw new Error("Type de relation inconnu");
    }
    var fromId = String(o.from_contact_id || "").trim();
    var toId = String(o.to_contact_id || "").trim();
    if (!fromId || !toId) {
      throw new Error("Les deux contacts sont requis");
    }
    if (fromId === toId) {
      throw new Error("Une personne ne peut pas être liée à elle-même");
    }
    return {
      id: String(o.id || "").trim(),
      from_contact_id: fromId,
      to_contact_id: toId,
      rel_type: relType,
      notes: String(o.notes || "").trim(),
    };
  }

  function normalizeParty(input) {
    var o = stripPromises(input || {});
    return {
      id: String(o.id || "").trim(),
      property_id: String(o.property_id || "").trim(),
      contact_id: o.contact_id ? String(o.contact_id).trim() : null,
      role: String(o.role || "prospect").trim() || "prospect",
      name: String(o.name || "").trim(),
      email: String(o.email || "").trim(),
      phone: String(o.phone || "").trim(),
      notes: String(o.notes || "").trim(),
      share_pct: parseShare(o.share_pct),
      legal_form: o.legal_form ? normalizeLegalForm(o.legal_form) : "",
      capacity: o.capacity ? normalizeCapacity(o.capacity) : "",
      entity_name: String(o.entity_name || "").trim(),
    };
  }

  function isOwnershipRole(role) {
    return OWNERSHIP_ROLE_IDS.indexOf(String(role || "")) !== -1;
  }

  function ownershipShareTotal(parties) {
    var list = Array.isArray(parties) ? parties : [];
    var sum = 0;
    var counted = 0;
    list.forEach(function (p) {
      if (!isOwnershipRole(p && p.role)) return;
      if (p.share_pct == null || p.share_pct === "") return;
      sum += Number(p.share_pct) || 0;
      counted++;
    });
    sum = Math.round(sum * 100) / 100;
    var ok = counted === 0 || Math.abs(sum - 100) < 0.051;
    return {
      sum: sum,
      counted: counted,
      ok: ok,
      warning: ok
        ? ""
        : "Les quote-parts propriétaires totalisent " +
          sum +
          " % (attendu 100 % pour SCI, indivision, héritiers).",
    };
  }

  function describeRelation(rel, viewerId) {
    var def = findById(REL_TYPES, rel && rel.rel_type);
    if (!def) return { label: "Relation", otherId: "", direction: "" };
    var fromId = rel.from_contact_id;
    var toId = rel.to_contact_id;
    if (String(viewerId) === String(fromId)) {
      return {
        label: def.fromLabel,
        otherId: toId,
        direction: "outgoing",
        group: def.group,
        isParrainage: def.id === "parrainage",
      };
    }
    return {
      label: def.toLabel,
      otherId: fromId,
      direction: "incoming",
      group: def.group,
      isParrainage: def.id === "parrainage",
    };
  }

  function relTypeLabel(id) {
    var d = findById(REL_TYPES, id);
    return d ? d.label : id || "";
  }

  function maritalLabel(id) {
    var d = findById(MARITAL_STATUSES, id);
    return d ? d.label : id || "—";
  }

  function legalFormLabel(id) {
    var d = findById(LEGAL_FORMS, id);
    return d ? d.label : id || "";
  }

  function capacityLabel(id) {
    var d = findById(CAPACITIES, id);
    return d ? d.label : id || "";
  }

  function optionsHtml(list, selected) {
    return list
      .map(function (x) {
        return (
          '<option value="' +
          x.id +
          '"' +
          (x.id === selected ? " selected" : "") +
          ">" +
          x.label +
          "</option>"
        );
      })
      .join("");
  }

  return {
    NO_PROMISE: NO_PROMISE,
    APPORTEUR_TAGLINE: APPORTEUR_TAGLINE,
    APPORTEUR_COMPLETION: APPORTEUR_COMPLETION,
    REL_TYPES: REL_TYPES,
    MARITAL_STATUSES: MARITAL_STATUSES,
    LEGAL_FORMS: LEGAL_FORMS,
    CAPACITIES: CAPACITIES,
    EXTRA_PARTY_ROLES: EXTRA_PARTY_ROLES,
    OWNERSHIP_ROLE_IDS: OWNERSHIP_ROLE_IDS,
    stripPromises: stripPromises,
    hasForbiddenPromise: hasForbiddenPromise,
    normalizeRelationship: normalizeRelationship,
    normalizeParty: normalizeParty,
    normalizeRelType: normalizeRelType,
    normalizeMarital: normalizeMarital,
    normalizeLegalForm: normalizeLegalForm,
    normalizeCapacity: normalizeCapacity,
    parseShare: parseShare,
    isOwnershipRole: isOwnershipRole,
    ownershipShareTotal: ownershipShareTotal,
    describeRelation: describeRelation,
    relTypeLabel: relTypeLabel,
    maritalLabel: maritalLabel,
    legalFormLabel: legalFormLabel,
    capacityLabel: capacityLabel,
    optionsHtml: optionsHtml,
    idsOf: idsOf,
    findById: findById,
  };
});
