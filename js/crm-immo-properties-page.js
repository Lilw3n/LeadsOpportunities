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
  var pageParams = new URLSearchParams(location.search);
  var filterContactId = String(pageParams.get("contact_id") || "").trim();
  var linkedOnlyDefault =
    pageParams.get("linked_only") === "1" || !!filterContactId || pageParams.get("linked_only") !== "0";

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

  function formatWhen(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function exportInventory() {
    var rows = Store.listProperties({}).map(function (p) {
      var hist = Array.isArray(p.history) ? p.history.length : 0;
      return {
        id: p.id,
        title: p.title || "",
        city: p.city || "",
        postal_code: p.postal_code || "",
        price_fai: p.price_fai,
        price_net: p.price_net,
        status: p.status || "",
        listing_source: p.listing_source || "",
        created_at: p.created_at || "",
        updated_at: p.updated_at || "",
        history_saves: hist,
        owner_contact_id: p.owner_contact_id || "",
        buyer_contact_id: p.buyer_contact_id || "",
        lead_id: p.lead_id || "",
      };
    });
    var blob = new Blob(
      [JSON.stringify({ exportedAt: new Date().toISOString(), count: rows.length, properties: rows }, null, 2)],
      { type: "application/json" }
    );
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "inventaire-piges-" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
    }, 1500);
  }

  var contactLabelCache = {};
  var contactFetchQueued = {};
  var Links = window.CrmImmoContactLinks;

  function authHeaders() {
    return { Authorization: "Bearer " + (localStorage.getItem("lo_token") || "") };
  }

  function ensureContactLabel(id) {
    id = String(id || "").trim();
    if (!id) return Promise.resolve(null);
    if (contactLabelCache[id]) return Promise.resolve(contactLabelCache[id]);
    if (contactFetchQueued[id]) return contactFetchQueued[id];
    contactFetchQueued[id] = fetch("/api/crm/contact?id=" + encodeURIComponent(id), {
      headers: authHeaders(),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        var c = (data && (data.contact || data)) || null;
        var label =
          (Links && Links.contactDisplayName(c)) ||
          (c && ((c.first_name || "") + " " + (c.last_name || "")).trim()) ||
          (Links ? Links.shortId(id) : id);
        contactLabelCache[id] = {
          label: label,
          phone: (c && (c.phone || c.mobile)) || "",
          missing: !(c && c.id),
        };
        return contactLabelCache[id];
      })
      .catch(function () {
        contactLabelCache[id] = {
          label: Links ? Links.shortId(id) : id,
          phone: "",
          missing: true,
        };
        return contactLabelCache[id];
      });
    return contactFetchQueued[id];
  }

  function prospectBlockHtml(p) {
    var links = Links ? Links.linksForProperty(p, Store, Matcher) : [];
    var parts = [];
    links.forEach(function (row) {
      var label = row.name || "";
      if (row.contact_id && contactLabelCache[row.contact_id]) {
        label = contactLabelCache[row.contact_id].label || label;
      }
      if (row.contact_id) {
        parts.push(
          "<strong>" +
            esc(row.role_label || row.role) +
            "</strong> : " +
            '<a href="./crm-contact.html?id=' +
            encodeURIComponent(row.contact_id) +
            '">' +
            esc(label || (Links ? Links.shortId(row.contact_id) : row.contact_id)) +
            "</a>"
        );
      } else if (label) {
        parts.push("<strong>" + esc(row.role_label || row.role) + "</strong> : " + esc(label));
      } else if (row.phone) {
        parts.push(
          "<strong>" +
            esc(row.role_label || "Prospect") +
            "</strong> : ☎ " +
            esc(row.phone) +
            ' <span class="immo-prospect-hint">(pas encore lié à une fiche contact)</span>'
        );
      }
    });
    if (!parts.length) {
      parts.push(
        '<span class="immo-prospect-empty">Aucun prospect / client lié — renseignez le contact vendeur (Éditer) ou Personnes sur la fiche</span>'
      );
    }
    return (
      '<div class="immo-prospect" data-prop-prospect="' +
      esc(p.id) +
      '">' +
      parts.join(" · ") +
      "</div>"
    );
  }

  function hydrateContactLabels(list) {
    if (!Links) return;
    var ids = {};
    (list || []).forEach(function (p) {
      Links.linksForProperty(p, Store, Matcher).forEach(function (row) {
        if (row.contact_id) ids[row.contact_id] = true;
      });
    });
    var pending = Object.keys(ids).filter(function (id) {
      return !contactLabelCache[id];
    });
    if (!pending.length) return;
    Promise.all(pending.map(ensureContactLabel)).then(function () {
      renderList(true);
    });
  }

  function switchOn(el, on) {
    el.dataset.on = on ? "1" : "0";
    el.classList.toggle("on", !!on);
    el.setAttribute("aria-pressed", on ? "true" : "false");
  }

  function fillSourceSelect(sel, withAll) {
    if (!sel) return;
    var Portals = window.ImmoListingPortals;
    var html = withAll ? '<option value="">Toutes</option>' : "";
    if (Portals && Portals.groupedOptions) {
      Portals.groupedOptions().forEach(function (g) {
        html += '<optgroup label="' + esc(g.label) + '">';
        g.items.forEach(function (t) {
          html += '<option value="' + esc(t.id) + '">' + esc(t.label) + "</option>";
        });
        html += "</optgroup>";
      });
    } else {
      Matcher.LISTING_SOURCES.forEach(function (t) {
        html += '<option value="' + esc(t.id) + '">' + esc(t.label) + "</option>";
      });
    }
    sel.innerHTML = html;
  }

  function bindUrlAutodetect(urlEl, sourceEl) {
    if (!urlEl || !sourceEl || !window.ImmoListingPortals) return;
    urlEl.addEventListener("change", function () {
      var d = window.ImmoListingPortals.detectFromUrl(urlEl.value);
      if (d.ok && d.portal && d.portal !== "autre") sourceEl.value = d.portal;
    });
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
    fillSourceSelect(srcSel, true);
    fillSourceSelect(pSource, false);
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

  function propertyHistory(p) {
    if (!p) return [];
    if (Array.isArray(p.history) && p.history.length) return p.history;
    var meta = p.metadata || p.metadata_json;
    if (typeof meta === "string") {
      try {
        meta = JSON.parse(meta);
      } catch (e) {
        meta = null;
      }
    }
    if (meta && Array.isArray(meta.history)) return meta.history;
    return Array.isArray(p.history) ? p.history : [];
  }

  function propertyHasLinkedProspect(p) {
    if (!p) return false;
    if (p.owner_contact_id || p.buyer_contact_id || p.lead_id) return true;
    if (Links && Links.linksForProperty) {
      return Links.linksForProperty(p, Store, Matcher).length > 0;
    }
    return false;
  }

  function historyBlockHtml(p) {
    var hist = propertyHistory(p);
    if (!hist.length) return "";
    return (
      '<div class="immo-meta immo-when">Modifié le ' +
      esc(formatWhen(p.updated_at || p.created_at)) +
      ' · <button type="button" class="immo-hist-toggle" data-hist-prop="' +
      esc(p.id) +
      '">' +
      hist.length +
      " enreg. — afficher</button></div>" +
      '<ol class="immo-history-timeline immo-history-inline" hidden data-hist-list="' +
      esc(p.id) +
      '">' +
      hist
        .slice()
        .reverse()
        .map(function (h, i) {
          return (
            "<li><strong>" +
            esc(h.at || "") +
            "</strong> — " +
            esc(h.text || "") +
            (i === 0 ? " <em>(dernier)</em>" : "") +
            "</li>"
          );
        })
        .join("") +
      "</ol>" +
      '<div class="immo-meta"><a href="./crm-immo-property.html?id=' +
      encodeURIComponent(p.id) +
      '&tab=historique">Voir l’historique complet</a></div>'
    );
  }

  function applyProspectFilters(list) {
    var linkedOnly = document.getElementById("swLinkedOnly");
    var wantLinked = linkedOnly ? linkedOnly.dataset.on === "1" : linkedOnlyDefault;
    var out = list.slice();
    if (filterContactId && Links) {
      var fakeContact = { id: filterContactId };
      out = out.filter(function (p) {
        return Links.propertyTouchesContact(p, fakeContact, Store).hit;
      });
      return out;
    }
    if (wantLinked) {
      out = out.filter(propertyHasLinkedProspect);
    }
    return out;
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

  function renderList(skipHydrate) {
    var list = applyProspectFilters(Store.listProperties(queryFromForm()));
    var mount = document.getElementById("listMount");
    var countLabel = list.length + " bien(s)";
    if (filterContactId) countLabel += " liés au prospect";
    else if (document.getElementById("swLinkedOnly") && document.getElementById("swLinkedOnly").dataset.on === "1") {
      countLabel += " avec prospect lié";
    }
    document.getElementById("listCount").textContent = countLabel;
    fillCityList();
    var hint = document.getElementById("pigesHint");
    if (hint && filterContactId) {
      hint.innerHTML =
        "Filtre actif : piges liées au prospect <code>" +
        esc(filterContactId) +
        '</code>. <a href="./crm-immo-properties.html?linked_only=1">Voir toutes les piges avec prospect</a> · ' +
        '<a href="./crm-immo-properties.html?linked_only=0">Voir tout l’inventaire</a>.';
    }
    if (!list.length) {
      mount.innerHTML =
        '<p class="panel" style="color:var(--muted)">Aucune pige liée à un prospect — désactive « Liées à un prospect » ou crée / lie un bien.</p>';
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
        var unitCount = Array.isArray(p.units) ? p.units.length : 0;
        if (unitCount) tags.push(unitCount + " unité(s)");
        var src =
          (Matcher.LISTING_SOURCES.find(function (s) {
            return s.id === p.listing_source;
          }) || {}).label || p.listing_source;
        var whenBlock = propertyHistory(p).length
          ? historyBlockHtml(p)
          : formatWhen(p.updated_at || p.created_at)
            ? '<div class="immo-meta immo-when">Modifié le ' +
              esc(formatWhen(p.updated_at || p.created_at)) +
              " · 0 enreg.</div>"
            : "";
        return (
          '<article class="immo-card js-card-nav" data-id="' +
          esc(p.id) +
          '" data-card-href="./crm-immo-property.html?id=' +
          encodeURIComponent(p.id) +
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
          whenBlock +
          prospectBlockHtml(p) +
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
          '<a class="btn btn-ghost btn-sm" href="./crm-immo-property.html?id=' +
          encodeURIComponent(p.id) +
          '&tab=historique">Historique</a>' +
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
    mount.querySelectorAll(".immo-hist-toggle").forEach(function (btn) {
      btn.onclick = function (ev) {
        if (ev) {
          ev.preventDefault();
          ev.stopPropagation();
        }
        var pid = btn.getAttribute("data-hist-prop");
        var listEl = mount.querySelector('[data-hist-list="' + pid + '"]');
        if (!listEl) return;
        var open = listEl.hidden;
        listEl.hidden = !open;
        var n = propertyHistory(Store.getProperty(pid) || { id: pid }).length;
        if (!n) {
          var card = list.find(function (x) {
            return x.id === pid;
          });
          n = propertyHistory(card || {}).length;
        }
        btn.textContent = open ? n + " enreg. — masquer" : n + " enreg. — afficher";
      };
    });
    if (!skipHydrate) hydrateContactLabels(list);
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
    document.getElementById("pOwner").value = p.owner_contact_id || "";
    document.getElementById("pBuyer").value = p.buyer_contact_id || "";
    document.getElementById("pLead").value = p.lead_id || "";
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
      owner_contact_id: document.getElementById("pOwner").value.trim() || null,
      buyer_contact_id: document.getElementById("pBuyer").value.trim() || null,
      lead_id: document.getElementById("pLead").value.trim() || null,
      a_contacter: document.getElementById("pAContacter").checked,
      contact_connu: document.getElementById("pContactConnu").checked,
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

    if (act === "inventory") {
      exportInventory();
      return;
    }

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
      var rows = Store.listProperties(queryFromForm()).map(function (p) {
        return [
          p.title || "—",
          p.city || "",
          p.surface_m2 || "",
          p.rooms || "",
          euro(p.price_fai != null ? p.price_fai : p.price_net),
          p.phone || "",
        ];
      });
      if (window.PrintDocument) {
        window.PrintDocument.open({
          kind: "listing",
          title: "Listing de biens",
          subtitle: rows.length + " annonce(s) — document de présentation",
          bodyHtml: window.PrintDocument.tableHtml(
            ["Titre", "Ville", "m²", "Pièces", "Prix", "Tél."],
            rows
          ),
        });
      }
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
  bindUrlAutodetect(document.getElementById("pUrl"), document.getElementById("pSource"));
  var swLinked = document.getElementById("swLinkedOnly");
  if (swLinked) {
    var on = linkedOnlyDefault && pageParams.get("linked_only") !== "0";
    if (filterContactId) on = true;
    swLinked.dataset.on = on ? "1" : "0";
    swLinked.classList.toggle("on", on);
    swLinked.setAttribute("aria-pressed", on ? "true" : "false");
    swLinked.onclick = function () {
      var next = swLinked.dataset.on !== "1";
      switchOn(swLinked, next);
      if (!filterContactId) {
        var url = new URL(location.href);
        url.searchParams.set("linked_only", next ? "1" : "0");
        history.replaceState({}, "", url.toString());
      }
      renderList();
    };
  }
  Store.seedDemoIfEmpty();
  Store.syncFromApi().then(renderList).catch(renderList);
})();
