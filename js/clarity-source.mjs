import Clarity from "@microsoft/clarity";

function getProjectId() {
  var cfg = typeof window !== "undefined" && window.GOOGLE_TRACKING ? window.GOOGLE_TRACKING : {};
  var id = cfg.clarityProjectId || "x7yqp46fj9";
  if (!id || String(id).indexOf("XXXX") !== -1) return null;
  return String(id);
}

function articleSlug() {
  var m = location.pathname.match(/\/blog\/([^/]+?)(?:\.html)?\/?$/);
  if (m) return m[1];
  if (location.pathname.indexOf("/blog") !== -1 && location.pathname.indexOf(".html") === -1) {
    return "index";
  }
  return "";
}

var projectId = getProjectId();
if (projectId) {
  Clarity.init(projectId);
  window.loClarity = Clarity;

  if (location.pathname.indexOf("/blog") !== -1) {
    var slug = articleSlug();
    Clarity.setTag("site_section", "blog");
    if (slug) Clarity.setTag("article_slug", slug);
    var body = document.body;
    if (body) {
      var section = body.getAttribute("data-blog-section");
      var tag = body.getAttribute("data-blog-tag");
      var pageType = body.getAttribute("data-blog-page");
      if (section) Clarity.setTag("article_niche", section);
      if (tag) Clarity.setTag("article_tag", tag);
      if (pageType) Clarity.setTag("blog_page_type", pageType);
    }
  }
}
