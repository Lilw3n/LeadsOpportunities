/**
 * Masquage coordonnées — inspire SecureContactSystem multisite
 */
window.SecureContact = {
  maskEmail: function (email) {
    if (!email || email.indexOf("@") < 1) return "—";
    var parts = email.split("@");
    var local = parts[0];
    var masked = local.length <= 2 ? "**" : local[0] + "***" + local.slice(-1);
    return masked + "@" + parts[1];
  },

  maskPhone: function (phone) {
    if (!phone) return "—";
    var digits = String(phone).replace(/\D/g, "");
    if (digits.length < 6) return "** **";
    return digits.slice(0, 2) + " ** ** " + digits.slice(-2);
  },

  renderField: function (type, value, role) {
    var isAdmin = role === "admin" || role === "manager";
    if (!value) return "—";
    if (isAdmin) {
      return (
        '<span class="secure-field" data-revealed="1">' +
        this.esc(value) +
        "</span>"
      );
    }
    var masked = type === "email" ? this.maskEmail(value) : this.maskPhone(value);
    return (
      '<span class="secure-field" data-type="' +
      type +
      '" data-value="' +
      this.esc(value) +
      '" data-revealed="0">' +
      masked +
      ' <button type="button" class="btn-reveal" style="font-size:.75rem;padding:2px 8px;border:1px solid #e2e8f0;border-radius:6px;background:#fff;cursor:pointer">Révéler</button></span>'
    );
  },

  esc: function (s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  },

  bindReveal: function (root) {
    (root || document).querySelectorAll(".btn-reveal").forEach(function (btn) {
      btn.onclick = function () {
        var span = btn.closest(".secure-field");
        if (!span || span.getAttribute("data-revealed") === "1") return;
        span.textContent = span.getAttribute("data-value");
        span.setAttribute("data-revealed", "1");
      };
    });
  },
};
