/**
 * Bloc téléphone + e-mail (labels, autofill, clavier mobile).
 */
(function (global) {
  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function extraAttrs(name, type) {
    var t = type || "text";
    var n = name || "";
    if (t === "email" || n === "email") {
      return ' autocomplete="email" inputmode="email" enterkeyhint="next"';
    }
    if (t === "tel" || n === "phone") {
      return ' autocomplete="tel-national" inputmode="tel" enterkeyhint="next"';
    }
    if (n === "firstName") return ' autocomplete="given-name"';
    if (n === "lastName") return ' autocomplete="family-name"';
    if (n === "fullName") return ' autocomplete="name"';
    if (n === "street") return ' autocomplete="street-address"';
    if (n === "postalCode") return ' autocomplete="postal-code" inputmode="numeric"';
    if (n === "cityFull") return ' autocomplete="address-level2"';
    return "";
  }

  function fieldHtml(opts) {
    opts = opts || {};
    var name = opts.name || "";
    var id = opts.id || name;
    var type = opts.type || "text";
    var req = opts.required === false ? "" : " required";
    return (
      '<label class="field" for="' +
      esc(id) +
      '">' +
      esc(opts.label || "") +
      '<input id="' +
      esc(id) +
      '" name="' +
      esc(name) +
      '" type="' +
      esc(type) +
      '" placeholder="' +
      esc(opts.placeholder || "") +
      '"' +
      extraAttrs(name, type) +
      req +
      " /></label>"
    );
  }

  function pairHtml(opts) {
    opts = opts || {};
    var prefix = opts.idPrefix || "";
    return (
      '<fieldset class="contact-pair">' +
      "<legend>" +
      esc(opts.legend || "Comment vous joindre") +
      "</legend>" +
      '<p class="contact-pair-hint">' +
      esc(
        opts.hint ||
          "Téléphone et e-mail : un conseiller vous rappelle et envoie le devis. Même si vous n'allez pas au bout du formulaire."
      ) +
      "</p>" +
      '<div class="contact-pair-row">' +
      fieldHtml({
        name: "phone",
        id: prefix + "phone",
        type: "tel",
        label: "Téléphone mobile",
        placeholder: "06 12 34 56 78",
        required: opts.required !== false,
      }) +
      fieldHtml({
        name: "email",
        id: prefix + "email",
        type: "email",
        label: "E-mail",
        placeholder: "vous@email.fr",
        required: opts.required !== false,
      }) +
      "</div></fieldset>"
    );
  }

  global.ContactPair = {
    extraAttrs: extraAttrs,
    fieldHtml: fieldHtml,
    pairHtml: pairHtml,
  };
})(typeof window !== "undefined" ? window : globalThis);
