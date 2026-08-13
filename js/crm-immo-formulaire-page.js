(function () {
  var TOKEN_KEY = "lo_token";
  var params = new URLSearchParams(location.search);
  var formType = params.get("type");
  var propertyId = params.get("property") || "";
  var token = localStorage.getItem(TOKEN_KEY);

  if (!token || !formType) {
    location.href = "./crm-immo-formulaires.html";
    return;
  }

  var Store = window.CrmImmoStore;
  var draftKey = "immo_form_draft_" + formType + "_" + (propertyId || "solo");

  if (propertyId) {
    var pl = document.getElementById("propertyLink");
    pl.href = "./crm-immo-property.html?id=" + encodeURIComponent(propertyId);
    pl.hidden = false;
  }

  document.getElementById("backLink").href =
    "./crm-immo-formulaires.html" + (propertyId ? "?property=" + encodeURIComponent(propertyId) : "");

  document.getElementById("btnPrint").onclick = function () {
    var frame = document.getElementById("docFrame");
    if (frame && frame.contentWindow) frame.contentWindow.print();
    else window.print();
  };

  document.getElementById("btnClear").onclick = function () {
    if (!confirm("Effacer toutes les saisies enregistrées pour ce formulaire ?")) return;
    localStorage.removeItem(draftKey);
    location.reload();
  };

  function formatEur(n) {
    var v = Number(n);
    if (!isFinite(v)) return "";
    return v.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €";
  }

  function sectionDetails(prop, sectionId) {
    var details = prop.details || {};
    var bucket = details[sectionId];
    return bucket && typeof bucket === "object" ? bucket : {};
  }

  function buildLocalPrefill(prop) {
    if (!prop) return {};
    var mandat = sectionDetails(prop, "mandat");
    var estimation = sectionDetails(prop, "estimation");
    var identite = sectionDetails(prop, "identite");
    var localisation = sectionDetails(prop, "localisation");
    var description = sectionDetails(prop, "description");
    var addr =
      prop.address ||
      [localisation.adresse, localisation.complement_adresse].filter(Boolean).join(", ");
    var ville = [prop.postal_code, prop.city].filter(Boolean).join(" ");
    return {
      reference_bien: prop.id || "",
      titre_bien: prop.title || "",
      type_bien: prop.property_type || "",
      adresse: addr,
      ville: ville,
      surface: prop.surface_m2 != null ? String(prop.surface_m2) : description.surface_habitable || "",
      pieces: prop.rooms != null ? String(prop.rooms) : "",
      chambres: prop.bedrooms != null ? String(prop.bedrooms) : "",
      etage: prop.floor || description.etage || "",
      dpe: prop.dpe || description.dpe || "",
      ges: prop.ges || description.ges || "",
      prix_net: prop.price_net != null ? formatEur(prop.price_net) : "",
      prix_fai: prop.price_fai != null ? formatEur(prop.price_fai) : "",
      honoraires: prop.honoraires != null ? formatEur(prop.honoraires) : mandat.honoraires || "",
      description: prop.description || description.descriptif || "",
      n_mandat: mandat.n_mandat || "",
      date_mandat: mandat.date_mandat || "",
      forme_mandat: mandat.forme_mandat || "",
      duree_mandat: mandat.duree_mandat || "3",
      valeur_estimee: estimation.prix_final_ponderation || estimation.valeur_terrain || "",
      commentaire_estimation: estimation.valoris_details || "",
      vendeur_nom: identite.nom_proprietaire || identite.nom || "",
      vendeur_prenom: identite.prenom_proprietaire || identite.prenom || "",
      vendeur_email: identite.email_proprietaire || "",
      vendeur_tel: identite.tel_proprietaire || identite.telephone || "",
      vendeur_adresse: identite.adresse_proprietaire || "",
    };
  }

  function applyValues(doc, values, onlyEmpty) {
    if (!doc || !values) return;
    Object.keys(values).forEach(function (name) {
      var val = values[name];
      if (val == null || val === "") return;
      var nodes = doc.querySelectorAll('[name="' + name + '"]');
      nodes.forEach(function (el) {
        if (el.type === "checkbox") {
          if (!onlyEmpty) el.checked = !!val;
          return;
        }
        if (onlyEmpty && el.value && String(el.value).trim()) return;
        el.value = val;
      });
    });
  }

  function collectDraft(doc) {
    var data = {};
    if (!doc) return data;
    doc.querySelectorAll("input[name], textarea[name]").forEach(function (el) {
      if (!el.name) return;
      if (el.type === "checkbox") data[el.name] = el.checked;
      else data[el.name] = el.value;
    });
    return data;
  }

  function bindDraftSave(doc) {
    if (!doc) return;
    var saveTimer;
    function scheduleSave() {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () {
        try {
          localStorage.setItem(draftKey, JSON.stringify(collectDraft(doc)));
        } catch (e) {}
      }, 400);
    }
    doc.addEventListener("input", scheduleSave);
    doc.addEventListener("change", scheduleSave);
  }

  function setupFrame(frame) {
    var doc = frame.contentDocument;
    if (!doc) return;

    var localProp = propertyId && Store ? Store.getProperty(propertyId) : null;
    if (localProp) applyValues(doc, buildLocalPrefill(localProp), true);

    try {
      var saved = JSON.parse(localStorage.getItem(draftKey) || "{}");
      applyValues(doc, saved, false);
    } catch (e) {}

    bindDraftSave(doc);
  }

  var apiUrl =
    "/api/crm/immo-document?type=" +
    encodeURIComponent(formType) +
    "&format=html" +
    (propertyId ? "&propertyId=" + encodeURIComponent(propertyId) : "");

  fetch(apiUrl, { headers: { Authorization: "Bearer " + token } })
    .then(function (r) {
      if (!r.ok) throw new Error("Erreur " + r.status);
      return r.text();
    })
    .then(function (html) {
      document.getElementById("docStatus").hidden = true;
      var wrap = document.getElementById("docFrameWrap");
      wrap.hidden = false;
      var frame = document.getElementById("docFrame");
      frame.onload = function () {
        setupFrame(frame);
      };
      frame.srcdoc = html;
    })
    .catch(function (e) {
      document.getElementById("docStatus").textContent =
        "Impossible de charger le formulaire : " + String(e);
    });
})();
