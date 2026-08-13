(function () {
  var Store = window.CrmImmoStore;
  var Matcher = window.CrmImmoMatcher;
  var PartiesUi = window.CrmImmoPartiesUi;
  if (!Store || !Matcher || !PartiesUi) return;
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
  var docParties = [];

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

  function renderDocParties() {
    var mount = document.getElementById("dPartiesMount");
    if (!mount) return;
    PartiesUi.mountSection(mount, {
      prefix: "docParty",
      side: "all",
      title: "Vendeurs, acquéreurs et autres parties",
      hint: "Liste libre pour mandats, compromis, offres… sans limite de personnes.",
      parties: docParties,
      onAdd: function (data) {
        docParties.push({
          id: Store.uid("party"),
          role: data.role,
          name: data.name.trim(),
          phone: data.phone.trim(),
          email: data.email.trim(),
          contact_id: data.contact_id.trim() || null,
        });
        renderDocParties();
      },
      onDelete: function (id) {
        docParties = docParties.filter(function (p) {
          return p.id !== id;
        });
        renderDocParties();
      },
    });
  }

  function importPartiesFromProperty() {
    var propId = document.getElementById("dProp").value;
    if (!propId) {
      alert("Choisis d'abord un bien lié.");
      return;
    }
    Store.migrateLegacyContactsToParties(propId);
    var imported = Store.listParties(propId).map(function (p) {
      return {
        id: Store.uid("party"),
        role: p.role,
        name: p.name,
        phone: p.phone,
        email: p.email,
        contact_id: p.contact_id,
      };
    });
    if (!imported.length) {
      alert("Aucune personne sur ce bien — ajoute-les dans la fiche (onglet Vendeurs & acquéreurs).");
      return;
    }
    docParties = imported;
    renderDocParties();
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
        return (
          '<div class="doc-row"><div><strong>' +
          esc(d.title) +
          "</strong><br><span style='color:var(--muted);font-size:.8rem'>" +
          esc(t) +
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
    docParties = Matcher.normalizeDocumentParties(data.parties).map(function (p) {
      return Object.assign({ id: Store.uid("party") }, p);
    });
    renderDocParties();
    document.getElementById("dNotes").value = d.notes || "";
    preview(d);
  }

  function preview(d) {
    var data = d.data || {};
    var typeLabel = (Matcher.DOC_TYPES.find(function (x) {
      return x.id === d.doc_type;
    }) || {}).label || d.doc_type;
    var prop = d.property_id ? Store.getProperty(d.property_id) : null;
    var partiesText = Matcher.documentPartiesToText(docParties.length ? docParties : data.parties);
    document.getElementById("docPreview").innerHTML =
      "<h3 style='margin-top:0'>" +
      esc(typeLabel) +
      "</h3>" +
      "<p><strong>" +
      esc(d.title) +
      "</strong> · statut " +
      esc(d.status) +
      "</p>" +
      (prop ? "<p>Bien : " + esc(prop.title) + " — " + esc(prop.city || "") + "</p>" : "") +
      "<pre style='white-space:pre-wrap;font-family:inherit'>" +
      esc(partiesText || "—") +
      "</pre>" +
      "<div style='margin-top:12px;white-space:pre-wrap'>" +
      esc(data.clauses || data.body || "") +
      "</div>";
  }

  document.getElementById("docForm").onsubmit = function (e) {
    e.preventDefault();
    var parties = docParties.map(function (p) {
      return {
        role: p.role,
        name: p.name,
        phone: p.phone,
        email: p.email,
        contact_id: p.contact_id,
      };
    });
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
      },
    });
    renderList();
    openDoc(item.id);
  };

  document.getElementById("btnNewDoc").onclick = function () {
    docParties = [];
    var item = Store.upsertDocument({
      title: "Nouveau document",
      doc_type: "mandat_vente",
      status: "draft",
      property_id: document.getElementById("filterProp").value || null,
      data: { parties: [], clauses: "" },
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

  document.getElementById("btnImportParties").onclick = importPartiesFromProperty;
  document.getElementById("filterProp").onchange = renderList;

  Store.seedDemoIfEmpty();
  fillTypes();
  fillProps();
  renderList();
  if (focusDoc) openDoc(focusDoc);
})();
