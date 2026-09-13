/**
 * CRM — sites partenaires
 * Brouillon local + publication API → /sites-partenaires/
 * Flag active = visible en public (choix site par site).
 */
(function () {
  var Lib = window.PartnerSites;
  if (!Lib) return;

  var token = localStorage.getItem("lo_token");
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  var catalog = Lib.normalizeCatalog({});
  var selectedId = "";
  var DATA = Lib.DATA_URL || "./data/partner-sites.json";
  var API = "/api/crm/partner-sites";
  var canPublish = false;

  var DEFAULT_CATEGORIES = [
    { id: "batiment", label: "Bâtiment & construction", order: 10, icon: "" },
    { id: "immobilier", label: "Immobilier", order: 20, icon: "" },
    { id: "services", label: "Services aux pros", order: 30, icon: "" },
    { id: "commerce", label: "Commerce & local", order: 40, icon: "" },
    { id: "assurance", label: "Assurance", order: 50, icon: "" },
    { id: "sante", label: "Santé", order: 60, icon: "" },
    { id: "formation", label: "Formation", order: 70, icon: "" },
    { id: "autre", label: "Autre", order: 90, icon: "" },
  ];

  var CATEGORY_ALIASES = { btp: "batiment" };

  function $(id) {
    return document.getElementById(id);
  }

  function authHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    };
  }

  function setMsg(text, ok) {
    var el = $("formMsg");
    if (!el) return;
    el.textContent = text || "";
    el.className = "ps-msg" + (ok === true ? " ok" : ok === false ? " err" : "");
  }

  function setPublishStatus(text) {
    var el = $("publishStatus");
    if (el) el.textContent = text || "";
  }

  function updatePublishButton() {
    var btn = $("btnPublishSites");
    if (btn) btn.disabled = !canPublish;
  }

  function countPublic() {
    return catalog.sites.filter(function (s) {
      return s.active;
    }).length;
  }

  function refreshCounts() {
    var el = $("publicCount");
    if (!el) return;
    var n = countPublic();
    var total = catalog.sites.length;
    el.textContent =
      total === 0
        ? "Aucun site pour l’instant."
        : n +
          " / " +
          total +
          " site" +
          (total > 1 ? "s" : "") +
          " seront visibles en public après publication.";
  }

  function refreshPublishSummary() {
    if (!canPublish) return;
    var n = countPublic();
    setPublishStatus(
      n === 0
        ? "Aucun site coché « Public » — la page publique sera vide après publication."
        : "Prêt : " +
            n +
            " site" +
            (n > 1 ? "s" : "") +
            " public" +
            (n > 1 ? "s" : "") +
            " seront envoyés sur leadsopportunities.fr."
    );
  }

  function ensureCategories(data) {
    catalog = Lib.normalizeCatalog(data);
    if (!catalog.categories.length) {
      catalog.categories = DEFAULT_CATEGORIES.slice();
      return;
    }
    var known = {};
    catalog.categories.forEach(function (c) {
      known[c.id] = true;
    });
    DEFAULT_CATEGORIES.forEach(function (c) {
      if (!known[c.id]) catalog.categories.push(c);
    });
    catalog.categories.sort(function (a, b) {
      return a.order - b.order;
    });
  }

  function fillCategories() {
    var sel = $("siteCategory");
    if (!sel) return;
    var current = sel.value;
    sel.innerHTML = catalog.categories
      .map(function (c) {
        return (
          '<option value="' + Lib.esc(c.id) + '">' + Lib.esc(c.label) + "</option>"
        );
      })
      .join("");
    if (
      current &&
      Array.prototype.some.call(sel.options, function (o) {
        return o.value === current;
      })
    ) {
      sel.value = current;
    }
  }

  function categoryLabel(id) {
    var found = catalog.categories.find(function (c) {
      return c.id === id;
    });
    return found ? found.label : id || "";
  }

  function persistLocal() {
    catalog = Lib.saveLocal(catalog);
    paintList();
  }

  function paintList() {
    var box = $("sitesList");
    if (!box) return;
    refreshCounts();
    var sites = catalog.sites.slice().sort(function (a, b) {
      return a.order - b.order;
    });
    if (!sites.length) {
      box.innerHTML =
        '<p class="lead" style="margin:0;">Aucun site — cliquez sur « Nouveau site ».</p>';
      return;
    }
    box.innerHTML = sites
      .map(function (s) {
        var meta = categoryLabel(s.category) + (s.city ? " · " + s.city : "");
        var badge = s.active
          ? '<span class="ps-badge ps-badge-on">Public</span>'
          : '<span class="ps-badge ps-badge-off">Privé</span>';
        return (
          '<article class="ps-item' +
          (s.id === selectedId ? " is-active" : "") +
          (s.active ? "" : " is-private") +
          '" data-id="' +
          Lib.esc(s.id) +
          '"><div class="ps-item-main"><div><h3>' +
          Lib.esc(s.name) +
          " " +
          badge +
          "</h3><p>" +
          Lib.esc(meta) +
          '</p></div><div class="ps-item-actions">' +
          '<label class="ps-public-toggle' +
          (s.active ? "" : " is-off") +
          '"><input type="checkbox" data-action="toggle-public" ' +
          (s.active ? "checked " : "") +
          "/> Public</label>" +
          '<button type="button" class="btn btn-ghost" data-action="edit">Modifier</button>' +
          '<button type="button" class="btn btn-ghost" data-action="delete">Supprimer</button>' +
          "</div></div></article>"
        );
      })
      .join("");

    box.querySelectorAll(".ps-item").forEach(function (item) {
      var id = item.getAttribute("data-id");
      var toggle = item.querySelector('[data-action="toggle-public"]');
      if (toggle) {
        toggle.addEventListener("click", function (e) {
          e.stopPropagation();
        });
        toggle.addEventListener("change", function (e) {
          e.stopPropagation();
          setSitePublic(id, !!toggle.checked);
        });
      }
      item.querySelector('[data-action="edit"]').onclick = function (e) {
        e.stopPropagation();
        selectSite(id);
      };
      item.querySelector('[data-action="delete"]').onclick = function (e) {
        e.stopPropagation();
        deleteSite(id);
      };
      item.addEventListener("click", function (e) {
        if (e.target.closest("button") || e.target.closest("label")) return;
        selectSite(id);
      });
    });
  }

  function setSitePublic(id, isPublic) {
    var site = catalog.sites.find(function (s) {
      return s.id === id;
    });
    if (!site) return;
    site.active = !!isPublic;
    persistLocal();
    if (selectedId === id && $("sitePublished")) {
      $("sitePublished").checked = !!isPublic;
    }
    refreshPublishSummary();
    setMsg(
      isPublic
        ? "Site marqué Public — publiez pour l’afficher en ligne."
        : "Site retiré du public — publiez pour mettre à jour la page.",
      true
    );
  }

  function setAllPublic(value) {
    catalog.sites.forEach(function (s) {
      s.active = !!value;
    });
    persistLocal();
    if (selectedId && $("sitePublished")) {
      var cur = catalog.sites.find(function (s) {
        return s.id === selectedId;
      });
      if (cur) $("sitePublished").checked = !!cur.active;
    }
    refreshPublishSummary();
    setMsg(value ? "Tous les sites sont Public." : "Aucun site n’est Public.", true);
  }

  function paintPreview() {
    var empty = $("previewEmpty");
    var img = $("previewImage");
    if (!empty || !img) return;
    var site = {
      url: ($("siteUrl") && $("siteUrl").value.trim()) || "",
      preview_image_url:
        ($("sitePreviewImage") && $("sitePreviewImage").value.trim()) || "",
    };
    var src = Lib.previewUrl(site, { allowAuto: true, width: 800 });
    if (!src) {
      img.hidden = true;
      img.removeAttribute("src");
      empty.hidden = false;
      empty.textContent = "Saisissez une URL pour générer l’aperçu.";
      return;
    }
    empty.hidden = true;
    img.hidden = false;
    img.alt = "Aperçu page d’accueil";
    img.onload = function () {
      empty.hidden = true;
      img.hidden = false;
    };
    img.onerror = function () {
      img.hidden = true;
      empty.hidden = false;
      empty.textContent =
        "Aperçu indisponible — vérifiez l’URL ou ajoutez une image.";
    };
    if (img.getAttribute("src") !== src) img.src = src;
  }

  function setOpenSiteLink(url) {
    var btn = $("btnOpenSite");
    if (!btn) return;
    if (url && Lib.isHttpUrl(url)) {
      btn.hidden = false;
      btn.onclick = function () {
        window.open(url, "_blank", "noopener,noreferrer");
      };
    } else {
      btn.hidden = true;
      btn.onclick = null;
    }
  }

  function blankSite(announce) {
    selectedId = "";
    $("formTitle").textContent = "Nouveau site";
    $("siteId").value = "";
    $("siteName").value = "";
    $("siteUrl").value = "";
    $("sitePreviewImage").value = "";
    $("siteSummary").value = "";
    $("siteCity").value = "";
    $("siteFeatured").checked = false;
    $("sitePublished").checked = true;
    var preferred =
      catalog.categories.find(function (c) {
        return c.id === "commerce";
      }) || catalog.categories[0];
    $("siteCategory").value = preferred ? preferred.id : "";
    setOpenSiteLink("");
    paintList();
    paintPreview();
    if (announce !== false) {
      $("siteName").focus();
      setMsg("Nouveau site — enregistrez, cochez Public, puis publiez.", true);
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
    $("formTitle").textContent = "Modifier le site";
    $("siteId").value = site.id;
    $("siteName").value = site.name;
    $("siteCategory").value = site.category;
    $("siteUrl").value = site.url;
    $("sitePreviewImage").value = site.preview_image_url || "";
    $("siteSummary").value = site.tagline || "";
    $("siteCity").value = site.city || "";
    $("sitePublished").checked = !!site.active;
    $("siteFeatured").checked = Number(site.order) > 0 && Number(site.order) < 50;
    setOpenSiteLink(site.url);
    paintList();
    paintPreview();
    setMsg("");
  }

  function deleteSite(id) {
    if (!id) return;
    if (!confirm("Supprimer ce site du brouillon ?")) return;
    catalog.sites = catalog.sites.filter(function (s) {
      return s.id !== id;
    });
    persistLocal();
    if (selectedId === id) blankSite(false);
    else paintList();
    refreshPublishSummary();
    setMsg("Supprimé du brouillon — republiez pour mettre à jour la page publique.", true);
  }

  function readForm() {
    var name = $("siteName").value.trim();
    var id =
      $("siteId").value.trim() || Lib.slugify(name) || "site-" + Date.now().toString(36);
    var category = $("siteCategory").value;
    if (CATEGORY_ALIASES[category]) category = CATEGORY_ALIASES[category];
    var featured = $("siteFeatured").checked;
    var existing = catalog.sites.find(function (s) {
      return s.id === id;
    });
    var order = existing ? existing.order : (catalog.sites.length + 1) * 10;
    if (featured) order = Math.min(order, 20);
    else if (order < 50 && existing && Number(existing.order) < 50) {
      order = (catalog.sites.length + 1) * 10;
    }
    return Lib.normalizeSite(
      {
        id: id,
        name: name,
        category: category,
        order: order,
        url: $("siteUrl").value.trim(),
        preview_image_url: $("sitePreviewImage").value.trim(),
        tagline: $("siteSummary").value.trim(),
        city: $("siteCity").value.trim(),
        active: $("sitePublished").checked,
        notes: existing ? existing.notes : "",
      },
      0
    );
  }

  function boot(data) {
    ensureCategories(data);
    fillCategories();
    paintList();
    if (catalog.sites[0]) selectSite(catalog.sites[0].id);
    else blankSite(false);
  }

  function loadFromServer() {
    return fetch(API, { headers: authHeaders(), cache: "no-store" })
      .then(function (r) {
        if (r.status === 401) {
          location.href = "./crm.html";
          throw new Error("auth");
        }
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        canPublish = data.canEdit !== false;
        updatePublishButton();
        if (!canPublish) {
          setPublishStatus("Lecture seule — seul un admin peut publier sur le site public.");
        } else {
          refreshPublishSummary();
        }
        return data.catalog || data;
      });
  }

  function publishToServer() {
    if (!canPublish) {
      setMsg("Droit admin requis pour publier.", false);
      return;
    }
    var n = countPublic();
    var confirmMsg =
      n === 0
        ? "Aucun site coché Public : la page /sites-partenaires/ sera vide. Continuer ?"
        : "Publier " +
          n +
          " site" +
          (n > 1 ? "s" : "") +
          " en public sur leadsopportunities.fr ?\\n(Les sites non cochés resteront invisibles.)";
    if (!confirm(confirmMsg)) return;

    var btn = $("btnPublishSites");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Publication…";
    }
    setMsg("Publication en cours…");
    fetch(API, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ catalog: Lib.normalizeCatalog(catalog) }),
    })
      .then(function (r) {
        return r.json().then(function (data) {
          return { ok: r.ok, status: r.status, data: data };
        });
      })
      .then(function (res) {
        if (!res.ok) {
          setMsg((res.data && res.data.error) || "Publication impossible.", false);
          return;
        }
        if (res.data.catalog) {
          ensureCategories(res.data.catalog);
          Lib.saveLocal(catalog);
          fillCategories();
          paintList();
        }
        setPublishStatus(
          "Publié ! " + countPublic() + " site(s) visible(s) sur /sites-partenaires/."
        );
        setMsg("Publié. Ouvrez « Page publique » pour vérifier.", true);
      })
      .catch(function () {
        setMsg("Erreur réseau pendant la publication.", false);
      })
      .finally(function () {
        if (btn) {
          btn.disabled = !canPublish;
          btn.textContent = "Publier sur le site";
        }
      });
  }

  $("siteForm").onsubmit = function (e) {
    e.preventDefault();
    var site = readForm();
    if (!site.name) {
      setMsg("Nom obligatoire.", false);
      return;
    }
    if (!site.url || !Lib.isHttpUrl(site.url)) {
      setMsg("URL publique obligatoire (https://…).", false);
      return;
    }
    var idx = catalog.sites.findIndex(function (s) {
      return s.id === site.id;
    });
    if (idx >= 0) catalog.sites[idx] = site;
    else catalog.sites.push(site);
    selectedId = site.id;
    persistLocal();
    selectSite(site.id);
    refreshPublishSummary();
    setMsg(
      site.active
        ? "Enregistré (Public). Cliquez sur « Publier sur le site » pour l’afficher en ligne."
        : "Enregistré (Privé). Il n’apparaîtra pas en public après publication.",
      true
    );
  };

  $("btnNewSite").onclick = function () {
    blankSite(true);
  };
  $("btnResetForm").onclick = function () {
    if (selectedId) selectSite(selectedId);
    else blankSite(false);
  };
  $("btnPublishSites").onclick = publishToServer;
  $("btnSelectAllPublic").onclick = function () {
    setAllPublic(true);
  };
  $("btnSelectNonePublic").onclick = function () {
    setAllPublic(false);
  };

  $("sitePublished").addEventListener("change", function () {
    if (!selectedId) return;
    setSitePublic(selectedId, $("sitePublished").checked);
  });

  $("btnReloadServer").onclick = function () {
    if (
      catalog.sites.length &&
      !confirm(
        "Recharger la version publiée depuis le serveur ? Le brouillon local sera remplacé."
      )
    ) {
      return;
    }
    Lib.clearLocal();
    loadFromServer()
      .then(function (cat) {
        boot(cat);
        Lib.saveLocal(catalog);
        setMsg("Catalogue serveur rechargé.", true);
      })
      .catch(function () {
        Lib.fetchCatalog({ preferLocal: false, dataUrl: DATA, skipApi: true }).then(
          function (data) {
            boot(data);
            setMsg("Serveur indisponible — fichier JSON rechargé.", false);
          }
        );
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
    setMsg("JSON téléchargé (sauvegarde optionnelle).", true);
  };

  $("importJsonFile").onchange = function () {
    var file = this.files && this.files[0];
    this.value = "";
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(String(reader.result || "{}"));
        boot(data);
        persistLocal();
        refreshPublishSummary();
        setMsg("Import JSON OK — cochez Public puis publiez.", true);
      } catch (err) {
        setMsg("Fichier JSON invalide.", false);
      }
    };
    reader.readAsText(file);
  };

  ["siteUrl", "sitePreviewImage"].forEach(function (id) {
    var el = $(id);
    if (!el) return;
    el.addEventListener("input", paintPreview);
    el.addEventListener("change", paintPreview);
    el.addEventListener("blur", paintPreview);
  });

  var local = Lib.loadLocal && Lib.loadLocal();
  if (local && local.sites && local.sites.length) {
    boot(local);
    loadFromServer()
      .then(function () {
        setMsg("Brouillon local chargé — cochez Public puis publiez.", true);
      })
      .catch(function () {
        canPublish = false;
        updatePublishButton();
        setPublishStatus(
          "Connexion serveur impossible. Vérifiez d’être connecté au CRM, puis réessayez."
        );
        setMsg("Brouillon local chargé (serveur indisponible).", false);
      });
  } else {
    loadFromServer()
      .then(function (cat) {
        boot(cat);
        Lib.saveLocal(catalog);
      })
      .catch(function () {
        Lib.fetchCatalog({ preferLocal: true, dataUrl: DATA }).then(function (data) {
          boot(data);
          canPublish = false;
          updatePublishButton();
          setPublishStatus("Serveur indisponible — mode brouillon local uniquement.");
        });
      });
  }
})();
