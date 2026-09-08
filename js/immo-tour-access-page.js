/**
 * Page publique /immobilier/visite.html — porte d’entrée visite virtuelle.
 */
(function () {
  var Protect = window.ImmoAdProtect;
  var lastMeta = null;

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

  function applyVerifyMode(meta) {
    var mode = (meta && meta.verify_mode) || "both";
    var emailWrap = el("tourEmailWrap");
    var phoneWrap = el("tourPhoneWrap");
    var firstWrap = el("tourFirstWrap");
    var requestBtn = el("tourRequest");
    var openNone = el("tourOpenNone");
    if (emailWrap) emailWrap.hidden = mode === "none" || mode === "sms";
    if (phoneWrap) phoneWrap.hidden = mode === "none" || mode === "email";
    if (firstWrap) firstWrap.hidden = mode === "none";
    if (requestBtn) requestBtn.hidden = mode === "none";
    if (openNone) openNone.hidden = mode !== "none";
  }

  function paintMeta(meta) {
    lastMeta = meta;
    var title = el("tourTitle");
    var sub = el("tourSub");
    if (title) title.textContent = meta.name || meta.title || "Visite virtuelle";
    if (sub) {
      var bits = [];
      if (meta.name && meta.title && meta.name !== meta.title) bits.push(meta.title);
      if (meta.city) bits.push(meta.city);
      if (meta.period_mode === "mandate") bits.push("valable pendant le mandat exclusif");
      else if (meta.period_mode === "unlimited") bits.push("durée illimitée (quota possible)");
      if (meta.expires_at) {
        bits.push("jusqu’au " + new Date(meta.expires_at).toLocaleString("fr-FR"));
      } else if (meta.duration_start === "first_view" && meta.duration_value) {
        bits.push(
          meta.duration_value +
            (meta.duration_unit === "hours" ? " h" : " j") +
            " à partir de la 1re ouverture"
        );
      }
      if (meta.remaining != null) bits.push(meta.remaining + " consultation(s) restante(s)");
      sub.textContent = bits.join(" · ") || "Wendy BUCHET — mandataire immobilier.";
    }
    var copy = el("tourCopyright");
    if (copy && meta.copyright) copy.textContent = meta.copyright;
    applyVerifyMode(meta);
  }

  function showWendy(text, contact) {
    var err = el("tourError");
    var gate = el("tourGate");
    var box = el("tourRedirect");
    var link = el("tourWendyLink");
    if (gate) gate.hidden = true;
    if (err) {
      err.hidden = false;
      err.textContent = text || "Lien invalide.";
    }
    if (box) box.hidden = false;
    var href = (contact && contact.href) || "/landings/acheteur-immo.html?utm_source=visite-virtuelle&utm_medium=lien-invalide";
    if (link) link.href = href;
  }

  function showError(text, contact) {
    showWendy(text, contact);
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
      "<p>Usage unique et personnel — Wendy BUCHET, mandataire immobilier. Ne pas transférer ce lien.</p></div>" +
      '<div class="tour-frame-wrap">' +
      '<iframe title="Visite virtuelle" src="' +
      esc(embedUrl) +
      '" referrerpolicy="same-origin" allow="xr-spatial-tracking; fullscreen" allowfullscreen></iframe>' +
      "</div>";
  }

  function termsOk() {
    var box = el("tourTerms");
    return !!(box && box.checked);
  }

  function payloadBase(token) {
    return {
      token: token,
      first_name: el("tourFirst") ? el("tourFirst").value : "",
      email: el("tourEmail") ? el("tourEmail").value : "",
      phone: el("tourPhone") ? el("tourPhone").value : "",
      accepted_terms: termsOk(),
      utm_source: params().get("utm_source") || "leboncoin",
    };
  }

  function bindGate(token) {
    var requestBtn = el("tourRequest");
    var verifyBtn = el("tourVerify");
    var openNone = el("tourOpenNone");
    if (requestBtn) {
      requestBtn.onclick = function () {
        if (!termsOk()) {
          setMsg("Cochez l’acceptation des droits d’auteur.");
          return;
        }
        var payload = payloadBase(token);
        payload.action = "request_access";
        setMsg("Envoi des codes…");
        post(payload)
          .then(function (res) {
            if (res.d && res.d.ok) {
              setMsg(res.d.message || "Code envoyé.", true);
              if (res.d.skip_otp) {
                var open = el("tourOpenNone");
                if (open) open.hidden = false;
                return;
              }
              var codes = el("tourCodes");
              if (codes) codes.hidden = false;
              var smsHint = el("tourSmsHint");
              if (smsHint) smsHint.hidden = !res.d.delivery_sms;
              var emailCodeWrap = el("tourEmailCodeWrap");
              if (emailCodeWrap) emailCodeWrap.hidden = !res.d.delivery_email;
            } else {
              setMsg((res.d && res.d.error) || "Impossible d’envoyer le code.");
            }
          })
          .catch(function () {
            setMsg("Erreur réseau.");
          });
      };
    }
    function finishVerify() {
      if (!termsOk()) {
        setMsg("Cochez l’acceptation des droits d’auteur.");
        return;
      }
      var payload = payloadBase(token);
      payload.action = "verify_access";
      payload.email_code = el("tourEmailCode") ? el("tourEmailCode").value : "";
      payload.phone_code = el("tourPhoneCode") ? el("tourPhoneCode").value : "";
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
    }
    if (verifyBtn) verifyBtn.onclick = finishVerify;
    if (openNone) openNone.onclick = finishVerify;
  }

  function openTour(token, grant, listing) {
    setMsg("Ouverture de la visite…", true);
    post({ action: "view_tour", token: token, grant: grant })
      .then(function (res) {
        if (res.d && res.d.ok && (res.d.player_url || res.d.embed_url)) {
          var src = res.d.player_url || "";
          if (!src || src.indexOf("/api/immo-tour-player") !== 0) {
            src = "/api/immo-tour-player?t=" + encodeURIComponent(token);
          }
          showPlayer(src, res.d.listing || listing);
        } else {
          showError((res.d && res.d.error) || "Impossible d’ouvrir la visite.", (res.d && res.d.contact) || (lastMeta && lastMeta.contact));
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
      showError("Lien incomplet. Utilisez l’URL fournie sur l’annonce (site, Leboncoin, SeLoger, Meta).");
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
          showError(
            (meta && (meta.error || meta.reason && meta.error)) || "Ce lien n’est plus valable (expiré, quota, mandat ou renouvelé).",
            meta && meta.contact
          );
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
