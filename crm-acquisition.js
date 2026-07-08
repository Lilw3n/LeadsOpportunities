(function () {
  var TOKEN_KEY = "lo_token";
  var token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  var allLeads = [];
  var filterPlatform = "";
  var filterDormant = false;
  var filterTime = "";
  var filterView = localStorage.getItem("lo_acq_view") || "active";
  var urlView = new URLSearchParams(location.search).get("view");
  if (urlView && ["active", "all", "archived", "unopened", "interesting", "unarchived"].indexOf(urlView) >= 0) {
    filterView = urlView;
  }
  var searchQ = "";
  var soundOn = localStorage.getItem("lo_acq_sound") === "1";
  var seenLeadIds = [];
  var serverStats = {};

  var PIPELINE_COLS = [
    { id: "new", label: "Nouveau lead" },
    { id: "questionnaire", label: "Questionnaire" },
    { id: "tariff_editing", label: "Bordereau / tarifs" },
    { id: "quote_sent", label: "Devis envoyé" },
    { id: "follow_up", label: "À relancer" },
  ];

  var EMPTY_STAGE = {
    new: "Aucun nouveau lead dans cette vue.",
    questionnaire: "Aucun questionnaire en cours.",
    tariff_editing: "Aucun dossier en préparation tarifaire.",
    quote_sent: "Aucun devis envoyé à suivre.",
    follow_up: "Aucune relance prioritaire.",
  };

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : s;
    return d.innerHTML;
  }

  function authHeaders() {
    return { Authorization: "Bearer " + token, "Content-Type": "application/json" };
  }

  function moveLead(id, stage) {
    fetch("/api/crm/lead-acquisition?id=" + encodeURIComponent(id), {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ pipeline_stage: stage }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (res.ok) load();
        else alert(res.error || "Erreur");
      });
  }

  function patchLead(id, payload, done) {
    fetch("/api/crm/lead-acquisition?id=" + encodeURIComponent(id), {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.ok) {
          if (done) done(res);
          load();
        } else alert(res.error || "Erreur");
      });
  }

  function playLeadSound() {
    if (!soundOn) return;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      var ctx = new Ctx();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.24);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch (e) {}
  }

  function timeFilter(lead) {
    if (!filterTime) return true;
    var age = Date.now() - new Date(lead.created_at).getTime();
    var h = age / 3600000;
    if (filterTime === "24h") return h < 24;
    if (filterTime === "3d") return h >= 24 && h < 72;
    if (filterTime === "old") return h >= 72;
    return true;
  }

  function filtered() {
    return allLeads.filter(function (l) {
      if (filterPlatform && l.platform !== filterPlatform) return false;
      if (filterDormant && !l.is_dormant) return false;
      if (!timeFilter(l)) return false;
      if (searchQ) {
        var q = searchQ.toLowerCase();
        return (
          String(l.email || "").toLowerCase().indexOf(q) >= 0 ||
          String(l.phone || "").indexOf(q) >= 0 ||
          String(l.full_name || "").toLowerCase().indexOf(q) >= 0 ||
          String(l.devis_summary || "").toLowerCase().indexOf(q) >= 0
        );
      }
      return l.pipeline_stage !== "won" && l.pipeline_stage !== "lost";
    });
  }

  function renderChips(stats) {
    var html =
      '<button type="button" class="acq-chip' +
      (filterPlatform === "" ? " active" : "") +
      '" data-p="">Toutes sources</button>';
    window.CrmLeadPlatform.PLATFORMS.forEach(function (p) {
      var n = (stats && stats.byPlatform && stats.byPlatform[p.id]) || 0;
      if (n === 0 && filterPlatform !== p.id) return;
      html +=
        '<button type="button" class="acq-chip' +
        (filterPlatform === p.id ? " active" : "") +
        '" data-p="' +
        p.id +
        '">' +
        p.icon +
        " " +
        p.label +
        (n ? " (" + n + ")" : "") +
        "</button>";
    });
    document.getElementById("platformChips").innerHTML = html;
    document.querySelectorAll(".acq-chip[data-p]").forEach(function (btn) {
      btn.onclick = function () {
        filterPlatform = btn.getAttribute("data-p") || "";
        render();
      };
    });
  }

  function renderStats(stats) {
    var dormant = stats.dormant || 0;
    document.getElementById("acqStats").innerHTML =
      '<span class="acq-stat">Total actifs : <strong>' +
      filtered().length +
      "</strong></span>" +
      (dormant
        ? '<span class="acq-stat" style="border-color:#fca5a5">Dormants &gt;72h : <strong style="color:#b91c1c">' +
          dormant +
          "</strong></span>"
        : "") +
      '<span class="acq-stat">Score moyen : <strong>' +
      (filtered().length
        ? Math.round(
            filtered().reduce(function (s, l) {
              return s + (l.lead_score || 0);
            }, 0) / filtered().length
          )
        : "—") +
      "</strong></span>";
    document.getElementById("acqStats").innerHTML +=
      '<span class="acq-stat">Non ouverts : <strong>' +
      ((stats && stats.unopened) || 0) +
      '</strong></span><span class="acq-stat">Archivés : <strong>' +
      ((stats && stats.archived) || 0) +
      '</strong></span><span class="acq-stat">Intéressants ++ : <strong>' +
      ((stats && stats.interesting) || 0) +
      "</strong></span>";
  }

  function cardHtml(l) {
    var pm = window.CrmLeadPlatform.meta(l.platform);
    var pct = l.questionnaire_pct || 0;
    var title = l.full_name || l.email || l.phone || l.id;
    var next =
      l.next_followup_at
        ? "Relance " + new Date(l.next_followup_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })
        : l.is_dormant
          ? "Lead dormant — relancer"
          : "Aucune relance planifiée";
    var nextParcoursStage = "";
    if (Array.isArray(l.parcours_workflow) && l.parcours_workflow.length) {
      var idx = l.parcours_workflow.indexOf(l.pipeline_stage);
      if (idx >= 0 && idx < l.parcours_workflow.length - 1) {
        nextParcoursStage = l.parcours_workflow[idx + 1];
      } else if (idx < 0) {
        nextParcoursStage = l.parcours_workflow[0];
      }
    }
    return (
      '<div class="acq-card' +
      (l.is_dormant ? " dormant" : "") +
      (!l.is_opened ? " unopened" : "") +
      (l.is_archived ? " archived" : "") +
      '" draggable="true" data-id="' +
      esc(l.id) +
      '">' +
      '<div class="acq-badges">' +
      (!l.is_opened ? '<span class="acq-badge hot">Non ouvert</span>' : "") +
      (l.is_interesting ? '<span class="acq-badge plus">Intéressant ++</span>' : "") +
      (l.is_archived ? '<span class="acq-badge muted">Archivé</span>' : "") +
      (l.assigned_to ? '<span class="acq-badge muted">Assigné</span>' : "") +
      "</div>" +
      '<div class="acq-card-head">' +
      '<div><span class="acq-platform" title="' +
      esc(pm.label) +
      '">' +
      pm.icon +
      "</span> <strong>" +
      esc(title) +
      '</strong><br><span class="acq-meta">' +
      esc(l.vertical || "—") +
      " · score " +
      (l.lead_score != null ? l.lead_score : "—") +
      "</span></div>" +
      '<span class="acq-priority ' +
      esc(l.priority || "medium") +
      '" title="Priorité"></span></div>' +
      '<div class="acq-progress" title="Questionnaire ' +
      pct +
      '%"><span style="width:' +
      pct +
      '%"></span></div>' +
      '<div class="acq-meta">Étape questionnaire : ' +
      (l.questionnaire_step || 0) +
      "/" +
      (l.questionnaire_total || 10) +
      "</div>" +
      (l.parcours_label ? '<div class="acq-meta">Parcours : ' + esc(l.parcours_label) + "</div>" : "") +
      (l.is_meta_lead ? '<span class="acq-badge meta">Meta Lead</span> ' : "") +
      (l.devis_summary ? '<div class="acq-devis">' + esc(l.devis_summary) + "</div>" : "") +
      '<div class="acq-next">📞 ' +
      esc(next) +
      "</div>" +
      (l.tariff_insurer ? '<div class="acq-match">Acteur pressenti : ' + esc(l.tariff_insurer) + "</div>" : "") +
      '<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">' +
      '<a href="./crm-lead-detail.html?id=' +
      encodeURIComponent(l.id) +
      '" class="btn btn-ghost btn-sm">Fiche</a>' +
      '<a href="./crm-private-offer-matching.html?leadId=' +
      encodeURIComponent(l.id) +
      '" class="btn btn-ghost btn-sm">Matching</a>' +
      '<a href="./crm-tariff-grid.html?leadId=' +
      encodeURIComponent(l.id) +
      '" class="btn btn-ghost btn-sm">Tarifs</a>' +
      (l.contact_id
        ? '<a href="./crm-contact.html?id=' +
          encodeURIComponent(l.contact_id) +
          '" class="btn btn-ghost btn-sm">Contact</a>'
        : '<button type="button" class="btn btn-primary btn-sm btn-convert" data-id="' +
          esc(l.id) +
          '">→ Contact</button>') +
      '<button type="button" class="btn btn-ghost btn-sm btn-assign" data-id="' +
      esc(l.id) +
      '">Assigner</button>' +
      (nextParcoursStage
        ? '<button type="button" class="btn btn-ghost btn-sm btn-parcours-next" data-id="' +
          esc(l.id) +
          '" data-stage="' +
          esc(nextParcoursStage) +
          '">Parcours → ' +
          esc(nextParcoursStage) +
          "</button>"
        : "") +
      (l.is_archived
        ? '<button type="button" class="btn btn-ghost btn-sm btn-unarchive" data-id="' + esc(l.id) + '">Désarchiver</button>'
        : '<button type="button" class="btn btn-ghost btn-sm btn-archive" data-id="' + esc(l.id) + '">Archiver</button>') +
      "</div></div>"
    );
  }

  function render() {
    var leads = filtered();
    renderStats(Object.assign({}, serverStats, { dormant: leads.filter(function (l) { return l.is_dormant; }).length }));

    document.getElementById("acqPipeline").innerHTML = PIPELINE_COLS.map(function (col) {
      var stage = window.CrmLeadPlatform.STAGES.find(function (s) { return s.id === col.id; });
      var items = leads.filter(function (l) {
        return l.pipeline_stage === col.id || (col.id === "follow_up" && l.pipeline_stage === "contacted");
      });
      return (
        '<div class="acq-col" data-stage="' +
        col.id +
        '"><h3>' +
        col.label +
        " (" +
        items.length +
        ')</h3><p class="acq-col-hint">' +
        esc(stage ? stage.hint : "") +
        "</p>" +
        (items.length ? items.map(cardHtml).join("") : '<div class="acq-empty-col">' + esc(EMPTY_STAGE[col.id]) + "</div>") +
        "</div>"
      );
    }).join("");

    document.querySelectorAll(".acq-card").forEach(function (card) {
      card.ondragstart = function (e) {
        e.dataTransfer.setData("text/plain", card.getAttribute("data-id"));
      };
    });
    document.querySelectorAll(".acq-col").forEach(function (col) {
      col.ondragover = function (e) {
        e.preventDefault();
        col.classList.add("drag-over");
      };
      col.ondragleave = function () {
        col.classList.remove("drag-over");
      };
      col.ondrop = function (e) {
        e.preventDefault();
        col.classList.remove("drag-over");
        var id = e.dataTransfer.getData("text/plain");
        if (id) moveLead(id, col.getAttribute("data-stage"));
      };
    });

    document.querySelectorAll(".btn-convert").forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        var id = btn.getAttribute("data-id");
        fetch("/api/crm/convert-lead", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ leadId: id }),
        })
          .then(function (r) {
            return r.json();
          })
          .then(function (res) {
            if (res.ok && res.contactId) {
              location.href = "./crm-contact.html?id=" + encodeURIComponent(res.contactId);
            } else alert(res.error || "Erreur conversion");
          });
      };
    });
    document.querySelectorAll(".btn-archive").forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        var reason = prompt("Raison d'archivage ?", "Pollution visuelle / a revoir plus tard") || "Archive manuel";
        patchLead(btn.getAttribute("data-id"), { action: "archive", archive_reason: reason });
      };
    });
    document.querySelectorAll(".btn-unarchive").forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        patchLead(btn.getAttribute("data-id"), { action: "unarchive" });
      };
    });
    document.querySelectorAll(".btn-assign").forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        var assigned = prompt("Email ou identifiant collaborateur principal ?", "") || "";
        var shared = prompt("Partager aussi avec (emails séparés par virgules) ?", "") || "";
        patchLead(btn.getAttribute("data-id"), {
          action: "assign",
          assigned_to: assigned,
          shared_with: shared
            .split(",")
            .map(function (s) { return s.trim(); })
            .filter(Boolean),
        });
      };
    });
    document.querySelectorAll(".btn-parcours-next").forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        var stage = btn.getAttribute("data-stage");
        if (!stage) return;
        patchLead(btn.getAttribute("data-id"), { pipeline_stage: stage });
      };
    });
    document.querySelectorAll(".acq-card").forEach(function (card) {
      card.onclick = function () {
        patchLead(card.getAttribute("data-id"), { action: "open" }, function () {});
      };
    });
  }

  function load() {
    var url = "/api/crm/leads-acquisition?limit=150&view=" + encodeURIComponent(filterView);
    if (filterDormant) url += "&dormant=1";
    fetch(url, { headers: authHeaders() })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok) {
          document.getElementById("acqPipeline").innerHTML =
            '<div class="crm-empty-state"><h3>Pipeline indisponible</h3><p>' +
            esc(res.error || "Erreur") +
            (res.detail ? "<br><small>" + esc(res.detail) + "</small>" : "") +
            "</p><p style='margin-top:12px'><a href='https://console.neon.tech' target='_blank' rel='noopener' class='btn btn-ghost btn-sm'>Ouvrir Neon</a> " +
            "<button type='button' class='btn btn-primary btn-sm' id='btnAcqRetry'>Réessayer</button></p></div>";
          var retry = document.getElementById("btnAcqRetry");
          if (retry) retry.onclick = load;
          return;
        }
        allLeads = res.leads || [];
        var currentInteresting = allLeads
          .filter(function (l) { return l.is_interesting && !l.is_opened && !l.is_archived; })
          .map(function (l) { return l.id; });
        if (seenLeadIds.length && currentInteresting.some(function (id) { return seenLeadIds.indexOf(id) < 0; })) {
          playLeadSound();
        }
        seenLeadIds = allLeads.map(function (l) { return l.id; });
        serverStats = res.stats || {};
        renderChips(serverStats);
        render();
      });
  }

  document.getElementById("acqSearch").oninput = function () {
    searchQ = this.value.trim();
    render();
  };
  document.getElementById("acqTime").onchange = function () {
    filterTime = this.value;
    render();
  };
  document.getElementById("acqView").value = filterView;
  document.getElementById("acqView").onchange = function () {
    filterView = this.value;
    localStorage.setItem("lo_acq_view", filterView);
    load();
  };
  document.getElementById("btnSound").textContent = soundOn ? "Son on" : "Son off";
  document.getElementById("btnSound").onclick = function () {
    soundOn = !soundOn;
    localStorage.setItem("lo_acq_sound", soundOn ? "1" : "0");
    this.textContent = soundOn ? "Son on" : "Son off";
    if (soundOn) playLeadSound();
  };
  document.getElementById("btnDormant").onclick = function () {
    filterDormant = !filterDormant;
    this.classList.toggle("btn-primary", filterDormant);
    load();
  };

  function renderMetaRotation(rotation) {
    var el = document.getElementById("metaRotationBody");
    if (!el || !rotation) return;
    var slot = rotation.active_slot || {};
    var ad = slot.ad_copy || {};
    var stats = rotation.current_stats || {};
    var rec = rotation.recommendation || {};
    var schedule = rotation.schedule || [];
    el.innerHTML =
      '<div class="acq-stats">' +
      '<span class="acq-stat">Semaine <strong>S' +
      esc(slot.week || rotation.calendar_week) +
      "</strong> · " +
      esc(slot.id) +
      "</span>" +
      '<span class="acq-stat">Vertical <strong>' +
      esc(slot.vertical) +
      "</strong>" +
      (slot.discrete ? " (discret)" : "") +
      "</span>" +
      '<span class="acq-stat">Form <strong>" +
      esc(slot.form_id || "—") +
      "</strong></span>" +
      '<span class="acq-stat">Leads Meta <strong>" +
      esc(stats.leads != null ? stats.leads : "0") +
      "</strong></span>" +
      '<span class="acq-stat">CPL est. <strong>" +
      esc(stats.cpl_eur != null ? stats.cpl_eur + " €" : "—") +
      "</strong></span>" +
      "</div>" +
      '<p class="acq-match"><strong>Pub :</strong> ' +
      esc(ad.headline || "—") +
      " — " +
      esc(ad.primary || "") +
      "</p>" +
      '<p class="acq-match"><strong>Reco :</strong> ' +
      esc(rec.reason || "—") +
      "</p>" +
      "<table><thead><tr><th>Sem.</th><th>Campagne</th><th>Vertical</th><th>Form</th></tr></thead><tbody>" +
      schedule
        .map(function (s) {
          return (
            "<tr" +
            (s.is_current ? ' style="background:rgba(13,148,136,.08)"' : "") +
            "><td>S" +
            esc(s.week) +
            (s.is_current ? " ▶" : "") +
            "</td><td>" +
            esc(s.id) +
            "</td><td>" +
            esc(s.vertical) +
            (s.discrete ? " · discret" : "") +
            "</td><td>" +
            esc(s.form_id || "—") +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table>" +
      '<p style="color:var(--muted);font-size:.85rem;margin-top:10px">Doc : docs/META-ROTATION-4-SEMAINES.md · <a href="./crm-pubs.html">Gestion pubs</a> · <a href="./crm-sources.html">Origine leads</a></p>";
  }

  function loadMetaRotation(refresh) {
    var url = "/api/crm/meta-rotation" + (refresh ? "?refresh=1" : "");
    fetch(url, { headers: authHeaders() })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok) {
          document.getElementById("metaRotationBody").innerHTML =
            '<p style="color:#b91c1c">' + esc(res.error || "Rotation indisponible") + "</p>";
          return;
        }
        renderMetaRotation(res.rotation);
      })
      .catch(function (e) {
        document.getElementById("metaRotationBody").innerHTML =
          '<p style="color:#b91c1c">' + esc(String(e)) + "</p>";
      });
  }

  var btnRot = document.getElementById("btnRefreshRotation");
  if (btnRot) btnRot.onclick = function () {
    loadMetaRotation(true);
  };

  loadMetaRotation(false);
  load();
})();
