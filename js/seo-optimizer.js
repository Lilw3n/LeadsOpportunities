/**
 * SEO meta dynamique — inspire SEOOptimizer.tsx multisite
 */
window.SeoOptimizer = {
  apply: function (opts) {
    opts = opts || {};
    if (opts.title) document.title = opts.title;
    this.setMeta("description", opts.description || "");
    this.setMeta("og:title", opts.title || document.title, "property");
    this.setMeta("og:description", opts.description || "", "property");
    this.setMeta("og:type", "website", "property");
    this.setMeta("twitter:card", "summary_large_image", "name");
    this.setMeta("twitter:title", opts.title || document.title, "name");
    this.setMeta("twitter:description", opts.description || "", "name");
    if (opts.robots) this.setMeta("robots", opts.robots);
    if (opts.canonical) {
      var link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = opts.canonical;
    }
  },

  setMeta: function (name, content, attr) {
    attr = attr || "name";
    if (!content) return;
    var sel = "meta[" + attr + '="' + name + '"]';
    var el = document.querySelector(sel);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  },

  jsonLd: function (data) {
    var script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  },
};
