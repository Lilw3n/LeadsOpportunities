/**
 * Recherche de bien publique : filtres + cartes d'annonces.
 */
(function () {
  var Lib = window.ImmoPublicListings;
  if (!Lib) return;

  function qs(root, sel) {
    return (root || document).querySelector(sel);
  }

  function qsa(root, sel) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function queryFromForm(root) {
    var types = qsa(root, 'input[name="listingType"]:checked').map(function (el) {
      return el.value;
    });
    return {
      types: types.join(","),
      city: (qs(root, "[data-listing-city]") && qs(root, "[data-listing-city]").value) || "",
      postal: (qs(root, "[data-listing-postal]") && qs(root, "[data-listing-postal]").value) || "",
      budgetMax: (qs(root, "[data-listing-budget]") && qs(root, "[data-listing-budget]").value) || "",
      roomsMin: (qs(root, "[data-listing-rooms]") && qs(root, "[data-listing-rooms]").value) || "",
      surfaceMin: (qs(root, "[data-listing-surface]") && qs(root, "[data-listing-surface]").value) || "",
    };
  }

  function applyQueryToForm(root) {
    var params = new URLSearchParams(window.location.search);
    var city = params.get("city") || params.get("searchCities") || "";
    var postal = params.get("postal") || params.get("postalProject") || "";
    var budget = params.get("budgetMax") || params.get("budget") || "";
    var rooms = params.get("roomsMin") || "";
    var surface = params.get("surfaceMin") || params.get("propertySurfaceSearch") || "";
    var types = (params.get("types") || params.get("type") || "").split(",").filter(Boolean);
    var cityEl = qs(root, "[data-listing-city]");
    var postalEl = qs(root, "[data-listing-postal]");
    var budgetEl = qs(root, "[data-listing-budget]");
    var roomsEl = qs(root, "[data-listing-rooms]");
    var surfaceEl = qs(root, "[data-listing-surface]");
    if (cityEl && city) cityEl.value = city;
    if (postalEl && postal) postalEl.value = postal;
    if (budgetEl && budget) budgetEl.value = budget;
    if (roomsEl && rooms) roomsEl.value = rooms;
    if (surfaceEl && surface) surfaceEl.value = surface;
    types.forEach(function (t) {
      var cb = root.querySelector('input[name="listingType"][value="' + t + '"]');
      if (cb) cb.checked = true;
    });
  }

  function cardHtml(p) {
    var tags = Lib.amenityTags(p)
      .map(function (t) {
        return '<span class="listing-tag">' + esc(t) + "</span>";
      })
      .join("");
    var stats = [];
    if (p.rooms) stats.push(p.rooms + " p.");
    if (p.surface_m2) stats.push(p.surface_m2 + " m²");
    if (p.bedrooms) stats.push(p.bedrooms + " ch.");
    if (p.dpe) {
      stats.push(
        'DPE <span class="listing-dpe" data-dpe="' + esc(p.dpe) + '">' + esc(p.dpe) + "</span>"
      );
    }
    var loc = [p.city, p.postal_code].filter(Boolean).join(" ");
    var cover = p.cover && p.cover.url;
    var coverImg = cover
      ? '<img class="listing-card-cover" src="' + esc(cover) + '" alt="" />'
      : "";
    var excerpt = p.description
      ? p.description.slice(0, 140) + (p.description.length > 140 ? "…" : "")
      : "";
    var hasMedia = !!(cover || (p.photos && p.photos.length) || p.capture);
    var viewBtn = hasMedia
      ? '<button type="button" class="btn btn-soft" data-listing-view>Voir photos / capture</button>'
      : "";
    var captureBadge = p.capture ? '<span class="listing-card-capture">Capture</span>' : "";
    return (
      '<article class="listing-card" data-listing-id="' +
      esc(p.id) +
      '">' +
      '<div class="listing-card-media' +
      (cover ? " has-photo" : "") +
      '" data-type="' +
      esc(p.property_type) +
      '"' +
      (hasMedia ? " data-listing-view" : "") +
      ">" +
      coverImg +
      captureBadge +
      '<span class="listing-card-price">' +
      esc(Lib.formatPrice(p.price_fai)) +
      "</span>" +
      '<span class="listing-card-type">' +
      esc(p.type_label || Lib.typeLabel(p.property_type)) +
      " à vendre</span>" +
      "</div>" +
      '<div class="listing-card-body">' +
      "<h3>" +
      esc(p.title) +
      "</h3>" +
      '<p class="listing-card-loc">' +
      esc(loc || "France") +
      "</p>" +
      '<div class="listing-card-stats">' +
      stats.join(" · ") +
      "</div>" +
      (excerpt ? '<p class="listing-card-desc">' + esc(excerpt) + "</p>" : "") +
      (tags ? '<div class="listing-tags">' + tags + "</div>" : "") +
      '<div class="listing-card-actions">' +
      '<button type="button" class="btn btn-primary" data-listing-interest>Je suis intéressé</button>' +
      viewBtn +
      "</div></div></article>"
    );
  }

  function render(root, listings, source, query) {
    var grid = qs(root, "[data-listings-grid]");
    var count = qs(root, "[data-listings-count]");
    var empty = qs(root, "[data-listings-empty]");
    if (count) {
      count.textContent =
        listings.length +
        " annonce" +
        (listings.length > 1 ? "s" : "");
    }
    if (!listings.length) {
      if (grid) grid.innerHTML = "";
      if (empty) {
        empty.hidden = false;
        var hint = qs(empty, "[data-empty-hint]");
        if (hint) {
          var bits = [];
          if (query.city) bits.push(query.city);
          if (query.postal) bits.push(query.postal);
          if (query.budgetMax) bits.push("budget " + Lib.formatPrice(query.budgetMax));
          hint.textContent = bits.length
            ? "Aucun bien pour " + bits.join(", ") + ". Déposez-en un via URL ou à la main."
            : "Déposez un bien (vendeur) ou collez une URL d'annonce.";
        }
      }
      return;
    }
    if (empty) empty.hidden = true;
    if (grid) grid.innerHTML = listings.map(cardHtml).join("");
  }

  function prefillDossier(listing, query) {
    var form = document.querySelector("form[data-acheteur-immo]");
    if (!form) return;
    function setVal(sel, v) {
      var el = form.querySelector(sel);
      if (el && v != null && v !== "") el.value = v;
    }
    setVal("#interestedListingId", listing && listing.id);
    setVal("#interestedListingTitle", listing && listing.title);
    setVal("#postalProject", (listing && listing.postal_code) || query.postal);
    setVal("#searchCities", (listing && listing.city) || query.city);
    setVal("#budgetMax", (listing && listing.price_fai) || query.budgetMax);
    setVal("#roomsMin", (listing && listing.rooms) || query.roomsMin);
    setVal("#propertySurfaceSearch", (listing && listing.surface_m2) || query.surfaceMin);
    setVal("#propertyPrice", listing && listing.price_fai);
    if (listing && listing.property_type) {
      var cb = form.querySelector(
        'input[name="propertySought"][value="' + listing.property_type + '"]'
      );
      if (cb) cb.checked = true;
    }
    try {
      document.dispatchEvent(
        new CustomEvent("lo:listing-interest", { detail: { listing: listing, query: query } })
      );
    } catch (e) {}
  }

  function openLightbox(listing) {
    var box = document.getElementById("listingLightbox");
    if (!box || !listing) return;
    var photos = listing.photos || [];
    var imgs = photos
      .map(function (m, i) {
        var label = m.kind === "capture" ? "Capture d'annonce" : "Photo " + (i + 1);
        return (
          '<figure><img src="' +
          esc(m.url) +
          '" alt="' +
          esc(label) +
          '" /><figcaption>' +
          esc(label) +
          "</figcaption></figure>"
        );
      })
      .join("");
    qs(box, "[data-lb-title]").textContent = listing.title || "Bien";
    qs(box, "[data-lb-meta]").textContent = [
      Lib.formatPrice(listing.price_fai),
      listing.rooms ? listing.rooms + " pièces" : "",
      listing.surface_m2 ? listing.surface_m2 + " m²" : "",
      [listing.city, listing.postal_code].filter(Boolean).join(" "),
    ]
      .filter(Boolean)
      .join(" · ");
    qs(box, "[data-lb-desc]").textContent = listing.description || "Pas de description.";
    qs(box, "[data-lb-media]").innerHTML =
      imgs || "<p class='listings-intro'>Aucune photo ni capture pour ce bien.</p>";
    box.hidden = false;
    box.setAttribute("aria-hidden", "false");
  }

  function closeLightbox() {
    var box = document.getElementById("listingLightbox");
    if (!box) return;
    box.hidden = true;
    box.setAttribute("aria-hidden", "true");
  }

  function bindGrid(root, state) {
    root.addEventListener("click", function (e) {
      var view = e.target.closest("[data-listing-view]");
      if (view) {
        var cardV = view.closest("[data-listing-id]");
        var idV = cardV && cardV.getAttribute("data-listing-id");
        var listingV = (state.listings || []).filter(function (p) {
          return p.id === idV;
        })[0];
        openLightbox(listingV);
        return;
      }
      var btn = e.target.closest("[data-listing-interest], [data-listing-alert]");
      if (!btn) return;
      var card = btn.closest("[data-listing-id]");
      var id = card && card.getAttribute("data-listing-id");
      var listing = (state.listings || []).filter(function (p) {
        return p.id === id;
      })[0];
      prefillDossier(listing, queryFromForm(root));
      var dossier = document.getElementById("dossier") || document.getElementById("demande");
      if (dossier) dossier.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function fetchListings(query) {
    var params = new URLSearchParams();
    Object.keys(query).forEach(function (k) {
      if (query[k]) params.set(k, query[k]);
    });
    return fetch("/api/immo-listings?" + params.toString(), { credentials: "same-origin" })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (data && data.ok && Array.isArray(data.listings)) return data;
        throw new Error("bad");
      })
      .catch(function () {
        return { ok: true, source: "crm", listings: [] };
      });
  }

  function init(root) {
    if (!root || root.dataset.listingsBound) return;
    root.dataset.listingsBound = "1";
    applyQueryToForm(root);
    var state = { listings: [], source: "crm" };

    function refresh() {
      var query = queryFromForm(root);
      fetchListings(query).then(function (data) {
        state.listings = data.listings || [];
        state.source = data.source || "demo";
        render(root, state.listings, state.source, query);
      });
    }

    var form = qs(root, "[data-listings-filters]");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        refresh();
      });
      form.addEventListener("change", refresh);
    }
    qsa(root, 'input[name="listingType"]').forEach(function (el) {
      el.addEventListener("change", refresh);
    });
    bindGrid(root, state);
    refresh();
    document.addEventListener("lo:listing-submitted", refresh);
    var lb = document.getElementById("listingLightbox");
    if (lb && !lb.dataset.bound) {
      lb.dataset.bound = "1";
      lb.addEventListener("click", function (e) {
        if (e.target === lb || e.target.closest("[data-lb-close]")) closeLightbox();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeLightbox();
      });
    }
  }

  function boot() {
    qsa(document, "[data-immo-search]").forEach(init);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
