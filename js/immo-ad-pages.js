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
    var hasTour = !!(p.virtual_tour || p.has_virtual_tour || p.tour_gate || p.tour_href);
    return (
      '<article class="immo-ad-card immo-ad-fade-in" data-id="' +
      esc(p.id) +
      '" data-tour="' +
      (hasTour ? "1" : "0") +
      '">' +
      '<div class="immo-ad-card__media immo-ad-media">' +
      media +
      '<span class="immo-ad-card__price">' +
      esc(priceOf(p)) +
      "</span>" +
      (hasTour ? '<span class="immo-ad-card__tour-badge">Visite 3D</span>' : "") +
      "</div>" +
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
      (hasTour ? "<span>Visite virtuelle (accès vérifié)</span>" : "") +
      "</div></div></article>"
    );
  }

  var EMPTY = "L'info n'a pas été renseignée";

  function valOrEmpty(v, suffix) {
    if (v == null || v === "" || (typeof v === "number" && !isFinite(v))) return EMPTY;
    return suffix ? v + suffix : String(v);
  }

  function yesNoOrEmpty(flag) {
    if (flag === true) return "Oui";
    if (flag === false) return "Non";
    return EMPTY;
  }

  function criteriaRows(p) {
    return [
      { label: "Type de bien", value: valOrEmpty(p.type_label) },
      { label: "Ville", value: valOrEmpty(p.city) },
      { label: "Code postal", value: valOrEmpty(p.postal_code) },
      { label: "Surface", value: p.surface_m2 != null ? p.surface_m2 + " m²" : EMPTY },
      { label: "Nombre de pièces", value: p.rooms != null ? String(p.rooms) : EMPTY },
      { label: "Chambres", value: p.bedrooms != null ? String(p.bedrooms) : EMPTY },
      { label: "Étage", value: valOrEmpty(p.floor) },
      { label: "Ascenseur", value: yesNoOrEmpty(p.has_elevator) },
      { label: "Parking", value: yesNoOrEmpty(p.has_parking) },
      { label: "Garage", value: yesNoOrEmpty(p.has_garage) },
      { label: "Cave", value: yesNoOrEmpty(p.has_cave) },
      { label: "Balcon", value: yesNoOrEmpty(p.has_balcony) },
      { label: "Terrasse", value: yesNoOrEmpty(p.has_terrace) },
      { label: "Jardin", value: yesNoOrEmpty(p.has_garden) },
      { label: "Classe énergie (DPE)", value: valOrEmpty(p.dpe) },
      { label: "GES", value: valOrEmpty(p.ges) },
      { label: "Chauffage", value: valOrEmpty(p.heating) },
      {
        label: "Charges / an",
        value: p.charges != null && p.charges !== "" ? Number(p.charges).toLocaleString("fr-FR") + " €" : EMPTY,
      },
      {
        label: "Coût énergie estimé",
        value:
          p.energy_cost != null && p.energy_cost !== ""
            ? Number(p.energy_cost).toLocaleString("fr-FR") + " €"
            : EMPTY,
      },
      { label: "Année de construction", value: p.year_built != null && p.year_built !== "" ? String(p.year_built) : EMPTY },
      { label: "Meublé", value: yesNoOrEmpty(p.furnished) },
      { label: "Vidéo", value: p.videos && p.videos.length ? p.videos.length + " lien(s)" : EMPTY },
      { label: "Visite virtuelle", value: p.virtual_tour || p.has_virtual_tour || p.tour_gate ? "Oui" : EMPTY },
    ];
  }

  function detailHtml(p, privateMode, opts) {
    opts = opts || {};
    var adminMode = !!opts.admin;
    var photos = p.photos || [];
    var main = coverUrl(p);
    var count = photos.length;
    var thumbs = photos
      .map(function (ph, i) {
        var url = typeof ph === "string" ? ph : ph.url;
        return (
          '<button type="button" class="' +
          (i === 0 ? "is-active" : "") +
          '" data-src="' +
          esc(url) +
          '" data-idx="' +
          i +
          '"><img src="' +
          esc(url) +
          '" alt="Photo ' +
          (i + 1) +
          '" draggable="false" /></button>'
        );
      })
      .join("");

    var criteriaHtml = criteriaRows(p)
      .map(function (row) {
        var empty = row.value === EMPTY;
        return (
          '<div class="lbc-crit' +
          (empty ? " is-empty" : "") +
          '"><dt>' +
          esc(row.label) +
          "</dt><dd>" +
          esc(row.value) +
          "</dd></div>"
        );
      })
      .join("");
    var emptyCount = criteriaRows(p).filter(function (row) {
      return row.value === EMPTY;
    }).length;
    var criteriaHint =
      emptyCount > 0
        ? '<p class="lbc-criteria-hint">Champs non renseignés : à compléter via le <strong>questionnaire fiche interlocuteur</strong> ou <a href="/crm-immo-pubs.html?new=1">crm-immo-pubs</a>.</p>'
        : "";

    var mediaLinks = "";
    if (p.listing_url) {
      mediaLinks +=
        '<a class="btn btn-outline" href="' +
        esc(p.listing_url) +
        '" target="_blank" rel="noopener noreferrer">Annonce Leboncoin / portail</a>';
    }
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
    if (p.tour_gate && p.tour_href) {
      mediaLinks +=
        '<a class="btn btn-primary" href="' +
        esc(p.tour_href) +
        '">' +
        esc(p.tour_name || "Visite virtuelle 3D (acquéreur)") +
        "</a>";
    } else if (p.virtual_tour) {
      mediaLinks +=
        '<a class="btn btn-primary" href="' +
        esc(p.virtual_tour) +
        '" target="_blank" rel="noopener noreferrer">Visite virtuelle 3D</a>';
    }

    var platforms =
      privateMode && p.platforms && p.platforms.length
        ? '<div class="immo-ad-platforms"><h3>' +
          esc(p.demo_label || "Capacité de diffusion") +
          "</h3><ul>" +
          p.platforms
            .map(function (x) {
              return "<li>" + esc(x) + "</li>";
            })
            .join("") +
          "</ul><p class=\"lbc-note\">Exemple de créa telle qu’elle pourrait paraître sur vos canaux — contenu protégé, non téléchargeable.</p></div>"
        : "";

    var desc = String(p.description || "").trim();

    return (
      '<article class="lbc-listing immo-ad-fade-in">' +
      '<div class="lbc-gallery">' +
      '<div class="lbc-gallery__stage immo-ad-media">' +
      (main
        ? '<img id="adMainImg" src="' + esc(main) + '" alt="' + esc(p.headline || p.title || "Annonce") + '" draggable="false" />' +
          '<button type="button" class="lbc-zoom-hint" id="adZoomOpen" aria-label="Agrandir la photo">🔍 Agrandir</button>'
        : '<div class="lbc-gallery__empty' +
          (adminMode ? " lbc-gallery__empty--admin" : "") +
          '"><span>Aucune photo renseignée</span>' +
          (adminMode
            ? '<div class="lbc-gallery__admin-retry" id="adPhotoDropZone">' +
              '<p class="lbc-gallery__admin-help">Ajoutez les photos de <strong>votre</strong> annonce ici (fichiers ou glisser-déposer).</p>' +
              '<input type="file" id="adPhotoFileInput" accept="image/*" multiple hidden />' +
              '<div class="lbc-gallery__admin-actions">' +
              '<button type="button" class="btn btn-primary btn-sm" id="btnPickListingPhotos">Ajouter des photos</button>' +
              (p.listing_url
                ? '<a class="btn btn-ghost btn-sm" id="btnOpenListingForPhotos" href="' +
                  esc(p.listing_url) +
                  '" target="_blank" rel="noopener">Ouvrir l’annonce Leboncoin</a>'
                : "") +
              '<button type="button" class="btn btn-ghost btn-sm" id="btnRetryListingPhotos">Essayer auto</button>' +
              "</div>" +
              '<details class="lbc-gallery__admin-advanced">' +
              "<summary>Coller des liens images (optionnel)</summary>" +
              '<textarea id="adPhotoPasteBox" class="lbc-gallery__admin-paste" rows="3" placeholder="https://img.leboncoin.fr/…&#10;une URL par ligne"></textarea>' +
              '<button type="button" class="btn btn-ghost btn-sm" id="btnImportPastedPhotos">Importer les liens</button>' +
              "</details>" +
              '<p class="lbc-gallery__admin-status" id="adPhotoRetryStatus" role="status"></p>' +
              "</div>"
            : "") +
          "</div>") +
      (count
        ? '<button type="button" class="lbc-nav lbc-nav--prev" id="adPrev" aria-label="Photo précédente">‹</button>' +
          '<button type="button" class="lbc-nav lbc-nav--next" id="adNext" aria-label="Photo suivante">›</button>' +
          '<span class="lbc-counter" id="adCounter">1 / ' +
          count +
          "</span>"
        : "") +
      "</div>" +
      (thumbs ? '<div class="lbc-gallery__thumbs" id="adThumbs">' + thumbs + "</div>" : "") +
      "</div>" +
      '<header class="lbc-head">' +
      "<h2>" +
      esc(p.headline || p.title || EMPTY) +
      '</h2><p class="lbc-price">' +
      esc(priceOf(p)) +
      '</p><p class="lbc-loc">' +
      esc(
        [p.type_label, p.city, p.postal_code ? "(" + p.postal_code + ")" : ""]
          .filter(Boolean)
          .join(" · ") || EMPTY
      ) +
      "</p></header>" +
      '<section class="lbc-section immo-ad-price-offer" data-price-offer data-property-id="' +
      esc(p.id || "") +
      '" data-asking="' +
      esc(p.price_fai != null ? p.price_fai : "") +
      '">' +
      "<h3>Combien seriez-vous prêt(e) à donner ?</h3>" +
      "<p>Estimation indicative basée sur le prix affiché" +
      (p.price_fai ? " (<strong>" + esc(priceOf(p)) + "</strong>)" : "") +
      ". Une seule proposition par connexion (anti-abus). Commentaires facultatifs.</p>" +
      '<form class="tour-price-offer-form" data-price-offer-form novalidate>' +
      '<input type="text" name="_hp" tabindex="-1" autocomplete="off" aria-hidden="true" class="tour-contact-hp" />' +
      '<label>Montant (€) *<input name="amount" type="text" inputmode="numeric" required placeholder="Ex. 185000" /></label>' +
      '<p class="tour-price-warn" data-price-warn hidden></p>' +
      '<div class="tour-price-comments">' +
      '<label>Point positif <span class="muted">(facultatif)</span><textarea name="comment_plus" rows="2" maxlength="600" placeholder="Ce que vous aimez…"></textarea></label>' +
      '<label>Point négatif <span class="muted">(facultatif)</span><textarea name="comment_moins" rows="2" maxlength="600" placeholder="Ce qui freine…"></textarea></label>' +
      "</div>" +
      '<div class="gate-actions"><button type="submit" class="btn btn-primary">Envoyer mon estimation</button></div>' +
      '<p class="gate-msg" data-price-msg role="status"></p>' +
      "</form></section>" +
      '<section class="lbc-section"><h3>Critères</h3><dl class="lbc-criteria">' +
      criteriaHtml +
      "</dl>" +
      criteriaHint +
      "</section>" +      '<section class="lbc-section"><h3>Description</h3><div class="lbc-desc' +
      (desc ? "" : " is-empty") +
      '">' +
      esc(desc || EMPTY) +
      "</div></section>" +
      (mediaLinks
        ? '<section class="lbc-section"><h3>Médias</h3><div class="immo-ad-media-links">' + mediaLinks + "</div></section>"
        : '<section class="lbc-section"><h3>Médias</h3><p class="lbc-desc is-empty">' +
          esc(EMPTY) +
          "</p></section>") +
      platforms +
      "</article>"
    );
  }

  function bindGallery(root) {
    var main = root.querySelector("#adMainImg");
    var thumbs = root.querySelector("#adThumbs");
    var counter = root.querySelector("#adCounter");
    var buttons = thumbs ? Array.prototype.slice.call(thumbs.querySelectorAll("[data-src]")) : [];
    if (!main) return;

    var urls = buttons.length
      ? buttons.map(function (b) {
          return b.getAttribute("data-src");
        })
      : [main.getAttribute("src")].filter(Boolean);
    if (!urls.length) return;

    var idx = 0;

    function show(i) {
      if (i < 0) i = urls.length - 1;
      if (i >= urls.length) i = 0;
      idx = i;
      main.src = urls[idx];
      buttons.forEach(function (b, j) {
        b.classList.toggle("is-active", j === idx);
      });
      if (counter) counter.textContent = idx + 1 + " / " + urls.length;
    }

    buttons.forEach(function (btn, i) {
      btn.addEventListener("click", function () {
        show(i);
      });
    });
    var prev = root.querySelector("#adPrev");
    var next = root.querySelector("#adNext");
    if (prev)
      prev.addEventListener("click", function (e) {
        e.stopPropagation();
        show(idx - 1);
      });
    if (next)
      next.addEventListener("click", function (e) {
        e.stopPropagation();
        show(idx + 1);
      });

    function openLightbox(startIdx) {
      idx = startIdx != null ? startIdx : idx;
      var existing = document.getElementById("lbcLightbox");
      if (existing) existing.remove();

      var lb = document.createElement("div");
      lb.id = "lbcLightbox";
      lb.className = "lbc-lightbox";
      lb.innerHTML =
        '<div class="lbc-lightbox__bar">' +
        '<span id="lbCounter">' +
        (idx + 1) +
        " / " +
        urls.length +
        "</span>" +
        '<div class="lbc-lightbox__tools">' +
        '<button type="button" id="lbZoomOut" aria-label="Zoom arrière">−</button>' +
        '<button type="button" id="lbZoomIn" aria-label="Zoom avant">+</button>' +
        '<button type="button" id="lbZoomReset" aria-label="Réinitialiser">1:1</button>' +
        '<button type="button" id="lbClose" aria-label="Fermer">✕</button>' +
        "</div></div>" +
        '<button type="button" class="lbc-lightbox__nav lbc-lightbox__nav--prev" id="lbPrev" aria-label="Précédente">‹</button>' +
        '<button type="button" class="lbc-lightbox__nav lbc-lightbox__nav--next" id="lbNext" aria-label="Suivante">›</button>' +
        '<div class="lbc-lightbox__viewport" id="lbViewport">' +
        '<img id="lbImg" src="' +
        esc(urls[idx]) +
        '" alt="" draggable="false" />' +
        "</div>" +
        '<p class="lbc-lightbox__hint">Cliquez sur la photo pour agrandir encore · glisser pour déplacer · Échap pour fermer</p>';

      document.body.appendChild(lb);
      document.body.classList.add("lbc-lightbox-open");

      var img = lb.querySelector("#lbImg");
      var viewport = lb.querySelector("#lbViewport");
      var scale = 1;
      var tx = 0;
      var ty = 0;
      var dragging = false;
      var didDrag = false;
      var lastX = 0;
      var lastY = 0;
      var startX = 0;
      var startY = 0;
      var MAX = 6;
      var MIN = 1;
      var ZOOM_STEPS = [1, 2.2, 3.5, 5, 6];

      function applyTransform() {
        img.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + scale + ")";
      }

      function setScale(next, cx, cy) {
        var prev = scale;
        scale = Math.max(MIN, Math.min(MAX, next));
        if (cx != null && cy != null && prev > 0) {
          var rect = viewport.getBoundingClientRect();
          var mx = cx - rect.left - rect.width / 2;
          var my = cy - rect.top - rect.height / 2;
          tx = mx - ((mx - tx) * scale) / prev;
          ty = my - ((my - ty) * scale) / prev;
        }
        if (scale === 1) {
          tx = 0;
          ty = 0;
        }
        applyTransform();
        img.classList.toggle("is-zoomed", scale > 1.01);
        img.style.cursor = scale > 1.01 ? "zoom-in" : "zoom-in";
      }

      function nextZoomStep(cx, cy) {
        var next = ZOOM_STEPS[0];
        for (var i = 0; i < ZOOM_STEPS.length; i++) {
          if (scale < ZOOM_STEPS[i] - 0.05) {
            next = ZOOM_STEPS[i];
            break;
          }
          if (i === ZOOM_STEPS.length - 1) next = 1;
        }
        setScale(next, cx, cy);
      }

      function syncLb() {
        img.src = urls[idx];
        lb.querySelector("#lbCounter").textContent = idx + 1 + " / " + urls.length;
        setScale(1);
        show(idx);
      }

      function close() {
        document.removeEventListener("keydown", onKey, true);
        lb.remove();
        document.body.classList.remove("lbc-lightbox-open");
      }

      function onKey(e) {
        if (e.key === "Escape") close();
        if (e.key === "ArrowLeft") {
          idx = (idx - 1 + urls.length) % urls.length;
          syncLb();
        }
        if (e.key === "ArrowRight") {
          idx = (idx + 1) % urls.length;
          syncLb();
        }
        if (e.key === "+" || e.key === "=") setScale(scale + 0.5);
        if (e.key === "-") setScale(scale - 0.5);
      }

      lb.querySelector("#lbClose").onclick = close;
      lb.querySelector("#lbZoomIn").onclick = function () {
        setScale(scale + 0.6);
      };
      lb.querySelector("#lbZoomOut").onclick = function () {
        setScale(scale - 0.6);
      };
      lb.querySelector("#lbZoomReset").onclick = function () {
        setScale(1);
      };
      lb.querySelector("#lbPrev").onclick = function () {
        idx = (idx - 1 + urls.length) % urls.length;
        syncLb();
      };
      lb.querySelector("#lbNext").onclick = function () {
        idx = (idx + 1) % urls.length;
        syncLb();
      };

      viewport.addEventListener(
        "wheel",
        function (e) {
          e.preventDefault();
          var delta = e.deltaY < 0 ? 0.35 : -0.35;
          setScale(scale + delta * scale, e.clientX, e.clientY);
        },
        { passive: false }
      );

      // Clic simple sur la photo = agrandir encore (ou revenir à 1:1 au max)
      img.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (didDrag) {
          didDrag = false;
          return;
        }
        nextZoomStep(e.clientX, e.clientY);
      });

      img.addEventListener("dblclick", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (scale > 1.5) setScale(1);
        else setScale(MAX, e.clientX, e.clientY);
      });

      viewport.addEventListener("pointerdown", function (e) {
        if (e.target !== img && e.target !== viewport) return;
        dragging = scale > 1.01;
        didDrag = false;
        lastX = e.clientX;
        lastY = e.clientY;
        startX = e.clientX;
        startY = e.clientY;
        if (dragging) {
          viewport.setPointerCapture(e.pointerId);
          viewport.classList.add("is-dragging");
        }
      });
      viewport.addEventListener("pointermove", function (e) {
        if (Math.hypot(e.clientX - startX, e.clientY - startY) > 6) didDrag = true;
        if (!dragging) return;
        tx += e.clientX - lastX;
        ty += e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        applyTransform();
      });
      function endDrag(e) {
        dragging = false;
        viewport.classList.remove("is-dragging");
        try {
          viewport.releasePointerCapture(e.pointerId);
        } catch (err) {}
      }
      viewport.addEventListener("pointerup", endDrag);
      viewport.addEventListener("pointercancel", endDrag);

      // pinch zoom (mobile)
      var pinchStart = 0;
      var pinchScale = 1;
      viewport.addEventListener(
        "touchstart",
        function (e) {
          if (e.touches.length === 2) {
            var dx = e.touches[0].clientX - e.touches[1].clientX;
            var dy = e.touches[0].clientY - e.touches[1].clientY;
            pinchStart = Math.hypot(dx, dy);
            pinchScale = scale;
          }
        },
        { passive: true }
      );
      viewport.addEventListener(
        "touchmove",
        function (e) {
          if (e.touches.length === 2 && pinchStart) {
            e.preventDefault();
            var dx = e.touches[0].clientX - e.touches[1].clientX;
            var dy = e.touches[0].clientY - e.touches[1].clientY;
            var dist = Math.hypot(dx, dy);
            setScale(pinchScale * (dist / pinchStart));
          }
        },
        { passive: false }
      );

      lb.addEventListener("click", function (e) {
        if (e.target === lb) {
          if (scale > 1.05) setScale(1);
          else close();
        } else if (e.target === viewport) {
          // clic autour de la photo : agrandir aussi
          if (!didDrag) nextZoomStep(e.clientX, e.clientY);
          didDrag = false;
        }
      });

      document.addEventListener("keydown", onKey, true);
      applyTransform();
    }

    main.style.cursor = "zoom-in";
    main.addEventListener("click", function () {
      openLightbox(idx);
    });
    var zoomBtn = root.querySelector("#adZoomOpen");
    if (zoomBtn) {
      zoomBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        openLightbox(idx);
      });
    }
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

  function fetchPrivateAd(token, grant, opts) {
    opts = opts || {};
    var q = "/api/immo-ads?token=" + encodeURIComponent(token);
    if (grant) q += "&grant=" + encodeURIComponent(grant);
    var headers = {};
    if (opts.admin) {
      var crmTok = "";
      try {
        crmTok = localStorage.getItem("lo_token") || "";
      } catch (e) {}
      if (crmTok) headers.Authorization = "Bearer " + crmTok;
    }
    return fetch(q, { headers: headers, credentials: "same-origin" })
      .then(function (r) {
        return r.json().then(function (data) {
          return { status: r.status, data: data };
        });
      })
      .catch(function () {
        return { status: 0, data: null };
      });
  }

  function grantStorageKey(token) {
    return "lo_immo_demo_grant_" + token;
  }

  function renderGate(methods, token, onUnlocked) {
    var gate = document.getElementById("adGate");
    if (!gate) return;
    methods = methods && methods.length ? methods : ["email", "phone"];
    var mode = methods.indexOf("email") !== -1 ? "email" : "phone";
    gate.hidden = false;

    function paint() {
      var tabs =
        methods.length > 1
          ? '<div class="gate-tabs">' +
            (methods.indexOf("email") !== -1
              ? '<button type="button" data-mode="email" class="' + (mode === "email" ? "is-active" : "") + '">E-mail</button>'
              : "") +
            (methods.indexOf("phone") !== -1
              ? '<button type="button" data-mode="phone" class="' + (mode === "phone" ? "is-active" : "") + '">Téléphone</button>'
              : "") +
            "</div>"
          : "";
      var field =
        mode === "phone"
          ? '<label>Téléphone autorisé<input id="gateContact" type="tel" inputmode="tel" placeholder="06 12 34 56 78" autocomplete="tel" /></label>'
          : '<label>E-mail autorisé<input id="gateContact" type="email" placeholder="vous@exemple.fr" autocomplete="email" /></label>';
      gate.innerHTML =
        "<h2>Accès à la démo</h2><p>Cette visualisation est réservée aux contacts liés par votre conseiller. Recevez un code à 6 chiffres pour continuer.</p>" +
        tabs +
        field +
        '<label>Code à 6 chiffres<input id="gateCode" type="text" inputmode="numeric" maxlength="6" placeholder="••••••" autocomplete="one-time-code" /></label>' +
        '<div class="gate-actions">' +
        '<button type="button" class="btn btn-primary" id="gateRequest">Recevoir le code</button>' +
        '<button type="button" class="btn btn-outline" id="gateVerify">Valider et voir</button>' +
        '</div><p class="gate-msg" id="gateMsg"></p>';

      gate.querySelectorAll("[data-mode]").forEach(function (btn) {
        btn.onclick = function () {
          mode = btn.getAttribute("data-mode");
          paint();
        };
      });

      function gateMsg(text, ok) {
        var el = document.getElementById("gateMsg");
        if (!el) return;
        el.textContent = text || "";
        el.style.color = ok ? "#166534" : "#9a3412";
      }

      document.getElementById("gateRequest").onclick = function () {
        var contact = document.getElementById("gateContact").value.trim();
        var payload = { action: "request_code", token: token };
        if (mode === "email") payload.email = contact;
        else payload.phone = contact;
        gateMsg("Envoi du code…");
        fetch("/api/immo-ad-demo-access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
          .then(function (r) {
            return r.json().then(function (d) {
              return { status: r.status, d: d };
            });
          })
          .then(function (res) {
            if (res.d && res.d.ok) gateMsg(res.d.message || "Code envoyé.", true);
            else gateMsg((res.d && res.d.error) || "Impossible d’envoyer le code.");
          })
          .catch(function () {
            gateMsg("Erreur réseau.");
          });
      };

      document.getElementById("gateVerify").onclick = function () {
        var contact = document.getElementById("gateContact").value.trim();
        var code = document.getElementById("gateCode").value.trim();
        var payload = { action: "verify_code", token: token, code: code };
        if (mode === "email") payload.email = contact;
        else payload.phone = contact;
        gateMsg("Vérification…");
        fetch("/api/immo-ad-demo-access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
          .then(function (r) {
            return r.json().then(function (d) {
              return { status: r.status, d: d };
            });
          })
          .then(function (res) {
            if (res.d && res.d.ok && res.d.grant) {
              try {
                sessionStorage.setItem(grantStorageKey(token), res.d.grant);
              } catch (e) {}
              gate.hidden = true;
              onUnlocked(res.d.listing, res.d.grant);
            } else {
              gateMsg((res.d && res.d.error) || "Code incorrect.");
            }
          })
          .catch(function () {
            gateMsg("Erreur réseau.");
          });
      };
    }

    paint();
  }

  function isCrmAdminSession() {
    try {
      return !!(localStorage.getItem("lo_token") || "").trim();
    } catch (e) {
      return false;
    }
  }

  function setPhotoRetryStatus(text, ok) {
    var el = document.getElementById("adPhotoRetryStatus");
    if (!el) return;
    el.textContent = text || "";
    el.classList.toggle("is-ok", !!ok);
    el.classList.toggle("is-err", text && !ok);
  }

  function applyAdminPhotos(listing, photoUrls, hint) {
    var urls = Array.isArray(photoUrls) ? photoUrls : [];
    if (!urls.length) {
      setPhotoRetryStatus(hint || "Aucune photo détectée.", false);
      return;
    }
    var prev = Array.isArray(listing.photos) ? listing.photos.slice() : [];
    var seen = {};
    var merged = [];
    function push(u) {
      var url = typeof u === "string" ? u : u && u.url;
      if (!url || seen[url]) return;
      seen[url] = true;
      merged.push({ url: url, kind: "photo" });
    }
    urls.forEach(push);
    prev.forEach(push);
    listing.photos = merged.slice(0, 24);
    listing.cover = listing.photos[0] || null;
    setPhotoRetryStatus(hint || urls.length + " photo(s) ajoutée(s).", true);
    showListing(listing, !!listing._privateMode, { admin: true });
  }

  function postListingPhotos(payload) {
    var tok = "";
    try {
      tok = localStorage.getItem("lo_token") || "";
    } catch (e) {}
    if (!tok) {
      return Promise.resolve({ status: 401, data: { error: "Connectez-vous au CRM." } });
    }
    return fetch("/api/immo-listing-photos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + tok,
      },
      body: JSON.stringify(payload),
    }).then(function (r) {
      return r.json().then(function (data) {
        return { status: r.status, data: data };
      });
    });
  }

  function compressAdminFiles(files) {
    var Compress = window.ImmoPhotoCompress;
    var list = Array.prototype.slice.call(files || []).filter(function (f) {
      return f && f.type && f.type.indexOf("image/") === 0;
    });
    if (!list.length) return Promise.resolve([]);
    if (Compress && Compress.compressMany) return Compress.compressMany(list.slice(0, 12));
    return Promise.all(
      list.slice(0, 12).map(function (file) {
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
  }

  function ingestAdminFiles(listing, files) {
    setPhotoRetryStatus("Ajout des photos…", true);
    return compressAdminFiles(files).then(function (urls) {
      var ok = (urls || []).filter(Boolean);
      if (!ok.length) {
        setPhotoRetryStatus("Aucune image valide.", false);
        return;
      }
      return postListingPhotos({
        photo_urls: ok,
        property_id: listing.id || "",
        persist: true,
        url: listing.listing_url || "",
      }).then(function (res) {
        var data = res.data || {};
        if (res.status === 401) {
          applyAdminPhotos(listing, ok, ok.length + " photo(s) ajoutée(s) en local (reconnectez le CRM pour enregistrer).");
          return;
        }
        applyAdminPhotos(
          listing,
          data.photo_urls && data.photo_urls.length ? data.photo_urls : ok,
          data.hint || ok.length + " photo(s) ajoutée(s)."
        );
      });
    });
  }

  function bindAdminPhotoRetry(root, listing) {
    if (!root || !listing) return;
    var btnRetry = root.querySelector("#btnRetryListingPhotos");
    var btnImport = root.querySelector("#btnImportPastedPhotos");
    var btnPick = root.querySelector("#btnPickListingPhotos");
    var fileInput = root.querySelector("#adPhotoFileInput");
    var pasteBox = root.querySelector("#adPhotoPasteBox");
    var dropZone = root.querySelector("#adPhotoDropZone");

    function blockedMsg(data) {
      return (
        (data && data.hint) ||
        "Leboncoin bloque encore la lecture auto. Cliquez « Ajouter des photos » et choisissez les images de votre annonce."
      );
    }

    if (btnPick && fileInput) {
      btnPick.addEventListener("click", function () {
        fileInput.click();
      });
      fileInput.addEventListener("change", function () {
        var files = fileInput.files;
        if (!files || !files.length) return;
        ingestAdminFiles(listing, files).finally(function () {
          fileInput.value = "";
        });
      });
    }

    if (dropZone) {
      ["dragenter", "dragover"].forEach(function (evt) {
        dropZone.addEventListener(evt, function (e) {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.add("is-dragover");
        });
      });
      ["dragleave", "drop"].forEach(function (evt) {
        dropZone.addEventListener(evt, function (e) {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.remove("is-dragover");
        });
      });
      dropZone.addEventListener("drop", function (e) {
        var files = e.dataTransfer && e.dataTransfer.files;
        if (files && files.length) ingestAdminFiles(listing, files);
      });
    }

    // Coller une image (Ctrl+V) directement sur la zone
    root.addEventListener("paste", function (ev) {
      var items = ev.clipboardData && ev.clipboardData.items;
      if (!items || !items.length) return;
      var files = [];
      for (var i = 0; i < items.length; i++) {
        if (items[i].type && items[i].type.indexOf("image/") === 0) {
          var f = items[i].getAsFile();
          if (f) files.push(f);
        }
      }
      if (!files.length) return;
      ev.preventDefault();
      ingestAdminFiles(listing, files);
    });

    if (pasteBox) {
      pasteBox.addEventListener("paste", function (ev) {
        try {
          var html = (ev.clipboardData && ev.clipboardData.getData("text/html")) || "";
          var plain = (ev.clipboardData && ev.clipboardData.getData("text/plain")) || "";
          var Paste = window.ImmoListingPaste;
          if (!Paste || !Paste.extractPhotoUrls) return;
          var found = Paste.extractPhotoUrls(html || plain);
          if (!found.length) return;
          setTimeout(function () {
            var cur = String(pasteBox.value || "").trim();
            pasteBox.value = cur ? cur + "\n" + found.join("\n") : found.join("\n");
            setPhotoRetryStatus(found.length + " lien(s) détecté(s) — cliquez « Importer les liens ».", true);
          }, 0);
        } catch (e) {}
      });
    }

    if (btnImport) {
      btnImport.addEventListener("click", function () {
        var raw = pasteBox ? String(pasteBox.value || "").trim() : "";
        if (!raw) {
          setPhotoRetryStatus("Collez d’abord des liens photos, ou utilisez « Ajouter des photos ».", false);
          return;
        }
        var Paste = window.ImmoListingPaste;
        var localUrls = Paste && Paste.extractPhotoUrls ? Paste.extractPhotoUrls(raw) : [];
        btnImport.disabled = true;
        setPhotoRetryStatus("Import en cours…", true);
        postListingPhotos({
          html: raw,
          photo_urls: localUrls,
          url: listing.listing_url || "",
          property_id: listing.id || "",
          persist: true,
        })
          .then(function (res) {
            btnImport.disabled = false;
            var data = res.data || {};
            if (res.status === 401) {
              setPhotoRetryStatus("Session CRM expirée — reconnectez-vous.", false);
              return;
            }
            var urls = (data.photo_urls && data.photo_urls.length ? data.photo_urls : localUrls) || [];
            if (urls.length) {
              applyAdminPhotos(listing, urls, data.hint || urls.length + " photo(s) importée(s).");
              return;
            }
            setPhotoRetryStatus(data.hint || data.error || "Aucun lien photo reconnu.", false);
          })
          .catch(function () {
            btnImport.disabled = false;
            if (localUrls.length) {
              applyAdminPhotos(listing, localUrls, localUrls.length + " photo(s) importée(s) en local.");
              return;
            }
            setPhotoRetryStatus("Erreur réseau. Réessayez.", false);
          });
      });
    }

    if (btnRetry) {
      btnRetry.addEventListener("click", function () {
        if (!listing.listing_url && !listing.id) {
          setPhotoRetryStatus("Ajoutez d’abord le lien Leboncoin sur la pub CRM.", false);
          return;
        }
        btnRetry.disabled = true;
        setPhotoRetryStatus("Récupération automatique…", true);
        postListingPhotos({
          url: listing.listing_url || "",
          property_id: listing.id || "",
          persist: true,
        })
          .then(function (res) {
            btnRetry.disabled = false;
            var data = res.data || {};
            if (res.status === 401) {
              setPhotoRetryStatus("Session CRM expirée — reconnectez-vous.", false);
              return;
            }
            if (data.blocked) {
              setPhotoRetryStatus(blockedMsg(data), false);
              return;
            }
            if (data.photo_urls && data.photo_urls.length) {
              applyAdminPhotos(listing, data.photo_urls, data.hint);
              return;
            }
            setPhotoRetryStatus(data.hint || data.error || "Aucune photo auto. Utilisez « Ajouter des photos ».", false);
          })
          .catch(function () {
            btnRetry.disabled = false;
            setPhotoRetryStatus("Erreur réseau. Utilisez « Ajouter des photos ».", false);
          });
      });
    }
  }

  function bindPriceOffer(root, listing) {
    var PriceOffer = window.ImmoTourPriceOffer;
    var box = root && root.querySelector("[data-price-offer]");
    if (!box || !PriceOffer) return;
    var form = box.querySelector("[data-price-offer-form]");
    if (!form || form.getAttribute("data-bound") === "1") return;
    form.setAttribute("data-bound", "1");
    var asking =
      Number(box.getAttribute("data-asking")) ||
      (listing && listing.price_fai) ||
      null;
    var amountInp = form.querySelector('[name="amount"]');
    var warn = form.querySelector("[data-price-warn]");
    var msg = form.querySelector("[data-price-msg]");

    function paintWarn() {
      if (!amountInp || !warn) return;
      var amount = PriceOffer.parseAmount(amountInp.value);
      if (amount == null) {
        warn.hidden = true;
        return;
      }
      var a = PriceOffer.assessOffer(amount, asking);
      warn.hidden = !a.warn;
      warn.textContent = a.warn || "";
      warn.className = "tour-price-warn level-" + (a.level || "info");
    }
    if (amountInp) {
      amountInp.addEventListener("input", paintWarn);
      amountInp.addEventListener("change", paintWarn);
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var hp = form.querySelector('[name="_hp"]');
      if (hp && hp.value) {
        if (msg) {
          msg.textContent = "Merci.";
          msg.style.color = "#166534";
        }
        return;
      }
      var norm = PriceOffer.normalizePayload({
        amount: amountInp && amountInp.value,
        comment_plus: form.querySelector('[name="comment_plus"]') && form.querySelector('[name="comment_plus"]').value,
        comment_moins: form.querySelector('[name="comment_moins"]') && form.querySelector('[name="comment_moins"]').value,
      });
      if (!norm.ok) {
        if (msg) {
          msg.textContent = norm.error;
          msg.style.color = "#9a3412";
        }
        return;
      }
      var assessment = PriceOffer.assessOffer(norm.amount, asking);
      if (assessment.level === "critical" && !confirm(assessment.warn + "\n\nEnvoyer quand même ?")) return;
      if (msg) {
        msg.textContent = "Envoi…";
        msg.style.color = "#475569";
      }
      fetch("/api/immo-tour-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          action: "submit_price_offer",
          property_id: box.getAttribute("data-property-id") || (listing && listing.id) || "",
          amount: norm.amount,
          comment_plus: norm.comment_plus,
          comment_moins: norm.comment_moins,
          visitor_id: PriceOffer.visitorKey(),
          source: "listing",
          utm_source: "biens",
          _hp: hp ? hp.value : "",
        }),
      })
        .then(function (r) {
          return r.json().then(function (d) {
            return { status: r.status, d: d };
          });
        })
        .then(function (res) {
          if (res.d && res.d.ok) {
            if (msg) {
              msg.textContent = res.d.duplicate
                ? res.d.error || "Déjà envoyé depuis cette connexion."
                : res.d.message || "Merci — estimation enregistrée.";
              msg.style.color = "#166534";
            }
          } else if (msg) {
            msg.textContent = (res.d && res.d.error) || "Envoi impossible.";
            msg.style.color = "#9a3412";
          }
        })
        .catch(function () {
          if (msg) {
            msg.textContent = "Erreur réseau.";
            msg.style.color = "#9a3412";
          }
        });
    });
  }

  function showListing(listing, privateMode, opts) {
    opts = opts || {};
    var adminMode = !!opts.admin || isCrmAdminSession();
    if (listing) listing._privateMode = !!privateMode;
    var mount = document.getElementById("adDetail");
    var err = document.getElementById("adError");
    if (err) err.hidden = true;
    if (mount) {
      mount.innerHTML = detailHtml(listing, privateMode, { admin: adminMode });
      bindGallery(mount);
      bindPriceOffer(mount, listing);
      if (adminMode) bindAdminPhotoRetry(mount, listing);
    }
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

  function localPrivateMeta(token) {
    try {
      var raw = localStorage.getItem("lo_crm_immo_v1");
      var db = raw ? JSON.parse(raw) : null;
      if (!db || !AdLib) return null;
      var found = AdLib.findByShareToken(db.properties || [], token);
      if (!found) return null;
      var bag = AdLib.getAdMeta(found);
      var Access = window.ImmoAdDemoAccess;
      return {
        property: found,
        listing: AdLib.toAdListing(found),
        requires_auth: Access ? Access.hasRestrictedAccess(bag.ad) : false,
        methods: Access ? Access.accessMethods(bag.ad) : [],
        ad: bag.ad,
      };
    } catch (e) {
      return null;
    }
  }

  function bootPublic() {
    var grid = document.getElementById("adGrid");
    var detail = document.getElementById("adDetail");
    var empty = document.getElementById("adEmpty");
    var filters = document.getElementById("adFilters");
    if (!grid) return;
    var params = new URLSearchParams(location.search);
    var focusId = params.get("id");
    var filterMode = params.get("filter") === "tour" ? "tour" : "all";

    function syncFilterButtons() {
      if (!filters) return;
      filters.querySelectorAll("[data-filter]").forEach(function (btn) {
        var on = btn.getAttribute("data-filter") === filterMode;
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }

    function visibleList(listings) {
      if (filterMode !== "tour") return listings;
      return listings.filter(function (p) {
        return !!(p.virtual_tour || p.has_virtual_tour || p.tour_gate || p.tour_href);
      });
    }

    function paint(listings) {
      var shown = visibleList(listings);
      if (!listings.length) {
        if (empty) {
          empty.hidden = false;
          empty.textContent =
            "Aucun bien en vitrine pour le moment. Les annonces apparaissent ici dès qu’un bien est activé en vitrine publique dans le CRM.";
        }
        grid.innerHTML = "";
        return;
      }
      if (!shown.length) {
        if (empty) {
          empty.hidden = false;
          empty.textContent =
            "Aucun bien avec visite virtuelle dans la vitrine pour le moment. Affichez tous les biens ou revenez plus tard.";
        }
        grid.innerHTML = "";
        return;
      }
      if (empty) empty.hidden = true;
      if (focusId) {
        var one = listings.filter(function (l) {
          return l.id === focusId;
        })[0];
        if (one && detail) {
          showListing(one, false, { admin: isCrmAdminSession() });
          grid.innerHTML = shown
            .filter(function (l) {
              return l.id !== focusId;
            })
            .map(cardHtml)
            .join("");
        } else {
          grid.innerHTML = shown.map(cardHtml).join("");
        }
      } else {
        if (detail) detail.innerHTML = "";
        grid.innerHTML = shown.map(cardHtml).join("");
      }
      grid.querySelectorAll("[data-id]").forEach(function (card) {
        card.style.cursor = "pointer";
        card.addEventListener("click", function () {
          var q = "?id=" + encodeURIComponent(card.getAttribute("data-id"));
          if (filterMode === "tour") q += "&filter=tour";
          location.search = q;
        });
      });
      if (Protect) Protect.attach(document.getElementById("adProtectRoot") || document.body, { watermark: false });
    }

    if (filters) {
      syncFilterButtons();
      filters.querySelectorAll("[data-filter]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          filterMode = btn.getAttribute("data-filter") === "tour" ? "tour" : "all";
          syncFilterButtons();
          var next = new URLSearchParams(location.search);
          if (filterMode === "tour") next.set("filter", "tour");
          else next.delete("filter");
          var qs = next.toString();
          history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
          fetchPublicAds().then(function (listings) {
            if (!listings.length) listings = localPublicAds();
            paint(listings);
          });
        });
      });
    }

    fetchPublicAds().then(function (listings) {
      if (!listings.length) listings = localPublicAds();
      paint(listings);
    });
  }

  function bootPrivate() {
    var root = document.getElementById("adProtectRoot") || document.body;
    var err = document.getElementById("adError");
    var params = new URLSearchParams(location.search);
    var token = params.get("token") || "";
    var adminMode = params.get("admin") === "1" || params.get("preview") === "1";
    var urlGrant = params.get("grant") || "";
    if (!token) {
      if (err) {
        err.hidden = false;
        err.textContent = "Lien invalide : token manquant. Demandez le lien démo à votre conseiller.";
      }
      return;
    }
    if (Protect) Protect.attach(root, { watermark: true });

    var savedGrant = urlGrant;
    try {
      if (!savedGrant) savedGrant = sessionStorage.getItem(grantStorageKey(token)) || "";
    } catch (e) {}

    function unlockWithListing(listing, isAdmin) {
      showListing(listing, true, { admin: !!(isAdmin || adminMode || isCrmAdminSession()) });
      if (isAdmin) {
        var banner = document.querySelector(".immo-ad-private-banner");
        if (banner) {
          banner.textContent =
            "Prévisualisation admin — sans e-mail/tél. (ne pas partager ce lien vendeur)";
          banner.style.background = "#eff6ff";
          banner.style.color = "#1e3a8a";
          banner.style.borderBottomColor = "#93c5fd";
        }
      }
    }

    function tryAdminThenGate() {
      fetchPrivateAd(token, savedGrant, { admin: adminMode }).then(function (res) {
        if (res.data && res.data.ok && res.data.listing) {
          unlockWithListing(res.data.listing, !!(adminMode || res.data.admin_preview));
          return;
        }
        if (adminMode) {
          var crmTok = "";
          try {
            crmTok = localStorage.getItem("lo_token") || "";
          } catch (e2) {}
          if (!crmTok) {
            if (err) {
              err.hidden = false;
              err.textContent =
                "Prévisualisation admin : connectez-vous d’abord au CRM, puis rouvrez ce lien (?admin=1).";
            }
            return;
          }
        }
        if (res.data && res.data.requires_auth) {
          renderGate(res.data.methods || ["email", "phone"], token, function (listing) {
            unlockWithListing(listing, false);
          });
          return;
        }
        var local = localPrivateMeta(token);
        if (local && local.listing) {
          if (adminMode) {
            unlockWithListing(local.listing, true);
            return;
          }
          if (local.requires_auth) {
            renderGate(local.methods, token, function (listing) {
              unlockWithListing(listing || local.listing, false);
            });
            return;
          }
          unlockWithListing(local.listing, false);
          return;
        }
        if (err) {
          err.hidden = false;
          err.textContent = (res.data && res.data.error) || "Cette démonstration est introuvable ou n’est plus active.";
        }
      });
    }

    tryAdminThenGate();
  }

  window.ImmoAdPages = { bootPublic: bootPublic, bootPrivate: bootPrivate };
})();
