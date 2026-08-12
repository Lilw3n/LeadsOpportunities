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
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function euro(n) {
    if (n == null || n === "") return "—";
    return Number(n).toLocaleString("fr-FR") + " €";
  }

  function fillSelects() {
    var typeSel = document.getElementById("fType");
    var srcSel = document.getElementById("fSource");
    var pType = document.getElementById("pType");
    var pSource = document.getElementById("pSource");
    Matcher.PROPERTY_TYPES.forEach(function (t) {
      typeSel.innerHTML += '<option value="' + t.id + '">' + t.label + "</option>";
      pType.innerHTML += '<option value="' + t.id + '">' + t.label + "</option>";
    });
    Matcher.LISTING_SOURCES.forEach(function (t) {
      srcSel.innerHTML += '<option value="' + t.id + '">' + t.label + "</option>";
      pSource.innerHTML += '<option value="' + t.id + '">' + t.label + "</option>";
    });
  }

  function queryFromForm() {
    return {
      q: document.getElementById("q").value,
      property_type: document.getElementById("fType").value,
      listing_source: document.getElementById("fSource").value,
      status: document.getElementById("fStatus").value,
      city: document.getElementById("fCity").value,
      max_price: document.getElementById("fMaxPrice").value,
      min_surface: document.getElementById("fMinSurf").value,
      min_rooms: document.getElementById("fMinRooms").value,
    };
  }

  function renderList() {
    var list = Store.listProperties(queryFromForm());
    var mount = document.getElementById("listMount");
    if (!list.length) {
      mount.innerHTML = '<p class="panel" style="color:var(--muted)">Aucun bien — créez-en un ou collez une URL d’annonce.</p>';
      return;
    }
    mount.innerHTML = list
      .map(function (p) {
        var tags = [];
        if (p.has_garage) tags.push("garage");
        if (p.has_parking) tags.push("parking");
        if (p.has_cave) tags.push("cave");
        if (p.has_garden) tags.push("jardin");
        if (p.has_terrace) tags.push("terrasse");
        if (p.has_balcony) tags.push("balcon");
        if (p.has_elevator) tags.push("ascenseur");
        if (p.has_pool) tags.push("piscine");
        var src = (Matcher.LISTING_SOURCES.find(function (s) {
          return s.id === p.listing_source;
        }) || {}).label || p.listing_source;
        return (
          '<article class="immo-card">' +
          "<div><h3>" +
          esc(p.title) +
          "</h3>" +
          '<div class="immo-meta">' +
          esc(p.city || "—") +
          " " +
          esc(p.postal_code || "") +
          " · " +
          (p.surface_m2 != null ? p.surface_m2 + " m²" : "—") +
          " · " +
          (p.rooms != null ? p.rooms + " p." : "") +
          " · FAI " +
          euro(p.price_fai) +
          " · net " +
          euro(p.price_net) +
          " · " +
          esc(src) +
          (p.dpe ? " · DPE " + esc(p.dpe) : "") +
          "</div>" +
          (p.listing_url
            ? '<div class="immo-meta"><a href="' +
              esc(p.listing_url) +
              '" target="_blank" rel="noopener">Voir l’annonce</a></div>'
            : "") +
          '<div class="immo-tags">' +
          tags.map(function (t) {
            return '<span class="immo-tag">' + t + "</span>";
          }).join("") +
          "</div></div>" +
          '<div class="immo-actions">' +
          '<a class="btn btn-ghost btn-sm" href="./crm-immo-property.html?id=' +
          encodeURIComponent(p.id) +
          '">Fiche</a>' +
          '<button type="button" class="btn btn-ghost btn-sm" data-edit="' +
          esc(p.id) +
          '">Éditer</button>' +
          '<button type="button" class="btn btn-ghost btn-sm" data-del="' +
          esc(p.id) +
          '">Suppr.</button>' +
          "</div></article>"
        );
      })
      .join("");

    mount.querySelectorAll("[data-edit]").forEach(function (btn) {
      btn.onclick = function () {
        openForm(Store.getProperty(btn.getAttribute("data-edit")));
      };
    });
    mount.querySelectorAll("[data-del]").forEach(function (btn) {
      btn.onclick = function () {
        if (!confirm("Supprimer ce bien ?")) return;
        Store.deleteProperty(btn.getAttribute("data-del"));
        renderList();
      };
    });
  }

  function openForm(p) {
    p = p || {};
    document.getElementById("formPanel").hidden = false;
    document.getElementById("formTitle").textContent = p.id ? "Modifier le bien" : "Nouveau bien";
    document.getElementById("pId").value = p.id || "";
    document.getElementById("pTitle").value = p.title || "";
    document.getElementById("pType").value = p.property_type || "appartement";
    document.getElementById("pStatus").value = p.status || "active";
    document.getElementById("pSource").value = p.listing_source || "manual";
    document.getElementById("pUrl").value = p.listing_url || "";
    document.getElementById("pCity").value = p.city || "";
    document.getElementById("pCp").value = p.postal_code || "";
    document.getElementById("pDept").value = p.department || "";
    document.getElementById("pAddress").value = p.address || "";
    document.getElementById("pSurf").value = p.surface_m2 != null ? p.surface_m2 : "";
    document.getElementById("pRooms").value = p.rooms != null ? p.rooms : "";
    document.getElementById("pBed").value = p.bedrooms != null ? p.bedrooms : "";
    document.getElementById("pNet").value = p.price_net != null ? p.price_net : "";
    document.getElementById("pFai").value = p.price_fai != null ? p.price_fai : "";
    document.getElementById("pHon").value = p.honoraires != null ? p.honoraires : "";
    document.getElementById("pDpe").value = p.dpe || "";
    document.getElementById("pOwner").value = p.owner_contact_id || "";
    document.getElementById("pBuyer").value = p.buyer_contact_id || "";
    document.getElementById("pLead").value = p.lead_id || "";
    document.getElementById("pGarage").checked = !!p.has_garage;
    document.getElementById("pParking").checked = !!p.has_parking;
    document.getElementById("pCave").checked = !!p.has_cave;
    document.getElementById("pGarden").checked = !!p.has_garden;
    document.getElementById("pTerrace").checked = !!p.has_terrace;
    document.getElementById("pBalcony").checked = !!p.has_balcony;
    document.getElementById("pElev").checked = !!p.has_elevator;
    document.getElementById("pPool").checked = !!p.has_pool;
    document.getElementById("pDesc").value = p.description || "";
    document.getElementById("pNotes").value = p.notes || "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.getElementById("propForm").onsubmit = function (e) {
    e.preventDefault();
    var cp = document.getElementById("pCp").value.trim();
    var item = {
      id: document.getElementById("pId").value || undefined,
      title: document.getElementById("pTitle").value.trim(),
      property_type: document.getElementById("pType").value,
      status: document.getElementById("pStatus").value,
      listing_source: document.getElementById("pSource").value,
      listing_url: document.getElementById("pUrl").value.trim(),
      city: document.getElementById("pCity").value.trim(),
      postal_code: cp,
      department: document.getElementById("pDept").value.trim() || cp.slice(0, 2),
      address: document.getElementById("pAddress").value.trim(),
      surface_m2: document.getElementById("pSurf").value,
      rooms: document.getElementById("pRooms").value,
      bedrooms: document.getElementById("pBed").value,
      price_net: document.getElementById("pNet").value,
      price_fai: document.getElementById("pFai").value,
      honoraires: document.getElementById("pHon").value,
      dpe: document.getElementById("pDpe").value.trim(),
      owner_contact_id: document.getElementById("pOwner").value.trim() || null,
      buyer_contact_id: document.getElementById("pBuyer").value.trim() || null,
      lead_id: document.getElementById("pLead").value.trim() || null,
      has_garage: document.getElementById("pGarage").checked,
      has_parking: document.getElementById("pParking").checked,
      has_cave: document.getElementById("pCave").checked,
      has_garden: document.getElementById("pGarden").checked,
      has_terrace: document.getElementById("pTerrace").checked,
      has_balcony: document.getElementById("pBalcony").checked,
      has_elevator: document.getElementById("pElev").checked,
      has_pool: document.getElementById("pPool").checked,
      description: document.getElementById("pDesc").value,
      notes: document.getElementById("pNotes").value,
    };
    Store.upsertProperty(item);
    document.getElementById("formPanel").hidden = true;
    renderList();
  };

  document.getElementById("btnNewProp").onclick = function () {
    openForm(null);
  };
  document.getElementById("btnCancelForm").onclick = function () {
    document.getElementById("formPanel").hidden = true;
  };

  ["q", "fType", "fSource", "fStatus", "fCity", "fMaxPrice", "fMinSurf", "fMinRooms"].forEach(function (id) {
    var el = document.getElementById(id);
    el.addEventListener("input", renderList);
    el.addEventListener("change", renderList);
  });

  fillSelects();
  Store.seedDemoIfEmpty();
  Store.syncFromApi().then(renderList).catch(renderList);
})();
