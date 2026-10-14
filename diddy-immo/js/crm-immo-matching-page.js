(function () {
  var Store = window.CrmImmoStore;
  var Matcher = window.CrmImmoMatcher;
  if (!Store || !Matcher) return;
  if (!localStorage.getItem("lo_token")) {
    location.href = "./crm.html";
    return;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  function euro(n) {
    if (n == null || n === "") return "—";
    return Number(n).toLocaleString("fr-FR") + " €";
  }

  function refreshSelect(selected) {
    var sel = document.getElementById("critSelect");
    var list = Store.listCriteria();
    sel.innerHTML = list
      .map(function (c) {
        return (
          '<option value="' +
          esc(c.id) +
          '"' +
          (c.id === selected ? " selected" : "") +
          ">" +
          esc(c.label) +
          "</option>"
        );
      })
      .join("");
    if (!list.length) sel.innerHTML = '<option value="">Aucune fiche</option>';
  }

  function openForm(c) {
    c = c || {};
    document.getElementById("critFormPanel").hidden = false;
    document.getElementById("cId").value = c.id || "";
    document.getElementById("cLabel").value = c.label || "";
    document.getElementById("cContact").value = c.contact_id || "";
    document.getElementById("cLead").value = c.lead_id || "";
    document.getElementById("cTypes").value = (c.property_types || []).join(",");
    document.getElementById("cCities").value = (c.cities || []).join(",");
    document.getElementById("cCp").value = (c.postal_codes || []).join(",");
    document.getElementById("cDept").value = (c.departments || []).join(",");
    document.getElementById("cSurfMin").value = c.surface_min != null ? c.surface_min : "";
    document.getElementById("cSurfMax").value = c.surface_max != null ? c.surface_max : "";
    document.getElementById("cRooms").value = c.rooms_min != null ? c.rooms_min : "";
    document.getElementById("cBed").value = c.bedrooms_min != null ? c.bedrooms_min : "";
    document.getElementById("cBudMin").value = c.budget_min != null ? c.budget_min : "";
    document.getElementById("cBudMax").value = c.budget_max != null ? c.budget_max : "";
    document.getElementById("cPriceMode").value = c.price_mode || "fai";
    document.getElementById("cRadius").value = c.radius_km != null ? c.radius_km : "";
    document.getElementById("cGarage").checked = !!c.want_garage;
    document.getElementById("cParking").checked = !!c.want_parking;
    document.getElementById("cCave").checked = !!c.want_cave;
    document.getElementById("cGarden").checked = !!c.want_garden;
    document.getElementById("cTerrace").checked = !!c.want_terrace;
    document.getElementById("cBalcony").checked = !!c.want_balcony;
    document.getElementById("cElev").checked = !!c.want_elevator;
    document.getElementById("cPool").checked = !!c.want_pool;
    document.getElementById("cNotes").value = c.notes || "";
  }

  function runMatch() {
    var id = document.getElementById("critSelect").value;
    var mount = document.getElementById("matchMount");
    if (!id) {
      mount.innerHTML = '<p class="panel" style="color:var(--muted)">Créez une fiche recherche acquéreur.</p>';
      return;
    }
    var result = Store.match(id);
    if (!result.matches.length) {
      mount.innerHTML = '<p class="panel">Aucun bien actif à comparer — ajoutez des biens dans l’inventaire.</p>';
      return;
    }
    mount.innerHTML =
      '<p style="color:var(--muted);margin-bottom:10px">' +
      result.count +
      " bien(s) scorés · meilleur score " +
      (result.best ? result.best.score + "%" : "—") +
      "</p>" +
      result.matches
        .map(function (m) {
          var p = m.property;
          return (
            '<article class="match-row">' +
            '<div class="match-score ' +
            esc(m.status) +
            '">' +
            m.score +
            "%</div>" +
            "<div><strong>" +
            esc(p.title) +
            "</strong><div class='match-bits'>" +
            esc(p.city || "") +
            " · " +
            (p.surface_m2 != null ? p.surface_m2 + " m²" : "—") +
            " · " +
            (p.rooms != null ? p.rooms + " p." : "") +
            " · FAI " +
            euro(p.price_fai) +
            "</div>" +
            '<div class="match-bits">' +
            (m.reasons || [])
              .slice(0, 5)
              .map(function (r) {
                return '<span class="ok">✓ ' + esc(r) + "</span> ";
              })
              .join("") +
            (m.gaps || [])
              .slice(0, 4)
              .map(function (g) {
                return '<span class="gap">· ' + esc(g) + "</span> ";
              })
              .join("") +
            "</div></div>" +
            '<a class="btn btn-ghost btn-sm" href="./crm-immo-property.html?id=' +
            encodeURIComponent(p.id) +
            '">Fiche</a></article>'
          );
        })
        .join("");
  }

  document.getElementById("critForm").onsubmit = function (e) {
    e.preventDefault();
    var item = Store.upsertCriteria({
      id: document.getElementById("cId").value || undefined,
      label: document.getElementById("cLabel").value.trim(),
      contact_id: document.getElementById("cContact").value.trim() || null,
      lead_id: document.getElementById("cLead").value.trim() || null,
      property_types: document.getElementById("cTypes").value,
      cities: document.getElementById("cCities").value,
      postal_codes: document.getElementById("cCp").value,
      departments: document.getElementById("cDept").value,
      surface_min: document.getElementById("cSurfMin").value,
      surface_max: document.getElementById("cSurfMax").value,
      rooms_min: document.getElementById("cRooms").value,
      bedrooms_min: document.getElementById("cBed").value,
      budget_min: document.getElementById("cBudMin").value,
      budget_max: document.getElementById("cBudMax").value,
      price_mode: document.getElementById("cPriceMode").value,
      radius_km: document.getElementById("cRadius").value,
      want_garage: document.getElementById("cGarage").checked,
      want_parking: document.getElementById("cParking").checked,
      want_cave: document.getElementById("cCave").checked,
      want_garden: document.getElementById("cGarden").checked,
      want_terrace: document.getElementById("cTerrace").checked,
      want_balcony: document.getElementById("cBalcony").checked,
      want_elevator: document.getElementById("cElev").checked,
      want_pool: document.getElementById("cPool").checked,
      notes: document.getElementById("cNotes").value,
    });
    document.getElementById("critFormPanel").hidden = true;
    refreshSelect(item.id);
    runMatch();
  };

  document.getElementById("btnNewCrit").onclick = function () {
    openForm(null);
  };
  document.getElementById("btnEditCrit").onclick = function () {
    var c = Store.getCriteria(document.getElementById("critSelect").value);
    if (c) openForm(c);
  };
  document.getElementById("btnDelCrit").onclick = function () {
    var id = document.getElementById("critSelect").value;
    if (!id || !confirm("Supprimer cette fiche recherche ?")) return;
    Store.deleteCriteria(id);
    refreshSelect();
    runMatch();
  };
  document.getElementById("btnCancelCrit").onclick = function () {
    document.getElementById("critFormPanel").hidden = true;
  };
  document.getElementById("btnRunMatch").onclick = runMatch;
  document.getElementById("critSelect").onchange = runMatch;

  Store.seedDemoIfEmpty();
  Store.syncFromApi()
    .then(function () {
      refreshSelect();
      runMatch();
    })
    .catch(function () {
      refreshSelect();
      runMatch();
    });
})();
