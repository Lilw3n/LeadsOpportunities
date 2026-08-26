/**
 * Table travaux copropriété — faits / votés / payés / prévus (fiche Laforêt).
 */
(function () {
  var MAX = 12;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function rowHtml(index, data) {
    data = data || {};
    var status = data.status || "";
    return (
      '<tr class="immo-copro-work-row" data-copro-work-index="' +
      index +
      '">' +
      '<td><input name="coproWorkNature[]" data-copro-field="nature" placeholder="Ravalement, ascenseur…" value="' +
      esc(data.nature || "") +
      '" /></td>' +
      '<td><select name="coproWorkStatus[]" data-copro-field="status">' +
      '<option value="">—</option>' +
      ['fait', 'vote', 'paye', 'prevu']
        .map(function (v) {
          var labels = { fait: "Fait", vote: "Voté AG", paye: "Payé", prevu: "Prévu" };
          return (
            '<option value="' +
            v +
            '"' +
            (status === v ? " selected" : "") +
            ">" +
            labels[v] +
            "</option>"
          );
        })
        .join("") +
      "</select></td>" +
      '<td><input name="coproWorkAmount[]" data-copro-field="amount" inputmode="numeric" placeholder="€" value="' +
      esc(data.amount || "") +
      '" /></td>' +
      '<td><input name="coproWorkDate[]" data-copro-field="date" type="date" value="' +
      esc(data.date || "") +
      '" /></td>' +
      '<td><input name="coproWorkShare[]" data-copro-field="share" inputmode="numeric" placeholder="Quote-part €" value="' +
      esc(data.share || "") +
      '" /></td>' +
      '<td><input name="coproWorkNote[]" data-copro-field="note" placeholder="Commentaire" value="' +
      esc(data.note || "") +
      '" /></td>' +
      "<td>" +
      (index > 0
        ? '<button type="button" class="immo-room-remove" data-copro-work-remove aria-label="Retirer">×</button>'
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
    return Array.prototype.slice.call(mount.querySelectorAll(".immo-copro-work-row")).map(function (row) {
      var o = {};
      row.querySelectorAll("[data-copro-field]").forEach(function (el) {
        o[el.getAttribute("data-copro-field")] = (el.value || "").trim();
      });
      return o;
    });
  }

  function collectFilled(mount) {
    return collect(mount).filter(rowHasContent);
  }

  function fromFieldArrays(values) {
    values = values || {};
    var natures = asArray(values["coproWorkNature[]"]);
    var statuses = asArray(values["coproWorkStatus[]"]);
    var amounts = asArray(values["coproWorkAmount[]"]);
    var dates = asArray(values["coproWorkDate[]"]);
    var shares = asArray(values["coproWorkShare[]"]);
    var notes = asArray(values["coproWorkNote[]"]);
    var n = Math.max(natures.length, statuses.length, amounts.length, dates.length, shares.length, notes.length);
    var rows = [];
    var i;
    for (i = 0; i < n; i++) {
      rows.push({
        nature: String(natures[i] == null ? "" : natures[i]).trim(),
        status: String(statuses[i] == null ? "" : statuses[i]).trim(),
        amount: String(amounts[i] == null ? "" : amounts[i]).trim(),
        date: String(dates[i] == null ? "" : dates[i]).trim(),
        share: String(shares[i] == null ? "" : shares[i]).trim(),
        note: String(notes[i] == null ? "" : notes[i]).trim(),
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
    var tbody = mount.querySelector("[data-copro-works-body]");
    if (!tbody) return;
    tbody.innerHTML = rows
      .slice(0, MAX)
      .map(function (r, i) {
        return rowHtml(i, r);
      })
      .join("");
    var addBtn = mount.querySelector("[data-copro-work-add]");
    if (addBtn) addBtn.hidden = rows.length >= MAX;
  }

  function bindMount(mount) {
    if (!mount || mount.dataset.coproWorksBound) return;
    mount.dataset.coproWorksBound = "1";
    render(mount, [{}]);

    mount.addEventListener("click", function (e) {
      if (e.target.closest("[data-copro-work-add]")) {
        var list = collect(mount);
        if (list.length >= MAX) return;
        list.push({});
        render(mount, list);
        notifyChange(mount);
        return;
      }
      var rm = e.target.closest("[data-copro-work-remove]");
      if (rm) {
        var idx = Number(rm.closest("[data-copro-work-index]").getAttribute("data-copro-work-index"));
        var rows = collect(mount);
        rows.splice(idx, 1);
        render(mount, rows.length ? rows : [{}]);
        notifyChange(mount);
      }
    });
  }

  function boot() {
    document.querySelectorAll("[data-copro-works-mount]").forEach(bindMount);
  }

  window.AcheteurImmoCoproWorks = {
    render: render,
    bind: bindMount,
    collect: collect,
    collectFilled: collectFilled,
    fromFieldArrays: fromFieldArrays,
    rowHasContent: rowHasContent,
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
