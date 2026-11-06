/**
 * Interlocuteurs importants pour le suivi des dossiers (site + CRM).
 * Navigateur : window.CrmDossierInterlocutors  |  Node : module.exports
 */
(function (root) {
  var ROLES = [
    { id: "client", label: "Client / titulaire", group: "dossier", important: true },
    { id: "co_emprunteur", label: "Co-emprunteur / conjoint", group: "dossier", important: true },
    { id: "vendeur", label: "Vendeur", group: "immo", important: true },
    { id: "acheteur", label: "Acquéreur", group: "immo", important: true },
    { id: "apporteur", label: "Apporteur d’affaires", group: "reseau", important: true },
    { id: "conseiller", label: "Conseiller interne", group: "interne", important: true },
    { id: "negociateur", label: "Négociateur immo", group: "immo", important: true },
    { id: "banque", label: "Banque / prêteur", group: "finance", important: true },
    { id: "notaire", label: "Notaire", group: "immo", important: true },
    { id: "partenaire", label: "Partenaire assureur", group: "assurance", important: true },
    { id: "expert", label: "Expert / diagnostiqueur", group: "immo", important: false },
    { id: "gestionnaire", label: "Gestionnaire sinistre", group: "assurance", important: true },
    { id: "medecin", label: "Médecin-conseil (ADE)", group: "assurance", important: false },
    { id: "agence", label: "Agence immobilière", group: "immo", important: false },
    { id: "comptable", label: "Expert-comptable", group: "pro", important: false },
    { id: "autre", label: "Autre interlocuteur", group: "autre", important: false },
  ];

  var FOLLOW_UP = [
    { id: "pending", label: "À relancer" },
    { id: "waiting", label: "En attente de retour" },
    { id: "done", label: "Fait" },
  ];

  function roleById(id) {
    var key = String(id || "").trim();
    return (
      ROLES.filter(function (r) {
        return r.id === key;
      })[0] || ROLES[ROLES.length - 1]
    );
  }

  function normalizeOne(raw) {
    raw = raw || {};
    var role = roleById(raw.role || raw.kind || "autre");
    var name = String(raw.name || raw.fullName || "").trim();
    if (!name && (raw.firstName || raw.lastName)) {
      name = [raw.firstName, raw.lastName].filter(Boolean).join(" ").trim();
    }
    var follow = String(raw.followUp || raw.status || "pending");
    if (follow !== "waiting" && follow !== "done") follow = "pending";
    return {
      role: role.id,
      roleLabel: role.label,
      name: name,
      contactId: raw.contactId || raw.contact_id || "",
      phone: String(raw.phone || "").trim(),
      email: String(raw.email || "").trim(),
      company: String(raw.company || raw.organization || "").trim(),
      followUp: follow,
    };
  }

  function normalizeList(list) {
    if (!Array.isArray(list)) return [];
    return list
      .map(normalizeOne)
      .filter(function (x) {
        return x.name || x.contactId || x.phone || x.email;
      });
  }

  function nextFollowUp(id) {
    if (id === "pending") return "waiting";
    if (id === "waiting") return "done";
    return "pending";
  }

  function followUpLabel(id) {
    var hit = FOLLOW_UP.filter(function (f) {
      return f.id === id;
    })[0];
    return hit ? hit.label : "À relancer";
  }

  function importantRoles() {
    return ROLES.filter(function (r) {
      return r.important;
    });
  }

  function roleOptionsHtml(selected) {
    return ROLES.map(function (r) {
      return (
        '<option value="' +
        r.id +
        '"' +
        (selected === r.id ? " selected" : "") +
        ">" +
        r.label +
        "</option>"
      );
    }).join("");
  }

  var api = {
    ROLES: ROLES,
    FOLLOW_UP: FOLLOW_UP,
    roleById: roleById,
    normalizeOne: normalizeOne,
    normalizeList: normalizeList,
    nextFollowUp: nextFollowUp,
    followUpLabel: followUpLabel,
    importantRoles: importantRoles,
    roleOptionsHtml: roleOptionsHtml,
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CrmDossierInterlocutors = api;
})(typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : this);
