(function () {
  var TOKEN_KEY = "lo_token";
  var token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  var Store = window.CrmImmoStore;
  var Brand = window.CrmImmoAgencyBrand;
  var params = new URLSearchParams(location.search);
  var presetProperty = params.get("property") || "";
  var presetAgency = params.get("agency") || "";

  var CATEGORY_LABELS = {
    mandat: "Mandats",
    estimation: "Estimation & avis de valeur",
    visite: "Visites",
    prospection: "Prospection terrain",
    negociation: "Négociation",
  };

  var LETTER_FIELDS = [
    { id: "displayName", label: "Nom affiché (en-tête)" },
    { id: "networkName", label: "Réseau / raison sociale" },
    { id: "agentName", label: "Négociateur" },
    { id: "tagline", label: "Accroche" },
    { id: "addressText", label: "Adresse (une ligne par ligne)", type: "textarea" },
    { id: "phone", label: "Téléphone" },
    { id: "email", label: "E-mail" },
    { id: "website", label: "Site web" },
    { id: "siret", label: "SIRET" },
    { id: "rcs", label: "RCS / société" },
    { id: "orias", label: "ORIAS" },
    { id: "cartePro", label: "N° carte pro T" },
    { id: "carteProCCI", label: "CCI délivrance carte" },
    { id: "garantieFinanciere", label: "Garantie financière", type: "textarea" },
    { id: "rcpInsurer", label: "Assurance RCP", type: "textarea" },
    { id: "mediateur", label: "Médiateur" },
    { id: "logoMonogram", label: "Monogramme (2–3 lettres)" },
    { id: "accentColor", label: "Couleur (#hex)", placeholder: "#b8860b" },
    { id: "footerLegal", label: "Pied de page légal", type: "textarea" },
    { id: "honorairesDefault", label: "Phrase honoraires", type: "textarea" },
  ];

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function selectedAgencyId() {
    var sel = document.getElementById("filterAgency");
    return (sel && sel.value) || Brand.getSelectedAgencyId() || "";
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

  function fillAgencySelect(agencies) {
    var sel = document.getElementById("filterAgency");
    if (!sel) return;
    var options = Brand.listAgencyOptions();
    if (!options.length && agencies && agencies.length) {
      Brand.setServerAgencies(agencies);
      options = Brand.listAgencyOptions();
    }
    sel.innerHTML = options
      .map(function (a) {
        return (
          '<option value="' +
          esc(a.id) +
          '"' +
          (a.id === presetAgency || a.id === Brand.getSelectedAgencyId() ? " selected" : "") +
          ">" +
          esc(a.label) +
          "</option>"
        );
      })
      .join("");
    if (sel.value) Brand.setSelectedAgencyId(sel.value);
    sel.onchange = function () {
      Brand.setSelectedAgencyId(sel.value);
      paintHub(window._formCatalog || []);
    };
  }

  function formUrl(type) {
    var pid = document.getElementById("filterProperty").value;
    var aid = selectedAgencyId();
    var q = "type=" + encodeURIComponent(type);
    if (pid) q += "&property=" + encodeURIComponent(pid);
    if (aid) q += "&agency=" + encodeURIComponent(aid);
    return "./crm-immo-formulaire.html?" + q;
  }

  function paintHub(catalog) {
    window._formCatalog = catalog;
    var hub = document.getElementById("formHub");
    var byCat = {};
    catalog.forEach(function (f) {
      if (!byCat[f.category]) byCat[f.category] = [];
      byCat[f.category].push(f);
    });
    var agencyOpt = Brand.listAgencyOptions().find(function (a) {
      return a.id === selectedAgencyId();
    });
    var agencyNote = agencyOpt
      ? '<p class="immo-agency-preview"><span class="immo-agency-swatch" style="background:' +
        esc(agencyOpt.accentColor || "#1d4ed8") +
        '"></span> En-tête : <strong>' +
        esc(agencyOpt.label) +
        "</strong> — coordonnées préremplies</p>"
      : "";
    var html = agencyNote;
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

  function buildLetterheadForm() {
    var form = document.getElementById("letterheadForm");
    form.innerHTML = LETTER_FIELDS.map(function (f) {
      var wide = f.type === "textarea" ? ' style="grid-column:1/-1"' : "";
      return (
        "<label" +
        wide +
        ">" +
        esc(f.label) +
        (f.type === "textarea"
          ? '<textarea name="' + f.id + '" data-lh="' + f.id + '"></textarea>'
          : '<input name="' + f.id + '" data-lh="' + f.id + '" placeholder="' + esc(f.placeholder || "") + '" />') +
        "</label>"
      );
    }).join("");
  }

  function loadLetterheadIntoForm(agencyId) {
    fetch("/api/crm/immo-document?profile=" + encodeURIComponent(agencyId), {
      headers: { Authorization: "Bearer " + token },
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        var profile = (res && res.profile) || {};
        Brand.cacheProfile(agencyId, profile);
        var overrides = Brand.loadOverrides()[agencyId] || {};
        var merged = Object.assign({}, profile, overrides);
        var merged = Object.assign({}, profile, local);
        document.querySelectorAll("[data-lh]").forEach(function (el) {
          var key = el.getAttribute("data-lh");
          if (key === "addressText") {
            el.value = (merged.addressLines || []).join("\n");
          } else {
            el.value = merged[key] != null ? merged[key] : "";
          }
        });
      });
  }

  document.getElementById("btnEditLetterhead").onclick = function () {
    var agencyId = selectedAgencyId();
    if (!agencyId) {
      alert("Choisissez d'abord une agence.");
      return;
    }
    buildLetterheadForm();
    loadLetterheadIntoForm(agencyId);
    document.getElementById("letterheadPanel").hidden = false;
  };

  document.getElementById("btnCloseLetterhead").onclick = function () {
    document.getElementById("letterheadPanel").hidden = true;
  };

  document.getElementById("btnSaveLetterhead").onclick = function () {
    var agencyId = selectedAgencyId();
    if (!agencyId) return;
    var data = {};
    document.querySelectorAll("[data-lh]").forEach(function (el) {
      data[el.getAttribute("data-lh")] = el.value.trim();
    });
    Brand.saveLetterhead(agencyId, data);
    document.getElementById("letterheadPanel").hidden = true;
    paintHub(window._formCatalog || []);
    alert("En-tête enregistré pour cette agence.");
  };

  fillPropertySelect();
  buildLetterheadForm();

  fetch("/api/crm/immo-document", {
    headers: { Authorization: "Bearer " + token },
  })
    .then(function (r) {
      return r.json();
    })
    .then(function (res) {
      if (!res.ok || !res.catalog) throw new Error("Catalogue indisponible");
      if (res.agencies) Brand.setServerAgencies(res.agencies);
      fillAgencySelect(res.agencies);
      paintHub(res.catalog);
    })
    .catch(function (e) {
      document.getElementById("hubStatus").textContent =
        "Impossible de charger les modèles : " + String(e);
    });
})();
