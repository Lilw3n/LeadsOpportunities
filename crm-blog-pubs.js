(function () {
  var TOKEN_KEY = "lo_token";
  var token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  var catalog = null;
  var META_ADS = "https://adsmanager.facebook.com/";

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function escAttr(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function copyText(text, btn) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(
      function () {
        if (btn) {
          var old = btn.textContent;
          btn.textContent = "Copié ✓";
          setTimeout(function () {
            btn.textContent = old;
          }, 1400);
        }
      },
      function () {
        prompt("Copier :", text);
      }
    );
  }

  function pathFromUrl(url) {
    try {
      var u = new URL(url, location.origin);
      return u.pathname + u.search;
    } catch (e) {
      return url || "#";
    }
  }

  function domainHint(url) {
    try {
      return new URL(url, location.origin).hostname.replace(/^www\./, "");
    } catch (e) {
      return "leadsopportunities.fr";
    }
  }

  function packCopy(item) {
    return (
      "Titre : " +
      (item.headline || "") +
      "\nTexte : " +
      (item.primary_text || "") +
      "\nURL : " +
      (item.article_url || "") +
      "\nLanding : " +
      (item.conversion_landing || "") +
      "\nCampagne : " +
      (item.meta_campaign || "") +
      "\nBudget : " +
      (item.budget_eur_day || "") +
      " €/j"
    );
  }

  function prioritySortKey(p) {
    var s = String(p == null ? "" : p);
    var m = s.match(/^(\d+)([a-z]*)$/i);
    if (!m) return [999, s];
    return [Number(m[1]) || 999, m[2] || ""];
  }

  function getFilters() {
    return {
      vertical: (document.getElementById("blogPubsVertical") || {}).value || "",
      dest: (document.getElementById("blogPubsDest") || {}).value || "",
      q: ((document.getElementById("blogPubsSearch") || {}).value || "").trim().toLowerCase(),
      sort: (document.getElementById("blogPubsSort") || {}).value || "priority",
    };
  }

  function filteredItems() {
    if (!catalog) return [];
    var f = getFilters();
    var list = (catalog.items || []).slice();
    if (f.vertical) {
      list = list.filter(function (it) {
        return it.vertical === f.vertical;
      });
    }
    if (f.dest) {
      list = list.filter(function (it) {
        return it.destination_type === f.dest;
      });
    }
    if (f.q) {
      list = list.filter(function (it) {
        var blob = [
          it.slug,
          it.title,
          it.headline,
          it.primary_text,
          it.meta_campaign,
          it.notes,
          it.vertical_label,
        ]
          .join(" ")
          .toLowerCase();
        return blob.indexOf(f.q) !== -1;
      });
    }
    if (f.sort === "vertical") {
      list.sort(function (a, b) {
        return String(a.vertical).localeCompare(String(b.vertical)) || String(a.slug).localeCompare(String(b.slug));
      });
    } else if (f.sort === "budget") {
      list.sort(function (a, b) {
        return (b.budget_eur_day || 0) - (a.budget_eur_day || 0);
      });
    } else {
      list.sort(function (a, b) {
        var ka = prioritySortKey(a.priority);
        var kb = prioritySortKey(b.priority);
        if (ka[0] !== kb[0]) return ka[0] - kb[0];
        if (ka[1] !== kb[1]) return ka[1] < kb[1] ? -1 : 1;
        return String(a.slug).localeCompare(String(b.slug));
      });
    }
    return list;
  }

  function renderStats() {
    var el = document.getElementById("blogPubsStats");
    if (!el || !catalog) return;
    var c = catalog.counts || {};
    var shown = filteredItems().length;
    el.innerHTML =
      '<div class="blog-pubs-stat"><p class="lbl">Créas catalogue</p><div class="num">' +
      esc(c.total || 0) +
      '</div></div>' +
      '<div class="blog-pubs-stat"><p class="lbl">Articles blog</p><div class="num">' +
      esc(c.blog || 0) +
      '</div><div class="sub">tiède → bridge</div></div>' +
      '<div class="blog-pubs-stat"><p class="lbl">Landings directes</p><div class="num">' +
      esc(c.direct || 0) +
      '</div><div class="sub">intent chaud</div></div>' +
      '<div class="blog-pubs-stat"><p class="lbl">Affichées</p><div class="num">' +
      esc(shown) +
      '</div><div class="sub">filtre actuel</div></div>';
  }

  function renderVerticalSelect() {
    var sel = document.getElementById("blogPubsVertical");
    if (!sel || !catalog) return;
    var cur = sel.value;
    var labels = catalog.vertical_labels || {};
    var counts = (catalog.counts && catalog.counts.verticals) || {};
    var keys = Object.keys(counts).sort();
    sel.innerHTML =
      '<option value="">Toutes</option>' +
      keys
        .map(function (k) {
          return (
            '<option value="' +
            escAttr(k) +
            '">' +
            esc(labels[k] || k) +
            " (" +
            counts[k] +
            ")</option>"
          );
        })
        .join("");
    if (cur) sel.value = cur;
  }

  function renderChips() {
    var el = document.getElementById("blogPubsChips");
    if (!el || !catalog) return;
    var labels = catalog.vertical_labels || {};
    var counts = (catalog.counts && catalog.counts.verticals) || {};
    var active = (document.getElementById("blogPubsVertical") || {}).value || "";
    var html =
      '<button type="button" class="blog-pubs-chip' +
      (!active ? " is-active" : "") +
      '" data-v="">Toutes</button>';
    Object.keys(counts)
      .sort()
      .forEach(function (k) {
        html +=
          '<button type="button" class="blog-pubs-chip' +
          (active === k ? " is-active" : "") +
          '" data-v="' +
          escAttr(k) +
          '">' +
          esc(labels[k] || k) +
          '<span class="n">' +
          counts[k] +
          "</span></button>";
      });
    el.innerHTML = html;
    el.querySelectorAll(".blog-pubs-chip").forEach(function (btn) {
      btn.onclick = function () {
        var sel = document.getElementById("blogPubsVertical");
        if (sel) sel.value = btn.getAttribute("data-v") || "";
        renderAll();
      };
    });
  }

  function renderCard(item) {
    var destCls = item.destination_type === "direct_landing" ? "hot" : "meta";
    var destLabel = item.destination_label || item.destination_type || "";
    var articlePath = pathFromUrl(item.article_url);
    var landingPath = pathFromUrl(item.conversion_landing);
    return (
      '<article class="blog-pubs-card" data-slug="' +
      escAttr(item.slug) +
      '">' +
      '<div class="blog-pubs-card-top">' +
      '<span class="blog-pubs-prio">P' +
      esc(item.priority) +
      "</span>" +
      '<span class="acq-badge">' +
      esc(item.vertical_label || item.vertical) +
      "</span>" +
      '<span class="acq-badge ' +
      destCls +
      '">' +
      esc(destLabel) +
      "</span>" +
      '<span class="blog-pubs-budget">' +
      esc(item.budget_eur_day || "—") +
      " €/j</span>" +
      "</div>" +
      '<div class="blog-pubs-mock">' +
      '<div class="blog-pubs-mock-head">' +
      '<div class="blog-pubs-avatar" aria-hidden="true"></div>' +
      "<div><strong>Leads Opportunities</strong><span>Sponsorisé · Meta</span></div>" +
      "</div>" +
      '<div class="blog-pubs-mock-body">' +
      '<p class="blog-pubs-primary">' +
      esc(item.primary_text) +
      "</p>" +
      '<a class="blog-pubs-mock-link" href="' +
      escAttr(articlePath) +
      '" target="_blank" rel="noopener">' +
      '<div class="domain">' +
      esc(domainHint(item.article_url)) +
      "</div>" +
      '<div class="hl">' +
      esc(item.headline) +
      "</div>" +
      '<span class="blog-pubs-mock-cta">En savoir plus</span>' +
      "</a></div></div>" +
      '<div class="blog-pubs-meta">' +
      "<div><strong>Campagne</strong> <code>" +
      esc(item.meta_campaign) +
      "</code></div>" +
      "<div style=\"margin-top:4px\"><strong>Slug</strong> <code>" +
      esc(item.slug) +
      "</code></div>" +
      (item.title && item.title !== item.headline
        ? '<div style="margin-top:4px"><strong>Article</strong> ' + esc(item.title) + "</div>"
        : "") +
      "</div>" +
      (item.notes ? '<p class="blog-pubs-notes">' + esc(item.notes) + "</p>" : "") +
      '<div class="blog-pubs-actions">' +
      '<button type="button" class="btn btn-primary btn-sm js-copy" data-copy="' +
      escAttr(item.primary_text) +
      '">Copier texte</button>' +
      '<button type="button" class="btn btn-ghost btn-sm js-copy" data-copy="' +
      escAttr(item.headline) +
      '">Copier titre</button>' +
      '<button type="button" class="btn btn-ghost btn-sm js-copy" data-copy="' +
      escAttr(item.article_url) +
      '">Copier URL</button>' +
      '<button type="button" class="btn btn-ghost btn-sm js-copy" data-copy="' +
      escAttr(packCopy(item)) +
      '">Tout copier</button>' +
      '<a class="btn btn-ghost btn-sm" href="' +
      escAttr(articlePath) +
      '" target="_blank" rel="noopener">Ouvrir destination ↗</a>' +
      (item.conversion_landing
        ? '<a class="btn btn-ghost btn-sm" href="' +
          escAttr(landingPath) +
          '" target="_blank" rel="noopener">Landing bridge ↗</a>'
        : "") +
      '<a class="btn btn-ghost btn-sm" href="' +
      META_ADS +
      '" target="_blank" rel="noopener">Ads Manager ↗</a>' +
      "</div></article>"
    );
  }

  function renderGrid() {
    var el = document.getElementById("blogPubsGrid");
    if (!el) return;
    var list = filteredItems();
    if (!list.length) {
      el.innerHTML = '<p class="blog-pubs-empty">Aucune créa pour ce filtre.</p>';
      return;
    }
    el.innerHTML = list.map(renderCard).join("");
    el.querySelectorAll(".js-copy").forEach(function (btn) {
      btn.onclick = function () {
        copyText(btn.getAttribute("data-copy"), btn);
      };
    });
  }

  function renderDocs() {
    var el = document.getElementById("blogPubsDocs");
    if (!el || !catalog) return;
    var docs = (catalog.docs || []).slice();
    docs.push({ href: "./ads/meta-blog-conversions.csv", label: "CSV Meta blog conversions" });
    docs.push({ href: "./data/blog-pubs-catalog.json", label: "Catalogue JSON (généré)" });
    el.innerHTML = docs
      .map(function (d) {
        return '<li><a href="' + escAttr(d.href) + '">' + esc(d.label) + "</a></li>";
      })
      .join("");
  }

  function renderAll() {
    renderStats();
    renderChips();
    renderGrid();
  }

  function bindFilters() {
    ["blogPubsVertical", "blogPubsDest", "blogPubsSort"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener("change", renderAll);
    });
    var search = document.getElementById("blogPubsSearch");
    if (search) {
      var t;
      search.addEventListener("input", function () {
        clearTimeout(t);
        t = setTimeout(renderAll, 160);
      });
    }
    var refresh = document.getElementById("btnBlogPubsRefresh");
    if (refresh) refresh.onclick = load;
  }

  function load() {
    var grid = document.getElementById("blogPubsGrid");
    if (grid) grid.innerHTML = '<p class="blog-pubs-loading">Chargement du catalogue…</p>';
    fetch("./data/blog-pubs-catalog.json", { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        catalog = data;
        renderVerticalSelect();
        renderDocs();
        renderAll();
      })
      .catch(function (e) {
        if (grid) {
          grid.innerHTML =
            '<p class="blog-pubs-empty">Impossible de charger le catalogue. Relancer <code>npm run blog:pubs:catalog</code>. (' +
            esc(e.message) +
            ")</p>";
        }
      });
  }

  bindFilters();
  load();
})();
