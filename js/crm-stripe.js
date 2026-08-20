(function () {
  var TOKEN_KEY = "lo_token";
  var token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  var LABELS = {
    one_time: "Paiement",
    subscription: "Abonnement",
    dossier_fee: "Frais de dossier",
    acompte: "Acompte",
  };

  var MAIL = {
    one_time:
      "Bonjour,\n\nMerci de régler ce paiement via le lien sécurisé ci-dessous :\n\n{{URL}}\n\nBien cordialement,\nLeads Opportunities",
    subscription:
      "Bonjour,\n\nVoici le lien pour activer votre abonnement :\n\n{{URL}}\n\nLe prélèvement sera effectué selon la périodicité indiquée.\n\nBien cordialement,\nLeads Opportunities",
    dossier_fee:
      "Bonjour,\n\nMerci de régler les frais de dossier via le lien sécurisé ci-dessous :\n\n{{URL}}\n\nBien cordialement,\nLeads Opportunities",
    acompte:
      "Bonjour,\n\nMerci de régler l'acompte relatif à votre devis via le lien sécurisé ci-dessous :\n\n{{URL}}\n\nBien cordialement,\nLeads Opportunities",
  };

  var kindEl = document.getElementById("stripeKind");
  var intervalWrap = document.getElementById("stripeIntervalWrap");
  var form = document.getElementById("stripeHubForm");
  var statusEl = document.getElementById("stripeHubStatus");
  var resultEl = document.getElementById("stripeHubResult");
  var resultUrl = document.getElementById("stripeHubResultUrl");
  var resultTitle = document.getElementById("stripeHubResultTitle");
  var resultMeta = document.getElementById("stripeHubResultMeta");
  var openUrl = document.getElementById("stripeOpenUrl");
  var submitBtn = document.getElementById("stripeHubSubmit");
  var lastLink = { url: "", kind: "one_time" };

  function setStatus(text, ok) {
    if (!statusEl) return;
    statusEl.textContent = text || "";
    statusEl.className = "stripe-hub-status" + (text ? (ok ? " is-ok" : " is-error") : "");
  }

  function syncInterval() {
    var isSub = kindEl && kindEl.value === "subscription";
    if (intervalWrap) intervalWrap.hidden = !isSub;
    var label = document.getElementById("stripeLabel");
    if (label && !label.value) {
      label.placeholder = LABELS[kindEl.value] || "Paiement";
    }
  }

  if (kindEl) {
    kindEl.addEventListener("change", syncInterval);
    syncInterval();
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    var ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  var copyUrlBtn = document.getElementById("stripeCopyUrl");
  if (copyUrlBtn) {
    copyUrlBtn.addEventListener("click", function () {
      if (!lastLink.url) return;
      copyText(lastLink.url).then(function () {
        setStatus("Lien copié.", true);
      });
    });
  }

  var copyMailBtn = document.getElementById("stripeCopyMail");
  if (copyMailBtn) {
    copyMailBtn.addEventListener("click", function () {
      if (!lastLink.url) return;
      var tpl = MAIL[lastLink.kind] || MAIL.one_time;
      copyText(tpl.replace("{{URL}}", lastLink.url)).then(function () {
        setStatus("Texte d’e-mail copié.", true);
      });
    });
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var kind = kindEl.value;
      var amount = Number(document.getElementById("stripeAmount").value);
      var email = String(document.getElementById("stripeEmail").value || "").trim();
      var label = String(document.getElementById("stripeLabel").value || "").trim();
      var quoteRef = String(document.getElementById("stripeQuote").value || "").trim();
      var interval = document.getElementById("stripeInterval").value;

      if (!amount || amount <= 0) {
        setStatus("Indiquez un montant.", false);
        return;
      }
      if (email && email.indexOf("@") === -1) {
        setStatus("E-mail invalide — laissez vide si vous ne l’avez pas.", false);
        return;
      }

      var payload = {
        paymentKind: kind,
        label: label || LABELS[kind] || "Paiement",
        amountEur: amount,
      };
      if (email) payload.customerEmail = email;
      if (kind === "subscription") payload.interval = interval;
      if (quoteRef) payload.referenceId = quoteRef;

      submitBtn.disabled = true;
      setStatus("Génération du lien Stripe…", true);
      if (resultEl) resultEl.hidden = true;

      fetch("/api/stripe/create-mailbox-payment-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      })
        .then(function (r) {
          return r.json().then(function (body) {
            return { ok: r.ok, body: body };
          });
        })
        .then(function (res) {
          submitBtn.disabled = false;
          if (!res.body.url) {
            setStatus(res.body.error || "Impossible de créer le lien Stripe.", false);
            return;
          }
          lastLink = { url: res.body.url, kind: kind };
          resultUrl.href = res.body.url;
          resultUrl.textContent = res.body.url;
          openUrl.href = res.body.url;
          var bits = [];
          bits.push((res.body.label || LABELS[kind]) + " · " + Number(res.body.amountEur).toLocaleString("fr-FR") + " €");
          if (res.body.interval) {
            var iv = { month: "mensuel", year: "annuel", week: "hebdomadaire" };
            bits.push(iv[res.body.interval] || res.body.interval);
          }
          if (res.body.quoteTitle) bits.push(res.body.quoteTitle);
          resultTitle.textContent =
            kind === "subscription" ? "Lien d’abonnement prêt" : "Lien de paiement prêt";
          resultMeta.textContent = bits.join(" · ");
          resultEl.hidden = false;
          setStatus("Lien généré. Copiez-le ou ouvrez-le pour tester.", true);
        })
        .catch(function () {
          submitBtn.disabled = false;
          setStatus("Impossible de contacter le serveur de paiement.", false);
        });
    });
  }

  var user = {};
  try {
    user = JSON.parse(localStorage.getItem("lo_user") || "{}");
  } catch (e) {}
  var isAdmin = user.role === "admin" || user.crm_role === "admin" || user.crmRole === "admin";
  var adminPanel = document.getElementById("stripeAdminPanel");
  if (isAdmin && adminPanel) adminPanel.hidden = false;

  var readinessBtn = document.getElementById("btnStripeReadiness");
  var readinessOut = document.getElementById("stripeReadinessOut");
  if (readinessBtn && readinessOut) {
    readinessBtn.onclick = function () {
      readinessOut.textContent = "Vérification Stripe…";
      fetch("/api/stripe/readiness", { headers: { Authorization: "Bearer " + token } })
        .then(function (r) {
          return r.json().then(function (body) {
            return { status: r.status, body: body };
          });
        })
        .then(function (res) {
          readinessOut.textContent = JSON.stringify(res.body, null, 2);
          if (res.status === 403) readinessOut.textContent = "Accès réservé aux administrateurs CRM.";
        })
        .catch(function (err) {
          readinessOut.textContent = String(err);
        });
    };
  }

  var params = new URLSearchParams(location.search);
  if (params.get("email")) document.getElementById("stripeEmail").value = params.get("email");
  if (params.get("amount")) document.getElementById("stripeAmount").value = params.get("amount");
  if (params.get("quoteId")) document.getElementById("stripeQuote").value = params.get("quoteId");
  if (params.get("kind")) {
    kindEl.value = params.get("kind");
    syncInterval();
  }
})();
