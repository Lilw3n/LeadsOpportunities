/**
 * Liens admin sur le site public (visible si role === admin)
 */
(function () {
  var TOKEN_KEY = "lo_token";
  var USER_KEY = "lo_user";

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch (e) {
      return null;
    }
  }

  function setVisible(show, user) {
    document.querySelectorAll("[data-admin-nav]").forEach(function (el) {
      el.hidden = !show;
    });
    var label = document.getElementById("adminNavUser");
    if (label && user) {
      label.textContent = user.fullName || user.email || "Admin";
    }
  }

  function init() {
    var token = localStorage.getItem(TOKEN_KEY);
    var user = getUser();
    if (!token || !user || user.role !== "admin") {
      setVisible(false);
      return;
    }
    setVisible(true, user);
    fetch("/api/auth/me", {
      headers: { Authorization: "Bearer " + token },
    })
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
