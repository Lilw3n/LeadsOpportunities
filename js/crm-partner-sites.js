/**
 * CRM — sites partenaires (localStorage + export JSON → data/partner-sites.json).
 */
(function () {
  var Lib = window.PartnerSites;
  if (!Lib) return;

  var catalog = Lib.normalizeCatalog({});
  var selectedId = "";
  var DATA = "./data/partner-sites.json";

  function $(id) {
    return document.getElementById(id);
  }

  function setMsg(text, ok) {
    var el = $("formMsg");
    if (!el) return;
    el.textContent = text || "";
    el.style.color = ok ? "#166534" : "#64748b";
  }

  function fillCategories() {
    var sel = $("siteCategory");
    if (!sel) return;
    sel.innerHTML = catalog.categories
      .map(function (c) {
        return (
          '<option value="' +
          Lib.esc(c.id) +
          '">' +
          (c.icon ? c.icon + " " : "") +
          Lib.esc(c.label) +
          "</option>"
        );
      })
      .join("");
  }

  function paintList() {
    var box = $("siteList");
    if (!box) return;
    var sites = catalog.sites.slice().sort(function (a, b) {
      return a.order - b.order;
    });
    if (!sites.length) {
      box.innerHTML = '<p class="ps-hint">Aucun site — cliquez sur « Nouveau site ».</p>';
      return;
    }
    var labels = {};
    catalog.categories.forEach(function (c) {
      labels[c.id] = c.label;
    });
    box.innerHTML = sites
      .map(function (s) {
        return (
          '<button type="button" class="ps-item' +
          (s.id === selectedId ? " is-active" : "") +
          '" data-id="' +
          Lib.esc(s.id) +
          '"><strong>' +
          Lib.esc(s.name) +
          (s.active ? "" : " (inactif)") +
          '</strong><span>' +
          Lib.esc(labels[s.category] || s.category) +
          (s.city ? " · " + Lib.esc(s.city) : "") +
          "</span></button>"
        );
      })
      .join("");
    box.querySelectorAll(".ps-item").forEach(function (btn) {
      btn.onclick = function () {
        selectSite(btn.getAttribute("data-id"));
      };
    });
  }

  function paintPreview() {
    var box = $("previewBox");
    if (!box) return;
    var site = {
      url: ($("siteUrl") && $("siteUrl").value.trim()) || "",
      preview_image_url: ($("sitePreview") && $("sitePreview").value.trim()) || "",
    };
    var src = Lib.previewUrl(site, { allowAuto: true, width: 800 });
    if (!src) {
      box.innerHTML = '<div class="partner-site-preview--empty">Renseignez une URL ou une photo</div>';
      return;
    }
    var img = document.createElement("img");
    img.alt = "Aperçu";
    img.loading = "lazy";
    img.src = src;
    img.onerror = function () {
      box.innerHTML = '<div class="partner-site-preview--empty">Aperçu indisponible</div>';
    };
    box.innerHTML = "";
    box.appendChild(img);
  }

  function blankSite(announce) {
    selectedId = "";
    $("siteId").value = "";
    $("siteName").value = "";
    $("siteUrl").value = "";
    $("sitePreview").value = "";
    $("siteTagline").value = "";
    $("siteCity").value = "";
    $("siteOrder").value = String((catalog.sites.length + 1) * 10);
    $("siteNotes").value = "";
    $("siteActive").checked = true;
    var bat = catalog.categories.find(function (c) {
      return c.id === "batiment";
    });
    $("siteCategory").value = bat ? "batiment" : (catalog.categories[0] && catalog.categories[0].id) || "";
    paintList();
    paintPreview();
    if (announce !== false) {
      $("siteName").focus();
      setMsg("Nouveau site — catégorie Bâtiment pré-sélectionnée.", true);
    }
  }

  function selectSite(id) {
    selectedId = id || "";
    var site = catalog.sites.find(function (s) {
      return s.id === selectedId;
    });
    if (!site) {
      blankSite(false);
      return;
    }
    $("siteId").value = site.id;
    $("siteName").value = site.name;
    $("siteCategory").value = site.category;
    $("siteOrder").value = site.order;
    $("siteUrl").value = site.url;
    $("sitePreview").value = site.preview_image_url;
    $("siteTagline").value = site.tagline;
    $("siteCity").value = site.city;
    $("siteActive").checked = !!site.active;
    $("siteNotes").value = site.notes;
    paintList();
    paintPreview();
    setMsg("");
  }

  function readForm() {
    var name = $("siteName").value.trim();
    var id = $("siteId").value.trim() || Lib.slugify(name) || "site-" + Date.now().toString(36);
    return Lib.normalizeSite(
      {
        id: id,
        name: name,
        category: $("siteCategory").value,
        order: $("siteOrder").value,
        url: $("siteUrl").value.trim(),
        preview_image_url: $("sitePreview").value.trim(),
        tagline: $("siteTagline").value.trim(),
        city: $("siteCity").value.trim(),
        active: $("siteActive").checked,
        notes: $("siteNotes").value.trim(),
      },
      0
    );
  }

  function persist() {
    catalog = Lib.saveLocal(catalog);
    paintList();
  }

  function boot(data) {
    catalog = Lib.normalizeCatalog(data);
    if (!catalog.categories.length) {
      catalog.categories = [
        { id: "batiment", label: "Bâtiment & construction", order: 10, icon: "🏗️" },
        { id: "immobilier", label: "Immobilier", order: 20, icon: "🏠" },
        { id: "services", label: "Services aux pros", order: 30, icon: "🛠️" },
        { id: "commerce", label: "Commerce & local", order: 40, icon: "🏪" },
      ];
    }
    fillCategories();
    paintList();
    if (catalog.sites[0]) selectSite(catalog.sites[0].id);
    else blankSite(false);
  }

  $("siteForm").onsubmit = function (e) {
    e.preventDefault();
    var site = readForm();
    if (!site.name) {
      setMsg("Nom obligatoire.");
      return;
    }
    var idx = catalog.sites.findIndex(function (s) {
      return s.id === site.id;
    });
    if (idx >= 0) catalog.sites[idx] = site;
    else catalog.sites.push(site);
    selectedId = site.id;
    persist();
    setMsg("Enregistré localement. Exportez le JSON pour la mise en ligne.", true);
    paintPreview();
  };

  $("btnNewSite").onclick = function () {
    blankSite(true);
  };
  $("btnDeleteSite").onclick = function () {
    if (!selectedId) return;
    if (!confirm("Supprimer ce site ?")) return;
    catalog.sites = catalog.sites.filter(function (s) {
      return s.id !== selectedId;
    });
    persist();
    blankSite(false);
    setMsg("Supprimé.", true);
  };
  $("btnReloadJson").onclick = function () {
    Lib.clearLocal();
    Lib.fetchCatalog({ preferLocal: false, dataUrl: DATA }).then(function (data) {
      boot(data);
      setMsg("Fichier JSON rechargé.", true);
    });
  };
  $("btnExportJson").onclick = function () {
    var blob = new Blob([JSON.stringify(Lib.normalizeCatalog(catalog), null, 2)], {
      type: "application/json",
    });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "partner-sites.json";
    a.click();
    URL.revokeObjectURL(a.href);
    setMsg("JSON téléchargé — remplacez data/partner-sites.json puis déployez.", true);
  };
  $("btnResetLocal").onclick = function () {
    if (!confirm("Effacer les modifications locales ?")) return;
    Lib.clearLocal();
    Lib.fetchCatalog({ preferLocal: false, dataUrl: DATA }).then(function (data) {
      boot(data);
      setMsg("Overlay local effacé.", true);
    });
  };

  ["siteUrl", "sitePreview"].forEach(function (id) {
    var el = $(id);
    if (!el) return;
    el.addEventListener("change", paintPreview);
    el.addEventListener("blur", paintPreview);
  });

  Lib.fetchCatalog({ preferLocal: true, dataUrl: DATA }).then(boot);
})();
