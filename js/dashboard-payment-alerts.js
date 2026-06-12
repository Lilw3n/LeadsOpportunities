/**
 * Suivi paiements Stripe — verification, notifications, decision dossier
 */
(function () {
  var LS_LAST_NOTIFY = "lo_payments_last_notify_at";
  var pollTimer = null;
  var state = { links: [], counts: {}, tableMissing: false };

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function toast(msg, type) {
    if (window.Dashboard && typeof window.Dashboard.showBanner === "function") {
      window.Dashboard.showBanner(msg, type === "error" ? "error" : "success");
      return;
    }
    var el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.className = "toast " + (type || "success") + " show";
    setTimeout(function () {
      el.classList.remove("show");
    }, 4500);
  }

  function formatEur(n) {
    if (n == null || isNaN(n)) return "—";
    return Number(n).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
  }

  function formatDate(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return iso;
    }
  }

  function kindLabel(kind) {
    var map = {
      dossier_fee: "Frais de dossier",
      subscription: "Abonnement",
      acompte: "Acompte",
      one_time: "Paiement",
      quote_deposit: "Acompte devis",
    };
    return map[kind] || kind || "Paiement";
  }

  function dossierLabel(status) {
    var map = {
      awaiting_payment: "En attente de paiement",
      paid_pending_review: "Paye — a traiter",
      in_progress: "Dossier en cours",
      dismissed: "Ignore",
    };
    return map[status] || status;
  }

  function updateNavBadge(count) {
    var badge = document.getElementById("mailboxNavBadge");
    if (!badge) return;
    if (count > 0) {
      badge.hidden = false;
      badge.textContent = String(count);
      badge.title = count + " paiement(s) a traiter";
    } else {
      badge.hidden = true;
    }
  }

  function notifyNewPayments(count) {
    if (count <= 0) return;
    toast(count + " paiement(s) recu(s) — choisissez si vous traitez le dossier", "success");
    try {
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("Paiement Stripe recu", {
          body: count + " lien(s) paye(s). Ouvrez la messagerie pour traiter les dossiers.",
          icon: "/favicon.ico",
        });
      }
    } catch (e) {}
  }

  function renderList() {
    var list = document.getElementById("mbxPaymentsList");
    var badge = document.getElementById("mbxPaymentsBadge");
    var hint = document.getElementById("mbxPaymentsHint");
    if (!list) return;

    var pendingReview = (state.counts && state.counts.paid_pending_review) || 0;
    var pendingPay = (state.counts && state.counts.pending_payment) || 0;

    if (badge) {
      badge.textContent = pendingReview
        ? pendingReview + " a traiter"
        : pendingPay
          ? pendingPay + " en attente"
          : "A jour";
      badge.className =
        "mbx-payments-badge" + (pendingReview ? " mbx-payments-badge--alert" : "");
    }
    updateNavBadge(pendingReview);

    if (state.tableMissing) {
      list.innerHTML =
        '<p class="mbx-payments-empty">Table stripe_payment_links absente — executez database/stripe-payment-links.sql sur Neon.</p>';
      if (hint) hint.textContent = "";
      return;
    }

    var items = (state.links || []).filter(function (l) {
      return (
        l.dossier_status === "paid_pending_review" ||
        l.dossier_status === "in_progress" ||
        (l.payment_status === "pending" && l.dossier_status === "awaiting_payment")
      );
    });

    if (!items.length) {
      list.innerHTML =
        '<p class="mbx-payments-empty">Aucun lien en attente. Les paiements recus apparaitront ici.</p>';
      if (hint) hint.textContent = pendingPay ? pendingPay + " lien(s) envoyes, paiement non recu" : "";
      return;
    }

    if (hint) {
      hint.textContent =
        pendingReview +
        " paye(s) a valider · " +
        pendingPay +
        " en attente de paiement client";
    }

    list.innerHTML = items
      .map(function (link) {
        var paid = link.payment_status === "paid";
        var quoteBtn =
          link.reference_id && String(link.reference_id).indexOf("qte_") === 0
            ? '<a class="btn-ghost mbx-pay-btn" href="./crm-quote-detail.html?id=' +
              encodeURIComponent(link.reference_id) +
              '" target="_blank" rel="noopener">Voir devis</a>'
            : "";
        var actions = "";
        if (paid && link.dossier_status === "paid_pending_review") {
          actions =
            '<button type="button" class="btn btn-primary mbx-pay-btn" data-action="in_progress" data-id="' +
            esc(link.id) +
            '">Traiter le dossier</button>' +
            '<button type="button" class="btn-ghost mbx-pay-btn" data-action="dismissed" data-id="' +
            esc(link.id) +
            '">Ignorer</button>';
        } else if (link.dossier_status === "in_progress") {
          actions =
            '<button type="button" class="btn-ghost mbx-pay-btn" data-action="dismissed" data-id="' +
            esc(link.id) +
            '">Cloturer / ignorer</button>';
        }

        return (
          '<article class="mbx-pay-item' +
          (paid && link.dossier_status === "paid_pending_review" ? " mbx-pay-item--new" : "") +
          '">' +
          '<div class="mbx-pay-item__main">' +
          '<strong>' +
          esc(link.customer_email || "Client") +
          "</strong>" +
          '<span class="mbx-pay-item__amount">' +
          formatEur(link.amount_eur) +
          "</span>" +
          '<span class="mbx-pay-item__kind">' +
          esc(link.label || kindLabel(link.payment_kind)) +
          "</span>" +
          '<span class="mbx-pay-item__status">' +
          esc(dossierLabel(link.dossier_status)) +
          (paid && link.paid_at ? " · " + formatDate(link.paid_at) : "") +
          "</span>" +
          "</div>" +
          '<div class="mbx-pay-item__actions">' +
          actions +
          quoteBtn +
          "</div></article>"
        );
      })
      .join("");

    list.querySelectorAll("[data-action]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setDossierStatus(btn.getAttribute("data-id"), btn.getAttribute("data-action"));
      });
    });
  }

  async function setDossierStatus(id, status) {
    var data = await window.Dashboard.api("/api/dashboard/payment-links", {
      method: "PATCH",
      body: JSON.stringify({ id: id, dossierStatus: status }),
    });
    if (!data.ok) {
      toast(data.error || "Erreur", "error");
      return;
    }
    toast(status === "in_progress" ? "Dossier marque en traitement" : "Dossier ignore");
    loadPayments({ silent: true });
  }

  async function loadPayments(opts) {
    opts = opts || {};
    var all = await window.Dashboard.api("/api/dashboard/payment-links?limit=40");
    if (!all.ok && !all.tableMissing) {
      if (!opts.silent) toast(all.error || "Impossible de charger les paiements", "error");
      return;
    }
    state.links = all.links || [];
    state.counts = all.counts || {};
    state.tableMissing = !!all.tableMissing;

    renderList();

    if (!opts.silent) {
      var lastNotify = localStorage.getItem(LS_LAST_NOTIFY);
      var fresh = (state.links || []).filter(function (l) {
        return (
          l.payment_status === "paid" &&
          l.dossier_status === "paid_pending_review" &&
          l.paid_at &&
          (!lastNotify || new Date(l.paid_at) > new Date(lastNotify))
        );
      });
      if (fresh.length) {
        notifyNewPayments(fresh.length);
        localStorage.setItem(LS_LAST_NOTIFY, new Date().toISOString());
      }
    }
  }

  async function syncPayments() {
    var btn = document.getElementById("mbxPaymentsSync");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Verification…";
    }
    var data = await window.Dashboard.api("/api/dashboard/payment-links", { method: "POST" });
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Verifier les paiements";
    }
    if (!data.ok) {
      toast(data.error || "Sync impossible", "error");
      return;
    }
    if (data.synced > 0) {
      toast(data.synced + " paiement(s) detecte(s) sur Stripe", "success");
    } else {
      toast("Aucun nouveau paiement", "success");
    }
    loadPayments({ silent: true });
  }

  function bindUi() {
    var syncBtn = document.getElementById("mbxPaymentsSync");
    if (syncBtn) syncBtn.addEventListener("click", syncPayments);

    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(function () {});
    }

    loadPayments({});
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(function () {
      loadPayments({ silent: true });
    }, 45000);
    setInterval(function () {
      syncPaymentsQuiet();
    }, 180000);
  }

  async function syncPaymentsQuiet() {
    var data = await window.Dashboard.api("/api/dashboard/payment-links", { method: "POST" });
    if (data.ok && data.synced > 0) loadPayments({});
  }

  window.DashboardPayments = {
    load: loadPayments,
    sync: syncPayments,
    trackLink: function (info) {
      var status = document.getElementById("mailboxStripeStatus");
      if (!status || !info || !info.sessionId) return;
      status.textContent =
        "Lien cree — en attente de paiement. Verification automatique active.";
      status.className = "mbx-stripe-status is-ok";
      loadPayments({ silent: true });
    },
  };

  document.addEventListener("DOMContentLoaded", bindUi);
})();
