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

  function growthClass(pct) {
    if (pct > 0) return "blog-stats-growth--up";
    if (pct < 0) return "blog-stats-growth--down";
    return "blog-stats-growth--flat";
  }

  function growthLabel(pct) {
    if (pct > 0) return "+" + pct + " %";
    if (pct < 0) return pct + " %";
    return "= 0 %";
  }

  function renderSummary(cmp, inventory, leadsTotal) {
    var v = cmp.visitors || {};
    var cta = cmp.cta_clicks || {};
    var leads = cmp.leads_blog || {};
    document.getElementById("blogStatsSummary").innerHTML =
      '<span class="acq-stat">Visiteurs blog 7j <strong>' +
      (v.this_week || 0) +
      "</strong></span>" +
      '<span class="acq-stat">Clics CTA 7j <strong>' +
      (cta.this_week || 0) +
      "</strong></span>" +
      '<span class="acq-stat">Leads blog 7j <strong>' +
      (leads.this_week || 0) +
      "</strong></span>" +
      '<span class="acq-stat">Leads période <strong>' +
      (leadsTotal || 0) +
      "</strong></span>";
    document.getElementById("blogStatsInventory").textContent =
      (inventory && inventory.total_articles != null
        ? inventory.total_articles + " articles"
        : "—") +
      (inventory && inventory.total_forum_pages
        ? " · " + inventory.total_forum_pages + " pages forum"
        : "");
  }

  function renderCompare(cmp) {
    var items = [
      { key: "visitors", label: "Visiteurs uniques" },
      { key: "page_views", label: "Pages vues" },
      { key: "article_views", label: "Vues article (event)" },
      { key: "cta_clicks", label: "Clics CTA" },
      { key: "reads_complete", label: "Lectures 100 %" },
      { key: "leads_blog", label: "Leads blog/forum" },
    ];
    document.getElementById("blogStatsCompare").innerHTML = items
      .map(function (it) {
        var d = cmp[it.key] || {};
        return (
          '<div class="blog-stats-card"><h3>' +
          esc(it.label) +
          '</h3><div class="big">' +
          esc(d.this_week == null ? 0 : d.this_week) +
          '</div><div class="sub">Sem. préc. : <strong>' +
          esc(d.last_week == null ? "—" : d.last_week) +
          '</strong></div><div class="' +
          growthClass(d.growth_pct) +
          '" style="margin-top:6px;font-size:0.85rem">' +
          esc(growthLabel(d.growth_pct || 0)) +
          "</div></div>"
        );
      })
      .join("");
  }

  function renderChart(trend) {
    var el = document.getElementById("blogStatsChart");
    if (!trend || !trend.length) {
      el.innerHTML =
        '<p style="color:var(--muted)">Pas encore de données blog sur cette période. Les vues page_view /blog remontent dès qu’un visiteur ouvre un article ; les clics CTA après déploiement du miroir journey.</p>';
      return;
    }
    var max = Math.max.apply(
      null,
      trend
        .map(function (t) {
          return t.page_views || 0;
        })
        .concat([1])
    );
    el.innerHTML = trend
      .map(function (t) {
        var h = Math.round(((t.page_views || 0) / max) * 100);
        var day = String(t.day).slice(5);
        return (
          '<div class="blog-stats-bar-wrap" title="' +
          esc(t.day) +
          " — " +
          t.page_views +
          " vues, " +
          t.cta_clicks +
          " CTA, " +
          t.visitors +
          ' visiteurs">' +
          '<div class="blog-stats-bar" style="height:' +
          h +
          '%"></div>' +
          '<span class="blog-stats-bar-label">' +
          esc(day) +
          "</span></div>"
        );
      })
      .join("");
  }

  var articlesCache = [];

  function articleUrl(r) {
    if (r.path && r.path.indexOf("http") === 0) return r.path;
    var origin =
      (window.LoSiteBrand && window.LoSiteBrand.publicOrigin && window.LoSiteBrand.publicOrigin()) ||
      "https://www.leadsopportunities.fr";
    return origin + (r.path || "/blog/");
  }

  function formatDate(r) {
    if (r.date_published) return r.date_published;
    if (r.date_label) return r.date_label;
    return "—";
  }

  function renderArticles(rows) {
    var el = document.getElementById("blogStatsArticles");
    var q = ((document.getElementById("blogStatsSearch") || {}).value || "").trim().toLowerCase();
    var filtered = (rows || []).filter(function (r) {
      if (!q) return true;
      return [r.title, r.slug, r.section, r.questionnaire_need, r.date_published, r.meta]
        .join(" ")
        .toLowerCase()
        .indexOf(q) !== -1;
    });
    if (!filtered.length) {
      el.innerHTML =
        '<p style="color:var(--muted)">Aucun article. Ouvrez un article en prod ou élargissez la recherche.</p>';
      return;
    }
    el.innerHTML =
      "<table><thead><tr><th>Date</th><th>Article</th><th>Questionnaire</th><th>Vues</th><th>CTA</th><th>Lecture 100%</th><th>Leads</th></tr></thead><tbody>" +
      filtered
        .map(function (r) {
          var url = articleUrl(r);
          var qAdmin =
            r.questionnaires_admin_url ||
            "./blog-questionnaires.html?q=" + encodeURIComponent(r.slug || "");
          if (qAdmin.indexOf("http") !== 0 && qAdmin.charAt(0) === "/") {
            qAdmin = "." + qAdmin;
          }
          var qLabel = r.questionnaire_need
            ? "need=" + r.questionnaire_need
            : "Mapping";
          var qLive = r.questionnaire_url || "";
          if (qLive && qLive.indexOf("http") !== 0 && qLive.indexOf("mailto:") !== 0) {
            qLive = qLive.replace(/^\.\.\//, "./").replace(/^\//, "./");
            if (qLive.indexOf("./") !== 0 && qLive.indexOf("landings/") === 0) {
              qLive = "./" + qLive;
            }
          }
          return (
            "<tr><td class=\"blog-stats-date\">" +
            esc(formatDate(r)) +
            (r.date_label && r.date_label !== r.date_published
              ? "<br><span style=\"font-size:0.7rem\">" + esc(r.date_label) + "</span>"
              : "") +
            '</td><td><a class="blog-stats-article-link" href="' +
            esc(url) +
            '" target="_blank" rel="noopener">' +
            esc(r.title || r.slug) +
            "</a><br><code style=\"font-size:0.7rem\">" +
            esc(r.slug) +
            "</code>" +
            (r.section
              ? ' <span class="acq-badge muted" style="font-size:0.65rem">' +
                esc(r.section) +
                "</span>"
              : "") +
            '</td><td class="blog-stats-q-link"><a href="' +
            esc(qAdmin) +
            '">' +
            esc(qLabel) +
            "</a>" +
            (qLive
              ? '<br><a href="' +
                esc(qLive) +
                '" target="_blank" rel="noopener">Ouvrir devis</a>'
              : "") +
            "</td><td><strong>" +
            (r.views || 0) +
            "</strong></td><td>" +
            (r.cta_clicks || 0) +
            "</td><td>" +
            (r.reads_complete || r.scroll_100 || 0) +
            "</td><td>" +
            (r.leads || 0) +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table>";
  }

  function renderCtas(rows) {
    var el = document.getElementById("blogStatsCtas");
    if (!rows || !rows.length) {
      el.innerHTML = '<p style="color:var(--muted)">Aucun clic CTA blog_* encore stocké.</p>';
      return;
    }
    el.innerHTML =
      "<table><thead><tr><th>Bouton / zone</th><th>Clics</th></tr></thead><tbody>" +
      rows
        .map(function (r) {
          return (
            "<tr><td>" +
            esc(r.label) +
            "</td><td><strong>" +
            r.clicks +
            "</strong></td></tr>"
          );
        })
        .join("") +
      "</tbody></table>";
  }

  function renderTopPages(pages) {
    var el = document.getElementById("blogStatsTopPages");
    if (!pages || !pages.length) {
      el.innerHTML = '<p style="color:var(--muted)">Aucune page /blog ou /forum vue.</p>';
      return;
    }
    el.innerHTML =
      "<table><thead><tr><th>Page</th><th>Vues</th><th>Visiteurs</th></tr></thead><tbody>" +
      pages
        .slice(0, 15)
        .map(function (p) {
          var url =
            p.path && p.path.indexOf("http") === 0
              ? p.path
              : ((window.LoSiteBrand && window.LoSiteBrand.publicOrigin && window.LoSiteBrand.publicOrigin()) ||
                  "https://www.leadsopportunities.fr") + (p.path || "/");
          return (
            '<tr><td><a class="blog-stats-article-link" href="' +
            esc(url) +
            '" target="_blank" rel="noopener"><code>' +
            esc(p.path) +
            "</code></a></td><td><strong>" +
            p.views +
            "</strong></td><td>" +
            p.visitors +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table>";
  }

  function renderLeads(leads) {
    var el = document.getElementById("blogStatsLeads");
    if (!leads || !leads.length) {
      el.innerHTML =
        '<p style="color:var(--muted)">Aucun lead attribué au blog/forum sur la période (filtre landing / UTM / journey).</p>';
      return;
    }
    var origin =
      (window.LoSiteBrand && window.LoSiteBrand.publicOrigin && window.LoSiteBrand.publicOrigin()) ||
      "https://www.leadsopportunities.fr";
    el.innerHTML =
      "<table><thead><tr><th>Date</th><th>Article source</th><th>Vertical</th><th>Source</th><th>Campagne</th><th>Contact</th><th>Score</th></tr></thead><tbody>" +
      leads
        .map(function (l) {
          var d = l.created_at ? String(l.created_at).slice(0, 16).replace("T", " ") : "—";
          var artPath = l.article_path || (l.slug && l.slug.indexOf("(") !== 0 ? "/blog/" + l.slug + ".html" : "");
          var artUrl = artPath
            ? artPath.indexOf("http") === 0
              ? artPath
              : origin + artPath
            : "";
          var qUrl = l.questionnaires_admin_url || "./blog-questionnaires.html?q=" + encodeURIComponent(l.slug || "");
          if (qUrl.charAt(0) === "/") qUrl = "." + qUrl;
          var articleCell = artUrl
            ? '<a class="blog-stats-article-link" href="' +
              esc(artUrl) +
              '" target="_blank" rel="noopener">' +
              esc(l.article_title || l.slug) +
              "</a><br><code style=\"font-size:0.7rem\">" +
              esc(l.slug || "") +
              "</code>" +
              (l.article_source
                ? ' <span class="acq-badge muted" style="font-size:0.65rem">' +
                  esc(l.article_source) +
                  "</span>"
                : "") +
              '<br><a href="' +
              esc(qUrl) +
              '" style="font-size:0.72rem">Questionnaire</a>'
            : esc(l.landing || l.slug || "—");
          return (
            "<tr><td>" +
            esc(d) +
            "</td><td>" +
            articleCell +
            "</td><td>" +
            esc(l.vertical || "—") +
            "</td><td>" +
            esc(l.source || "—") +
            "</td><td>" +
            esc(l.utm_campaign || "—") +
            "</td><td>" +
            (l.email === "oui" ? "✉" : "") +
            (l.phone === "oui" ? " ☎" : "") +
            "</td><td>" +
            (l.lead_score || 0) +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table>";
  }

  function renderLeadsByArticle(rows) {
    var el = document.getElementById("blogStatsLeadsByArticle");
    if (!el) return;
    if (!rows || !rows.length) {
      el.innerHTML = '<p style="color:var(--muted)">Pas encore de leads rattachés à un article.</p>';
      return;
    }
    var origin =
      (window.LoSiteBrand && window.LoSiteBrand.publicOrigin && window.LoSiteBrand.publicOrigin()) ||
      "https://www.leadsopportunities.fr";
    el.innerHTML =
      "<table><thead><tr><th>Article</th><th>Date pub.</th><th>Leads</th></tr></thead><tbody>" +
      rows
        .map(function (r) {
          var url = r.path ? (r.path.indexOf("http") === 0 ? r.path : origin + r.path) : "#";
          return (
            "<tr><td><a class=\"blog-stats-article-link\" href=\"" +
            esc(url) +
            '" target="_blank" rel="noopener">' +
            esc(r.title || r.slug) +
            "</a></td><td class=\"blog-stats-date\">" +
            esc(r.date_published || "—") +
            "</td><td><strong>" +
            r.leads +
            "</strong></td></tr>"
          );
        })
        .join("") +
      "</tbody></table>";
  }

  function renderExternal(links) {
    var el = document.getElementById("blogStatsExternal");
    el.innerHTML = (links || [])
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

  function load() {
    var days = document.getElementById("blogStatsDays").value || 30;
    fetch("/api/crm/blog-stats?days=" + encodeURIComponent(days), { headers: authHeaders() })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok) throw new Error(res.error || "Erreur");
        articlesCache = res.articles || [];
        if (window.LoSiteBrand && window.LoSiteBrand.isBuchet && window.LoSiteBrand.isBuchet()) {
          var filterImmo = document.getElementById("blogStatsImmoOnly");
          if (filterImmo && filterImmo.checked) {
            articlesCache = articlesCache.filter(function (a) {
              return window.LoSiteBrand.isImmoSection(a.section) || /immo|credit|pret|vendeur|acquereur|habitation|syndic|location|finance|habitat/i.test(
                [a.slug, a.title, a.section].join(" ")
              );
            });
          }
        }
        renderSummary(res.comparison || {}, res.inventory || {}, res.leads_total);
        renderCompare(res.comparison || {});
        renderChart(res.trend);
        renderArticles(articlesCache);
        renderCtas(res.top_ctas);
        renderTopPages(res.top_pages);
        renderLeads(res.leads);
        renderLeadsByArticle(res.leads_by_article);
        renderExternal(res.analytics_links);
        document.getElementById("blogStatsNote").textContent = res.note || "";
      })
      .catch(function (e) {
        document.getElementById("blogStatsCompare").innerHTML =
          '<p style="color:#b91c1c">' + esc(String(e)) + "</p>";
      });
  }

  function applyHostBrand() {
    if (!window.LoSiteBrand) return;
    var label = window.LoSiteBrand.label();
    var eyebrow = document.querySelector(".crm-eyebrow");
    if (eyebrow && window.LoSiteBrand.isBuchet()) {
      eyebrow.textContent = "Analytics · " + label;
    }
    var h2 = document.querySelector(".crm-page-panel h2");
    if (h2 && window.LoSiteBrand.isBuchet()) {
      h2.textContent = "Stats blog immo — vues, clics, leads";
    }
    var immoWrap = document.getElementById("blogStatsImmoFilterWrap");
    if (immoWrap) {
      immoWrap.style.display = window.LoSiteBrand.isBuchet() ? "" : "none";
    }
  }

  document.getElementById("btnBlogStatsRefresh").onclick = load;
  document.getElementById("blogStatsDays").onchange = load;
  var searchEl = document.getElementById("blogStatsSearch");
  if (searchEl) {
    searchEl.addEventListener("input", function () {
      renderArticles(articlesCache);
    });
    try {
      var hash = (location.hash || "").replace(/^#/, "");
      var params = new URLSearchParams(hash.indexOf("=") !== -1 ? hash : location.search);
      var pre = params.get("article") || params.get("q") || "";
      if (!pre && hash.indexOf("article=") === 0) pre = decodeURIComponent(hash.split("=")[1] || "");
      if (pre) searchEl.value = pre.replace(/\.html$/i, "");
    } catch (e) {}
  }
  var immoOnly = document.getElementById("blogStatsImmoOnly");
  if (immoOnly) immoOnly.addEventListener("change", load);
  applyHostBrand();
  load();
})();
