/**
 * Fiche publique d'un bien collé (URL Leboncoin etc.) — visualisation sur notre site.
 */
(function () {
  var Lib = window.ImmoPublicListings;
  var Portals = window.ImmoListingPortals;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setMeta(prop, content) {
    if (!content) return;
    var el = document.querySelector('meta[property="' + prop + '"]');
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("property", prop);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  }

  function render(listing) {
    var mount = document.getElementById("annonceMount");
    if (!mount || !Lib) return;
    var cover = listing.cover && listing.cover.url;
    var loc = [listing.city, listing.postal_code].filter(Boolean).join(" ");
    var stats = [];
    if (listing.rooms) stats.push(listing.rooms + " pièces");
    if (listing.surface_m2) stats.push(listing.surface_m2 + " m²");
    if (listing.bedrooms) stats.push(listing.bedrooms + " chambres");
    if (listing.dpe) stats.push("DPE " + listing.dpe);
    var portalLabel =
      listing.portal_label ||
      (Portals && listing.portal ? Portals.labelFor(listing.portal) : listing.portal) ||
      "";
    var gallery = (listing.photos || [])
      .map(function (m, i) {
        return (
          '<figure><img src="' +
          esc(m.url) +
          '" alt="' +
          (m.kind === "capture" ? "Capture d'annonce" : "Photo " + (i + 1)) +
          '" /></figure>'
        );
      })
      .join("");
    var origin = "";
    if (listing.source_url) {
      origin =
        '<div class="annonce-origin"><p>Annonce d\'origine' +
        (portalLabel ? " · " + esc(portalLabel) : "") +
        "</p><p><a href=\"" +
        esc(listing.source_url) +
        '" rel="noopener nofollow" target="_blank">Ouvrir le lien d\'origine</a></p></div>';
    } else if (portalLabel) {
      origin = '<div class="annonce-origin"><p>Source : ' + esc(portalLabel) + "</p></div>";
    }

    document.title = (listing.title || "Fiche bien") + " | Leads Opportunities";
    setMeta("og:title", listing.title || "Fiche bien");
    setMeta("og:description", (listing.description || loc || "Annonce immobilière").slice(0, 180));
    setMeta("og:url", "https://www.leadsopportunities.fr/annonce.html?id=" + encodeURIComponent(listing.id));
    if (cover && /^https:\/\//i.test(cover)) setMeta("og:image", cover);

    mount.innerHTML =
      '<article class="listing-card">' +
      '<div class="listing-card-media' +
      (cover ? " has-photo" : "") +
      '" data-type="' +
      esc(listing.property_type) +
      '">' +
      (cover ? '<img class="listing-card-cover" src="' + esc(cover) + '" alt="" />' : "") +
      '<span class="listing-card-price">' +
      esc(Lib.formatPrice(listing.price_fai)) +
      "</span>" +
      '<span class="listing-card-type">' +
      esc(listing.type_label || "Bien") +
      " à vendre</span></div>" +
      '<div class="listing-card-body"><h1 style="margin:0 0 6px;font-size:1.35rem">' +
      esc(listing.title) +
      "</h1>" +
      '<p class="listing-card-loc">' +
      esc(loc || "France") +
      "</p>" +
      (stats.length ? '<div class="listing-card-stats">' + esc(stats.join(" · ")) + "</div>" : "") +
      (listing.description ? '<p class="listing-card-desc">' + esc(listing.description) + "</p>" : "") +
      "</div></article>" +
      (gallery ? '<div class="annonce-gallery">' + gallery + "</div>" : "") +
      origin +
      '<p style="margin-top:20px"><a class="btn btn-primary" href="./landings/acheteur-immo.html#dossier">Je suis intéressé</a> ' +
      '<a class="btn btn-soft" href="./landings/acheteur-immo.html">Retour à la vitrine</a></p>';
  }

  var params = new URLSearchParams(location.search);
  var id = (params.get("id") || "").trim();
  var mount = document.getElementById("annonceMount");
  if (!id) {
    if (mount) {
      mount.innerHTML =
        '<div class="annonce-missing"><h1>Fiche introuvable</h1><p>Aucun identifiant de bien. <a href="./landings/acheteur-immo.html">Retour à la recherche</a>.</p></div>';
    }
    return;
  }

  fetch("/api/immo-listings?id=" + encodeURIComponent(id), { credentials: "same-origin" })
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      var listing = data && (data.listing || (data.listings && data.listings[0]));
      if (!listing) throw new Error("missing");
      render(listing);
    })
    .catch(function () {
      if (mount) {
        mount.innerHTML =
          '<div class="annonce-missing"><h1>Fiche introuvable</h1><p>Ce bien n\'est pas (encore) visible. <a href="./landings/acheteur-immo.html#deposer-bien">Déposer une URL</a>.</p></div>';
      }
    });
})();
