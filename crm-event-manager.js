/**
 * Gestionnaire d’événements — suivi par interlocuteur / dossier.
 */
(function () {
  var token = localStorage.getItem("lo_token");
  if (!token) return;

  var INT = window.CrmDossierInterlocutors || { ROLES: [], normalizeList: function (x) { return x || []; } };
  var Types = window.CrmAgendaTypes;
  var state = {
    events: [],
    role: "",
    view: "planning",
    status: "open",
    search: "",
  };

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : s;
    return d.innerHTML;
  }

  function api(path, opts) {
    opts = opts || {};
    return fetch(path, {
      method: opts.method || "GET",
      headers: Object.assign(
        { "Content-Type": "application/json", Authorization: "Bearer " + token },
        opts.headers || {}
      ),
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    }).then(function (r) {
      return r.json();
    });
  }

  function dayStart(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }

  function eventDay(e) {
    if (!e.eventDate) return null;
    var d = new Date(e.eventDate);
    if (isNaN(d.getTime())) return null;
    return dayStart(d);
  }

  function interlocutorsOf(e) {
    var list = INT.normalizeList(e.interlocutors || e.participants || []);
    if (!list.length && e.contactName) {
      list = INT.normalizeList([{ role: "client", name: e.contactName, contactId: e.contactId }]);
    }
    return list;
  }

  function isOpen(e) {
    return e.status !== "completed" && e.status !== "cancelled";
  }

  function filtered() {
    var q = (state.search || "").toLowerCase();
    var today = dayStart(new Date());
    return (state.events || []).filter(function (e) {
      if (state.status === "open" && !isOpen(e)) return false;
      if (state.status === "pending" && e.status !== "pending") return false;
      if (state.status === "completed" && e.status !== "completed") return false;
      var ints = interlocutorsOf(e);
      if (state.role) {
        var hit = ints.some(function (p) {
          return p.role === state.role;
        });
        if (!hit && !(state.role === "client" && e.contactId)) return false;
      }
      if (q) {
        var hay = (
          (e.title || "") +
          " " +
          (e.contactName || "") +
          " " +
          ints
            .map(function (p) {
              return p.name + " " + p.roleLabel;
            })
            .join(" ")
        ).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      e._day = eventDay(e);
      e._overdue = isOpen(e) && e._day != null && e._day < today;
      e._ints = ints;
      return true;
    });
  }

  function typeLabel(id) {
    if (Types && Types.byId) return Types.byId(id).label;
    return id || "RDV";
  }

  function renderKpis(list) {
    var today = dayStart(new Date());
    var week = today + 7 * 86400000;
    var nToday = 0;
    var nOverdue = 0;
    var nWeek = 0;
    var dossiers = {};
    list.forEach(function (e) {
      if (e.contactId) dossiers[e.contactId] = true;
      if (!isOpen(e)) return;
      if (e._overdue) nOverdue++;
      else if (e._day === today) nToday++;
      else if (e._day != null && e._day >= today && e._day < week) nWeek++;
    });
    document.getElementById("emKpis").innerHTML =
      '<div class="kpi-card panel"><div class="kpi-label">Aujourd’hui</div><div class="kpi-value">' +
      nToday +
      '</div></div>' +
      '<div class="kpi-card panel"><div class="kpi-label">En retard</div><div class="kpi-value">' +
      nOverdue +
      '</div></div>' +
      '<div class="kpi-card panel"><div class="kpi-label">Cette semaine</div><div class="kpi-value">' +
      nWeek +
      '</div></div>' +
      '<div class="kpi-card panel"><div class="kpi-label">Dossiers</div><div class="kpi-value">' +
      Object.keys(dossiers).length +
      "</div></div>";
  }

  function renderRoleChips() {
    var roles = INT.importantRoles ? INT.importantRoles() : INT.ROLES || [];
    var html =
      '<button type="button" class="crm-filter-chip' +
      (!state.role ? " active" : "") +
      '" data-role="">Tous</button>';
    roles.forEach(function (r) {
      html +=
        '<button type="button" class="crm-filter-chip' +
        (state.role === r.id ? " active" : "") +
        '" data-role="' +
        esc(r.id) +
        '">' +
        esc(r.label) +
        "</button>";
    });
    document.getElementById("emRoleChips").innerHTML = html;
  }

  function cardHtml(e) {
    var when = e.eventDate
      ? new Date(e.eventDate).toLocaleDateString("fr-FR") + (e.eventTime ? " · " + e.eventTime : "")
      : "Sans date";
    var tags = (e._ints || [])
      .map(function (p, idx) {
        var cls = p.followUp === "done" ? "em-tag--done" : p.followUp === "waiting" ? "em-tag--waiting" : "";
        var fu = INT.followUpLabel ? INT.followUpLabel(p.followUp) : p.followUp;
        return (
          '<button type="button" class="em-tag ' +
          cls +
          '" data-int-cycle="' +
          esc(e.id) +
          '" data-int-idx="' +
          idx +
          '" title="Suivi : ' +
          esc(fu) +
          ' — cliquer pour changer">' +
          esc(p.roleLabel || p.role) +
          (p.name ? " · " + esc(p.name) : "") +
          " · " +
          esc(fu) +
          "</button>"
        );
      })
      .join("");
    return (
      '<article class="em-card">' +
      "<strong>" +
      esc(e.title) +
      "</strong>" +
      '<div class="em-meta">' +
      esc(typeLabel(e.eventType)) +
      " · " +
      esc(when) +
      " · " +
      esc(e.contactName || "Dossier") +
      (e._overdue ? ' <span class="em-tag em-tag--overdue">En retard</span>' : "") +
      "</div>" +
      '<div class="em-tags">' +
      tags +
      "</div>" +
      '<div class="em-actions">' +
      '<a class="btn btn-ghost btn-sm" href="./crm-event-create.html?contactId=' +
      encodeURIComponent(e.contactId || "") +
      "&title=" +
      encodeURIComponent("Suivi — " + (e.contactName || "")) +
      '">+ Relance</a>' +
      (e.contactId
        ? '<a class="btn btn-ghost btn-sm" href="./crm-contact.html?id=' +
          encodeURIComponent(e.contactId) +
          '">Dossier</a>'
        : "") +
      (isOpen(e)
        ? '<button type="button" class="btn btn-ghost btn-sm" data-done="' +
          esc(e.id) +
          '">Marquer fait</button>'
        : "") +
      "</div></article>"
    );
  }

  function renderPlanning(list) {
    var today = dayStart(new Date());
    var week = today + 7 * 86400000;
    var overdue = [];
    var now = [];
    var later = [];
    list.forEach(function (e) {
      if (!isOpen(e)) return;
      if (e._overdue) overdue.push(e);
      else if (e._day != null && e._day < week) now.push(e);
      else later.push(e);
    });
    function col(title, items) {
      return (
        '<section class="em-col"><h3>' +
        esc(title) +
        " (" +
        items.length +
        ")</h3>" +
        (items.length ? items.map(cardHtml).join("") : '<p class="em-empty">Rien ici.</p>') +
        "</section>"
      );
    }
    document.getElementById("emBoard").className = "em-board em-board--planning";
    document.getElementById("emBoard").innerHTML =
      col("En retard", overdue) + col("7 prochains jours", now) + col("Plus tard", later);
  }

  function renderByInterlocutor(list) {
    var groups = {};
    list.forEach(function (e) {
      (e._ints || []).forEach(function (p) {
        var key = p.role + "|" + (p.name || p.email || p.phone || "sans nom");
        if (!groups[key]) groups[key] = { person: p, events: [] };
        groups[key].events.push(e);
      });
    });
    var keys = Object.keys(groups).sort();
    document.getElementById("emBoard").className = "em-board";
    if (!keys.length) {
      document.getElementById("emBoard").innerHTML = '<p class="em-empty">Aucun interlocuteur sur ces événements.</p>';
      return;
    }
    document.getElementById("emBoard").innerHTML = keys
      .map(function (k) {
        var g = groups[k];
        var open = g.events.filter(isOpen).length;
        return (
          '<section class="em-group panel"><h3>' +
          esc(g.person.roleLabel || g.person.role) +
          " — " +
          esc(g.person.name || "Sans nom") +
          (g.person.phone ? " · " + esc(g.person.phone) : "") +
          (g.person.email ? " · " + esc(g.person.email) : "") +
          " <span class='muted'>(" +
          open +
          " ouvert" +
          (open > 1 ? "s" : "") +
          ")</span></h3>" +
          g.events.map(cardHtml).join("") +
          "</section>"
        );
      })
      .join("");
  }

  function renderByDossier(list) {
    var groups = {};
    list.forEach(function (e) {
      var key = e.contactId || e.contactName || "inconnu";
      if (!groups[key]) groups[key] = { name: e.contactName || "Dossier", id: e.contactId, events: [] };
      groups[key].events.push(e);
    });
    document.getElementById("emBoard").className = "em-board";
    document.getElementById("emBoard").innerHTML = Object.keys(groups)
      .map(function (k) {
        var g = groups[k];
        return (
          '<section class="em-group panel"><h3>' +
          esc(g.name) +
          (g.id
            ? ' <a class="btn btn-ghost btn-sm" href="./crm-contact.html?id=' +
              encodeURIComponent(g.id) +
              '">Fiche</a>'
            : "") +
          "</h3>" +
          g.events.map(cardHtml).join("") +
          "</section>"
        );
      })
      .join("");
  }

  function render() {
    var list = filtered();
    renderKpis(list);
    if (state.view === "interlocutors") renderByInterlocutor(list);
    else if (state.view === "dossiers") renderByDossier(list);
    else renderPlanning(list);
  }

  function load() {
    document.getElementById("emBoard").innerHTML = '<p class="em-empty">Chargement…</p>';
    api("/api/crm/events").then(function (res) {
      if (!res.ok) {
        document.getElementById("emBoard").innerHTML =
          '<p class="em-empty">' + esc(res.error || "Accès refusé") + "</p>";
        return;
      }
      state.events = res.events || [];
      render();
    });
  }

  document.getElementById("emRoleChips").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-role]");
    if (!btn) return;
    state.role = btn.getAttribute("data-role") || "";
    renderRoleChips();
    render();
  });
  document.getElementById("emView").addEventListener("change", function () {
    state.view = this.value;
    render();
  });
  document.getElementById("emStatus").addEventListener("change", function () {
    state.status = this.value;
    render();
  });
  var t;
  document.getElementById("emSearch").addEventListener("input", function () {
    var v = this.value;
    clearTimeout(t);
    t = setTimeout(function () {
      state.search = v.trim();
      render();
    }, 250);
  });
  document.getElementById("emBoard").addEventListener("click", function (e) {
    var cycle = e.target.closest("[data-int-cycle]");
    if (cycle) {
      var cid = cycle.getAttribute("data-int-cycle");
      var idx = Number(cycle.getAttribute("data-int-idx"));
      var evt = (state.events || []).filter(function (x) {
        return x.id === cid;
      })[0];
      if (!evt) return;
      var ints = interlocutorsOf(evt).map(function (p, i) {
        var copy = Object.assign({}, p);
        if (i === idx && INT.nextFollowUp) copy.followUp = INT.nextFollowUp(p.followUp);
        return copy;
      });
      api("/api/crm/events", { method: "PATCH", body: { id: cid, interlocutors: ints } }).then(function (res) {
        if (res.ok) load();
        else alert(res.error || "Impossible de mettre à jour le suivi");
      });
      return;
    }
    var btn = e.target.closest("[data-done]");
    if (!btn) return;
    var id = btn.getAttribute("data-done");
    api("/api/crm/events", { method: "PATCH", body: { id: id, status: "completed" } }).then(function (res) {
      if (res.ok) load();
      else alert(res.error || "Impossible de clôturer");
    });
  });

  renderRoleChips();
  load();
})();
