/**
 * Ancien module auth localStorage — désactivé pour des raisons de sécurité.
 * Utilisez auth.html et le dashboard avec authentification serveur (JWT).
 */
(function () {
  if (window.location.pathname.indexOf("admin.html") !== -1) {
    window.location.replace("./dashboard.html");
  }
})();
