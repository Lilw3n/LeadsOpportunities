/**
 * Page leads propres — prospect / interlocuteur, fusion, liaison, spam IP.
 */
(function () {
  var token = localStorage.getItem("lo_token");
  if (!token) return;

  var state = { view: "all", q: "", data: null, isAdmin: false };

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : s;
    return d.innerHTML;
  }

  function api(path, opts) {
    opts = opts || {};
    return fetch(path, {
      method: opts.method || "GET",
      headers: Object.assign(
        { "Content-Type": "application/json", Authorization: "Bearer " + token },
        opts.headers || {}
      ),
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    }).then(function (r) {
      return r.json();
    });
  }

  function when(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
  }

  function badgeTrust(t) {
    t = t || { label: "suspect", score: 0 };
    return (
      '<span class="lh-badge lh-badge--' +
      esc(t.label) +
      '">' +
      esc(t.label) +
      " · " +
      esc(t.score) +
      "</span>"
    );
  }

  function openModal(title, html, onOk, okLabel) {
    document.getElementById("lhModalTitle").textContent = title;
    document.getElementById("lhModalBody").innerHTML = html;
    document.getElementById("lhModalOk").textContent = okLabel || "Valider";
    document.getElementById("lhModal").hidden = false;
    var ok = document.getElementById("lhModalOk");
    var cancel = document.getElementById("lhModalCancel");
    function close() {
      document.getElementById("lhModal").hidden = true;
      ok.onclick = null;
      cancel.onclick = null;
    }
    cancel.onclick = close;
    ok.onclick = function () {
      Promise.resolve(onOk()).then(function (okGo) {
        if (okGo !== false) close();
      });
    };
  }

  function act(body) {
    return api("/api/crm/lead-lifecycle", { method: "POST", body: body }).then(function (res) {
      if (!res.ok) {
        alert(res.error || "Action impossible");
        return res;
      }
      load();
      return res;
    });
  }

  function renderKpis(k) {
    k = k || {};
    document.getElementById("lhKpis").innerHTML =
      kpi("Leads", k.total) +
      kpi("Humains", k.humains) +
      kpi("Suspects", k.suspects) +
      kpi("Spam / robots", k.spam) +
      kpi("Prospects", k.prospects) +
      kpi("À valider", k.pending);
  }

  function kpi(label, n) {
    return (
      '<div class="kpi-card panel"><div class="kpi-label">' +
      esc(label) +
      '</div><div class="kpi-value">' +
      esc(n || 0) +
      "</div></div>"
    );
  }

  function renderPending(list) {
    var box = document.getElementById("lhPendingBox");
    var actionable = list || [];
    if (!actionable.length) {
      box.hidden = state.view !== "pending";
      document.getElementById("lhPending").innerHTML =
        state.view === "pending" ? '<p class="lh-empty">Aucune demande en attente.</p>' : "";
      if (state.view !== "pending") box.hidden = true;
      return;
    }
    box.hidden = false;
    document.getElementById("lhPending").innerHTML = list
      .map(function (p) {
        var reasons = "";
        try {
          var m = JSON.parse(p.match_reasons || "{}");
          reasons = (m.reasons || []).join(", ");
        } catch (e) {}
        return (
          '<div class="lh-pending">' +
          "<div><strong>" +
          esc(p.link_type) +
          "</strong> · " +
          esc(p.keep_id) +
          " ↔ " +
          esc(p.other_id) +
          '<div class="lh-meta">' +
          esc(reasons || p.status) +
          " · " +
          esc(p.status) +
          "</div></div>" +
          '<div class="lh-actions">' +
          (state.isAdmin && p.status === "pending"
            ? '<button type="button" class="btn btn-primary btn-sm" data-review="approve" data-id="' +
              esc(p.id) +
              '">Valider</button>' +
              '<button type="button" class="btn btn-ghost btn-sm" data-review="reject" data-id="' +
              esc(p.id) +
              '">Refuser</button>'
            : "") +
          (state.isAdmin && p.status === "approved" && p.link_type === "liaison"
            ? '<button type="button" class="btn btn-ghost btn-sm" data-unlink="' +
              esc(p.id) +
              '">Délier</button>'
            : "") +
          (state.isAdmin && p.status === "approved" && p.link_type === "fusion"
            ? '<button type="button" class="btn btn-ghost btn-sm" data-split="' +
              esc(p.id) +
              '">Séparer</button>'
            : "") +
          "</div></div>"
        );
      })
      .join("");
  }

  function renderMatches(clusters) {
    var box = document.getElementById("lhMatchesBox");
    if (!clusters || !clusters.length) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    document.getElementById("lhMatches").innerHTML = clusters
      .slice(0, 20)
      .map(function (c) {
        var pairBtns = (c.pairs || [])
          .map(function (p) {
            return (
              '<div class="lh-meta" style="margin:6px 0">' +
              esc(p.reasons.join(" · ")) +
              " (" +
              esc(p.strength) +
              ") " +
              (p.canFuse
                ? '<button type="button" class="btn btn-ghost btn-sm" data-fuse-a="' +
                  esc(p.a) +
                  '" data-fuse-b="' +
                  esc(p.b) +
                  '">Fusionner</button>'
                : "") +
              '<button type="button" class="btn btn-ghost btn-sm" data-link-a="' +
              esc(p.a) +
              '" data-link-b="' +
              esc(p.b) +
              '">Lier</button></div>'
            );
          })
          .join("");
        return (
          '<div class="lh-cluster"><strong>' +
          esc((c.names || []).join(" · ")) +
          "</strong>" +
          pairBtns +
          "</div>"
        );
      })
      .join("");
  }

  function renderTable(leads) {
    var mount = document.getElementById("lhTable");
    if (state.view === "pending") {
      mount.innerHTML = "";
      return;
    }
    if (!leads || !leads.length) {
      mount.innerHTML = '<p class="lh-empty">Aucun lead pour ce filtre.</p>';
      return;
    }
    mount.innerHTML =
      '<table class="lh-table"><thead><tr>' +
      "<th>Personne</th><th>Confiance</th><th>Rôle</th><th>IP / navigateur</th><th>Origine</th><th></th>" +
      "</tr></thead><tbody>" +
      leads
        .map(function (l) {
          return (
            "<tr>" +
            "<td><strong>" +
            esc(l.name) +
            "</strong><div class='lh-meta'>" +
            esc(l.email || "—") +
            " · " +
            esc(l.phone || "—") +
            "</div></td>" +
            "<td>" +
            badgeTrust(l.trust) +
            '<div class="lh-meta">' +
            esc((l.trust.reasons || []).slice(0, 3).join(" · ")) +
            "</div></td>" +
            "<td>" +
            (l.isProspect
              ? '<span class="lh-badge lh-badge--prospect">Prospect / interlocuteur</span>'
              : '<span class="lh-badge lh-badge--lead">Lead</span>') +
            "</td>" +
            "<td><div class='lh-ip'>" +
            esc(l.ip || "—") +
            "</div><div class='lh-meta'>" +
            esc(l.uaLabel) +
            (l.country ? " · " + esc(l.country) : "") +
            "</div></td>" +
            "<td><div>" +
            esc(l.vertical || l.platform || "—") +
            '</div><div class="lh-meta">' +
            esc(when(l.createdAt)) +
            "</div></td>" +
            '<td><div class="lh-actions">' +
            (!l.isProspect
              ? '<button type="button" class="btn btn-primary btn-sm" data-promote="' +
                esc(l.id) +
                '">→ Prospect</button>'
              : l.contactId
                ? '<a class="btn btn-ghost btn-sm" href="./crm-contact.html?id=' +
                  encodeURIComponent(l.contactId) +
                  '">Fiche</a>'
                : "") +
            (state.isAdmin
              ? '<button type="button" class="btn btn-ghost btn-sm" data-del="' +
                esc(l.id) +
                '" data-prospect="' +
                (l.isProspect ? "1" : "0") +
                '">Supprimer</button>'
              : "") +
            "</div></td></tr>"
          );
        })
        .join("") +
      "</tbody></table>";
  }

  function confirmDelete(leadId, isProspect) {
    openModal(
      "Supprimer " + (isProspect ? "l’interlocuteur" : "le lead"),
      '<p class="lh-warn">Action irréversible. Double validation obligatoire.</p>' +
        '<label class="lh-check"><input type="checkbox" id="lhAck" /> Je confirme vouloir supprimer cette fiche</label>' +
        '<label>Tapez <strong>SUPPRIMER</strong><input class="crm-input" id="lhConfirmWord" autocomplete="off" /></label>',
      function () {
        var ack = document.getElementById("lhAck").checked;
        var word = (document.getElementById("lhConfirmWord").value || "").trim();
        if (!ack || word !== "SUPPRIMER") {
          alert("Cochez la case et tapez SUPPRIMER.");
          return false;
        }
        return act({
          action: "delete",
          leadId: leadId,
          confirm: "SUPPRIMER",
          confirmAck: true,
          deleteInterlocutor: !!isProspect,
        });
      },
      "Supprimer définitivement"
    );
  }

  function confirmPair(kind, a, b) {
    var label = kind === "fuse" ? "Fusionner en une seule fiche" : "Lier sans fusionner";
    openModal(
      label,
      "<p>Les deux dossiers resteront visibles jusqu’à validation admin" +
        (state.isAdmin ? " — en tant qu’admin vous pouvez appliquer tout de suite." : ".") +
        "</p>" +
        (state.isAdmin
          ? '<label class="lh-check"><input type="checkbox" id="lhAuto" checked /> Appliquer maintenant (admin)</label>'
          : ""),
      function () {
        var auto = state.isAdmin && document.getElementById("lhAuto") && document.getElementById("lhAuto").checked;
        return act({
          action: kind === "fuse" ? "fuse" : "link",
          keepLeadId: a,
          otherLeadId: b,
          autoApprove: !!auto,
        });
      },
      state.isAdmin ? "Valider" : "Demander validation"
    );
  }

  function load() {
    var qs =
      "/api/crm/leads-hub?view=" +
      encodeURIComponent(state.view) +
      "&q=" +
      encodeURIComponent(state.q);
    document.getElementById("lhTable").innerHTML = '<p class="lh-empty">Chargement…</p>';
    api(qs).then(function (res) {
      if (!res.ok) {
        document.getElementById("lhTable").innerHTML =
          '<p class="lh-empty">' + esc(res.error || "Accès refusé") + "</p>";
        return;
      }
      state.data = res;
      state.isAdmin = !!res.isAdmin;
      renderKpis(res.kpis);
      renderPending(res.pending || []);
      renderMatches(res.matches || []);
      renderTable(res.leads || []);
    });
  }

  document.getElementById("lhView").addEventListener("change", function () {
    state.view = this.value;
    load();
  });
  document.getElementById("lhRefresh").onclick = load;
  var t;
  document.getElementById("lhSearch").addEventListener("input", function () {
    var v = this.value;
    clearTimeout(t);
    t = setTimeout(function () {
      state.q = v.trim();
      load();
    }, 280);
  });

  document.body.addEventListener("click", function (e) {
    var el = e.target.closest("[data-promote],[data-del],[data-fuse-a],[data-link-a],[data-review],[data-unlink],[data-split]");
    if (!el) return;
    if (el.getAttribute("data-promote")) {
      act({ action: "promote", leadId: el.getAttribute("data-promote") });
      return;
    }
    if (el.getAttribute("data-del")) {
      confirmDelete(el.getAttribute("data-del"), el.getAttribute("data-prospect") === "1");
      return;
    }
    if (el.getAttribute("data-fuse-a")) {
      confirmPair("fuse", el.getAttribute("data-fuse-a"), el.getAttribute("data-fuse-b"));
      return;
    }
    if (el.getAttribute("data-link-a")) {
      confirmPair("link", el.getAttribute("data-link-a"), el.getAttribute("data-link-b"));
      return;
    }
    if (el.getAttribute("data-review")) {
      act({
        action: "review",
        linkId: el.getAttribute("data-id"),
        decision: el.getAttribute("data-review"),
      });
      return;
    }
    if (el.getAttribute("data-unlink")) {
      act({ action: "unlink", linkId: el.getAttribute("data-unlink") });
      return;
    }
    if (el.getAttribute("data-split")) {
      act({ action: "split", linkId: el.getAttribute("data-split") });
    }
  });

  load();
})();
