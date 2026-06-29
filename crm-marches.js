(function () {
  var TOKEN_KEY = "lo_token";
  var token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  var state = { data: null, editing: null };

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : s;
    return d.innerHTML;
  }

  function authHeaders() {
    return { Authorization: "Bearer " + token, "Content-Type": "application/json" };
  }

  function formatFrDate(iso) {
    try {
      return new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "short",
      });
    } catch (e) {
      return iso;
    }
  }

  function daysUntil(iso) {
    var d = new Date(iso + "T12:00:00");
    var t = new Date();
    t.setHours(12, 0, 0, 0);
    return Math.round((d - t) / 86400000);
  }

  function formatBreaks(breaks) {
    if (!breaks || !breaks.length) return "";
    return breaks
      .map(function (b) {
        return (b.label || "Pause") + " " + (b.start || "?") + "–" + (b.end || "?");
      })
      .join(" · ");
  }

  function scheduleSummaryHtml(item) {
    var lines = [];
    if (item.market_start_time && item.market_end_time) {
      lines.push(
        '<span class="mkt-tag mkt-tag--market">Marché ' +
          esc(item.market_start_time) +
          "–" +
          esc(item.market_end_time) +
          "</span>"
      );
    }
    var work =
      (item.work_prep_start ? "Prépa " + esc(item.work_prep_start) + " → " : "") +
      "Travail " +
      esc(item.work_start || item.presence_start || "?") +
      "–" +
      esc(item.work_end || item.presence_end || "?");
    lines.push('<span class="mkt-tag mkt-tag--work">' + work + "</span>");
    var br = formatBreaks(item.breaks);
    if (br) lines.push('<span class="mkt-tag mkt-tag--break">' + esc(br) + "</span>");
    return lines.join(" ");
  }

  function renderUpcoming(list) {
    var el = document.getElementById("mktUpcoming");
    if (!list || !list.length) {
      el.innerHTML = '<p style="color:var(--muted)">Aucun créneau sur la période. Ajoutez un marché ou un créneau.</p>';
      return;
    }
    el.innerHTML = list
      .map(function (item) {
        var du = daysUntil(item.date);
        var soon = du >= 0 && du <= 2;
        var unassigned = !item.has_assignment && item.status !== "cancelled";
        var cls = "mkt-row";
        if (item.status === "cancelled") cls += " mkt-cancelled";
        else if (soon) cls += " mkt-soon";
        else if (unassigned) cls += " mkt-unassigned";
        var when =
          du === 0 ? "Aujourd'hui" : du === 1 ? "Demain" : du > 0 ? "Dans " + du + " j" : "Passé";
        var presence =
          esc(item.presence_start || item.work_prep_start || item.work_start || "?") +
          "–" +
          esc(item.presence_end || item.work_end || "?");
        return (
          '<div class="' +
          cls +
          '" data-date="' +
          esc(item.date) +
          '" data-market="' +
          esc(item.market_id || "") +
          '" data-slot="' +
          esc(item.slot_id || "") +
          '">' +
          '<div class="mkt-date">' +
          esc(formatFrDate(item.date)) +
          "<small>" +
          esc(when) +
          " · présence " +
          presence +
          "</small></div>" +
          "<div><strong>" +
          esc(item.market_name) +
          "</strong>" +
          '<div class="mkt-schedule">' +
          scheduleSummaryHtml(item) +
          "</div>" +
          '<div class="mkt-meta">' +
          esc([item.city, item.address].filter(Boolean).join(" — ")) +
          (item.assigned_name ? " · <strong>" + esc(item.assigned_name) + "</strong>" : " · <em>Non assigné</em>") +
          "</div></div>" +
          '<div class="mkt-actions">' +
          '<button type="button" class="btn btn-primary btn-sm js-edit-presence">Modifier présence</button>' +
          "</div></div>"
        );
      })
      .join("");

    el.querySelectorAll(".js-edit-presence").forEach(function (btn) {
      btn.onclick = function () {
        var row = btn.closest(".mkt-row");
        openPresenceEditor(row.getAttribute("data-market"), row.getAttribute("data-date"), row.getAttribute("data-slot"));
      };
    });
  }

  function renderMarkets(markets) {
    var el = document.getElementById("mktMarketsList");
    if (!markets || !markets.length) {
      el.innerHTML = "<p>Aucun marché.</p>";
      return;
    }
    el.innerHTML =
      "<table><thead><tr><th>Lieu</th><th>Jour</th><th>Marché</th><th>Travail équipe</th><th></th></tr></thead><tbody>" +
      markets
        .map(function (m) {
          var marketH =
            m.market_start_time && m.market_end_time
              ? m.market_start_time + "–" + m.market_end_time
              : "—";
          var workH =
            (m.work_prep_start ? m.work_prep_start + "→" : "") +
            (m.work_start || "?") +
            "–" +
            (m.work_end || "?");
          return (
            "<tr" +
            (m.active ? "" : ' style="opacity:.5"') +
            "><td><strong>" +
            esc(m.name) +
            "</strong><br><small>" +
            esc(m.city) +
            "</small></td><td>" +
            esc(m.day_label || "—") +
            "</td><td>" +
            esc(marketH) +
            "</td><td>" +
            esc(workH) +
            (m.breaks && m.breaks.length ? "<br><small>" + esc(formatBreaks(m.breaks)) + "</small>" : "") +
            '</td><td><button type="button" class="btn btn-ghost btn-sm js-edit-market" data-id="' +
            esc(m.id) +
            '">Modifier</button></td></tr>'
          );
        })
        .join("") +
      "</tbody></table>";
    el.querySelectorAll(".js-edit-market").forEach(function (btn) {
      btn.onclick = function () {
        openMarketEditor(btn.getAttribute("data-id"));
      };
    });
  }

  function teamOptions(team, selectedId) {
    var html = '<option value="">— Choisir —</option>';
    (team || []).forEach(function (u) {
      var label = u.full_name || u.email;
      html +=
        '<option value="' +
        esc(u.id) +
        '" data-name="' +
        esc(label) +
        '"' +
        (selectedId === u.id ? " selected" : "") +
        ">" +
        esc(label) +
        "</option>";
    });
    return html;
  }

  function breaksEditorHtml(breaks) {
    var rows = (breaks && breaks.length ? breaks : [{ start: "", end: "", label: "Pause" }])
      .map(function (b, i) {
        return (
          '<div class="mkt-break-row" data-idx="' +
          i +
          '">' +
          '<input type="time" class="mkt-break-start" value="' +
          esc(b.start || "") +
          '" />' +
          '<input type="time" class="mkt-break-end" value="' +
          esc(b.end || "") +
          '" />' +
          '<input type="text" class="mkt-break-label" placeholder="Libellé" value="' +
          esc(b.label || "") +
          '" />' +
          '<button type="button" class="btn btn-ghost btn-sm mkt-break-del">×</button></div>'
        );
      })
      .join("");
    return (
      '<div class="mkt-form-section"><h3>Pauses</h3>' +
      '<div id="mktBreaksList">' +
      rows +
      "</div>" +
      '<button type="button" class="btn btn-ghost btn-sm" id="btnAddBreak">+ Pause</button></div>'
    );
  }

  function bindBreaksEditor() {
    var add = document.getElementById("btnAddBreak");
    if (add) {
      add.onclick = function () {
        var list = document.getElementById("mktBreaksList");
        var row = document.createElement("div");
        row.className = "mkt-break-row";
        row.innerHTML =
          '<input type="time" class="mkt-break-start" />' +
          '<input type="time" class="mkt-break-end" />' +
          '<input type="text" class="mkt-break-label" placeholder="Libellé" value="Pause" />' +
          '<button type="button" class="btn btn-ghost btn-sm mkt-break-del">×</button>';
        list.appendChild(row);
        bindBreakDel(row.querySelector(".mkt-break-del"));
      };
    }
    document.querySelectorAll(".mkt-break-del").forEach(bindBreakDel);
  }

  function bindBreakDel(btn) {
    if (!btn) return;
    btn.onclick = function () {
      var list = document.getElementById("mktBreaksList");
      if (list.children.length > 1) btn.parentElement.remove();
    };
  }

  function collectBreaks() {
    var out = [];
    document.querySelectorAll("#mktBreaksList .mkt-break-row").forEach(function (row) {
      var start = row.querySelector(".mkt-break-start").value;
      var end = row.querySelector(".mkt-break-end").value;
      var label = row.querySelector(".mkt-break-label").value;
      if (start || end) out.push({ start: start, end: end, label: label || "Pause" });
    });
    return out;
  }

  function scheduleFormHtml(data, isMarket) {
    data = data || {};
    var days = (state.data && state.data.day_labels) || [];
    var dayField = isMarket
      ? '<label>Jour récurrent<select name="day_of_week"><option value="">—</option>' +
        days
          .map(function (label, i) {
            return (
              '<option value="' +
              i +
              '"' +
              (Number(data.day_of_week) === i ? " selected" : "") +
              ">" +
              esc(label) +
              "</option>"
            );
          })
          .join("") +
        "</select></label>"
      : "";
    return (
      (isMarket
        ? '<div class="mkt-form-section"><h3>Lieu</h3><div class="mkt-form-grid">' +
          '<label>Nom<input type="text" name="name" required value="' +
          esc(data.name || "") +
          '" /></label>' +
          '<label>Ville<input type="text" name="city" value="' +
          esc(data.city || "") +
          '" /></label>' +
          '<label>Code postal<input type="text" name="postal_code" value="' +
          esc(data.postal_code || "") +
          '" /></label>' +
          '<label>Adresse<input type="text" name="address" value="' +
          esc(data.address || "") +
          '" /></label>' +
          dayField +
          '<label>Actif<select name="active"><option value="true"' +
          (data.active !== false ? " selected" : "") +
          '>Oui</option><option value="false"' +
          (data.active === false ? " selected" : "") +
          ">Non</option></select></label></div></div>"
        : "") +
      '<div class="mkt-form-section"><h3>Horaires du marché (ouverture du lieu)</h3>' +
      '<p class="mkt-form-hint">Heures officielles du marché — pas votre temps de travail.</p>' +
      '<div class="mkt-form-grid">' +
      '<label>Ouverture marché<input type="time" name="market_start_time" value="' +
      esc(data.market_start_time || data.default_start_time || "") +
      '" /></label>' +
      '<label>Fermeture marché<input type="time" name="market_end_time" value="' +
      esc(data.market_end_time || data.default_end_time || "") +
      '" /></label></div></div>' +
      '<div class="mkt-form-section"><h3>Horaires travail équipe</h3>' +
      '<p class="mkt-form-hint">Arrivée pour préparer le stand, activité, rangement. Peut commencer avant l\'ouverture du marché.</p>' +
      '<div class="mkt-form-grid">' +
      '<label>Arrivée / préparation<input type="time" name="work_prep_start" value="' +
      esc(data.work_prep_start || "") +
      '" /></label>' +
      '<label>Début activité<input type="time" name="work_start" value="' +
      esc(data.work_start || data.start_time || "") +
      '" /></label>' +
      '<label>Fin travail (rangement)<input type="time" name="work_end" value="' +
      esc(data.work_end || data.end_time || "") +
      '" /></label></div></div>' +
      breaksEditorHtml(data.breaks)
    );
  }

  function buildMarketForm(m) {
    m = m || {};
    return (
      scheduleFormHtml(m, true) +
      '<label style="grid-column:1/-1;margin-top:8px">Notes<textarea name="notes" rows="2">' +
      esc(m.notes || "") +
      "</textarea></label>"
    );
  }

  function buildSlotForm(s, marketId, date) {
    s = s || {};
    var markets = (state.data && state.data.markets) || [];
    var mk =
      '<div class="mkt-form-section"><h3>Créneau</h3><div class="mkt-form-grid">' +
      '<label>Marché / lieu<select name="market_id">' +
      '<option value="">— Bureau / hors marché —</option>' +
      markets
        .map(function (m) {
          var sel = (s.market_id || marketId) === m.id ? " selected" : "";
          return '<option value="' + esc(m.id) + '"' + sel + ">" + esc(m.name) + " (" + esc(m.city) + ")</option>";
        })
        .join("") +
      "</select></label>" +
      '<label>Date<input type="date" name="slot_date" required value="' +
      esc(s.slot_date ? String(s.slot_date).slice(0, 10) : date || "") +
      '" /></label>' +
      '<label>Équipier<select name="assigned_user_id" id="mktAssignedUser">' +
      teamOptions(state.data && state.data.team, s.assigned_user_id) +
      "</select></label>" +
      '<label>Nom affiché<input type="text" name="assigned_name" value="' +
      esc(s.assigned_name || "") +
      '" /></label>' +
      '<label>Statut<select name="status">' +
      ["planned", "confirmed", "cancelled"]
        .map(function (st) {
          return (
            '<option value="' +
            st +
            '"' +
            ((s.status || "planned") === st ? " selected" : "") +
            ">" +
            st +
            "</option>"
          );
        })
        .join("") +
      "</select></div></div>";
    return mk + scheduleFormHtml(s, false) + '<label style="margin-top:8px">Notes<textarea name="notes" rows="2">' + esc(s.notes || "") + "</textarea></label>";
  }

  function openMarketEditor(id) {
    var m = (state.data.markets || []).find(function (x) {
      return x.id === id;
    });
    state.editing = { entity: "market", id: id };
    document.getElementById("mktFormTitle").textContent = m ? "Modifier le marché / lieu" : "Nouveau marché / lieu";
    document.getElementById("mktEntity").value = "market";
    document.getElementById("mktId").value = id || "";
    document.getElementById("mktFormFields").innerHTML = buildMarketForm(m);
    document.getElementById("btnMktDelete").hidden = !id;
    bindBreaksEditor();
  }

  function openPresenceEditor(marketId, date, slotId) {
    var slot = null;
    if (slotId) {
      slot = (state.data.presence_slots || []).find(function (x) {
        return x.id === slotId;
      });
    }
    if (!slot && marketId && date) {
      var occ = (state.data.upcoming || []).find(function (x) {
        return x.market_id === marketId && x.date === date;
      });
      if (occ) {
        slot = {
          id: occ.slot_id,
          market_id: marketId,
          slot_date: date,
          market_start_time: occ.market_start_time,
          market_end_time: occ.market_end_time,
          work_prep_start: occ.work_prep_start,
          work_start: occ.work_start,
          work_end: occ.work_end,
          breaks: occ.breaks,
          assigned_name: occ.assigned_name,
          assigned_user_id: occ.assigned_user_id,
          status: occ.status || "planned",
          notes: occ.slot_notes,
        };
      }
    }
    state.editing = { entity: "slot", id: slot && slot.id };
    document.getElementById("mktFormTitle").textContent = "Présence — " + (date ? formatFrDate(date) : "créneau");
    document.getElementById("mktEntity").value = "slot";
    document.getElementById("mktId").value = (slot && slot.id) || "";
    document.getElementById("mktFormFields").innerHTML = buildSlotForm(slot, marketId, date);
    document.getElementById("btnMktDelete").hidden = !(slot && slot.id);
    bindBreaksEditor();
    var userSel = document.getElementById("mktAssignedUser");
    if (userSel) {
      userSel.onchange = function () {
        var opt = userSel.options[userSel.selectedIndex];
        var nameInput = document.querySelector('#mktForm [name="assigned_name"]');
        if (nameInput && opt && opt.getAttribute("data-name")) nameInput.value = opt.getAttribute("data-name");
      };
    }
  }

  function readForm() {
    var entity = document.getElementById("mktEntity").value;
    var id = document.getElementById("mktId").value;
    var body = { entity: entity, breaks: collectBreaks() };
    if (id) body.id = id;
    document.querySelectorAll("#mktFormFields [name]").forEach(function (el) {
      var v = el.value;
      if (el.name === "active") body.active = v === "true";
      else body[el.name] = v;
    });
    return body;
  }

  function load() {
    var days = document.getElementById("mktDays").value || 28;
    fetch("/api/crm/markets-presence?days=" + encodeURIComponent(days), { headers: authHeaders() })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok) throw new Error(res.error || "Erreur");
        state.data = res;
        renderUpcoming(res.upcoming);
        renderMarkets(res.markets);
      })
      .catch(function (e) {
        document.getElementById("mktUpcoming").innerHTML = '<p style="color:#b91c1c">' + esc(String(e)) + "</p>";
      });
  }

  document.getElementById("mktForm").onsubmit = function (e) {
    e.preventDefault();
    var body = readForm();
    body.days = document.getElementById("mktDays").value;
    fetch("/api/crm/markets-presence", {
      method: body.id ? "PATCH" : "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok) throw new Error(res.error || "Erreur");
        if (res.data) {
          state.data = res.data;
          renderUpcoming(res.data.upcoming);
          renderMarkets(res.data.markets);
        } else load();
        document.getElementById("mktFormTitle").textContent = "Enregistré ✓";
      })
      .catch(function (e) {
        alert(String(e));
      });
  };

  document.getElementById("btnMktDelete").onclick = function () {
    var entity = document.getElementById("mktEntity").value;
    var id = document.getElementById("mktId").value;
    if (!id || !confirm("Supprimer ?")) return;
    fetch("/api/crm/markets-presence?entity=" + encodeURIComponent(entity) + "&id=" + encodeURIComponent(id), {
      method: "DELETE",
      headers: authHeaders(),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function () {
        load();
        document.getElementById("mktFormFields").innerHTML = "";
        document.getElementById("btnMktDelete").hidden = true;
      });
  };

  document.getElementById("btnAddMarket").onclick = function () {
    openMarketEditor(null);
  };
  document.getElementById("btnAddSlot").onclick = function () {
    openPresenceEditor(null, null, null);
  };
  document.getElementById("btnMktCancel").onclick = function () {
    document.getElementById("mktFormFields").innerHTML = "";
    document.getElementById("btnMktDelete").hidden = true;
  };
  document.getElementById("btnMktRefresh").onclick = load;
  document.getElementById("mktDays").onchange = load;

  function loadAlertConfig() {
    fetch("/api/crm/markets-presence-alert-test", { headers: authHeaders() })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok || !res.config) return;
        renderAlertConfig(res.config);
      })
      .catch(function () {});
  }

  function renderAlertConfig(cfg) {
    var badge = document.getElementById("mktAlertBadge");
    var desc = document.getElementById("mktAlertDesc");
    if (!cfg || !badge) return;
    if (cfg.enabled) {
      badge.textContent = "Actif ✓";
      badge.className = "acq-badge meta";
    } else if (cfg.slack_configured) {
      badge.textContent = "Désactivé";
      badge.className = "acq-badge muted";
    } else {
      badge.textContent = "Slack manquant";
      badge.className = "acq-badge muted";
    }
    if (desc) {
      desc.textContent =
        "Horizon " +
        cfg.horizon_days +
        " j · cron " +
        (cfg.cron_schedule || "7h") +
        " (Paris). Variables : MARKETS_ALERT_DAYS_AHEAD, SLACK_WEBHOOK_URL.";
    }
  }

  function runAlertCheck() {
    var out = document.getElementById("mktAlertResult");
    if (!out) return;
    out.textContent = "Vérification…";
    fetch("/api/crm/markets-presence-alert-test", {
      method: "POST",
      headers: authHeaders(),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok && res.error) {
          out.textContent = res.error;
          out.style.color = "#b91c1c";
          return;
        }
        if (res.alerted) {
          out.textContent = "✓ Alerte envoyée sur Slack (" + res.unassigned_count + " créneau(x))";
          out.style.color = "#16a34a";
        } else if (!res.unassigned_count) {
          out.textContent = res.reason || "Tous les créneaux proches sont assignés";
          out.style.color = "#16a34a";
        } else {
          out.textContent = res.slack_error || res.reason || "Pas envoyé";
          out.style.color = "#b91c1c";
        }
      })
      .catch(function (e) {
        out.textContent = String(e);
        out.style.color = "#b91c1c";
      });
  }

  var btnAlert = document.getElementById("btnMktAlertTest");
  if (btnAlert) btnAlert.onclick = runAlertCheck;

  load();
  loadAlertConfig();
})();
