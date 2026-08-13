(function () {
  var Store = window.CrmImmoStore;
  var Matcher = window.CrmImmoMatcher;
  if (!Store || !Matcher) return;
  if (!localStorage.getItem("lo_token")) {
    location.href = "./crm.html";
    return;
  }

  var triState = { fPhone: "any", fGeo: "any" };
  var selected = {};
  var formParties = [];

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

  function readPartyRowsFromDom() {
    var mount = document.getElementById("partyRows");
    if (!mount) return formParties.slice();
    var rows = [];
    mount.querySelectorAll(".immo-party-item").forEach(function (row) {
      rows.push({
        id: row.getAttribute("data-id") || undefined,
        role: row.querySelector("[data-f=role]").value,
        name: row.querySelector("[data-f=name]").value.trim(),
        phone: row.querySelector("[data-f=phone]").value.trim(),
        email: row.querySelector("[data-f=email]").value.trim(),
        contact_id: row.querySelector("[data-f=contact]").value.trim() || null,
        share_pct: row.querySelector("[data-f=share]").value,
        is_primary: row.querySelector("[data-f=primary]").checked,
      });
    });
    formParties = rows;
    return rows;
  }

  function renderPartyRows() {
    var mount = document.getElementById("partyRows");
    if (!mount) return;
    if (!formParties.length) {
      mount.innerHTML =
        '<p style="margin:0;color:var(--muted);font-size:.8rem;font-weight:500">Aucune personne — clique « + Vendeur / héritier » pour en ajouter (illimité).</p>';
      return;
    }
    mount.innerHTML = formParties
      .map(function (p, idx) {
        return (
          '<div class="immo-party-item" data-id="' +
          esc(p.id || "") +
          '" data-idx="' +
          idx +
          '">' +
          "<label>Rôle<select data-f=\"role\">" +
          Matcher.PARTY_ROLES.map(function (r) {
            return (
              '<option value="' +
              r.id +
              '"' +
              (p.role === r.id ? " selected" : "") +
              ">" +
              esc(r.label) +
              "</option>"
            );
          }).join("") +
          "</select></label>" +
          '<label>Nom<input data-f="name" value="' +
          esc(p.name || "") +
          '" placeholder="Nom prénom" /></label>' +
          '<label>Tél<input data-f="phone" value="' +
          esc(p.phone || "") +
          '" /></label>' +
          '<label>Email<input data-f="email" value="' +
          esc(p.email || "") +
          '" /></label>' +
          '<label>Contact CRM<input data-f="contact" value="' +
          esc(p.contact_id || "") +
          '" placeholder="contact_…" /></label>' +
          '<label>Quote-part %<input data-f="share" type="number" min="0" max="100" step="0.01" value="' +
          esc(p.share_pct != null ? p.share_pct : "") +
          '" /></label>' +
          '<label style="flex-direction:row;align-items:center;gap:6px;margin-top:18px"><input data-f="primary" type="checkbox"' +
          (p.is_primary ? " checked" : "") +
          " /> Principal</label>" +
          '<button type="button" class="btn btn-ghost immo-party-remove" data-remove-party="' +
          idx +
          '">Retirer</button></div>'
        );
      })
      .join("");
    mount.querySelectorAll("[data-remove-party]").forEach(function (btn) {
      btn.onclick = function () {
        readPartyRowsFromDom();
        var i = Number(btn.getAttribute("data-remove-party"));
        formParties.splice(i, 1);
        renderPartyRows();
      };
    });
  }

  function addFormParty(role) {
    readPartyRowsFromDom();
    formParties.push({
      role: role || "heritier",
      name: "",
      phone: "",
      email: "",
      contact_id: null,
      share_pct: "",
      is_primary: formParties.filter(function (p) {
        return Matcher.partySide(p.role) === Matcher.partySide(role || "heritier");
      }).length === 0,
    });
    renderPartyRows();
  }

  function switchOn(el, on) {
    el.dataset.on = on ? "1" : "0";
    el.classList.toggle("on", !!on);
    el.setAttribute("aria-pressed", on ? "true" : "false");
  }

  function fillSelects() {
    var typeSel = document.getElementById("fType");
    var srcSel = document.getElementById("fSource");
    var pType = document.getElementById("pType");
    var pSource = document.getElementById("pSource");
    var fStatus = document.getElementById("fStatus");
    var pStatus = document.getElementById("pStatus");
    Matcher.PROPERTY_TYPES.forEach(function (t) {
      typeSel.innerHTML += '<option value="' + t.id + '">' + t.label + "</option>";
      pType.innerHTML += '<option value="' + t.id + '">' + t.label + "</option>";
    });
    Matcher.LISTING_SOURCES.forEach(function (t) {
      srcSel.innerHTML += '<option value="' + t.id + '">' + t.label + "</option>";
      pSource.innerHTML += '<option value="' + t.id + '">' + t.label + "</option>";
    });
    Matcher.PROPERTY_STATUSES.forEach(function (s) {
      fStatus.innerHTML += '<option value="' + s.id + '">' + s.label + "</option>";
      pStatus.innerHTML += '<option value="' + s.id + '">' + s.label + "</option>";
    });
  }

  function fillCityList() {
    var cities = {};
    Store.listProperties({}).forEach(function (p) {
      if (p.city) cities[p.city] = true;
    });
    document.getElementById("cityList").innerHTML = Object.keys(cities)
      .sort()
      .map(function (c) {
        return "<option value=\"" + esc(c) + "\"></option>";
      })
      .join("");
  }

  function queryFromForm() {
    return {
      q: document.getElementById("q").value,
      property_type: document.getElementById("fType").value,
      listing_source: document.getElementById("fSource").value,
      status: document.getElementById("fStatus").value,
      etat: document.getElementById("fEtat").value,
      transaction: document.getElementById("fTransaction").value,
      city: document.getElementById("fCity").value,
      agence: document.getElementById("fAgence").value,
      suivi_par: document.getElementById("fSuivi").value,
      min_price: document.getElementById("fPriceMin").value,
      max_price: document.getElementById("fPriceMax").value,
      min_surface: document.getElementById("fSurfMin").value,
      max_surface: document.getElementById("fSurfMax").value,
      min_rooms: document.getElementById("fRoomsMin").value,
      max_rooms: document.getElementById("fRoomsMax").value,
      min_bedrooms: document.getElementById("fBedMin").value,
      max_bedrooms: document.getElementById("fBedMax").value,
      phone: triState.fPhone,
      geo: triState.fGeo,
      a_contacter: document.getElementById("swContact").dataset.on === "1" ? true : undefined,
      contact_connu: document.getElementById("swKnown").dataset.on === "1" ? true : undefined,
      date_from: document.getElementById("fDateFrom").value,
      date_to: document.getElementById("fDateTo").value,
    };
  }

  function selectedIds() {
    return Object.keys(selected).filter(function (id) {
      return selected[id];
    });
  }

  function renderList() {
    var list = Store.listProperties(queryFromForm());
    var mount = document.getElementById("listMount");
    document.getElementById("listCount").textContent = list.length + " bien(s)";
    fillCityList();
    if (!list.length) {
      mount.innerHTML =
        '<p class="panel" style="color:var(--muted)">Aucune pige — ajuste les filtres ou crée un bien (URL Leboncoin / SeLoger…).</p>';
      return;
    }
    mount.innerHTML = list
      .map(function (p) {
        var tags = [];
        if (p.transaction === "location") tags.push("à louer");
        else tags.push("à vendre");
        if (p.a_contacter) tags.push("à contacter");
        tags.push(Matcher.propertyStatusLabel(p.status));
        if (p.has_garage) tags.push("garage");
        if (p.has_parking) tags.push("parking");
        if (p.has_cave) tags.push("cave");
        if (p.has_garden) tags.push("jardin");
        if (p.has_terrace) tags.push("terrasse");
        if (p.has_balcony) tags.push("balcon");
        if (p.has_elevator) tags.push("ascenseur");
        if (p.has_pool) tags.push("piscine");
        var partyN = Store.listParties(p.id).length;
        if (partyN) tags.push(partyN + " personne" + (partyN > 1 ? "s" : ""));
        var src =
          (Matcher.LISTING_SOURCES.find(function (s) {
            return s.id === p.listing_source;
          }) || {}).label || p.listing_source;
        return (
          '<article class="immo-card" data-id="' +
          esc(p.id) +
          '">' +
          '<div><input type="checkbox" class="row-chk" data-id="' +
          esc(p.id) +
          '"' +
          (selected[p.id] ? " checked" : "") +
          " /></div>" +
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
          (p.bedrooms != null ? " · " + p.bedrooms + " ch." : "") +
          " · " +
          euro(p.price_fai != null ? p.price_fai : p.price_net) +
          " · " +
          esc(src) +
          (p.suivi_par ? " · suivi " + esc(p.suivi_par) : "") +
          (p.phone ? " · ☎ " + esc(p.phone) : "") +
          "</div>" +
          (p.listing_url
            ? '<div class="immo-meta"><a href="' +
              esc(p.listing_url) +
              '" target="_blank" rel="noopener">Voir l’annonce</a></div>'
            : "") +
          '<div class="immo-tags">' +
          tags
            .map(function (t) {
              return '<span class="immo-tag">' + t + "</span>";
            })
            .join("") +
          "</div></div>" +
          '<div class="immo-actions">' +
          '<a class="btn btn-ghost btn-sm" href="./crm-immo-property.html?id=' +
          encodeURIComponent(p.id) +
          '">Fiche</a>' +
          '<button type="button" class="btn btn-ghost btn-sm" data-edit="' +
          esc(p.id) +
          '">Éditer</button>' +
          "</div></article>"
        );
      })
      .join("");

    mount.querySelectorAll("[data-edit]").forEach(function (btn) {
      btn.onclick = function () {
        openForm(Store.getProperty(btn.getAttribute("data-edit")));
      };
    });
    mount.querySelectorAll(".row-chk").forEach(function (chk) {
      chk.onchange = function () {
        selected[chk.getAttribute("data-id")] = chk.checked;
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
    document.getElementById("pTransaction").value = p.transaction || "vente";
    document.getElementById("pStatus").value = Matcher.normalizePropertyStatus(p.status || "estimation");
    document.getElementById("pEtat").value = p.etat || "non_affectee";
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
    document.getElementById("pAgence").value = p.agence || "";
    document.getElementById("pSuivi").value = p.suivi_par || "";
    document.getElementById("pPhone").value = p.phone || "";
    document.getElementById("pLead").value = p.lead_id || "";
    formParties = p.id
      ? Store.listParties(p.id).map(function (x) {
          return {
            id: x.id,
            role: x.role,
            name: x.name || "",
            phone: x.phone || "",
            email: x.email || "",
            contact_id: x.contact_id || null,
            share_pct: x.share_pct != null ? x.share_pct : "",
            is_primary: !!x.is_primary,
          };
        })
      : [];
    if (!formParties.length && (p.owner_contact_id || p.buyer_contact_id)) {
      if (p.owner_contact_id) {
        formParties.push({
          role: "vendeur",
          name: "",
          phone: "",
          email: "",
          contact_id: p.owner_contact_id,
          share_pct: "",
          is_primary: true,
        });
      }
      if (p.buyer_contact_id) {
        formParties.push({
          role: "acquereur",
          name: "",
          phone: "",
          email: "",
          contact_id: p.buyer_contact_id,
          share_pct: "",
          is_primary: true,
        });
      }
    }
    renderPartyRows();
    document.getElementById("pAContacter").checked = !!p.a_contacter;
    document.getElementById("pContactConnu").checked = !!p.contact_connu;
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
    var parties = readPartyRowsFromDom();
    var sellers = parties.filter(function (x) {
      return Matcher.isSellerRole(x.role) && x.contact_id;
    });
    var buyers = parties.filter(function (x) {
      return Matcher.isBuyerRole(x.role) && x.contact_id;
    });
    function pickPrimary(list) {
      var prim = list.find(function (x) {
        return x.is_primary;
      });
      return (prim || list[0] || {}).contact_id || null;
    }
    var cp = document.getElementById("pCp").value.trim();
    var item = {
      id: document.getElementById("pId").value || undefined,
      title: document.getElementById("pTitle").value.trim(),
      property_type: document.getElementById("pType").value,
      transaction: document.getElementById("pTransaction").value,
      status: document.getElementById("pStatus").value,
      etat: document.getElementById("pEtat").value,
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
      agence: document.getElementById("pAgence").value.trim(),
      suivi_par: document.getElementById("pSuivi").value.trim(),
      phone: document.getElementById("pPhone").value.trim(),
      owner_contact_id: pickPrimary(sellers),
      buyer_contact_id: pickPrimary(buyers),
      lead_id: document.getElementById("pLead").value.trim() || null,
      a_contacter: document.getElementById("pAContacter").checked,
      contact_connu: document.getElementById("pContactConnu").checked || parties.length > 0,
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
    var saved = Store.upsertProperty(item);
    Store.replacePropertyParties(saved.id, parties);
    document.getElementById("formPanel").hidden = true;
    renderList();
  };

  document.getElementById("btnNewProp").onclick = function () {
    openForm(null);
  };
  document.getElementById("btnCancelForm").onclick = function () {
    document.getElementById("formPanel").hidden = true;
  };
  document.getElementById("btnAddSeller").onclick = function () {
    addFormParty("heritier");
  };
  document.getElementById("btnAddBuyer").onclick = function () {
    addFormParty("acquereur");
  };
  document.getElementById("btnPigesSearch").onclick = renderList;

  document.querySelectorAll(".piges-tri").forEach(function (group) {
    var key = group.getAttribute("data-tri");
    group.querySelectorAll("button").forEach(function (btn) {
      btn.onclick = function () {
        group.querySelectorAll("button").forEach(function (b) {
          b.className = "";
        });
        var v = btn.getAttribute("data-v");
        triState[key] = v;
        btn.className = v === "yes" ? "active-yes" : v === "no" ? "active-no" : "active-any";
      };
    });
  });

  ["swContact", "swKnown"].forEach(function (id) {
    var el = document.getElementById(id);
    el.onclick = function () {
      switchOn(el, el.dataset.on !== "1");
    };
  });

  document.getElementById("chkAll").onchange = function () {
    var on = document.getElementById("chkAll").checked;
    document.querySelectorAll(".row-chk").forEach(function (chk) {
      chk.checked = on;
      selected[chk.getAttribute("data-id")] = on;
    });
  };

  function needSelection() {
    var ids = selectedIds();
    if (!ids.length) {
      alert("Sélectionne au moins un bien dans la liste.");
      return null;
    }
    return ids;
  }

  document.getElementById("pigesActions").onclick = function (e) {
    var btn = e.target.closest("[data-act]");
    if (!btn) return;
    var act = btn.getAttribute("data-act");
    var ids = selectedIds();
    var list = ids.map(function (id) {
      return Store.getProperty(id);
    }).filter(Boolean);

    if (act === "export") {
      var rows = Store.listProperties(queryFromForm());
      var headers = [
        "id",
        "title",
        "city",
        "postal_code",
        "property_type",
        "transaction",
        "surface_m2",
        "rooms",
        "bedrooms",
        "price_fai",
        "price_net",
        "listing_source",
        "listing_url",
        "phone",
        "suivi_par",
        "status",
      ];
      var csv = [headers.join(";")]
        .concat(
          rows.map(function (p) {
            return headers
              .map(function (h) {
                return '"' + String(p[h] != null ? p[h] : "").replace(/"/g, '""') + '"';
              })
              .join(";");
          })
        )
        .join("\n");
      var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "piges-export.csv";
      a.click();
      return;
    }

    if (act === "print") {
      var printable = Store.listProperties(queryFromForm())
        .map(function (p) {
          return (
            "<tr><td>" +
            esc(p.title) +
            "</td><td>" +
            esc(p.city) +
            "</td><td>" +
            (p.surface_m2 || "") +
            "</td><td>" +
            (p.rooms || "") +
            "</td><td>" +
            euro(p.price_fai != null ? p.price_fai : p.price_net) +
            "</td><td>" +
            esc(p.phone || "") +
            "</td></tr>"
          );
        })
        .join("");
      var w = window.open("", "_blank");
      w.document.write(
        "<html><head><title>Listing piges</title></head><body><h1>Listing piges</h1><table border=1 cellpadding=6><tr><th>Titre</th><th>Ville</th><th>m²</th><th>Pièces</th><th>Prix</th><th>Tél.</th></tr>" +
          printable +
          "</table></body></html>"
      );
      w.document.close();
      w.print();
      return;
    }

    if (act === "delete") {
      ids = needSelection();
      if (!ids) return;
      if (!confirm("Supprimer " + ids.length + " bien(s) ?")) return;
      ids.forEach(function (id) {
        Store.deleteProperty(id);
        delete selected[id];
      });
      renderList();
      return;
    }

    if (act === "assign") {
      ids = needSelection();
      if (!ids) return;
      var name = prompt("Affecter à (suivi par) :", list[0] && list[0].suivi_par ? list[0].suivi_par : "");
      if (name == null) return;
      ids.forEach(function (id) {
        var p = Store.getProperty(id);
        if (!p) return;
        p.suivi_par = name.trim();
        p.etat = name.trim() ? "affectee" : "non_affectee";
        Store.upsertProperty(p);
      });
      renderList();
      return;
    }

    if (act === "suivi") {
      ids = needSelection();
      if (!ids) return;
      var note = prompt("Note de suivi :", "");
      if (note == null || !String(note).trim()) return;
      var stamp = new Date().toLocaleString("fr-FR");
      ids.forEach(function (id) {
        var p = Store.getProperty(id);
        if (!p) return;
        p.notes = (p.notes ? p.notes + "\n" : "") + "[" + stamp + "] " + note.trim();
        p.a_contacter = false;
        Store.upsertProperty(p);
      });
      renderList();
      return;
    }

    if (act === "sms") {
      ids = needSelection();
      if (!ids) return;
      var phones = list
        .map(function (p) {
          return p.phone;
        })
        .filter(Boolean);
      if (!phones.length) {
        alert("Aucun téléphone sur la sélection.");
        return;
      }
      var msg = prompt("Texte SMS (ouverture de l’app SMS) :", "Bonjour, concernant votre bien…");
      if (msg == null) return;
      location.href = "sms:" + phones[0] + "?body=" + encodeURIComponent(msg);
      return;
    }

    if (act === "phone") {
      ids = needSelection();
      if (!ids) return;
      var targets = list.filter(function (p) {
        return p.phone;
      });
      if (!targets.length) {
        alert("Aucun numéro pour la prospection téléphonique.");
        return;
      }
      var first = targets[0];
      first.a_contacter = true;
      Store.upsertProperty(first);
      if (confirm("Appeler " + (first.phone || "") + " — " + (first.title || "") + " ?")) {
        location.href = "tel:" + String(first.phone).replace(/\s/g, "");
      }
      renderList();
    }
  };

  fillSelects();
  Store.seedDemoIfEmpty();
  Store.syncFromApi().then(renderList).catch(renderList);
})();
