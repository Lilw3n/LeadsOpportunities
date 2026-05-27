(function () {
  var TOKEN_KEY = "lo_token";
  var token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  var params = new URLSearchParams(location.search);
  var form = document.getElementById("payForm");
  var quoteId = params.get("quoteId");
  var readinessBtn = document.getElementById("btnStripeReadiness");
  var readinessOut = document.getElementById("stripeReadinessOut");
  var adminPanel = document.getElementById("stripeAdminPanel");

  var user = {};
  try {
    user = JSON.parse(localStorage.getItem("lo_user") || "{}");
  } catch (e) {}
  var isAdmin = user.role === "admin" || user.crm_role === "admin" || user.crmRole === "admin";
  if (isAdmin && adminPanel) adminPanel.hidden = false;

  if (params.get("email") && form.email) form.email.value = params.get("email");
  if (quoteId && form.reference) form.reference.value = quoteId;
  if (params.get("amount") && form.amount) form.amount.value = params.get("amount");
  if (params.get("canceled") === "1") {
    document.getElementById("payMsg").textContent = "Paiement annulé — vous pouvez relancer le checkout.";
  }

  var hint = document.getElementById("quoteHint");
  if (quoteId && hint) {
    hint.textContent = "Devis " + quoteId + " — le montant sera recalculé depuis le serveur.";
    if (form.amount) form.amount.readOnly = true;
  }

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
        .catch(function (e) {
          readinessOut.textContent = String(e);
        });
    };
  }

  form.onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(form);
    var ref = (fd.get("reference") || quoteId || "").trim();
    var msg = document.getElementById("payMsg");
    msg.textContent = "Redirection Stripe…";
    msg.style.color = "";

    var useQuoteEndpoint = ref && ref.indexOf("qte_") === 0;
    var url = useQuoteEndpoint ? "/api/stripe/create-checkout-for-quote" : "/api/stripe/create-checkout-session";
    var payload = useQuoteEndpoint
      ? { quoteId: ref, customerEmail: fd.get("email") }
      : {
          amountEur: Number(fd.get("amount")),
          customerEmail: fd.get("email"),
          category: "insurance",
          requestType: "quote_deposit",
          referenceId: ref || undefined,
          label: "Acompte devis assurance",
        };

    fetch(url, {
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
        if (res.body.url) {
          location.href = res.body.url;
          return;
        }
        msg.style.color = "#b91c1c";
        msg.textContent = res.body.error || "Erreur Stripe";
      })
      .catch(function () {
        msg.style.color = "#b91c1c";
        msg.textContent = "Impossible de contacter le serveur de paiement.";
      });
  };
})();
