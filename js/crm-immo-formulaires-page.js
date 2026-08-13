(function () {
  var TOKEN_KEY = "lo_token";
  var token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  var Store = window.CrmImmoStore;
  var params = new URLSearchParams(location.search);
  var presetProperty = params.get("property") || "";

  var CATEGORY_LABELS = {
    mandat: "Mandats",
    estimation: "Estimation & avis de valeur",
    visite: "Visites",
    prospection: "Prospection terrain",
    negociation: "Négociation",
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fillPropertySelect() {
    var sel = document.getElementById("filterProperty");
    if (!sel || !Store) return;
    var props = Store.listProperties ? Store.listProperties() : [];
    sel.innerHTML =
      '<option value="">— Aucun —</option>' +
      props
        .map(function (p) {
          var label = (p.title || "Bien") + " — " + (p.city || "") + " " + (p.postal_code || "");
          return (
            '<option value="' +
            esc(p.id) +
            '"' +
            (p.id === presetProperty ? " selected" : "") +
            ">" +
            esc(label) +
            "</option>"
          );
        })
        .join("");
    sel.onchange = paintHub;
  }

  function formUrl(type) {
    var pid = document.getElementById("filterProperty").value;
    var q = "type=" + encodeURIComponent(type);
    if (pid) q += "&property=" + encodeURIComponent(pid);
    return "./crm-immo-formulaire.html?" + q;
  }

  function paintHub(catalog) {
    var hub = document.getElementById("formHub");
    var byCat = {};
    catalog.forEach(function (f) {
      if (!byCat[f.category]) byCat[f.category] = [];
      byCat[f.category].push(f);
    });
    var html = "";
    Object.keys(CATEGORY_LABELS).forEach(function (cat) {
      var items = byCat[cat];
      if (!items || !items.length) return;
      html += '<h3 class="immo-cat-title">' + esc(CATEGORY_LABELS[cat]) + "</h3>";
      html += '<div class="immo-form-grid">';
      items.forEach(function (f) {
        html +=
          '<a class="immo-form-card" href="' +
          esc(formUrl(f.id)) +
          '">' +
          '<span class="immo-form-tag">' +
          esc(CATEGORY_LABELS[cat] || f.category) +
          "</span>" +
          "<h4>" +
          esc(f.label) +
          "</h4>" +
          "<p>" +
          esc(f.desc || "") +
          "</p>" +
          '<span class="btn btn-primary btn-sm">Ouvrir & remplir</span>' +
          "</a>";
      });
      html += "</div>";
    });
    hub.innerHTML = html;
    document.getElementById("hubStatus").hidden = true;
  }

  fillPropertySelect();

  fetch("/api/crm/immo-document", {
    headers: { Authorization: "Bearer " + token },
  })
    .then(function (r) {
      return r.json();
    })
    .then(function (res) {
      if (!res.ok || !res.catalog) throw new Error("Catalogue indisponible");
      paintHub(res.catalog);
    })
    .catch(function (e) {
      document.getElementById("hubStatus").textContent =
        "Impossible de charger les modèles : " + String(e);
    });
})();
