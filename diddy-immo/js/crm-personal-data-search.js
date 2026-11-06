/**
 * Recherche données personnelles — inspire personalDataSearchService.ts (multisite).
 */
window.CrmPersonalDataSearch = {
  normalizePhone: function (phone) {
    if (!phone) return "";
    var n = String(phone).replace(/[^\d+]/g, "");
    if (n.indexOf("0") === 0) n = "+33" + n.slice(1);
    else if (n.indexOf("33") === 0 && n.indexOf("+") !== 0) n = "+" + n;
    else if (n.indexOf("+") !== 0 && n.length === 10) n = "+33" + n.slice(1);
    return n;
  },

  normalizeEmail: function (email) {
    return String(email || "")
      .toLowerCase()
      .trim();
  },

  normalizeName: function (name) {
    return String(name || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .trim();
  },

  /** Variantes de requête pour l'API (téléphone, plaque, email). */
  expandQuery: function (q) {
    var out = [q];
    var digits = q.replace(/[^\d]/g, "");
    if (digits.length >= 6) {
      out.push(digits);
      if (digits.length === 10 && digits[0] === "0") {
        out.push("+33" + digits.slice(1));
        out.push("33" + digits.slice(1));
      }
    }
    if (q.indexOf("@") >= 0) out.push(this.normalizeEmail(q));
    return out.filter(function (v, i, a) {
      return v && a.indexOf(v) === i;
    });
  },

  detectFieldHint: function (q) {
    if (/^[\d\s+().-]{8,}$/.test(q.replace(/\s/g, ""))) return "phone";
    if (q.indexOf("@") >= 0) return "email";
    if (/^[A-Z]{2}-?\d{3}-?[A-Z]{2}$/i.test(q.replace(/\s/g, ""))) return "registration";
    if (/^FR\d{2}/i.test(q.replace(/\s/g, ""))) return "iban";
    return "text";
  },
};
