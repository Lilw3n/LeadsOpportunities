/**
 * Vue d’ensemble des relations personnes (famille, SCI, héritiers, parrainage).
 */
(function () {
  var Rel = window.CrmPeopleRelations;
  var Store = window.CrmRelationsStore;

  function esc(s) {
    if (s == null) return "";
    var d = document.createElement("div");
    d.textContent = String(s);
    return d.innerHTML;
  }

  function nameOf(id, fallback) {
    return (fallback && String(fallback).trim()) || id || "—";
  }

  function contactLink(id, name) {
    if (!id) return esc(name || "—");
    return (
      '<a href="./crm-contact.html?id=' +
      encodeURIComponent(id) +
      '">' +
      esc(nameOf(id, name)) +
      "</a>"
    );
  }

  var all = [];

  function groupOf(type) {
    var d = Rel.findById(Rel.REL_TYPES, type);
    return (d && d.group) || "";
  }

  function render() {
    var q = (document.getElementById("relFilterQ").value || "").toLowerCase();
    var type = document.getElementById("relFilterType").value;
    var rows = all.filter(function (r) {
      if (type && r.rel_type !== type) return false;
      if (!q) return true;
      var blob = [r.from_name, r.to_name, r.notes, r.rel_type, r.from_contact_id, r.to_contact_id]
        .join(" ")
        .toLowerCase();
      return blob.indexOf(q) !== -1;
    });
    var body = document.getElementById("relBody");
    if (!rows.length) {
      body.innerHTML =
        '<tr><td colspan="5">Aucun lien. Ouvre une fiche contact pour en créer (conjoint, héritier, associé SCI, parrainage).</td></tr>';
      return;
    }
    body.innerHTML = rows
      .map(function (r) {
        var def = Rel.findById(Rel.REL_TYPES, r.rel_type);
        var g = groupOf(r.rel_type);
        return (
          "<tr><td><span class='rel-badge " +
          esc(g) +
          "'>" +
          esc(Rel.relTypeLabel(r.rel_type)) +
          "</span></td><td>" +
          contactLink(r.from_contact_id, r.from_name) +
          "</td><td>" +
          esc(def ? def.fromLabel : r.rel_type) +
          "</td><td>" +
          contactLink(r.to_contact_id, r.to_name) +
          "</td><td>" +
          esc(r.notes || (r.rel_type === "parrainage" ? "—" : "—")) +
          "</td></tr>"
        );
      })
      .join("");
  }

  function renderKpis() {
    var counts = { famille: 0, patrimoine: 0, societe: 0, parrainage: 0 };
    all.forEach(function (r) {
      var g = groupOf(r.rel_type);
      if (counts[g] != null) counts[g]++;
    });
    document.getElementById("relKpis").innerHTML =
      kpi("Total", all.length, "liens") +
      kpi("Famille", counts.famille, "conjoint, enfants…") +
      kpi("Patrimoine", counts.patrimoine, "héritiers") +
      kpi("SCI / associés", counts.societe, "parts sociales") +
      kpi("Parrainage", counts.parrainage, "apporteurs — sans promesse");
  }

  function kpi(label, n, hint) {
    return (
      '<div class="rel-kpi"><strong>' +
      esc(String(n)) +
      "</strong><span>" +
      esc(label) +
      " · " +
      esc(hint) +
      "</span></div>"
    );
  }

  document.getElementById("relDisclaimer").textContent = Rel.NO_PROMISE;
  var sel = document.getElementById("relFilterType");
  Rel.REL_TYPES.forEach(function (t) {
    var opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = t.label;
    sel.appendChild(opt);
  });
  document.getElementById("relFilterQ").addEventListener("input", render);
  document.getElementById("relFilterType").addEventListener("change", render);

  Store.list({}).then(function (rows) {
    all = rows || [];
    renderKpis();
    render();
  });
})();
