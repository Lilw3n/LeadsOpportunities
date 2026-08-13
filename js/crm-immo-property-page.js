(function () {
  var Store = window.CrmImmoStore;
  var Matcher = window.CrmImmoMatcher;
  var Schema = window.CrmImmoSchema;
  if (!Store || !Matcher || !Schema) return;
  if (!localStorage.getItem("lo_token")) {
    location.href = "./crm.html";
    return;
  }

  var params = new URLSearchParams(location.search);
  var id = params.get("id");
  var prop = id ? Store.getProperty(id) : null;
  if (!prop) {
    document.getElementById("propTitle").textContent = "Bien introuvable";
    document.getElementById("smartBanner").textContent = "Crée d’abord un bien depuis Piges.";
    return;
  }

  prop.details = prop.details || Schema.emptyDetails();
  prop.units = Array.isArray(prop.units) ? prop.units : [];
  prop.docs_checklist = prop.docs_checklist || {};
  prop.images = Array.isArray(prop.images) ? prop.images : [];
  prop.history = Array.isArray(prop.history) ? prop.history : [];

  var state = {
    tab: "description",
    sectionId: null,
    editingPartyId: null,
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function ensureSectionBucket(secId) {
    if (!prop.details[secId] || typeof prop.details[secId] !== "object") prop.details[secId] = {};
    return prop.details[secId];
  }

  function readMeta() {
    prop.title = document.getElementById("mTitle").value.trim() || prop.title;
    prop.property_type = document.getElementById("mType").value;
    prop.transaction = document.getElementById("mTransaction").value;
    prop.status = document.getElementById("mStatus").value;
    prop.listing_source = document.getElementById("mSource").value;
    prop.listing_url = document.getElementById("mUrl").value.trim();
  }

  function syncHeader() {
    document.getElementById("propTitle").textContent = prop.title || "Bien";
    var typeLabel = (Schema.TYPES.find(function (t) {
      return t.id === prop.property_type;
    }) || {}).label || prop.property_type;
    var txLabel = (Schema.TRANSACTIONS.find(function (t) {
      return t.id === prop.transaction;
    }) || {}).label || prop.transaction;
    document.getElementById("propSub").textContent =
      typeLabel +
      " · " +
      txLabel +
      " · " +
      Matcher.propertyStatusLabel(prop.status) +
      " · " +
      (prop.city || "") +
      " " +
      (prop.postal_code || "") +
      (prop.units.length ? " · " + prop.units.length + " unité(s)" : "");
    var a = document.getElementById("linkAnnonce");
    if (prop.listing_url) {
      a.href = prop.listing_url;
      a.hidden = false;
    } else a.hidden = true;
    var ag = document.getElementById("linkAgenda");
    if (ag) {
      ag.href =
        "./crm-event-create.html?propertyId=" +
        encodeURIComponent(prop.id) +
        "&title=" +
        encodeURIComponent((prop.title || "Bien") + " — RDV") +
        "&type=visite";
    }
    var fin = document.getElementById("linkFinancement");
    if (fin && window.FinanceDeepLink) {
      fin.href = window.FinanceDeepLink.baremesUrl({
        propertyPrice: prop.price_fai || prop.price_net || "",
        prixFai: prop.price_fai || "",
        prixNet: prop.price_net || "",
        priceMode: prop.price_fai ? "fai" : "net_vendeur",
        propertyId: prop.id,
        utmSource: "crm-immo-fiche",
      });
    } else if (fin) {
      var qs = new URLSearchParams();
      if (prop.price_fai) qs.set("prixFai", Math.round(prop.price_fai));
      if (prop.price_net) qs.set("prixNet", Math.round(prop.price_net));
      qs.set("priceMode", prop.price_fai ? "fai" : "net_vendeur");
      qs.set("propertyId", prop.id);
      fin.href = "./crm-agency-fees.html?" + qs.toString();
    }
  }

  function fillMeta() {
    var mType = document.getElementById("mType");
    var mTx = document.getElementById("mTransaction");
    var mSource = document.getElementById("mSource");
    var mStatus = document.getElementById("mStatus");
    mType.innerHTML = Schema.TYPES.map(function (t) {
      return '<option value="' + t.id + '">' + t.label + "</option>";
    }).join("");
    mTx.innerHTML = Schema.TRANSACTIONS.map(function (t) {
      return '<option value="' + t.id + '">' + t.label + "</option>";
    }).join("");
    mStatus.innerHTML = Matcher.PROPERTY_STATUSES.map(function (s) {
      return '<option value="' + s.id + '">' + s.label + "</option>";
    }).join("");
    mSource.innerHTML = Matcher.LISTING_SOURCES.map(function (t) {
      return '<option value="' + t.id + '">' + t.label + "</option>";
    }).join("");
    document.getElementById("mTitle").value = prop.title || "";
    mType.value = prop.property_type || "appartement";
    mTx.value = prop.transaction || "vente";
    prop.status = Matcher.normalizePropertyStatus(prop.status);
    mStatus.value = prop.status;
    mSource.value = prop.listing_source || "manual";
    document.getElementById("mUrl").value = prop.listing_url || "";
  }

  function smartText() {
    var ctx = Schema.contextFlags(prop);
    var bits = [];
    bits.push("Type actif : <strong>" + esc(ctx.type) + "</strong> · transaction <strong>" + esc(ctx.transaction) + "</strong>.");
    if (ctx.type === "complexe" || prop.units.length) {
      bits.push("Composition : " + prop.units.length + " unité(s) — utile pour terrain → maison → appartements loués.");
    }
    if (ctx.has_rented_unit) bits.push("Au moins une unité est louée → section Bail & pièces locatives activées.");
    if (ctx.type === "appartement") bits.push("Sections Copropriété / Carrez prioritaires.");
    if (ctx.type === "terrain" || ctx.type === "complexe") bits.push("Sections Terrain / urbanisme / viabilisation prioritaires.");
    if (ctx.type === "local") bits.push("Mode professionnel : surfaces utiles & bail commercial possibles.");
    if (ctx.transaction === "location") bits.push("Mode location : loyers / dépôt / bail mis en avant.");
    document.getElementById("smartBanner").innerHTML = bits.join(" ");
  }

  function renderTabs() {
    document.getElementById("topTabs").innerHTML = Schema.TABS.map(function (t) {
      return (
        '<button type="button" data-tab="' +
        t.id +
        '" class="' +
        (state.tab === t.id ? "active" : "") +
        '">' +
        esc(t.label) +
        "</button>"
      );
    }).join("");
    document.querySelectorAll("#topTabs [data-tab]").forEach(function (btn) {
      btn.onclick = function () {
        state.tab = btn.getAttribute("data-tab");
        renderAll();
      };
    });
  }

  function renderSide() {
    var sections = Schema.visibleSections(prop);
    if (!state.sectionId || !sections.some(function (s) { return s.id === state.sectionId; })) {
      state.sectionId = sections[0] ? sections[0].id : null;
    }
    document.getElementById("sideNav").innerHTML = sections
      .map(function (s) {
        return (
          '<button type="button" data-sec="' +
          s.id +
          '" class="' +
          (state.sectionId === s.id ? "active" : "") +
          '"><span>' +
          esc(s.label) +
          '</span><span class="chev">›</span></button>'
        );
      })
      .join("");
    document.querySelectorAll("#sideNav [data-sec]").forEach(function (btn) {
      btn.onclick = function () {
        if (state.sectionId === "composition") collectUnits();
        else if (state.sectionId === "pieces") collectDocs();
        else collectCurrentFields();
        state.sectionId = btn.getAttribute("data-sec");
        renderSection();
        renderSide();
      };
    });
  }

  function triHtml(fieldId, value) {
    var v = value || "any";
    return (
      '<div class="tri" data-field="' +
      esc(fieldId) +
      '">' +
      '<button type="button" data-v="yes" class="' +
      (v === "yes" ? "active-yes" : "") +
      '">✓</button>' +
      '<button type="button" data-v="any" class="' +
      (v === "any" ? "active-any" : "") +
      '">○</button>' +
      '<button type="button" data-v="no" class="' +
      (v === "no" ? "active-no" : "") +
      '">✕</button></div>'
    );
  }

  function fieldHtml(field, value) {
    var ctrl = "";
    if (field.type === "tri") ctrl = triHtml(field.id, value);
    else if (field.type === "select") {
      ctrl =
        '<select data-field="' +
        esc(field.id) +
        '">' +
        (field.options || [])
          .map(function (o) {
            var val = o == null ? "" : String(o);
            return (
              '<option value="' +
              esc(val) +
              '"' +
              (String(value || "") === val ? " selected" : "") +
              ">" +
              esc(val || "—") +
              "</option>"
            );
          })
          .join("") +
        "</select>";
    } else if (field.type === "textarea") {
      ctrl =
        '<textarea data-field="' +
        esc(field.id) +
        '" placeholder="Non renseigné">' +
        esc(value || "") +
        "</textarea>";
    } else {
      ctrl =
        '<input data-field="' +
        esc(field.id) +
        '" type="' +
        (field.type === "number" ? "number" : field.type === "date" ? "date" : "text") +
        '" value="' +
        esc(value || "") +
        '" placeholder="Non renseigné" />';
    }
    if (field.unit) ctrl += '<span class="field-unit">' + esc(field.unit) + "</span>";
    return (
      '<div class="field-row"><label class="' +
      (field.important ? "important" : "") +
      '">' +
      esc(field.label) +
      "</label><div class=\"field-ctrl\">" +
      ctrl +
      "</div></div>"
    );
  }

  function collectCurrentFields() {
    var body = document.getElementById("sectionBody");
    if (!body || !state.sectionId) return;
    if (state.sectionId === "composition" || state.sectionId === "pieces") return;
    var bucket = ensureSectionBucket(state.sectionId);
    body.querySelectorAll("[data-field]").forEach(function (el) {
      var fid = el.getAttribute("data-field");
      if (el.classList && el.classList.contains("tri")) return;
      bucket[fid] = el.value;
    });
    body.querySelectorAll(".tri[data-field]").forEach(function (group) {
      var fid = group.getAttribute("data-field");
      var active = group.querySelector(".active-yes, .active-no, .active-any");
      bucket[fid] = active ? active.getAttribute("data-v") : "any";
    });
  }

  function bindTri(root) {
    root.querySelectorAll(".tri").forEach(function (group) {
      group.querySelectorAll("button").forEach(function (btn) {
        btn.onclick = function () {
          group.querySelectorAll("button").forEach(function (b) {
            b.className = "";
          });
          var v = btn.getAttribute("data-v");
          btn.className = v === "yes" ? "active-yes" : v === "no" ? "active-no" : "active-any";
        };
      });
    });
  }

  function renderUnits() {
    var html =
      '<p class="dossier-hint">Ajoute les strates du bien : ex. 1 terrain → 1 maison → 2 appartements loués. Chaque unité peut avoir sa transaction.</p>';
    if (!prop.units.length) {
      html += '<p style="color:var(--muted)">Aucune unité — clique « Ajouter une unité ».</p>';
    }
    html += prop.units
      .map(function (u, idx) {
        return (
          '<div class="unit-card" data-unit="' +
          esc(u.id) +
          '"><h4>Unité #' +
          (idx + 1) +
          '</h4><div class="unit-grid">' +
          '<label>Type<select data-k="type">' +
          Schema.UNIT_TYPES.map(function (t) {
            return (
              '<option value="' +
              t.id +
              '"' +
              (u.type === t.id ? " selected" : "") +
              ">" +
              t.label +
              "</option>"
            );
          }).join("") +
          "</select></label>" +
          '<label>Libellé<input data-k="label" value="' +
          esc(u.label || "") +
          '" placeholder="Appt RDC / Maison principale…" /></label>' +
          '<label>Transaction<select data-k="transaction"><option value="vente"' +
          (u.transaction === "vente" ? " selected" : "") +
          '>Vente</option><option value="location"' +
          (u.transaction === "location" ? " selected" : "") +
          ">Location</option></select></label>" +
          '<label>Loué actuellement<input type="checkbox" data-k="loue"' +
          (u.loue ? " checked" : "") +
          " /></label>" +
          '<label>Surface m²<input data-k="surface_m2" type="number" value="' +
          esc(u.surface_m2 || "") +
          '" /></label>' +
          '<label>Pièces<input data-k="rooms" type="number" value="' +
          esc(u.rooms || "") +
          '" /></label>' +
          '<label>Chambres<input data-k="bedrooms" type="number" value="' +
          esc(u.bedrooms || "") +
          '" /></label>' +
          '<label>Prix / valeur €<input data-k="price" type="number" value="' +
          esc(u.price || "") +
          '" /></label>' +
          '<label>Loyer €<input data-k="loyer" type="number" value="' +
          esc(u.loyer || "") +
          '" /></label>' +
          '<label style="grid-column:1/-1">Notes<input data-k="notes" value="' +
          esc(u.notes || "") +
          '" /></label>' +
          '</div><div style="margin-top:8px"><button type="button" class="btn btn-ghost btn-sm" data-del-unit="' +
          esc(u.id) +
          '">Retirer</button></div></div>'
        );
      })
      .join("");
    html +=
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">' +
      '<button type="button" class="btn btn-primary btn-sm" id="btnAddUnit">+ Ajouter une unité</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" id="btnPresetComplex">Preset terrain + maison + 2 appts loués</button>' +
      "</div>";
    return html;
  }

  function collectUnits() {
    var cards = document.querySelectorAll(".unit-card[data-unit]");
    if (!cards.length && state.sectionId !== "composition") return;
    var next = [];
    cards.forEach(function (card) {
      var uid = card.getAttribute("data-unit");
      var prev = prop.units.find(function (u) {
        return u.id === uid;
      }) || { id: uid };
      var obj = Object.assign({}, prev);
      card.querySelectorAll("[data-k]").forEach(function (el) {
        var k = el.getAttribute("data-k");
        if (el.type === "checkbox") obj[k] = el.checked;
        else obj[k] = el.value;
      });
      next.push(obj);
    });
    if (cards.length) prop.units = next;
  }

  function renderDocs() {
    var html = '<p class="dossier-hint">Checklist intelligente : les groupes s’adaptent au type / vente-location / unités louées. Coche Requis / Reçu.</p>';
    Schema.DOC_GROUPS.forEach(function (group) {
      var items = group.items.filter(function (it) {
        return Schema.documentApplies(it, prop);
      });
      if (!items.length) return;
      html += '<div class="doc-group"><h4>' + esc(group.label) + "</h4>";
      html +=
        '<table class="doc-table"><thead><tr><th>Document</th><th>Requis</th><th>Reçu</th></tr></thead><tbody>';
      items.forEach(function (it) {
        var st = prop.docs_checklist[it.id] || {};
        var req = st.requis != null ? !!st.requis : Schema.suggestedRequired(it, prop);
        var rec = !!st.recu;
        html +=
          "<tr><td>" +
          esc(it.label) +
          '</td><td><input type="checkbox" data-doc="' +
          esc(it.id) +
          '" data-flag="requis"' +
          (req ? " checked" : "") +
          ' /></td><td><input type="checkbox" data-doc="' +
          esc(it.id) +
          '" data-flag="recu"' +
          (rec ? " checked" : "") +
          " /></td></tr>";
      });
      html += "</tbody></table></div>";
    });
    return html;
  }

  function collectDocs() {
    document.querySelectorAll("#sectionBody [data-doc]").forEach(function (el) {
      var did = el.getAttribute("data-doc");
      var flag = el.getAttribute("data-flag");
      if (!prop.docs_checklist[did]) prop.docs_checklist[did] = {};
      prop.docs_checklist[did][flag] = el.checked;
    });
  }

  function renderSection() {
    var sections = Schema.visibleSections(prop);
    var section = sections.find(function (s) {
      return s.id === state.sectionId;
    }) || sections[0];
    if (!section) return;
    state.sectionId = section.id;
    document.getElementById("sectionTitle").textContent = section.label;
    document.getElementById("sectionHint").textContent = section.hint || "";
    var body = document.getElementById("sectionBody");

    if (section.special === "units") {
      body.innerHTML = renderUnits();
      document.getElementById("btnAddUnit").onclick = function () {
        collectUnits();
        prop.units.push(Schema.emptyUnit(prop.property_type === "terrain" ? "terrain" : "appartement"));
        renderSection();
        smartText();
        renderSide();
      };
      document.getElementById("btnPresetComplex").onclick = function () {
        prop.property_type = "complexe";
        document.getElementById("mType").value = "complexe";
        prop.units = [
          Object.assign(Schema.emptyUnit("terrain"), { label: "Terrain / parcelle", transaction: "vente" }),
          Object.assign(Schema.emptyUnit("maison"), { label: "Maison principale", transaction: "vente" }),
          Object.assign(Schema.emptyUnit("appartement"), {
            label: "Appartement 1",
            transaction: "location",
            loue: true,
          }),
          Object.assign(Schema.emptyUnit("appartement"), {
            label: "Appartement 2",
            transaction: "location",
            loue: true,
          }),
        ];
        renderAll();
      };
      body.querySelectorAll("[data-del-unit]").forEach(function (btn) {
        btn.onclick = function () {
          collectUnits();
          var uid = btn.getAttribute("data-del-unit");
          prop.units = prop.units.filter(function (u) {
            return u.id !== uid;
          });
          renderSection();
          smartText();
          renderSide();
        };
      });
      return;
    }

    if (section.special === "documents") {
      body.innerHTML = renderDocs();
      return;
    }

    var bucket = ensureSectionBucket(section.id);
    var fields = Schema.visibleFields(section, prop);
    body.innerHTML = fields.map(function (field) {
      return fieldHtml(field, bucket[field.id]);
    }).join("");
    bindTri(body);
  }

  function ensureMediaDetails(p) {
    if (!p.details.medias) p.details.medias = {};
    return p.details.medias;
  }

  function renderImagesTab(panel, p) {
    var Cloud = window.CrmImmoCloud;
    panel.innerHTML =
      '<div class="immo-img-layout">' +
      '<aside class="immo-img-side">' +
      '<button type="button" class="immo-img-cat is-active" data-img-cat="public">Images (' +
      (p.images || []).length +
      ")</button>" +
      '<button type="button" class="immo-img-cat" data-img-cat="confidential">Images confidentielles</button>' +
      '<button type="button" class="immo-img-cat" data-img-cat="medias">Médias (liens)</button>' +
      "</aside>" +
      '<div class="immo-img-main" id="imgMain"></div></div>';

    var cat = "public";
    function paint() {
      var main = document.getElementById("imgMain");
      if (!main) return;
      document.querySelectorAll("[data-img-cat]").forEach(function (b) {
        b.classList.toggle("is-active", b.getAttribute("data-img-cat") === cat);
      });
      if (cat === "medias") {
        var m = ensureMediaDetails(p);
        main.innerHTML =
          "<h3>Médias & liens</h3><p class='immo-hint'>Visites virtuelles, vidéo, 360° — liens externes.</p>" +
          [
            ["visite_virtuelle", "Visite virtuelle"],
            ["visite_privee", "Visite virtuelle privée"],
            ["video_aerienne", "Vidéo aérienne"],
            ["url_360", "URL 360°"],
            ["plan_2d_3d", "URL plan 2D-3D"],
            ["lien_video", "Lien vidéo"],
            ["url_myphoto", "URL MyPhotoAgency"],
          ]
            .map(function (row) {
              return (
                '<label class="immo-field">' +
                esc(row[1]) +
                '<input class="crm-input" data-media-key="' +
                row[0] +
                '" value="' +
                esc(m[row[0]] || "") +
                '" placeholder="https://…" /></label>'
              );
            })
            .join("") +
          '<p class="immo-hint">Les fichiers photos / PDF passent par <strong>Immo cloud</strong> (Google Drive).</p>';
        main.querySelectorAll("[data-media-key]").forEach(function (inp) {
          inp.onchange = function () {
            ensureMediaDetails(p)[inp.getAttribute("data-media-key")] = inp.value.trim();
          };
        });
        return;
      }
      if (cat === "confidential") {
        main.innerHTML =
          "<h3>Images confidentielles</h3><p class='immo-hint'>Dossier Drive <strong>02_photos_confidentielles</strong> — non diffusées sur les portails.</p>" +
          '<button type="button" class="btn btn-primary" id="btnGoCloudConf">Ouvrir Immo cloud</button>';
        var go = document.getElementById("btnGoCloudConf");
        if (go) {
          go.onclick = function () {
            state.tab = "cloud";
            renderAll();
          };
        }
        return;
      }
      main.innerHTML =
        '<div class="immo-img-toolbar">' +
        '<label class="btn btn-primary btn-sm">Ajouter image(s)<input type="file" id="imgFiles" accept="image/*" multiple hidden /></label>' +
        '<button type="button" class="btn btn-ghost btn-sm" id="btnSyncDrive">Sync Drive → galerie</button>' +
        '<label class="immo-inline">URL<input id="imgUrl" class="crm-input" placeholder="https://…" /></label>' +
        '<button type="button" class="btn btn-ghost btn-sm" id="btnAddImgUrl">Ajouter URL</button>' +
        "</div>" +
        '<p class="immo-hint">Upload → Google Drive (photos publiques). Réordonnez avec ↑↓.</p>' +
        '<div id="imgList" class="immo-img-grid"></div>' +
        '<p id="imgStatus" class="immo-hint"></p>';

      function paintGrid() {
        var list = document.getElementById("imgList");
        if (!list) return;
        list.innerHTML =
          (p.images || [])
            .map(function (url, i) {
              var isLocal = String(url).indexOf("data:") === 0 || String(url).indexOf("local://") === 0;
              return (
                '<div class="immo-img-card" data-i="' +
                i +
                '">' +
                (isLocal && String(url).indexOf("data:") === 0
                  ? '<img src="' + esc(url) + '" alt="" />'
                  : isLocal
                    ? '<div class="immo-img-ph">Local</div>'
                    : '<img src="' + esc(url) + '" alt="" onerror="this.style.display=\'none\'" />') +
                '<div class="immo-img-actions">' +
                '<button type="button" class="btn btn-ghost btn-sm" data-up="' +
                i +
                '">↑</button>' +
                '<button type="button" class="btn btn-ghost btn-sm" data-dn="' +
                i +
                '">↓</button>' +
                '<button type="button" class="btn btn-ghost btn-sm" data-rm-img="' +
                i +
                '">Suppr.</button></div></div>'
              );
            })
            .join("") || "<p class='immo-hint'>Aucune image. Uploadez ou ajoutez une URL.</p>";
        list.querySelectorAll("[data-rm-img]").forEach(function (b) {
          b.onclick = function () {
            p.images.splice(Number(b.getAttribute("data-rm-img")), 1);
            paintGrid();
          };
        });
        list.querySelectorAll("[data-up]").forEach(function (b) {
          b.onclick = function () {
            var i = Number(b.getAttribute("data-up"));
            if (i < 1) return;
            var t = p.images[i - 1];
            p.images[i - 1] = p.images[i];
            p.images[i] = t;
            paintGrid();
          };
        });
        list.querySelectorAll("[data-dn]").forEach(function (b) {
          b.onclick = function () {
            var i = Number(b.getAttribute("data-dn"));
            if (i >= p.images.length - 1) return;
            var t = p.images[i + 1];
            p.images[i + 1] = p.images[i];
            p.images[i] = t;
            paintGrid();
          };
        });
      }

      document.getElementById("btnAddImgUrl").onclick = function () {
        var u = document.getElementById("imgUrl").value.trim();
        if (!u) return;
        p.images.push(u);
        document.getElementById("imgUrl").value = "";
        paintGrid();
      };

      document.getElementById("imgFiles").onchange = async function (ev) {
        var files = Array.from(ev.target.files || []);
        var st = document.getElementById("imgStatus");
        if (!files.length || !Cloud) return;
        st.textContent = "Upload Drive…";
        try {
          for (var fi = 0; fi < files.length; fi++) {
            var up = await Cloud.upload(p, files[fi], { hint: "photos" });
            var f = up.file || {};
            var link = f.url || f.webViewLink || f.thumbnailLink || "";
            if (link && p.images.indexOf(link) === -1) p.images.push(link);
          }
          st.textContent = files.length + " fichier(s) envoyé(s) / classés.";
          paintGrid();
        } catch (e) {
          st.textContent = "Erreur upload : " + (e.message || e);
        }
        ev.target.value = "";
      };

      document.getElementById("btnSyncDrive").onclick = async function () {
        var st = document.getElementById("imgStatus");
        if (!Cloud) return;
        st.textContent = "Sync…";
        try {
          var ensured = await Cloud.ensure(p);
          if (ensured.folderId) p.drive_folder_id = ensured.folderId;
          if (ensured.subfolderIds) p.drive_subfolders = ensured.subfolderIds;
          var listed = await Cloud.list(p, "01_photos_publiques");
          (listed.files || []).forEach(function (f) {
            var u = f.url || f.webViewLink || f.thumbnailLink;
            if (u && p.images.indexOf(u) === -1) p.images.push(u);
          });
          st.textContent =
            (listed.configured ? "Drive" : "Local") + " — " + (listed.files || []).length + " fichier(s) photos.";
          paintGrid();
        } catch (e) {
          st.textContent = "Sync : " + (e.message || e);
        }
      };

      paintGrid();
    }

    document.querySelectorAll("[data-img-cat]").forEach(function (b) {
      b.onclick = function () {
        cat = b.getAttribute("data-img-cat");
        paint();
      };
    });
    paint();
  }

  function renderCloudTab(panel, p) {
    var Cloud = window.CrmImmoCloud;
    if (!Cloud) {
      panel.innerHTML = "<p class='immo-hint'>Module cloud non chargé.</p>";
      return;
    }
    panel.innerHTML =
      '<div class="immo-cloud-head">' +
      "<div><h3>Immo cloud</h3><p class='immo-hint'>Drive intelligent par bien — classement auto (photos, diagnostics, mandat, docs). Google Drive (compte service) ou cache navigateur si non configuré.</p></div>" +
      '<div class="immo-cloud-actions">' +
      '<button type="button" class="btn btn-primary btn-sm" id="btnCloudEnsure">Ouvrir / créer dossier</button>' +
      '<label class="btn btn-ghost btn-sm">Uploader<input type="file" id="cloudFiles" multiple hidden /></label>' +
      '<a class="btn btn-ghost btn-sm" href="./crm-immo-documents.html?property=' +
      encodeURIComponent(p.id) +
      '">Éditeur documents</a>' +
      '<a class="btn btn-ghost btn-sm" href="./test-drive.html" target="_blank" rel="noopener">Statut Drive</a>' +
      "</div></div>" +
      '<div id="cloudFolders" class="immo-cloud-folders"></div>' +
      '<div id="cloudBrowser" class="immo-cloud-browser"></div>' +
      '<p id="cloudStatus" class="immo-hint"></p>';

    var currentFolder = null;

    function status(msg) {
      var el = document.getElementById("cloudStatus");
      if (el) el.textContent = msg || "";
    }

    function paintFolderNav(subfolders) {
      var nav = document.getElementById("cloudFolders");
      var list = subfolders || Cloud.DEFAULT_FOLDERS;
      nav.innerHTML = list
        .map(function (f) {
          var key = f.id;
          var label = f.label || f.id;
          return (
            '<button type="button" class="immo-cloud-folder-btn' +
            (currentFolder === key ? " is-active" : "") +
            '" data-folder="' +
            esc(key) +
            '">📁 ' +
            esc(label) +
            "</button>"
          );
        })
        .join("");
      nav.querySelectorAll("[data-folder]").forEach(function (btn) {
        btn.onclick = function () {
          currentFolder = btn.getAttribute("data-folder");
          browse(currentFolder);
        };
      });
    }

    async function browse(folderKey) {
      currentFolder = folderKey || null;
      paintFolderNav(p._cloudSubfolders || Cloud.DEFAULT_FOLDERS);
      status("Chargement…");
      try {
        var listed = await Cloud.list(p, folderKey || undefined);
        p._cloudSubfolders = listed.subfolders || Cloud.DEFAULT_FOLDERS;
        paintFolderNav(p._cloudSubfolders);
        var files = listed.files || [];
        var html =
          "<table class='immo-cloud-table'><thead><tr><th>Nom</th><th>Type</th><th>Source</th><th></th></tr></thead><tbody>";
        if (!files.length) {
          html +=
            "<tr><td colspan='4' class='immo-hint'>Dossier vide — uploadez des photos ou PDF. Classement automatique selon le nom (DPE → diagnostics, mandat → mandat, images → photos…).</td></tr>";
        }
        files.forEach(function (f) {
          var link = f.webViewLink || f.url
            ? "<a href='" + esc(f.webViewLink || f.url) + "' target='_blank' rel='noopener'>Ouvrir</a>"
            : "—";
          html +=
            "<tr><td>" +
            esc(f.name) +
            "</td><td>" +
            esc(f.mimeType || "") +
            "</td><td>" +
            esc(f.source || "") +
            "</td><td>" +
            link +
            "</td></tr>";
        });
        html += "</tbody></table>";
        document.getElementById("cloudBrowser").innerHTML = html;
        status(
          (listed.configured ? "Google Drive" : "Mode local") +
            (folderKey ? " · " + folderKey : " · racine / tous") +
            " — " +
            files.length +
            " fichier(s)"
        );
      } catch (e) {
        status("Erreur : " + (e.message || e));
      }
    }

    async function openRoot() {
      status("Connexion…");
      try {
        var ensured = await Cloud.ensure(p);
        if (ensured.folderId) p.drive_folder_id = ensured.folderId;
        if (ensured.subfolderIds) p.drive_subfolders = ensured.subfolderIds;
        p._cloudSubfolders = ensured.subfolders || Cloud.DEFAULT_FOLDERS;
        status(
          ensured.configured || ensured.ok
            ? ensured.simulated || !ensured.configured
              ? "Mode local — Drive Google non configuré (docs/DRIVE-SETUP.md). Classement intelligent actif."
              : "Google Drive prêt — dossier bien créé."
            : ensured.message || "OK"
        );
        await browse(null);
      } catch (e) {
        status("Erreur : " + (e.message || e));
      }
    }

    document.getElementById("btnCloudEnsure").onclick = openRoot;
    document.getElementById("cloudFiles").onchange = async function (ev) {
      var files = Array.from(ev.target.files || []);
      if (!files.length) return;
      status("Upload…");
      try {
        if (!p.drive_folder_id) {
          var ens = await Cloud.ensure(p);
          if (ens.folderId) p.drive_folder_id = ens.folderId;
          if (ens.subfolderIds) p.drive_subfolders = ens.subfolderIds;
        }
        for (var i = 0; i < files.length; i++) {
          var classified = Cloud.classify(files[i].name, files[i].type, false, "");
          var up = await Cloud.upload(p, files[i], {});
          status("Uploadé : " + files[i].name + " → " + (up.classifiedAs || classified));
          if ((files[i].type || "").indexOf("image/") === 0 && String(up.classifiedAs || "").indexOf("photos_publiques") !== -1) {
            var link = (up.file && (up.file.url || up.file.webViewLink)) || "";
            if (link && p.images.indexOf(link) === -1) p.images.push(link);
          }
        }
        await browse(currentFolder);
      } catch (e) {
        status("Erreur : " + (e.message || e));
      }
      ev.target.value = "";
    };

    openRoot();
  }

  function partyRoleLabel(roleId) {
    var role = Matcher.PARTY_ROLES.find(function (item) {
      return item.id === roleId;
    });
    return role ? role.label : roleId || "Personne liée";
  }

  function renderPartyGroup(title, parties) {
    if (!parties.length) return "";
    return (
      '<section class="party-group"><h4>' +
      esc(title) +
      " (" +
      parties.length +
      ")</h4>" +
      parties
        .map(function (party) {
          return (
            '<div class="party-row"><div><strong>' +
            esc(party.name || party.contact_id || "—") +
            "</strong> · " +
            esc(partyRoleLabel(party.role)) +
            "<br><span style='color:var(--muted)'>" +
            esc(party.phone || "") +
            (party.phone && party.email ? " · " : "") +
            esc(party.email || "") +
            (party.contact_id ? " · CRM " + esc(party.contact_id) : "") +
            "</span></div>" +
            '<div class="party-row-actions"><button type="button" class="btn btn-ghost btn-sm" data-edit-party="' +
            esc(party.id) +
            '">Modifier</button><button type="button" class="btn btn-ghost btn-sm" data-delete-party="' +
            esc(party.id) +
            '">Supprimer</button></div></div>'
          );
        })
        .join("") +
      "</section>"
    );
  }

  function renderOtherTab() {
    var panel = document.getElementById("otherPanel");
    if (state.tab === "vendeur") {
      var parties = Store.listParties(prop.id);
      var sellers = parties.filter(function (party) {
        return party.role === "vendeur" || party.role === "mandant";
      });
      var buyers = parties.filter(function (party) {
        return party.role === "acquereur" || party.role === "colocataire" || party.role === "coacquereur";
      });
      var others = parties.filter(function (party) {
        return sellers.indexOf(party) === -1 && buyers.indexOf(party) === -1;
      });
      var editing = parties.find(function (party) {
        return party.id === state.editingPartyId;
      });
      if (state.editingPartyId && !editing) state.editingPartyId = null;
      panel.innerHTML =
        "<h3>Vendeurs et acquéreurs</h3>" +
        '<p class="party-summary">Nombre illimité de personnes par bien — par exemple 8 héritiers vendeurs. ' +
        parties.length +
        " personne(s) enregistrée(s).</p>" +
        (parties.length
          ? renderPartyGroup("Vendeurs / propriétaires", sellers) +
            renderPartyGroup("Acquéreurs", buyers) +
            renderPartyGroup("Autres personnes liées", others)
          : "<p style='color:var(--muted)'>Aucune personne liée à ce bien.</p>") +
        '<form id="partyForm" class="party-form">' +
        '<label>Rôle<select id="partyRole">' +
        Matcher.PARTY_ROLES.map(function (r) {
          return (
            '<option value="' +
            r.id +
            '"' +
            (editing && editing.role === r.id ? " selected" : "") +
            ">" +
            r.label +
            "</option>"
          );
        }).join("") +
        '</select></label><label>Nom<input id="partyName" required value="' +
        esc((editing && editing.name) || "") +
        '" /></label><label>Tél<input id="partyPhone" value="' +
        esc((editing && editing.phone) || "") +
        '" /></label><label>Email<input id="partyEmail" type="email" value="' +
        esc((editing && editing.email) || "") +
        '" /></label><label>Contact CRM<input id="partyContact" value="' +
        esc((editing && editing.contact_id) || "") +
        '" /></label><button class="btn btn-primary" type="submit">' +
        (editing ? "Enregistrer" : "Ajouter une personne") +
        "</button>" +
        (editing
          ? '<button class="btn btn-ghost" id="cancelPartyEdit" type="button">Annuler</button>'
          : "") +
        "</form>";
      document.getElementById("partyForm").onsubmit = function (e) {
        e.preventDefault();
        Store.upsertParty({
          id: editing ? editing.id : undefined,
          property_id: prop.id,
          role: document.getElementById("partyRole").value,
          name: document.getElementById("partyName").value.trim(),
          phone: document.getElementById("partyPhone").value.trim(),
          email: document.getElementById("partyEmail").value.trim(),
          contact_id: document.getElementById("partyContact").value.trim() || null,
        });
        state.editingPartyId = null;
        renderOtherTab();
      };
      panel.querySelectorAll("[data-edit-party]").forEach(function (button) {
        button.onclick = function () {
          state.editingPartyId = button.getAttribute("data-edit-party");
          renderOtherTab();
          document.getElementById("partyName").focus();
        };
      });
      panel.querySelectorAll("[data-delete-party]").forEach(function (button) {
        button.onclick = function () {
          var partyId = button.getAttribute("data-delete-party");
          var party = parties.find(function (item) {
            return item.id === partyId;
          });
          if (!confirm("Supprimer " + ((party && party.name) || "cette personne") + " de ce bien ?")) return;
          Store.deleteParty(partyId);
          if (state.editingPartyId === partyId) state.editingPartyId = null;
          renderOtherTab();
        };
      });
      var cancelPartyEdit = document.getElementById("cancelPartyEdit");
      if (cancelPartyEdit) {
        cancelPartyEdit.onclick = function () {
          state.editingPartyId = null;
          renderOtherTab();
        };
      }
      return;
    }
    if (state.tab === "pieces_plan") {
      panel.innerHTML =
        "<h3>Pièces / plans</h3><p style='color:var(--muted)'>Découpage pièce par pièce (à enrichir). Pour l’instant, utilise Surfaces + Composition.</p>" +
        "<ul>" +
        prop.units
          .map(function (u) {
            return "<li><strong>" + esc(u.label || u.type) + "</strong> — " + esc(u.surface_m2 || "?") + " m² · " + esc(u.rooms || "?") + " p.</li>";
          })
          .join("") +
        "</ul>";
      return;
    }
    if (state.tab === "images") {
      renderImagesTab(panel, prop);
      return;
    }
    if (state.tab === "cloud") {
      renderCloudTab(panel, prop);
      return;
    }
    if (state.tab === "historique") {
      panel.innerHTML =
        "<h3>Historique</h3>" +
        (prop.history.length
          ? "<ul>" +
            prop.history
              .slice()
              .reverse()
              .map(function (h) {
                return "<li><strong>" + esc(h.at) + "</strong> — " + esc(h.text) + "</li>";
              })
              .join("") +
            "</ul>"
          : "<p style='color:var(--muted)'>Pas encore d’événements.</p>");
      return;
    }
    if (state.tab === "stats") {
      var filled = 0;
      var total = 0;
      Schema.visibleSections(prop).forEach(function (s) {
        if (!s.fields) return;
        Schema.visibleFields(s, prop).forEach(function (f) {
          total += 1;
          var v = prop.details[s.id] && prop.details[s.id][f.id];
          if (v && v !== "any" && v !== "") filled += 1;
        });
      });
      var docs = Object.keys(prop.docs_checklist || {});
      var recu = docs.filter(function (k) {
        return prop.docs_checklist[k] && prop.docs_checklist[k].recu;
      }).length;
      panel.innerHTML =
        "<h3>Statistiques fiche</h3><p>Complétude champs visibles : <strong>" +
        (total ? Math.round((filled / total) * 100) : 0) +
        " %</strong> (" +
        filled +
        "/" +
        total +
        ")</p><p>Unités : <strong>" +
        prop.units.length +
        "</strong></p><p>Pièces reçues cochées : <strong>" +
        recu +
        "</strong></p>";
      return;
    }
    panel.innerHTML = "<p>Onglet</p>";
  }

  function save() {
    readMeta();
    collectCurrentFields();
    collectUnits();
    if (state.sectionId === "pieces") collectDocs();
    // sync some top-level fields from localisation / finances for piges list
    var loc = prop.details.localisation || {};
    var fin = prop.details.finances || {};
    var surf = prop.details.surfaces || {};
    if (loc.ville) prop.city = loc.ville;
    if (loc.code_postal) prop.postal_code = loc.code_postal;
    if (loc.adresse) prop.address = loc.adresse;
    if (loc.departement) prop.department = loc.departement;
    if (fin.prix_net !== "" && fin.prix_net != null) prop.price_net = Number(fin.prix_net) || prop.price_net;
    if (fin.prix_fai !== "" && fin.prix_fai != null) prop.price_fai = Number(fin.prix_fai) || prop.price_fai;
    if (fin.honoraires !== "" && fin.honoraires != null) prop.honoraires = Number(fin.honoraires) || prop.honoraires;
    if (surf.surface_habitable !== "" && surf.surface_habitable != null) prop.surface_m2 = Number(surf.surface_habitable) || prop.surface_m2;
    if (surf.nb_pieces !== "" && surf.nb_pieces != null) prop.rooms = Number(surf.nb_pieces) || prop.rooms;
    if (surf.nb_chambres !== "" && surf.nb_chambres != null) prop.bedrooms = Number(surf.nb_chambres) || prop.bedrooms;
    var diag = prop.details.diagnostics || {};
    if (diag.conso_energie_primaire) prop.dpe = diag.conso_energie_primaire;
    if (diag.ges) prop.ges = diag.ges;
    var com = prop.details.commentaires || {};
    if (com.url_fiche) prop.listing_url = com.url_fiche;
    prop.history = prop.history || [];
    prop.history.push({ at: new Date().toLocaleString("fr-FR"), text: "Fiche enregistrée (" + (state.sectionId || state.tab) + ")" });
    Store.upsertProperty(prop);
    syncHeader();
    smartText();
    alert("Fiche enregistrée.");
  }

  function renderAll() {
    readMeta();
    syncHeader();
    smartText();
    renderTabs();
    var desc = document.getElementById("tabDescription");
    var other = document.getElementById("tabOther");
    if (state.tab === "description") {
      desc.hidden = false;
      other.hidden = true;
      renderSide();
      renderSection();
    } else {
      desc.hidden = true;
      other.hidden = false;
      renderOtherTab();
    }
  }

  ["mType", "mTransaction"].forEach(function (idEl) {
    document.getElementById(idEl).addEventListener("change", function () {
      readMeta();
      // re-pick first visible section if current hidden
      state.sectionId = null;
      renderAll();
    });
  });

  document.getElementById("btnSave").onclick = save;
  document.getElementById("btnSave2").onclick = save;

  fillMeta();
  // seed localisation from top-level if empty
  var loc = ensureSectionBucket("localisation");
  if (!loc.ville && prop.city) loc.ville = prop.city;
  if (!loc.code_postal && prop.postal_code) loc.code_postal = prop.postal_code;
  if (!loc.adresse && prop.address) loc.adresse = prop.address;
  var fin = ensureSectionBucket("finances");
  if ((fin.prix_net === "" || fin.prix_net == null) && prop.price_net != null) fin.prix_net = prop.price_net;
  if ((fin.prix_fai === "" || fin.prix_fai == null) && prop.price_fai != null) fin.prix_fai = prop.price_fai;
  var surf = ensureSectionBucket("surfaces");
  if ((surf.surface_habitable === "" || surf.surface_habitable == null) && prop.surface_m2 != null) surf.surface_habitable = prop.surface_m2;
  if ((surf.nb_pieces === "" || surf.nb_pieces == null) && prop.rooms != null) surf.nb_pieces = prop.rooms;
  var com = ensureSectionBucket("commentaires");
  if (!com.url_fiche && prop.listing_url) com.url_fiche = prop.listing_url;

  renderAll();
})();
