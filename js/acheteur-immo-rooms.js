/**
 * Descriptif pièce par pièce — fiche Laforêt (niveau, pièce, surface, revêtement, expo).
 */
(function () {
  var MAX_ROOMS = 20;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function roomRowHtml(index, data) {
    data = data || {};
    var n = index + 1;
    return (
      '<tr class="immo-room-row" data-room-index="' +
      index +
      '">' +
      "<td><input name=\"roomLevel[]\" data-room-field=\"level\" placeholder=\"RDC, 1…\" value=\"" +
      esc(data.level || "") +
      '" /></td>' +
      "<td><input name=\"roomName[]\" data-room-field=\"name\" placeholder=\"Séjour, Ch1…\" value=\"" +
      esc(data.name || "") +
      '" /></td>' +
      "<td><input name=\"roomSurface[]\" data-room-field=\"surface\" inputmode=\"decimal\" placeholder=\"m²\" value=\"" +
      esc(data.surface || "") +
      '" /></td>' +
      "<td><input name=\"roomDimensions[]\" data-room-field=\"dimensions\" placeholder=\"L x l\" value=\"" +
      esc(data.dimensions || "") +
      '" /></td>' +
      "<td><input name=\"roomFlooring[]\" data-room-field=\"flooring\" placeholder=\"Parquet, carrelage…\" value=\"" +
      esc(data.flooring || "") +
      '" /></td>' +
      "<td><input name=\"roomExposure[]\" data-room-field=\"exposure\" placeholder=\"S, E…\" value=\"" +
      esc(data.exposure || "") +
      '" /></td>' +
      "<td>" +
      (index > 0
        ? '<button type="button" class="immo-room-remove" data-room-remove aria-label="Retirer">×</button>'
        : "") +
      "</td></tr>"
    );
  }

  function rowHasContent(o) {
    if (!o) return false;
    return Object.keys(o).some(function (k) {
      return String(o[k] == null ? "" : o[k]).trim().length > 0;
    });
  }

  function asArray(v) {
    if (v == null || v === "") return [];
    return Array.isArray(v) ? v : [v];
  }

  function collect(mount) {
    if (!mount) return [];
    return Array.prototype.slice.call(mount.querySelectorAll(".immo-room-row")).map(function (row) {
      var o = {};
      row.querySelectorAll("[data-room-field]").forEach(function (el) {
        o[el.getAttribute("data-room-field")] = (el.value || "").trim();
      });
      return o;
    });
  }

  function collectFilled(mount) {
    return collect(mount).filter(rowHasContent);
  }

  /** Reconstruit les lignes depuis un FormData / brouillon QI (`roomName[]`, …). */
  function fromFieldArrays(values) {
    values = values || {};
    var levels = asArray(values["roomLevel[]"]);
    var names = asArray(values["roomName[]"]);
    var surfaces = asArray(values["roomSurface[]"]);
    var dims = asArray(values["roomDimensions[]"]);
    var floors = asArray(values["roomFlooring[]"]);
    var expos = asArray(values["roomExposure[]"]);
    var n = Math.max(levels.length, names.length, surfaces.length, dims.length, floors.length, expos.length);
    var rows = [];
    var i;
    for (i = 0; i < n; i++) {
      rows.push({
        level: String(levels[i] == null ? "" : levels[i]).trim(),
        name: String(names[i] == null ? "" : names[i]).trim(),
        surface: String(surfaces[i] == null ? "" : surfaces[i]).trim(),
        dimensions: String(dims[i] == null ? "" : dims[i]).trim(),
        flooring: String(floors[i] == null ? "" : floors[i]).trim(),
        exposure: String(expos[i] == null ? "" : expos[i]).trim(),
      });
    }
    return rows.filter(rowHasContent);
  }

  function notifyChange(mount) {
    try {
      mount.dispatchEvent(new Event("input", { bubbles: true }));
    } catch (e) {}
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
    var addBtn = mount.querySelector("[data-room-add]");
    if (addBtn) addBtn.hidden = rows.length >= MAX_ROOMS;
  }

  function bindMount(mount) {
    if (!mount || mount.dataset.roomsBound) return;
    mount.dataset.roomsBound = "1";
    render(mount, [{}]);

    mount.addEventListener("click", function (e) {
      var add = e.target.closest("[data-room-add]");
      if (add && mount.contains(add)) {
        var list = collect(mount);
        if (list.length >= MAX_ROOMS) return;
        list.push({});
        render(mount, list);
        notifyChange(mount);
        return;
      }
      var rm = e.target.closest("[data-room-remove]");
      if (rm && mount.contains(rm)) {
        var idx = Number(rm.closest("[data-room-index]").getAttribute("data-room-index"));
        var rows = collect(mount);
        rows.splice(idx, 1);
        render(mount, rows.length ? rows : [{}]);
        notifyChange(mount);
      }
    });
  }

  function boot() {
    document.querySelectorAll("[data-rooms-mount]").forEach(bindMount);
  }

  window.AcheteurImmoRooms = {
    render: render,
    bind: bindMount,
    collect: collect,
    collectFilled: collectFilled,
    fromFieldArrays: fromFieldArrays,
    rowHasContent: rowHasContent,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
