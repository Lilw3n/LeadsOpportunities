/**
 * Agrégation / dédoublonnage des utilisateurs contactables du marché immo.
 * Utilisable en Node (verify) et dans le navigateur (CRM).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.ImmoMarcheUsers = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var ROLE_LABELS = {
    acheteur: "Acquéreur",
    vendeur: "Vendeur",
    les_deux: "Vend + rachète",
    chasseur: "Chasseur / signalement",
    visiteur: "Visite virtuelle",
    contact: "Contact CRM",
    autre: "Autre",
  };

  var VERTICAL_ROLES = {
    acheteur_immo: "acheteur",
    vendeur_immo: "vendeur",
    acheteur_vendeur_immo: "les_deux",
    chasseur_immo: "chasseur",
    immobilier: "autre",
    immo: "autre",
  };

  function normEmail(v) {
    var e = String(v || "")
      .trim()
      .toLowerCase();
    if (!e || e.indexOf("@") < 1) return "";
    return e.slice(0, 320);
  }

  function normPhone(v) {
    var digits = String(v || "").replace(/\D/g, "");
    if (digits.length === 11 && digits.indexOf("33") === 0) digits = "0" + digits.slice(2);
    if (digits.length === 12 && digits.indexOf("330") === 0) digits = "0" + digits.slice(3);
    if (digits.length < 10) return "";
    return digits.slice(0, 15);
  }

  function displayPhone(digits) {
    var d = normPhone(digits);
    if (d.length === 10) {
      return d.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
    }
    return d;
  }

  function roleLabel(role) {
    return ROLE_LABELS[role] || ROLE_LABELS.autre;
  }

  function classifyPartyRole(role) {
    var r = String(role || "")
      .toLowerCase()
      .trim();
    if (/vendeur|seller|owner|proprio|bailleur/.test(r)) return "vendeur";
    if (/acqu|achet|buyer|locataire/.test(r)) return "acheteur";
    if (/chasse|signal/.test(r)) return "chasseur";
    if (/visit/.test(r)) return "visiteur";
    return "autre";
  }

  function classifyVertical(vertical) {
    var v = String(vertical || "")
      .toLowerCase()
      .trim();
    if (VERTICAL_ROLES[v]) return VERTICAL_ROLES[v];
    if (/vendeur/.test(v) && /achet|acqu/.test(v)) return "les_deux";
    if (/vendeur/.test(v)) return "vendeur";
    if (/achet|acqu/.test(v)) return "acheteur";
    if (/chasse/.test(v)) return "chasseur";
    if (/immo|bien|mandat|location|syndic/.test(v)) return "autre";
    return "";
  }

  function mergeRoles(a, b) {
    var set = {};
    [a, b].forEach(function (r) {
      String(r || "")
        .split(",")
        .map(function (x) {
          return x.trim();
        })
        .filter(Boolean)
        .forEach(function (x) {
          set[x] = true;
        });
    });
    var keys = Object.keys(set);
    if (set.les_deux || (set.acheteur && set.vendeur)) return "les_deux";
    if (keys.length === 1) return keys[0];
    if (keys.length > 1) return keys.sort().join(",");
    return "autre";
  }

  function dedupeKey(email, phone) {
    var e = normEmail(email);
    if (e) return "e:" + e;
    var p = normPhone(phone);
    if (p) return "p:" + p;
    return "";
  }

  function emptyUser(key) {
    return {
      id: key,
      email: "",
      phone: "",
      phone_display: "",
      name: "",
      roles: "autre",
      sources: [],
      cities: [],
      lead_ids: [],
      contact_ids: [],
      party_ids: [],
      tour_ids: [],
      criteria_ids: [],
      last_activity_at: null,
      notes: "",
      emailable: false,
      callable: false,
    };
  }

  function pushUnique(arr, value) {
    if (!value) return;
    if (arr.indexOf(value) === -1) arr.push(value);
  }

  function newerDate(a, b) {
    if (!a) return b || null;
    if (!b) return a;
    return new Date(a).getTime() >= new Date(b).getTime() ? a : b;
  }

  function ingest(map, raw) {
    var email = normEmail(raw.email);
    var phone = normPhone(raw.phone);
    var key = dedupeKey(email, phone);
    if (!key) return null;

    var u = map[key] || emptyUser(key);
    if (email) u.email = email;
    if (phone) {
      u.phone = phone;
      u.phone_display = displayPhone(phone);
    }
    if (raw.name && (!u.name || String(raw.name).length > u.name.length)) {
      u.name = String(raw.name).trim().slice(0, 160);
    }
    u.roles = mergeRoles(u.roles === "autre" ? "" : u.roles, raw.role || "");
    pushUnique(u.sources, raw.source);
    pushUnique(u.cities, raw.city && String(raw.city).trim());
    pushUnique(u.lead_ids, raw.lead_id);
    pushUnique(u.contact_ids, raw.contact_id);
    pushUnique(u.party_ids, raw.party_id);
    pushUnique(u.tour_ids, raw.tour_id);
    pushUnique(u.criteria_ids, raw.criteria_id);
    u.last_activity_at = newerDate(u.last_activity_at, raw.at || raw.updated_at || raw.created_at);
    if (raw.notes) {
      u.notes = (u.notes ? u.notes + " · " : "") + String(raw.notes).slice(0, 120);
      u.notes = u.notes.slice(0, 280);
    }
    u.emailable = !!u.email;
    u.callable = !!u.phone;
    map[key] = u;
    return u;
  }

  function fromParties(parties) {
    var out = [];
    (parties || []).forEach(function (p) {
      out.push({
        email: p.email,
        phone: p.phone,
        name: p.name || p.entity_name || "",
        role: classifyPartyRole(p.role),
        source: "party",
        party_id: p.id,
        contact_id: p.contact_id,
        at: p.updated_at || p.created_at,
        notes: p.role ? "Rôle bien: " + p.role : "",
      });
    });
    return out;
  }

  function fromCriteria(criteria, contactsById) {
    var out = [];
    (criteria || []).forEach(function (c) {
      var contact = (c.contact_id && contactsById && contactsById[c.contact_id]) || null;
      var cities = Array.isArray(c.cities)
        ? c.cities
        : Array.isArray(c.property_types)
          ? []
          : [];
      if (Array.isArray(c.cities_json)) cities = c.cities_json;
      out.push({
        email: contact && contact.email,
        phone: contact && contact.phone,
        name: contact
          ? [contact.first_name, contact.last_name].filter(Boolean).join(" ")
          : c.label || "",
        role: "acheteur",
        source: "criteria",
        criteria_id: c.id,
        contact_id: c.contact_id,
        lead_id: c.lead_id,
        city: (cities && cities[0]) || "",
        at: c.updated_at || c.created_at,
        notes: c.label || "Fiche recherche",
      });
    });
    return out;
  }

  function fromLeads(leads) {
    var out = [];
    (leads || []).forEach(function (l) {
      var role = classifyVertical(l.vertical || l.source);
      if (!role) return;
      var payload = l.payload;
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch (e) {
          payload = {};
        }
      }
      payload = payload || {};
      var name =
        [l.first_name, l.last_name].filter(Boolean).join(" ") ||
        [payload.firstName || payload.first_name, payload.lastName || payload.last_name]
          .filter(Boolean)
          .join(" ") ||
        payload.name ||
        "";
      out.push({
        email: l.email || payload.email,
        phone: l.phone || payload.phone,
        name: name,
        role: role,
        source: "lead",
        lead_id: l.id,
        contact_id: l.contact_id,
        city: l.city || payload.city || payload.ville || "",
        at: l.updated_at || l.created_at,
        notes: l.vertical || l.source || "",
      });
    });
    return out;
  }

  function fromTourRequests(rows) {
    var out = [];
    (rows || []).forEach(function (r) {
      out.push({
        email: r.email,
        phone: r.phone,
        name: r.first_name || "",
        role: "visiteur",
        source: "tour",
        tour_id: r.id,
        contact_id: r.contact_id,
        lead_id: r.lead_id,
        at: r.created_at || r.decided_at,
        notes: r.property_title || r.link_name || "Visite virtuelle",
      });
    });
    return out;
  }

  function fromContacts(contacts) {
    var out = [];
    (contacts || []).forEach(function (c) {
      var src = String(c.source || "").toLowerCase();
      var notes = String(c.notes || "").toLowerCase();
      var looksImmo =
        /immo|bien|mandat|acqu|vend|visite|pige/.test(src) ||
        /immo|bien|mandat|acqu|vend|visite|pige/.test(notes);
      if (!looksImmo) return;
      out.push({
        email: c.email,
        phone: c.phone,
        name: [c.first_name, c.last_name].filter(Boolean).join(" "),
        role: "contact",
        source: "contact",
        contact_id: c.id,
        city: c.city || "",
        at: c.last_activity_at || c.updated_at || c.created_at,
        notes: c.source || "",
      });
    });
    return out;
  }

  function buildUsers(bundles) {
    var map = {};
    var b = bundles || {};
    []
      .concat(fromParties(b.parties))
      .concat(fromCriteria(b.criteria, b.contactsById || {}))
      .concat(fromLeads(b.leads))
      .concat(fromTourRequests(b.tourRequests))
      .concat(fromContacts(b.contacts))
      .forEach(function (row) {
        ingest(map, row);
      });

    return Object.keys(map)
      .map(function (k) {
        return map[k];
      })
      .sort(function (a, b) {
        var ta = a.last_activity_at ? new Date(a.last_activity_at).getTime() : 0;
        var tb = b.last_activity_at ? new Date(b.last_activity_at).getTime() : 0;
        return tb - ta;
      });
  }

  function filterUsers(users, opts) {
    opts = opts || {};
    var q = String(opts.q || "")
      .trim()
      .toLowerCase();
    var role = String(opts.role || "")
      .trim()
      .toLowerCase();
    var channel = String(opts.channel || "")
      .trim()
      .toLowerCase();
    return (users || []).filter(function (u) {
      if (role && role !== "all") {
        var roles = String(u.roles || "").split(",");
        if (roles.indexOf(role) === -1 && u.roles !== role) return false;
      }
      if (channel === "email" && !u.emailable) return false;
      if (channel === "phone" && !u.callable) return false;
      if (!q) return true;
      var hay = [u.name, u.email, u.phone, u.phone_display, u.roles, (u.cities || []).join(" "), (u.sources || []).join(" ")]
        .join(" ")
        .toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  function stats(users) {
    var s = {
      total: users.length,
      emailable: 0,
      callable: 0,
      acheteur: 0,
      vendeur: 0,
      les_deux: 0,
      chasseur: 0,
      visiteur: 0,
    };
    users.forEach(function (u) {
      if (u.emailable) s.emailable++;
      if (u.callable) s.callable++;
      String(u.roles || "")
        .split(",")
        .forEach(function (r) {
          if (s[r] != null) s[r]++;
        });
    });
    return s;
  }

  function toCsv(users) {
    var lines = [
      ["name", "email", "phone", "roles", "cities", "sources", "last_activity_at"].join(";"),
    ];
    (users || []).forEach(function (u) {
      lines.push(
        [
          u.name,
          u.email,
          u.phone_display || u.phone,
          u.roles,
          (u.cities || []).join("|"),
          (u.sources || []).join("|"),
          u.last_activity_at || "",
        ]
          .map(function (cell) {
            return '"' + String(cell || "").replace(/"/g, '""') + '"';
          })
          .join(";")
      );
    });
    return lines.join("\n");
  }

  function mailtoBcc(users, subject, body) {
    var emails = (users || [])
      .map(function (u) {
        return u.email;
      })
      .filter(Boolean);
    if (!emails.length) return "";
    var max = emails.slice(0, 40);
    return (
      "mailto:?bcc=" +
      encodeURIComponent(max.join(",")) +
      "&subject=" +
      encodeURIComponent(subject || "") +
      "&body=" +
      encodeURIComponent(body || "")
    );
  }

  return {
    ROLE_LABELS: ROLE_LABELS,
    normEmail: normEmail,
    normPhone: normPhone,
    displayPhone: displayPhone,
    roleLabel: roleLabel,
    classifyPartyRole: classifyPartyRole,
    classifyVertical: classifyVertical,
    buildUsers: buildUsers,
    filterUsers: filterUsers,
    stats: stats,
    toCsv: toCsv,
    mailtoBcc: mailtoBcc,
    dedupeKey: dedupeKey,
  };
});
