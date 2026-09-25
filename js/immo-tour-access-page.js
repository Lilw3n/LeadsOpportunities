/**
 * Page publique /immobilier/visite.html — porte d’entrée visite virtuelle.
 */
(function () {
  var Protect = window.ImmoAdProtect;
  var PriceOffer = window.ImmoTourPriceOffer;
  var lastMeta = null;
  var lastListing = null;
  var lastAsking = null;

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

  function resolveVerifyMode(meta) {
    if (!meta) return "email";
    // require_otp === false (API) prime sur verify_mode pour éviter une gate e-mail fantôme
    if (meta.require_otp === false || meta.approval_required === false) return "none";
    return meta.verify_mode || "email";
  }

  function applyVerifyMode(meta) {
    var mode = resolveVerifyMode(meta);
    var emailWrap = el("tourEmailWrap");
    var phoneWrap = el("tourPhoneWrap");
    var firstWrap = el("tourFirstWrap");
    var requestBtn = el("tourRequest");
    var openNone = el("tourOpenNone");
    var directActions = el("tourDirectActions");
    var askStep = el("tourAskStep");
    var codes = el("tourCodes");
    var emailCodeWrap = el("tourEmailCodeWrap");
    var smsHint = el("tourSmsHint");
    if (emailWrap) emailWrap.hidden = mode === "none" || mode === "sms";
    if (phoneWrap) phoneWrap.hidden = mode === "none" || mode === "email";
    if (firstWrap) firstWrap.hidden = mode === "none";
    if (requestBtn) requestBtn.hidden = mode === "none";
    // Ne pas masquer tout le bloc si le bouton direct est dedans (ancien HTML) :
    // on masque seulement le libellé « Demander l’accès », pas les actions directes.
    if (askStep) askStep.hidden = mode === "none";
    if (codes) codes.hidden = mode === "none";
    if (emailCodeWrap) emailCodeWrap.hidden = mode === "none" || mode === "sms";
    if (smsHint) smsHint.hidden = mode !== "sms";
    if (directActions) directActions.hidden = mode !== "none";
    if (openNone) openNone.hidden = mode !== "none";
  }

  function paintMeta(meta) {
    lastMeta = meta;
    lastAsking = resolveAsking(null, meta, meta && meta.asking_price);
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
    var contactBox = el("tourContact");
    if (gate) gate.hidden = true;
    if (contactBox) contactBox.hidden = true;
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

  function isDirectAccess(meta) {
    return resolveVerifyMode(meta || lastMeta) === "none";
  }

  function setDirectLayout(on) {
    document.body.classList.toggle("immo-tour-page--direct", !!on);
    var important = el("tourImportant");
    var askStep = el("tourAskStep");
    var codes = el("tourCodes");
    var directActions = el("tourDirectActions");
    var openNone = el("tourOpenNone");
    if (important) important.hidden = !on;
    if (on) {
      if (askStep) askStep.classList.add("tour-step--direct-hidden");
      if (codes) codes.classList.add("tour-step--direct-hidden");
      if (directActions) directActions.hidden = false;
      if (openNone) openNone.hidden = false;
    } else {
      if (askStep) askStep.classList.remove("tour-step--direct-hidden");
      if (codes) codes.classList.remove("tour-step--direct-hidden");
    }
  }

  function showPlayer(embedUrl, listing) {
    var gate = el("tourGate");
    var player = el("tourPlayer");
    var direct = isDirectAccess(lastMeta);
    if (gate) {
      if (direct) {
        setDirectLayout(true);
        gate.hidden = false;
      } else {
        setDirectLayout(false);
        gate.hidden = true;
      }
    }
    if (!player) return;
    player.hidden = false;
    lastListing = listing || lastListing;
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
    showPriceOfferPanel(listing);
  }

  function resolveAsking(listing, meta, apiAsk) {
    if (apiAsk != null && Number(apiAsk) > 0) return Number(apiAsk);
    if (listing && listing.price_fai != null && Number(listing.price_fai) > 0) return Number(listing.price_fai);
    if (meta && meta.asking_price != null && Number(meta.asking_price) > 0) return Number(meta.asking_price);
    if (meta && meta.price_fai != null && Number(meta.price_fai) > 0) return Number(meta.price_fai);
    return null;
  }

  function paintPriceWarn() {
    if (!PriceOffer) return;
    var amountEl = el("tourPriceAmount");
    var warn = el("tourPriceWarn");
    if (!amountEl || !warn) return;
    var amount = PriceOffer.parseAmount(amountEl.value);
    if (amount == null) {
      warn.hidden = true;
      warn.textContent = "";
      warn.className = "tour-price-warn";
      return;
    }
    var a = PriceOffer.assessOffer(amount, lastAsking);
    warn.hidden = !a.warn;
    warn.textContent = a.warn || "";
    warn.className = "tour-price-warn level-" + (a.level || "info");
  }

  function showPriceOfferPanel(listing) {
    var box = el("tourPriceOffer");
    if (!box) return;
    box.hidden = false;
    lastAsking = resolveAsking(listing, lastMeta, null);
    var askNode = el("tourPriceAsk");
    if (askNode) {
      if (lastAsking && PriceOffer) {
        askNode.hidden = false;
        askNode.innerHTML =
          "Prix affiché (référence) : <strong>" +
          esc(PriceOffer.formatPrice(lastAsking)) +
          "</strong> — basez-vous sur un montant réaliste.";
      } else {
        askNode.hidden = false;
        askNode.textContent =
          "Prix de référence non affiché ici — proposez un montant cohérent avec le marché.";
      }
    }
    bindPriceOfferForm();
  }

  function bindPriceOfferForm() {
    var form = el("tourPriceOfferForm");
    if (!form || form.getAttribute("data-bound") === "1") return;
    form.setAttribute("data-bound", "1");
    var amountEl = el("tourPriceAmount");
    if (amountEl) {
      amountEl.addEventListener("input", paintPriceWarn);
      amountEl.addEventListener("change", paintPriceWarn);
    }
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var msg = el("tourPriceMsg");
      var hp = el("tourPriceHp");
      if (hp && hp.value) {
        if (msg) {
          msg.textContent = "Merci.";
          msg.style.color = "#166534";
        }
        return;
      }
      if (!PriceOffer) {
        if (msg) msg.textContent = "Module indisponible.";
        return;
      }
      var norm = PriceOffer.normalizePayload({
        amount: amountEl && amountEl.value,
        comment_plus: el("tourPricePlus") && el("tourPricePlus").value,
        comment_moins: el("tourPriceMoins") && el("tourPriceMoins").value,
        first_name: (el("tourFirst") && el("tourFirst").value) || (el("tourContactFirst") && el("tourContactFirst").value),
        email: (el("tourEmail") && el("tourEmail").value) || (el("tourContactEmail") && el("tourContactEmail").value),
        phone: (el("tourPhone") && el("tourPhone").value) || (el("tourContactPhone") && el("tourContactPhone").value),
      });
      if (!norm.ok) {
        if (msg) {
          msg.textContent = norm.error;
          msg.style.color = "#9a3412";
        }
        return;
      }
      var assessment = PriceOffer.assessOffer(norm.amount, lastAsking);
      if (assessment.level === "critical") {
        var go = confirm(assessment.warn + "\n\nEnvoyer quand même cette estimation ?");
        if (!go) return;
      }
      var btn = el("tourPriceSubmit");
      if (btn) btn.disabled = true;
      if (msg) {
        msg.textContent = "Envoi…";
        msg.style.color = "#475569";
      }
      post({
        action: "submit_price_offer",
        token: tokenOf(),
        amount: norm.amount,
        comment_plus: norm.comment_plus,
        comment_moins: norm.comment_moins,
        first_name: norm.first_name,
        email: norm.email,
        phone: norm.phone,
        visitor_id: PriceOffer.visitorKey(),
        utm_source: params().get("utm_source") || "visite-virtuelle",
        _hp: hp ? hp.value : "",
      })
        .then(function (res) {
          if (btn) btn.disabled = false;
          if (res.d && res.d.ok) {
            if (msg) {
              msg.textContent =
                res.d.duplicate
                  ? res.d.error || "Proposition déjà enregistrée pour cette connexion."
                  : res.d.message || "Merci — estimation enregistrée.";
              msg.style.color = "#166534";
            }
            if (!res.d.duplicate && form) {
              form.querySelectorAll("input:not([type=hidden]), textarea").forEach(function (inp) {
                if (inp.id !== "tourPriceHp") inp.value = "";
              });
              paintPriceWarn();
            }
            if (res.d.assessment && res.d.assessment.warn && el("tourPriceWarn")) {
              var w = el("tourPriceWarn");
              w.hidden = false;
              w.textContent = res.d.assessment.warn;
              w.className = "tour-price-warn level-" + (res.d.assessment.level || "info");
            }
          } else {
            if (msg) {
              msg.textContent = (res.d && res.d.error) || "Envoi impossible.";
              msg.style.color = "#9a3412";
            }
          }
        })
        .catch(function () {
          if (btn) btn.disabled = false;
          if (msg) {
            msg.textContent = "Erreur réseau.";
            msg.style.color = "#9a3412";
          }
        });
    });
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
        setMsg("Envoi de la demande…");
        post(payload)
          .then(function (res) {
            if (res.d && res.d.ok) {
              setMsg(
                res.d.message ||
                  (res.d.pending
                    ? "Demande envoyée. En attente de validation."
                    : "Demande enregistrée."),
                true
              );
              if (res.d.skip_otp) {
                var direct = el("tourDirectActions");
                var open = el("tourOpenNone");
                if (direct) direct.hidden = false;
                if (open) open.hidden = false;
                return;
              }
              if (res.d.pending) return;
              var codeInp = el("tourEmailCode");
              if (codeInp) codeInp.focus();
            } else {
              setMsg((res.d && res.d.error) || "Impossible d’envoyer la demande.");
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
      var mode = resolveVerifyMode(lastMeta);
      if (mode !== "none") {
        var typed =
          (el("tourEmailCode") && el("tourEmailCode").value.trim()) ||
          (el("tourPhoneCode") && el("tourPhoneCode").value.trim()) ||
          "";
        if (!typed) {
          setMsg("Saisissez le code à 6 chiffres (reçu par e-mail ou donné par le mandataire).");
          return;
        }
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
          if (res.d.asking_price != null) {
            lastAsking = Number(res.d.asking_price) || lastAsking;
            showPriceOfferPanel(res.d.listing || listing);
          }
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
    bindContactForm(token);

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
          if (isDirectAccess(meta)) setDirectLayout(true);
          openTour(token, saved, null);
          return;
        }
        if (saved) {
          if (isDirectAccess(meta)) setDirectLayout(true);
          openTour(token, saved, null);
          return;
        }
        if (isDirectAccess(meta)) {
          openDirectAccess(token);
          return;
        }
        var gate = el("tourGate");
        if (gate) gate.hidden = false;
      })
      .catch(function () {
        showError("Impossible de vérifier ce lien pour le moment.");
      });
  }

  function setContactMsg(text, ok) {
    var node = el("tourContactMsg");
    if (!node) return;
    node.textContent = text || "";
    node.style.color = ok ? "#166534" : "#9a3412";
  }

  function syncContactFromGate() {
    var map = [
      ["tourFirst", "tourContactFirst"],
      ["tourEmail", "tourContactEmail"],
      ["tourPhone", "tourContactPhone"],
    ];
    map.forEach(function (pair) {
      var from = el(pair[0]);
      var to = el(pair[1]);
      if (from && to && from.value && !to.value) to.value = from.value;
    });
  }

  function bindContactForm(token) {
    var form = el("tourContactForm");
    if (!form || form.getAttribute("data-bound") === "1") return;
    form.setAttribute("data-bound", "1");
    ["tourFirst", "tourEmail", "tourPhone"].forEach(function (id) {
      var node = el(id);
      if (node) node.addEventListener("change", syncContactFromGate);
    });
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      syncContactFromGate();
      var hp = el("tourContactHp");
      if (hp && hp.value) {
        setContactMsg("Demande envoyée. Wendy vous recontacte rapidement.", true);
        form.reset();
        return;
      }
      var first = (el("tourContactFirst") && el("tourContactFirst").value.trim()) || "";
      var email = (el("tourContactEmail") && el("tourContactEmail").value.trim()) || "";
      var phone = (el("tourContactPhone") && el("tourContactPhone").value.trim()) || "";
      var message = (el("tourContactMessage") && el("tourContactMessage").value.trim()) || "";
      var consent = el("tourContactConsent");
      if (!first || !email || !phone) {
        setContactMsg("Indiquez prénom, e-mail et téléphone.");
        return;
      }
      if (consent && !consent.checked) {
        setContactMsg("Cochez l’accord pour être recontacté(e).");
        return;
      }
      var btn = el("tourContactSubmit");
      if (btn) btn.disabled = true;
      setContactMsg("Envoi en cours…", true);
      var meta = lastMeta || {};
      var listingBits = [meta.title || meta.name, meta.city, meta.postal_code].filter(Boolean).join(" · ");
      var body = {
        firstName: first,
        email: email,
        phone: phone,
        message: message || "Contact depuis la visite virtuelle" + (listingBits ? " — " + listingBits : ""),
        vertical: "acheteur_immo",
        source: "visite-virtuelle",
        need: "visite_virtuelle",
        interest: "visite_virtuelle",
        utm_source: params().get("utm_source") || "visite-virtuelle",
        utm_medium: params().get("utm_medium") || "formulaire-visite",
        utm_campaign: params().get("utm_campaign") || "visite-3d",
        tour_token: token || "",
        property_label: listingBits,
        page_url: location.href,
        _hp: "",
      };
      fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      })
        .then(function (r) {
          return r.json().then(function (d) {
            return { status: r.status, d: d };
          });
        })
        .then(function (res) {
          if (btn) btn.disabled = false;
          if (res.d && (res.d.ok || res.d.leadId)) {
            setContactMsg("Demande envoyée. Wendy BUCHET vous recontacte rapidement.", true);
            form.reset();
            return;
          }
          setContactMsg((res.d && (res.d.message || res.d.error)) || "Envoi impossible. Réessayez ou écrivez à contact@leadsopportunities.fr.");
        })
        .catch(function () {
          if (btn) btn.disabled = false;
          setContactMsg("Erreur réseau. Réessayez ou contact@leadsopportunities.fr");
        });
    });
  }

  function openDirectAccess(token) {
    setDirectLayout(true);
    var gate = el("tourGate");
    if (gate) gate.hidden = false;
    var terms = el("tourTerms");
    if (terms) terms.checked = true;
    var directActions = el("tourDirectActions");
    var openNone = el("tourOpenNone");
    if (directActions) directActions.hidden = false;
    if (openNone) openNone.hidden = false;
    setMsg("Ouverture directe de la visite…", true);
    var payload = payloadBase(token);
    payload.action = "verify_access";
    payload.accepted_terms = true;
    payload.email_code = "";
    payload.phone_code = "";
    post(payload)
      .then(function (res) {
        if (res.d && res.d.ok && res.d.grant) {
          try {
            sessionStorage.setItem(grantKey(token), res.d.grant);
          } catch (e) {}
          openTour(token, res.d.grant, res.d.listing || null);
        } else {
          setMsg(
            (res.d && res.d.error) ||
              "Impossible d’ouvrir automatiquement. Cliquez sur « Voir la visite ».",
            false
          );
          if (gate) gate.hidden = false;
          if (directActions) directActions.hidden = false;
          if (openNone) openNone.hidden = false;
        }
      })
      .catch(function () {
        setMsg("Erreur réseau. Cliquez sur « Voir la visite ».", false);
        if (directActions) directActions.hidden = false;
        if (openNone) openNone.hidden = false;
      });
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
