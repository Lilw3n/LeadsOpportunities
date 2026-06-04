/**
 * Suivi blog → questionnaire (UTM internes + parcours)
 */
(function () {
  function fileFromPath() {
    var p = window.location.pathname || "";
    var parts = p.split("/");
    return parts[parts.length - 1] || "";
  }

  function bind() {
    var bridges = document.querySelectorAll(".article-bridge");
    if (!bridges.length) return;
    var articleFile = fileFromPath();
    bridges.forEach(function (bridge) {
      var need = bridge.getAttribute("data-need") || "";
      var species = bridge.getAttribute("data-species") || "";
      bridge.querySelectorAll("a[href]").forEach(function (a) {
        try {
          var url = new URL(a.getAttribute("href"), window.location.href);
          if (!url.searchParams.get("utm_source")) {
            url.searchParams.set("utm_source", "blog");
            url.searchParams.set("utm_medium", "article_bridge");
            url.searchParams.set("utm_campaign", need || "blog");
            if (articleFile) url.searchParams.set("utm_content", articleFile.replace(".html", ""));
            if (species) url.searchParams.set("utm_term", species);
            a.setAttribute("href", url.pathname + url.search + url.hash);
          }
        } catch (e) {}
        a.addEventListener("click", function () {
          try {
            localStorage.setItem("lo_blog_article", articleFile);
            if (need) localStorage.setItem("lo_blog_need", need);
          } catch (err) {}
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", bind);
})();
