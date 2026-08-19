/**
 * Normalisation propriétaires / mandants dossier vente (Drive + CRM parties).
 */
var ROLE_LABELS = {
  proprietaire: "Propriétaire",
  nu_proprietaire: "Nu-propriétaire",
  usufruitier: "Usufruitier",
  indivisaire: "Indivisaire / co-propriétaire",
  sci: "SCI / personne morale",
  associe_sci: "Associé SCI / société",
  mandataire: "Mandataire / représentant",
  heritier: "Héritier",
  autre: "Autre",
};

function str(v, max) {
  return String(v == null ? "" : v)
    .trim()
    .slice(0, max || 200);
}

function parseShare(v) {
  if (v == null || v === "") return null;
  var n = Number(v);
  if (!isFinite(n)) return null;
  if (n < 0) n = 0;
  if (n > 100) n = 100;
  return Math.round(n * 100) / 100;
}

function normalizeSellOwner(o, idx) {
  o = o || {};
  return {
    index: typeof idx === "number" ? idx : o.index,
    salutation: str(o.salutation, 8),
    firstName: str(o.firstName || o.first_name, 80),
    lastName: str(o.lastName || o.last_name, 80),
    role: str(o.role, 40) || "proprietaire",
    entityName: str(o.entityName || o.entity_name, 120),
    siret: str(o.siret, 20),
    sharePct: parseShare(o.sharePct != null ? o.sharePct : o.share_pct),
    legalForm: str(o.legalForm || o.legal_form, 40),
    phone: str(o.phone, 40),
    email: str(o.email, 120),
    address: str(o.address, 200),
    city: str(o.city, 80),
    postal: str(o.postal || o.postalCode, 10),
    mailRecipient: !!o.mailRecipient,
    sameAsContact: !!o.sameAsContact,
    sameAsPropertyAddress: !!o.sameAsPropertyAddress,
  };
}

function ownerFullName(owner) {
  owner = owner || {};
  return (str(owner.firstName) + " " + str(owner.lastName)).trim();
}

function isEnterpriseOwner(owner) {
  owner = normalizeSellOwner(owner);
  var role = owner.role;
  return !!(owner.entityName || role === "sci" || role === "associe_sci");
}

function enterpriseFolderName(owner) {
  owner = normalizeSellOwner(owner);
  if (owner.entityName) return "Entreprise_" + safeSegment(owner.entityName, 40);
  if (owner.role === "sci") {
    var name = ownerFullName(owner);
    if (name) return "Entreprise_" + safeSegment(name, 36);
    return "Entreprise_SCI";
  }
  if (owner.role === "associe_sci") return "Entreprise_Associe";
  return null;
}

function safeSegment(s, max) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, max || 48) || "sans_nom";
}

function ownerPartyRole(owner) {
  owner = normalizeSellOwner(owner);
  var map = {
    sci: "vendeur",
    proprietaire: "vendeur",
    nu_proprietaire: "nu_proprietaire",
    usufruitier: "usufruitier",
    indivisaire: "vendeur",
    associe_sci: "associe_sci",
    mandataire: "mandant",
    heritier: "heritier",
    autre: "vendeur",
  };
  return map[owner.role] || "vendeur";
}

function ownerPartyCapacity(owner) {
  owner = normalizeSellOwner(owner);
  var map = {
    nu_proprietaire: "nue_propriete",
    usufruitier: "usufruit",
    heritier: "heritier",
    associe_sci: "associe",
    mandataire: "mandataire",
    sci: "associe",
  };
  return map[owner.role] || "plein";
}

function ownerLegalForm(owner) {
  owner = normalizeSellOwner(owner);
  if (owner.legalForm) return owner.legalForm;
  if (owner.role === "sci" || owner.role === "associe_sci") return "sci";
  if (owner.role === "indivisaire") return "indivision";
  return "personne_physique";
}

function ownerPartyDisplayName(owner) {
  owner = normalizeSellOwner(owner);
  var person = ownerFullName(owner);
  if (owner.role === "sci" && owner.entityName) {
    return owner.entityName + (person ? " — " + person : "");
  }
  if (person) return person;
  if (owner.entityName) return owner.entityName;
  return "Mandant";
}

function ownerPartyNotes(owner) {
  owner = normalizeSellOwner(owner);
  var bits = [];
  if (ROLE_LABELS[owner.role]) bits.push(ROLE_LABELS[owner.role]);
  if (owner.entityName && owner.role !== "sci") bits.push("Structure : " + owner.entityName);
  if (owner.siret) bits.push("SIRET : " + owner.siret);
  if (owner.sharePct != null) bits.push("Quote-part : " + owner.sharePct + " %");
  if (owner.mailRecipient) bits.push("Destinataire courriers");
  return bits.join(" · ") || "Propriétaire / mandant (dossier vente)";
}

function normalizeOwnersList(owners, depositor) {
  owners = Array.isArray(owners) ? owners : [];
  var list = owners
    .map(function (o, idx) {
      var n = normalizeSellOwner(o, idx);
      if (!ownerFullName(n) && !n.entityName) return null;
      return n;
    })
    .filter(Boolean);

  if (!list.length && depositor) {
    var d = normalizeSellOwner(depositor, 0);
    if (ownerFullName(d)) {
      d.role = "deposant";
      list.push(d);
    }
  }
  if (!list.length) {
    list.push(normalizeSellOwner({ firstName: "Mandant", role: "inconnu" }, 0));
  }
  return list;
}

function enterprisesFromOwners(owners) {
  var map = {};
  (owners || []).forEach(function (raw) {
    var o = normalizeSellOwner(raw);
    var key = o.entityName || (o.role === "sci" ? ownerFullName(o) || "SCI" : "");
    if (!key) return;
    if (!map[key]) {
      map[key] = {
        name: o.entityName || key,
        siret: o.siret || "",
        legalForm: ownerLegalForm(o),
        associates: [],
      };
    }
    if (o.siret && !map[key].siret) map[key].siret = o.siret;
    var person = ownerFullName(o);
    if (person || o.role === "associe_sci" || o.role === "sci") {
      map[key].associates.push({
        name: person || ROLE_LABELS[o.role] || "Associé",
        role: o.role,
        sharePct: o.sharePct,
        phone: o.phone,
        email: o.email,
      });
    }
  });
  return Object.keys(map).map(function (k) {
    return map[k];
  });
}

module.exports = {
  ROLE_LABELS,
  normalizeSellOwner,
  normalizeOwnersList,
  ownerFullName,
  isEnterpriseOwner,
  enterpriseFolderName,
  ownerPartyRole,
  ownerPartyCapacity,
  ownerLegalForm,
  ownerPartyDisplayName,
  ownerPartyNotes,
  enterprisesFromOwners,
  safeSegment,
};
