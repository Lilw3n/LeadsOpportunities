(function () {
  var Store = window.CrmImmoStore;
  var Matcher = window.CrmImmoMatcher;
  var Mandats = window.CrmImmoMandatFormes;
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

  var params = new URLSearchParams(location.search);
  var focusDoc = params.get("doc");
  var focusProp = params.get("property");

  var catalog = null;
  var uiState = {
    audience: "all",
    forme: "simple",
    type: "vente",
  };

  function fillProps() {
    var props = Store.listProperties({});
    ["filterProp", "dProp"].forEach(function (id) {
      var sel = document.getElementById(id);
      var keep = id === "filterProp" ? '<option value="">Tous</option>' : '<option value="">—</option>';
      sel.innerHTML =
        keep +
        props
          .map(function (p) {
            return '<option value="' + esc(p.id) + '">' + esc(p.title) + "</option>";
          })
          .join("");
    });
    if (focusProp) document.getElementById("filterProp").value = focusProp;
  }

  function fillTypes() {
    var sel = document.getElementById("dType");
    sel.innerHTML = Matcher.DOC_TYPES.map(function (t) {
      return '<option value="' + t.id + '">' + t.label + "</option>";
    }).join("");
  }

  function isMandatDocType(docType) {
    return String(docType || "").indexOf("mandat_") === 0;
  }

  function renderList() {
    var filter = document.getElementById("filterProp").value;
    var docs = Store.listDocuments(filter ? { property_id: filter } : {});
    var mount = document.getElementById("docsList");
    if (!docs.length) {
      mount.innerHTML = '<p style="color:var(--muted)">Aucun document.</p>';
      return;
    }
    mount.innerHTML = docs
      .map(function (d) {
        var t = (Matcher.DOC_TYPES.find(function (x) {
          return x.id === d.doc_type;
        }) || {}).label || d.doc_type;
        var forme = (d.data && d.data.forme_mandat) || "";
        return (
          '<div class="doc-row"><div><strong>' +
          esc(d.title) +
          "</strong><br><span style='color:var(--muted);font-size:.8rem'>" +
          esc(t) +
          (forme ? " · " + esc(forme) : "") +
          " · " +
          esc(d.status) +
          "</span></div>" +
          '<button type="button" class="btn btn-ghost btn-sm" data-id="' +
          esc(d.id) +
          '">Ouvrir</button></div>'
        );
      })
      .join("");
    mount.querySelectorAll("[data-id]").forEach(function (btn) {
      btn.onclick = function () {
        openDoc(btn.getAttribute("data-id"));
      };
    });
  }

  function openDoc(id) {
    var d = Store.listDocuments({}).find(function (x) {
      return x.id === id;
    });
    if (!d) return;
    document.getElementById("docForm").hidden = false;
    document.getElementById("dId").value = d.id;
    document.getElementById("dTitle").value = d.title || "";
    document.getElementById("dType").value = d.doc_type || "autre";
    document.getElementById("dStatus").value = d.status || "draft";
    document.getElementById("dProp").value = d.property_id || "";
    document.getElementById("dContact").value = d.contact_id || "";
    var data = d.data || {};
    document.getElementById("dBody").value = data.clauses || data.body || "";
    document.getElementById("dParties").value = JSON.stringify(data.parties || {}, null, 2);
    document.getElementById("dNotes").value = d.notes || "";
    var formeSel = document.getElementById("dForme");
    if (formeSel) formeSel.value = data.forme_mandat || "";
    if (isMandatDocType(d.doc_type) && Mandats && catalog) {
      var t = Mandats.findType(
        catalog,
        (Matcher.DOC_TYPES.find(function (x) {
          return x.id === d.doc_type;
        }) || {}).label || d.doc_type
      );
      if (data.forme_mandat) uiState.forme = Mandats.normalizeFormeKey(data.forme_mandat);
      if (t) uiState.type = t.id;
      paintComparatif();
    }
    preview(d);
  }

  function preview(d) {
    var data = d.data || {};
    var typeLabel = (Matcher.DOC_TYPES.find(function (x) {
      return x.id === d.doc_type;
    }) || {}).label || d.doc_type;
    var prop = d.property_id ? Store.getProperty(d.property_id) : null;
    var formeLine = data.forme_mandat
      ? "<p>Forme : <strong>" + esc(data.forme_mandat) + "</strong></p>"
      : "";
    document.getElementById("docPreview").innerHTML =
      "<h3 style='margin-top:0'>" +
      esc(typeLabel) +
      "</h3>" +
      "<p><strong>" +
      esc(d.title) +
      "</strong> · statut " +
      esc(d.status) +
      "</p>" +
      formeLine +
      (prop ? "<p>Bien : " + esc(prop.title) + " — " + esc(prop.city || "") + "</p>" : "") +
      "<pre style='white-space:pre-wrap;font-family:inherit'>" +
      esc(JSON.stringify(data.parties || {}, null, 2)) +
      "</pre>" +
      "<div style='margin-top:12px;white-space:pre-wrap'>" +
      esc(data.clauses || data.body || "") +
      "</div>";
  }

  function saveCurrentForm() {
    var parties = {};
    try {
      parties = JSON.parse(document.getElementById("dParties").value || "{}");
    } catch (err) {
      alert("JSON parties invalide");
      return null;
    }
    var formeVal = (document.getElementById("dForme") || {}).value || "";
    var item = Store.upsertDocument({
      id: document.getElementById("dId").value || undefined,
      title: document.getElementById("dTitle").value.trim(),
      doc_type: document.getElementById("dType").value,
      status: document.getElementById("dStatus").value,
      property_id: document.getElementById("dProp").value || null,
      contact_id: document.getElementById("dContact").value.trim() || null,
      notes: document.getElementById("dNotes").value,
      data: {
        parties: parties,
        clauses: document.getElementById("dBody").value,
        forme_mandat: formeVal || null,
      },
    });
    return item;
  }

  document.getElementById("docForm").onsubmit = function (e) {
    e.preventDefault();
    var item = saveCurrentForm();
    if (!item) return;
    renderList();
    openDoc(item.id);
  };

  document.getElementById("btnNewDoc").onclick = function () {
    var item = Store.upsertDocument({
      title: "Nouveau document",
      doc_type: "mandat_vente",
      status: "draft",
      property_id: document.getElementById("filterProp").value || null,
      data: { parties: {}, clauses: "", forme_mandat: null },
    });
    renderList();
    openDoc(item.id);
  };

  document.getElementById("btnDelDoc").onclick = function () {
    var id = document.getElementById("dId").value;
    if (!id || !confirm("Supprimer ce document ?")) return;
    Store.deleteDocument(id);
    document.getElementById("docForm").hidden = true;
    document.getElementById("docPreview").textContent = "Sélectionnez ou créez un document.";
    renderList();
  };

  function applyTemplateToForm(prop) {
    if (!Mandats || !catalog) return;
    var forme = Mandats.findForme(catalog, uiState.forme);
    var type = Mandats.findType(catalog, uiState.type);
    var clauses = Mandats.buildClauses({ forme: forme, type: type, property: prop });
    var title = Mandats.buildTitle(forme, type, prop);
    document.getElementById("dTitle").value = title;
    if (type && type.docType) document.getElementById("dType").value = type.docType;
    if (forme && forme.schemaValue) document.getElementById("dForme").value = forme.schemaValue;
    document.getElementById("dBody").value = clauses;
    if (prop && prop.id) document.getElementById("dProp").value = prop.id;
  }

  function createMandatDraft(fromProperty) {
    if (!Mandats || !catalog) return;
    var propId = document.getElementById("filterProp").value || "";
    var prop = fromProperty && propId ? Store.getProperty(propId) : null;
    if (fromProperty && !prop) {
      alert("Sélectionnez un bien dans le filtre pour préremplir.");
      return;
    }
    if (prop) {
      var extracted = Mandats.extractFromProperty(prop);
      if (extracted.forme) uiState.forme = Mandats.normalizeFormeKey(extracted.forme) || uiState.forme;
      if (extracted.type) uiState.type = Mandats.normalizeTypeKey(extracted.type) || uiState.type;
    }
    var forme = Mandats.findForme(catalog, uiState.forme);
    var type = Mandats.findType(catalog, uiState.type);
    var item = Store.upsertDocument({
      title: Mandats.buildTitle(forme, type, prop),
      doc_type: (type && type.docType) || "mandat_vente",
      status: "draft",
      property_id: prop ? prop.id : propId || null,
      data: {
        parties: {},
        clauses: Mandats.buildClauses({ forme: forme, type: type, property: prop }),
        forme_mandat: (forme && forme.schemaValue) || null,
        type_mandat: (type && type.label) || null,
        audience_tags: { general: true, agence: true },
      },
      notes: prop
        ? "Prérempli depuis la fiche bien (mandat)."
        : "Brouillon depuis le comparatif formes.",
    });
    renderList();
    openDoc(item.id);
    paintComparatif();
  }

  function paintComparatif() {
    var mount = document.getElementById("mandatComparatifMount");
    if (!mount || !Mandats || !catalog) return;
    Mandats.renderComparatif(mount, catalog, {
      audience: uiState.audience,
      selectedForme: uiState.forme,
      selectedType: uiState.type,
    });

    var aud = document.getElementById("mandatAudienceFilter");
    if (aud) {
      aud.onchange = function () {
        uiState.audience = aud.value;
        paintComparatif();
      };
    }
    mount.querySelectorAll("[data-forme]").forEach(function (btn) {
      btn.onclick = function () {
        uiState.forme = btn.getAttribute("data-forme");
        paintComparatif();
      };
    });
    mount.querySelectorAll("[data-type]").forEach(function (btn) {
      btn.onclick = function () {
        uiState.type = btn.getAttribute("data-type");
        paintComparatif();
      };
    });
    var btnDraft = document.getElementById("btnCreateMandatDraft");
    if (btnDraft) btnDraft.onclick = function () {
      createMandatDraft(false);
    };
    var btnPrefill = document.getElementById("btnPrefillFromProperty");
    if (btnPrefill) btnPrefill.onclick = function () {
      createMandatDraft(true);
    };
  }

  var btnApply = document.getElementById("btnApplyMandatTemplate");
  if (btnApply) {
    btnApply.onclick = function () {
      var propId = document.getElementById("dProp").value;
      var prop = propId ? Store.getProperty(propId) : null;
      var formeVal = document.getElementById("dForme").value;
      if (formeVal && Mandats) uiState.forme = Mandats.normalizeFormeKey(formeVal);
      var docType = document.getElementById("dType").value;
      if (Mandats && catalog) {
        var t = Mandats.findType(
          catalog,
          (Matcher.DOC_TYPES.find(function (x) {
            return x.id === docType;
          }) || {}).label || docType
        );
        if (t) uiState.type = t.id;
      }
      applyTemplateToForm(prop);
    };
  }

  document.getElementById("dProp").addEventListener("change", function () {
    var propId = document.getElementById("dProp").value;
    if (!propId || !Mandats) return;
    var prop = Store.getProperty(propId);
    if (!prop) return;
    var extracted = Mandats.extractFromProperty(prop);
    if (extracted.forme && !document.getElementById("dForme").value) {
      document.getElementById("dForme").value = extracted.forme;
      uiState.forme = Mandats.normalizeFormeKey(extracted.forme);
    }
    if (extracted.type && catalog) {
      var t = Mandats.findType(catalog, extracted.type);
      if (t && isMandatDocType(document.getElementById("dType").value || "mandat_vente")) {
        document.getElementById("dType").value = t.docType;
        uiState.type = t.id;
      }
    }
  });

  document.getElementById("filterProp").onchange = function () {
    renderList();
    var propId = document.getElementById("filterProp").value;
    if (propId && Mandats) {
      var prop = Store.getProperty(propId);
      if (prop) {
        var extracted = Mandats.extractFromProperty(prop);
        if (extracted.forme) uiState.forme = Mandats.normalizeFormeKey(extracted.forme) || uiState.forme;
        if (extracted.type) uiState.type = Mandats.normalizeTypeKey(extracted.type) || uiState.type;
        paintComparatif();
      }
    }
  };

  Store.seedDemoIfEmpty();
  fillTypes();
  fillProps();
  renderList();

  function bootComparatif() {
    if (!Mandats) return;
    Mandats.loadCatalog()
      .then(function (data) {
        catalog = data;
        if (focusProp) {
          var prop = Store.getProperty(focusProp);
          if (prop) {
            var extracted = Mandats.extractFromProperty(prop);
            if (extracted.forme) uiState.forme = Mandats.normalizeFormeKey(extracted.forme) || uiState.forme;
            if (extracted.type) uiState.type = Mandats.normalizeTypeKey(extracted.type) || uiState.type;
          }
        }
        paintComparatif();
      })
      .catch(function () {
        var mount = document.getElementById("mandatComparatifMount");
        if (mount) {
          mount.innerHTML =
            '<p style="color:var(--muted)">Comparatif mandats indisponible (catalogue JSON).</p>';
        }
      });
  }

  bootComparatif();
  if (focusDoc) openDoc(focusDoc);
})();
