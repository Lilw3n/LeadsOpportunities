/**
 * Hub public /niches/ — catalogue SEO niches, spotlight live, roadmap.
 */
(function () {
  var DATA_URL = "../seo/niches.json";
  var state = { filter: "all", query: "", data: null };

  function $(id) {
    return document.getElementById(id);
  }

  function esc(s) {
    if (!s) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function pathHref(p) {
    if (!p) return "#";
    if (p.indexOf("http") === 0) return p;
    return ".." + p;
  }

  function matchesFilter(n) {
    if (state.filter === "live" && n.status !== "live") return false;
    if (state.filter === "planned" && n.status !== "planned") return false;
    if (state.filter !== "all" && state.filter !== "live" && state.filter !== "planned") {
      if (n.category !== state.filter) return false;
    }
    if (state.query) {
      var blob = [n.label, n.tagline, n.id, (n.keywords || []).join(" "), (n.highlights || []).join(" ")]
        .join(" ")
        .toLowerCase();
      if (blob.indexOf(state.query) === -1) return false;
    }
    return true;
  }

  function renderStats(hub) {
    var el = $("nichesStats");
    if (!el || !hub || !hub.stats) return;
    var s = hub.stats;
    var niches = (state.data && state.data.niches) || [];
    var live = niches.filter(function (n) {
      return n.status === "live";
    }).length;
    el.innerHTML =
      statBlock(String(live), "Niches en ligne") +
      statBlock(String(s.seoPagesApprox || "950+"), "Pages SEO") +
      statBlock(String(s.cityPagesApprox || "567+"), "Pages ville") +
      statBlock(String(niches.length), "Verticales catalogue");
  }

  function statBlock(val, label) {
    return '<div class="niches-stat"><strong>' + esc(val) + "</strong><span>" + esc(label) + "</span></div>";
  }

  function renderPillars(hub) {
    var el = $("nichesPillars");
    if (!el || !hub || !hub.pillars) return;
    el.innerHTML = hub.pillars
      .map(function (p) {
        return (
          '<article class="niches-pillar"><h3>' +
          esc(p.title) +
          "</h3><p>" +
          esc(p.text) +
          "</p></article>"
        );
      })
      .join("");
  }

  function renderSpotlight(niches) {
    var el = $("nichesSpotlight");
    if (!el) return;
    var featured = niches
      .filter(function (n) {
        return n.status === "live" && n.featured;
      })
      .sort(function (a, b) {
        return (a.priority || 99) - (b.priority || 99);
      });
    if (!featured.length) {
      el.hidden = true;
      return;
    }
    el.hidden = false;
    el.innerHTML = featured.map(spotlightCard).join("");
  }

  function spotlightCard(n) {
    var links = (n.quickLinks || [])
      .slice(0, 8)
      .map(function (l) {
        return '<a href="' + esc(pathHref(l.href)) + '">' + esc(l.label) + "</a>";
      })
      .join("");
    var kws = (n.keywords || [])
      .slice(0, 6)
      .map(function (k) {
        return '<span class="niches-kw">' + esc(k) + "</span>";
      })
      .join("");
    var partners = n.partners && n.partners.length ? '<p class="niches-partners">Partenaires : ' + esc(n.partners.join(", ")) + "</p>" : "";
    return (
      '<article class="niches-spotlight-card">' +
      '<div class="niches-spotlight-head">' +
      '<span class="niches-spotlight-emoji" aria-hidden="true">' +
      (n.emoji || "📋") +
      "</span>" +
      '<span class="niche-status niche-status--live">En ligne · priorité ' +
      (n.priority || "—") +
      "</span>" +
      "<h2>" +
      esc(n.label) +
      "</h2>" +
      "<p>" +
      esc(n.tagline) +
      "</p>" +
      '<div class="niches-spotlight-meta">' +
      (n.pageCount ? "<span>" + n.pageCount + " pages SEO</span>" : "") +
      (n.cityPages ? "<span>" + n.cityPages + " villes</span>" : "") +
      (n.departmentPages ? "<span>" + n.departmentPages + " départements</span>" : "") +
      "</div>" +
      '<div class="niches-spotlight-actions">' +
      '<a class="btn btn-primary btn-sm" href="' +
      esc(pathHref("../" + n.slug + "/")) +
      '">Guide SEO</a>' +
      (n.landing ? '<a class="btn btn-outline btn-sm" href="' + esc(pathHref(n.landing)) + '">Devis complet</a>' : "") +
      (n.landingExpress ? '<a class="btn btn-soft btn-sm" href="' + esc(pathHref(n.landingExpress)) + '">Express</a>' : "") +
      (n.questionnaire ? '<a class="btn btn-soft btn-sm" href="' + esc(pathHref(n.questionnaire)) + '">Questionnaire</a>' : "") +
      "</div>" +
      partners +
      "</div>" +
      '<div class="niches-spotlight-links">' +
      "<p style='margin:0 0 8px;font-weight:700;font-size:.85rem'>Maillage interne</p>" +
      '<div class="niches-quicklinks">' +
      links +
      "</div>" +
      '<div class="niches-kw-row">' +
      kws +
      "</div>" +
      (n.highlights && n.highlights.length
        ? "<ul class='niche-card-highlights' style='margin-top:12px'>" +
          n.highlights
            .map(function (h) {
              return "<li>" + esc(h) + "</li>";
            })
            .join("") +
          "</ul>"
        : "") +
      "</div></article>"
    );
  }

  function renderGrid(niches) {
    var el = $("nichesGrid");
    if (!el) return;
    var filtered = niches.filter(matchesFilter).sort(function (a, b) {
      if (a.status === "live" && b.status !== "live") return -1;
      if (b.status === "live" && a.status !== "live") return 1;
      return (a.priority || 99) - (b.priority || 99);
    });
    if (!filtered.length) {
      el.innerHTML = '<p class="niches-empty">Aucune niche pour ce filtre. <button type="button" class="btn btn-soft btn-sm" id="nichesResetFilters">Réinitialiser</button></p>';
      var reset = document.getElementById("nichesResetFilters");
      if (reset) {
        reset.addEventListener("click", function () {
          state.filter = "all";
          state.query = "";
          var search = $("nichesSearch");
          if (search) search.value = "";
          syncFilterButtons();
          renderGrid(niches);
        });
      }
      return;
    }
    el.innerHTML = filtered.map(gridCard).join("");
  }

  function gridCard(n) {
    var live = n.status === "live";
    var highlights =
      n.highlights && n.highlights.length
        ? "<ul class='niche-card-highlights'>" +
          n.highlights
            .slice(0, 3)
            .map(function (h) {
              return "<li>" + esc(h) + "</li>";
            })
            .join("") +
          "</ul>"
        : "";
    var kws = (n.keywords || [])
      .slice(0, 4)
      .map(function (k) {
        return '<span class="niches-kw">' + esc(k) + "</span>";
      })
      .join("");
    var actions = "";
    if (live && n.slug) {
      actions += '<a class="btn btn-primary btn-sm" href="' + esc(pathHref("../" + n.slug + "/")) + '">Guide SEO</a>';
    }
    if (live && n.landing) {
      actions += '<a class="btn btn-outline btn-sm" href="' + esc(pathHref(n.landing)) + '">Devis</a>';
    }
    if (live && n.landingExpress) {
      actions += '<a class="btn btn-soft btn-sm" href="' + esc(pathHref(n.landingExpress)) + '">Express</a>';
    }
    if (!live && n.landing) {
      actions += '<a class="btn btn-soft btn-sm" href="' + esc(pathHref(n.landing)) + '">Pré-devis</a>';
    }
    if (!live) {
      actions += '<span class="btn btn-soft btn-sm" style="opacity:.65;pointer-events:none">' + esc(n.eta || "Bientôt") + "</span>";
    }
    return (
      '<article class="niche-card' +
      (live ? " niche-card--live" : " niche-card--planned") +
      '" data-niche-id="' +
      esc(n.id) +
      '">' +
      '<span class="niche-emoji" aria-hidden="true">' +
      (n.emoji || "📋") +
      "</span>" +
      '<span class="niche-status' +
      (live ? " niche-status--live" : "") +
      '">' +
      (live ? "En ligne" : "En préparation") +
      "</span>" +
      "<h3>" +
      esc(n.label) +
      "</h3>" +
      '<p class="niche-card-tagline">' +
      esc(n.tagline) +
      "</p>" +
      highlights +
      (kws ? '<div class="niches-kw-row">' + kws + "</div>" : "") +
      (live && n.pageCount ? '<p class="niches-partners">' + n.pageCount + " pages · " + (n.cityPages || 0) + " villes</p>" : "") +
      '<div class="niche-actions">' +
      actions +
      "</div></article>"
    );
  }

  function renderRoadmap(niches) {
    var el = $("nichesRoadmap");
    if (!el) return;
    var planned = niches
      .filter(function (n) {
        return n.status === "planned";
      })
      .sort(function (a, b) {
        return (a.priority || 99) - (b.priority || 99);
      });
    el.innerHTML = planned
      .map(function (n) {
        return (
          '<div class="niches-roadmap-item"><time>' +
          esc(n.eta || "À venir") +
          "</time><span><strong>" +
          esc(n.label) +
          "</strong> — " +
          esc(n.tagline) +
          "</span></div>"
        );
      })
      .join("");
  }

  function renderFaq(hub) {
    var el = $("nichesFaq");
    if (!el || !hub || !hub.faq) return;
    el.innerHTML = hub.faq
      .map(function (item) {
        return "<details><summary>" + esc(item.q) + "</summary><p>" + esc(item.a) + "</p></details>";
      })
      .join("");
  }

  function renderFilters(categories) {
    var el = $("nichesFilters");
    if (!el) return;
    var cats = [
      { id: "all", label: "Tout" },
      { id: "live", label: "En ligne" },
      { id: "planned", label: "Bientôt" },
    ];
    (categories || []).forEach(function (c) {
      cats.push(c);
    });
    el.innerHTML = cats
      .map(function (c) {
        return (
          '<button type="button" class="niches-filter' +
          (c.id === state.filter ? " is-active" : "") +
          '" data-filter="' +
          c.id +
          '">' +
          esc(c.label) +
          "</button>"
        );
      })
      .join("");
    el.querySelectorAll(".niches-filter").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.filter = btn.getAttribute("data-filter");
        syncFilterButtons();
        renderGrid(state.data.niches);
      });
    });
  }

  function syncFilterButtons() {
    var el = $("nichesFilters");
    if (!el) return;
    el.querySelectorAll(".niches-filter").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-filter") === state.filter);
    });
  }

  function applyHubMeta(hub) {
    if (hub.title && document.querySelector(".niches-hero h1")) {
      document.querySelector(".niches-hero h1").textContent = hub.title;
    }
    var intro = $("nichesIntro");
    var lead = $("nichesLead");
    if (intro && hub.intro) intro.textContent = hub.intro;
    if (lead && hub.lead) lead.textContent = hub.lead;
  }

  function renderAll(data) {
    state.data = data;
    var hub = data.hub || {};
    var niches = data.niches || [];
    applyHubMeta(hub);
    renderStats(hub);
    renderPillars(hub);
    renderSpotlight(niches);
    renderGrid(niches);
    renderRoadmap(niches);
    renderFaq(hub);
    renderFilters(data.categories);
  }

  function bindSearch() {
    var search = $("nichesSearch");
    if (!search) return;
    search.addEventListener("input", function () {
      state.query = search.value.trim().toLowerCase();
      if (state.data) renderGrid(state.data.niches);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!$("nichesGrid")) return;
    bindSearch();
    fetch(DATA_URL)
      .then(function (r) {
        return r.json();
      })
      .then(renderAll)
      .catch(function () {
        $("nichesGrid").innerHTML =
          '<p class="niches-empty">Chargement impossible. <a href="../assurance-animaux/">Assurance animaux</a> · <a href="../assurance-chasse/">Chasse</a> · <a href="../assurance-equitation/">Équitation</a>.</p>';
      });
  });
})();
