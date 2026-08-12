(function () {
  var Store = window.CrmImmoStore;
  var Matcher = window.CrmImmoMatcher;
  if (!Store || !Matcher) return;
  if (!localStorage.getItem("lo_token")) {
    location.href = "./crm.html";
    return;
  }

  var params = new URLSearchParams(location.search);
  var id = params.get("id");
  var prop = id ? Store.getProperty(id) : null;
  if (!prop) {
    document.getElementById("propTitle").textContent = "Bien introuvable";
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

  document.getElementById("propTitle").textContent = prop.title;
  document.getElementById("propSub").textContent =
    (prop.city || "") +
    " " +
    (prop.postal_code || "") +
    " · " +
    (prop.property_type || "") +
    " · " +
    (prop.listing_source || "");
  document.getElementById("propDesc").textContent = prop.description || prop.notes || "—";
  if (prop.listing_url) {
    var a = document.getElementById("linkAnnonce");
    a.href = prop.listing_url;
    a.hidden = false;
  }
  document.getElementById("docsLink").href = "./crm-immo-documents.html?property=" + encodeURIComponent(prop.id);

  document.getElementById("kpis").innerHTML = [
    ["Surface", prop.surface_m2 != null ? prop.surface_m2 + " m²" : "—"],
    ["Pièces", prop.rooms != null ? prop.rooms : "—"],
    ["Chambres", prop.bedrooms != null ? prop.bedrooms : "—"],
    ["FAI", euro(prop.price_fai)],
    ["Net vendeur", euro(prop.price_net)],
    ["Honoraires", euro(prop.honoraires)],
    ["DPE", prop.dpe || "—"],
    ["Statut", prop.status || "—"],
  ]
    .map(function (k) {
      return "<div><span>" + k[0] + "</span><strong>" + esc(k[1]) + "</strong></div>";
    })
    .join("");

  var roleSel = document.getElementById("partyRole");
  Matcher.PARTY_ROLES.forEach(function (r) {
    roleSel.innerHTML += '<option value="' + r.id + '">' + r.label + "</option>";
  });

  function renderParties() {
    var list = Store.listParties(prop.id);
    var mount = document.getElementById("partiesList");
    if (!list.length) {
      mount.innerHTML = '<p style="color:var(--muted)">Aucune personne liée pour l’instant.</p>';
      return;
    }
    mount.innerHTML = list
      .map(function (p) {
        var role = (Matcher.PARTY_ROLES.find(function (r) {
          return r.id === p.role;
        }) || {}).label || p.role;
        return (
          '<div class="party-row"><div><strong>' +
          esc(p.name || "—") +
          "</strong> · " +
          esc(role) +
          "<br><span style='color:var(--muted);font-size:.82rem'>" +
          esc(p.email || "") +
          " " +
          esc(p.phone || "") +
          (p.contact_id ? " · CRM " + esc(p.contact_id) : "") +
          "</span></div>" +
          '<button type="button" class="btn btn-ghost btn-sm" data-del="' +
          esc(p.id) +
          '">Retirer</button></div>'
        );
      })
      .join("");
    mount.querySelectorAll("[data-del]").forEach(function (btn) {
      btn.onclick = function () {
        Store.deleteParty(btn.getAttribute("data-del"));
        renderParties();
      };
    });
  }

  function renderDocs() {
    var docs = Store.listDocuments({ property_id: prop.id });
    var mount = document.getElementById("docsList");
    if (!docs.length) {
      mount.innerHTML = '<p style="color:var(--muted)">Pas encore de document.</p>';
      return;
    }
    mount.innerHTML = docs
      .map(function (d) {
        var t = (Matcher.DOC_TYPES.find(function (x) {
          return x.id === d.doc_type;
        }) || {}).label || d.doc_type;
        return (
          "<div class='party-row'><div><strong>" +
          esc(d.title) +
          "</strong><br><span style='color:var(--muted);font-size:.82rem'>" +
          esc(t) +
          " · " +
          esc(d.status) +
          "</span></div>" +
          '<a class="btn btn-ghost btn-sm" href="./crm-immo-documents.html?doc=' +
          encodeURIComponent(d.id) +
          '">Éditer</a></div>'
        );
      })
      .join("");
  }

  document.getElementById("partyForm").onsubmit = function (e) {
    e.preventDefault();
    Store.upsertParty({
      property_id: prop.id,
      role: document.getElementById("partyRole").value,
      name: document.getElementById("partyName").value.trim(),
      email: document.getElementById("partyEmail").value.trim(),
      phone: document.getElementById("partyPhone").value.trim(),
      contact_id: document.getElementById("partyContact").value.trim() || null,
      notes: document.getElementById("partyNotes").value.trim(),
    });
    document.getElementById("partyForm").reset();
    renderParties();
  };

  renderParties();
  renderDocs();
})();
