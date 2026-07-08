/**
 * Injection SEO : meta keywords, bloc contenu semantique, schema WebPage/FAQ.
 */
(function () {
  function cfg() {
    return window.LANDING_SEO_CONFIG;
  }

  function ensureMetaKeywords(content) {
    if (!content) return;
    var existing = document.querySelector('meta[name="keywords"]');
    if (existing) {
      existing.setAttribute("content", content);
      return;
    }
    var meta = document.createElement("meta");
    meta.name = "keywords";
    meta.content = content;
    document.head.appendChild(meta);
  }

  function setTextMeta(name, value) {
    if (!value) return;
    var el = document.querySelector('meta[name="' + name + '"]');
    if (!el) {
      el = document.createElement("meta");
      el.name = name;
      document.head.appendChild(el);
    }
    el.content = value;
  }

  function renderSeoBlock(pageCfg, slug) {
    if (!pageCfg || !pageCfg.sections || !pageCfg.sections.length) return null;
    var wrap = document.createElement("aside");
    wrap.className = "landing-seo-content form-wrap";
    wrap.setAttribute("aria-label", "Informations sur ce parcours de devis");

    var html = '<h2>Informations utiles pour votre devis</h2>';
    pageCfg.sections.forEach(function (sec) {
      html += "<h3>" + sec.h2 + "</h3><p>" + sec.text + "</p>";
      if (sec.links && sec.links.length) {
        html += '<ul class="points landing-seo-links">';
        sec.links.forEach(function (l) {
          html += '<li><a href="' + l.href + '">' + l.label + "</a></li>";
        });
        html += "</ul>";
      }
    });

    if (pageCfg.pillar) {
      html +=
        '<p class="small landing-seo-pillar">En savoir plus : <a href="' +
        pageCfg.pillar +
        '">guide complet</a></p>';
    }

    if (pageCfg.faq && pageCfg.faq.length) {
      html += '<h3>Questions frequentes</h3><dl class="landing-seo-faq">';
      pageCfg.faq.forEach(function (item) {
        html += "<dt>" + item.q + "</dt><dd>" + item.a + "</dd>";
      });
      html += "</dl>";
    }

    wrap.innerHTML = html;
    wrap.dataset.landingSeo = slug || "page";
    return wrap;
  }

  function injectSchema(pageCfg, slug) {
    var c = cfg();
    if (!c) return;
    var path = window.location.pathname;
    var url = c.ORIGIN + path + (window.location.search || "");
    var title = document.title;
    var desc =
      (document.querySelector('meta[name="description"]') || {}).content || pageCfg.description || "";

    var graph = [
      {
        "@type": "WebPage",
        "@id": url + "#webpage",
        url: url,
        name: title,
        description: desc,
        isPartOf: { "@id": c.ORIGIN + "/#website" },
        about: { "@type": "Service", name: pageCfg.badge || slug || "Devis assurance" },
      },
    ];

    if (pageCfg.faq && pageCfg.faq.length) {
      graph.push({
        "@type": "FAQPage",
        mainEntity: pageCfg.faq.map(function (item) {
          return {
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          };
        }),
      });
    }

    if (document.querySelector("script[data-landing-seo-schema]")) return;
    var script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-landing-seo-schema", "1");
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": graph,
    });
    document.head.appendChild(script);
  }

  function mountBlock(pageCfg, slug) {
    var block = renderSeoBlock(pageCfg, slug);
    if (!block) return;
    var old = document.querySelector(".landing-seo-content");
    if (old) old.remove();
    var card = document.querySelector("main .card");
    var footer = document.querySelector(".landing-footer");
    if (card) card.appendChild(block);
    else if (footer) footer.parentNode.insertBefore(block, footer);
    else document.body.appendChild(block);
  }

  function apply(pageOverride) {
    var c = cfg();
    if (!c) return;
    var slug = c.slugFromPath(window.location.pathname);
    var pageCfg = pageOverride || (slug ? c.getBySlug(slug) : null);
    if (!pageCfg) return;

    if (pageCfg.title) document.title = pageCfg.title;
    if (pageCfg.description) {
      setTextMeta("description", pageCfg.description);
      var ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", pageCfg.description);
      var ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle && pageCfg.title) ogTitle.setAttribute("content", pageCfg.title);
    }
    if (pageCfg.keywords) ensureMetaKeywords(pageCfg.keywords);
    mountBlock(pageCfg, slug);
    document.body.setAttribute("data-landing-seo-injected", "1");
    injectSchema(pageCfg, slug);
  }

  function applyForService(service) {
    var c = cfg();
    if (!c || !service) return;
    apply(c.buildForService(service));
  }

  window.LANDING_SEO = { apply: apply, applyForService: applyForService };

  document.addEventListener("DOMContentLoaded", function () {
    apply();
  });
})();
