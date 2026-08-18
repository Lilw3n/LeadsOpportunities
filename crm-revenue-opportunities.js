(function () {
  var TOKEN_KEY = "lo_token";
  var USER_STATE_KEY = "lo_revenue_opportunities_v1";
  var token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  var catalog = null;
  var userIdeas = [];
  var statusOverrides = {};
  var filterCategory = "";
  var filterPriority = "";
  var filterStatus = "";
  var searchQ = "";

  var STATUS_LABELS = {
    idea: "Idée",
    planned: "Planifié",
    in_progress: "En cours",
    done: "Fait",
    paused: "En pause",
  };

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : s;
    return d.innerHTML;
  }

  function authHeaders() {
    return { Authorization: "Bearer " + token };
  }

  function loadUserState() {
    try {
      var raw = localStorage.getItem(USER_STATE_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      userIdeas = Array.isArray(data.ideas) ? data.ideas : [];
      statusOverrides = data.statusOverrides && typeof data.statusOverrides === "object" ? data.statusOverrides : {};
    } catch (e) {
      userIdeas = [];
      statusOverrides = {};
    }
  }

  function saveUserState() {
    localStorage.setItem(
      USER_STATE_KEY,
      JSON.stringify({ ideas: userIdeas, statusOverrides: statusOverrides, updatedAt: new Date().toISOString() })
    );
  }

  function effectiveStatus(idea) {
    if (statusOverrides[idea.id]) return statusOverrides[idea.id];
    return idea.status || "idea";
  }

  function allIdeas() {
    var base = (catalog && catalog.ideas) || [];
    return base.concat(userIdeas);
  }

  function filteredIdeas() {
    return allIdeas().filter(function (idea) {
      if (filterCategory && idea.category !== filterCategory) return false;
      if (filterPriority && idea.priority !== filterPriority) return false;
      if (filterStatus && effectiveStatus(idea) !== filterStatus) return false;
      if (searchQ) {
        var hay = (
          (idea.title || "") +
          " " +
          (idea.summary || "") +
          " " +
          (idea.agentNote || "") +
          " " +
          (idea.ticketEstimate || "")
        ).toLowerCase();
        if (hay.indexOf(searchQ) < 0) return false;
      }
      return true;
    });
  }

  function priorityClass(p) {
    if (p === "P1") return "rev-badge--p1";
    if (p === "P2") return "rev-badge--p2";
    if (p === "P3") return "rev-badge--p3";
    return "";
  }

  function statusBadgeClass(st) {
    if (st === "done") return "rev-badge--done";
    if (st === "in_progress") return "rev-badge--progress";
    return "";
  }

  function renderKpis(ideas) {
    var el = document.getElementById("revLiveKpis");
    if (!el) return;
    var p1 = ideas.filter(function (i) {
      return i.priority === "P1" && effectiveStatus(i) !== "done";
    }).length;
    var agent = ideas.filter(function (i) {
      return i.source === "agent_cursor" || i.category === "agent";
    }).length;
    var inProgress = ideas.filter(function (i) {
      return effectiveStatus(i) === "in_progress";
    }).length;
    var planned = ideas.filter(function (i) {
      return effectiveStatus(i) === "planned" || effectiveStatus(i) === "idea";
    }).length;
    el.innerHTML =
      '<div class="rev-kpi"><span class="lbl">P1 actives</span><span class="val">' +
      p1 +
      '</span></div><div class="rev-kpi"><span class="lbl">En cours</span><span class="val">' +
      inProgress +
      '</span></div><div class="rev-kpi"><span class="lbl">À lancer</span><span class="val">' +
      planned +
      '</span></div><div class="rev-kpi"><span class="lbl">Idées agent</span><span class="val">' +
      agent +
      "</span></div>";
  }

  function renderCategoryChips() {
    var mount = document.getElementById("revCategoryChips");
    if (!mount || !catalog) return;
    var cats = catalog.categories || [];
    var html =
      '<button type="button" class="rev-chip' +
      (!filterCategory ? " is-active" : "") +
      '" data-cat="">Toutes</button>';
    cats.forEach(function (c) {
      html +=
        '<button type="button" class="rev-chip' +
        (filterCategory === c.id ? " is-active" : "") +
        '" data-cat="' +
        esc(c.id) +
        '">' +
        esc(c.label) +
        "</button>";
    });
    mount.innerHTML = html;
    mount.querySelectorAll(".rev-chip").forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterCategory = btn.getAttribute("data-cat") || "";
        render();
      });
    });
  }

  function renderIdeas() {
    var grid = document.getElementById("revIdeasGrid");
    var empty = document.getElementById("revEmpty");
    if (!grid) return;
    var ideas = filteredIdeas();
    renderKpis(allIdeas());

    if (!ideas.length) {
      grid.innerHTML = "";
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;

    ideas.sort(function (a, b) {
      var pa = a.priority === "P1" ? 0 : a.priority === "P2" ? 1 : 2;
      var pb = b.priority === "P1" ? 0 : b.priority === "P2" ? 1 : 2;
      if (pa !== pb) return pa - pb;
      return (a.title || "").localeCompare(b.title || "");
    });

    grid.innerHTML = ideas
      .map(function (idea) {
        var st = effectiveStatus(idea);
        var isAgent = idea.source === "agent_cursor" || idea.category === "agent";
        var actions =
          idea.actions && idea.actions.length
            ? "<ul class=\"rev-actions-list\">" +
              idea.actions
                .slice(0, 3)
                .map(function (a) {
                  return "<li>" + esc(a) + "</li>";
                })
                .join("") +
              "</ul>"
            : "";
        var links =
          idea.links && idea.links.length
            ? '<div class="rev-links">' +
              idea.links
                .map(function (l) {
                  return '<a href="' + esc(l.href) + '">' + esc(l.label) + "</a>";
                })
                .join("") +
              "</div>"
            : "";
        var note = idea.agentNote
          ? '<p class="rev-agent-note"><strong>Agent :</strong> ' + esc(idea.agentNote) + "</p>"
          : "";
        var impl = idea.implementedInRepo
          ? '<span class="rev-badge rev-badge--done">Dans le repo</span>'
          : "";

        return (
          '<article class="rev-card' +
          (isAgent ? " is-agent" : "") +
          '">' +
          '<div class="rev-card-head"><h3>' +
          esc(idea.title) +
          "</h3>" +
          '<select class="rev-status-select" data-status-id="' +
          esc(idea.id) +
          '">' +
          Object.keys(STATUS_LABELS)
            .map(function (k) {
              return (
                '<option value="' +
                k +
                '"' +
                (st === k ? " selected" : "") +
                ">" +
                STATUS_LABELS[k] +
                "</option>"
              );
            })
            .join("") +
          "</select></div>" +
          '<div class="rev-badges">' +
          '<span class="rev-badge ' +
          priorityClass(idea.priority) +
          '">' +
          esc(idea.priority || "—") +
          "</span>" +
          '<span class="rev-badge ' +
          statusBadgeClass(st) +
          '">' +
          esc(STATUS_LABELS[st] || st) +
          "</span>" +
          (isAgent ? '<span class="rev-badge rev-badge--agent">Agent Cursor</span>' : "") +
          impl +
          "</div>" +
          (idea.ticketEstimate
            ? '<p class="rev-ticket">Ticket : ' + esc(idea.ticketEstimate) + "</p>"
            : "") +
          '<p class="rev-summary">' +
          esc(idea.summary) +
          "</p>" +
          note +
          actions +
          links +
          "</article>"
        );
      })
      .join("");

    grid.querySelectorAll(".rev-status-select").forEach(function (sel) {
      sel.addEventListener("change", function () {
        statusOverrides[sel.getAttribute("data-status-id")] = sel.value;
        saveUserState();
        render();
      });
    });
  }

  function render() {
    renderCategoryChips();
    renderIdeas();
  }

  function loadMetaRotation(refresh) {
    var url = "/api/crm/meta-rotation" + (refresh ? "?refresh=1" : "");
    var summary = document.getElementById("revMetaSummary");
    fetch(url, { headers: authHeaders() })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!summary) return;
        if (!res.ok || !res.rotation) {
          summary.textContent = "Rotation Meta indisponible — vérifiez la config ou npm run meta:rotation:status.";
          return;
        }
        var rot = res.rotation;
        var slot = rot.active_slot || {};
        var stats = rot.current_stats || {};
        var rec = rot.recommendation || {};
        summary.innerHTML =
          "<strong>S" +
          esc(slot.week || rot.calendar_week) +
          "</strong> · " +
          esc(slot.id) +
          " · vertical <strong>" +
          esc(slot.vertical) +
          "</strong> · leads Meta <strong>" +
          esc(stats.leads != null ? stats.leads : "0") +
          "</strong> · CPL <strong>" +
          esc(stats.cpl_eur != null ? stats.cpl_eur + " €" : "—") +
          "</strong>. " +
          esc(rec.reason || "") +
          ' — <a href="./crm-pubs.html">Gestion pubs</a>';
      })
      .catch(function () {
        if (summary) summary.textContent = "Impossible de charger le CPL Meta.";
      });
  }

  function bindFilters() {
    var search = document.getElementById("revSearch");
    var pri = document.getElementById("revFilterPriority");
    var st = document.getElementById("revFilterStatus");
    if (search) {
      search.addEventListener("input", function () {
        searchQ = (search.value || "").trim().toLowerCase();
        render();
      });
    }
    if (pri) {
      pri.addEventListener("change", function () {
        filterPriority = pri.value;
        render();
      });
    }
    if (st) {
      st.addEventListener("change", function () {
        filterStatus = st.value;
        render();
      });
    }
    var btnMeta = document.getElementById("btnRevRefreshMeta");
    if (btnMeta) {
      btnMeta.addEventListener("click", function () {
        loadMetaRotation(true);
      });
    }
  }

  function bindAddForm() {
    var form = document.getElementById("revAddForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var id = "user_" + Date.now();
      userIdeas.unshift({
        id: id,
        title: String(fd.get("title") || "").trim(),
        category: fd.get("category") || "agent",
        priority: fd.get("priority") || "P2",
        status: "idea",
        revenueType: "custom",
        ticketEstimate: String(fd.get("ticketEstimate") || "").trim(),
        summary: String(fd.get("summary") || "").trim(),
        actions: [],
        links: [],
        source: "user",
        implementedInRepo: false,
      });
      saveUserState();
      form.reset();
      filterCategory = "";
      render();
    });
  }

  fetch("/data/revenue-opportunities.json")
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      catalog = data;
      loadUserState();
      bindFilters();
      bindAddForm();
      render();
      loadMetaRotation(false);
    })
    .catch(function () {
      catalog = { ideas: [], categories: [] };
      loadUserState();
      bindFilters();
      bindAddForm();
      render();
    });
})();
