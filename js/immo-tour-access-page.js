/**
 * Page publique /immobilier/visite.html — porte d’entrée visite virtuelle acquéreur.
 */
(function () {
  var Protect = window.ImmoAdProtect;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function el(id) {
    return document.getElementById(id);
  }

  function params() {
    return new URLSearchParams(location.search);
  }

  function tokenOf() {
    return (params().get("t") || params().get("token") || "").trim();
  }

  function setMsg(text, ok) {
    var node = el("tourMsg");
    if (!node) return;
    node.textContent = text || "";
    node.style.color = ok ? "#166534" : "#9a3412";
  }

  function grantKey(token) {
    return "lo_immo_tour_grant_" + token;
  }

  function post(body) {
    return fetch("/api/immo-tour-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    }).then(function (r) {
      return r.json().then(function (d) {
        return { status: r.status, d: d };
      });
    });
  }

  function paintMeta(meta) {
    var title = el("tourTitle");
    var sub = el("tourSub");
    if (title) title.textContent = meta.title || "Visite virtuelle";
    if (sub) {
      var bits = [];
      if (meta.city) bits.push(meta.city);
      if (meta.expires_at) {
        bits.push("lien jusqu’au " + new Date(meta.expires_at).toLocaleDateString("fr-FR"));
      }
      if (meta.remaining != null) bits.push(meta.remaining + " consultation(s) restante(s)");
      sub.textContent = bits.join(" · ") || "Réservée aux acquéreurs — e-mail et téléphone requis.";
    }
  }

  function showError(text) {
    var err = el("tourError");
    var gate = el("tourGate");
    if (gate) gate.hidden = true;
    if (err) {
      err.hidden = false;
      err.textContent = text || "Lien invalide.";
    }
  }

  function showPlayer(embedUrl, listing) {
    var gate = el("tourGate");
    var player = el("tourPlayer");
    if (gate) gate.hidden = true;
    if (!player) return;
    player.hidden = false;
    var head = listing
      ? "<h2>" +
        esc(listing.headline || listing.title || "Visite virtuelle") +
        "</h2><p>" +
        esc([listing.city, listing.postal_code, listing.surface_m2 ? listing.surface_m2 + " m²" : ""]
          .filter(Boolean)
          .join(" · ")) +
        "</p>"
      : "";
    player.innerHTML =
      '<div class="tour-player-copy">' +
      head +
      "<p>Visite réservée à votre dossier acquéreur — ne pas transférer ce lien.</p></div>" +
      '<div class="tour-frame-wrap">' +
      '<iframe title="Visite virtuelle" src="' +
      esc(embedUrl) +
      '" allow="xr-spatial-tracking; fullscreen; web-share" allowfullscreen></iframe>' +
      "</div>";
  }

  function bindGate(token) {
    var requestBtn = el("tourRequest");
    var verifyBtn = el("tourVerify");
    if (requestBtn) {
      requestBtn.onclick = function () {
        var payload = {
          action: "request_access",
          token: token,
          first_name: el("tourFirst").value,
          email: el("tourEmail").value,
          phone: el("tourPhone").value,
          utm_source: params().get("utm_source") || "leboncoin",
        };
        setMsg("Envoi des codes…");
        post(payload)
          .then(function (res) {
            if (res.d && res.d.ok) {
              setMsg(res.d.message || "Code envoyé.", true);
              var codes = el("tourCodes");
              if (codes) codes.hidden = false;
              var smsHint = el("tourSmsHint");
              if (smsHint) smsHint.hidden = !res.d.delivery_sms;
            } else {
              setMsg((res.d && res.d.error) || "Impossible d’envoyer le code.");
            }
          })
          .catch(function () {
            setMsg("Erreur réseau.");
          });
      };
    }
    if (verifyBtn) {
      verifyBtn.onclick = function () {
        var payload = {
          action: "verify_access",
          token: token,
          first_name: el("tourFirst").value,
          email: el("tourEmail").value,
          phone: el("tourPhone").value,
          email_code: el("tourEmailCode").value,
          phone_code: el("tourPhoneCode") ? el("tourPhoneCode").value : "",
          utm_source: params().get("utm_source") || "leboncoin",
        };
        setMsg("Vérification…");
        post(payload)
          .then(function (res) {
            if (res.d && res.d.ok && res.d.grant) {
              try {
                sessionStorage.setItem(grantKey(token), res.d.grant);
              } catch (e) {}
              openTour(token, res.d.grant, res.d.listing);
            } else {
              setMsg((res.d && res.d.error) || "Code incorrect.");
            }
          })
          .catch(function () {
            setMsg("Erreur réseau.");
          });
      };
    }
  }

  function openTour(token, grant, listing) {
    setMsg("Ouverture de la visite…", true);
    post({ action: "view_tour", token: token, grant: grant })
      .then(function (res) {
        if (res.d && res.d.ok && res.d.embed_url) {
          showPlayer(res.d.embed_url, res.d.listing || listing);
        } else {
          showError((res.d && res.d.error) || "Impossible d’ouvrir la visite.");
        }
      })
      .catch(function () {
        showError("Erreur réseau.");
      });
  }

  function boot() {
    var token = tokenOf();
    var root = el("tourProtect") || document.body;
    if (Protect) Protect.attach(root, { watermark: true });
    if (!token) {
      showError("Lien incomplet. Utilisez l’URL fournie sur l’annonce (Leboncoin / Meta).");
      return;
    }
    bindGate(token);

    var urlGrant = params().get("grant") || "";
    var admin = params().get("admin") === "1";
    var saved = urlGrant;
    try {
      if (!saved) saved = sessionStorage.getItem(grantKey(token)) || "";
    } catch (e) {}

    fetch("/api/immo-tour-access?token=" + encodeURIComponent(token), { credentials: "same-origin" })
      .then(function (r) {
        return r.json();
      })
      .then(function (meta) {
        if (!meta || meta.ok === false) {
          showError((meta && meta.error) || "Ce lien n’est plus valable (expiré, quota ou renouvelé).");
          return;
        }
        paintMeta(meta);
        if (admin && saved) {
          openTour(token, saved, null);
          return;
        }
        if (saved) {
          openTour(token, saved, null);
          return;
        }
        var gate = el("tourGate");
        if (gate) gate.hidden = false;
      })
      .catch(function () {
        showError("Impossible de vérifier ce lien pour le moment.");
      });
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
