/**
 * CRM — leads formulaires classés par catégorie.
 */
(function () {
  var token = localStorage.getItem("lo_token");
  if (!token) return;

  var state = {
    page: 1,
    category: "",
    kind: "",
    search: "",
    status: "",
    stats: null,
  };

  var CAT = window.FormLeadCategory || {};

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : s;
    return d.innerHTML;
  }

  function api(path) {
    return fetch(path, { headers: { Authorization: "Bearer " + token } }).then(function (r) {
      return r.json();
    });
  }

  function payloadOf(l) {
    if (l.payload && typeof l.payload === "object") return l.payload;
    try {
      return JSON.parse(l.payload || "{}");
    } catch (e) {
      return {};
    }
  }

  function displayName(l) {
    var p = payloadOf(l);
    var n = [p.firstName || p.first_name, p.lastName || p.last_name].filter(Boolean).join(" ").trim();
    return n || l.email || l.phone || "—";
  }

  function renderChips() {
    var cats = (CAT.categoryList && CAT.categoryList()) || [];
    var kinds = (CAT.kindList && CAT.kindList()) || [];
    var stats = state.stats || { categories: {}, kinds: {}, total: 0 };

    var catHtml =
      '<button type="button" class="crm-filter-chip' +
      (!state.category ? " active" : "") +
      '" data-cat="">Toutes (' +
      (stats.total || 0) +
      ")</button>";
    cats.forEach(function (c) {
      var n = (stats.categories && stats.categories[c.id]) || 0;
      catHtml +=
        '<button type="button" class="crm-filter-chip' +
        (state.category === c.id ? " active" : "") +
        '" data-cat="' +
        esc(c.id) +
        '">' +
        esc(c.label) +
        " (" +
        n +
        ")</button>";
    });
    document.getElementById("flCatChips").innerHTML = catHtml;

    var kindHtml =
      '<button type="button" class="crm-filter-chip' +
      (!state.kind ? " active" : "") +
      '" data-kind="">Tous</button>';
    kinds.forEach(function (k) {
      var n = (stats.kinds && stats.kinds[k.id]) || 0;
      kindHtml +=
        '<button type="button" class="crm-filter-chip' +
        (state.kind === k.id ? " active" : "") +
        '" data-kind="' +
        esc(k.id) +
        '">' +
        esc(k.label) +
        " (" +
        n +
        ")</button>";
    });
    document.getElementById("flKindChips").innerHTML = kindHtml;
  }

  function renderStats(pagination) {
    var s = state.stats || { categories: {}, kinds: {}, total: 0 };
    var q = s.kinds.questionnaire || 0;
    var c = s.kinds.contact_request || 0;
    var r = s.kinds.express_callback || 0;
    document.getElementById("flStats").innerHTML =
      '<div class="kpi-card panel"><div class="kpi-label">Leads formulaires</div><div class="kpi-value">' +
      (s.total || 0) +
      '</div></div>' +
      '<div class="kpi-card panel"><div class="kpi-label">Questionnaires</div><div class="kpi-value">' +
      q +
      '</div></div>' +
      '<div class="kpi-card panel"><div class="kpi-label">Contacts</div><div class="kpi-value">' +
      c +
      '</div></div>' +
      '<div class="kpi-card panel"><div class="kpi-label">Rappels express</div><div class="kpi-value">' +
      r +
      "</div></div>";
    document.getElementById("flCount").textContent = pagination
      ? pagination.total + " résultat" + (pagination.total > 1 ? "s" : "")
      : "";
  }

  function renderRows(leads) {
    var tbody = document.getElementById("flBody");
    if (!leads || !leads.length) {
      tbody.innerHTML =
        '<tr><td colspan="9" class="alerts-empty">Aucun lead formulaire pour ces filtres.</td></tr>';
      return;
    }
    tbody.innerHTML = leads
      .map(function (l) {
        var cat = l.formCategory || "contact";
        var kind = l.formKind || "questionnaire";
        var when = l.created_at ? new Date(l.created_at).toLocaleString("fr-FR") : "—";
        return (
          "<tr>" +
          "<td>" +
          esc(when) +
          "</td>" +
          '<td><span class="fl-badge fl-badge--' +
          esc(cat) +
          '">' +
          esc(l.formCategoryLabel || cat) +
          "</span></td>" +
          "<td>" +
          esc(l.formNeedLabel || l.vertical || "—") +
          "</td>" +
          '<td><span class="fl-badge fl-badge--' +
          esc(kind) +
          '">' +
          esc(l.formKindLabel || kind) +
          "</span></td>" +
          '<td class="fl-contact"><strong>' +
          esc(displayName(l)) +
          "</strong><span>" +
          esc(l.email || "—") +
          " · " +
          esc(l.phone || "—") +
          "</span></td>" +
          "<td>" +
          esc(l.source || "—") +
          "</td>" +
          "<td>" +
          (l.lead_score != null ? l.lead_score : "—") +
          "</td>" +
          "<td>" +
          esc(l.status || "new") +
          "</td>" +
          '<td><a class="btn btn-ghost btn-sm" href="./crm-lead-detail.html?id=' +
          encodeURIComponent(l.id) +
          '">Fiche</a></td>' +
          "</tr>"
        );
      })
      .join("");
  }

  function renderPager(pagination) {
    var el = document.getElementById("flPager");
    if (!pagination || pagination.totalPages <= 1) {
      el.innerHTML = "";
      return;
    }
    el.innerHTML =
      '<button type="button" class="btn btn-ghost btn-sm" id="flPrev"' +
      (state.page <= 1 ? " disabled" : "") +
      ">Précédent</button>" +
      "<span>Page " +
      pagination.page +
      " / " +
      pagination.totalPages +
      "</span>" +
      '<button type="button" class="btn btn-ghost btn-sm" id="flNext"' +
      (state.page >= pagination.totalPages ? " disabled" : "") +
      ">Suivant</button>";
    var prev = document.getElementById("flPrev");
    var next = document.getElementById("flNext");
    if (prev) {
      prev.addEventListener("click", function () {
        if (state.page > 1) {
          state.page--;
          load();
        }
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        state.page++;
        load();
      });
    }
  }

  function load() {
    var params = "?limit=50&page=" + state.page + "&formStats=1";
    if (state.category) params += "&category=" + encodeURIComponent(state.category);
    if (state.kind) params += "&kind=" + encodeURIComponent(state.kind);
    if (state.status) params += "&status=" + encodeURIComponent(state.status);
    if (state.search) params += "&search=" + encodeURIComponent(state.search);
    document.getElementById("flBody").innerHTML =
      '<tr><td colspan="9" class="alerts-empty">Chargement…</td></tr>';
    api("/api/dashboard/leads" + params).then(function (data) {
      if (!data.ok) {
        document.getElementById("flBody").innerHTML =
          '<tr><td colspan="9" class="alerts-empty">' +
          esc(data.error || "Accès refusé") +
          "</td></tr>";
        return;
      }
      if (data.formStats) state.stats = data.formStats;
      renderChips();
      renderStats(data.pagination);
      renderRows(data.leads || []);
      renderPager(data.pagination);
    });
  }

  document.getElementById("flCatChips").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-cat]");
    if (!btn) return;
    state.category = btn.getAttribute("data-cat") || "";
    state.page = 1;
    load();
  });
  document.getElementById("flKindChips").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-kind]");
    if (!btn) return;
    state.kind = btn.getAttribute("data-kind") || "";
    state.page = 1;
    load();
  });
  document.getElementById("flRefresh").addEventListener("click", load);
  document.getElementById("flStatus").addEventListener("change", function () {
    state.status = this.value;
    state.page = 1;
    load();
  });
  var searchTimer;
  document.getElementById("flSearch").addEventListener("input", function () {
    var v = this.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      state.search = v.trim();
      state.page = 1;
      load();
    }, 350);
  });

  renderChips();
  load();
})();
