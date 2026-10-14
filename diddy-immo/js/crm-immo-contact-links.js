/**
 * Liens bidirectionnels pige (bien CRM) ↔ interlocuteur (crm-contact).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.CrmImmoContactLinks = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function digitsPhone(v) {
    var d = String(v || "").replace(/\D/g, "");
    if (d.length === 11 && d.indexOf("33") === 0) d = "0" + d.slice(2);
    if (d.length === 12 && d.indexOf("0033") === 0) d = "0" + d.slice(4);
    if (d.length > 10) d = d.slice(-10);
    return d;
  }

  function normEmail(v) {
    return String(v || "")
      .trim()
      .toLowerCase();
  }

  function roleLabel(role, Matcher) {
    var roles = (Matcher && (Matcher.PARTY_ROLES || Matcher.PARTY_ROLES)) || [];
    var hit = roles.find(function (r) {
      return r.id === role;
    });
    if (hit) return hit.label;
    if (role === "owner" || role === "vendeur") return "Vendeur";
    if (role === "buyer" || role === "acquereur") return "Acquéreur";
    return role || "Contact";
  }

  function partyList(Store, propertyId) {
    if (!Store || !Store.listParties) return [];
    return Store.listParties(propertyId) || [];
  }

  /** Références contact liées à un bien (IDs + parties + tél. pige). */
  function linksForProperty(property, Store, Matcher) {
    if (!property) return [];
    var out = [];
    var seen = {};

    function push(row) {
      var key =
        (row.contact_id ? "id:" + row.contact_id : "") +
        "|" +
        (row.phone ? "p:" + digitsPhone(row.phone) : "") +
        "|" +
        (row.email ? "e:" + normEmail(row.email) : "") +
        "|" +
        (row.name || "") +
        "|" +
        (row.role || "");
      if (seen[key]) return;
      seen[key] = true;
      out.push(row);
    }

    if (property.owner_contact_id) {
      push({
        role: "vendeur",
        contact_id: String(property.owner_contact_id),
        name: "",
        phone: property.phone || "",
        email: "",
        source: "owner_contact_id",
      });
    }
    if (property.buyer_contact_id) {
      push({
        role: "acquereur",
        contact_id: String(property.buyer_contact_id),
        name: "",
        phone: "",
        email: "",
        source: "buyer_contact_id",
      });
    }

    partyList(Store, property.id).forEach(function (party) {
      push({
        role: party.role || "prospect",
        contact_id: party.contact_id ? String(party.contact_id) : "",
        name: party.name || "",
        phone: party.phone || "",
        email: party.email || "",
        source: "party",
      });
    });

    if (!out.length && property.phone) {
      push({
        role: "prospect",
        contact_id: "",
        name: "",
        phone: property.phone,
        email: "",
        source: "property_phone",
      });
    }

    out.forEach(function (row) {
      row.role_label = roleLabel(row.role, Matcher);
    });
    return out;
  }

  function propertyTouchesContact(property, contact, Store) {
    if (!property || !contact) return { hit: false, how: "" };
    var cid = String(contact.id || "");
    if (cid && String(property.owner_contact_id || "") === cid) {
      return { hit: true, how: "owner", role: "vendeur" };
    }
    if (cid && String(property.buyer_contact_id || "") === cid) {
      return { hit: true, how: "buyer", role: "acquereur" };
    }
    var parties = partyList(Store, property.id);
    for (var i = 0; i < parties.length; i++) {
      if (cid && String(parties[i].contact_id || "") === cid) {
        return { hit: true, how: "party", role: parties[i].role || "prospect" };
      }
    }
    var cPhone = digitsPhone(contact.phone || contact.mobile || contact.tel);
    var cEmail = normEmail(contact.email || contact.mail);
    if (cPhone) {
      if (digitsPhone(property.phone) === cPhone) {
        return { hit: true, how: "phone", role: "prospect", soft: true };
      }
      for (var j = 0; j < parties.length; j++) {
        if (digitsPhone(parties[j].phone) === cPhone) {
          return { hit: true, how: "party_phone", role: parties[j].role || "prospect", soft: true };
        }
      }
    }
    if (cEmail) {
      for (var k = 0; k < parties.length; k++) {
        if (normEmail(parties[k].email) === cEmail) {
          return { hit: true, how: "party_email", role: parties[k].role || "prospect", soft: true };
        }
      }
    }
    return { hit: false, how: "" };
  }

  /** Biens liés (ou rapprochés) à un interlocuteur. */
  function propertiesForContact(contact, Store, Matcher) {
    if (!Store || !contact) return [];
    var list = Store.listProperties({}) || [];
    var out = [];
    list.forEach(function (p) {
      var touch = propertyTouchesContact(p, contact, Store);
      if (!touch.hit) return;
      out.push({
        property: p,
        role: touch.role || "prospect",
        role_label: roleLabel(touch.role, Matcher),
        how: touch.how,
        soft: !!touch.soft,
      });
    });
    out.sort(function (a, b) {
      return String(b.property.updated_at || "").localeCompare(String(a.property.updated_at || ""));
    });
    return out;
  }

  function contactDisplayName(c) {
    if (!c) return "";
    var first = c.first_name || c.firstName || "";
    var last = c.last_name || c.lastName || "";
    var name = [first, last].filter(Boolean).join(" ").trim();
    if (name) return name;
    if (c.name) return String(c.name);
    if (c.company) return String(c.company);
    if (c.email) return String(c.email);
    if (c.phone) return String(c.phone);
    return "";
  }

  function shortId(id) {
    var s = String(id || "");
    return s.length > 18 ? s.slice(0, 14) + "…" : s;
  }

  /** Lie le contact comme vendeur (owner) sur le bien + party vendeur. */
  function linkAsOwner(Store, property, contact) {
    if (!Store || !property || !contact || !contact.id) return null;
    var next = Object.assign({}, property, {
      owner_contact_id: String(contact.id),
      contact_connu: true,
      phone: property.phone || contact.phone || contact.mobile || "",
    });
    Store.upsertProperty(next);
    var parties = partyList(Store, property.id);
    var has = parties.some(function (p) {
      return String(p.contact_id || "") === String(contact.id) && (p.role === "vendeur" || p.role === "mandant");
    });
    if (!has && Store.upsertParty) {
      Store.upsertParty({
        property_id: property.id,
        contact_id: String(contact.id),
        role: "vendeur",
        name: contactDisplayName(contact),
        phone: contact.phone || contact.mobile || "",
        email: contact.email || "",
      });
    }
    return Store.getProperty(property.id);
  }

  return {
    digitsPhone: digitsPhone,
    linksForProperty: linksForProperty,
    propertiesForContact: propertiesForContact,
    propertyTouchesContact: propertyTouchesContact,
    contactDisplayName: contactDisplayName,
    shortId: shortId,
    roleLabel: roleLabel,
    linkAsOwner: linkAsOwner,
  };
});
