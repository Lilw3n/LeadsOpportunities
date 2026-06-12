(function () {
  var TOKEN_KEY = "lo_token";

  function token() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function esc(s) {
    if (s == null) return "";
    var d = document.createElement("div");
    d.textContent = String(s);
    return d.innerHTML;
  }

  function api(path, opts) {
    return fetch(path, {
      method: (opts && opts.method) || "GET",
      headers: Object.assign(
        { "Content-Type": "application/json" },
        token() ? { Authorization: "Bearer " + token() } : {}
      ),
      body: opts && opts.body ? JSON.stringify(opts.body) : undefined,
    }).then(function (r) {
      return r.json();
    });
  }

  var allQuotes = [];
  var statusFilter = "";

  function renderQuotes(quotes) {
    var el = document.getElementById("quotesList");
    var list = quotes.filter(function (q) {
      if (!statusFilter) return true;
      return String(q.status || "").toLowerCase().indexOf(statusFilter) >= 0;
    });
    if (!list.length) {
      el.innerHTML = "<p>Aucun devis pour ce filtre.</p>";
      return;
    }
    el.innerHTML =
      "<table><thead><tr><th>Date</th><th>Contact</th><th>Produit</th><th>Statut</th><th></th></tr></thead><tbody>" +
      list
          .map(function (q) {
            var name = ((q.first_name || "") + " " + (q.last_name || "")).trim() || q.email;
            return (
              "<tr><td>" +
              new Date(q.created_at).toLocaleDateString("fr-FR") +
              "</td><td>" +
              esc(name) +
              "</td><td>" +
              esc(q.product_type) +
              "</td><td>" +
              esc(q.status) +
              '</td><td><a href="./crm-quote-editor.html?id=' +
              encodeURIComponent(q.id) +
              '">Devis LO</a> · <a href="./crm-quote-document.html?id=' +
              encodeURIComponent(q.id) +
              '" target="_blank" rel="noopener">PDF</a> · <a href="./crm-quote-detail.html?id=' +
              encodeURIComponent(q.id) +
              '">Fiche</a> · <a href="./crm-contact.html?id=' +
              encodeURIComponent(q.contact_id) +
              '">Contact</a> · <a href="./crm-quote-payment.html?quoteId=' +
              encodeURIComponent(q.id) +
              "&email=" +
              encodeURIComponent(q.email || "") +
              '">Acompte</a></td></tr>"
            );
          })
          .join("") +
        "</tbody></table>";
  }

  function load() {
    if (!token()) {
      location.href = "./crm.html";
      return;
    }
    api("/api/crm/quotes").then(function (res) {
      if (!res.ok || !res.quotes || !res.quotes.length) {
        document.getElementById("quotesList").innerHTML =
          "<p>Aucun devis — creez-en un ou executez database/crm-quotes.sql sur Neon.</p>";
        return;
      }
      allQuotes = res.quotes;
      renderQuotes(allQuotes);
    });
  }

  var filters = document.getElementById("quoteFilters");
  if (filters) {
    filters.querySelectorAll("button").forEach(function (btn) {
      btn.onclick = function () {
        statusFilter = btn.getAttribute("data-st") || "";
        filters.querySelectorAll("button").forEach(function (b) {
          b.classList.toggle("active", b === btn);
        });
        renderQuotes(allQuotes);
      };
    });
  }

  document.getElementById("btnNewQuote").onclick = function () {
    document.getElementById("quoteModal").classList.remove("hidden");
  };
  document.getElementById("quoteForm").onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    api("/api/crm/quotes", {
      method: "POST",
      body: {
        contactId: fd.get("contactId"),
        productType: fd.get("productType"),
        title: fd.get("title"),
        data: { notes: fd.get("notes") },
      },
    }).then(function (res) {
      if (res.ok) {
        document.getElementById("quoteModal").classList.add("hidden");
        load();
      } else alert(res.error || "Erreur");
    });
  };
  load();
})();
