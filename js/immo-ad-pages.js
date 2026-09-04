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

  function showListing(listing, privateMode) {
    var mount = document.getElementById("adDetail");
    var err = document.getElementById("adError");
    if (err) err.hidden = true;
    if (mount) {
      mount.innerHTML = detailHtml(listing, privateMode);
      bindGallery(mount);
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
      showListing(listing, true);
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
