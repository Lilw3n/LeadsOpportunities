(function () {
  var TOKEN_KEY = "lo_token";
  var Types = window.CrmAgendaTypes;
  if (!localStorage.getItem(TOKEN_KEY)) {
    location.href = "./crm.html";
    return;
  }
  if (!Types) return;

  var token = localStorage.getItem(TOKEN_KEY);
  var events = [];
  var viewDate = new Date();
  var viewMode = localStorage.getItem("lo_agenda_view") || "month";
  var filters = { type: "", agent: "", color: "type" };

  var calBanner = document.getElementById("calBanner");
  var mount = document.getElementById("agMount");

  function authHeaders() {
    return { Authorization: "Bearer " + token };
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function ymd(d) {
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  }

  function parseDate(raw) {
    if (!raw) return null;
    var s = String(raw).slice(0, 10);
    var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }

  function timeLabel(e) {
    return e.eventTime ? String(e.eventTime).slice(0, 5) : "—";
  }

  function filteredEvents() {
    return events.filter(function (e) {
      if (filters.type && e.eventType !== filters.type) return false;
      if (filters.agent && String(e.contactName || "").toLowerCase().indexOf(filters.agent) === -1) return false;
      return true;
    });
  }

  function eventsOn(dayKey) {
    return filteredEvents().filter(function (e) {
      return e.eventDate && String(e.eventDate).slice(0, 10) === dayKey;
    });
  }

  function eventHref(e) {
    if (e.propertyId) return "./crm-immo-property.html?id=" + encodeURIComponent(e.propertyId);
    return "./crm-contact.html?id=" + encodeURIComponent(e.contactId);
  }

  function eventCard(e) {
    var t = Types.byId(e.eventType);
    var sync = e.googleSyncStatus === "synced" ? " · Google ✓" : "";
    if (e.todoistSyncStatus === "synced" || e.todoistTaskId) sync += " · Todoist ✓";
    return (
      '<div class="ag-slot">' +
      "<time>" +
      esc(timeLabel(e)) +
      (e.eventEndTime ? "–" + esc(String(e.eventEndTime).slice(0, 5)) : "") +
      "</time>" +
      "<div>" +
      '<span class="ag-badge" style="background:' +
      esc(t.color) +
      ";color:#fff\">" +
      esc(t.label) +
      "</span>" +
      '<p class="ag-card-title"><a href="' +
      esc(eventHref(e)) +
      '">' +
      esc(e.title || "Événement") +
      "</a></p>" +
      '<div class="ag-meta">' +
      esc(e.contactName || "") +
      (e.location ? " · " + esc(e.location) : "") +
      (e.mode ? " · " + esc(e.mode) : "") +
      sync +
      "</div></div></div>"
    );
  }

  function loadCalendarStatus() {
    fetch("/api/crm/calendar-sync?action=status", { headers: authHeaders() })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!calBanner) return;
        if (res.configured === false) {
          calBanner.className = "cal-banner cal-banner-warn";
          calBanner.textContent =
            "Google n'est pas configuré sur le serveur (GOOGLE_CLIENT_ID / SECRET). Impossible de connecter Agenda.";
          return;
        }
        if (res.connected) {
          calBanner.className = "cal-banner cal-banner-ok";
          calBanner.textContent =
            "Google Calendar connecté (" +
            (res.calendarId || "primary") +
            ") — Cliquez Synchroniser Google pour pousser les RDV CRM et importer l'agenda.";
          document.getElementById("btnConnectCal").textContent = "Reconnecter Google";
        } else {
          calBanner.className = "cal-banner cal-banner-warn";
          calBanner.textContent =
            "Google Calendar non connecté — cliquez Connecter Google, acceptez l'accès Agenda, puis Synchroniser.";
        }
      })
      .catch(function () {
        if (calBanner) calBanner.textContent = "Statut agenda indisponible";
      });
  }

  function startGoogleConnect() {
    var btn = document.getElementById("btnConnectCal");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Redirection Google…";
    }
    fetch("/api/crm/calendar-sync?action=connect", { headers: authHeaders() })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (res.url) {
          location.href = res.url;
          return;
        }
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Connecter Google";
        }
        alert(res.error || "Connexion Google impossible");
      })
      .catch(function () {
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Connecter Google";
        }
        alert("Connexion Google impossible");
      });
  }

  function runGoogleSync(opts) {
    opts = opts || {};
    var btn = document.getElementById("btnPullCal");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Synchronisation…";
    }
    fetch("/api/crm/calendar-sync?action=sync", { headers: authHeaders() })
      .then(function (r) {
        return r.json().then(function (body) {
          return { status: r.status, body: body };
        });
      })
      .then(function (pack) {
        var res = pack.body || {};
        if (pack.status === 400 && /non connect/.test(String(res.error || ""))) {
          if (!opts.skipConnect) startGoogleConnect();
          else alert(res.error);
          return;
        }
        if (!res.ok) {
          alert(res.error || "Erreur de synchronisation");
          return;
        }
        var msg =
          "Sync OK — " +
          (res.pushed || 0) +
          " RDV CRM envoyé(s) vers Google, " +
          (res.imported || 0) +
          " événement(s) importé(s).";
        if (calBanner) {
          calBanner.className = "cal-banner cal-banner-ok";
          calBanner.textContent = msg;
        }
        if (!opts.silent) alert(msg);
        loadCalendarStatus();
        loadEvents(render);
      })
      .catch(function () {
        alert("Erreur de synchronisation Google");
      })
      .finally(function () {
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Synchroniser Google";
        }
      });
  }

  function loadEvents(cb) {
    fetch("/api/crm/events", { headers: authHeaders() })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        events = (res.ok && res.events) || [];
        if (cb) cb();
      })
      .catch(function () {
        events = [];
        if (cb) cb();
      });
  }

  function fillFilters() {
    var typeSel = document.getElementById("fType");
    Types.TYPES.forEach(function (t) {
      typeSel.innerHTML += '<option value="' + t.id + '">' + t.label + "</option>";
    });
  }

  function setView(mode) {
    viewMode = mode;
    localStorage.setItem("lo_agenda_view", mode);
    document.querySelectorAll("#viewTabs [data-view]").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-view") === mode);
    });
    render();
  }

  function renderMonth() {
    var y = viewDate.getFullYear();
    var m = viewDate.getMonth();
    document.getElementById("periodLabel").textContent = viewDate.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
      timeZone: "Europe/Paris",
    });
    var first = new Date(y, m, 1);
    var start = new Date(first);
    var dow = (first.getDay() + 6) % 7;
    start.setDate(first.getDate() - dow);
    var todayKey = ymd(new Date());
    var days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    var html = '<div class="cal-grid">' + days.map(function (d) {
      return '<div class="cal-head">' + d + "</div>";
    }).join("");
    for (var i = 0; i < 42; i++) {
      var d = new Date(start);
      d.setDate(start.getDate() + i);
      var key = ymd(d);
      var dayEv = eventsOn(key);
      var cls =
        "cal-day" +
        (d.getMonth() !== m ? " muted" : "") +
        (dayEv.length ? " has-ev" : "") +
        (key === todayKey ? " today" : "");
      html +=
        '<div class="' +
        cls +
        '"><span>' +
        d.getDate() +
        "</span>" +
        dayEv
          .slice(0, 4)
          .map(function (e) {
            return (
              '<a class="cal-ev" style="background:' +
              esc(Types.colorFor(e, filters.color)) +
              '" href="' +
              esc(eventHref(e)) +
              '" title="' +
              esc(e.title || "") +
              '">' +
              esc(timeLabel(e) !== "—" ? timeLabel(e) + " " : "") +
              esc(e.title || "Evt") +
              "</a>"
            );
          })
          .join("") +
        "</div>";
    }
    html += "</div>";
    mount.innerHTML = html;
  }

  function renderDayList(from, to, title) {
    document.getElementById("periodLabel").textContent = title;
    var list = filteredEvents()
      .filter(function (e) {
        var d = parseDate(e.eventDate);
        if (!d) return false;
        return d >= from && d <= to;
      })
      .sort(function (a, b) {
        return String(a.eventDate).localeCompare(String(b.eventDate)) || String(a.eventTime || "").localeCompare(String(b.eventTime || ""));
      });
    if (!list.length) {
      mount.innerHTML = '<p class="ag-empty">Aucun événement sur cette période. <a href="./crm-event-create.html">Créer un RDV</a></p>';
      return;
    }
    mount.innerHTML = '<div class="ag-day-list">' + list.map(eventCard).join("") + "</div>";
  }

  function renderDay() {
    var start = new Date(viewDate.getFullYear(), viewDate.getMonth(), viewDate.getDate());
    var end = new Date(start);
    renderDayList(
      start,
      end,
      start.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    );
  }

  function renderWeek() {
    var d = new Date(viewDate);
    var dow = (d.getDay() + 6) % 7;
    var start = new Date(d);
    start.setDate(d.getDate() - dow);
    var end = new Date(start);
    end.setDate(start.getDate() + 6);
    renderDayList(
      start,
      end,
      "Semaine du " +
        start.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) +
        " au " +
        end.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
    );
  }

  function renderTimeline() {
    var d = new Date(viewDate.getFullYear(), viewDate.getMonth(), viewDate.getDate());
    document.getElementById("periodLabel").textContent = d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    var key = ymd(d);
    var dayEv = eventsOn(key);
    var hoursHtml = "";
    for (var h = 7; h <= 20; h++) {
      hoursHtml += "<span>" + String(h).padStart(2, "0") + "</span>";
    }
    var track =
      '<div class="ag-hours">' +
      hoursHtml +
      '</div><div class="ag-timeline-row"><div style="font-weight:800;color:#334155;padding-top:12px">Agenda</div><div class="ag-timeline-track">';
    dayEv.forEach(function (e) {
      var startH = 9;
      var startM = 0;
      if (e.eventTime) {
        var parts = String(e.eventTime).split(":");
        startH = Number(parts[0]) || 9;
        startM = Number(parts[1]) || 0;
      }
      var endH = startH + 1;
      var endM = startM;
      if (e.eventEndTime) {
        var ep = String(e.eventEndTime).split(":");
        endH = Number(ep[0]) || endH;
        endM = Number(ep[1]) || 0;
      }
      var startMin = Math.max(0, (startH - 7) * 60 + startM);
      var endMin = Math.max(startMin + 30, (endH - 7) * 60 + endM);
      var span = 14 * 60;
      var left = (startMin / span) * 100;
      var width = Math.max(4, ((endMin - startMin) / span) * 100);
      track +=
        '<a class="ag-timeline-ev" style="left:' +
        left +
        "%;width:" +
        width +
        "%;background:" +
        esc(Types.colorFor(e, filters.color)) +
        '" href="' +
        esc(eventHref(e)) +
        '" title="' +
        esc(e.title) +
        '">' +
        esc(e.title || Types.byId(e.eventType).label) +
        "</a>";
    });
    track += "</div></div>";
    if (!dayEv.length) {
      track += '<p class="ag-empty">Rien de planifié ce jour — créez une Estimation, Visite, RDV…</p>';
    } else {
      track += '<div class="ag-day-list" style="margin-top:12px">' + dayEv.map(eventCard).join("") + "</div>";
    }
    mount.innerHTML = '<div class="ag-timeline">' + track + "</div>";
  }

  function render() {
    if (viewMode === "day") return renderDay();
    if (viewMode === "week") return renderWeek();
    if (viewMode === "timeline") return renderTimeline();
    return renderMonth();
  }

  function icsEscape(s) {
    return String(s || "")
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");
  }

  function toIcalDate(dateStr, timeStr) {
    var d = String(dateStr || "").replace(/-/g, "").slice(0, 8);
    var t = String(timeStr || "0900").replace(":", "");
    if (t.length === 4) t += "00";
    return d + "T" + t;
  }

  function exportIcal() {
    var lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//LeadsOpportunities//Agenda//FR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ];
    filteredEvents().forEach(function (e) {
      if (!e.eventDate) return;
      var start = toIcalDate(e.eventDate, e.eventTime || "09:00");
      var end = toIcalDate(e.eventDate, e.eventEndTime || null);
      if (!e.eventEndTime) {
        var h = Number(String(e.eventTime || "09:00").slice(0, 2)) + 1;
        end = toIcalDate(e.eventDate, String(Math.min(23, h)).padStart(2, "0") + ":00");
      }
      lines.push("BEGIN:VEVENT");
      lines.push("UID:" + (e.id || start) + "@leadsopportunities.fr");
      lines.push("DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""));
      lines.push("DTSTART;TZID=Europe/Paris:" + start);
      lines.push("DTEND;TZID=Europe/Paris:" + end);
      lines.push("SUMMARY:" + icsEscape(e.title || "RDV"));
      lines.push(
        "DESCRIPTION:" +
          icsEscape(
            [e.description || "", e.contactName ? "Contact: " + e.contactName : "", e.propertyId ? "Bien: " + e.propertyId : ""]
              .filter(Boolean)
              .join("\n")
          )
      );
      if (e.location) lines.push("LOCATION:" + icsEscape(e.location));
      lines.push("END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    var blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "agenda-leadsopportunities.ics";
    a.click();
  }

  document.getElementById("btnConnectCal").onclick = function () {
    startGoogleConnect();
  };

  document.getElementById("btnPullCal").onclick = function () {
    runGoogleSync();
  };

  document.getElementById("btnIcal").onclick = exportIcal;

  document.getElementById("btnPrev").onclick = function () {
    if (viewMode === "month") viewDate.setMonth(viewDate.getMonth() - 1);
    else if (viewMode === "week") viewDate.setDate(viewDate.getDate() - 7);
    else viewDate.setDate(viewDate.getDate() - 1);
    render();
  };
  document.getElementById("btnNext").onclick = function () {
    if (viewMode === "month") viewDate.setMonth(viewDate.getMonth() + 1);
    else if (viewMode === "week") viewDate.setDate(viewDate.getDate() + 7);
    else viewDate.setDate(viewDate.getDate() + 1);
    render();
  };
  document.getElementById("btnToday").onclick = function () {
    viewDate = new Date();
    render();
  };

  document.querySelectorAll("#viewTabs [data-view]").forEach(function (b) {
    b.onclick = function () {
      setView(b.getAttribute("data-view"));
    };
  });

  document.getElementById("fType").onchange = function () {
    filters.type = this.value;
    render();
  };
  document.getElementById("fColor").onchange = function () {
    filters.color = this.value;
    render();
  };
  document.getElementById("fAgent").oninput = function () {
    filters.agent = this.value.toLowerCase().trim();
    render();
  };

  fillFilters();
  document.querySelectorAll("#viewTabs [data-view]").forEach(function (b) {
    b.classList.toggle("active", b.getAttribute("data-view") === viewMode);
  });
  loadCalendarStatus();
  loadEvents(render);

  var params = new URLSearchParams(location.search);
  var calErr = params.get("calendar_error");
  if (calErr && calBanner) {
    calBanner.className = "cal-banner cal-banner-warn";
    calBanner.textContent = calErr;
  }
  if (params.get("calendar") === "connected") {
    if (calBanner) {
      calBanner.className = "cal-banner cal-banner-ok";
      calBanner.textContent = "Google Calendar connecté — synchronisation en cours…";
    }
    runGoogleSync({ silent: true, skipConnect: true });
    if (history.replaceState) {
      history.replaceState({}, "", location.pathname);
    }
  }
})();
