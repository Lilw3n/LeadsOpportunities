(function () {
  var TOKEN_KEY = "lo_token";
  var token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function loadUsers() {
    fetch("/api/crm/users", { headers: { Authorization: "Bearer " + token } })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok) {
          document.getElementById("usersMount").innerHTML = "<p>" + esc(res.error) + "</p>";
          return;
        }
        document.getElementById("usersMount").innerHTML =
          "<table><thead><tr><th>Email</th><th>Nom</th><th>Rôle CRM</th><th>Statut</th></tr></thead><tbody>" +
          (res.users || [])
            .map(function (u) {
              return (
                "<tr><td>" +
                esc(u.email) +
                "</td><td>" +
                esc(u.full_name || "—") +
                "</td><td>" +
                esc(u.crm_role || u.role) +
                "</td><td>" +
                esc(u.status) +
                "</td></tr>"
              );
            })
            .join("") +
          "</tbody></table>";
      });
  }

  document.getElementById("userForm").onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    document.getElementById("userMsg").textContent = "Création…";
    fetch("/api/crm/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({
        email: fd.get("email"),
        password: fd.get("password"),
        fullName: fd.get("fullName"),
        crmRole: fd.get("crmRole"),
      }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        document.getElementById("userMsg").textContent = res.ok ? "Compte créé" : res.error || "Erreur";
        if (res.ok) {
          e.target.reset();
          loadUsers();
        }
      });
  };

  loadUsers();
})();
