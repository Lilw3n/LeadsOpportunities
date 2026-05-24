(function () {
  var TOKEN_KEY = "lo_ext_token";
  var EMAIL_KEY = "lo_client_email";

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function norm(s) {
    s = String(s == null ? "" : s).toLowerCase();
    try {
      if (s.normalize) return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    } catch (e) {}
    return s;
  }

  if (!localStorage.getItem(TOKEN_KEY) || !localStorage.getItem(EMAIL_KEY)) {
    location.href = "./login.html";
    return;
  }

  var email = localStorage.getItem(EMAIL_KEY);

  function row(label, title, subtitle, href) {
    var inner =
      '<div class="sr-badge">' +
      esc(label) +
      "</div><h3>" +
      esc(title) +
      "</h3><p>" +
      esc(subtitle) +
      "</p>";
    if (href) {
      return (
        '<a href="' +
        esc(href) +
        '" class="sr-card" style="display:block;text-decoration:none;color:inherit">' +
        inner +
        "</a>"
      );
    }
    return '<div class="sr-card">' + inner + "</div>";
  }

  function buildIndex(data) {
    var items = [];
    var p = data.profile;
    if (p) {
      items.push({
        label: "Profil",
        title: ((p.firstName || "") + " " + (p.lastName || "")).trim() || p.email,
        subtitle: [p.email, p.phone, p.company].filter(Boolean).join(" · "),
        hay: [p.firstName, p.lastName, p.email, p.phone, p.company, p.status],
        href: "profile.html",
      });
    }
    (data.requests || []).forEach(function (r) {
      items.push({
        label: "Demande",
        title: r.request_type || r.product_type || "Demande",
        subtitle: (r.status || "") + " · " + new Date(r.created_at).toLocaleDateString("fr-FR"),
        hay: [r.request_type, r.product_type, r.status, r.id],
        href: null,
      });
    });
    (data.quotes || []).forEach(function (q) {
      items.push({
        label: "Devis",
        title: q.title || q.product_type || "Devis",
        subtitle: (q.status || "") + (q.premium_estimate ? " · ~" + Number(q.premium_estimate).toLocaleString("fr-FR") + " €" : ""),
        hay: [q.title, q.product_type, q.status, String(q.premium_estimate), q.id],
        href: "devis-wizard.html",
      });
    });
    (data.contracts || []).forEach(function (ct) {
      items.push({
        label: "Contrat",
        title: ct.policy_number || ct.contract_type || "Contrat",
        subtitle: [ct.insurer, ct.status, ct.end_date ? "fin " + new Date(ct.end_date).toLocaleDateString("fr-FR") : ""]
          .filter(Boolean)
          .join(" · "),
        hay: [ct.policy_number, ct.contract_type, ct.insurer, ct.status, ct.id],
        href: "dashboard.html",
      });
    });
    (data.claims || []).forEach(function (cl) {
      items.push({
        label: "Sinistre",
        title: cl.claim_type || "Sinistre",
        subtitle: (cl.status || "") + (cl.claim_date ? " · " + new Date(cl.claim_date).toLocaleDateString("fr-FR") : ""),
        hay: [cl.claim_type, cl.status, cl.amount, cl.id],
        href: "claim-declare.html",
      });
    });
    (data.vehicles || []).forEach(function (v) {
      items.push({
        label: "Véhicule",
        title: v.registration || [v.brand, v.model].filter(Boolean).join(" ") || "Véhicule",
        subtitle: [v.brand, v.model, v.year, v.status].filter(Boolean).join(" · "),
        hay: [v.registration, v.brand, v.model, v.year, v.vehicle_type, v.status, v.id],
        href: "profile.html",
      });
    });
    return items;
  }

  function render(items, q) {
    var el = document.getElementById("srResults");
    var meta = document.getElementById("srMeta");
    if (!q.trim()) {
      meta.textContent = items.length + " élément(s) indexés — saisissez un terme pour filtrer.";
      el.innerHTML = '<p class="sr-empty">Commencez à taper pour afficher les correspondances.</p>';
      return;
    }
    var nq = norm(q);
    var hits = items.filter(function (it) {
      return norm(it.hay.join(" ")).indexOf(nq) >= 0 || norm(it.title).indexOf(nq) >= 0 || norm(it.subtitle).indexOf(nq) >= 0;
    });
    meta.textContent = hits.length + " résultat(s) pour « " + q.trim() + " »";
    el.innerHTML = hits.length
      ? hits.map(function (h) {
          return row(h.label, h.title, h.subtitle, h.href);
        }).join("")
      : '<p class="sr-empty">Aucun résultat. Essayez de modifier vos critères de recherche.</p>';
  }

  var indexedItems = [];

  document.getElementById("srMeta").textContent = "Chargement du dossier…";

  document.getElementById("srClear").onclick = function () {
    var input = document.getElementById("srQuery");
    input.value = "";
    render(indexedItems, "");
    input.focus();
  };

  fetch("/api/external/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email }),
  })
    .then(function (r) {
      return r.json();
    })
    .then(function (res) {
      if (!res.ok) {
        document.getElementById("srMeta").textContent = res.error || "Erreur";
        document.getElementById("srResults").innerHTML =
          '<p class="sr-empty">Impossible de charger le dossier. <a href="profile.html">Profil</a></p>';
        return;
      }
      indexedItems = buildIndex(res);
      document.getElementById("srMeta").textContent = indexedItems.length + " élément(s) indexés.";
      var input = document.getElementById("srQuery");
      input.oninput = function () {
        render(indexedItems, input.value);
      };
      render(indexedItems, "");
    })
    .catch(function () {
      document.getElementById("srMeta").textContent = "Erreur réseau";
    });
})();
