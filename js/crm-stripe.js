(function () {
  var TOKEN_KEY = "lo_token";
  var token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  var banner = document.getElementById("stBanner");
  var checksEl = document.getElementById("stChecks");
  var jsonEl = document.getElementById("stJson");
  var nextEl = document.getElementById("stNextSteps");
  var urlEl = document.getElementById("stWebhookUrl");

  function setBanner(kind, text) {
    if (!banner) return;
    banner.className = "st-banner " + kind;
    banner.textContent = text;
  }

  function renderChecks(checks) {
    if (!checksEl) return;
    checksEl.innerHTML = (checks || [])
      .map(function (c) {
        return (
          '<article class="st-check ' +
          (c.ok ? "is-ok" : "is-ko") +
          '"><span class="st-dot"></span><div><strong>' +
          escapeHtml(c.label) +
          "</strong><p>" +
          escapeHtml(c.detail || "") +
          "</p></div></article>"
        );
      })
      .join("");
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function load() {
    setBanner("warn", "Vérification Stripe…");
    fetch("/api/stripe/readiness", { headers: { Authorization: "Bearer " + token } })
      .then(function (r) {
        return r.json().then(function (body) {
          return { status: r.status, body: body };
        });
      })
      .then(function (res) {
        var b = res.body || {};
        if (jsonEl) jsonEl.textContent = JSON.stringify(b, null, 2);
        if (urlEl && b.webhookUrl) urlEl.textContent = b.webhookUrl;
        if (nextEl) {
          nextEl.innerHTML = (b.nextSteps || [])
            .map(function (s) {
              return "<li>" + escapeHtml(s) + "</li>";
            })
            .join("");
        }

        if (res.status === 401) {
          setBanner("err", "Session expirée. Reconnectez-vous au CRM.");
          renderChecks([]);
          return;
        }
        if (res.status >= 400) {
          setBanner("err", b.error || "Impossible de lire la configuration Stripe.");
          renderChecks(b.checks || []);
          return;
        }

        renderChecks(
          b.checks || [
            { ok: b.hasSecret, label: "Clé secrète", detail: b.hasSecret ? "Présente" : "Manquante" },
            {
              ok: b.hasWebhookSecret,
              label: "Secret webhook",
              detail: b.hasWebhookSecret ? "Présent" : "Manquant",
            },
          ]
        );

        if (b.fullyConfigured) {
          setBanner(
            "ok",
            "Stripe est prêt" +
              (b.mode ? " (" + b.mode + ")" : "") +
              (b.accountId ? " — compte " + b.accountId : "") +
              ". Checkout et webhook peuvent fonctionner."
          );
        } else if (b.ok && !b.hasWebhookSecret) {
          setBanner(
            "warn",
            "La clé Stripe répond (paiements possibles) mais le webhook n’est pas configuré : les devis CRM ne passeront pas en « acompte payé » automatiquement."
          );
        } else if (b.error) {
          setBanner("err", b.error);
        } else {
          setBanner("warn", "Configuration incomplète. Suivez les étapes ci-dessous.");
        }
      })
      .catch(function (e) {
        setBanner("err", "Réseau : " + e);
      });
  }

  var copyBtn = document.getElementById("btnCopyWh");
  if (copyBtn) {
    copyBtn.onclick = function () {
      var t = urlEl ? urlEl.textContent : "";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(function () {
          copyBtn.textContent = "Copié";
          setTimeout(function () {
            copyBtn.textContent = "Copier";
          }, 1500);
        });
      }
    };
  }

  var refresh = document.getElementById("btnRefresh");
  if (refresh) refresh.onclick = load;
  load();
})();
