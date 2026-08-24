/**
 * Page leads propres — prospect / interlocuteur, fusion, liaison, spam IP.
 */
(function () {
  var token = localStorage.getItem("lo_token");
  if (!token) return;

  var state = { view: "all", q: "", ip: "", data: null, isAdmin: false, selected: {}, blocked: {} };

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
      if (body.action === "promote" && res.contactId) {
        location.href = "./crm-contact.html?id=" + encodeURIComponent(res.contactId);
        return res;
      }
      load();
      return res;
    });
  }

  function renderKpis(k) {
    k = k || {};
    document.getElementById("lhKpis").innerHTML =
      kpi("Leads (liste complète)", k.total, "./dashboard.html?section=leads") +
      kpi("Humains", k.humains) +
      kpi("Suspects", k.suspects) +
      kpi("Spam / robots", k.spam) +
      kpi("Prospects", k.prospects) +
      kpi("À valider", k.pending);
  }

  function kpi(label, n, href) {
    var inner =
      '<div class="kpi-label">' +
      esc(label) +
      '</div><div class="kpi-value">' +
      esc(n || 0) +
      "</div>";
    if (href) {
      return '<a href="' + esc(href) + '" class="kpi-card panel" style="text-decoration:none;color:inherit">' + inner + "</a>";
    }
    return '<div class="kpi-card panel">' + inner + "</div>";
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

  function visibleLeads(leads) {
    var ip = (state.ip || "").trim();
    if (!ip) return leads || [];
    return (leads || []).filter(function (l) {
      return String(l.ip || "").indexOf(ip) >= 0;
    });
  }

  function selectedIds() {
    return Object.keys(state.selected).filter(function (id) {
      return state.selected[id];
    });
  }

  function updateBulk() {
    var ids = selectedIds();
    var bar = document.getElementById("lhBulk");
    if (!bar) return;
    bar.hidden = !ids.length;
    document.getElementById("lhBulkCount").textContent = ids.length + " sélectionné" + (ids.length > 1 ? "s" : "");
  }

  function renderBlocked(list) {
    var mount = document.getElementById("lhBlocked");
    if (!mount) return;
    state.blocked = {};
    if (!list || !list.length) {
      mount.innerHTML = '<p class="muted">Aucune IP bloquée.</p>';
      return;
    }
    list.forEach(function (b) {
      state.blocked[b.ip] = true;
    });
    mount.innerHTML = list
      .map(function (b) {
        return (
          '<span class="lh-ip-chip">' +
          esc(b.ip) +
          ' <button type="button" class="btn btn-ghost btn-sm" data-unblock="' +
          esc(b.ip) +
          '">Débloquer</button></span>'
        );
      })
      .join(" ");
  }

  function setIpBlock(ip, blocked, extra) {
    extra = extra || {};
    return api("/api/dashboard/ip-block", {
      method: "POST",
      body: { ip: ip, blocked: blocked, deleteLeads: !!extra.deleteLeads },
    }).then(function (res) {
      if (!res.ok) {
        alert(res.error || "IP : action impossible");
        return res;
      }
      load();
      return res;
    });
  }

  function renderTable(leads) {
    leads = visibleLeads(leads);
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
      "<th></th><th>Personne</th><th>Confiance</th><th>Rôle</th><th>IP / navigateur</th><th>Origine</th><th></th>" +
      "</tr></thead><tbody>" +
      leads
        .map(function (l) {
          return (
            "<tr>" +
            '<td><input type="checkbox" class="lh-row-check" data-id="' +
            esc(l.id) +
            '"' +
            (state.selected[l.id] ? " checked" : "") +
            " /></td>" +
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
            (l.ip
              ? '<button type="button" class="btn btn-ghost btn-sm" data-filter-ip="' +
                esc(l.ip) +
                '">' +
                esc(l.ip) +
                "</button>" +
                (state.blocked[l.ip] ? " bloquée" : "")
              : "—") +
            "</div>" +
            (function () {
              if (!window.LeadVisitorCategory) return "";
              var cat = window.LeadVisitorCategory.categorize({
                client_ip: l.ip,
                email: l.email,
                phone: l.phone,
                lead_score: l.score != null ? l.score : l.lead_score,
                platform: l.platform,
                source: l.source,
                payload: l.payload || {},
              });
              return (
                '<div class="lh-meta">' +
                window.LeadVisitorCategory.badgeHtml(cat, esc) +
                " — " +
                esc(cat.intent || "") +
                "</div>"
              );
            })() +
            "<div class='lh-meta'>" +
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
                '">Créer la fiche</button>'
              : l.contactId
                ? '<a class="btn btn-ghost btn-sm" href="./crm-contact.html?id=' +
                  encodeURIComponent(l.contactId) +
                  '">Ouvrir</a>'
                : "") +
            (state.isAdmin
              ? '<button type="button" class="btn btn-ghost btn-sm" data-del="' +
                esc(l.id) +
                '" data-prospect="' +
                (l.isProspect ? "1" : "0") +
                '">Supprimer</button>' +
                (l.ip
                  ? '<button type="button" class="btn btn-ghost btn-sm" data-block-ip="' +
                    esc(l.ip) +
                    '">' +
                    (state.blocked[l.ip] ? "Débloquer IP" : "Bloquer IP") +
                    "</button>"
                  : "")
              : "") +
            "</div></td></tr>"
          );
        })
        .join("") +
      "</tbody></table>";
    updateBulk();
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
      encodeURIComponent(state.q) +
      "&limit=400";
    document.getElementById("lhTable").innerHTML = '<p class="lh-empty">Chargement…</p>';
    Promise.all([
      api(qs),
      state.isAdmin || true ? api("/api/dashboard/ip-block") : Promise.resolve({ ok: false }),
    ]).then(function (pair) {
      var res = pair[0];
      var blocks = pair[1];
      if (!res.ok) {
        document.getElementById("lhTable").innerHTML =
          '<p class="lh-empty">' + esc(res.error || "Accès refusé") + "</p>";
        return;
      }
      state.data = res;
      state.isAdmin = !!res.isAdmin;
      if (blocks && blocks.ok) renderBlocked(blocks.blocks || []);
      else renderBlocked([]);
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
  document.getElementById("lhIp").addEventListener("input", function () {
    var v = this.value;
    clearTimeout(t);
    t = setTimeout(function () {
      state.ip = v.trim();
      if (state.data) renderTable(state.data.leads || []);
    }, 200);
  });
  document.getElementById("lhSelectAll").addEventListener("change", function () {
    var on = this.checked;
    document.querySelectorAll(".lh-row-check").forEach(function (box) {
      box.checked = on;
      if (on) state.selected[box.getAttribute("data-id")] = true;
      else delete state.selected[box.getAttribute("data-id")];
    });
    updateBulk();
  });
  document.getElementById("lhBulkDelete").addEventListener("click", function () {
    var ids = selectedIds();
    if (!ids.length) return;
    openModal(
      "Supprimer " + ids.length + " leads",
      '<p class="lh-warn">Double validation : cochez et tapez SUPPRIMER.</p>' +
        '<label class="lh-check"><input type="checkbox" id="lhAck" /> Je confirme</label>' +
        '<label>Tapez <strong>SUPPRIMER</strong><input class="crm-input" id="lhConfirmWord" autocomplete="off" /></label>',
      function () {
        var ack = document.getElementById("lhAck").checked;
        var word = (document.getElementById("lhConfirmWord").value || "").trim();
        if (!ack || word !== "SUPPRIMER") {
          alert("Cochez la case et tapez SUPPRIMER.");
          return false;
        }
        return api("/api/dashboard/lead-delete", { method: "POST", body: { leadIds: ids } }).then(function (res) {
          if (!res.ok) {
            var msg = res.error || "Suppression impossible";
            if (res.blocked && res.blocked.length) {
              msg += "\n\n" + res.blocked.length + " lead(s) rattachés à une fiche interlocuteur — non supprimés.";
            }
            if (res.hint) msg += "\n\n" + res.hint;
            alert(msg);
            return false;
          }
          if (res.blocked && res.blocked.length) {
            alert(
              (res.deleted ? res.deleted.length : 0) +
                " supprimé(s), " +
                res.blocked.length +
                " conservé(s) (fiche interlocuteur)."
            );
          }
          state.selected = {};
          load();
        });
      },
      "Supprimer définitivement"
    );
  });
  document.getElementById("lhBulkBlock").addEventListener("click", function () {
    var ips = {};
    (visibleLeads((state.data && state.data.leads) || [])).forEach(function (l) {
      if (state.selected[l.id] && l.ip) ips[l.ip] = true;
    });
    var list = Object.keys(ips);
    if (!list.length) {
      alert("Aucune IP sur la sélection");
      return;
    }
    if (!window.confirm("Bloquer " + list.length + " IP ?\n" + list.join("\n"))) return;
    var i = 0;
    function next() {
      if (i >= list.length) {
        load();
        return;
      }
      setIpBlock(list[i++], true).then(next);
    }
    next();
  });
  document.getElementById("lhBtnBlock").addEventListener("click", function () {
    var ip = (document.getElementById("lhBlockIp").value || "").trim();
    if (!ip) return;
    setIpBlock(ip, true);
  });

  document.body.addEventListener("click", function (e) {
    var chk = e.target.closest(".lh-row-check");
    if (chk) {
      var cid = chk.getAttribute("data-id");
      if (chk.checked) state.selected[cid] = true;
      else delete state.selected[cid];
      updateBulk();
      return;
    }
    var fip = e.target.closest("[data-filter-ip]");
    if (fip) {
      document.getElementById("lhIp").value = fip.getAttribute("data-filter-ip") || "";
      state.ip = document.getElementById("lhIp").value;
      renderTable((state.data && state.data.leads) || []);
      return;
    }
    var unb = e.target.closest("[data-unblock]");
    if (unb) {
      setIpBlock(unb.getAttribute("data-unblock"), false);
      return;
    }
    var bip = e.target.closest("[data-block-ip]");
    if (bip) {
      var ip = bip.getAttribute("data-block-ip");
      setIpBlock(ip, !state.blocked[ip]);
      return;
    }
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
