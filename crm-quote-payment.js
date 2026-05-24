(function () {
  var params = new URLSearchParams(location.search);
  var form = document.getElementById("payForm");
  var TOKEN_KEY = "lo_token";
  var quoteId = params.get("quoteId");
  var token = localStorage.getItem(TOKEN_KEY);

  if (params.get("email")) form.email.value = params.get("email");
  if (quoteId) form.reference.value = quoteId;
  if (params.get("amount")) form.amount.value = params.get("amount");

  form.onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(form);
    document.getElementById("payMsg").textContent = "Redirection Stripe…";

    var useQuoteEndpoint = quoteId && quoteId.indexOf("qte_") === 0 && token;
    var url = useQuoteEndpoint
      ? "/api/stripe/create-checkout-for-quote"
      : "/api/stripe/create-checkout-session";
    var payload = useQuoteEndpoint
      ? { quoteId: quoteId, customerEmail: fd.get("email") }
      : {
          amountEur: Number(fd.get("amount")),
          customerEmail: fd.get("email"),
          category: "insurance",
          requestType: "quote_deposit",
          referenceId: fd.get("reference"),
          label: "Acompte devis assurance",
        };

    var headers = { "Content-Type": "application/json" };
    if (useQuoteEndpoint) headers.Authorization = "Bearer " + token;

    fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (res.url) location.href = res.url;
        else document.getElementById("payMsg").textContent = res.error || "Erreur Stripe";
      });
  };
})();
