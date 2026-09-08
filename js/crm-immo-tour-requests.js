/**
 * File CRM des demandes de visite virtuelle — Valider / Décliner.
 */
(function () {
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function crmToken() {
    try {
      return localStorage.getItem("lo_token") || "";
    } catch (e) {
      return "";
    }
  }

  function post(body) {
    return fetch("/api/immo-tour-access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: crmToken() ? "Bearer " + crmToken() : "",
      },
      credentials: "same-origin",
      body: JSON.stringify(body || {}),
    }).then(function (r) {
      return r.json().then(function (d) {
        return { status: r.status, d: d };
      });
    });
  }

  function whenFr(iso) {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString("fr-FR");
    } catch (e) {
      return String(iso);
    }
  }

  function statusLabel(st) {
    if (st === "pending") return "En attente";
    if (st === "approved") return "Validée";
    if (st === "declined") return "Déclinée";
    return st || "—";
  }

  function decide(id, decision, reason) {
    return post({
      action: "decide_request",
      request_id: id,
      decision: decision,
      reason: reason || "",
    });
  }

  function renderList(root, data, opts) {
    opts = opts || {};
    var rows = (data && data.requests) || [];
    var pending = data && data.pending_count != null ? data.pending_count : rows.filter(function (r) {
      return r.status === "pending";
    }).length;
    var filter = opts.filterStatus || "";
    if (filter) {
      rows = rows.filter(function (r) {
        return r.status === filter;
      });
    }
    var msg = root.querySelector("[data-tour-req-msg]");
    var list = root.querySelector("[data-tour-req-list]");
    var badge = root.querySelector("[data-tour-req-badge]");
    if (badge) {
      badge.textContent = pending ? pending + " en attente" : "Aucune en attente";
      badge.className = "tour-req-badge" + (pending ? " is-hot" : "");
    }
    if (!list) return;
    if (!rows.length) {
      list.innerHTML =
        '<p class="pub-hint" style="margin:8px 0 0">Aucune demande' +
        (filter === "pending" ? " en attente" : "") +
        ".</p>";
      return;
    }
    list.innerHTML = rows
      .map(function (r) {
        var who = [r.first_name, r.email, r.phone].filter(Boolean).join(" · ");
        var bien = [r.property_title, r.link_name].filter(Boolean).join(" · ");
        var actions = "";
        if (r.status === "pending" || r.status === "declined") {
          actions +=
            '<button type="button" class="btn btn-primary btn-sm" data-tour-approve="' +
            esc(r.id) +
            '">Valider et envoyer le code</button>';
        }
        if (r.status === "approved") {
          actions +=
            '<button type="button" class="btn btn-ghost btn-sm" data-tour-approve="' +
            esc(r.id) +
            '">Renvoyer le code</button>';
        }
        if (r.status !== "declined") {
          actions +=
            '<button type="button" class="btn btn-ghost btn-sm" data-tour-decline="' +
            esc(r.id) +
            '">Décliner</button>';
        }
        if (r.tour_token) {
          actions +=
            '<a class="btn btn-ghost btn-sm" href="./immobilier/visite.html?t=' +
            encodeURIComponent(r.tour_token) +
            '" target="_blank" rel="noopener">Page visite</a>';
        }
        if (r.property_id) {
          actions +=
            '<a class="btn btn-ghost btn-sm" href="./crm-immo-pubs.html?property=' +
            encodeURIComponent(r.property_id) +
            '">Bien</a>';
        }
        return (
          '<article class="tour-req-card tour-req-' +
          esc(r.status) +
          '">' +
          '<div class="tour-req-head">' +
          "<strong>" +
          esc(who || "Visiteur") +
          "</strong>" +
          '<span class="tour-req-st">' +
          esc(statusLabel(r.status)) +
          "</span></div>" +
          (bien ? '<p class="tour-req-meta">' + esc(bien) + "</p>" : "") +
          '<p class="tour-req-meta">Demandé le ' +
          esc(whenFr(r.created_at)) +
          (r.utm_source ? " · " + esc(r.utm_source) : "") +
          (r.allowlisted === false ? " · hors liste prévue" : "") +
          (r.decline_reason ? " · " + esc(r.decline_reason) : "") +
          "</p>" +
          '<div class="pub-media-actions tour-req-actions">' +
          actions +
          "</div>" +
          '<p class="tour-req-code" hidden></p>' +
          "</article>"
        );
      })
      .join("");

    function flash(text, ok) {
      if (!msg) return;
      msg.textContent = text || "";
      msg.style.color = ok ? "#166534" : "#9a3412";
    }

    list.querySelectorAll("[data-tour-approve]").forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute("data-tour-approve");
        btn.disabled = true;
        flash("Validation…");
        decide(id, "approve")
          .then(function (res) {
            if (!res.d || !res.d.ok) {
              flash((res.d && res.d.error) || "Impossible de valider.");
              btn.disabled = false;
              return;
            }
            var code = (res.d.email_code || res.d.phone_code || "").trim();
            if (code && navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(code);
            }
            flash(
              (res.d.message || "Validée.") + (code ? " Code " + code + " (copié, 10 min)." : ""),
              true
            );
            load(root, opts);
          })
          .catch(function () {
            flash("Erreur réseau.");
            btn.disabled = false;
          });
      };
    });
    list.querySelectorAll("[data-tour-decline]").forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute("data-tour-decline");
        var reason = window.prompt("Décliner cette demande ? Motif optionnel (envoyé au visiteur) :", "");
        if (reason === null) return;
        btn.disabled = true;
        flash("Refus…");
        decide(id, "decline", reason)
          .then(function (res) {
            if (!res.d || !res.d.ok) {
              flash((res.d && res.d.error) || "Impossible de décliner.");
              btn.disabled = false;
              return;
            }
            flash(res.d.message || "Demande déclinée.", true);
            load(root, opts);
          })
          .catch(function () {
            flash("Erreur réseau.");
            btn.disabled = false;
          });
      };
    });
  }

  function load(root, opts) {
    opts = opts || {};
    var msg = root.querySelector("[data-tour-req-msg]");
    if (msg && !msg.textContent) msg.textContent = "Chargement des demandes…";
    return post({
      action: "list_requests",
      token: opts.token || "",
      property_id: opts.propertyId || "",
      status: opts.status || "",
    })
      .then(function (res) {
        if (!res.d || !res.d.ok) {
          if (msg) {
            msg.textContent = (res.d && res.d.error) || "Impossible de charger les demandes (connexion CRM).";
            msg.style.color = "#9a3412";
          }
          return res.d;
        }
        if (msg && msg.textContent === "Chargement des demandes…") msg.textContent = "";
        renderList(root, res.d, opts);
        if (typeof opts.onCount === "function") opts.onCount(res.d.pending_count || 0);
        return res.d;
      })
      .catch(function () {
        if (msg) {
          msg.textContent = "Erreur réseau.";
          msg.style.color = "#9a3412";
        }
      });
  }

  function shellHtml(title, hint) {
    return (
      '<div class="panel-head"><h2>' +
      esc(title || "Demandes de visite") +
      '</h2><span class="tour-req-badge" data-tour-req-badge>…</span></div>' +
      '<p class="pub-hint">' +
      esc(
        hint ||
          "Le visiteur n’obtient aucun code tout seul. Tu valides (le code part par e-mail) ou tu déclines — ultra important."
      ) +
      "</p>" +
      '<p class="pub-hint" data-tour-req-msg></p>' +
      '<div data-tour-req-list></div>'
    );
  }

  function mount(root, opts) {
    if (!root) return;
    opts = opts || {};
    if (!root.getAttribute("data-tour-req-ready")) {
      root.setAttribute("data-tour-req-ready", "1");
      if (!root.querySelector("[data-tour-req-list]")) {
        root.innerHTML = shellHtml(opts.title, opts.hint);
      }
    }
    return load(root, opts);
  }

  window.CrmImmoTourRequests = { mount: mount, load: load, decide: decide };
})();
