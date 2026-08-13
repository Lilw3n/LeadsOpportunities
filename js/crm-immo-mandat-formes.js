/**
 * Comparatif formes / types de mandats immobiliers (FR).
 * Distingue audience « general » (droit) vs « agence » (pratiques réseau).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.CrmImmoMandatFormes = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  var CATALOG_URL = "./data/immo-mandat-formes.json";
  var cache = null;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function loadCatalog() {
    if (cache) return Promise.resolve(cache);
    return fetch(CATALOG_URL, { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("Catalogue mandats indisponible");
        return r.json();
      })
      .then(function (data) {
        cache = data;
        return data;
      });
  }

  function normalizeFormeKey(raw) {
    var s = String(raw || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    if (!s) return "";
    if (s.indexOf("semi") !== -1) return "semi_exclusif";
    if (s.indexOf("exclus") !== -1) return "exclusif";
    if (s.indexOf("simple") !== -1) return "simple";
    return s;
  }

  function normalizeTypeKey(raw) {
    var s = String(raw || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    if (!s) return "";
    if (s.indexOf("loc") !== -1) return "location";
    if (s.indexOf("rech") !== -1) return "recherche";
    if (s.indexOf("estim") !== -1) return "estimation";
    if (s.indexOf("vente") !== -1) return "vente";
    return s;
  }

  function findForme(catalog, idOrLabel) {
    var key = normalizeFormeKey(idOrLabel);
    if (!key || !catalog || !catalog.formes) return null;
    return (
      catalog.formes.find(function (f) {
        return f.id === key || normalizeFormeKey(f.schemaValue) === key || normalizeFormeKey(f.label) === key;
      }) || null
    );
  }

  function findType(catalog, idOrLabel) {
    var key = normalizeTypeKey(idOrLabel);
    if (!key || !catalog || !catalog.types) return null;
    return (
      catalog.types.find(function (t) {
        return t.id === key || normalizeTypeKey(t.label) === key;
      }) || null
    );
  }

  function filterByAudience(items, audienceFilter) {
    if (!audienceFilter || audienceFilter === "all") return items || [];
    return (items || []).filter(function (it) {
      return !it.audience || it.audience === audienceFilter;
    });
  }

  function buildClauses(opts) {
    opts = opts || {};
    var forme = opts.forme;
    var type = opts.type;
    var prop = opts.property || null;
    var details = (prop && prop.details) || {};
    var lines = [];

    lines.push("=== BROUILLON MANDAT (à faire valider juridiquement) ===");
    lines.push("");
    if (type) {
      lines.push("Type : Mandat de " + (type.label || type.id).toLowerCase() + ".");
    }
    if (forme) {
      lines.push("Forme : " + (forme.label || forme.id) + ".");
      lines.push("");
      (forme.clausesDraft || []).forEach(function (c) {
        lines.push("• " + c);
      });
    }
    lines.push("");
    lines.push("--- Mentions à compléter ---");
    if (details.n_mandat) lines.push("N° mandat : " + details.n_mandat);
    else lines.push("N° mandat : ________");
    if (details.date_mandat) lines.push("Date : " + details.date_mandat);
    else lines.push("Date : ________");
    if (details.date_echeance) lines.push("Échéance : " + details.date_echeance);
    else lines.push("Échéance : ________");
    if (prop) {
      lines.push(
        "Bien : " +
          (prop.title || "") +
          (prop.city ? " — " + prop.city : "") +
          (prop.postal_code ? " (" + prop.postal_code + ")" : "")
      );
    }
    if (details.designation_bien) {
      lines.push("Désignation : " + String(details.designation_bien).replace(/\s+/g, " ").trim());
    } else {
      lines.push("Désignation du bien : ________");
    }
    lines.push("Prix / loyer convenu : ________");
    lines.push("Honoraires (montant ou %) et charge : ________");
    if (details.notaire) {
      lines.push("Notaire : " + String(details.notaire).replace(/\s+/g, " ").trim());
    }
    if (details.mandat_hors_etablissement === true || details.mandat_hors_etablissement === "oui") {
      lines.push("");
      lines.push(
        "[Hors établissement] Informer le mandant de son droit de rétractation (Code de la consommation) et joindre le formulaire."
      );
    }
    if (details.info_mandat) {
      lines.push("");
      lines.push("Infos complémentaires fiche :");
      lines.push(String(details.info_mandat).trim());
    }
    lines.push("");
    lines.push(
      "Rappel : document de travail CRM — ne remplace pas le modèle signé conforme à la loi Hoguet et aux règles du réseau."
    );
    return lines.join("\n");
  }

  function buildTitle(forme, type, prop) {
    var parts = ["Mandat"];
    if (type && type.label) parts.push(type.label.toLowerCase());
    if (forme && forme.label) parts.push("(" + forme.label + ")");
    if (prop && prop.title) parts.push("— " + prop.title);
    return parts.join(" ");
  }

  function audienceBadge(audience) {
    if (audience === "agence") {
      return '<span class="mandat-badge mandat-badge--agence">Agence</span>';
    }
    return '<span class="mandat-badge mandat-badge--general">Général</span>';
  }

  function renderComparatif(mount, catalog, opts) {
    if (!mount || !catalog) return;
    opts = opts || {};
    var audience = opts.audience || "all";
    var selectedForme = opts.selectedForme || "";
    var selectedType = opts.selectedType || "";

    var formes = catalog.formes || [];
    var types = catalog.types || [];

    var html = [];
    html.push('<div class="mandat-comparatif">');
    html.push('<div class="mandat-comparatif__head">');
    html.push("<div>");
    html.push("<h3>Comparatif des formes de mandat</h3>");
    html.push(
      "<p class=\"mandat-muted\">Droit général vs pratiques agence — utile avant de créer le brouillon. " +
        "Déposez votre PDF réseau dans <code>docs/immo-mandats/_inbox/</code> pour affiner.</p>"
    );
    html.push("</div>");
    html.push('<div class="mandat-filters">');
    html.push('<label>Afficher ');
    html.push('<select id="mandatAudienceFilter">');
    html.push('<option value="all"' + (audience === "all" ? " selected" : "") + ">Tout</option>");
    html.push(
      '<option value="general"' +
        (audience === "general" ? " selected" : "") +
        ">Droit / général</option>"
    );
    html.push(
      '<option value="agence"' + (audience === "agence" ? " selected" : "") + ">Pratiques agence</option>"
    );
    html.push("</select></label>");
    html.push("</div></div>");

    html.push('<div class="mandat-forme-cards">');
    formes.forEach(function (f) {
      var active = normalizeFormeKey(selectedForme) === f.id ? " is-active" : "";
      html.push(
        '<button type="button" class="mandat-forme-card' +
          active +
          '" data-forme="' +
          esc(f.id) +
          '">'
      );
      html.push("<strong>" + esc(f.label) + "</strong>");
      html.push(audienceBadge(f.audience || "general"));
      html.push("<p>" + esc(f.tagline || "") + "</p>");
      html.push("</button>");
    });
    html.push("</div>");

    html.push('<div class="mandat-type-row">');
    html.push("<span>Type :</span>");
    types.forEach(function (t) {
      var active = normalizeTypeKey(selectedType) === t.id ? " is-active" : "";
      html.push(
        '<button type="button" class="mandat-chip' +
          active +
          '" data-type="' +
          esc(t.id) +
          '">' +
          esc(t.label) +
          " " +
          audienceBadge(t.audience || "general") +
          "</button>"
      );
    });
    html.push("</div>");

    var forme = findForme(catalog, selectedForme) || formes[0];
    var type = findType(catalog, selectedType) || types[0];

    if (forme) {
      html.push('<div class="mandat-detail">');
      html.push("<h4>" + esc(forme.label) + " — " + esc((type && type.label) || "") + "</h4>");
      if (type && type.summary) {
        html.push("<p>" + esc(type.summary) + "</p>");
        if (type.agencyNote && (audience === "all" || audience === "agence")) {
          html.push(
            '<p class="mandat-agence-note">' +
              audienceBadge("agence") +
              " " +
              esc(type.agencyNote) +
              "</p>"
          );
        }
      }

      var cmp = forme.comparison || {};
      html.push('<dl class="mandat-dl">');
      Object.keys(cmp).forEach(function (k) {
        var labels = {
          nbIntermediaires: "Intermédiaires",
          venteDirecteMandant: "Vente directe mandant",
          honorairesQuand: "Honoraires",
          engagementAgence: "Engagement agence",
          dureeTypique: "Durée typique",
          resiliation: "Résiliation",
        };
        html.push("<div><dt>" + esc(labels[k] || k) + "</dt><dd>" + esc(cmp[k]) + "</dd></div>");
      });
      html.push("</dl>");

      var points = filterByAudience(forme.points, audience);
      if (points.length) {
        html.push("<ul class=\"mandat-points\">");
        points.forEach(function (p) {
          html.push(
            "<li>" + audienceBadge(p.audience || "general") + " " + esc(p.text) + "</li>"
          );
        });
        html.push("</ul>");
      }

      var mentions = filterByAudience(catalog.mentionsObligatoires, audience);
      if (mentions.length) {
        html.push("<h4>Mentions & points de vigilance</h4><ul class=\"mandat-points\">");
        mentions.forEach(function (m) {
          html.push(
            "<li>" + audienceBadge(m.audience || "general") + " " + esc(m.text) + "</li>"
          );
        });
        html.push("</ul>");
      }

      html.push('<div class="mandat-cta-row">');
      html.push(
        '<button type="button" class="btn btn-primary" id="btnCreateMandatDraft">Créer un brouillon mandat</button>'
      );
      html.push(
        '<button type="button" class="btn btn-primary" id="btnOpenStructuredMandat" style="background:#0f766e">Formulaire sans exclusivité</button>'
      );
      html.push(
        '<button type="button" class="btn btn-ghost" id="btnPrefillFromProperty">Préremplir depuis le bien filtré</button>'
      );
      html.push(
        '<a class="btn btn-ghost" href="./crm-agency-fees.html">Barème honoraires</a>'
      );
      html.push("</div>");
      html.push("</div>");
    }

    html.push("</div>");
    mount.innerHTML = html.join("");

    return {
      formeId: forme ? forme.id : "",
      typeId: type ? type.id : "",
      forme: forme,
      type: type,
    };
  }

  function extractFromProperty(prop) {
    var d = (prop && prop.details) || {};
    return {
      forme: d.forme_mandat || "",
      type: d.type_mandat || "",
      numero: d.n_mandat || "",
      dateDebut: d.date_mandat || "",
      dateEcheance: d.date_echeance || "",
      notes: d.info_mandat || "",
      designation: d.designation_bien || "",
      notaire: d.notaire || "",
      horsEtablissement: d.mandat_hors_etablissement,
    };
  }

  return {
    CATALOG_URL: CATALOG_URL,
    loadCatalog: loadCatalog,
    normalizeFormeKey: normalizeFormeKey,
    normalizeTypeKey: normalizeTypeKey,
    findForme: findForme,
    findType: findType,
    filterByAudience: filterByAudience,
    buildClauses: buildClauses,
    buildTitle: buildTitle,
    renderComparatif: renderComparatif,
    extractFromProperty: extractFromProperty,
    audienceBadge: audienceBadge,
  };
});
