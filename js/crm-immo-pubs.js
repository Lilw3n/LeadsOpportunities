(function () {
  var Store = window.CrmImmoStore;
  var AdLib = window.ImmoAdListings;
  if (!Store || !AdLib) return;
  if (!localStorage.getItem("lo_token")) {
    location.href = "./crm.html";
    return;
  }

  var currentId = "";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function linesToArr(text) {
    return String(text || "")
      .split(/\n+/)
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
  }

  function photosFromText(text) {
    return linesToArr(text).map(function (url) {
      return { url: url, kind: "photo" };
    });
  }

  function photosToText(photos) {
    if (!Array.isArray(photos)) return "";
    return photos
      .map(function (p) {
        return typeof p === "string" ? p : p && p.url;
      })
      .filter(Boolean)
      .join("\n");
  }

  function msg(text, ok) {
    var el = document.getElementById("adStatusMsg");
    if (!el) return;
    el.textContent = text || "";
    el.style.color = ok ? "#166534" : "var(--muted)";
  }

  function formValues() {
    return {
      title: document.getElementById("adTitle").value.trim(),
      headline: document.getElementById("adHeadline").value.trim(),
      description: document.getElementById("adDescription").value.trim(),
      body: document.getElementById("adDescription").value.trim(),
      property_type: document.getElementById("adType").value,
      status: document.getElementById("adStatus").value,
      city: document.getElementById("adCity").value.trim(),
      postal_code: document.getElementById("adPostal").value.trim(),
      price_fai: document.getElementById("adPrice").value,
      surface_m2: document.getElementById("adSurface").value,
      rooms: document.getElementById("adRooms").value,
      bedrooms: document.getElementById("adBedrooms").value,
      photos: photosFromText(document.getElementById("adPhotos").value),
      videos: linesToArr(document.getElementById("adVideos").value),
      virtual_tour: document.getElementById("adTour").value.trim(),
      platforms: document.getElementById("adPlatforms").value,
      demo_label: document.getElementById("adDemoLabel").value.trim(),
      channel_public: document.getElementById("chPublic").checked,
      channel_private: document.getElementById("chPrivate").checked,
    };
  }

  function fillForm(property) {
    var p = property || {};
    var bag = AdLib.getAdMeta(p);
    var ad = bag.ad || {};
    var channels = AdLib.channelsOf(ad);
    document.getElementById("adId").value = p.id || "";
    document.getElementById("adTitle").value = p.title || ad.headline || "";
    document.getElementById("adHeadline").value = ad.headline || "";
    document.getElementById("adDescription").value = ad.body || p.description || "";
    document.getElementById("adType").value = p.property_type || "appartement";
    document.getElementById("adStatus").value = p.status || "mandat";
    document.getElementById("adCity").value = p.city || "";
    document.getElementById("adPostal").value = p.postal_code || "";
    document.getElementById("adPrice").value = p.price_fai != null ? p.price_fai : p.price || "";
    document.getElementById("adSurface").value = p.surface_m2 || "";
    document.getElementById("adRooms").value = p.rooms || "";
    document.getElementById("adBedrooms").value = p.bedrooms || "";
    document.getElementById("adPhotos").value = photosToText(ad.photos && ad.photos.length ? ad.photos : p.photos_json || p.photos);
    document.getElementById("adVideos").value = (ad.videos || []).join("\n");
    document.getElementById("adTour").value = ad.virtual_tour || "";
    document.getElementById("adPlatforms").value = (ad.platforms || ["Meta", "Google", "Leboncoin"]).join(", ");
    document.getElementById("adDemoLabel").value = ad.demo_label || "Capacité de diffusion";
    document.getElementById("chPublic").checked = channels.indexOf("public") !== -1;
    document.getElementById("chPrivate").checked = channels.indexOf("private") !== -1 || (!property && true);
    document.getElementById("formTitle").textContent = p.id ? "Éditer l'annonce" : "Nouvelle annonce";
    document.getElementById("btnDeleteAd").hidden = !p.id;
    currentId = p.id || "";
    paintPreview(p);
  }

  function paintPreview(property) {
    var box = document.getElementById("previewLinks");
    if (!box) return;
    if (!property || !property.id) {
      box.innerHTML = "";
      return;
    }
    var bag = AdLib.getAdMeta(property);
    var channels = AdLib.channelsOf(bag.ad);
    var html = "";
    if (channels.indexOf("public") !== -1) {
      html +=
        '<a class="btn btn-ghost btn-sm" href="./immobilier/pubs-mandats.html?id=' +
        encodeURIComponent(property.id) +
        '" target="_blank" rel="noopener">Voir vitrine publique</a>';
    }
    if (channels.indexOf("private") !== -1 && bag.ad.share_token) {
      html +=
        '<a class="btn btn-primary btn-sm" href="./immobilier/demo-pub-vendeur.html?token=' +
        encodeURIComponent(bag.ad.share_token) +
        '" target="_blank" rel="noopener">Lien démo vendeur</a>';
      html +=
        '<button type="button" class="btn btn-ghost btn-sm" id="btnCopyDemo" data-token="' +
        esc(bag.ad.share_token) +
        '">Copier le lien démo</button>';
    }
    box.innerHTML = html;
    var copyBtn = document.getElementById("btnCopyDemo");
    if (copyBtn) {
      copyBtn.onclick = function () {
        var url =
          location.origin +
          "/immobilier/demo-pub-vendeur.html?token=" +
          encodeURIComponent(copyBtn.getAttribute("data-token"));
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () {
            msg("Lien démo copié.", true);
          });
        } else {
          msg(url, true);
        }
      };
    }
  }

  function listAds() {
    var props = Store.listProperties({}).filter(function (p) {
      return AdLib.isPublicMandateAd(p) || AdLib.isPrivateDemoAd(p);
    });
    var box = document.getElementById("adList");
    if (!props.length) {
      box.innerHTML = '<p class="pub-hint">Aucune annonce pub pour l’instant. Créez-en une à gauche.</p>';
      return;
    }
    box.innerHTML = props
      .map(function (p) {
        var bag = AdLib.getAdMeta(p);
        var channels = AdLib.channelsOf(bag.ad);
        var tags = "";
        if (channels.indexOf("public") !== -1) tags += '<span class="pub">Public mandat</span>';
        if (channels.indexOf("private") !== -1) tags += '<span class="priv">Démo privée</span>';
        return (
          '<article class="pub-item' +
          (p.id === currentId ? " is-active" : "") +
          '" data-id="' +
          esc(p.id) +
          '"><h3>' +
          esc(p.title || "Sans titre") +
          "</h3><p>" +
          esc(p.city || "") +
          (p.price_fai ? " · " + Number(p.price_fai).toLocaleString("fr-FR") + " €" : "") +
          '</p><div class="pub-tags">' +
          tags +
          "</div></article>"
        );
      })
      .join("");
    box.querySelectorAll("[data-id]").forEach(function (el) {
      el.onclick = function () {
        var p = Store.getProperty(el.getAttribute("data-id"));
        if (p) fillForm(p);
        listAds();
      };
    });
  }

  function resetForm() {
    fillForm(null);
    document.getElementById("chPrivate").checked = true;
    document.getElementById("chPublic").checked = false;
    document.getElementById("adStatus").value = "mandat";
    msg("");
    listAds();
  }

  document.getElementById("btnNewAd").onclick = resetForm;

  document.getElementById("adForm").onsubmit = function (e) {
    e.preventDefault();
    var form = formValues();
    if (!form.channel_public && !form.channel_private) {
      msg("Cochez au moins un canal : public ou privé.");
      return;
    }
    var existing = currentId ? Store.getProperty(currentId) : null;
    var base = existing ? Object.assign({}, existing) : { id: currentId || undefined };
    var next = AdLib.applyAdToProperty(base, form);
    if (currentId) next.id = currentId;
    var saved = Store.upsertProperty(next);
    currentId = saved.id;
    fillForm(saved);
    listAds();
    msg("Annonce enregistrée.", true);
  };

  document.getElementById("btnDeleteAd").onclick = function () {
    if (!currentId) return;
    if (!confirm("Supprimer ce bien / cette annonce ?")) return;
    Store.deleteProperty(currentId);
    resetForm();
    msg("Supprimé.", true);
  };

  Store.syncFromApi().then(function () {
    var params = new URLSearchParams(location.search);
    var id = params.get("id") || params.get("property");
    if (id) {
      var p = Store.getProperty(id);
      if (p) fillForm(p);
      else resetForm();
    } else {
      resetForm();
    }
    listAds();
  });
})();
