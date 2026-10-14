(function () {
  var state = {
    interval: "month",
    config: null,
    busy: false,
  };

  var els = {
    title: document.getElementById("plansTitle"),
    subtitle: document.getElementById("plansSubtitle"),
    billing: document.getElementById("plansBilling"),
    notice: document.getElementById("plansNotice"),
    grid: document.getElementById("plansGrid"),
    emailRow: document.getElementById("plansEmailRow"),
    email: document.getElementById("plansEmail"),
    footnote: document.getElementById("plansFootnote"),
    error: document.getElementById("plansError"),
  };

  function showError(msg) {
    if (!els.error) return;
    if (!msg) {
      els.error.hidden = true;
      els.error.textContent = "";
      return;
    }
    els.error.hidden = false;
    els.error.textContent = msg;
  }

  function formatPrice(amount, currency) {
    var n = Number(amount) || 0;
    try {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: (currency || "eur").toUpperCase(),
        maximumFractionDigits: n % 1 === 0 ? 0 : 2,
      }).format(n);
    } catch (e) {
      return n + " €";
    }
  }

  function priceOf(plan) {
    return state.interval === "year" ? plan.priceYearly : plan.priceMonthly;
  }

  function setInterval(interval) {
    state.interval = interval === "year" ? "year" : "month";
    var buttons = els.billing ? els.billing.querySelectorAll("[data-interval]") : [];
    buttons.forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-interval") === state.interval);
    });
    renderPlans();
  }

  function renderPlans() {
    if (!els.grid || !state.config) return;
    var plans = state.config.plans || [];
    if (!plans.length) {
      els.grid.innerHTML = '<p class="plans-empty">Aucune formule active pour le moment.</p>';
      return;
    }

    var hasCheckout = plans.some(function (p) {
      return p.ctaMode === "checkout";
    });
    if (els.emailRow) els.emailRow.hidden = !hasCheckout;

    els.grid.innerHTML = plans
      .map(function (plan) {
        var price = priceOf(plan);
        var period = state.interval === "year" ? "/ an" : "/ mois";
        var priceHtml =
          price > 0
            ? formatPrice(price, state.config.currency) + " <span>" + period + "</span>"
            : "Gratuit";
        var trial =
          plan.trialDays > 0
            ? '<p class="plan-trial">' + plan.trialDays + " jours d’essai</p>"
            : "";
        var badge = plan.badge
          ? '<p class="plan-badge">' + escapeHtml(plan.badge) + "</p>"
          : "";
        var features = (plan.features || [])
          .map(function (f) {
            return "<li>" + escapeHtml(f) + "</li>";
          })
          .join("");
        return (
          '<article class="plan-card' +
          (plan.highlighted ? " is-highlight" : "") +
          '" data-plan-id="' +
          escapeHtml(plan.id) +
          '">' +
          badge +
          "<h2>" +
          escapeHtml(plan.name) +
          "</h2>" +
          '<p class="plan-tagline">' +
          escapeHtml(plan.tagline || "") +
          "</p>" +
          '<p class="plan-price">' +
          priceHtml +
          "</p>" +
          trial +
          '<ul class="plan-features">' +
          features +
          "</ul>" +
          '<button type="button" class="btn btn-primary plan-cta" data-plan-id="' +
          escapeHtml(plan.id) +
          '">' +
          escapeHtml(plan.ctaLabel || "Choisir") +
          "</button>" +
          "</article>"
        );
      })
      .join("");

    els.grid.querySelectorAll(".plan-cta").forEach(function (btn) {
      btn.addEventListener("click", function () {
        onChoose(btn.getAttribute("data-plan-id"), btn);
      });
    });
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function onChoose(planId, btn) {
    if (state.busy || !state.config) return;
    var plan = (state.config.plans || []).find(function (p) {
      return p.id === planId;
    });
    if (!plan) return;
    showError("");

    if (plan.ctaMode === "link" || plan.ctaMode === "contact") {
      var url = plan.ctaUrl || state.config.contactUrl || "/index.html#contact";
      window.location.href = url;
      return;
    }
    if (plan.ctaMode === "disabled") {
      showError("Cette formule n’est pas disponible pour le moment.");
      return;
    }

    state.busy = true;
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Redirection Stripe…";
    }

    var payload = {
      planId: plan.id,
      interval: state.interval,
    };
    var email = els.email && els.email.value ? els.email.value.trim() : "";
    if (email) payload.customerEmail = email;

    fetch("/api/stripe/create-subscription-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (r) {
        return r.json().then(function (data) {
          return { ok: r.ok, data: data };
        });
      })
      .then(function (res) {
        if (!res.ok || !res.data || !res.data.url) {
          throw new Error((res.data && res.data.error) || "Impossible de démarrer le paiement.");
        }
        window.location.href = res.data.url;
      })
      .catch(function (err) {
        showError(err.message || "Erreur réseau.");
        state.busy = false;
        if (btn) {
          btn.disabled = false;
          btn.textContent = plan.ctaLabel || "Choisir";
        }
      });
  }

  function boot() {
    var params = new URLSearchParams(location.search);
    if (params.get("canceled") === "1" && els.notice) {
      els.notice.hidden = false;
      els.notice.textContent = "Paiement annulé — vous pouvez choisir une autre formule.";
    }

    fetch("/api/subscription-plans")
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (!data || data.ok === false) {
          throw new Error((data && data.error) || "Chargement impossible.");
        }
        state.config = data;
        if (els.title && data.pageTitle) els.title.textContent = data.pageTitle;
        if (els.subtitle) els.subtitle.textContent = data.pageSubtitle || "";
        if (els.footnote) els.footnote.textContent = data.footnote || "";
        state.interval = data.defaultInterval === "year" ? "year" : "month";
        if (els.billing) {
          els.billing.hidden = !data.billingToggle;
          setInterval(state.interval);
        } else {
          renderPlans();
        }
      })
      .catch(function (err) {
        if (els.grid) {
          els.grid.innerHTML =
            '<p class="plans-empty">Impossible de charger les formules. Réessayez plus tard.</p>';
        }
        showError(err.message || "Erreur de chargement.");
      });

    if (els.billing) {
      els.billing.addEventListener("click", function (ev) {
        var btn = ev.target.closest("[data-interval]");
        if (!btn) return;
        setInterval(btn.getAttribute("data-interval"));
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
