/**
 * Compte client — inscription via formulaire vendeur, Google, confirmation mail/tél.
 */
(function (global) {
  var TOKEN_KEY = "lo_ext_token";
  var EMAIL_KEY = "lo_client_email";

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function currentReturnTo() {
    var path = location.pathname + location.search;
    var hash = location.hash || "";
    return path + hash;
  }

  function googleUrl() {
    return "/api/external/google?returnTo=" + encodeURIComponent(currentReturnTo());
  }

  function isLoggedIn() {
    return !!(localStorage.getItem(TOKEN_KEY) && localStorage.getItem(EMAIL_KEY));
  }

  function storeSession(token, email, profile) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (email) localStorage.setItem(EMAIL_KEY, email);
    if (profile) localStorage.setItem("lo_ext_profile", JSON.stringify(profile));
  }

  function prefillFromSession(form) {
    if (!form) return;
    var email = localStorage.getItem(EMAIL_KEY);
    var raw = localStorage.getItem("lo_ext_profile");
    var profile = null;
    try {
      profile = raw ? JSON.parse(raw) : null;
    } catch (e) {}
    if (profile && profile.email) email = profile.email;
    if (email) {
      var em = form.querySelector("[name='email']");
      if (em && !String(em.value || "").trim()) em.value = email;
    }
    if (profile) {
      var fn = form.querySelector("[name='firstName']");
      var ln = form.querySelector("[name='lastName']");
      var ph = form.querySelector("[name='phone']");
      if (fn && profile.firstName && !fn.value) fn.value = profile.firstName;
      if (ln && profile.lastName && !ln.value) ln.value = profile.lastName;
      if (ph && profile.phone && !ph.value) ph.value = profile.phone;
    }
  }

  function getConfirmMethod(root) {
    var checked = qs("[name='confirmMethod']:checked", root);
    return checked ? String(checked.value || "").trim() : "email";
  }

  function syncConfirmMethodUi(root) {
    var block = qs("[data-account-block]", root);
    if (!block || block.hidden) return;
    var method = getConfirmMethod(block);
    qsa("[data-confirm-panel]", block).forEach(function (panel) {
      var show = panel.getAttribute("data-confirm-panel") === method;
      panel.hidden = !show;
    });
    var form = qs("[data-url-capture-form]", root);
    var emailWrap = qs("[data-contact-email-wrap]", root);
    var phoneWrap = qs("[data-contact-phone-wrap]", root);
    var hint = qs("[data-contact-hint]", root);
    if (emailWrap) emailWrap.classList.toggle("contact-field--required", method === "email");
    if (phoneWrap) phoneWrap.classList.toggle("contact-field--required", method === "phone");
    if (hint) {
      if (method === "google") {
        hint.textContent = isLoggedIn()
          ? "Connecté via Google — vous pouvez compléter un téléphone en option."
          : "Connectez-vous avec Google ci-dessus, ou choisissez e-mail / téléphone.";
      } else if (method === "email") {
        hint.textContent = "Indiquez votre e-mail — un lien de confirmation vous sera envoyé après le dépôt.";
      } else if (method === "phone") {
        hint.textContent = "Indiquez votre téléphone — un conseiller vous rappellera pour confirmer votre identité.";
      }
    }
    if (method === "google" && isLoggedIn() && form) {
      var googleRadio = qs("[name='confirmMethod'][value='google']", block);
      if (googleRadio && !googleRadio.checked) googleRadio.checked = true;
      prefillFromSession(form);
    }
    if (global.AcheteurImmoDepositGuide && global.AcheteurImmoDepositGuide.refreshUi) {
      global.AcheteurImmoDepositGuide.refreshUi(root);
    }
  }

  function updateAccountUi(root) {
    var badge = qs("[data-account-status]", root);
    var block = qs("[data-account-block]", root);
    if (!block) return;
    var hat = document.documentElement.getAttribute("data-immo-hat") || "acheteur";
    var show = hat === "vendeur" || hat === "les_deux" || hat === "signalement";
    block.hidden = !show;
    if (!show) return;
    if (badge) {
      if (isLoggedIn()) {
        badge.hidden = false;
        badge.textContent = "Connecté : " + (localStorage.getItem(EMAIL_KEY) || "");
        var googleRadio = qs("[name='confirmMethod'][value='google']", block);
        if (googleRadio) googleRadio.checked = true;
      } else {
        badge.hidden = true;
      }
    }
    var googleBtn = qs("[data-account-google]", root);
    if (googleBtn) googleBtn.href = googleUrl();
    syncConfirmMethodUi(root);
  }

  function handleOAuthReturn() {
    var params = new URLSearchParams(location.search);
    if (params.get("ext_oauth") === "success" || params.get("verify") === "success") {
      var token = params.get("token");
      var email = params.get("email");
      if (token && email) {
        storeSession(token, email, { email: email });
        var toast = qs("[data-sell-draft-toast]") || qs("[data-account-toast]");
        if (toast) {
          toast.hidden = false;
          toast.textContent =
            params.get("verified") === "google"
              ? "Compte Google connecté — e-mail confirmé."
              : "E-mail confirmé — vous êtes connecté à votre espace.";
        }
      }
      params.delete("ext_oauth");
      params.delete("verify");
      params.delete("token");
      params.delete("email");
      params.delete("dest");
      params.delete("verified");
      var clean = location.pathname + (params.toString() ? "?" + params.toString() : "") + (location.hash || "");
      history.replaceState(null, "", clean);
    }
  }

  function bindResendVerify(root) {
    var btn = qs("[data-account-resend-verify]", root);
    if (!btn || btn.dataset.bound) return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", function () {
      var form = qs("[data-url-capture-form]", root);
      var emailEl = form && form.querySelector("[name='email']");
      var email = emailEl ? String(emailEl.value || "").trim() : localStorage.getItem(EMAIL_KEY) || "";
      if (!email) {
        alert("Indiquez votre e-mail dans le formulaire.");
        if (emailEl) emailEl.focus();
        return;
      }
      btn.disabled = true;
      fetch("/api/external/send-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email: email, returnTo: currentReturnTo() }),
      })
        .then(function (r) {
          return r.json();
        })
        .then(function (data) {
          alert(data.message || data.error || "Demande envoyée.");
        })
        .catch(function () {
          alert("Erreur réseau.");
        })
        .then(function () {
          btn.disabled = false;
        });
    });
  }

  function bindConfirmMethod(root) {
    qsa("[name='confirmMethod']", root).forEach(function (el) {
      if (el.dataset.boundConfirm) return;
      el.dataset.boundConfirm = "1";
      el.addEventListener("change", function () {
        syncConfirmMethodUi(root);
      });
    });
  }

  var lookupTimer = null;
  var lookupAbort = null;

  function phoneDigits(val) {
    return String(val || "").replace(/\D/g, "");
  }

  function setCoordsKnown(root, message) {
    var el = qs("[data-coords-known]", root);
    if (!el) return;
    if (message) {
      el.hidden = false;
      el.textContent = message;
    } else {
      el.hidden = true;
      el.textContent = "";
    }
  }

  function prefillIfEmpty(form, data) {
    if (!form || !data) return;
    var map = [
      ["firstName", data.firstName],
      ["lastName", data.lastName],
      ["email", data.email],
      ["phone", data.phone],
    ];
    map.forEach(function (pair) {
      var input = form.querySelector("[name='" + pair[0] + "']");
      if (input && pair[1] && !String(input.value || "").trim()) {
        input.value = pair[1];
      }
    });
  }

  function lookupCoords(root) {
    var form = qs("[data-url-capture-form]", root);
    if (!form) return;
    var emailEl = form.querySelector("[name='email']");
    var phoneEl = form.querySelector("[name='phone']");
    var email = emailEl ? String(emailEl.value || "").trim().toLowerCase() : "";
    var phone = phoneEl ? String(phoneEl.value || "").trim() : "";
    var digits = phoneDigits(phone);

    if (!email && digits.length < 10) {
      setCoordsKnown(root, "");
      return;
    }

    if (lookupAbort) lookupAbort.abort();
    lookupAbort = new AbortController();

    var qsParts = [];
    if (email) qsParts.push("email=" + encodeURIComponent(email));
    if (digits.length >= 10) qsParts.push("phone=" + encodeURIComponent(phone));

    fetch("/api/external/lookup-coords?" + qsParts.join("&"), {
      credentials: "same-origin",
      signal: lookupAbort.signal,
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (data.found) {
          prefillIfEmpty(form, data);
          setCoordsKnown(root, data.message || "Dossier déjà connu — vos coordonnées ont été reprises.");
        } else {
          setCoordsKnown(root, "");
        }
      })
      .catch(function (err) {
        if (err && err.name === "AbortError") return;
        setCoordsKnown(root, "");
      });
  }

  function scheduleCoordsLookup(root) {
    clearTimeout(lookupTimer);
    lookupTimer = setTimeout(function () {
      lookupCoords(root);
    }, 450);
  }

  function bindCoordsLookup(root) {
    var form = qs("[data-url-capture-form]", root);
    if (!form || form.dataset.coordsLookupBound) return;
    form.dataset.coordsLookupBound = "1";
    ["email", "phone"].forEach(function (name) {
      var input = form.querySelector("[name='" + name + "']");
      if (!input) return;
      input.addEventListener("input", function () {
        scheduleCoordsLookup(root);
      });
      input.addEventListener("blur", function () {
        clearTimeout(lookupTimer);
        lookupCoords(root);
      });
    });
  }

  function bind(root) {
    if (!root || root.dataset.accountBound) return;
    root.dataset.accountBound = "1";
    handleOAuthReturn();
    var form = qs("[data-url-capture-form]", root);
    prefillFromSession(form);
    updateAccountUi(root);
    bindResendVerify(root);
    bindConfirmMethod(root);
    bindCoordsLookup(root);
    document.querySelectorAll("[name='immoHat']").forEach(function (el) {
      el.addEventListener("change", function () {
        setTimeout(function () {
          updateAccountUi(root);
        }, 0);
      });
    });
  }

  function boot() {
    document.querySelectorAll("[data-listing-url-capture]").forEach(bind);
  }

  global.AcheteurImmoAccount = {
    isLoggedIn: isLoggedIn,
    storeSession: storeSession,
    prefillFromSession: prefillFromSession,
    updateAccountUi: updateAccountUi,
    syncConfirmMethodUi: syncConfirmMethodUi,
    googleUrl: googleUrl,
    getConfirmMethod: getConfirmMethod,
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : global);
