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

  function renderUpcoming(list) {
    var el = document.getElementById("mktUpcoming");
    if (!list || !list.length) {
      el.innerHTML = '<p style="color:var(--muted)">Aucun créneau sur la période. Ajoutez un marché ou un créneau.</p>';
      return;
    }
    var today = new Date().toISOString().slice(0, 10);
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
          " · " +
          esc(item.start_time || "?") +
          "–" +
          esc(item.end_time || "?") +
          "</small></div>" +
          "<div><strong>" +
          esc(item.market_name) +
          "</strong>" +
          '<div class="mkt-meta">' +
          esc([item.city, item.address].filter(Boolean).join(" — ")) +
          (item.assigned_name ? " · <strong>" + esc(item.assigned_name) + "</strong>" : " · <em>Non assigné</em>") +
          (item.status && item.status !== "planned" ? " · " + esc(item.status) : "") +
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
      "<table><thead><tr><th>Lieu</th><th>Jour</th><th>Horaires</th><th></th></tr></thead><tbody>" +
      markets
        .map(function (m) {
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
            esc(m.default_start_time) +
            "–" +
            esc(m.default_end_time) +
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

  function buildMarketForm(m) {
    m = m || {};
    var days = (state.data && state.data.day_labels) || [];
    return (
      '<label>Nom<input type="text" name="name" required value="' +
      esc(m.name || "") +
      '" /></label>' +
      '<label>Ville<input type="text" name="city" value="' +
      esc(m.city || "") +
      '" /></label>' +
      '<label>Code postal<input type="text" name="postal_code" value="' +
      esc(m.postal_code || "") +
      '" /></label>' +
      '<label>Adresse<input type="text" name="address" value="' +
      esc(m.address || "") +
      '" /></label>' +
      '<label>Jour récurrent<select name="day_of_week">' +
      '<option value="">—</option>' +
      days
        .map(function (label, i) {
          return (
            '<option value="' +
            i +
            '"' +
            (Number(m.day_of_week) === i ? " selected" : "") +
            ">" +
            esc(label) +
            "</option>"
          );
        })
        .join("") +
      "</select></label>" +
      '<label>Début<input type="time" name="default_start_time" value="' +
      esc(m.default_start_time || "09:00") +
      '" /></label>' +
      '<label>Fin<input type="time" name="default_end_time" value="' +
      esc(m.default_end_time || "18:00") +
      '" /></label>' +
      '<label>Actif<select name="active"><option value="true"' +
      (m.active !== false ? " selected" : "") +
      '>Oui</option><option value="false"' +
      (m.active === false ? " selected" : "") +
      ">Non</option></select></label>" +
      '<label style="grid-column:1/-1">Notes<textarea name="notes" rows="2">' +
      esc(m.notes || "") +
      "</textarea></label>"
    );
  }

  function buildSlotForm(s, marketId, date) {
    s = s || {};
    var markets = (state.data && state.data.markets) || [];
    var mk =
      '<label>Marché / lieu<select name="market_id">' +
      '<option value="">— Hors marché —</option>' +
      markets
        .map(function (m) {
          var sel = (s.market_id || marketId) === m.id ? " selected" : "";
          return '<option value="' + esc(m.id) + '"' + sel + ">" + esc(m.name) + " (" + esc(m.city) + ")</option>";
        })
        .join("") +
      "</select></label>";
    return (
      mk +
      '<label>Date<input type="date" name="slot_date" required value="' +
      esc(s.slot_date ? String(s.slot_date).slice(0, 10) : date || "") +
      '" /></label>' +
      '<label>Début<input type="time" name="start_time" value="' +
      esc(s.start_time || "09:00") +
      '" /></label>' +
      '<label>Fin<input type="time" name="end_time" value="' +
      esc(s.end_time || "18:00") +
      '" /></label>' +
      '<label>Équipier<select name="assigned_user_id" id="mktAssignedUser">' +
      teamOptions(state.data && state.data.team, s.assigned_user_id) +
      "</select></label>" +
      '<label>Nom affiché (libre)<input type="text" name="assigned_name" value="' +
      esc(s.assigned_name || "") +
      '" placeholder="Si pas dans la liste" /></label>' +
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
      "</select></label>" +
      '<label style="grid-column:1/-1">Notes<textarea name="notes" rows="2">' +
      esc(s.notes || "") +
      "</textarea></label>"
    );
  }

  function openMarketEditor(id) {
    var m = (state.data.markets || []).find(function (x) {
      return x.id === id;
    });
    state.editing = { entity: "market", id: id };
    document.getElementById("mktFormTitle").textContent = m ? "Modifier le marché" : "Nouveau marché";
    document.getElementById("mktEntity").value = "market";
    document.getElementById("mktId").value = id || "";
    document.getElementById("mktFormFields").innerHTML = buildMarketForm(m);
    document.getElementById("btnMktDelete").hidden = !id;
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
          market_id: marketId,
          slot_date: date,
          start_time: occ.start_time,
          end_time: occ.end_time,
          assigned_name: occ.assigned_name,
          assigned_user_id: occ.assigned_user_id,
          status: occ.status || "planned",
          notes: occ.slot_notes,
        };
        if (occ.slot_id) slot.id = occ.slot_id;
      }
    }
    state.editing = { entity: "slot", id: slot && slot.id };
    document.getElementById("mktFormTitle").textContent = "Présence — " + (date ? formatFrDate(date) : "créneau");
    document.getElementById("mktEntity").value = "slot";
    document.getElementById("mktId").value = (slot && slot.id) || "";
    document.getElementById("mktFormFields").innerHTML = buildSlotForm(slot, marketId, date);
    document.getElementById("btnMktDelete").hidden = !(slot && slot.id);
    var userSel = document.getElementById("mktAssignedUser");
    if (userSel) {
      userSel.onchange = function () {
        var opt = userSel.options[userSel.selectedIndex];
        var nameInput = document.querySelector('#mktForm [name="assigned_name"]');
        if (nameInput && opt && opt.getAttribute("data-name")) {
          nameInput.value = opt.getAttribute("data-name");
        }
      };
    }
  }

  function readForm() {
    var entity = document.getElementById("mktEntity").value;
    var id = document.getElementById("mktId").value;
    var body = { entity: entity };
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
        document.getElementById("mktUpcoming").innerHTML =
          '<p style="color:#b91c1c">' + esc(String(e)) + "</p>";
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

  load();
})();
