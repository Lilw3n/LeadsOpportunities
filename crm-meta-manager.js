(function () {
  var TOKEN_KEY = "lo_token";
  var token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  var state = { data: null, tab: "overview", leadFilter: "", days: 7 };

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : s;
    return d.innerHTML;
  }

  function authHeaders() {
    return { Authorization: "Bearer " + token, "Content-Type": "application/json" };
  }

  function fmtDate(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
  }

  function statusClass(s) {
    if (s === "active" || s === "ok" || s === true) return "mm-status--ok";
    if (s === "ready" || s === "planned") return "mm-status--warn";
    return "mm-status--off";
  }

  function channelBadge(ch) {
    if (ch === "lead_ads") return '<span class="mm-badge mm-badge--ads">Lead Ads</span>';
    if (ch === "site_meta") return '<span class="mm-badge mm-badge--site">Site fbclid</span>';
    return "";
  }

  function renderKpis(d) {
    var s = d.stats || {};
    document.getElementById("mmKpis").innerHTML =
      '<span class="acq-stat">Lead Ads (' +
      d.days +
      'j) <strong>' +
      (s.lead_ads || 0) +
      "</strong></span>" +
      '<span class="acq-stat">Site Meta <strong>' +
      (s.site_meta || 0) +
      "</strong></span>" +
      '<span class="acq-stat">Non ouverts Lead Ads <strong>' +
      (s.unopened_lead_ads || 0) +
      "</strong></span>" +
      '<span class="acq-stat">Dernier Lead Ads <strong>' +
      esc(fmtDate(s.last_lead_ads_at)) +
      "</strong></span>";
  }

  function renderHealth(d) {
    var h = d.health || {};
    var env = h.env || {};
    var g = h.graph || {};
    document.getElementById("mmHealth").innerHTML =
      '<div class="mm-card"><h3>Intégration</h3><div class="mm-big ' +
      statusClass(h.configured) +
      '">' +
      (h.configured ? "Connectée" : "Incomplète") +
      '</div><p style="font-size:.82rem;color:var(--muted);margin:8px 0 0">Pixel ' +
      (env.pixel ? "✓" : "✗") +
      " · Token page " +
      (env.page_token ? "✓" : "✗") +
      " · Webhook " +
      (env.app_secret && env.verify_token ? "✓" : "✗") +
      "</p></div>" +
      '<div class="mm-card"><h3>Page Graph API</h3><div class="mm-big ' +
      statusClass(g.ok) +
      '">' +
      esc(g.ok ? g.name || "OK" : g.error || "Erreur") +
      '</div><p style="font-size:.82rem;color:var(--muted);margin:8px 0 0">ID ' +
      esc(env.page_id || "—") +
      "</p></div>" +
      '<div class="mm-card"><h3>Webhook Lead Ads</h3><div style="font-size:.78rem;word-break:break-all;color:var(--muted)">' +
      esc(h.webhook_hint || env.webhook_url || "") +
      '</div><p style="margin:8px 0 0"><a href="./docs/META-ADS-AUTOMATION.md" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">Guide Meta</a></p></div>' +
      '<div class="mm-card"><h3>Dernier lead site Meta</h3><div class="mm-big">' +
      esc(fmtDate(h.last_site_meta_at)) +
      "</div></div>";
  }

  function renderChannels(d) {
    var html = (d.channels || [])
      .map(function (c) {
        var off = c.status === "unsupported" || c.status === "planned" || c.status === "inactive";
        return (
          '<div class="mm-channel' +
          (off ? " mm-channel--off" : "") +
          '">' +
          "<strong>" +
          esc(c.label) +
          "</strong> " +
          (c.trackable
            ? '<span class="mm-status--ok">Récupération auto</span>'
            : '<span class="mm-status--off">Manuel / UTM</span>') +
          '<p style="margin:6px 0;font-size:.88rem;color:var(--muted)">' +
          (c.count_7d != null ? c.count_7d + " lead(s) sur la période · " : "") +
          "Statut : " +
          esc(c.status) +
          (c.note ? " — " + esc(c.note) : "") +
          "</p>" +
          (c.crm_path
            ? '<a href="' + esc(c.crm_path) + '" class="btn btn-ghost btn-sm">Ouvrir →</a>'
            : "") +
          "</div>"
        );
      })
      .join("");
    document.getElementById("mmChannels").innerHTML = html || "<p>Aucun canal.</p>";
  }

  function renderLeads(d) {
    var filter = state.leadFilter;
    var leads = (d.recent_leads || []).filter(function (l) {
      return !filter || l.channel === filter;
    });
    var el = document.getElementById("mmLeadsList");
    if (!leads.length) {
      el.innerHTML =
        '<div class="crm-empty-state"><h3>Aucun lead Meta sur la période</h3><p>Vérifiez Lead Ads (webhook) ou un clic pub vers le site avec fbclid.</p></div>';
      return;
    }
    el.innerHTML = leads
      .map(function (l) {
        var title = l.name || l.email || l.phone || l.id;
        return (
          '<div class="mm-lead-row">' +
          "<div>" +
          channelBadge(l.channel) +
          " <strong>" +
          esc(title) +
          "</strong>" +
          '<div style="font-size:.85rem;color:var(--muted);margin-top:4px">' +
          esc(l.vertical || "—") +
          " · score " +
          esc(l.score != null ? l.score : "—") +
          " · " +
          esc(fmtDate(l.created_at)) +
          (l.utm_campaign ? " · " + esc(l.utm_campaign) : "") +
          "</div></div>" +
          '<a href="./crm-lead-detail.html?id=' +
          encodeURIComponent(l.id) +
          '" class="btn btn-primary btn-sm">Fiche</a></div>'
        );
      })
      .join("");
  }

  function renderPages(d) {
    var pages = d.pages || [];
    var el = document.getElementById("mmPagesList");
    if (!pages.length) {
      el.innerHTML = "<p style='color:var(--muted)'>Aucune page enregistrée — ajoutez vos liens ci-dessous.</p>";
      return;
    }
    el.innerHTML = pages
      .map(function (p) {
        var isGroup = p.type === "group";
        return (
          '<div class="mm-page-card' +
          (isGroup ? " group" : "") +
          '">' +
          "<strong>" +
          esc(p.name) +
          "</strong> " +
          (p.role === "primary" ? '<span class="acq-badge meta">Principale</span> ' : "") +
          (isGroup ? '<span class="acq-badge muted">Groupe</span> ' : "") +
          (p.lead_ads_webhook ? '<span class="acq-badge meta">Webhook Lead Ads</span> ' : "") +
          '<p style="margin:6px 0"><a href="' +
          esc(p.url) +
          '" target="_blank" rel="noopener">' +
          esc(p.url) +
          "</a></p>" +
          (p.notes ? '<p style="font-size:.85rem;color:var(--muted)">' + esc(p.notes) + "</p>" : "") +
          (p.utm_template
            ? '<p style="font-size:.82rem;margin-top:8px">Lien UTM groupe/page :<br><code style="word-break:break-all">' +
              esc(p.utm_template) +
              '</code> <button type="button" class="btn btn-ghost btn-sm" data-copy="' +
              esc(p.utm_template) +
              '">Copier</button></p>'
            : "") +
          (p.hint ? '<p style="font-size:.82rem;color:#b45309">' + esc(p.hint) + "</p>" : "") +
          "</div>"
        );
      })
      .join("");
    el.querySelectorAll("[data-copy]").forEach(function (btn) {
      btn.onclick = function () {
        navigator.clipboard.writeText(btn.getAttribute("data-copy")).then(function () {
          btn.textContent = "Copié ✓";
          setTimeout(function () {
            btn.textContent = "Copier";
          }, 1500);
        });
      };
    });
  }

  function renderCampaigns(d) {
    var ac = d.active_campaign;
    var rotEl = document.getElementById("mmActiveCampaign");
    if (ac) {
      var ad = ac.ad_copy || {};
      rotEl.innerHTML =
        "<h2>Campagne active</h2>" +
        "<p><strong>" +
        esc(ac.form_name || ac.vertical || ac.id) +
        "</strong></p>" +
        (ad.primary_text
          ? '<p style="font-size:.9rem">' + esc(ad.primary_text) + "</p>"
          : "") +
        (ac.landing_url
          ? '<p><a href="' + esc(ac.landing_url) + '" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">Landing ↗</a></p>'
          : "") +
        '<p style="margin-top:8px"><a href="./crm-pubs.html" class="btn btn-primary btn-sm">Gestion pubs complète</a></p>';
    } else {
      rotEl.innerHTML = "<h2>Campagne active</h2><p style='color:var(--muted)'>Aucune rotation chargée.</p>";
    }

    var forms = d.meta_forms || [];
    document.getElementById("mmForms").innerHTML = forms.length
      ? '<table><thead><tr><th>Formulaire</th><th>Vertical</th><th>ID</th><th></th></tr></thead><tbody>' +
        forms
          .map(function (f) {
            return (
              "<tr><td>" +
              esc(f.name) +
              "</td><td>" +
              esc(f.vertical) +
              "</td><td><code>" +
              esc(f.form_id) +
              '</code></td><td><a href="' +
              esc(f.landing_url || "#") +
              '" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">Landing</a></td></tr>'
            );
          })
          .join("") +
        "</tbody></table>"
      : "<p style='color:var(--muted)'>Aucun formulaire configuré.</p>";

    document.getElementById("mmLinks").innerHTML = (d.meta_links || [])
      .map(function (l) {
        return (
          '<a href="' +
          esc(l.url) +
          '" target="_blank" rel="noopener" class="btn btn-primary btn-sm">' +
          esc(l.label) +
          " ↗</a>"
        );
      })
      .join("");
  }

  function renderAll() {
    var d = state.data;
    if (!d) return;
    renderKpis(d);
    renderHealth(d);
    renderChannels(d);
    renderLeads(d);
    renderPages(d);
    renderCampaigns(d);
  }

  function load() {
    fetch("/api/crm/meta-manager?days=" + encodeURIComponent(state.days), { headers: authHeaders() })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok) throw new Error(res.error || "Erreur");
        state.data = res;
        renderAll();
      })
      .catch(function (e) {
        document.getElementById("mmKpis").innerHTML =
          '<span class="acq-stat" style="color:#b91c1c">' + esc(String(e)) + "</span>";
      });
  }

  document.getElementById("mmTabs").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-tab]");
    if (!btn) return;
    state.tab = btn.getAttribute("data-tab");
    document.querySelectorAll(".mm-tabs button").forEach(function (b) {
      b.classList.toggle("active", b === btn);
    });
    document.querySelectorAll(".mm-panel").forEach(function (p) {
      p.classList.remove("active");
    });
    document.getElementById("mmPanel" + state.tab.charAt(0).toUpperCase() + state.tab.slice(1)).classList.add("active");
  });

  document.getElementById("mmLeadDays").onchange = function () {
    state.days = Number(this.value) || 7;
    load();
  };
  document.getElementById("mmLeadFilter").onchange = function () {
    state.leadFilter = this.value;
    renderLeads(state.data || { recent_leads: [] });
  };
  document.getElementById("mmRefresh").onclick = load;

  document.getElementById("mmAddPageForm").onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    var msg = document.getElementById("mmAddPageMsg");
    msg.textContent = "Enregistrement…";
    msg.style.color = "var(--muted)";
    fetch("/api/crm/meta-manager", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        action: "register_page",
        name: fd.get("name"),
        url: fd.get("url"),
        notes: fd.get("notes"),
      }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok) throw new Error(res.error || "Erreur");
        msg.textContent = "Page enregistrée ✓";
        msg.style.color = "#16a34a";
        e.target.reset();
        load();
      })
      .catch(function (err) {
        msg.textContent = String(err.message || err);
        msg.style.color = "#b91c1c";
      });
  };

  load();
})();
