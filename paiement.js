document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("paymentForm");
  var msg = document.getElementById("paymentMsg");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    var category = document.getElementById("category").value;
    var email = document.getElementById("email").value;
    var referenceId = document.getElementById("referenceId").value;
    var amountEur = Number(document.getElementById("amountEur").value || 0);

    if (!category || !email || !amountEur || amountEur <= 0) {
      msg.hidden = false;
      msg.style.color = "#b91c1c";
      msg.textContent = "Merci de remplir les champs requis.";
      return;
    }

    msg.hidden = false;
    msg.style.color = "#0f172a";
    msg.textContent = "Preparation du paiement...";

    try {
      var response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      msg.hidden = false;
      msg.style.color = "#b91c1c";
      msg.textContent = error.message || "Erreur pendant la creation du paiement.";
    }
  });
});
