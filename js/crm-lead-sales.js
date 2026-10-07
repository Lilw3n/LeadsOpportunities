/**
 * CRM — ventes de leads, prix ajustable, dû partenaire, lien Stripe.
 */
(function () {
  var TOKEN_KEY = "lo_token";
  var token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  var Split = window.LeadSaleSplit;
  var statusEl = document.getElementById("lsStatus");
  var tbody = document.getElementById("lsTableBody");
  var createStripeAfterSave = false;

  function authHeaders() {
    return {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    };
  }

  function setStatus(text, ok) {
    if (!statusEl) return;
    statusEl.textContent = text || "";
    statusEl.className = "ls-status" + (text ? (ok ? " is-ok" : " is-error") : "");
  }

  function euro(n) {
    var v = Number(n) || 0;
    return (
      v.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " €"
    );
  }

  function fmtDate(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return String(iso);
    }
  }

  function statusLabel(s) {
    return (
      {
        draft: "Brouillon",
        link_sent: "Lien envoyé",
        paid: "Payé Stripe",
        sold_manual: "Vendu (manuel)",
        cancelled: "Annulé",
      }[s] || s
    );
  }

  function readForm() {
    return {
      label: document.getElementById("lsLabel").value.trim(),
      vertical: document.getElementById("lsVertical").value.trim(),
      supplierName: document.getElementById("lsSupplierName").value.trim() || "Partenaire",
      supplierPriceEur: Number(document.getElementById("lsSupplierPrice").value),
      partnerSharePct: Number(document.getElementById("lsPartnerPct").value),
      salePriceEur: Number(document.getElementById("lsSalePrice").value),
      buyerEmail: document.getElementById("lsBuyerEmail").value.trim(),
      notes: document.getElementById("lsNotes").value.trim(),
      hideSaleFromPartner: true,
    };
  }

  function updatePreview() {
    if (!Split) return;
    var f = readForm();
    var s = Split.compute(f);
    document.getElementById("lsPrevDue").textContent = euro(s.partnerDueEur);
    document.getElementById("lsPrevKeep").textContent = euro(s.youKeepEur);
    document.getElementById("lsPrevPartnerView").textContent =
      euro(s.partnerDueEur) + " (sans prix de vente)";
  }

  ["lsSupplierPrice", "lsPartnerPct", "lsSalePrice"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", updatePreview);
      el.addEventListener("change", updatePreview);
    }
  });
  updatePreview();

  function renderTotals(t) {
    t = t || {};
    document.getElementById("lsDueOpen").textContent = euro(t.partnerDueOpen);
    document.getElementById("lsDueSettled").textContent = euro(t.partnerDueSettled);
    document.getElementById("lsYouKeep").textContent = euro(t.youKeepPaid);
    document.getElementById("lsVolume").textContent = euro(t.saleVolumePaid);
  }

  function renderTable(sales) {
    if (!sales || !sales.length) {
      tbody.innerHTML = '<tr><td colspan="9" class="ls-empty">Aucune vente pour l’instant.</td></tr>';
      return;
    }
    tbody.innerHTML = "";
    sales.forEach(function (s) {
      var tr = document.createElement("tr");
      var settled =
        s.partnerSettledAt
          ? '<div class="ls-settled">Réglé ' + fmtDate(s.partnerSettledAt) + "</div>"
          : "";
      tr.innerHTML =
        "<td>" +
        fmtDate(s.createdAt) +
        "</td><td>" +
        esc(s.label) +
        (s.vertical ? "<br><small>" + esc(s.vertical) + "</small>" : "") +
        "</td><td>" +
        esc(s.supplierName) +
        "</td><td>" +
        euro(s.supplierPriceEur) +
        "</td><td><strong>" +
        euro(s.salePriceEur) +
        "</strong></td><td>" +
        euro(s.partnerDueEur) +
        settled +
        "</td><td>" +
        euro(s.youKeepEur) +
        '</td><td><span class="ls-badge ls-badge--' +
        esc(s.status) +
        '">' +
        esc(statusLabel(s.status)) +
        '</span></td><td class="ls-actions" data-id="' +
        esc(s.id) +
        '"></td>';
      var actions = tr.querySelector(".ls-actions");
      if (s.status !== "cancelled" && s.status !== "paid") {
        addBtn(actions, "Stripe", function () {
          createStripe(s.id);
        });
      }
      if (s.paymentUrl) {
        var a = document.createElement("a");
        a.href = s.paymentUrl;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = "Ouvrir lien";
        actions.appendChild(a);
      }
      if (s.status !== "paid" && s.status !== "sold_manual" && s.status !== "cancelled") {
        addBtn(actions, "Vendu manuel", function () {
          patchSale(s.id, { status: "sold_manual" });
        });
      }
      if (
        (s.status === "paid" || s.status === "sold_manual") &&
        !s.partnerSettledAt
      ) {
        addBtn(actions, "J’ai payé le pote", function () {
          var note = window.prompt("Note (facultatif) — ex. virement 12/10", "") || "";
          patchSale(s.id, { partnerSettled: true, partnerSettledNote: note });
        });
      }
      if (s.status !== "cancelled") {
        addBtn(actions, "Annuler", function () {
          if (window.confirm("Annuler cette vente ?")) {
            patchSale(s.id, { status: "cancelled" });
          }
        });
      }
      tbody.appendChild(tr);
    });
  }

  function addBtn(parent, label, fn) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.addEventListener("click", fn);
    parent.appendChild(b);
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  async function loadSales() {
    try {
      var res = await fetch("/api/crm/lead-sales?limit=100", { headers: authHeaders() });
      var data = await res.json();
      if (!res.ok || !data.ok) {
        tbody.innerHTML =
          '<tr><td colspan="9" class="ls-empty">' +
          esc(data.error || "Erreur chargement") +
          "</td></tr>";
        return;
      }
      renderTotals(data.totals);
      renderTable(data.sales);
    } catch (e) {
      tbody.innerHTML =
        '<tr><td colspan="9" class="ls-empty">Erreur réseau</td></tr>';
    }
  }

  async function patchSale(id, body) {
    setStatus("Mise à jour…", true);
    try {
      var res = await fetch("/api/crm/lead-sales", {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(Object.assign({ id: id }, body)),
      });
      var data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus(data.error || "Échec", false);
        return;
      }
      setStatus("Mis à jour.", true);
      loadSales();
    } catch (e) {
      setStatus("Erreur réseau", false);
    }
  }

  async function createStripe(saleId) {
    setStatus("Création du lien Stripe…", true);
    try {
      var res = await fetch("/api/stripe/create-lead-sale-checkout", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ saleId: saleId }),
      });
      var data = await res.json();
      if (!res.ok || !data.url) {
        setStatus(data.error || "Stripe indisponible", false);
        return;
      }
      setStatus(
        "Lien prêt — dû partenaire " + euro(data.split && data.split.partnerDueEur) + " (interne).",
        true
      );
      if (navigator.clipboard && data.url) {
        try {
          await navigator.clipboard.writeText(data.url);
          setStatus("Lien Stripe copié. Dû partenaire : " + euro(data.split.partnerDueEur), true);
        } catch (e) {}
      }
      window.open(data.url, "_blank", "noopener");
      loadSales();
    } catch (e) {
      setStatus("Erreur Stripe", false);
    }
  }

  async function saveSale(thenStripe) {
    var body = readForm();
    if (!body.label) {
      setStatus("Libellé requis", false);
      return;
    }
    if (!(body.supplierPriceEur >= 0) || !(body.salePriceEur > 0)) {
      setStatus("Prix de vente requis (> 0)", false);
      return;
    }
    setStatus("Enregistrement…", true);
    try {
      var res = await fetch("/api/crm/lead-sales", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      var data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus(data.error || "Échec", false);
        return;
      }
      setStatus(
        "Vente créée — dû " +
          euro(data.sale.partnerDueEur) +
          " · tu gardes " +
          euro(data.sale.youKeepEur),
        true
      );
      document.getElementById("lsForm").reset();
      document.getElementById("lsPartnerPct").value = "50";
      document.getElementById("lsSupplierName").value = "Partenaire";
      updatePreview();
      await loadSales();
      if (thenStripe && data.sale && data.sale.id) {
        await createStripe(data.sale.id);
      }
    } catch (e) {
      setStatus("Erreur réseau", false);
    }
  }

  document.getElementById("lsForm").addEventListener("submit", function (e) {
    e.preventDefault();
    saveSale(createStripeAfterSave);
    createStripeAfterSave = false;
  });

  document.getElementById("lsSaveAndStripe").addEventListener("click", function () {
    createStripeAfterSave = true;
    document.getElementById("lsForm").requestSubmit();
  });

  document.getElementById("lsRefresh").addEventListener("click", loadSales);

  if (new URLSearchParams(location.search).get("canceled") === "1") {
    setStatus("Paiement Stripe annulé — la vente reste en brouillon / lien envoyé.", false);
  }

  loadSales();
})();
