/**
 * Compte client — inscription via formulaire vendeur, Google, confirmation mail/tél.
 */
(function (global) {
  var TOKEN_KEY = "lo_ext_token";
  var EMAIL_KEY = "lo_client_email";

  function qs(sel, root) {
    return (root || document).querySelector(sel);
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
      } else {
        badge.hidden = true;
      }
    }
    var googleBtn = qs("[data-account-google]", root);
    if (googleBtn) googleBtn.href = googleUrl();
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

  function bind(root) {
    if (!root || root.dataset.accountBound) return;
    root.dataset.accountBound = "1";
    handleOAuthReturn();
    var form = qs("[data-url-capture-form]", root);
    prefillFromSession(form);
    updateAccountUi(root);
    bindResendVerify(root);
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
    googleUrl: googleUrl,
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : global);
