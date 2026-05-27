document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("paymentForm");
  var msg = document.getElementById("paymentMsg");
  var authStatus = document.getElementById("authStatus");
  var TOKEN_KEY = "lo_token";

  if (!form) return;

  function setMsg(text, isError) {
    if (!msg) return;
    msg.hidden = false;
    msg.style.color = isError ? "#b91c1c" : "#0f172a";
    msg.textContent = text;
  }

  function authHeaders() {
    var token = localStorage.getItem(TOKEN_KEY);
    if (!token) return {};
    return { Authorization: "Bearer " + token };
  }

  function renderAuthGuest() {
    if (!authStatus) return;
    authStatus.className = "pay-auth pay-auth--guest";
    authStatus.innerHTML =
      "<strong>Paiement invite</strong> — aucune connexion requise pour regler un acompte. " +
      '<a href="./auth.html">Se connecter</a> (optionnel, equipe / espace pro).';
  }

  function renderAuthUser(user) {
    if (!authStatus) return;
    var label = user.fullName || user.email || "Compte connecte";
    authStatus.className = "pay-auth pay-auth--user";
    authStatus.innerHTML =
      "<strong>Connecte :</strong> " +
      escapeHtml(label) +
      " — paiement associe a votre session. " +
      '<a href="./crm.html">CRM</a> · <a href="#" id="payLogout">Deconnexion</a>';
    var logout = document.getElementById("payLogout");
    if (logout) {
      logout.addEventListener("click", function (e) {
        e.preventDefault();
        localStorage.removeItem(TOKEN_KEY);
        renderAuthGuest();
      });
    }
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function loadAuthStatus() {
    var token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      renderAuthGuest();
      return;
    }
    try {
      var res = await fetch("/api/me", { headers: authHeaders() });
      var data = await res.json();
      if (res.ok && data.user) {
        renderAuthUser(data.user);
        var emailInput = document.getElementById("email");
        if (emailInput && data.user.email && !emailInput.value) {
          emailInput.value = data.user.email;
        }
      } else {
        localStorage.removeItem(TOKEN_KEY);
        renderAuthGuest();
      }
    } catch (e) {
      renderAuthGuest();
    }
  }

  var params = new URLSearchParams(window.location.search);
  if (params.get("canceled") === "1") {
    setMsg("Paiement annule. Vous pouvez reessayer quand vous voulez.", false);
  }

  loadAuthStatus();

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    var category = document.getElementById("category").value;
    var email = document.getElementById("email").value.trim();
    var referenceId = document.getElementById("referenceId").value.trim();
    var amountEur = Number(document.getElementById("amountEur").value || 0);

    if (!category || !email || !amountEur || amountEur <= 0) {
      setMsg("Merci de remplir les champs requis.", true);
      return;
    }

    if (amountEur > 5000) {
      setMsg("Montant maximum 5 000 EUR en paiement en ligne. Contactez-nous pour un montant superieur.", true);
      return;
    }

    setMsg("Redirection vers la page de paiement securisee Stripe…", false);

    try {
      var response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: Object.assign({ "Content-Type": "application/json" }, authHeaders()),
        body: JSON.stringify({
          amountEur: amountEur,
          customerEmail: email,
          category: category,
          requestType: "devis_acompte",
          referenceId: referenceId || "none",
          label: "Acompte dossier Leads Opportunities",
        }),
      });

      var data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erreur de creation de paiement.");
      }

      if (typeof window.gtag === "function") {
        window.gtag("event", "begin_checkout", {
          event_category: "payment",
          event_label: category,
          value: amountEur,
          currency: "EUR",
        });
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL Stripe manquante.");
      }
    } catch (error) {
      setMsg(error.message || "Erreur pendant la creation du paiement.", true);
    }
  });
});
