(function () {
  var Store = window.CrmImmoStore;
  var AdLib = window.ImmoAdListings;
  var Compress = window.ImmoPhotoCompress;
  if (!Store || !AdLib) return;
  if (!localStorage.getItem("lo_token")) {
    location.href = "./crm.html";
    return;
  }

  var MAX_PHOTOS = 12;
  var currentId = "";
  var highlightId = "";
  var photoState = [];
  var videoState = [];
  var Access = window.ImmoAdDemoAccess;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function msg(text, ok) {
    var el = document.getElementById("adStatusMsg");
    if (!el) return;
    el.textContent = text || "";
    el.style.color = ok ? "#166534" : "var(--muted)";
  }

  function syncHiddenMediaFields() {
    document.getElementById("adPhotos").value = photoState
      .map(function (p) {
        return p.url;
      })
      .join("\n");
    document.getElementById("adVideos").value = videoState.join("\n");
  }

  function renderPhotoThumbs() {
    var box = document.getElementById("adPhotoThumbs");
    if (!box) return;
    if (!photoState.length) {
      box.innerHTML = '<p class="pub-hint" style="margin:0">Aucune photo pour l’instant.</p>';
      syncHiddenMediaFields();
      return;
    }
    box.innerHTML = photoState
      .map(function (p, i) {
        return (
          '<div class="pub-thumb">' +
          '<img src="' +
          esc(p.url) +
          '" alt="Photo ' +
          (i + 1) +
          '" />' +
          '<span class="ord">' +
          (i + 1) +
          "</span>" +
          '<button type="button" data-rm-photo="' +
          i +
          '" aria-label="Retirer">×</button>' +
          "</div>"
        );
      })
      .join("");
    box.querySelectorAll("[data-rm-photo]").forEach(function (btn) {
      btn.onclick = function () {
        photoState.splice(Number(btn.getAttribute("data-rm-photo")), 1);
        renderPhotoThumbs();
      };
    });
    syncHiddenMediaFields();
  }

  function renderVideoList() {
    var box = document.getElementById("adVideoList");
    if (!box) return;
    if (!videoState.length) {
      box.innerHTML = "";
      syncHiddenMediaFields();
      return;
    }
    box.innerHTML = videoState
      .map(function (url, i) {
        return (
          "<li><a href=\"" +
          esc(url) +
          '" target="_blank" rel="noopener">' +
          esc(url) +
          '</a><button type="button" class="btn btn-ghost btn-sm" data-rm-video="' +
          i +
          '">Retirer</button></li>'
        );
      })
      .join("");
    box.querySelectorAll("[data-rm-video]").forEach(function (btn) {
      btn.onclick = function () {
        videoState.splice(Number(btn.getAttribute("data-rm-video")), 1);
        renderVideoList();
      };
    });
    syncHiddenMediaFields();
  }

  function addPhotoUrl() {
    var url = window.prompt("URL de la photo (https://…)");
    if (!url) return;
    url = String(url).trim();
    if (!AdLib.sanitizePhotos([{ url: url, kind: "photo" }]).length) {
      msg("URL photo refusée (https ou image compressée uniquement).");
      return;
    }
    if (photoState.length >= MAX_PHOTOS) {
      msg("Maximum " + MAX_PHOTOS + " photos.");
      return;
    }
    photoState.push({ url: url, kind: "photo" });
    renderPhotoThumbs();
  }

  function addVideoUrl(raw) {
    var url = String(raw || "").trim();
    if (!url) return;
    if (!AdLib.isSafeVideoUrl(url)) {
      msg("Lien vidéo non accepté (https YouTube / Vimeo / fichier…).");
      return;
    }
    if (videoState.indexOf(url) !== -1) return;
    if (videoState.length >= 6) {
      msg("Maximum 6 vidéos.");
      return;
    }
    videoState.push(url);
    renderVideoList();
    var inp = document.getElementById("adVideoInput");
    if (inp) inp.value = "";
  }

  function formValues() {
    syncHiddenMediaFields();
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
      photos: photoState.slice(),
      videos: videoState.slice(),
      virtual_tour: document.getElementById("adTour").value.trim(),
      platforms: document.getElementById("adPlatforms").value,
      demo_label: document.getElementById("adDemoLabel").value.trim(),
      channel_public: document.getElementById("chPublic").checked,
      channel_private: document.getElementById("chPrivate").checked,
      access_emails: document.getElementById("adAccessEmails").value,
      access_phones: document.getElementById("adAccessPhones").value,
    };
  }

  function createPageUrl() {
    return location.origin + "/crm-immo-pubs.html?new=1";
  }

  function paintCreateLink() {
    var el = document.getElementById("createLinkUrl");
    if (el) el.textContent = createPageUrl();
  }

  function showCreatedBanner(property) {
    var box = document.getElementById("createdBanner");
    if (!box || !property) return;
    var bag = AdLib.getAdMeta(property);
    var channels = AdLib.channelsOf(bag.ad);
    var acc = Access && Access.getAccess ? Access.getAccess(bag.ad) : { emails: [], phones: [] };
    var links = "";
    if (channels.indexOf("public") !== -1) {
      links +=
        '<a class="btn btn-primary btn-sm" href="./immobilier/pubs-mandats.html?id=' +
        encodeURIComponent(property.id) +
        '" target="_blank" rel="noopener">Voir la pub publique</a>';
    }
    if (channels.indexOf("private") !== -1 && bag.ad.share_token) {
      links +=
        '<a class="btn btn-primary btn-sm" href="./immobilier/demo-pub-vendeur.html?token=' +
        encodeURIComponent(bag.ad.share_token) +
        '" target="_blank" rel="noopener">Ouvrir la démo privée</a>';
      links +=
        '<button type="button" class="btn btn-ghost btn-sm" id="btnCopyDemoBanner" data-token="' +
        esc(bag.ad.share_token) +
        '">Copier le lien démo</button>';
    }
    var accessTxt = "";
    if (acc.emails.length) accessTxt += "E-mails : " + acc.emails.join(", ") + ". ";
    if (acc.phones.length) accessTxt += "Tél. : " + acc.phones.join(", ") + ".";
    if (!accessTxt && channels.indexOf("private") !== -1) {
      accessTxt = "Aucun e-mail/tél. lié : le lien token suffit (moins sécurisé).";
    }
    box.innerHTML =
      "<h3>Pub créée / mise à jour</h3><p><strong>" +
      esc(property.title || "Annonce") +
      "</strong> — " +
      esc(property.city || "") +
      (property.price_fai ? " · " + Number(property.price_fai).toLocaleString("fr-FR") + " €" : "") +
      "</p><p style=\"margin:6px 0 0;font-size:.86rem\">" +
      esc(accessTxt) +
      '</p><div class="links">' +
      links +
      "</div>";
    box.classList.add("is-visible");
    var copyBtn = document.getElementById("btnCopyDemoBanner");
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
        }
      };
    }
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function paintPhoneCodePanel(property) {
    var panel = document.getElementById("phoneCodePanel");
    if (!panel) return;
    var bag = property ? AdLib.getAdMeta(property) : { ad: {} };
    var acc = Access && Access.getAccess ? Access.getAccess(bag.ad) : { phones: [] };
    if (!property || !bag.ad.share_token || !acc.phones.length) {
      panel.hidden = true;
      panel.innerHTML = "";
      return;
    }
    panel.hidden = false;
    panel.innerHTML =
      "<p style=\"margin:0 0 8px\">Codes téléphone à transmettre au vendeur (valables ~10 min) :</p>" +
      acc.phones
        .map(function (ph) {
          return (
            '<div style="margin:6px 0;display:flex;flex-wrap:wrap;gap:8px;align-items:center">' +
            "<span>" +
            esc(ph) +
            '</span><button type="button" class="btn btn-ghost btn-sm" data-peek-phone="' +
            esc(ph) +
            '" data-token="' +
            esc(bag.ad.share_token) +
            '">Afficher le code</button><span data-code-for="' +
            esc(ph) +
            '"></span></div>'
          );
        })
        .join("");
    panel.querySelectorAll("[data-peek-phone]").forEach(function (btn) {
      btn.onclick = function () {
        var phone = btn.getAttribute("data-peek-phone");
        var token = btn.getAttribute("data-token");
        var out = panel.querySelector('[data-code-for="' + phone + '"]');
        fetch("/api/immo-ad-demo-access", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + (localStorage.getItem("lo_token") || ""),
          },
          body: JSON.stringify({ action: "advisor_phone_code", token: token, phone: phone }),
        })
          .then(function (r) {
            return r.json();
          })
          .then(function (data) {
            if (data && data.ok && data.code) {
              if (out) out.innerHTML = "Code : <strong>" + esc(data.code) + "</strong>";
            } else {
              if (out) out.textContent = (data && data.error) || "Impossible d’afficher le code";
            }
          })
          .catch(function () {
            if (out) out.textContent = "Erreur réseau";
          });
      };
    });
  }

  function fillForm(property) {
    var p = property || {};
    var bag = AdLib.getAdMeta(p);
    var ad = bag.ad || {};
    var channels = AdLib.channelsOf(ad);
    var acc = Access && Access.getAccess ? Access.getAccess(ad) : { emails: [], phones: [] };
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
    document.getElementById("adTour").value = ad.virtual_tour || "";
    document.getElementById("adPlatforms").value = (ad.platforms || ["Meta", "Google", "Leboncoin"]).join(", ");
    document.getElementById("adDemoLabel").value = ad.demo_label || "Capacité de diffusion";
    document.getElementById("adAccessEmails").value = (acc.emails || []).join("\n");
    document.getElementById("adAccessPhones").value = (acc.phones || []).join("\n");
    document.getElementById("chPublic").checked = channels.indexOf("public") !== -1;
    document.getElementById("chPrivate").checked = channels.indexOf("private") !== -1 || (!property && true);
    document.getElementById("formTitle").textContent = p.id ? "Éditer l'annonce" : "Nouvelle annonce";
    document.getElementById("btnDeleteAd").hidden = !p.id;
    currentId = p.id || "";

    var rawPhotos = ad.photos && ad.photos.length ? ad.photos : p.photos_json || p.photos || [];
    photoState = AdLib.sanitizePhotos(rawPhotos);
    videoState = Array.isArray(ad.videos) ? ad.videos.slice() : [];
    renderPhotoThumbs();
    renderVideoList();
    paintPreview(p);
    paintPhoneCodePanel(p.id ? p : null);
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
      box.innerHTML = '<p class="pub-hint">Aucune annonce pub pour l’instant. Utilisez le lien de création ci-dessus.</p>';
      return;
    }
    box.innerHTML = props
      .map(function (p) {
        var bag = AdLib.getAdMeta(p);
        var channels = AdLib.channelsOf(bag.ad);
        var acc = Access && Access.getAccess ? Access.getAccess(bag.ad) : { emails: [], phones: [] };
        var mediaBits = [];
        var photos = (bag.ad.photos && bag.ad.photos.length) || (p.photos_json && p.photos_json.length) || 0;
        if (photos) mediaBits.push(photos + " photo" + (photos > 1 ? "s" : ""));
        if (bag.ad.videos && bag.ad.videos.length) mediaBits.push(bag.ad.videos.length + " vidéo" + (bag.ad.videos.length > 1 ? "s" : ""));
        if (bag.ad.virtual_tour) mediaBits.push("visite 3D");
        if (acc.emails.length) mediaBits.push(acc.emails.length + " e-mail" + (acc.emails.length > 1 ? "s" : ""));
        if (acc.phones.length) mediaBits.push(acc.phones.length + " tél.");
        var tags = "";
        if (channels.indexOf("public") !== -1) tags += '<span class="pub">Public mandat</span>';
        if (channels.indexOf("private") !== -1) tags += '<span class="priv">Démo privée</span>';
        var hl = p.id === highlightId || p.id === currentId;
        return (
          '<article class="pub-item' +
          (p.id === currentId ? " is-active" : "") +
          (p.id === highlightId ? " is-highlight" : "") +
          '" data-id="' +
          esc(p.id) +
          '"><h3>' +
          esc(p.title || "Sans titre") +
          (p.id === highlightId ? " · créée" : "") +
          "</h3><p>" +
          esc(p.city || "") +
          (p.price_fai ? " · " + Number(p.price_fai).toLocaleString("fr-FR") + " €" : "") +
          (mediaBits.length ? " · " + mediaBits.join(", ") : "") +
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
    if (highlightId) {
      var card = box.querySelector('[data-id="' + highlightId + '"]');
      if (card) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function resetForm() {
    highlightId = "";
    var banner = document.getElementById("createdBanner");
    if (banner) {
      banner.classList.remove("is-visible");
      banner.innerHTML = "";
    }
    fillForm(null);
    photoState = [];
    videoState = [];
    renderPhotoThumbs();
    renderVideoList();
    document.getElementById("adAccessEmails").value = "";
    document.getElementById("adAccessPhones").value = "";
    document.getElementById("chPrivate").checked = true;
    document.getElementById("chPublic").checked = false;
    document.getElementById("adStatus").value = "mandat";
    msg("");
    listAds();
    document.getElementById("adTitle").focus();
  }

  paintCreateLink();
  document.getElementById("btnNewAd").onclick = resetForm;
  var copyCreate = document.getElementById("btnCopyCreateLink");
  if (copyCreate) {
    copyCreate.onclick = function () {
      var url = createPageUrl();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () {
          msg("Lien de création copié.", true);
        });
      } else {
        msg(url, true);
      }
    };
  }
  document.getElementById("btnAddPhotoUrl").onclick = addPhotoUrl;
  document.getElementById("btnAddVideo").onclick = function () {
    addVideoUrl(document.getElementById("adVideoInput").value);
  };
  document.getElementById("adVideoInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addVideoUrl(document.getElementById("adVideoInput").value);
    }
  });

  document.getElementById("adPhotoFiles").addEventListener("change", function () {
    var input = document.getElementById("adPhotoFiles");
    var files = Array.prototype.slice.call(input.files || []);
    var room = MAX_PHOTOS - photoState.length;
    if (!files.length) return;
    if (room <= 0) {
      msg("Maximum " + MAX_PHOTOS + " photos.");
      input.value = "";
      return;
    }
    msg("Compression des photos…");
    var work = Compress
      ? Compress.compressMany(files.slice(0, room))
      : Promise.all(
          files.slice(0, room).map(function (file) {
            return new Promise(function (resolve) {
              var reader = new FileReader();
              reader.onload = function () {
                resolve(reader.result);
              };
              reader.onerror = function () {
                resolve(null);
              };
              reader.readAsDataURL(file);
            });
          })
        );
    work.then(function (urls) {
      var added = 0;
      (urls || []).filter(Boolean).forEach(function (url) {
        if (photoState.length >= MAX_PHOTOS) return;
        photoState.push({ url: url, kind: "photo" });
        added++;
      });
      renderPhotoThumbs();
      input.value = "";
      msg(added ? added + " photo(s) ajoutée(s)." : "Aucune photo valide.", !!added);
    });
  });

  document.getElementById("adForm").onsubmit = function (e) {
    e.preventDefault();
    var form = formValues();
    if (!form.channel_public && !form.channel_private) {
      msg("Cochez au moins un canal : public ou privé.");
      return;
    }
    if (form.channel_private && !String(form.access_emails || "").trim() && !String(form.access_phones || "").trim()) {
      if (!confirm("Aucun e-mail ni téléphone lié : la démo sera accessible avec le seul lien. Continuer ?")) return;
    }
    var existing = currentId ? Store.getProperty(currentId) : null;
    var base = existing ? Object.assign({}, existing) : { id: currentId || undefined };
    var next = AdLib.applyAdToProperty(base, form);
    if (currentId) next.id = currentId;
    var saved = Store.upsertProperty(next);
    currentId = saved.id;
    highlightId = saved.id;
    fillForm(saved);
    listAds();
    showCreatedBanner(saved);
    msg("Pub enregistrée et mise en évidence à droite.", true);
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
    var isNew = params.get("new") === "1" || params.get("create") === "1";
    if (isNew) {
      resetForm();
    } else if (id) {
      var p = Store.getProperty(id);
      if (p) {
        highlightId = p.id;
        fillForm(p);
        showCreatedBanner(p);
      } else resetForm();
    } else {
      resetForm();
    }
    listAds();
  });
})();
