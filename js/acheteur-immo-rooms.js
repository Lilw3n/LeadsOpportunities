/**
 * Descriptif pièce par pièce — lignes modulables (ajout, suppression, déplacement).
 */
(function () {
  var MAX_ROOMS = 20;

  var LEVELS = [
    "Sous-sol",
    "Rez-de-jardin",
    "RDC",
    "1er",
    "2e",
    "3e",
    "4e",
    "5e",
    "Combles",
    "Mezzanine",
    "Extérieur",
  ];

  var ROOM_NAMES = [
    "Entrée",
    "Hall",
    "Dégagement",
    "Couloir",
    "Séjour",
    "Salon",
    "Salle à manger",
    "Cuisine",
    "Cuisine ouverte",
    "Chambre",
    "Chambre 1",
    "Chambre 2",
    "Chambre 3",
    "Chambre 4",
    "Chambre 5",
    "Suite parentale",
    "Bureau",
    "Dressing",
    "Salle de bains",
    "Salle d'eau",
    "WC",
    "Buanderie",
    "Cellier",
    "Débarras",
    "Véranda",
    "Terrasse",
    "Balcon",
    "Loggia",
    "Jardin",
    "Garage",
    "Cave",
    "Combles",
    "Grenier",
    "Atelier",
    "Local",
  ];

  var EXPOSURES = [
    "Nord",
    "Sud",
    "Est",
    "Ouest",
    "Nord-Est",
    "Nord-Ouest",
    "Sud-Est",
    "Sud-Ouest",
    "Double",
    "Triple",
  ];

  var FLOORINGS = [
    "Parquet",
    "Parquet massif",
    "Stratifié",
    "Carrelage",
    "Tomette",
    "Pierre",
    "Marbre",
    "Moquette",
    "Lino",
    "PVC",
    "Béton ciré",
    "Peinture",
  ];

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function optionsHtml(list, selected) {
    var found = false;
    var html = '<option value="">Non renseigné</option>';
    list.forEach(function (opt) {
      var match = selected && selected === opt;
      if (match) found = true;
      html += "<option" + (match ? " selected" : "") + ">" + esc(opt) + "</option>";
    });
    if (selected && !found) {
      html += "<option selected>" + esc(selected) + "</option>";
    }
    return html;
  }

  function selectHtml(name, field, list, value) {
    return (
      '<select name="' +
      name +
      '" data-room-field="' +
      field +
      '">' +
      optionsHtml(list, value || "") +
      "</select>"
    );
  }

  function roomRowHtml(index, data) {
    data = data || {};
    return (
      '<tr class="immo-room-row" data-room-index="' +
      index +
      '">' +
      '<td class="immo-room-handle-cell">' +
      '<span class="immo-room-handle" data-room-handle title="Glisser pour déplacer" aria-label="Déplacer la pièce" role="button" tabindex="0">' +
      '<svg width="14" height="18" viewBox="0 0 14 18" aria-hidden="true"><circle cx="4" cy="3" r="1.4"/><circle cx="10" cy="3" r="1.4"/><circle cx="4" cy="9" r="1.4"/><circle cx="10" cy="9" r="1.4"/><circle cx="4" cy="15" r="1.4"/><circle cx="10" cy="15" r="1.4"/></svg>' +
      "</span></td>" +
      "<td>" +
      selectHtml("roomLevel[]", "level", LEVELS, data.level) +
      "</td>" +
      "<td>" +
      selectHtml("roomName[]", "name", ROOM_NAMES, data.name) +
      "</td>" +
      "<td><input name=\"roomSurface[]\" data-room-field=\"surface\" inputmode=\"decimal\" placeholder=\"m²\" value=\"" +
      esc(data.surface || "") +
      '" /></td>' +
      "<td><input name=\"roomDimensions[]\" data-room-field=\"dimensions\" placeholder=\"L x l\" value=\"" +
      esc(data.dimensions || "") +
      '" /></td>' +
      "<td>" +
      selectHtml("roomExposure[]", "exposure", EXPOSURES, data.exposure) +
      "</td>" +
      "<td>" +
      selectHtml("roomFlooring[]", "flooring", FLOORINGS, data.flooring) +
      "</td>" +
      "<td><input name=\"roomComments[]\" data-room-field=\"comments\" placeholder=\"Non renseigné\" value=\"" +
      esc(data.comments || "") +
      '" /></td>' +
      '<td class="immo-room-actions">' +
      '<button type="button" class="immo-room-move" data-room-up aria-label="Monter la pièce">↑</button>' +
      '<button type="button" class="immo-room-move" data-room-down aria-label="Descendre la pièce">↓</button>' +
      '<button type="button" class="immo-room-remove" data-room-remove aria-label="Retirer la pièce">×</button>' +
      "</td></tr>"
    );
  }

  function rowsOf(mount) {
    return Array.prototype.slice.call(mount.querySelectorAll(".immo-room-row"));
  }

  function collect(mount) {
    if (!mount) return [];
    return rowsOf(mount).map(function (row) {
      var o = {};
      row.querySelectorAll("[data-room-field]").forEach(function (el) {
        o[el.getAttribute("data-room-field")] = (el.value || "").trim();
      });
      return o;
    });
  }

  function reindex(mount) {
    var rows = rowsOf(mount);
    rows.forEach(function (row, i) {
      row.setAttribute("data-room-index", String(i));
      var up = row.querySelector("[data-room-up]");
      var down = row.querySelector("[data-room-down]");
      if (up) up.disabled = i === 0;
      if (down) down.disabled = i === rows.length - 1;
      var rm = row.querySelector("[data-room-remove]");
      if (rm) rm.hidden = rows.length <= 1;
    });
    var addBtn = mount.querySelector("[data-room-add]");
    if (addBtn) addBtn.hidden = rows.length >= MAX_ROOMS;
  }

  function moveRow(mount, from, to) {
    var rows = rowsOf(mount);
    if (to < 0 || to >= rows.length || from === to) return false;
    var tbody = mount.querySelector("[data-rooms-body]");
    var row = rows[from];
    var target = rows[to];
    if (!tbody || !row || !target) return false;
    if (from < to) tbody.insertBefore(row, target.nextSibling);
    else tbody.insertBefore(row, target);
    reindex(mount);
    return true;
  }

  function render(mount, rows) {
    rows = rows && rows.length ? rows : [{}];
    var tbody = mount.querySelector("[data-rooms-body]");
    if (!tbody) return;
    tbody.innerHTML = rows
      .slice(0, MAX_ROOMS)
      .map(function (r, i) {
        return roomRowHtml(i, r);
      })
      .join("");
    reindex(mount);
  }

  function bindPointerSort(mount) {
    var dragging = null;
    var startY = 0;
    var active = false;

    function stop() {
      if (!dragging) return;
      dragging.classList.remove("is-dragging");
      document.body.classList.remove("immo-rooms-dragging");
      dragging = null;
      active = false;
      reindex(mount);
      document.removeEventListener("pointermove", onMove, true);
      document.removeEventListener("pointerup", stop, true);
      document.removeEventListener("pointercancel", stop, true);
    }

    function onMove(e) {
      if (!dragging) return;
      if (!active) {
        if (Math.abs(e.clientY - startY) < 5) return;
        active = true;
        dragging.classList.add("is-dragging");
        document.body.classList.add("immo-rooms-dragging");
      }
      e.preventDefault();
      var tbody = mount.querySelector("[data-rooms-body]");
      if (!tbody) return;
      var over = document.elementFromPoint(e.clientX, e.clientY);
      var row = over && over.closest ? over.closest(".immo-room-row") : null;
      if (!row || row === dragging || !mount.contains(row)) return;
      var rect = row.getBoundingClientRect();
      if (e.clientY > rect.top + rect.height / 2) {
        if (row.nextSibling !== dragging) tbody.insertBefore(dragging, row.nextSibling);
      } else if (dragging.nextSibling !== row) {
        tbody.insertBefore(dragging, row);
      }
    }

    mount.addEventListener("pointerdown", function (e) {
      var handle = e.target.closest("[data-room-handle]");
      if (!handle || !mount.contains(handle)) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      var row = handle.closest(".immo-room-row");
      if (!row) return;
      dragging = row;
      startY = e.clientY;
      active = false;
      try {
        handle.setPointerCapture(e.pointerId);
      } catch (err) {}
      document.addEventListener("pointermove", onMove, true);
      document.addEventListener("pointerup", stop, true);
      document.addEventListener("pointercancel", stop, true);
    });
  }

  function bindMount(mount) {
    if (!mount || mount.dataset.roomsBound) return;
    mount.dataset.roomsBound = "1";
    render(mount, [{}]);
    bindPointerSort(mount);

    mount.addEventListener("click", function (e) {
      var add = e.target.closest("[data-room-add]");
      if (add && mount.contains(add)) {
        var list = collect(mount);
        if (list.length >= MAX_ROOMS) return;
        var tbody = mount.querySelector("[data-rooms-body]");
        if (!tbody) return;
        tbody.insertAdjacentHTML("beforeend", roomRowHtml(list.length, {}));
        reindex(mount);
        var last = tbody.lastElementChild;
        var focusEl = last && last.querySelector("[data-room-field]");
        if (focusEl) focusEl.focus();
        return;
      }

      var row = e.target.closest(".immo-room-row");
      if (!row || !mount.contains(row)) return;
      var idx = Number(row.getAttribute("data-room-index"));

      if (e.target.closest("[data-room-up]")) {
        moveRow(mount, idx, idx - 1);
        return;
      }
      if (e.target.closest("[data-room-down]")) {
        moveRow(mount, idx, idx + 1);
        return;
      }
      if (e.target.closest("[data-room-remove]")) {
        var rows = collect(mount);
        rows.splice(idx, 1);
        render(mount, rows.length ? rows : [{}]);
      }
    });

    mount.addEventListener("keydown", function (e) {
      var handle = e.target.closest("[data-room-handle]");
      if (!handle || !mount.contains(handle)) return;
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      e.preventDefault();
      var row = handle.closest(".immo-room-row");
      if (!row) return;
      var idx = Number(row.getAttribute("data-room-index"));
      var moved = moveRow(mount, idx, e.key === "ArrowUp" ? idx - 1 : idx + 1);
      if (!moved) return;
      var next = rowsOf(mount)[e.key === "ArrowUp" ? idx - 1 : idx + 1];
      var nextHandle = next && next.querySelector("[data-room-handle]");
      if (nextHandle) nextHandle.focus();
    });
  }

  function boot() {
    document.querySelectorAll("[data-rooms-mount]").forEach(bindMount);
  }

  window.AcheteurImmoRooms = {
    render: render,
    bind: bindMount,
    collect: collect,
    moveRow: moveRow,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
