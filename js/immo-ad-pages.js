/**
 * Rendu vitrine pubs mandats / démo privée.
 */
(function () {
  var AdLib = window.ImmoAdListings;
  var Protect = window.ImmoAdProtect;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function priceOf(p) {
    return AdLib && AdLib.formatPrice ? AdLib.formatPrice(p.price_fai) : p.price_fai != null ? p.price_fai + " €" : "Prix sur demande";
  }

  function facts(p) {
    var parts = [];
    if (p.rooms) parts.push(p.rooms + " pièces");
    if (p.surface_m2) parts.push(p.surface_m2 + " m²");
    if (p.city) parts.push(p.city + (p.postal_code ? " (" + p.postal_code + ")" : ""));
    if (p.type_label) parts.push(p.type_label);
    return parts;
  }

  function coverUrl(p) {
    if (p.cover && p.cover.url) return p.cover.url;
    if (p.photos && p.photos[0]) return typeof p.photos[0] === "string" ? p.photos[0] : p.photos[0].url;
    return "";
  }

  function cardHtml(p) {
    var cover = coverUrl(p);
    var media = cover
      ? '<img src="' + esc(cover) + '" alt="" loading="lazy" draggable="false" />'
      : '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#64748b;font-weight:700">Sans photo</div>';
    return (
      '<article class="immo-ad-card immo-ad-fade-in" data-id="' +
      esc(p.id) +
      '">' +
      '<div class="immo-ad-card__media immo-ad-media">' +
      media +
      '<span class="immo-ad-card__price">' +
      esc(priceOf(p)) +
      "</span></div>" +
      '<div class="immo-ad-card__body">' +
      "<h2>" +
      esc(p.headline || p.title) +
      "</h2>" +
      '<p class="immo-ad-card__meta">' +
      esc(facts(p).join(" · ")) +
      "</p>" +
      (p.description ? '<p class="immo-ad-card__desc">' + esc(p.description) + "</p>" : "") +
      '<div class="immo-ad-card__tags">' +
      (p.videos && p.videos.length ? "<span>Vidéo</span>" : "") +
      (p.virtual_tour ? "<span>Visite virtuelle</span>" : "") +
      "</div></div></article>"
    );
  }

  function detailHtml(p, privateMode) {
    var photos = p.photos || [];
    var main = coverUrl(p);
    var thumbs = photos
      .map(function (ph, i) {
        var url = typeof ph === "string" ? ph : ph.url;
        return (
          '<button type="button" class="' +
          (i === 0 ? "is-active" : "") +
          '" data-src="' +
          esc(url) +
          '"><img src="' +
          esc(url) +
          '" alt="" draggable="false" /></button>'
        );
      })
      .join("");
    var mediaLinks = "";
    if (p.videos && p.videos.length) {
      mediaLinks += p.videos
        .map(function (v, i) {
          return (
            '<a class="btn btn-outline" href="' +
            esc(v) +
            '" target="_blank" rel="noopener noreferrer">Vidéo ' +
            (i + 1) +
            "</a>"
          );
        })
        .join("");
    }
    if (p.virtual_tour) {
      mediaLinks +=
        '<a class="btn btn-primary" href="' +
        esc(p.virtual_tour) +
        '" target="_blank" rel="noopener noreferrer">Visite virtuelle</a>';
    }
    var platforms =
      privateMode && p.platforms && p.platforms.length
        ? '<div class="immo-ad-platforms"><h3>' +
          esc(p.demo_label || "Diffusion prévue") +
          "</h3><ul>" +
          p.platforms
            .map(function (x) {
              return "<li>" + esc(x) + "</li>";
            })
            .join("") +
          "</ul><p style=\"font-size:.85rem;color:#64748b;margin:8px 0 0\">Exemple de créa telle qu’elle pourrait paraître sur vos canaux — contenu protégé, non téléchargeable.</p></div>"
        : "";

    return (
      '<div class="immo-ad-detail immo-ad-fade-in">' +
      '<div class="immo-ad-gallery">' +
      '<div class="immo-ad-gallery__main immo-ad-media">' +
      (main
        ? '<img id="adMainImg" src="' + esc(main) + '" alt="" draggable="false" />'
        : "<div style='padding:40px;text-align:center;color:#64748b'>Sans photo</div>") +
      "</div>" +
      (thumbs ? '<div class="immo-ad-gallery__thumbs" id="adThumbs">' + thumbs + "</div>" : "") +
      "</div>" +
      '<div class="immo-ad-info">' +
      "<h2>" +
      esc(p.headline || p.title) +
      '</h2><p class="price">' +
      esc(priceOf(p)) +
      '</p><div class="facts">' +
      facts(p)
        .map(function (f) {
          return "<span>" + esc(f) + "</span>";
        })
        .join("") +
      '</div><div class="body">' +
      esc(p.description || "") +
      "</div>" +
      (mediaLinks ? '<div class="immo-ad-media-links">' + mediaLinks + "</div>" : "") +
      platforms +
      "</div></div>"
    );
  }

  function bindGallery(root) {
    var main = root.querySelector("#adMainImg");
    var thumbs = root.querySelector("#adThumbs");
    if (!main || !thumbs) return;
    thumbs.querySelectorAll("[data-src]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        main.src = btn.getAttribute("data-src");
        thumbs.querySelectorAll("button").forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
      });
    });
  }

  function fetchPublicAds() {
    return fetch("/api/immo-ads")
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (data && data.ok && Array.isArray(data.listings)) return data.listings;
        return [];
      })
      .catch(function () {
        return [];
      });
  }

  function fetchPrivateAd(token) {
    return fetch("/api/immo-ads?token=" + encodeURIComponent(token))
      .then(function (r) {
        return r.json().then(function (data) {
          return { status: r.status, data: data };
        });
      })
      .catch(function () {
        return { status: 0, data: null };
      });
  }

  /** Fallback local (même navigateur CRM) si API vide / hors ligne */
  function localPublicAds() {
    try {
      var raw = localStorage.getItem("lo_crm_immo_v1");
      var db = raw ? JSON.parse(raw) : null;
      if (!db || !AdLib) return [];
      return AdLib.filterPublicAds(db.properties || []);
    } catch (e) {
      return [];
    }
  }

  function localPrivateAd(token) {
    try {
      var raw = localStorage.getItem("lo_crm_immo_v1");
      var db = raw ? JSON.parse(raw) : null;
      if (!db || !AdLib) return null;
      var found = AdLib.findByShareToken(db.properties || [], token);
      return found ? AdLib.toAdListing(found) : null;
    } catch (e) {
      return null;
    }
  }

  function bootPublic() {
    var grid = document.getElementById("adGrid");
    var detail = document.getElementById("adDetail");
    var empty = document.getElementById("adEmpty");
    if (!grid) return;
    var params = new URLSearchParams(location.search);
    var focusId = params.get("id");

    fetchPublicAds().then(function (listings) {
      if (!listings.length) listings = localPublicAds();
      if (!listings.length) {
        if (empty) empty.hidden = false;
        grid.innerHTML = "";
        return;
      }
      if (empty) empty.hidden = true;
      if (focusId) {
        var one = listings.filter(function (l) {
          return l.id === focusId;
        })[0];
        if (one && detail) {
          detail.innerHTML = detailHtml(one, false);
          bindGallery(detail);
          grid.innerHTML = listings
            .filter(function (l) {
              return l.id !== focusId;
            })
            .map(cardHtml)
            .join("");
        } else {
          grid.innerHTML = listings.map(cardHtml).join("");
        }
      } else {
        grid.innerHTML = listings.map(cardHtml).join("");
      }
      grid.querySelectorAll("[data-id]").forEach(function (card) {
        card.style.cursor = "pointer";
        card.addEventListener("click", function () {
          location.search = "?id=" + encodeURIComponent(card.getAttribute("data-id"));
        });
      });
      if (Protect) Protect.attach(document.getElementById("adProtectRoot") || document.body, { watermark: false });
    });
  }

  function bootPrivate() {
    var root = document.getElementById("adProtectRoot") || document.body;
    var mount = document.getElementById("adDetail");
    var err = document.getElementById("adError");
    var token = new URLSearchParams(location.search).get("token") || "";
    if (!token) {
      if (err) {
        err.hidden = false;
        err.textContent = "Lien invalide : token manquant. Demandez le lien démo à votre conseiller.";
      }
      return;
    }
    if (Protect) Protect.attach(root, { watermark: true });

    fetchPrivateAd(token).then(function (res) {
      var listing = res.data && res.data.listing;
      if (!listing) listing = localPrivateAd(token);
      if (!listing) {
        if (err) {
          err.hidden = false;
          err.textContent = "Cette démonstration est introuvable ou n’est plus active.";
        }
        return;
      }
      if (err) err.hidden = true;
      if (mount) {
        mount.innerHTML = detailHtml(listing, true);
        bindGallery(mount);
      }
    });
  }

  window.ImmoAdPages = { bootPublic: bootPublic, bootPrivate: bootPrivate };
})();
