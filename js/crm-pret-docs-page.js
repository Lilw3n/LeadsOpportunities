(function () {
  "use strict";

  var Search = window.CrmPretDocSearch;
  if (!Search) return;
  if (!localStorage.getItem("lo_token")) {
    location.href = "./crm.html";
    return;
  }

  var els = {
    q: document.getElementById("gQuery"),
    age: document.getElementById("gAge"),
    prop: document.getElementById("gProp"),
    cat: document.getElementById("gCat"),
    partner: document.getElementById("gPartner"),
    region: document.getElementById("gRegion"),
    source: document.getElementById("gSource"),
    group: document.getElementById("gGroup"),
    btn: document.getElementById("gSearch"),
    chips: document.getElementById("gChips"),
    advice: document.getElementById("gAdvice"),
    playbook: document.getElementById("gPlaybook"),
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
      region: els.region.value,
      source: els.source ? els.source.value : ""
    };
  }

  function fillSelects() {
    els.cat.innerHTML =
      '<option value="">Toutes catégories</option>' +
      Search.allCategories()
        .map(function (c) {
          return '<option value="' + esc(c.id) + '">' + esc((c.short || c.id) + " — " + c.label) + "</option>";
        })
        .join("");
    els.partner.innerHTML =
      '<option value="">Tous partenaires</option>' +
      Search.allPartners()
        .map(function (p) {
          return '<option value="' + esc(p.id) + '">' + esc(p.label) + "</option>";
        })
        .join("");
  }

  function renderChips() {
    els.chips.innerHTML = Search.examples()
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
    if (doc.status === "available" && doc.path) return '<span class="g-badge ok">Disponible</span>';
    if ((doc.flags || []).indexOf("suspendu") >= 0) return '<span class="g-badge warn">Suspendu</span>';
    return '<span class="g-badge pending">À déposer</span>';
  }

  function sourceBadge(source) {
    return source === "grilles"
      ? '<span class="g-badge grille">Grille</span>'
      : '<span class="g-badge fiche">Fiche</span>';
  }

  function kindIcon(kind, source) {
    if (kind === "outil") return "📊";
    if (kind === "formulaire") return "📝";
    if (kind === "liste" || kind === "book" || kind === "memento") return "📋";
    if (kind === "assurance") return "🛡";
    if (kind === "interne" || kind === "conformite") return "📁";
    return source === "grilles" ? "📈" : "📄";
  }

  function run() {
    var out = Search.search(els.q.value, filters());
    els.parsed.innerHTML = "<strong>Compris :</strong> " + esc(Search.explainQuery(out.query));

    /* Playbook */
    if (els.playbook) {
      if (!out.playbook.steps.length) {
        els.playbook.innerHTML = "";
      } else {
        els.playbook.innerHTML =
          '<div class="g-play">' +
          "<h3>Parcours conseillé</h3>" +
          out.playbook.steps
            .map(function (s) {
              return "<div class='g-play-step'><strong>" + esc(s.title) + "</strong><p>" + esc(s.detail) + "</p></div>";
            })
            .join("") +
          (out.playbook.topPartners.length
            ? "<p class='g-play-partners'><strong>Partenaires en tête :</strong> " +
              esc(out.playbook.topPartners.join(" · ")) +
              "</p>"
            : "") +
          "</div>";
      }
    }

    if (!out.advice.length) {
      els.advice.innerHTML =
        '<div class="g-advice muted">Affinez la question (âge, locataire/propriétaire, RAC/SCPI, région…) pour activer les conseils d’éligibilité.</div>';
    } else {
      els.advice.innerHTML = out.advice
        .map(function (a) {
          var todos = (a.todoValidate || []).length
            ? "<ul>" +
              a.todoValidate
                .map(function (t) {
                  return "<li>À valider : " + esc(t) + "</li>";
                })
                .join("") +
              "</ul>"
            : "";
          return (
            '<div class="g-advice"><div class="g-advice-hd"><strong>' +
            esc(a.label) +
            '</strong> <span class="g-badge draft">' +
            esc(a.confidence) +
            "</span></div><p>" +
            esc(a.text) +
            "</p>" +
            todos +
            "</div>"
          );
        })
        .join("");
    }

    els.meta.textContent =
      out.stats.total +
      " résultat(s) — " +
      out.stats.grilles +
      " grille(s) · " +
      out.stats.fiches +
      " fiche(s) · " +
      out.rules.length +
      " règle(s)";

    if (!out.results.length) {
      els.results.innerHTML =
        '<p class="g-empty">Aucun document pertinent. Essayez une puce d’exemple ou élargissez les filtres.</p>';
      return;
    }

    var mode = (els.group && els.group.value) || "source";
    var groups = Search.groupResults(out.results.slice(0, 120), mode);
    els.results.innerHTML = groups
      .map(function (g) {
        return (
          '<section class="g-cat"><h3>' +
          esc(g.label) +
          " <small>" +
          g.items.length +
          "</small></h3><ul class='g-list'>" +
          g.items
            .map(function (r) {
              var doc = r.doc;
              var link =
                doc.path && doc.status === "available"
                  ? '<a href="' + esc(doc.path) + '" target="_blank" rel="noopener">' + esc(doc.filename) + "</a>"
                  : "<span>" + esc(doc.filename) + "</span>";
              return (
                "<li><div class='g-file'><span class='g-ico'>" +
                kindIcon(doc.kind, r.source) +
                "</span><div><strong>" +
                esc(doc.title) +
                "</strong> " +
                sourceBadge(r.source) +
                " " +
                statusBadge(doc) +
                "<div class='g-file-meta'>" +
                esc(r.partnerLabel) +
                " · " +
                esc(r.categoryLabel) +
                " · " +
                esc(r.regionLabel) +
                (doc.period ? " · " + esc(doc.period) : "") +
                " · score " +
                Math.round(r.score) +
                "</div>" +
                link +
                ((r.reasons || []).length
                  ? "<div class='g-reasons'>" + esc(r.reasons.join(" · ")) + "</div>"
                  : "") +
                "</div></div></li>"
              );
            })
            .join("") +
          "</ul></section>"
        );
      })
      .join("");
  }

  function boot() {
    fillSelects();
    renderChips();
    var params = new URLSearchParams(location.search);
    if (params.get("q")) els.q.value = params.get("q");
    if (params.get("age")) els.age.value = params.get("age");
    if (params.get("source") && els.source) els.source.value = params.get("source");
    run();
  }

  els.btn.onclick = run;
  els.q.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      run();
    }
  });
  [els.age, els.prop, els.cat, els.partner, els.region, els.source, els.group].forEach(function (el) {
    if (el) el.addEventListener("change", run);
  });

  Promise.all([
    fetch("./data/pret-grilles-taux.json", { cache: "no-store" }).then(function (r) {
      return r.json();
    }),
    fetch("./data/pret-fiches-produits.json", { cache: "no-store" }).then(function (r) {
      return r.json();
    })
  ])
    .then(function (pair) {
      Search.setCatalogs(pair[0], pair[1]);
      boot();
    })
    .catch(function (err) {
      els.results.innerHTML =
        '<p class="g-empty">Impossible de charger les catalogues : ' + esc(err.message) + "</p>";
    });
})();
