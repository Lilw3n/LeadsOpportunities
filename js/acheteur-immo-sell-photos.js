/**
 * Photos du bien — section vente (questionnaire #demande).
 * Expose window.SellPhotosState pour envoi vers /api/immo-listing-submit + Drive.
 */
(function () {
  var Compress = window.ImmoPhotoCompress;
  if (!Compress) return;

  var MAX = 12;
  var state = { photos: [] };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function mount(root) {
    if (!root || root.dataset.sellPhotosBound) return;
    root.dataset.sellPhotosBound = "1";
    root.innerHTML =
      '<div class="sell-photos-block">' +
      '<p class="search-section-label" style="margin:0">Photos du bien</p>' +
      '<p class="listing-media-hint">Façade, séjour, cuisine, chambres, jardin… Les fichiers sont sauvegardés sur Google Drive (<strong>01_photos_publiques</strong>) et dans votre dossier conseiller.</p>' +
      '<div class="grid">' +
      '<div class="field">' +
      '<label for="sellPhotosInput">Ajouter des photos (max ' +
      MAX +
      ")</label>" +
      '<input id="sellPhotosInput" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" multiple data-sell-photos-input />' +
      "</div></div>" +
      '<div class="listing-thumbs" data-sell-photos-thumbs></div>' +
      '<p class="small" data-sell-photos-status hidden style="color:#047857;margin:8px 0 0"></p>' +
      "</div>";

    var input = root.querySelector("[data-sell-photos-input]");
    var thumbs = root.querySelector("[data-sell-photos-thumbs]");

    function render() {
      if (!thumbs) return;
      thumbs.innerHTML = state.photos
        .map(function (p, i) {
          return (
            '<div class="listing-thumb">' +
            '<img src="' +
            esc(p.url) +
            '" alt="Photo ' +
            (i + 1) +
            '" />' +
            "<span>Photo " +
            (i + 1) +
            "</span>" +
            '<button type="button" data-sell-photo-remove="' +
            i +
            '" aria-label="Retirer">×</button>' +
            "</div>"
          );
        })
        .join("");
    }

    if (input) {
      input.addEventListener("change", function () {
        var files = Array.prototype.slice.call(input.files || []);
        var room = MAX - state.photos.length;
        if (room <= 0) return;
        Compress.compressMany(files.slice(0, room)).then(function (urls) {
          urls.filter(Boolean).forEach(function (url) {
            if (state.photos.length < MAX) state.photos.push({ url: url, kind: "photo" });
          });
          render();
          input.value = "";
        });
      });
    }

    root.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-sell-photo-remove]");
      if (!btn) return;
      var idx = Number(btn.getAttribute("data-sell-photo-remove"));
      state.photos = state.photos.filter(function (_, i) {
        return i !== idx;
      });
      render();
    });

    render();
  }

  function collectListingPayload(form, leadResult) {
    form = form || document.querySelector("form[data-acheteur-immo]");
    if (!form || !state.photos.length) return null;
    var kindEl = form.querySelector('input[name="searchKind"]:checked');
    var kind = kindEl ? kindEl.value : "";
    if (kind !== "service" && kind !== "les_deux") return null;

    function val(name) {
      var el = form.querySelector("[name='" + name + "']");
      return el ? String(el.value || "").trim() : "";
    }

    var email = val("email");
    var phone = val("phone");
    if (!email && !phone) return null;

    return {
      role: kind === "les_deux" ? "les_deux" : "vendeur",
      alsoBuys: kind === "les_deux",
      firstName: val("firstName") || val("ownerFirstName[]"),
      lastName: val("lastName") || val("ownerLastName[]"),
      email: email,
      phone: phone,
      city: val("sellCity") || val("city"),
      postal_code: val("sellPostalCode") || val("postal_code"),
      addressHint: val("sellAddress"),
      property_type: val("property_type") || "appartement",
      price_fai: val("sellPriceFai") || val("sellAskingPrice"),
      rooms: val("sellRooms"),
      surface_m2: val("sellLivingArea") || val("propertySurface"),
      description: val("sellDescription") || val("sellPublicDesc"),
      photos: state.photos.slice(),
      details: "Photos déposées via questionnaire vente (#demande)" + (leadResult && leadResult.leadId ? " — lead " + leadResult.leadId : ""),
      need: kind === "les_deux" ? "acheteur-vendeur-immo" : "vendeur-immo",
      vertical: kind === "les_deux" ? "acheteur_vendeur_immo" : "vendeur_immo",
    };
  }

  function submitPhotosAfterLead(form, leadResult) {
    var payload = collectListingPayload(form, leadResult);
    if (!payload) return Promise.resolve(null);
    return fetch("/api/immo-listing-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(payload),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (data && data.ok) {
          state.photos = [];
          document.querySelectorAll("[data-sell-photos-mount]").forEach(function (root) {
            var st = root.querySelector("[data-sell-photos-status]");
            if (st) {
              st.hidden = false;
              st.textContent =
                data.photos +
                " photo(s) enregistrée(s)" +
                (data.driveConfigured ? " — copie Drive en cours ou effectuée." : " — Drive : vérifiez la configuration serveur.");
            }
            var thumbs = root.querySelector("[data-sell-photos-thumbs]");
            if (thumbs) thumbs.innerHTML = "";
          });
        }
        return data;
      })
      .catch(function () {
        return null;
      });
  }

  function boot() {
    document.querySelectorAll("[data-sell-photos-mount]").forEach(mount);
  }

  window.SellPhotosState = {
    getPhotos: function () {
      return state.photos.slice();
    },
    clear: function () {
      state.photos = [];
    },
    collectListingPayload: collectListingPayload,
    submitPhotosAfterLead: submitPhotosAfterLead,
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
