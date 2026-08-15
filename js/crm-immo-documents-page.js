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

  var params = new URLSearchParams(location.search);
  var focusDoc = params.get("doc");
  var focusProp = params.get("property");
  var currentDoc = null;

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
    document.getElementById("dParties").value = JSON.stringify(data.parties || {}, null, 2);
    document.getElementById("dNotes").value = d.notes || "";
    currentDoc = d;
    preview(d);
  }

  function preview(d) {
    var data = d.data || {};
    var typeLabel = (Matcher.DOC_TYPES.find(function (x) {
      return x.id === d.doc_type;
    }) || {}).label || d.doc_type;
    var prop = d.property_id ? Store.getProperty(d.property_id) : null;
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
      esc(JSON.stringify(data.parties || {}, null, 2)) +
      "</pre>" +
      "<div style='margin-top:12px;white-space:pre-wrap'>" +
      esc(data.clauses || data.body || "") +
      "</div>";
  }

  document.getElementById("docForm").onsubmit = function (e) {
    e.preventDefault();
    var parties = {};
    try {
      parties = JSON.parse(document.getElementById("dParties").value || "{}");
    } catch (err) {
      alert("JSON parties invalide");
      return;
    }
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
    var item = Store.upsertDocument({
      title: "Nouveau document",
      doc_type: "mandat_vente",
      status: "draft",
      property_id: document.getElementById("filterProp").value || null,
      data: { parties: {}, clauses: "" },
    });
    renderList();
    openDoc(item.id);
  };

  var btnPrintDoc = document.getElementById("btnPrintDoc");
  if (btnPrintDoc) {
    btnPrintDoc.onclick = function () {
      if (!currentDoc) {
        alert("Ouvrez un document d’abord.");
        return;
      }
      var typeLabel =
        (Matcher.DOC_TYPES.find(function (x) {
          return x.id === currentDoc.doc_type;
        }) || {}).label || currentDoc.doc_type;
      var prop = currentDoc.property_id ? Store.getProperty(currentDoc.property_id) : null;
      if (window.PrintDocument) {
        window.PrintDocument.fromImmoDoc(currentDoc, prop, { kindLabel: typeLabel });
      }
    };
  }

  document.getElementById("btnDelDoc").onclick = function () {
    var id = document.getElementById("dId").value;
    if (!id || !confirm("Supprimer ce document ?")) return;
    Store.deleteDocument(id);
    document.getElementById("docForm").hidden = true;
    currentDoc = null;
    document.getElementById("docPreview").textContent = "Sélectionnez ou créez un document.";
    renderList();
  };

  document.getElementById("filterProp").onchange = renderList;

  Store.seedDemoIfEmpty();
  fillTypes();
  fillProps();
  renderList();
  if (focusDoc) openDoc(focusDoc);
})();
