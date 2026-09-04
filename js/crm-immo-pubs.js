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
      floor: document.getElementById("adFloor").value.trim(),
      heating: document.getElementById("adHeating").value.trim(),
      dpe: document.getElementById("adDpe").value,
      ges: document.getElementById("adGes").value,
      charges: document.getElementById("adCharges").value,
      energy_cost: document.getElementById("adEnergyCost").value,
      year_built: document.getElementById("adYear").value,
      has_elevator: document.getElementById("adElevator").checked,
      has_parking: document.getElementById("adParking").checked,
      has_garage: document.getElementById("adGarage").checked,
      has_cave: document.getElementById("adCave").checked,
      has_balcony: document.getElementById("adBalcony").checked,
      has_terrace: document.getElementById("adTerrace").checked,
      has_garden: document.getElementById("adGarden").checked,
      furnished: document.getElementById("adFurnished").checked,
      photos: photoState.slice(),
      videos: videoState.slice(),
      virtual_tour: document.getElementById("adTour").value.trim(),
      platforms: document.getElementById("adPlatforms").value,
      demo_label: document.getElementById("adDemoLabel").value.trim(),
      listing_url: document.getElementById("adListingUrl").value.trim(),
      channel_public: document.getElementById("chPublic").checked,
      channel_private: document.getElementById("chPrivate").checked,
      access_emails: document.getElementById("adAccessEmails").value,
      access_phones: document.getElementById("adAccessPhones").value,
    };
  }

  function setImportStatus(text, ok) {
    var el = document.getElementById("adImportStatus");
    if (!el) return;
    el.textContent = text || "";
    el.style.color = ok ? "#166534" : "var(--muted)";
  }

  function syncOpenListingBtn() {
    var btn = document.getElementById("btnOpenListingUrl");
    var url = document.getElementById("adListingUrl").value.trim();
    if (!btn) return;
    if (url && /^https?:\/\//i.test(url)) {
      btn.hidden = false;
      btn.href = url;
    } else {
      btn.hidden = true;
      btn.removeAttribute("href");
    }
  }

  function setIfEmpty(id, value) {
    var el = document.getElementById(id);
    if (!el || value == null || value === "") return false;
    if (String(el.value || "").trim()) return false;
    el.value = value;
    return true;
  }

  function setCheckIfUnset(id, value) {
    var el = document.getElementById(id);
    if (!el || value == null) return false;
    if (el.checked) return false;
    if (value === true) {
      el.checked = true;
      return true;
    }
    return false;
  }

  function ensurePlatform(label) {
    var el = document.getElementById("adPlatforms");
    if (!el || !label) return;
    var parts = String(el.value || "")
      .split(/[,;\n]+/)
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
    var found = parts.some(function (p) {
      return p.toLowerCase() === String(label).toLowerCase();
    });
    if (!found) {
      parts.push(label);
      el.value = parts.join(", ");
    }
  }

  function applyListingPaste(parsed) {
    if (!parsed || !parsed.ok) {
      setImportStatus((parsed && parsed.hint) || "Aucune info détectée.", false);
      return;
    }
    var n = 0;
    if (parsed.listing_url) {
      document.getElementById("adListingUrl").value = parsed.listing_url;
      syncOpenListingBtn();
      n++;
    }
    if (parsed.title && setIfEmpty("adTitle", parsed.title)) n++;
    if (parsed.headline && setIfEmpty("adHeadline", parsed.headline)) n++;
    if (parsed.description && setIfEmpty("adDescription", parsed.description)) n++;
    if (parsed.property_type) {
      var typeEl = document.getElementById("adType");
      if (typeEl && (!typeEl.value || typeEl.value === "appartement" || !document.getElementById("adTitle").value)) {
        typeEl.value = parsed.property_type;
        n++;
      } else if (typeEl && !document.getElementById("adCity").value) {
        typeEl.value = parsed.property_type;
        n++;
      }
    }
    if (parsed.city && setIfEmpty("adCity", parsed.city)) n++;
    if (parsed.postal_code && setIfEmpty("adPostal", parsed.postal_code)) n++;
    if (parsed.price_fai != null && setIfEmpty("adPrice", parsed.price_fai)) n++;
    if (parsed.surface_m2 != null && setIfEmpty("adSurface", parsed.surface_m2)) n++;
    if (parsed.rooms != null && setIfEmpty("adRooms", parsed.rooms)) n++;
    if (parsed.bedrooms != null && setIfEmpty("adBedrooms", parsed.bedrooms)) n++;
    if (parsed.floor && setIfEmpty("adFloor", parsed.floor)) n++;
    if (parsed.heating && setIfEmpty("adHeating", parsed.heating)) n++;
    if (parsed.dpe && setIfEmpty("adDpe", parsed.dpe)) n++;
    if (parsed.ges && setIfEmpty("adGes", parsed.ges)) n++;
    if (parsed.charges != null && setIfEmpty("adCharges", parsed.charges)) n++;
    if (parsed.energy_cost != null && setIfEmpty("adEnergyCost", parsed.energy_cost)) n++;
    if (parsed.year_built != null && setIfEmpty("adYear", parsed.year_built)) n++;
    if (setCheckIfUnset("adElevator", parsed.has_elevator)) n++;
    if (setCheckIfUnset("adParking", parsed.has_parking)) n++;
    if (setCheckIfUnset("adGarage", parsed.has_garage)) n++;
    if (setCheckIfUnset("adCave", parsed.has_cave)) n++;
    if (setCheckIfUnset("adBalcony", parsed.has_balcony)) n++;
    if (setCheckIfUnset("adTerrace", parsed.has_terrace)) n++;
    if (setCheckIfUnset("adGarden", parsed.has_garden)) n++;
    if (setCheckIfUnset("adFurnished", parsed.furnished)) n++;
    if (parsed.portal_label) ensurePlatform(parsed.portal_label.indexOf("Leboncoin") === 0 ? "Leboncoin" : parsed.portal_label);
    (parsed.photo_urls || []).forEach(function (url) {
      if (photoState.length >= MAX_PHOTOS) return;
      var exists = photoState.some(function (p) {
        return p.url === url;
      });
      if (exists) return;
      photoState.push({ url: url, kind: "photo" });
      n++;
    });
    renderPhotoThumbs();
    setImportStatus(parsed.hint || n + " champ(s) préremplis.", true);
    msg(parsed.hint || "Infos reprises depuis l’annonce.", true);
  }

  function runListingImport() {
    var Paste = window.ImmoListingPaste;
    if (!Paste || !Paste.parseListingPaste) {
      setImportStatus("Module de reprise indisponible.", false);
      return;
    }
    var url = document.getElementById("adListingUrl").value.trim();
    var paste = document.getElementById("adListingPaste").value.trim();
    var blob = [url, paste].filter(Boolean).join("\n\n");
    if (!blob) {
      setImportStatus("Collez un lien Leboncoin et/ou le texte de l’annonce.", false);
      return;
    }
    applyListingPaste(Paste.parseListingPaste(blob));
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
        '<button type="button" class="btn btn-primary btn-sm" id="btnAdminPreviewBanner" data-token="' +
        esc(bag.ad.share_token) +
        '">Voir en admin (sans e-mail/tél)</button>';
      links +=
        '<a class="btn btn-ghost btn-sm" href="./immobilier/demo-pub-vendeur.html?token=' +
        encodeURIComponent(bag.ad.share_token) +
        '" target="_blank" rel="noopener">Lien vendeur (avec code)</a>';
      links +=
        '<button type="button" class="btn btn-ghost btn-sm" id="btnCopyDemoBanner" data-token="' +
        esc(bag.ad.share_token) +
        '">Copier le lien vendeur</button>';
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
    var adminBtn = document.getElementById("btnAdminPreviewBanner");
    if (adminBtn) {
      adminBtn.onclick = function () {
        openAdminPreview(adminBtn.getAttribute("data-token"));
      };
    }
    var copyBtn = document.getElementById("btnCopyDemoBanner");
    if (copyBtn) {
      copyBtn.onclick = function () {
        var url =
          location.origin +
          "/immobilier/demo-pub-vendeur.html?token=" +
          encodeURIComponent(copyBtn.getAttribute("data-token"));
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () {
            msg("Lien vendeur copié.", true);
          });
        }
      };
    }
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function openAdminPreview(shareToken) {
    if (!shareToken) return;
    msg("Ouverture prévisualisation admin…");
    fetch("/api/immo-ad-demo-access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + (localStorage.getItem("lo_token") || ""),
      },
      body: JSON.stringify({ action: "advisor_preview_grant", token: shareToken }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (data && data.ok && data.preview_url) {
          window.open(data.preview_url, "_blank", "noopener");
          msg("Prévisualisation admin ouverte (sans e-mail/tél).", true);
          return;
        }
        var fallback =
          "./immobilier/demo-pub-vendeur.html?token=" + encodeURIComponent(shareToken) + "&admin=1";
        window.open(fallback, "_blank", "noopener");
        msg((data && data.error) || "Ouverture en mode admin local.", true);
      })
      .catch(function () {
        window.open(
          "./immobilier/demo-pub-vendeur.html?token=" + encodeURIComponent(shareToken) + "&admin=1",
          "_blank",
          "noopener"
        );
      });
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
    var crit = ad.criteria || {};
    document.getElementById("adFloor").value = crit.floor || p.floor || "";
    document.getElementById("adHeating").value = crit.heating || "";
    document.getElementById("adDpe").value = crit.dpe || p.dpe || "";
    document.getElementById("adGes").value = crit.ges || p.ges || "";
    document.getElementById("adCharges").value = crit.charges != null ? crit.charges : "";
    document.getElementById("adEnergyCost").value =
      crit.energy_cost != null && crit.energy_cost !== ""
        ? crit.energy_cost
        : "";
    document.getElementById("adYear").value = crit.year_built != null ? crit.year_built : "";
    // Compléter depuis le questionnaire (sellDossier) si le formulaire pubs est encore vide
    if (AdLib.sellDossierToCriteria) {
      var sell = AdLib.sellDossierToCriteria(AdLib.getSellDossier(p));
      if (!document.getElementById("adRooms").value && sell.rooms != null) {
        document.getElementById("adRooms").value = sell.rooms;
      }
      if (!document.getElementById("adBedrooms").value && sell.bedrooms != null) {
        document.getElementById("adBedrooms").value = sell.bedrooms;
      }
      if (!document.getElementById("adFloor").value && sell.floor) {
        document.getElementById("adFloor").value = sell.floor;
      }
      if (!document.getElementById("adHeating").value && sell.heating) {
        document.getElementById("adHeating").value = sell.heating;
      }
      if (!document.getElementById("adDpe").value && sell.dpe) {
        document.getElementById("adDpe").value = sell.dpe;
      }
      if (!document.getElementById("adGes").value && sell.ges) {
        document.getElementById("adGes").value = sell.ges;
      }
      if (!document.getElementById("adCharges").value && sell.charges != null) {
        document.getElementById("adCharges").value = sell.charges;
      }
      if (!document.getElementById("adEnergyCost").value && sell.energy_cost != null) {
        document.getElementById("adEnergyCost").value = sell.energy_cost;
      }
      if (!document.getElementById("adYear").value && sell.year_built != null) {
        document.getElementById("adYear").value = sell.year_built;
      }
      if (!document.getElementById("adFurnished").checked && sell.furnished === true) {
        document.getElementById("adFurnished").checked = true;
      }
      if (!document.getElementById("adTour").value && sell.virtual_tour) {
        document.getElementById("adTour").value = sell.virtual_tour;
      }
    }
    document.getElementById("adElevator").checked = !!(crit.has_elevator || p.has_elevator);
    document.getElementById("adParking").checked = !!(crit.has_parking || p.has_parking);
    document.getElementById("adGarage").checked = !!(crit.has_garage || p.has_garage);
    document.getElementById("adCave").checked = !!(crit.has_cave || p.has_cave);
    document.getElementById("adBalcony").checked = !!(crit.has_balcony || p.has_balcony);
    document.getElementById("adTerrace").checked = !!(crit.has_terrace || p.has_terrace);
    document.getElementById("adGarden").checked = !!(crit.has_garden || p.has_garden);
    document.getElementById("adFurnished").checked = !!(crit.furnished);
    document.getElementById("adTour").value = ad.virtual_tour || "";
    document.getElementById("adListingUrl").value = ad.listing_url || p.listing_url || "";
    syncOpenListingBtn();
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
        '<button type="button" class="btn btn-primary btn-sm" id="btnAdminPreview" data-token="' +
        esc(bag.ad.share_token) +
        '">Voir en admin (sans e-mail/tél)</button>';
      html +=
        '<a class="btn btn-ghost btn-sm" href="./immobilier/demo-pub-vendeur.html?token=' +
        encodeURIComponent(bag.ad.share_token) +
        '" target="_blank" rel="noopener">Lien vendeur (avec code)</a>';
      html +=
        '<button type="button" class="btn btn-ghost btn-sm" id="btnCopyDemo" data-token="' +
        esc(bag.ad.share_token) +
        '">Copier le lien vendeur</button>';
    }
    box.innerHTML = html;
    var adminBtn = document.getElementById("btnAdminPreview");
    if (adminBtn) {
      adminBtn.onclick = function () {
        openAdminPreview(adminBtn.getAttribute("data-token"));
      };
    }
    var copyBtn = document.getElementById("btnCopyDemo");
    if (copyBtn) {
      copyBtn.onclick = function () {
        var url =
          location.origin +
          "/immobilier/demo-pub-vendeur.html?token=" +
          encodeURIComponent(copyBtn.getAttribute("data-token"));
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () {
            msg("Lien vendeur copié.", true);
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
    document.getElementById("adListingUrl").value = "";
    document.getElementById("adListingPaste").value = "";
    setImportStatus("");
    syncOpenListingBtn();
    document.getElementById("chPrivate").checked = true;
    document.getElementById("chPublic").checked = false;
    document.getElementById("adStatus").value = "mandat";
    msg("");
    listAds();
    document.getElementById("adTitle").focus();
  }

  paintCreateLink();
  document.getElementById("btnNewAd").onclick = resetForm;
  var btnImport = document.getElementById("btnImportListing");
  if (btnImport) btnImport.onclick = runListingImport;
  var listingUrlEl = document.getElementById("adListingUrl");
  if (listingUrlEl) {
    listingUrlEl.addEventListener("change", syncOpenListingBtn);
    listingUrlEl.addEventListener("input", syncOpenListingBtn);
    listingUrlEl.addEventListener("paste", function () {
      setTimeout(function () {
        syncOpenListingBtn();
        var Paste = window.ImmoListingPaste;
        var v = listingUrlEl.value.trim();
        if (Paste && v && !document.getElementById("adListingPaste").value.trim()) {
          var parsed = Paste.parseListingPaste(v);
          if (parsed.listing_url) {
            listingUrlEl.value = parsed.listing_url;
            syncOpenListingBtn();
            if (parsed.portal_label) ensurePlatform(parsed.portal_label.indexOf("Leboncoin") === 0 ? "Leboncoin" : parsed.portal_label);
            setImportStatus(parsed.hint, parsed.fields_filled.length > 1);
          }
        }
      }, 0);
    });
  }
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
