(function () {
  var TOKEN_KEY = "lo_token";
  var allEvents = [];
  var selected = new Set();
  var viewMode = "list";
  var periodFilter = "";

  function token() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function esc(s) {
    if (s == null) return "";
    var d = document.createElement("div");
    d.textContent = String(s);
    return d.innerHTML;
  }

  function api(path, opts) {
    opts = opts || {};
    return fetch(path, {
      method: opts.method || "GET",
      headers: Object.assign(
        { "Content-Type": "application/json" },
        token() ? { Authorization: "Bearer " + token() } : {}
      ),
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    }).then(function (r) {
      return r.json();
    });
  }

  function priorityBadge(p) {
    var C = window.CrmConstants || {};
    var cls = (C.PRIORITY_CLASS && C.PRIORITY_CLASS[p]) || "";
    var lbl = (C.PRIORITY_LABELS && C.PRIORITY_LABELS[p]) || p;
    return '<span class="badge ' + cls + '">' + esc(lbl) + "</span>";
  }

  function filtered() {
    var q = (document.getElementById("globalEventSearch").value || "").toLowerCase();
    var type = document.getElementById("globalEventType").value;
    var status = document.getElementById("globalEventStatus").value;
    var priority = document.getElementById("globalEventPriority").value;
    var sort = document.getElementById("globalEventSort").value || "eventDate-desc";

    var list = allEvents.filter(function (e) {
      if (type && e.eventType !== type) return false;
      if (status && e.status !== status) return false;
      if (priority && e.priority !== priority) return false;
      if (periodFilter) {
        var d = e.eventDate ? new Date(e.eventDate) : null;
        if (!d || isNaN(d.getTime())) {
          if (periodFilter === "past") return false;
        } else {
          var now = new Date();
          var startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          var endDay = new Date(startDay.getTime() + 86400000);
          if (periodFilter === "today" && (d < startDay || d >= endDay)) return false;
          if (periodFilter === "week") {
            var weekStart = new Date(startDay);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
            var weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
            if (d < weekStart || d >= weekEnd) return false;
          }
          if (periodFilter === "month" && (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear())) return false;
          if (periodFilter === "past" && d >= startDay) return false;
        }
      }
      if (q) {
        if (window.CrmEventSearch && window.CrmEventSearch.match(e, q)) return true;
        var hay = (e.title + " " + (e.description || "") + " " + e.contactName).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });

    var parts = sort.split("-");
    var field = parts[0];
    var dir = parts[1] === "asc" ? 1 : -1;
    list.sort(function (a, b) {
      var av = field === "createdAt" ? a.createdAt : a.eventDate || a.createdAt;
      var bv = field === "createdAt" ? b.createdAt : b.eventDate || b.createdAt;
      av = av ? new Date(av).getTime() : 0;
      bv = bv ? new Date(bv).getTime() : 0;
      return (av - bv) * dir;
    });
    return list;
  }

  function renderStats() {
    var el = document.getElementById("eventsStats");
    if (!el) return;
    if (window.SmartEventsService) {
      el.innerHTML = window.SmartEventsService.renderInsights(allEvents, esc);
      return;
    }
    var pending = allEvents.filter(function (e) {
      return e.status === "pending";
    }).length;
    var urgent = allEvents.filter(function (e) {
      return e.priority === "urgent";
    }).length;
    el.innerHTML =
      '<div class="stat"><strong>' +
      allEvents.length +
      "</strong>Total</div>" +
      '<div class="stat"><strong>' +
      pending +
      "</strong>En attente</div>" +
      '<div class="stat"><strong>' +
      urgent +
      "</strong>Urgents</div>";
  }

  function updateBulkBar() {
    var bar = document.getElementById("eventsBulkBar");
    var count = document.getElementById("eventsBulkCount");
    if (!bar) return;
    if (selected.size) {
      bar.classList.remove("hidden");
      count.textContent = selected.size + " selectionne(s)";
    } else bar.classList.add("hidden");
  }

  function renderList() {
    var list = filtered();
    var el = document.getElementById("eventsListView");
    if (!list.length) {
      el.innerHTML = "<p>Aucun evenement</p>";
      return;
    }
    el.innerHTML =
      '<table class="events-table"><thead><tr><th><input type="checkbox" id="selectAllEvents" /></th><th>Date</th><th>Contact</th><th>Titre</th><th>Type</th><th>Priorite</th><th>Statut</th></tr></thead><tbody>' +
      list
        .map(function (e) {
          var d = e.eventDate
            ? new Date(e.eventDate).toLocaleDateString("fr-FR")
            : new Date(e.createdAt).toLocaleDateString("fr-FR");
          return (
            "<tr>" +
            '<td><input type="checkbox" class="ev-check" data-id="' +
            esc(e.id) +
            '"' +
            (selected.has(e.id) ? " checked" : "") +
            " /></td>" +
            "<td>" +
            d +
            (e.eventTime ? " " + esc(e.eventTime) : "") +
            "</td>" +
            '<td><a href="./crm-contact.html?id=' +
            encodeURIComponent(e.contactId) +
            '">' +
            esc(e.contactName) +
            "</a></td>" +
            "<td>" +
            esc(e.title) +
            "</td>" +
            "<td>" +
            esc(e.eventType) +
            "</td>" +
            "<td>" +
            priorityBadge(e.priority) +
            "</td>" +
            "<td>" +
            esc(e.status) +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table>";

    var allCb = document.getElementById("selectAllEvents");
    if (allCb) {
      allCb.onchange = function () {
        list.forEach(function (e) {
          if (allCb.checked) selected.add(e.id);
          else selected.delete(e.id);
        });
        updateBulkBar();
        renderList();
      };
    }
    el.querySelectorAll(".ev-check").forEach(function (cb) {
      cb.onchange = function () {
        var id = cb.getAttribute("data-id");
        if (cb.checked) selected.add(id);
        else selected.delete(id);
        updateBulkBar();
      };
    });
  }

  function renderCalendar() {
    var list = filtered();
    var now = new Date();
    var y = now.getFullYear();
    var m = now.getMonth();
    var first = new Date(y, m, 1);
    var startDay = (first.getDay() + 6) % 7;
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    var el = document.getElementById("eventsCalendarView");
    var headers = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    var html =
      '<h3 style="margin:0 0 12px">' +
      first.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) +
      '</h3><div class="cal-grid">';
    headers.forEach(function (h) {
      html += '<div class="cal-head">' + h + "</div>";
    });
    for (var i = 0; i < startDay; i++) html += '<div class="cal-day other"></div>';
    for (var d = 1; d <= daysInMonth; d++) {
      var dateStr =
        y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
      var dayEvents = list.filter(function (e) {
        return e.eventDate && String(e.eventDate).slice(0, 10) === dateStr;
      });
      html += '<div class="cal-day"><div class="num">' + d + "</div>";
      dayEvents.slice(0, 3).forEach(function (ev) {
        html +=
          '<a class="cal-dot" href="./crm-contact.html?id=' +
          encodeURIComponent(ev.contactId) +
          '">' +
          esc(ev.title) +
          "</a>";
      });
      html += "</div>";
    }
    html += "</div>";
    el.innerHTML = html;
  }

  function render() {
    renderStats();
    if (viewMode === "calendar") {
      document.getElementById("eventsListView").classList.add("hidden");
      document.getElementById("eventsCalendarView").classList.remove("hidden");
      renderCalendar();
    } else {
      document.getElementById("eventsCalendarView").classList.add("hidden");
      document.getElementById("eventsListView").classList.remove("hidden");
      renderList();
    }
  }

  function load() {
    if (!token()) {
      location.href = "./crm.html";
      return;
    }
    api("/api/crm/events").then(function (res) {
      if (!res.ok) {
        document.getElementById("eventsListView").innerHTML =
          "<p>" + esc(res.error || "Erreur") + "</p>";
        return;
      }
      allEvents = res.events || [];
      selected.clear();
      render();
    });
  }

  document.getElementById("eventsBulkDuplicate").onclick = function () {
    if (!selected.size || !confirm("Dupliquer " + selected.size + " evenement(s) avec date +7 jours ?")) return;
    api("/api/crm/bulk-duplicate-events", {
      method: "POST",
      body: { ids: Array.from(selected) },
    }).then(function (res) {
      if (res.ok) {
        selected.clear();
        load();
        alert((res.duplicated || 0) + " evenement(s) duplique(s)");
      } else alert(res.error || "Erreur");
    });
  };

  document.getElementById("eventsBulkDelete").onclick = function () {
    if (!selected.size || !confirm("Supprimer " + selected.size + " evenement(s) ?")) return;
    api("/api/crm/bulk-events", {
      method: "POST",
      body: { ids: Array.from(selected) },
    }).then(function (res) {
      if (res.ok) {
        selected.clear();
        load();
      } else alert(res.error || "Erreur");
    });
  };

  document.querySelectorAll(".events-view-toggle button[data-view]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".events-view-toggle button[data-view]").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      viewMode = btn.getAttribute("data-view");
      render();
    });
  });

  var btnExportEv = document.getElementById("btnExportEvents");
  if (btnExportEv && window.CrmExport) {
    btnExportEv.addEventListener("click", function () {
      var list = filtered();
      if (!list.length) return alert("Aucun evenement a exporter");
      var csv = window.CrmExport.toCsv(list, [
        {
          label: "Date",
          value: function (e) {
            return e.eventDate || e.createdAt || "";
          },
        },
        { label: "Contact", value: function (e) { return e.contactName; } },
        { label: "Titre", value: function (e) { return e.title; } },
        { label: "Type", value: function (e) { return e.eventType; } },
        { label: "Priorite", value: function (e) { return e.priority; } },
        { label: "Statut", value: function (e) { return e.status; } },
      ]);
      window.CrmExport.download("evenements-crm.csv", csv);
    });
  }

  ["globalEventSearch", "globalEventType", "globalEventStatus", "globalEventPriority", "globalEventSort"].forEach(
    function (id) {
      document.getElementById(id).addEventListener("input", render);
      document.getElementById(id).addEventListener("change", render);
    }
  );

  document.querySelectorAll("#eventPeriodBtns button[data-period]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll("#eventPeriodBtns button[data-period]").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      periodFilter = btn.getAttribute("data-period") || "";
      render();
    });
  });

  load();
})();
