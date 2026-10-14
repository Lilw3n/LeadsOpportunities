/**
 * Zone VTC depuis UTM / referrer SEO (IDF, Paris, CDG, Orly…).
 */
(function () {
  var ZONES = [
    { re: /cdg|roissy/i, label: "Aéroport CDG / Roissy", hint: "Couverture chauffeur plateforme — devis local IDF." },
    { re: /orly/i, label: "Aéroport Orly", hint: "Devis VTC Orly — RC pro et usage déclaré." },
    { re: /la[-_]?defense|defense/i, label: "La Défense", hint: "Hub pro IDF — devis chauffeur rapide." },
    { re: /gares|gare/i, label: "Gares parisiennes", hint: "Paris gares — devis VTC dédié." },
    { re: /paris|idf|ile[-_ ]?de[-_ ]?france|15e|arrond/i, label: "Île-de-France / Paris", hint: "Densité chauffeurs IDF — devis Solly Azar / Zéphir." },
  ];

  function pickZone() {
    var q = new URLSearchParams(window.location.search || "");
    var blob = [q.get("utm_content") || "", q.get("utm_campaign") || "", q.get("zone") || "", document.referrer || ""].join(" ");
    for (var i = 0; i < ZONES.length; i++) {
      if (ZONES[i].re.test(blob)) return ZONES[i];
    }
    return null;
  }

  function boot() {
    var zone = pickZone();
    var slot = document.querySelector("[data-vtc-zone-hint]");
    if (!zone || !slot) return;
    slot.hidden = false;
    slot.innerHTML =
      '<p class="vtc-zone-kicker">Zone détectée</p>' +
      "<strong>" +
      zone.label +
      "</strong>" +
      "<span>" +
      zone.hint +
      "</span>";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
