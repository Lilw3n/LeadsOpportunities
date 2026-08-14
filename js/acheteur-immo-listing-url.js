/**
 * Capture publique d'URL d'annonces (Leboncoin, SeLoger, ParuVendu…).
 * Photos + description + capture d'écran fournies par l'utilisateur (pas de scraping).
 */
(function () {
  var Portals = window.ImmoListingPortals;
  var Lib = window.ImmoPublicListings;
  var Secteur = window.ImmoSecteur;
  if (!Portals) return;

  var MAX_PHOTOS = 4;
  var MAX_DIM = 1200;
  var MAX_DATA = 240000;

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

  function compressFile(file) {
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

  function currentHat() {
    return radioVal(document, "immoHat") || "acheteur";
  }

  var HAT_COPY = {
    acheteur: {
      kicker: "Annonce déjà vue",
      title: "Collez l'URL du bien",
      intro: "Leboncoin, SeLoger, ParuVendu… Collez le lien, description, photos et capture. Je contacte le vendeur et je vais chercher le mandat.",
      submit: "Envoyer l'annonce",
      coords: "Vos coordonnées",
      details: "Précisions (visite, offre, questions)",
      hint: "Vous cherchez un bien : filtrez la vitrine, ou envoyez un lien d'annonce et j'irai chercher le mandat.",
      mandate: "Allez chercher le mandat auprès du vendeur de cette annonce",
      mandateHint: "J'appelle l'annonceur, je me déplace et je négocie le mandat pour pouvoir vous représenter.",
    },
    vendeur: {
      kicker: "Vous vendez",
      title: "Déposez votre bien",
      intro: "Saisie à la main ou URL de votre annonce déjà en ligne. Photos + description pour l'afficher ici. Pas de scraping.",
      submit: "Déposer mon bien",
      coords: "Vos coordonnées (vendeur)",
      details: "Précisions (disponibilité, urgence, honoraires…)",
      hint: "Vous déposez un bien à vendre — à la main ou via l'URL de votre annonce.",
      mandate: "Je suis prêt à confier un mandat pour ce bien",
      mandateHint: "Estimation, mandat de vente simple ou exclusif : on en parle avant de signer quoi que ce soit.",
    },
    les_deux: {
      kicker: "Double casquette",
      title: "Vous vendez et vous rachètez",
      intro: "Déposez le bien à vendre (manuel ou URL), puis indiquez ce que vous cherchez ensuite. Chaîne et prêt relais possibles.",
      submit: "Déposer et chercher",
      coords: "Vos coordonnées (vente + rachat)",
      details: "Précisions (délai de vente, relais, secteur visé…)",
      hint: "Les deux casquettes : on capte le bien à vendre et la recherche de rachat.",
      mandate: "Mandat de vente pour mon bien + recherche pour le rachat",
      mandateHint: "Un seul interlocuteur sur les deux opérations : vente de votre bien et chasse du bien suivant.",
    },
  };

  function applyHat(hat) {
    hat = hat || currentHat();
    if (hat !== "vendeur" && hat !== "les_deux") hat = "acheteur";
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
    setTxt("[data-mandate-mission-label]", copy.mandate);
    setTxt("[data-mandate-mission-hint]", copy.mandateHint);
    var hatRadio = document.querySelector("[name='immoHat'][value='" + hat + "']");
    if (hatRadio) hatRadio.checked = true;
    if (hat !== "acheteur") {
      var manuel = document.querySelector("[name='listingMode'][value='manuel']");
      var urlMode = document.querySelector("[name='listingMode'][value='url']");
      var urlsEl = document.querySelector("[data-listing-urls]");
      if (manuel && urlMode && urlMode.checked && urlsEl && !String(urlsEl.value || "").trim()) {
        manuel.checked = true;
      }
    }
    applyListingMode();
  }

  function applyListingMode() {
    var mode = radioVal(document, "listingMode") || "url";
    var block = document.querySelector("[data-url-block]");
    if (block) block.hidden = mode === "manuel";
  }

  /** Secteur d'intervention : une seule source de vérité (immo-secteur-lib). */
  function applySecteurLabel() {
    if (!Secteur) return;
    var el = document.querySelector("[data-secteur-label]");
    if (el) el.textContent = Secteur.secteurLabel();
  }

  /** Dit à l'acquéreur, en direct, si on peut aller chercher le mandat sur place. */
  function renderSecteur(root) {
    var mount = qs(root, "[data-secteur-feedback]");
    var form = qs(root, "[data-url-capture-form]");
    if (!mount || !form) return;
    if (!Secteur) {
      mount.hidden = true;
      return;
    }
    var city = val(form, "city");
    var postal = val(form, "postal_code");
    if (!city && !postal) {
      mount.hidden = true;
      mount.textContent = "";
      mount.removeAttribute("data-tone");
      return;
    }
    var fb = Secteur.feedback({ city: city, postal_code: postal });
    mount.hidden = false;
    mount.setAttribute("data-tone", fb.tone);
    mount.textContent = fb.text;
  }

  function bindHats() {
    if (document.documentElement.dataset.immoHatsBound) return;
    document.documentElement.dataset.immoHatsBound = "1";
    var params = new URLSearchParams(window.location.search);
    var role = (params.get("role") || params.get("hat") || "").toLowerCase();
    if (role === "vendeur" || role === "seller") applyHat("vendeur");
    else if (role === "les_deux" || role === "both" || role === "acheteur-vendeur") applyHat("les_deux");
    else applyHat("acheteur");
    document.querySelectorAll("[name='immoHat']").forEach(function (el) {
      el.addEventListener("change", function () {
        applyHat(el.value);
      });
    });
    document.querySelectorAll("[name='listingMode']").forEach(function (el) {
      el.addEventListener("change", applyListingMode);
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
    }

    applySecteurLabel();
    renderSecteur(root);

    if (area) {
      area.addEventListener("input", function () {
        renderDetected(root, area.value);
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
        renderSecteur(root);
      });
      form.addEventListener("change", function () {
        renderPreview(root, state);
        renderSecteur(root);
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
      var hat = val(form, "role") || currentHat();
      var isOwner = hat === "vendeur" || hat === "les_deux";
      var urlsText = area ? area.value : "";
      var hits = Portals.detectMany(urlsText).filter(function (d) {
        return d.ok;
      });
      if (!hits.length && !isOwner) {
        if (err) {
          err.hidden = false;
          err.textContent = "Collez au moins une URL d'annonce (Leboncoin, SeLoger, ParuVendu…).";
        }
        return;
      }
      if (isOwner && !val(form, "city") && !hits.length) {
        if (err) {
          err.hidden = false;
          err.textContent = "Indiquez la ville du bien, ou collez l'URL de votre annonce.";
        }
        return;
      }
      var mandateEl = form.querySelector("[data-mandate-mission]");
      var payload = {
        role: hat,
        alsoBuys: hat === "les_deux",
        mandateMission: mandateEl ? !!mandateEl.checked : true,
        urls: hits.map(function (d) {
          return d.url;
        }),
        firstName: val(form, "firstName"),
        lastName: val(form, "lastName"),
        email: val(form, "email"),
        phone: val(form, "phone"),
        city: val(form, "city"),
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
        details: val(form, "details"),
        buyCity: val(form, "buyCity"),
        buyPostal: val(form, "buyPostal"),
        buyBudgetMax: val(form, "buyBudgetMax"),
        buyRoomsMin: val(form, "buyRoomsMin"),
        buySurfaceMin: val(form, "buySurfaceMin"),
        buyPropertyType: val(form, "buyPropertyType"),
        wantsRelais: !!(form.querySelector("[name='wantsRelais']") && form.querySelector("[name='wantsRelais']").checked),
        photos: mediaList(state),
        _hp: val(form, "_hp"),
        need: hat === "vendeur" ? "vendeur-immo" : hat === "les_deux" ? "acheteur-vendeur-immo" : "acheteur-immo",
        vertical: hat === "vendeur" ? "vendeur_immo" : hat === "les_deux" ? "acheteur_vendeur_immo" : "acheteur_immo",
      };
      if (!payload.email && !payload.phone) {
        if (err) {
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
          var mandate = res.data.mandate || {};
          var secteur = res.data.secteur || {};
          if (ok) {
            ok.hidden = false;
            ok.textContent =
              res.data.received +
              " bien" +
              (res.data.received > 1 ? "s" : "") +
              " enregistré" +
              (res.data.received > 1 ? "s" : "") +
              (payload.photos.length ? " avec photos / capture" : "") +
              (hats ? " (" + hats + ")" : "") +
              ". " +
              (mandate.requested && secteur.message
                ? secteur.message
                : "Un conseiller vous rappelle.");
          }
          form.reset();
          state.photos = [];
          state.capture = null;
          renderDetected(root, "");
          refreshMedia();
          renderSecteur(root);
          applyHat(hat);
          try {
            document.dispatchEvent(new CustomEvent("lo:listing-submitted"));
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
