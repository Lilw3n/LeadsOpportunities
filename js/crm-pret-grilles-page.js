(function () {
  "use strict";

  var Lib = window.CrmPretGrilles;
  if (!Lib) return;
  if (!localStorage.getItem("lo_token")) {
    location.href = "./crm.html";
    return;
  }

  var CATALOG_URL = document.body.getAttribute("data-catalog") || "./data/pret-grilles-taux.json";
  var PAGE_KIND = document.body.getAttribute("data-kind") || "grilles";

  var els = {
    q: document.getElementById("gQuery"),
    age: document.getElementById("gAge"),
    prop: document.getElementById("gProp"),
    cat: document.getElementById("gCat"),
    partner: document.getElementById("gPartner"),
    region: document.getElementById("gRegion"),
    btn: document.getElementById("gSearch"),
    chips: document.getElementById("gChips"),
    advice: document.getElementById("gAdvice"),
    results: document.getElementById("gResults"),
    meta: document.getElementById("gMeta"),
    parsed: document.getElementById("gParsed")
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function filters() {
    return {
      ageMin: els.age.value,
      hasProperty: els.prop.value,
      category: els.cat.value,
      partner: els.partner.value,
      region: els.region.value
    };
  }

  function fillSelects(cat) {
    var catLabel = PAGE_KIND === "fiches" ? "Tous types de prêt" : "Toutes catégories";
    els.cat.innerHTML =
      '<option value="">' + catLabel + "</option>" +
      (cat.categories || [])
        .map(function (c) {
          return '<option value="' + esc(c.id) + '">' + esc(c.short + " — " + c.label) + "</option>";
        })
        .join("");
    els.partner.innerHTML =
      '<option value="">Tous partenaires</option>' +
      (cat.partners || [])
        .map(function (p) {
          return '<option value="' + esc(p.id) + '">' + esc(p.label) + "</option>";
        })
        .join("");
  }

  function pageExamples() {
    if (PAGE_KIND === "fiches") {
      return [
        { q: "personne de plus de 60 ans retraite RAC", label: "60 ans+ retraite / RAC" },
        { q: "locataire RAC sans garantie", label: "Locataire sans garantie" },
        { q: "PVH senior propriétaire", label: "PVH" },
        { q: "travaux rénovation CFCAL", label: "Rénovation" },
        { q: "RAC Réunion avec garantie", label: "DOM-TOM Réunion" },
        { q: "primo acquisition BANK B", label: "Primo BANK B" }
      ];
    }
    return Lib.examples();
  }

  function renderChips() {
    els.chips.innerHTML = pageExamples()
      .map(function (ex) {
        return (
          '<button type="button" class="g-chip" data-q="' +
          esc(ex.q) +
          '">' +
          esc(ex.label) +
          "</button>"
        );
      })
      .join("");
    els.chips.querySelectorAll("[data-q]").forEach(function (btn) {
      btn.onclick = function () {
        els.q.value = btn.getAttribute("data-q");
        run();
      };
    });
  }

  function statusBadge(doc) {
    if (doc.status === "available" && doc.path) {
      return '<span class="g-badge ok">Disponible</span>';
    }
    if ((doc.flags || []).indexOf("suspendu") >= 0) {
      return '<span class="g-badge warn">Suspendu</span>';
    }
    return '<span class="g-badge pending">À déposer</span>';
  }

  function kindIcon(kind) {
    if (kind === "outil") return "📊";
    if (kind === "formulaire") return "📝";
    if (kind === "liste") return "📋";
    return "📄";
  }

  function run() {
    var out = Lib.search(els.q.value, filters());
    var q = out.query;

    els.parsed.innerHTML =
      "<strong>Compris :</strong> " +
      [
        q.ageMin != null ? "âge ≥ " + q.ageMin + " ans" : null,
        q.hasProperty === true ? "avec bien" : q.hasProperty === false ? "sans bien" : null,
        q.need.length ? "besoins : " + q.need.join(", ") : null,
        q.region ? "région : " + Lib.regionLabel(q.region) : null,
        q.category ? "catégorie : " + Lib.categoryLabel(q.category) : null
      ]
        .filter(Boolean)
        .map(esc)
        .join(" · ") ||
      "catalogue complet";

    if (!out.advice.length) {
      els.advice.innerHTML =
        '<div class="g-advice muted">Aucun conseil d’éligibilité automatique pour cette requête. Affinez (âge, RAC, bien, région…) ou parcourez les catégories.</div>';
    } else {
      els.advice.innerHTML = out.advice
        .map(function (a) {
          var todos = (a.todoValidate || []).length
            ? "<ul>" +
              a.todoValidate
                .map(function (t) {
                  return "<li>À valider à l’import : " + esc(t) + "</li>";
                })
                .join("") +
              "</ul>"
            : "";
          return (
            '<div class="g-advice">' +
            '<div class="g-advice-hd"><strong>' +
            esc(a.label) +
            '</strong> <span class="g-badge draft">' +
            esc(a.confidence) +
            "</span></div>" +
            "<p>" +
            esc(a.text) +
            "</p>" +
            todos +
            "</div>"
          );
        })
        .join("");
    }

    els.meta.textContent =
      out.results.length +
      " document(s) · " +
      out.rules.length +
      " règle(s) · catalogue v" +
      ((Lib.getCatalog() && Lib.getCatalog().version) || "?");

    if (!out.results.length) {
      els.results.innerHTML = '<p class="g-empty">Aucun document ne correspond. Essayez une puce d’exemple ou élargissez les filtres.</p>';
      return;
    }

    var groups = Lib.groupByCategory(out.results);
    els.results.innerHTML = groups
      .map(function (g) {
        return (
          '<section class="g-cat">' +
          "<h3>" +
          esc(g.label) +
          " <small>" +
          g.items.length +
          "</small></h3>" +
          '<ul class="g-list">' +
          g.items
            .map(function (r) {
              var doc = r.doc;
              var link =
                doc.path && doc.status === "available"
                  ? '<a href="' +
                    esc(doc.path) +
                    '" target="_blank" rel="noopener">' +
                    esc(doc.filename) +
                    "</a>"
                  : "<span>" + esc(doc.filename) + "</span>";
              var reasons = (r.reasons || []).length
                ? '<div class="g-reasons">' + esc(r.reasons.join(" · ")) + "</div>"
                : "";
              return (
                "<li>" +
                '<div class="g-file">' +
                '<span class="g-ico" aria-hidden="true">' +
                kindIcon(doc.kind) +
                "</span>" +
                "<div>" +
                "<strong>" +
                esc(doc.title) +
                "</strong> " +
                statusBadge(doc) +
                '<div class="g-file-meta">' +
                esc(r.partnerLabel) +
                " · " +
                esc(r.regionLabel) +
                (doc.period ? " · " + esc(doc.period) : "") +
                " · score " +
                Math.round(r.score) +
                "</div>" +
                link +
                reasons +
                (doc.notes ? '<div class="g-notes">' + esc(doc.notes) + "</div>" : "") +
                "</div></div></li>"
              );
            })
            .join("") +
          "</ul></section>"
        );
      })
      .join("");
  }

  function boot(data) {
    Lib.ensureCatalog(data);
    fillSelects(data);
    renderChips();
    var params = new URLSearchParams(location.search);
    if (params.get("q")) els.q.value = params.get("q");
    if (params.get("age")) els.age.value = params.get("age");
    if (params.get("cat")) els.cat.value = params.get("cat");
    run();
  }

  els.btn.onclick = run;
  els.q.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      run();
    }
  });
  ["change"].forEach(function (ev) {
    [els.age, els.prop, els.cat, els.partner, els.region].forEach(function (el) {
      el.addEventListener(ev, run);
    });
  });

  fetch(CATALOG_URL, { cache: "no-store" })
    .then(function (r) {
      if (!r.ok) throw new Error("catalogue introuvable");
      return r.json();
    })
    .then(boot)
    .catch(function (err) {
      els.results.innerHTML =
        '<p class="g-empty">Impossible de charger le catalogue : ' + esc(err.message) + "</p>";
    });
})();
