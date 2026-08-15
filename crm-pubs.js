(function () {
  var TOKEN_KEY = "lo_token";
  var token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : s;
    return d.innerHTML;
  }

  function authHeaders() {
    return { Authorization: "Bearer " + token, "Content-Type": "application/json" };
  }

  function copyText(text, btn) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(
      function () {
        if (btn) {
          var old = btn.textContent;
          btn.textContent = "Copié ✓";
          setTimeout(function () {
            btn.textContent = old;
          }, 1500);
        }
      },
      function () {
        prompt("Copier :", text);
      }
    );
  }

  function renderSlackStatus(notif) {
    var el = document.getElementById("slackStatus");
    if (!notif || !notif.slack) {
      el.innerHTML = "";
      return;
    }
    var s = notif.slack;
    var ok = s.configured;
    el.innerHTML =
      '<div class="crm-section-head"><div><p class="crm-eyebrow">Notifications</p><h2 style="margin:0">Slack — alertes leads</h2></div>' +
      '<span class="acq-badge ' +
      (ok ? "meta" : "muted") +
      '">' +
      (ok ? "Configuré ✓" : "Token / webhook manquant") +
      "</span></div>" +
      "<p style=\"color:var(--muted)\">Chaque lead (site + Meta Lead Ads) et chaque fiche interlocuteur envoie une alerte Slack. Variable : <strong>SLACK_BOT_TOKEN</strong> (ou webhook).</p>" +
      (s.webhook_invalid
        ? '<p style="color:#b91c1c;font-size:.9rem">SLACK_WEBHOOK_URL n’est pas une URL. Collez <code>https://hooks.slack.com/services/…</code> (pas le signing secret). ' +
          (s.token_ok ? "Le test utilisera le token bot." : "Ajoutez aussi SLACK_BOT_TOKEN (xoxb-…).") +
          "</p>"
        : "") +
      (ok
        ? '<p><button type="button" class="btn btn-primary btn-sm" id="btnTestSlack">Envoyer un test Slack</button> <span id="slackTestResult" style="margin-left:8px;color:var(--muted)"></span></p>'
        : '<ol style="color:var(--muted);margin:8px 0 0 18px;line-height:1.6"><li>Ouvrir l’app Slack <a href="https://api.slack.com/apps/A0BQ6Q905KM" target="_blank" rel="noopener">Leads Opportunities CRM</a></li><li>OAuth &amp; Permissions → <strong>Install to Workspace</strong> → choisir le canal (ex. #leads)</li><li>Copier le <strong>Bot User OAuth Token</strong> (<code>xoxb-…</code>) dans Vercel → <strong>SLACK_BOT_TOKEN</strong> <em>ou</em> l’Incoming Webhook → <strong>SLACK_WEBHOOK_URL</strong></li><li>Redeploy puis cliquer « Tester Slack »</li></ol>') +
      '<div class="pub-link-row">' +
      '<a href="https://api.slack.com/apps" target="_blank" rel="noopener" class="btn btn-primary btn-sm">Créer webhook Slack ↗</a>' +
      '<a href="https://vercel.com/dashboard" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">Vercel env ↗</a>' +
      '<a href="./docs/SLACK-WITHALLO-NOTIFS.md" class="btn btn-ghost btn-sm">Doc Slack + WithAllo</a>' +
      (!ok ? '<button type="button" class="btn btn-ghost btn-sm" id="btnTestSlack">Tester quand même</button>' : "") +
      "</div>";
    var testBtn = document.getElementById("btnTestSlack");
    if (testBtn) {
      testBtn.onclick = function () {
        var out = document.getElementById("slackTestResult");
        if (out) out.textContent = "Envoi…";
        testBtn.disabled = true;
        fetch("/api/crm/test-slack", { method: "POST", headers: authHeaders() })
          .then(function (r) {
            return r.json().then(function (j) {
              return { status: r.status, body: j };
            });
          })
          .then(function (res) {
            if (out) {
              out.textContent = res.body.ok
                ? "✓ Message reçu sur Slack"
                : res.body.error || "Erreur " + res.status;
              out.style.color = res.body.ok ? "#16a34a" : "#b91c1c";
            }
          })
          .catch(function (e) {
            if (out) {
              out.textContent = String(e);
              out.style.color = "#b91c1c";
            }
          })
          .finally(function () {
            testBtn.disabled = false;
          });
      };
    }
  }

  function renderPresetCampaigns(list, activeId) {
    var el = document.getElementById("presetCampaigns");
    if (!list || !list.length) {
      el.innerHTML = "<p>Aucune campagne prête.</p>";
      return;
    }
    el.innerHTML = list
      .map(function (c) {
        var ad = c.ad_copy || {};
        var isActive = c.active || c.id === activeId;
        return (
          '<div class="pub-platform-card" style="margin-bottom:12px;border-left:4px solid ' +
          (isActive ? "#16a34a" : "#64748b") +
          '">' +
          "<h3>" +
          (isActive ? "▶ " : "") +
          esc(c.label) +
          (isActive ? ' <span class="acq-badge meta">Active</span>' : "") +
          "</h3>" +
          '<div class="acq-stats">' +
          '<span class="acq-stat">Form <strong>' +
          esc(c.form_id) +
          "</strong></span>" +
          '<span class="acq-stat">UTM <strong>' +
          esc(c.utm_campaign) +
          "</strong></span>" +
          "</div>" +
          (ad.headline
            ? '<p class="pub-copy-text"><strong>Titre :</strong> ' +
              esc(ad.headline) +
              ' <button type="button" class="btn btn-ghost btn-sm js-copy" data-copy="' +
              esc(ad.headline) +
              '">Copier</button></p>'
            : "") +
          (ad.primary
            ? '<p class="pub-copy-text"><strong>Texte :</strong> ' +
              esc(ad.primary) +
              ' <button type="button" class="btn btn-ghost btn-sm js-copy" data-copy="' +
              esc(ad.primary) +
              '">Copier</button></p>'
            : "") +
          '<div class="pub-link-row" style="margin-top:8px">' +
          '<a href="' +
          esc(c.ads_manager) +
          '" target="_blank" rel="noopener" class="btn btn-primary btn-sm">Ads Manager ↗</a>' +
          (c.csv ? '<a href="' + esc(c.csv) + '" class="btn btn-ghost btn-sm">CSV textes</a>' : "") +
          (c.config ? '<a href="' + esc(c.config) + '" class="btn btn-ghost btn-sm">Config JSON</a>' : "") +
          (c.crm_matcher ? '<a href="' + esc(c.crm_matcher) + '" class="btn btn-ghost btn-sm">Matching VSP</a>' : "") +
          (c.landing_url
            ? '<a href="' +
              esc(c.landing_url) +
              '" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">Landing test ↗</a>'
            : "") +
          "</div></div>"
        );
      })
      .join("");
    el.querySelectorAll(".js-copy").forEach(function (btn) {
      btn.onclick = function () {
        copyText(btn.getAttribute("data-copy"), btn);
      };
    });
  }

  function renderPlatforms(platforms) {
    var el = document.getElementById("pubPlatforms");
    el.innerHTML = (platforms || [])
      .map(function (p) {
        var links = p.links || [];
        var internal = p.internal || [];
        return (
          '<div class="pub-platform-card pub-platform-card--large" style="border-left:4px solid ' +
          esc(p.color || "#64748b") +
          '">' +
          "<h3>" +
          esc(p.icon) +
          " " +
          esc(p.label) +
          "</h3>" +
          (p.setup_note ? '<p class="pub-note">' + esc(p.setup_note) + "</p>" : "") +
          '<div class="pub-link-row">' +
          links
            .map(function (l) {
              return (
                '<a href="' +
                esc(l.url) +
                '" target="_blank" rel="noopener" class="btn ' +
                (l.primary ? "btn-primary" : "btn-ghost") +
                ' btn-sm pub-ext-link">' +
                esc(l.label) +
                " ↗</a>"
              );
            })
            .join("") +
          "</div>" +
          (internal.length
            ? '<p class="pub-internal">Interne : ' +
              internal
                .map(function (i) {
                  return '<a href="' + esc(i.href) + '">' + esc(i.label) + "</a>";
                })
                .join(" · ") +
              "</p>"
            : "") +
          "</div>"
        );
      })
      .join("");
  }

  function renderActive(c) {
    var el = document.getElementById("activeCampaign");
    if (!c) {
      el.innerHTML = "<p>Aucune campagne rotation — voir docs/META-ROTATION-4-SEMAINES.md</p>";
      return;
    }
    var ad = c.ad_copy || {};
    var badge = c.actu_override ? "🔥 Actu canicule — MAINTENANT" : "▶ Campagne semaine";
    el.innerHTML =
      '<div class="crm-section-head"><div><p class="crm-eyebrow">' +
      esc(badge) +
      "</p><h2 style=\"margin:0\">" +
      esc(c.id) +
      " · " +
      esc(c.vertical) +
      (c.discrete ? " (discret)" : "") +
      '</h2></div><span class="acq-badge meta">1 €/jour max</span></div>' +
      '<div class="acq-stats">' +
      '<span class="acq-stat">Form <strong>' +
      esc(c.form_id) +
      "</strong></span>" +
      '<span class="acq-stat">UTM <strong>' +
      esc(c.utm_campaign) +
      "</strong></span>" +
      '<span class="acq-stat">Âge <strong>' +
      esc(c.targeting && c.targeting.age_min) +
      "–" +
      esc(c.targeting && c.targeting.age_max) +
      "</strong></span>" +
      "</div>" +
      '<div class="pub-copy-block">' +
      "<p><strong>Titre pub</strong></p>" +
      '<p class="pub-copy-text" data-copy="' +
      esc(ad.headline || "") +
      '">' +
      esc(ad.headline) +
      ' <button type="button" class="btn btn-ghost btn-sm js-copy">Copier</button></p>' +
      "<p><strong>Texte principal</strong></p>" +
      '<p class="pub-copy-text" data-copy="' +
      esc(ad.primary || "") +
      '">' +
      esc(ad.primary) +
      ' <button type="button" class="btn btn-ghost btn-sm js-copy">Copier</button></p>' +
      "<p><strong>CTA</strong> : " +
      esc(ad.cta) +
      "</p>" +
      (c.landing_url
        ? '<p><strong>Landing</strong> : <a href="' +
          esc(c.landing_url) +
          '" target="_blank" rel="noopener">' +
          esc(c.landing_url) +
          " ↗</a></p>"
        : "") +
      (c.blog && c.blog.url
        ? '<p><strong>Article</strong> : <a href="' +
          esc(c.blog.url) +
          '" target="_blank" rel="noopener">' +
          esc(c.blog.slug) +
          " ↗</a></p>"
        : "") +
      '<p style="margin-top:12px"><a href="https://www.facebook.com/adsmanager/manage/campaigns?act=997768686183548" target="_blank" rel="noopener" class="btn btn-primary">Créer / modifier la pub dans Ads Manager ↗</a></p>' +
      "</div>";
    el.querySelectorAll(".js-copy").forEach(function (btn) {
      btn.onclick = function () {
        copyText(btn.parentElement.getAttribute("data-copy"), btn);
      };
    });
  }

  function renderForms(forms) {
    var el = document.getElementById("metaFormsList");
    if (!forms || !forms.length) {
      el.innerHTML = "<p>Aucun formulaire configuré.</p>";
      return;
    }
    el.innerHTML =
      "<table><thead><tr><th>Form ID</th><th>Nom</th><th>Vertical</th><th>Landing</th><th></th></tr></thead><tbody>" +
      forms
        .map(function (f) {
          return (
            "<tr><td><code>" +
            esc(f.form_id) +
            '</code> <button type="button" class="btn btn-ghost btn-sm js-copy-id" data-id="' +
            esc(f.form_id) +
            '">Copier</button></td><td>' +
            esc(f.name) +
            "</td><td>" +
            esc(f.vertical) +
            '</td><td><a href="' +
            esc(f.landing_url) +
            '" target="_blank" rel="noopener">' +
            esc(f.landing) +
            ' ↗</a></td><td><a href="https://www.facebook.com/adsmanager/manage/forms?act=997768686183548" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">Meta ↗</a></td></tr>'
          );
        })
        .join("") +
      "</tbody></table>";
    el.querySelectorAll(".js-copy-id").forEach(function (btn) {
      btn.onclick = function () {
        copyText(btn.getAttribute("data-id"), btn);
      };
    });
  }

  function renderTestLandings(list) {
    var el = document.getElementById("testLandings");
    el.innerHTML =
      "<ul>" +
      (list || [])
        .map(function (t) {
          return (
            "<li><a href=\"" +
            esc(t.url) +
            '" target="_blank" rel="noopener">' +
            esc(t.label) +
            " ↗</a> <button type=\"button\" class=\"btn btn-ghost btn-sm js-copy-url\" data-url=\"" +
            esc(t.url) +
            '">Copier URL</button></li>'
          );
        })
        .join("") +
      "</ul>";
    el.querySelectorAll(".js-copy-url").forEach(function (btn) {
      btn.onclick = function () {
        copyText(btn.getAttribute("data-url"), btn);
      };
    });
  }

  function load() {
    fetch("/api/crm/pubs-hub", { headers: authHeaders() })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok) throw new Error(res.error || "Erreur");
        var pol = (res.rotation && res.rotation.policy) || {};
        document.getElementById("pubPolicy").innerHTML =
          '<span class="acq-stat">Budget max <strong>' +
          (pol.max_daily_budget_eur || 1) +
          " €/jour</strong></span>" +
          '<span class="acq-stat">Campagnes actives max <strong>' +
          (pol.max_active_campaigns || 1) +
          "</strong></span>" +
          (res.rotation && res.rotation.recommendation
            ? '<span class="acq-stat">' + esc(res.rotation.recommendation.reason) + "</span>"
            : "");
        renderSlackStatus(res.notifications);
        renderActive(res.active_campaign);
        renderPresetCampaigns(res.preset_campaigns, res.active_campaign && res.active_campaign.id);
        renderPlatforms(res.platforms);
        renderForms(res.meta_forms);
        renderTestLandings(res.test_landings);
        document.getElementById("pubDocs").innerHTML = (res.docs || [])
          .map(function (d) {
            return "<li><a href=\"" + esc(d.href) + '">' + esc(d.label) + "</a></li>";
          })
          .join("");
      })
      .catch(function (e) {
        document.getElementById("activeCampaign").innerHTML =
          '<p style="color:#b91c1c">' + esc(String(e)) + "</p>";
      });
  }

  document.getElementById("btnPubRefresh").onclick = load;
  load();
})();
