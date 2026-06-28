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
        renderActive(res.active_campaign);
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
