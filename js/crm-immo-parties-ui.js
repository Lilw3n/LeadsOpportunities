/**
 * Éditeur illimité vendeurs / acquéreurs (succession, indivision, couple…).
 */
window.CrmImmoPartiesUi = (function () {
  var Matcher = window.CrmImmoMatcher;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function blankParty(role) {
    return {
      id: "",
      role: role || "heritier",
      name: "",
      phone: "",
      email: "",
      share_label: "",
      share_pct: null,
      is_primary: false,
      capacity: "",
      contact_id: "",
      notes: "",
      address: "",
    };
  }

  function rolesForSide(side) {
    return Matcher.PARTY_ROLES.filter(function (r) {
      if (r.id === "colocataire") return false;
      return !side || r.side === side;
    });
  }

  function roleOptions(selected, side) {
    return rolesForSide(side)
      .map(function (r) {
        return (
          '<option value="' +
          esc(r.id) +
          '"' +
          (r.id === selected ? " selected" : "") +
          ">" +
          esc(r.label) +
          "</option>"
        );
      })
      .join("");
  }

  function capacityOptions(selected) {
    return Matcher.PARTY_CAPACITIES.map(function (c) {
      return (
        '<option value="' +
        esc(c.id) +
        '"' +
        (c.id === (selected || "") ? " selected" : "") +
        ">" +
        esc(c.label) +
        "</option>"
      );
    }).join("");
  }

  function shareHint(parties) {
    var withShare = (parties || []).filter(function (p) {
      return p.share_pct != null;
    });
    if (!withShare.length) return "";
    var total = Math.round(Matcher.shareTotal(parties) * 100) / 100;
    var cls = Math.abs(total - 100) < 0.2 ? "ok" : "warn";
    return (
      '<p class="immo-parties-share ' +
      cls +
      '">Quotes-parts : <strong>' +
      String(total).replace(".", ",") +
      " %</strong>" +
      (cls === "ok" ? " (100 %)" : " — total attendu 100 % pour une indivision complète") +
      "</p>"
    );
  }

  function rowHtml(p, idx, side) {
    p = Matcher.normalizeParty(p);
    var defaultRole = (Matcher.PARTY_SIDES.find(function (s) {
      return s.id === side;
    }) || {}).defaultRole;
    var role = p.role || defaultRole || "vendeur";
    return (
      '<div class="immo-party-row" data-idx="' +
      idx +
      '" data-side="' +
      esc(side) +
      '">' +
      '<input type="hidden" data-f="id" value="' +
      esc(p.id || "") +
      '" />' +
      '<label>Rôle<select data-f="role">' +
      roleOptions(role, side) +
      "</select></label>" +
      '<label>Nom<input data-f="name" placeholder="Prénom Nom" value="' +
      esc(p.name) +
      '" /></label>' +
      '<label>Tél<input data-f="phone" value="' +
      esc(p.phone) +
      '" /></label>' +
      '<label>Email<input data-f="email" type="email" value="' +
      esc(p.email) +
      '" /></label>' +
      '<label>Quote-part<input data-f="share_label" placeholder="1/8 ou 12,5 %" value="' +
      esc(p.share_label || Matcher.formatShare(p)) +
      '" /></label>' +
      '<label>Qualité<select data-f="capacity">' +
      capacityOptions(p.capacity) +
      "</select></label>" +
      '<label class="immo-party-check"><input type="checkbox" data-f="is_primary"' +
      (p.is_primary ? " checked" : "") +
      " /> Contact principal</label>" +
      '<label class="immo-party-wide">Contact CRM<input data-f="contact_id" placeholder="contact_…" value="' +
      esc(p.contact_id || "") +
      '" /></label>' +
      '<label class="immo-party-wide">Notes<input data-f="notes" value="' +
      esc(p.notes) +
      '" /></label>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-remove>Retirer</button>' +
      "</div>"
    );
  }

  function groupHtml(sideMeta, parties) {
    var empty =
      '<p class="immo-parties-empty">Aucun' +
      (sideMeta.id === "seller" ? " vendeur" : sideMeta.id === "buyer" ? " acquéreur" : " interlocuteur") +
      " — ajoutez-en autant que nécessaire (ex. 8 héritiers).</p>";
    return (
      '<section class="immo-parties-group" data-side="' +
      esc(sideMeta.id) +
      '">' +
      "<h4>" +
      esc(sideMeta.label) +
      " <span>(" +
      parties.length +
      ")</span></h4>" +
      (sideMeta.id === "seller"
        ? '<p class="immo-parties-hint">Succession / indivision : une ligne par héritier, sans limite. Quote-part facultative (1/8, 12,5 %…).</p>'
        : sideMeta.id === "buyer"
          ? '<p class="immo-parties-hint">Couple, SCI, indivision acquéreurs : ajoutez chaque signataire.</p>'
          : '<p class="immo-parties-hint">Notaire, agent, apporteur, locataire en place…</p>') +
      '<div class="immo-parties-rows">' +
      (parties.length ? parties.map(function (p, i) {
        return rowHtml(p, i, sideMeta.id);
      }).join("") : empty) +
      "</div>" +
      shareHint(parties) +
      '<button type="button" class="btn btn-ghost" data-add="' +
      esc(sideMeta.id) +
      '">+ ' +
      esc(sideMeta.addLabel) +
      "</button>" +
      "</section>"
    );
  }

  function readRow(row) {
    function val(sel) {
      var el = row.querySelector(sel);
      if (!el) return "";
      if (el.type === "checkbox") return el.checked;
      return el.value;
    }
    var share = Matcher.parseShare(val('[data-f="share_label"]'));
    return {
      id: val('[data-f="id"]') || undefined,
      role: val('[data-f="role"]'),
      name: String(val('[data-f="name"]') || "").trim(),
      phone: String(val('[data-f="phone"]') || "").trim(),
      email: String(val('[data-f="email"]') || "").trim(),
      share_label: String(val('[data-f="share_label"]') || "").trim(),
      share_pct: share.share_pct,
      capacity: val('[data-f="capacity"]'),
      is_primary: !!val('[data-f="is_primary"]'),
      contact_id: String(val('[data-f="contact_id"]') || "").trim() || null,
      notes: String(val('[data-f="notes"]') || "").trim(),
    };
  }

  function collect(mount) {
    if (!mount) return [];
    return Array.prototype.map.call(mount.querySelectorAll(".immo-party-row"), readRow);
  }

  function bind(mount, state) {
    mount.onclick = function (e) {
      var add = e.target.closest("[data-add]");
      if (add) {
        e.preventDefault();
        var side = add.getAttribute("data-add");
        var meta = Matcher.PARTY_SIDES.find(function (s) {
          return s.id === side;
        });
        state.parties = collect(mount);
        state.parties.push(blankParty(meta ? meta.defaultRole : "vendeur"));
        render(mount, state);
        return;
      }
      var rm = e.target.closest("[data-remove]");
      if (rm) {
        e.preventDefault();
        var row = rm.closest(".immo-party-row");
        var rows = Array.prototype.slice.call(mount.querySelectorAll(".immo-party-row"));
        var idx = rows.indexOf(row);
        state.parties = collect(mount);
        if (idx >= 0) state.parties.splice(idx, 1);
        render(mount, state);
      }
    };
  }

  function render(mount, state) {
    state.parties = (state.parties || []).map(function (p) {
      return Matcher.normalizeParty(p);
    });
    var grouped = Matcher.groupParties(state.parties);
    var bySide = { seller: grouped.sellers, buyer: grouped.buyers, other: grouped.others };
    var summary = Matcher.partiesSummary(state.parties);
    mount.innerHTML =
      '<div class="immo-parties-head">' +
      "<h3>Vendeurs &amp; acquéreurs</h3>" +
      '<p class="immo-parties-summary">' +
      esc(summary) +
      " — nombre illimité (héritiers, indivisaires, co-acquéreurs).</p>" +
      "</div>" +
      Matcher.PARTY_SIDES.map(function (side) {
        return groupHtml(side, bySide[side.id] || []);
      }).join("");
    bind(mount, state);
    if (typeof state.onChange === "function") state.onChange(collect(mount));
  }

  function mountEditor(el, opts) {
    opts = opts || {};
    var state = {
      parties: (opts.parties || []).slice(),
      onChange: opts.onChange,
    };
    if (!state.parties.length && opts.seedEmptySeller) {
      state.parties.push(blankParty("vendeur"));
    }
    render(el, state);
    return {
      collect: function () {
        return collect(el);
      },
      setParties: function (list) {
        state.parties = list || [];
        render(el, state);
      },
      state: state,
    };
  }

  return {
    mountEditor: mountEditor,
    collect: collect,
    blankParty: blankParty,
  };
})();
