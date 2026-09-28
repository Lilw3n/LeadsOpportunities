/**
 * Durée de mandat — calcul + ACL (propriétaire + Wendy/admin uniquement).
 * Les dates ne doivent jamais sortir sur les listings publics / partenaires.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.ImmoMandateAcl = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var PRIVATE_FIELDS = [
    "mandate_started_at",
    "mandate_ends_at",
    "date_mandat",
    "date_echeance",
    "date_premier_mandat",
    "date_renouvellement",
    "mandate_ref",
    "n_mandat",
    "forme_mandat",
    "mandate_form",
    "info_mandat",
  ];

  function parseDate(v) {
    if (!v) return null;
    var d = v instanceof Date ? v : new Date(String(v));
    return isNaN(d.getTime()) ? null : d;
  }

  function daysBetween(a, b) {
    var ms = b.getTime() - a.getTime();
    return Math.round(ms / 86400000);
  }

  function computeDuration(property, meta) {
    meta = meta || {};
    var start =
      parseDate(property && property.mandate_started_at) ||
      parseDate(meta.date_mandat) ||
      parseDate(meta.date_premier_mandat);
    var end =
      parseDate(property && property.mandate_ends_at) ||
      parseDate(meta.date_echeance) ||
      parseDate(meta.date_renouvellement);
    if (!start) {
      return {
        ok: false,
        reason: "missing_start",
        label: "Date de début de mandat non renseignée",
      };
    }
    var today = new Date();
    today.setHours(12, 0, 0, 0);
    var elapsed = daysBetween(start, today);
    var remaining = end ? daysBetween(today, end) : null;
    var total = end ? daysBetween(start, end) : null;
    var expired = end ? remaining < 0 : false;
    return {
      ok: true,
      startIso: start.toISOString().slice(0, 10),
      endIso: end ? end.toISOString().slice(0, 10) : null,
      elapsedDays: elapsed,
      remainingDays: remaining,
      totalDays: total,
      expired: expired,
      forme:
        (property && (property.mandate_form || property.forme_mandat)) ||
        meta.forme_mandat ||
        meta.mandate_form ||
        "",
      ref:
        (property && (property.mandate_ref || property.n_mandat)) ||
        meta.n_mandat ||
        meta.mandate_ref ||
        "",
      label: expired
        ? "Mandat échu depuis " + Math.abs(remaining) + " j"
        : remaining != null
          ? "Mandat en cours — " + remaining + " j restants (depuis " + elapsed + " j)"
          : "Mandat en cours depuis " + elapsed + " j (échéance non renseignée)",
    };
  }

  /**
   * @param {object} viewer { isAdmin, isOwner, contactId, partnerId }
   * @param {object} property
   */
  function canViewMandateDuration(viewer, property) {
    viewer = viewer || {};
    if (viewer.isAdmin === true) return true;
    if (viewer.isWendy === true) return true;
    if (viewer.isOwner === true) return true;
    var ownerId = property && (property.owner_contact_id || property.ownerContactId);
    if (viewer.contactId && ownerId && String(viewer.contactId) === String(ownerId)) {
      return true;
    }
    return false;
  }

  function stripMandatePrivate(obj) {
    if (!obj || typeof obj !== "object") return obj;
    var out = Object.assign({}, obj);
    PRIVATE_FIELDS.forEach(function (k) {
      delete out[k];
    });
    if (out.metadata && typeof out.metadata === "object") {
      out.metadata = Object.assign({}, out.metadata);
      PRIVATE_FIELDS.forEach(function (k) {
        delete out.metadata[k];
      });
    }
    if (out.metadata_json && typeof out.metadata_json === "string") {
      try {
        var m = JSON.parse(out.metadata_json);
        PRIVATE_FIELDS.forEach(function (k) {
          delete m[k];
        });
        out.metadata_json = JSON.stringify(m);
      } catch (e) {
        /* keep */
      }
    }
    return out;
  }

  function attachIfAllowed(property, viewer, meta) {
    var base = stripMandatePrivate(property);
    if (!canViewMandateDuration(viewer, property)) {
      base.mandateDuration = null;
      base.mandateDurationVisible = false;
      return base;
    }
    base.mandateDuration = computeDuration(property, meta || property.metadata || {});
    base.mandateDurationVisible = true;
    return base;
  }

  return {
    PRIVATE_FIELDS: PRIVATE_FIELDS,
    parseDate: parseDate,
    computeDuration: computeDuration,
    canViewMandateDuration: canViewMandateDuration,
    stripMandatePrivate: stripMandatePrivate,
    attachIfAllowed: attachIfAllowed,
  };
});
