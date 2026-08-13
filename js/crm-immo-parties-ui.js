/**
 * UI réutilisable — vendeurs / acquéreurs en nombre illimité (crm_immo_parties).
 */
(function (root) {
  var Matcher = root.CrmImmoMatcher;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function rolesForSide(side) {
    if (!Matcher) return [];
    if (side === "sellers") {
      return Matcher.PARTY_ROLES.filter(function (r) {
        return Matcher.SELLER_PARTY_ROLES.indexOf(r.id) !== -1;
      });
    }
    if (side === "buyers") {
      return Matcher.PARTY_ROLES.filter(function (r) {
        return Matcher.BUYER_PARTY_ROLES.indexOf(r.id) !== -1;
      });
    }
    return Matcher.PARTY_ROLES.slice();
  }

  function defaultRoleForSide(side) {
    if (side === "buyers") return "acquereur";
    if (side === "sellers") return "vendeur";
    return "vendeur";
  }

  function renderPartyRow(party, prefix) {
    var role = Matcher ? Matcher.partyRoleLabel(party.role) : party.role;
    var contact = party.contact_id ? " · CRM " + esc(party.contact_id) : "";
    return (
      '<div class="party-row" data-party-id="' +
      esc(party.id || "") +
      '"><div><strong>' +
      esc(party.name || "—") +
      "</strong> · " +
      esc(role) +
      contact +
      "<br><span style='color:var(--muted)'>" +
      esc(party.phone || "") +
      (party.phone && party.email ? " · " : "") +
      esc(party.email || "") +
      "</span></div>" +
      '<button type="button" class="btn btn-ghost btn-sm" data-party-del="' +
      esc(party.id || "") +
      '" title="Retirer">✕</button></div>'
    );
  }

  function renderSection(opts) {
    opts = opts || {};
    var prefix = opts.prefix || "party";
    var side = opts.side || "all";
    var title = opts.title || "Personnes liées";
    var hint =
      opts.hint ||
      "Ajoute autant de vendeurs ou acquéreurs que nécessaire (ex. 8 héritiers sur une même vente).";
    var parties = Matcher ? Matcher.filterPartiesBySide(opts.parties || [], side) : opts.parties || [];
    var roles = rolesForSide(side);
    var defaultRole = opts.defaultRole || defaultRoleForSide(side);
    var showRoleSelect = side === "all" || roles.length > 1;

    return (
      '<section class="parties-block" data-side="' +
      esc(side) +
      '">' +
      "<h4 style='margin:0 0 4px'>" +
      esc(title) +
      " <span style='font-weight:600;color:var(--muted)'>(" +
      parties.length +
      ")</span></h4>" +
      "<p class='immo-hint' style='margin:0 0 10px'>" +
      esc(hint) +
      "</p>" +
      '<div class="parties-list" id="' +
      esc(prefix) +
      'List">' +
      (parties.length
        ? parties.map(function (p) {
            return renderPartyRow(p, prefix);
          }).join("")
        : "<p style='color:var(--muted);margin:0'>Aucune personne pour l'instant.</p>") +
      "</div>" +
      '<form class="parties-add-form" id="' +
      esc(prefix) +
      'Form" style="margin-top:12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;align-items:end">' +
      (showRoleSelect
        ? '<label>Rôle<select id="' +
          esc(prefix) +
          'Role">' +
          roles
            .map(function (r) {
              return (
                '<option value="' +
                esc(r.id) +
                '"' +
                (r.id === defaultRole ? " selected" : "") +
                ">" +
                esc(r.label) +
                "</option>"
              );
            })
            .join("") +
          "</select></label>"
        : '<input type="hidden" id="' + esc(prefix) + 'Role" value="' + esc(defaultRole) + '" />') +
      '<label>Nom<input id="' +
      esc(prefix) +
      'Name" required placeholder="Nom complet" /></label>' +
      '<label>Tél<input id="' +
      esc(prefix) +
      'Phone" placeholder="06…" /></label>' +
      '<label>Email<input id="' +
      esc(prefix) +
      'Email" type="email" placeholder="email@…" /></label>' +
      '<label>Contact CRM<input id="' +
      esc(prefix) +
      'Contact" placeholder="contact_…" /></label>' +
      '<button class="btn btn-primary" type="submit">+ Ajouter</button></form></section>'
    );
  }

  function readPartyForm(prefix) {
    var roleEl = document.getElementById(prefix + "Role");
    return {
      role: roleEl ? roleEl.value : "vendeur",
      name: (document.getElementById(prefix + "Name") || {}).value || "",
      phone: (document.getElementById(prefix + "Phone") || {}).value || "",
      email: (document.getElementById(prefix + "Email") || {}).value || "",
      contact_id: (document.getElementById(prefix + "Contact") || {}).value || "",
    };
  }

  function clearPartyForm(prefix) {
    ["Name", "Phone", "Email", "Contact"].forEach(function (suffix) {
      var el = document.getElementById(prefix + suffix);
      if (el) el.value = "";
    });
  }

  function mountSection(container, opts) {
    if (!container) return;
    container.innerHTML = renderSection(opts);
    var prefix = opts.prefix || "party";
    var form = document.getElementById(prefix + "Form");
    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        var data = readPartyForm(prefix);
        if (!String(data.name || "").trim() && !String(data.contact_id || "").trim()) {
          alert("Indique au moins un nom ou un contact CRM.");
          return;
        }
        if (opts.onAdd) opts.onAdd(data);
        clearPartyForm(prefix);
      };
    }
    container.querySelectorAll("[data-party-del]").forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute("data-party-del");
        if (!id || !opts.onDelete) return;
        if (!confirm("Retirer cette personne ?")) return;
        opts.onDelete(id);
      };
    });
  }

  function renderBuyerRow(buyer, prefix) {
    var role = Matcher ? Matcher.partyRoleLabel(buyer.role || "acquereur") : buyer.role;
    return (
      '<div class="party-row" data-buyer-id="' +
      esc(buyer.id || "") +
      '"><div><strong>' +
      esc(buyer.name || "—") +
      "</strong> · " +
      esc(role) +
      (buyer.contact_id ? " · CRM " + esc(buyer.contact_id) : "") +
      "<br><span style='color:var(--muted)'>" +
      esc(buyer.phone || "") +
      (buyer.phone && buyer.email ? " · " : "") +
      esc(buyer.email || "") +
      "</span></div>" +
      '<button type="button" class="btn btn-ghost btn-sm" data-buyer-del="' +
      esc(buyer.id || "") +
      '">✕</button></div>'
    );
  }

  function renderBuyersSection(opts) {
    opts = opts || {};
    var prefix = opts.prefix || "buyer";
    var buyers = opts.buyers || [];
    return (
      '<section class="parties-block">' +
      "<h4 style='margin:0 0 4px'>Acquéreurs <span style='font-weight:600;color:var(--muted)'>(" +
      buyers.length +
      ")</span></h4>" +
      "<p class='immo-hint' style='margin:0 0 10px'>Plusieurs acquéreurs ou co-emprunteurs sur la même recherche.</p>" +
      '<div id="' +
      esc(prefix) +
      'List">' +
      (buyers.length
        ? buyers.map(function (b) {
            return renderBuyerRow(b, prefix);
          }).join("")
        : "<p style='color:var(--muted);margin:0'>Aucun acquéreur.</p>") +
      "</div>" +
      '<form id="' +
      esc(prefix) +
      'Form" style="margin-top:12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;align-items:end">' +
      '<label>Nom<input id="' +
      esc(prefix) +
      'Name" required /></label>' +
      '<label>Tél<input id="' +
      esc(prefix) +
      'Phone" /></label>' +
      '<label>Email<input id="' +
      esc(prefix) +
      'Email" type="email" /></label>' +
      '<label>Contact CRM<input id="' +
      esc(prefix) +
      'Contact" placeholder="contact_…" /></label>' +
      '<button class="btn btn-primary" type="submit">+ Ajouter acquéreur</button></form></section>'
    );
  }

  function mountBuyersSection(container, opts) {
    if (!container) return;
    container.innerHTML = renderBuyersSection(opts);
    var prefix = opts.prefix || "buyer";
    var form = document.getElementById(prefix + "Form");
    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        var data = readPartyForm(prefix);
        data.role = "acquereur";
        if (!String(data.name || "").trim() && !String(data.contact_id || "").trim()) {
          alert("Indique au moins un nom ou un contact CRM.");
          return;
        }
        if (opts.onAdd) opts.onAdd(data);
        clearPartyForm(prefix);
      };
    }
    container.querySelectorAll("[data-buyer-del]").forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute("data-buyer-del");
        if (!id || !opts.onDelete) return;
        if (!confirm("Retirer cet acquéreur ?")) return;
        opts.onDelete(id);
      };
    });
  }

  root.CrmImmoPartiesUi = {
    renderSection: renderSection,
    mountSection: mountSection,
    renderBuyersSection: renderBuyersSection,
    mountBuyersSection: mountBuyersSection,
    readPartyForm: readPartyForm,
    clearPartyForm: clearPartyForm,
  };
})(typeof window !== "undefined" ? window : globalThis);
