(function () {
  var TOKEN_KEY = "lo_token";
  var token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  if (window.LoCollaborator && window.LoCollaborator.refreshSession) {
    window.LoCollaborator.refreshSession();
  }

  var isAdmin = window.CrmAdminGuard && window.CrmAdminGuard.isSiteAdmin();
  var createPanel = document.getElementById("adminOnlyCreate");
  if (createPanel) createPanel.hidden = !isAdmin;

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function roleBadge(u) {
    if (u.role === "admin") return '<span class="crm-badge-admin">Administrateur</span>';
    return '<span class="crm-badge-collab">Collaborateur</span>';
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
        var canManage = res.canManage;
        document.getElementById("usersMount").innerHTML =
          "<table><thead><tr><th>Email</th><th>Nom</th><th>Type</th><th>Rôle CRM</th><th>Statut</th>" +
          (canManage ? "<th></th>" : "") +
          "</tr></thead><tbody>" +
          (res.users || [])
            .map(function (u) {
              var toggle =
                canManage && u.role !== "admin"
                  ? '<td><button type="button" class="btn btn-ghost btn-sm" data-toggle="' +
                    esc(u.id) +
                    '" data-st="' +
                    esc(u.status === "inactive" ? "active" : "inactive") +
                    '">' +
                    (u.status === "inactive" ? "Réactiver" : "Désactiver") +
                    "</button></td>"
                  : canManage
                    ? "<td></td>"
                    : "";
              return (
                "<tr><td>" +
                esc(u.email) +
                "</td><td>" +
                esc(u.full_name || "—") +
                "</td><td>" +
                roleBadge(u) +
                "</td><td>" +
                esc(u.crm_role || "—") +
                "</td><td>" +
                esc(u.status) +
                "</td>" +
                toggle +
                "</tr>"
              );
            })
            .join("") +
          "</tbody></table>";
        document.querySelectorAll("[data-toggle]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            fetch("/api/crm/users", {
              method: "PATCH",
              headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
              body: JSON.stringify({ id: btn.getAttribute("data-toggle"), status: btn.getAttribute("data-st") }),
            })
              .then(function (r) {
                return r.json();
              })
              .then(function (r) {
                if (r.ok) loadUsers();
                else alert(r.error || "Erreur");
              });
          });
        });
      });
  }

  var userForm = document.getElementById("userForm");
  if (userForm)
    userForm.onsubmit = function (e) {
      e.preventDefault();
      if (!isAdmin) return;
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
          document.getElementById("userMsg").textContent = res.ok
            ? "Collaborateur créé — communiquez email + mot de passe"
            : res.error || "Erreur";
          if (res.ok) {
            e.target.reset();
            loadUsers();
          }
        })
        .catch(function () {
          document.getElementById("userMsg").textContent = "Erreur réseau.";
        });
    };

  loadUsers();
})();
