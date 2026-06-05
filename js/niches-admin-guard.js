/**
 * Garde /niches/ — hub stratégique réservé aux administrateurs.
 * Visiteurs → catalogue public. Compte non admin → catalogue. Sans session → auth.
 */
(function () {
  var TOKEN_KEY = "lo_token";
  var USER_KEY = "lo_user";
  var PUBLIC_CATALOG = "../assurances/";

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch (e) {
      return null;
    }
  }

  function isAdmin(user) {
    return (
      user &&
      (user.role === "admin" || user.crm_role === "admin" || user.crmRole === "admin")
    );
  }

  function reveal() {
    document.documentElement.classList.remove("niches-admin-pending");
  }

  function redirectPublic() {
    location.replace(PUBLIC_CATALOG);
  }

  function redirectAuth() {
    var returnTo = encodeURIComponent(location.pathname + location.search);
    location.replace("../auth.html?redirect=" + returnTo);
  }

  function verifyApi(token, onOk, onFail) {
    fetch("/api/auth/me", { headers: { Authorization: "Bearer " + token } })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (data.ok && data.user && isAdmin(data.user)) {
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          onOk(data.user);
        } else {
          onFail();
        }
      })
      .catch(onFail);
  }

  var token = localStorage.getItem(TOKEN_KEY);
  var user = getUser();

  if (!token) {
    redirectAuth();
    return;
  }

  if (!isAdmin(user)) {
    redirectPublic();
    return;
  }

  window.LoNichesGuard = { ok: true, user: user };
  reveal();

  verifyApi(token, reveal, function () {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    redirectAuth();
  });
})();
