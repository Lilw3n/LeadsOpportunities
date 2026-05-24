/**
 * Dashboard admin — API, leads, stats (Leads Opportunities)
 */
(function () {
  var TOKEN_KEY = "lo_token";
  var USER_KEY = "lo_user";

  window.Dashboard = {
    TOKEN_KEY: TOKEN_KEY,
    USER_KEY: USER_KEY,
    getToken: function () {
      return localStorage.getItem(TOKEN_KEY);
    },
    getUser: function () {
      try {
        return JSON.parse(localStorage.getItem(USER_KEY));
      } catch (e) {
        return null;
      }
    },
    clearAuth: function () {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
    authHeaders: function () {
      return {
        Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY),
        "Content-Type": "application/json",
      };
    },
    api: async function (path, options) {
      options = options || {};
      var res;
      try {
        res = await fetch(path, Object.assign({ headers: Dashboard.authHeaders() }, options));
      } catch (e) {
        return { ok: false, error: "Connexion impossible. Verifiez le reseau.", status: 0 };
      }
      var data = {};
      try {
        data = await res.json();
      } catch (e) {
        data = { error: "Reponse serveur invalide (" + res.status + ")" };
      }
      if (res.status === 401 || res.status === 403) {
        if (!options.noRedirect) {
          Dashboard.clearAuth();
          window.location.href = "./auth.html?next=" + encodeURIComponent("./dashboard.html");
        }
        return { ok: false, error: data.error || "Session expiree", status: res.status };
      }
      if (!res.ok) {
        return {
          ok: false,
          error: data.error || data.detail || "Erreur " + res.status,
          status: res.status,
        };
      }
      return Object.assign({ ok: true, status: res.status }, data);
    },
    showBanner: function (msg, type) {
      var el = document.getElementById("apiBanner");
      if (!el) return;
      el.hidden = false;
      el.textContent = msg;
      el.className = "api-banner api-banner--" + (type || "error");
    },
    hideBanner: function () {
      var el = document.getElementById("apiBanner");
      if (el) el.hidden = true;
    },
    setSyncStatus: function (text) {
      var el = document.getElementById("syncStatus");
      if (el) el.textContent = text;
    },
    relevanceLabel: function (r) {
      var map = {
        high: "Pertinent",
        medium: "A qualifier",
        low: "Faible",
        not_relevant: "Non pertinent",
      };
      return map[r] || r || "—";
    },
    isUnopened: function (l) {
      return !l.opened_at && !(l.payload && l.payload.openedAt);
    },
    isNewHighlight: function (l) {
      return (l.status || "new") === "new" && Dashboard.isUnopened(l);
    },
  };
})();
