/**
 * Navigation sociale flottante — inspire SocialNavigationWrapper + SocialNavigationMenu multisite.
 */
window.CrmSocialNavigation = {
  init: function () {
    if (document.getElementById("crmSocialFab")) return;
    var fab = document.createElement("button");
    fab.id = "crmSocialFab";
    fab.className = "crm-social-fab";
    fab.type = "button";
    fab.title = "Hub social";
    fab.textContent = "🌐";
    fab.onclick = function () {
      window.CrmSocialNavigation.toggleMenu(true);
    };
    document.body.appendChild(fab);

    var menu = document.createElement("div");
    menu.id = "crmSocialMenu";
    menu.className = "crm-social-menu hidden";
    menu.innerHTML =
      '<div class="crm-social-menu-inner panel">' +
      '<div class="crm-social-menu-head"><strong>Hub social</strong><button type="button" class="btn btn-ghost btn-sm" id="crmSocialClose">×</button></div>' +
      '<a href="./external/social/hub.html">Hub principal</a>' +
      '<a href="./external/social/communities.html">Communautés</a>' +
      '<a href="./external/social/live.html">Live streaming</a>' +
      '<a href="./external/social/marketplace.html">Marketplace</a>' +
      '<a href="./external/social/agency.html">Agence créateurs</a>' +
      '<a href="./external/index.html">Portail client</a>' +
      "</div>";
    document.body.appendChild(menu);
    document.getElementById("crmSocialClose").onclick = function () {
      window.CrmSocialNavigation.toggleMenu(false);
    };
    menu.onclick = function (e) {
      if (e.target === menu) window.CrmSocialNavigation.toggleMenu(false);
    };
  },

  toggleMenu: function (open) {
    var m = document.getElementById("crmSocialMenu");
    if (!m) return;
    m.classList.toggle("hidden", !open);
  },
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem("lo_token")) window.CrmSocialNavigation.init();
  });
} else if (localStorage.getItem("lo_token")) {
  window.CrmSocialNavigation.init();
}
