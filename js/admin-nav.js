/**
 * Menu admin partagé — injecté sur toutes les pages data-admin-nav-page
 */
(function () {
  var TOKEN_KEY = "lo_token";
  var USER_KEY = "lo_user";

  var LINKS = [
    { href: "./index.html", label: "Accueil", id: "home" },
    { href: "./dashboard.html", label: "Dashboard", id: "dashboard" },
    { href: "./dashboard.html?section=leads", label: "Leads", id: "leads" },
    { href: "./crm-form-leads.html", label: "Leads formulaires", id: "crm-form-leads" },
    { href: "./crm-acquisition.html", label: "Devis remplis", id: "crm-acquisition" },
    { href: "./dashboard.html?section=partners", label: "Partenaires", id: "partners" },
    { href: "./crm.html", label: "CRM", id: "crm" },
    { href: "./blog-questionnaires.html", label: "Blog → devis", id: "blog-devis" },
    { href: "./niches/", label: "Niches SEO", id: "niches" },
    { href: "./auth.html", label: "Compte", id: "auth" },
  ];

  var MOBILE_EXTRA = [
    { href: "./landings/vtc.html", label: "Landing VTC", external: true },
    { href: "./landings/sante.html", label: "Landing Sante", external: true },
    { href: "./landings/credit-immo.html", label: "Landing Credit", external: true },
  ];

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch (e) {
      return null;
    }
  }

  function currentId() {
    var pathname = location.pathname || "";
    if (pathname.indexOf("/niches") >= 0) return "niches";
    var path = pathname.split("/").pop() || "index.html";
    var q = location.search || "";
    if (path === "dashboard.html") {
      if (q.indexOf("section=leads") >= 0) return "leads";
      if (q.indexOf("section=partners") >= 0) return "partners";
      return "dashboard";
    }
    if (path === "index.html" || path === "") return "home";
    if (path === "auth.html") return "auth";
    if (path === "crm-form-leads.html") return "crm-form-leads";
    if (path === "crm-acquisition.html") return "crm-acquisition";
    if (path === "crm.html" || path.indexOf("crm") === 0) return "crm";
    if (path === "espace-client.html") return "home";
    if (path === "admin.html") return "dashboard";
    if (path === "blog-questionnaires.html") return "blog-devis";
    if (path === "niches" || path.indexOf("niches") === 0) return "niches";
    return path.replace(".html", "");
  }

  function linkClass(id) {
    return currentId() === id ? " is-active" : "";
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function topbarHtml(userLabel) {
    var h = '<span class="admin-nav-label" id="adminNavUser">' + esc(userLabel) + "</span>";
    LINKS.forEach(function (l) {
      h +=
        '<a href="' +
        esc(l.href) +
        '" class="admin-nav-link' +
        linkClass(l.id) +
        '">' +
        esc(l.label) +
        "</a>";
    });
    return h;
  }

  function mobileHtml() {
    var h = '<p class="mobile-admin-nav-title">Administration</p>';
    LINKS.forEach(function (l) {
      h +=
        '<a href="' +
        esc(l.href) +
        '" class="' +
        linkClass(l.id).trim() +
        '">' +
        esc(l.label) +
        "</a>";
    });
    MOBILE_EXTRA.forEach(function (l) {
      var ext = l.external ? ' target="_blank" rel="noopener"' : "";
      h += '<a href="' + esc(l.href) + '"' + ext + ">" + esc(l.label) + "</a>";
    });
    return h;
  }

  function sidebarHtml(userLabel) {
    var h =
      '<div class="admin-nav-sidebar-title">Administration</div>' +
      '<div class="admin-nav-user" id="adminNavUser">' +
      esc(userLabel) +
      "</div>";
    LINKS.forEach(function (l) {
      h +=
        '<a href="' +
        esc(l.href) +
        '" class="' +
        linkClass(l.id).trim() +
        '">' +
        esc(l.label) +
        "</a>";
    });
    return h;
  }

  function footerHtml() {
    var h = "<h4>Administration</h4>";
    LINKS.forEach(function (l) {
      h +=
        '<a href="' +
        esc(l.href) +
        '" class="' +
        linkClass(l.id).trim() +
        '">' +
        esc(l.label) +
        "</a>";
    });
    return h;
  }

  function crmHtml() {
    var h = "";
    LINKS.forEach(function (l) {
      h +=
        '<a href="' +
        esc(l.href) +
        '" class="' +
        linkClass(l.id).trim() +
        '">' +
        esc(l.label) +
        "</a>";
    });
    return h;
  }

  function mount() {
    var userLabel = "Admin";
    if (document.body.classList.contains("crm-body") || document.body.classList.contains("crm-subpage-body")) {
      return;
    }

    var topNav = document.querySelector(".topbar nav");
    if (topNav && !topNav.querySelector(".admin-nav")) {
      var top = document.createElement("div");
      top.className = "admin-nav";
      top.setAttribute("data-admin-nav", "");
      top.hidden = true;
      top.innerHTML = topbarHtml(userLabel);
      var cta = topNav.querySelector(".btn-nav, .btn-primary, .cta-link");
      if (cta) topNav.insertBefore(top, cta);
      else topNav.appendChild(top);
    }

    var mobile = document.getElementById("mobileMenu");
    if (mobile && !mobile.querySelector(".mobile-admin-nav")) {
      var mob = document.createElement("div");
      mob.className = "mobile-admin-nav";
      mob.setAttribute("data-admin-nav", "");
      mob.hidden = true;
      mob.innerHTML = mobileHtml();
      var firstBtn = mobile.querySelector(".btn, .btn-primary");
      if (firstBtn) mobile.insertBefore(mob, firstBtn);
      else mobile.appendChild(mob);
    }

    var sideNav = document.querySelector(".sidebar-nav");
    if (sideNav && !sideNav.querySelector(".admin-nav-sidebar")) {
      var side = document.createElement("div");
      side.className = "admin-nav-sidebar";
      side.setAttribute("data-admin-nav", "");
      side.hidden = true;
      side.innerHTML = sidebarHtml(userLabel);
      sideNav.insertBefore(side, sideNav.firstChild);
    }

    var footerGrid = document.querySelector(".footer-grid");
    if (footerGrid && !footerGrid.querySelector(".footer-col-admin")) {
      var foot = document.createElement("div");
      foot.className = "footer-col footer-col-admin";
      foot.setAttribute("data-admin-nav", "");
      foot.hidden = true;
      foot.innerHTML = footerHtml();
      footerGrid.appendChild(foot);
    }

    var crmLinks = document.querySelector(".crm-links");
    if (crmLinks && !crmLinks.querySelector(".crm-admin-nav")) {
      var crm = document.createElement("div");
      crm.className = "crm-admin-nav";
      crm.setAttribute("data-admin-nav", "");
      crm.hidden = true;
      crm.innerHTML = crmHtml();
      crmLinks.appendChild(crm);
    }

    if (!document.querySelector("[data-admin-nav]")) {
      mountFloating(userLabel);
    }
  }

  function mountFloating(userLabel) {
    if (document.querySelector(".admin-nav-floating")) return;
    var bar = document.createElement("div");
    bar.className = "admin-nav-floating";
    bar.setAttribute("data-admin-nav", "");
    bar.hidden = true;
    var h =
      '<span class="admin-nav-label" id="adminNavUser">' +
      esc(userLabel) +
      "</span>";
    LINKS.forEach(function (l) {
      h +=
        '<a href="' +
        esc(l.href) +
        '" class="' +
        linkClass(l.id).trim() +
        '">' +
        esc(l.label) +
        "</a>";
    });
    bar.innerHTML = h;
    document.body.appendChild(bar);
    document.body.classList.add("admin-nav-floating-active");
  }

  function setVisible(show, user) {
    var label = (user && (user.fullName || user.email)) || "Admin";
    document.querySelectorAll("[data-admin-nav]").forEach(function (el) {
      el.hidden = !show;
    });
    document.body.classList.toggle(
      "admin-nav-floating-active",
      show && !!document.querySelector(".admin-nav-floating")
    );
    document.querySelectorAll("#adminNavUser").forEach(function (el) {
      el.textContent = label;
    });
  }

  function init() {
    mount();
    var token = localStorage.getItem(TOKEN_KEY);
    var user = getUser();
    if (!token || !user || user.role !== "admin") {
      setVisible(false);
      return;
    }
    setVisible(true, user);
    fetch("/api/auth/me", { headers: { Authorization: "Bearer " + token } })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (data.ok && data.user && data.user.role === "admin") {
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          setVisible(true, data.user);
        } else {
          setVisible(false);
        }
      })
      .catch(function () {});
  }

  window.LoAdminNav = { refresh: init };
  document.addEventListener("lo:admin-nav-refresh", init);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
