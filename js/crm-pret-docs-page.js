(function () {
  "use strict";

  var Search = window.CrmPretDocSearch;
  var Store = window.CrmPretImmoStore;
  var Lib = window.CrmPretImmo;
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
    dossier: document.getElementById("gDossier"),
    project: document.getElementById("gProject"),
    btn: document.getElementById("gSearch"),
    chips: document.getElementById("gChips"),
    axisChips: document.getElementById("gAxisChips"),
    advice: document.getElementById("gAdvice"),
    playbook: document.getElementById("gPlaybook"),
    results: document.getElementById("gResults"),
    meta: document.getElementById("gMeta"),
    parsed: document.getElementById("gParsed")
  };

  var extraNeed = "";

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
      source: els.source ? els.source.value : "",
      project: els.project ? els.project.value : "",
      rubrique: "",
      need: extraNeed
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
    if (els.project) {
      els.project.innerHTML =
        '<option value="">Tous / auto</option>' +
        Search.projectAxes()
          .map(function (a) {
            return '<option value="' + esc(a.id) + '">' + esc(a.label) + "</option>";
          })
          .join("");
    }
    if (els.dossier && Store && Lib) {
      var list = Store.list({}).slice(0, 80);
      els.dossier.innerHTML =
        '<option value="">Aucun</option>' +
        list
          .map(function (d) {
            return (
              '<option value="' +
              esc(d.id) +
              '">' +
              esc((d.ref || d.id) + " — " + Lib.typeLabel(d.rubrique) + " — " + (Lib.displayName(d.emprunteur) || "—")) +
              "</option>"
            );
          })
          .join("");
    }
  }

  function markAxisChips() {
    if (!els.axisChips) return;
    var cur = els.project ? els.project.value : "";
    els.axisChips.querySelectorAll("[data-project]").forEach(function (btn) {
      if (btn.getAttribute("data-project") === cur) btn.classList.add("on");
      else btn.classList.remove("on");
    });
  }

  function renderAxisChips() {
    if (!els.axisChips) return;
    var main = ["pret_immo", "ptz", "pret_relais", "pret_conso", "travaux", "rac", "scpi", "sci", "pvh"];
    els.axisChips.innerHTML =
      '<span class="g-axis-label">Projets IMMO</span>' +
      Search.projectAxes()
        .filter(function (a) {
          return main.indexOf(a.id) >= 0;
        })
        .map(function (a) {
          return (
            '<button type="button" class="g-chip axis" data-project="' +
            esc(a.id) +
            '" data-q="' +
            esc(a.q) +
            '">' +
            esc(a.label) +
            "</button>"
          );
        })
        .join("");
    els.axisChips.querySelectorAll("[data-project]").forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute("data-project");
        if (els.project) els.project.value = id;
        els.q.value = btn.getAttribute("data-q") || "";
        extraNeed = "";
        markAxisChips();
        run();
      };
    });
  }

  function renderChips() {
    els.chips.innerHTML = Search.examples()
      .map(function (ex) {
        return (
          '<button type="button" class="g-chip" data-q="' +
          esc(ex.q) +
          '"' +
          (ex.project ? ' data-project="' + esc(ex.project) + '"' : "") +
          ">" +
          esc(ex.label) +
          "</button>"
        );
      })
      .join("");
    els.chips.querySelectorAll("[data-q]").forEach(function (btn) {
      btn.onclick = function () {
        els.q.value = btn.getAttribute("data-q");
        var proj = btn.getAttribute("data-project");
        if (proj && els.project) els.project.value = proj;
        markAxisChips();
        run();
      };
    });
  }

  function applyDossier(id) {
    if (!id || !Store || !Search.contextFromDossier) return;
    var d = Store.get(id);
    if (!d) return;
    var ctx = Search.contextFromDossier(d);
    els.q.value = ctx.q;
    extraNeed = ctx.filters.need || "";
    if (els.project && ctx.filters.project) els.project.value = ctx.filters.project;
    if (ctx.filters.ageMin != null) els.age.value = ctx.filters.ageMin;
    if (ctx.filters.hasProperty === true) els.prop.value = "1";
    else if (ctx.filters.hasProperty === false) els.prop.value = "0";
    if (ctx.filters.partner) els.partner.value = ctx.filters.partner;
    markAxisChips();
  }

  function statusBadge(doc) {
    if (doc.status === "available" && doc.path) return '<span class="g-badge ok">Disponible</span>';
    if ((doc.flags || []).indexOf("suspendu") >= 0) return '<span class="g-badge warn">Suspendu</span>';
    return '<span class="g-badge pending">À déposer</span>';
  }

  function sourceBadge(source) {
    if (source === "grilles") return '<span class="g-badge grille">Grille</span>';
    if (source === "pieces") return '<span class="g-badge pieces">Pièces</span>';
    return '<span class="g-badge fiche">Fiche</span>';
  }

  function kindIcon(kind, source) {
    if (kind === "outil") return "📊";
    if (kind === "formulaire") return "📝";
    if (kind === "liste" || kind === "liste_pieces" || kind === "book" || kind === "memento") return "📋";
    if (kind === "assurance") return "🛡";
    if (kind === "reglementaire" || kind === "conformite") return "⚖";
    if (kind === "interne") return "📁";
    if (source === "pieces") return "📎";
    return source === "grilles" ? "📈" : "📄";
  }

  function run() {
    var f = filters();
    if (els.dossier && els.dossier.value && Store) {
      var d = Store.get(els.dossier.value);
      if (d) {
        var ctx = Search.contextFromDossier(d);
        f.need = [f.need, ctx.filters.need].filter(Boolean).join(",");
        f.rubrique = ctx.rubrique || f.rubrique;
        if (!f.project && ctx.filters.project) f.project = ctx.filters.project;
        if (!f.partner && ctx.filters.partner) f.partner = ctx.filters.partner;
        if ((f.hasProperty === "" || f.hasProperty == null) && ctx.filters.hasProperty != null) {
          f.hasProperty = ctx.filters.hasProperty ? "1" : "0";
        }
        if (!f.ageMin && ctx.filters.ageMin != null) f.ageMin = ctx.filters.ageMin;
      }
    }

    var out = Search.search(els.q.value, f);
    els.parsed.innerHTML = "<strong>Compris :</strong> " + esc(Search.explainQuery(out.query));

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
        '<div class="g-advice muted">Choisissez un axe projet (PTZ, relais, travaux…) ou un dossier pour activer les conseils d’éligibilité.</div>';
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
      (out.stats.pieces || 0) +
      " pièce(s)/réglem. · " +
      out.rules.length +
      " règle(s)";

    if (!out.results.length) {
      els.results.innerHTML =
        '<p class="g-empty">Aucun document pertinent. Essayez un axe projet, une puce d’exemple ou élargissez les filtres.</p>';
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
    renderAxisChips();
    renderChips();
    var params = new URLSearchParams(location.search);
    if (params.get("q")) els.q.value = params.get("q");
    if (params.get("age")) els.age.value = params.get("age");
    if (params.get("source") && els.source) els.source.value = params.get("source");
    if (params.get("partner") && els.partner) els.partner.value = params.get("partner");
    if (params.get("prop") != null && els.prop) els.prop.value = params.get("prop");
    if (params.get("project") && els.project) els.project.value = params.get("project");
    if (params.get("need")) extraNeed = params.get("need");
    if (params.get("dossierId") && els.dossier) {
      els.dossier.value = params.get("dossierId");
      applyDossier(params.get("dossierId"));
    }
    markAxisChips();
    run();
  }

  els.btn.onclick = run;
  els.q.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      run();
    }
  });
  [els.age, els.prop, els.cat, els.partner, els.region, els.source, els.group, els.project].forEach(function (el) {
    if (el) el.addEventListener("change", function () {
      markAxisChips();
      run();
    });
  });
  if (els.dossier) {
    els.dossier.addEventListener("change", function () {
      applyDossier(els.dossier.value);
      run();
    });
  }

  Promise.all([
    fetch("./data/pret-grilles-taux.json", { cache: "no-store" }).then(function (r) {
      return r.json();
    }),
    fetch("./data/pret-fiches-produits.json", { cache: "no-store" }).then(function (r) {
      return r.json();
    }),
    fetch("./data/pret-pieces-reglementaires.json", { cache: "no-store" }).then(function (r) {
      return r.json();
    })
  ])
    .then(function (triple) {
      Search.setCatalogs(triple[0], triple[1], triple[2]);
      boot();
    })
    .catch(function (err) {
      els.results.innerHTML =
        '<p class="g-empty">Impossible de charger les catalogues : ' + esc(err.message) + "</p>";
    });
})();
