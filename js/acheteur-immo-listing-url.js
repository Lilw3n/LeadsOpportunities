/**
 * Capture publique d'URL d'annonces (Leboncoin, SeLoger, ParuVendu…).
 * Photos + description + capture d'écran fournies par l'utilisateur (pas de scraping).
 */
(function () {
  var Portals = window.ImmoListingPortals;
  var Lib = window.ImmoPublicListings;
  if (!Portals) return;

  var MAX_PHOTOS = 4;
  var Compress = window.ImmoPhotoCompress;

  function compressFile(file) {
    if (Compress && Compress.compressFile) return Compress.compressFile(file);
    var MAX_DIM = 1200;
    var MAX_DATA = 240000;
    return new Promise(function (resolve) {
      if (!file || !file.type || file.type.indexOf("image/") !== 0) {
        resolve(null);
        return;
      }
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var w = img.naturalWidth || 1;
        var h = img.naturalHeight || 1;
        var scale = Math.min(1, MAX_DIM / Math.max(w, h));
        var cw = Math.max(1, Math.round(w * scale));
        var ch = Math.max(1, Math.round(h * scale));
        var canvas = document.createElement("canvas");
        canvas.width = cw;
        canvas.height = ch;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, cw, ch);
        var q = 0.72;
        var data = canvas.toDataURL("image/jpeg", q);
        while (data.length > MAX_DATA && q > 0.38) {
          q -= 0.08;
          data = canvas.toDataURL("image/jpeg", q);
        }
        URL.revokeObjectURL(url);
        resolve(data.length <= 280000 ? data : null);
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  }

  function qs(root, sel) {
    return (root || document).querySelector(sel);
  }

  function val(root, name) {
    var el = root.querySelector("[name='" + name + "']");
    return el ? String(el.value || "").trim() : "";
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function mediaList(state) {
    var list = state.photos.slice();
    if (state.capture) list.push(state.capture);
    return list;
  }

  function renderDetected(root, text) {
    var mount = qs(root, "[data-url-detected]");
    if (!mount) return [];
    var hits = Portals.detectMany(text).filter(function (d) {
      return d.ok;
    });
    if (!hits.length) {
      mount.innerHTML = "";
      return hits;
    }
    mount.innerHTML = hits
      .map(function (d) {
        var cls = d.portal === "autre" ? " url-pill--unknown" : "";
        return '<span class="url-pill' + cls + '">' + d.label + "</span>";
      })
      .join("");
    return hits;
  }

  function renderThumbs(root, state) {
    var mount = qs(root, "[data-listing-thumbs]");
    if (!mount) return;
    var items = mediaList(state);
    mount.innerHTML = items
      .map(function (m, i) {
        var label = m.kind === "capture" ? "Capture" : "Photo";
        return (
          '<div class="listing-thumb">' +
          '<img src="' +
          esc(m.url) +
          '" alt="' +
          label +
          '" />' +
          "<span>" +
          label +
          "</span>" +
          '<button type="button" data-remove-media="' +
          i +
          '" aria-label="Retirer">×</button>' +
          "</div>"
        );
      })
      .join("");
  }

  function radioVal(scope, name) {
    var el = (scope || document).querySelector("[name='" + name + "']:checked");
    return el ? String(el.value || "").trim() : "";
  }

  function resolveCity(form) {
    if (window.AcheteurImmoDepositVente && window.AcheteurImmoDepositVente.syncAllLocations) {
      window.AcheteurImmoDepositVente.syncAllLocations();
    }
    var urlCity = document.querySelector("#urlCity");
    if (urlCity && String(urlCity.value || "").trim()) return String(urlCity.value).trim();
    var c = val(form, "city");
    if (c) return c;
    var fb = document.querySelector("[data-city-fallback]");
    if (fb && String(fb.value || "").trim()) return String(fb.value).trim();
    var sellEl = document.querySelector("#sellCity");
    if (sellEl && String(sellEl.value || "").trim()) return String(sellEl.value).trim();
    if (window.AcheteurImmoDepositVente && window.AcheteurImmoDepositVente.collectSellDossier) {
      var sd = window.AcheteurImmoDepositVente.collectSellDossier();
      if (sd && sd.sellCity && String(sd.sellCity).trim()) return String(sd.sellCity).trim();
    }
    return "";
  }

  function focusCityField(form) {
    var fallback = document.querySelector("[data-city-fallback]");
    var sellEl = document.querySelector("#sellCity");
    var cityEl = form.querySelector("[name='city']");
    var panel = document.querySelector("[data-search-vente-panel]");
    var target = fallback || cityEl || sellEl;
    if (panel && !panel.hidden && sellEl && !fallback) target = sellEl;
    if (fallback) target = fallback;
    if (!target) return;
    var block = target.closest("details.immo-vente-block");
    if (block && !block.open) block.open = true;
    if (cityEl) cityEl.classList.remove("input-invalid");
    if (sellEl) sellEl.classList.remove("input-invalid");
    if (fallback) fallback.classList.remove("input-invalid");
    target.classList.add("input-invalid");
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    try {
      target.focus({ preventScroll: true });
    } catch (f) {}
  }

  function currentHat() {
    return radioVal(document, "immoHat") || "acheteur";
  }

  var HAT_COPY = {
    acheteur: {
      kicker: "Annonce déjà vue",
      title: "Collez l'URL du bien",
      intro: "Leboncoin, SeLoger, ParuVendu… Collez le lien, description, photos et capture. On enregistre aussi le vendeur visible sur l'annonce.",
      submit: "Envoyer l'annonce",
      coords: "Vos coordonnées",
      details: "Précisions (visite, offre, questions)",
      hint: "Vous cherchez un bien : filtrez la vitrine ou collez une URL déjà vue.",
    },
    signalement: {
      kicker: "Signalement terrain",
      title: "Signalez un bien à vendre",
      intro:
        "Panneau « À vendre », maison vue de passage, annonce papier… Photo + ville suffisent. Nous enquêtons comme un chasseur de bien — sans promesse de mandat.",
      submit: "Envoyer le signalement",
      coords: "Vos coordonnées (pour vous recontacter si besoin)",
      details: "Ce que vous avez observé (état, panneau, voisin…)",
      hint: "Vous n'êtes pas le vendeur : vous nous aidez à repérer une opportunité pour nos acquéreurs.",
    },
    vendeur: {
      kicker: "Vous vendez",
      title: "Déposez votre bien",
      intro: "Collez l'URL de votre annonce si elle est en ligne, puis complétez type, ville, prix et description. Les deux se complètent — pas de scraping.",
      submit: "Déposer mon bien",
      coords: "Vos coordonnées (vendeur)",
      details: "Précisions (disponibilité, urgence, honoraires…)",
      hint: "Collez l'URL si vous l'avez, et complétez les champs du bien — les deux ensemble.",
    },
    les_deux: {
      kicker: "Double casquette",
      title: "Vous vendez et vous rachètez",
      intro: "URL de l'annonce + saisie du bien à vendre, puis indiquez ce que vous cherchez ensuite. Chaîne et prêt relais possibles.",
      submit: "Déposer et chercher",
      coords: "Vos coordonnées (vente + rachat)",
      details: "Précisions (délai de vente, relais, secteur visé…)",
      hint: "Les deux casquettes : on capte le bien à vendre et la recherche de rachat.",
    },
  };

  function applyHat(hat) {
    hat = hat || currentHat();
    if (hat !== "vendeur" && hat !== "les_deux" && hat !== "signalement") hat = "acheteur";
    document.documentElement.setAttribute("data-immo-hat", hat);
    var roleInput = document.querySelector("[data-hat-role]");
    if (roleInput) roleInput.value = hat;
    var copy = HAT_COPY[hat];
    var setTxt = function (sel, text) {
      var el = document.querySelector(sel);
      if (el) el.textContent = text;
    };
    setTxt("[data-deposit-kicker]", copy.kicker);
    setTxt("[data-deposit-title]", copy.title);
    setTxt("[data-deposit-intro]", copy.intro);
    setTxt("[data-deposit-submit]", copy.submit);
    setTxt("[data-coords-label]", copy.coords);
    setTxt("[data-details-label]", copy.details);
    setTxt("[data-hat-hint]", copy.hint);
    var hatRadio = document.querySelector("[name='immoHat'][value='" + hat + "']");
    if (hatRadio) hatRadio.checked = true;
    applyListingMode();
    if (window.VendeurVisitePretBlock) window.VendeurVisitePretBlock.syncVisibility();
    if (window.AcheteurImmoDepositVente) window.AcheteurImmoDepositVente.sync();
    else if (window.AcheteurImmoHatDossier) window.AcheteurImmoHatDossier.sync(hat);
    var captureRoot = document.querySelector("[data-listing-url-capture]");
    if (captureRoot && window.AcheteurImmoAccount) window.AcheteurImmoAccount.updateAccountUi(captureRoot);
  }

  function applyListingMode() {
    var hat = document.documentElement.getAttribute("data-immo-hat") || currentHat();
    var block = document.querySelector("[data-url-block]");
    var modeWrap = document.querySelector("[data-listing-mode-wrap]");
    if (hat === "signalement") {
      if (block) block.hidden = true;
      if (modeWrap) modeWrap.hidden = true;
      return;
    }
    if (modeWrap) modeWrap.hidden = true;
    if (block) block.hidden = false;
  }

  function bindHats() {
    if (document.documentElement.dataset.immoHatsBound) return;
    document.documentElement.dataset.immoHatsBound = "1";
    var params = new URLSearchParams(window.location.search);
    var role = (params.get("role") || params.get("hat") || "").toLowerCase();
    var presetHat = document.documentElement.getAttribute("data-immo-hat");
    var presetSignalement = document.querySelector("[name='immoHat'][value='signalement']:checked");
    if (role === "vendeur" || role === "seller") applyHat("vendeur");
    else if (role === "signalement" || role === "temoin" || role === "chasseur" || presetSignalement || presetHat === "signalement")
      applyHat("signalement");
    else if (role === "les_deux" || role === "both" || role === "acheteur-vendeur") applyHat("les_deux");
    else if ((location.hash || "").indexOf("deposer-bien") >= 0) applyHat("vendeur");
    else applyHat(document.documentElement.getAttribute("data-immo-hat") || "acheteur");
    document.querySelectorAll("[name='immoHat']").forEach(function (el) {
      el.addEventListener("change", function () {
        applyHat(el.value);
      });
    });
  }

  function renderPreview(root, state) {
    var mount = qs(root, "[data-listing-preview]");
    if (!mount || !Lib) return;
    var form = qs(root, "[data-url-capture-form]");
    var photos = mediaList(state);
    var listing = Lib.toPublicListing({
      id: "preview",
      title: "",
      property_type: val(form, "property_type") || "appartement",
      city: val(form, "city"),
      postal_code: val(form, "postal_code"),
      rooms: val(form, "rooms"),
      bedrooms: val(form, "bedrooms"),
      surface_m2: val(form, "surface_m2"),
      price_fai: val(form, "price_fai"),
      dpe: val(form, "dpe"),
      description: val(form, "description"),
      photos: photos,
    });
    var cover = listing.cover && listing.cover.url;
    var excerpt = listing.description
      ? listing.description.slice(0, 140) + (listing.description.length > 140 ? "…" : "")
      : "Ajoutez la description de l'annonce pour l'afficher ici.";
    var loc = [listing.city, listing.postal_code].filter(Boolean).join(" ") || "Ville du bien";
    var stats = [];
    if (listing.rooms) stats.push(listing.rooms + " p.");
    if (listing.surface_m2) stats.push(listing.surface_m2 + " m²");
    if (listing.bedrooms) stats.push(listing.bedrooms + " ch.");
    if (listing.dpe) stats.push("DPE " + listing.dpe);
    mount.innerHTML =
      '<article class="listing-card">' +
      '<div class="listing-card-media' +
      (cover ? " has-photo" : "") +
      '" data-type="' +
      esc(listing.property_type) +
      '">' +
      (cover ? '<img class="listing-card-cover" src="' + esc(cover) + '" alt="" />' : "") +
      (listing.capture ? '<span class="listing-card-capture">Capture</span>' : "") +
      '<span class="listing-card-price">' +
      esc(Lib.formatPrice(listing.price_fai)) +
      "</span>" +
      '<span class="listing-card-type">' +
      esc(listing.type_label) +
      " à vendre</span></div>" +
      '<div class="listing-card-body"><h3>' +
      esc(listing.title || listing.type_label) +
      "</h3>" +
      '<p class="listing-card-loc">' +
      esc(loc) +
      "</p>" +
      (stats.length ? '<div class="listing-card-stats">' + esc(stats.join(" · ")) + "</div>" : "") +
      '<p class="listing-card-desc">' +
      esc(excerpt) +
      "</p></div></article>";
  }

  function init(root) {
    if (!root || root.dataset.urlCaptureBound) return;
    root.dataset.urlCaptureBound = "1";
    var state = { photos: [], capture: null };
    var area = qs(root, "[data-listing-urls]");
    var form = qs(root, "[data-url-capture-form]");
    var err = qs(root, "[data-url-capture-err]");
    var ok = qs(root, "[data-url-capture-ok]");
    var photosInput = qs(root, "[data-listing-photos]");
    var captureInput = qs(root, "[data-listing-capture]");

    function refreshMedia() {
      renderThumbs(root, state);
      renderPreview(root, state);
      if (window.AcheteurImmoDepositGuide) window.AcheteurImmoDepositGuide.refreshUi(root);
    }

    if (area) {
      area.addEventListener("input", function () {
        renderDetected(root, area.value);
        if (window.AcheteurImmoDepositGuide) window.AcheteurImmoDepositGuide.refreshUi(root);
      });
      area.addEventListener("paste", function () {
        setTimeout(function () {
          renderDetected(root, area.value);
        }, 0);
      });
    }
    if (form) {
      form.addEventListener("input", function () {
        renderPreview(root, state);
      });
      form.addEventListener("change", function () {
        renderPreview(root, state);
      });
    }

    if (photosInput) {
      photosInput.addEventListener("change", function () {
        var files = Array.prototype.slice.call(photosInput.files || []).slice(0, MAX_PHOTOS);
        Promise.all(files.map(compressFile)).then(function (urls) {
          state.photos = urls
            .filter(Boolean)
            .slice(0, MAX_PHOTOS)
            .map(function (url) {
              return { url: url, kind: "photo" };
            });
          refreshMedia();
          photosInput.value = "";
        });
      });
    }
    if (captureInput) {
      captureInput.addEventListener("change", function () {
        var file = captureInput.files && captureInput.files[0];
        compressFile(file).then(function (url) {
          state.capture = url ? { url: url, kind: "capture" } : null;
          refreshMedia();
          captureInput.value = "";
        });
      });
    }

    root.addEventListener("paste", function (e) {
      var items = e.clipboardData && e.clipboardData.items;
      if (!items) return;
      var file = null;
      for (var i = 0; i < items.length; i++) {
        if (items[i].type && items[i].type.indexOf("image/") === 0) {
          file = items[i].getAsFile();
          break;
        }
      }
      if (!file) return;
      var tag = (e.target && e.target.tagName) || "";
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      e.preventDefault();
      compressFile(file).then(function (url) {
        if (!url) return;
        state.capture = { url: url, kind: "capture" };
        refreshMedia();
      });
    });

    root.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-remove-media]");
      if (!btn) return;
      var idx = Number(btn.getAttribute("data-remove-media"));
      var list = mediaList(state);
      var item = list[idx];
      if (!item) return;
      if (item.kind === "capture") state.capture = null;
      else {
        state.photos = state.photos.filter(function (p) {
          return p.url !== item.url;
        });
      }
      refreshMedia();
    });

    refreshMedia();
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (err) {
        err.hidden = true;
        err.textContent = "";
      }
      if (ok) ok.hidden = true;
      if (window.AcheteurImmoDepositVente && window.AcheteurImmoDepositVente.syncAllLocations) {
        window.AcheteurImmoDepositVente.syncAllLocations();
      } else if (window.AcheteurImmoDepositVente && window.AcheteurImmoDepositVente.syncSellToExpress) {
        window.AcheteurImmoDepositVente.syncSellToExpress();
      }
      var hat = val(form, "role") || currentHat();
      var isOwner = hat === "vendeur" || hat === "les_deux";
      var urlsText = area ? area.value : "";
      var hits = Portals.detectMany(urlsText).filter(function (d) {
        return d.ok;
      });
      var cityResolved = resolveCity(form);

      if (window.AcheteurImmoDepositGuide) {
        var guideResult;
        try {
          guideResult = window.AcheteurImmoDepositGuide.validate(
            window.AcheteurImmoDepositGuide.buildCtx(form, root)
          );
        } catch (guideErr) {
          console.error("[listing-submit] validation", guideErr);
          if (err) {
            err.hidden = false;
            err.textContent = "Erreur de validation du formulaire — rechargez la page ou contactez-nous.";
          }
          return;
        }
        window.AcheteurImmoDepositGuide.renderValidationPanel(root, guideResult);
        if (!guideResult.ok) {
          window.AcheteurImmoDepositGuide.showSubmitError(err, guideResult, root);
          return;
        }
      } else {
        var isSignalement = hat === "signalement";
        if (!hits.length && !isOwner && !isSignalement) {
          if (err) {
            err.hidden = false;
            err.textContent = "Collez au moins une URL d'annonce (Leboncoin, SeLoger, ParuVendu…).";
          }
          return;
        }
        if ((isOwner || isSignalement) && !cityResolved && !hits.length) {
          if (err) {
            err.hidden = false;
            err.textContent = isSignalement
              ? "Indiquez la ville du bien signalé."
              : "Indiquez la ville du bien (section « Coordonnées du bien » ou saisie rapide), ou collez l'URL de votre annonce.";
          }
          focusCityField(form);
          return;
        }
        if (isSignalement && !mediaList(state).length && !val(form, "description")) {
          if (err) {
            err.hidden = false;
            err.textContent = "Ajoutez au moins une photo ou une description du bien.";
          }
          return;
        }
      }
      var confirmMethod =
        window.AcheteurImmoAccount && window.AcheteurImmoAccount.getConfirmMethod
          ? window.AcheteurImmoAccount.getConfirmMethod(root)
          : null;
      if (!confirmMethod && isOwner) confirmMethod = "email";
      var payloadEmail = val(form, "email");
      var payloadPhone = val(form, "phone");
      if (
        !payloadEmail &&
        window.AcheteurImmoDepositGuide &&
        window.AcheteurImmoDepositGuide.sessionEmail &&
        (confirmMethod === "google" || window.AcheteurImmoAccount && window.AcheteurImmoAccount.isLoggedIn())
      ) {
        payloadEmail = window.AcheteurImmoDepositGuide.sessionEmail();
      }
      var depositSessionId =
        window.ImmoDepositDriveSession && window.ImmoDepositDriveSession.getDepositSessionId
          ? window.ImmoDepositDriveSession.getDepositSessionId()
          : null;
      var payload = {
        role: hat,
        alsoBuys: hat === "les_deux",
        depositSessionId: depositSessionId,
        urls: hits.map(function (d) {
          return d.url;
        }),
        firstName: val(form, "firstName"),
        lastName: val(form, "lastName"),
        email: payloadEmail,
        phone: payloadPhone,
        city: cityResolved || val(form, "city"),
        postal_code: val(form, "postal_code"),
        property_type: val(form, "property_type"),
        price_fai: val(form, "price_fai"),
        rooms: val(form, "rooms"),
        bedrooms: val(form, "bedrooms"),
        surface_m2: val(form, "surface_m2"),
        dpe: val(form, "dpe"),
        description: val(form, "description"),
        sellerKind: radioVal(form, "sellerKind"),
        sellerName: val(form, "sellerName"),
        sellerPhone: val(form, "sellerPhone"),
        sellerEmail: val(form, "sellerEmail"),
        sellerAgency: val(form, "sellerAgency") || val(form, "sellerAgencyThird"),
        signalementSource: val(form, "signalementSource"),
        addressHint: val(form, "addressHint"),
        details: val(form, "details"),
        buyCity: val(form, "buyCity"),
        buyPostal: val(form, "buyPostal"),
        buyBudgetMax: val(form, "buyBudgetMax"),
        buyRoomsMin: val(form, "buyRoomsMin"),
        buySurfaceMin: val(form, "buySurfaceMin"),
        buyPropertyType: val(form, "buyPropertyType"),
        wantsRelais: !!(form.querySelector("[name='wantsRelais']") && form.querySelector("[name='wantsRelais']").checked),
        confirmMethod: confirmMethod,
        confirmByEmail: confirmMethod === "email" || confirmMethod === "google",
        confirmByPhone: confirmMethod === "phone",
        createAccount: true,
        photos: mediaList(state),
        _hp: val(form, "_hp"),
        wantsSellDossier:
          isOwner ||
          !!(form.querySelector("[data-deposit-vente-toggle]") && form.querySelector("[data-deposit-vente-toggle]").checked),
        sellDossier:
          window.AcheteurImmoDepositVente && window.AcheteurImmoDepositVente.collectSellDossier
            ? window.AcheteurImmoDepositVente.collectSellDossier()
            : null,
        need:
          hat === "signalement"
            ? "signalement-bien"
            : hat === "vendeur"
              ? "vendeur-immo"
              : hat === "les_deux"
                ? "acheteur-vendeur-immo"
                : "acheteur-immo",
        vertical:
          hat === "signalement"
            ? "chasseur_immo"
            : hat === "vendeur"
              ? "vendeur_immo"
              : hat === "les_deux"
                ? "acheteur_vendeur_immo"
                : "acheteur_immo",
      };
      if (!payload.email && !payload.phone) {
        if (window.AcheteurImmoDepositGuide) {
          var lateGuide = window.AcheteurImmoDepositGuide.validate(
            window.AcheteurImmoDepositGuide.buildCtx(form, root)
          );
          window.AcheteurImmoDepositGuide.renderValidationPanel(root, lateGuide);
          window.AcheteurImmoDepositGuide.showSubmitError(err, lateGuide, root);
        } else if (err) {
          err.hidden = false;
          err.textContent = "Indiquez votre e-mail ou votre téléphone.";
        }
        return;
      }
      var btn = form.querySelector("[type=submit]");
      if (btn) btn.disabled = true;
      fetch("/api/immo-listing-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      })
        .then(function (r) {
          return r.json().then(function (data) {
            return { ok: r.ok, data: data };
          });
        })
        .then(function (res) {
          if (!res.data || !res.data.ok) {
            throw new Error((res.data && res.data.message) || "Envoi impossible");
          }
          var hats = (res.data.hats || []).join(" + ");
          var driveSession = {
            depositSessionId: depositSessionId,
            email: payload.email || "",
            phone: payload.phone || "",
            contactId: res.data.contactId || null,
            leadId: res.data.leadId || null,
            propertyId:
              res.data.propertyIds && res.data.propertyIds.length ? res.data.propertyIds[0] : null,
          };
          if (window.ImmoDepositDriveSession) {
            window.ImmoDepositDriveSession.save(driveSession);
          }
          var uploadPromise =
            window.ImmoDepositDriveSession && window.ImmoDepositDriveSession.uploadAllPending
              ? window.ImmoDepositDriveSession.uploadAllPending()
              : Promise.resolve({ uploaded: [], errors: [] });
          return uploadPromise.then(function (up) {
            var docNote = "";
            if (up && up.uploaded && up.uploaded.length) {
              docNote += " " + up.uploaded.length + " document(s) archivé(s) sur Google Drive.";
            }
            if (up && up.errors && up.errors.length) {
              docNote += " Attention : " + up.errors.length + " document(s) non envoyé(s) sur Drive.";
            }
            return { res: res, docNote: docNote, hats: hats, driveSession: driveSession };
          });
        })
        .then(function (ctx) {
          var res = ctx.res;
          var payloadPhotos = mediaList(state).length;
          if (ok) {
            ok.hidden = false;
            var driveNote = res.data.driveConfigured ? " Copie Google Drive effectuée ou en cours." : "";
            var dossierNote =
              payload.wantsSellDossier && payload.sellDossier ? " Dossier vente détaillé enregistré." : "";
            var accountNote = "";
            if (res.data.accountCreated) {
              accountNote = " Compte client créé.";
              if (res.data.verifyEmailSent) {
                accountNote += " E-mail de confirmation envoyé — cliquez le lien pour activer votre espace.";
              } else if (confirmMethod === "email" || payload.confirmByEmail) {
                accountNote += " Confirmation e-mail : utilisez « Renvoyer l'e-mail de confirmation » si besoin.";
              }
              if (confirmMethod === "phone" || payload.confirmByPhone) {
                accountNote += " Un conseiller vous rappellera pour confirmer votre téléphone.";
              }
              if (confirmMethod === "google") {
                accountNote += " Identité confirmée via Google.";
              }
            }
            ok.textContent =
              res.data.received +
              " bien" +
              (res.data.received > 1 ? "s" : "") +
              " enregistré" +
              (res.data.received > 1 ? "s" : "") +
              (payloadPhotos ? " avec photos / capture" + driveNote : "") +
              (ctx.hats ? " (" + ctx.hats + ")" : "") +
              dossierNote +
              accountNote +
              (ctx.docNote || "") +
              ". Vous pouvez encore déposer des documents — ils iront sur Google Drive dans cette session.";
          }
          form.reset();
          state.photos = [];
          state.capture = null;
          if (window.AcheteurImmoDepositGuide) window.AcheteurImmoDepositGuide.clearDraftAfterSubmit();
          renderDetected(root, "");
          refreshMedia();
          applyHat(hat);
          try {
            document.dispatchEvent(
              new CustomEvent("lo:listing-submitted", {
                detail: {
                  session: ctx.driveSession || null,
                  result: res.data,
                  payload: payload,
                },
              })
            );
          } catch (ev) {}
        })
        .catch(function (ex) {
          if (err) {
            err.hidden = false;
            err.textContent = ex.message || "Envoi impossible.";
          }
        })
        .then(function () {
          if (btn) btn.disabled = false;
        });
    });
  }

  function boot() {
    bindHats();
    var nodes = document.querySelectorAll("[data-listing-url-capture]");
    for (var i = 0; i < nodes.length; i++) init(nodes[i]);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
