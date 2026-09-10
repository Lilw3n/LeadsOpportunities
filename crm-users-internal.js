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

  var kindEl = document.getElementById("accountKind");
  var roleWrap = document.getElementById("crmRoleWrap");
  if (kindEl && roleWrap) {
    function syncKind() {
      roleWrap.style.display = kindEl.value === "siteAdmin" ? "none" : "block";
    }
    kindEl.addEventListener("change", syncKind);
    syncKind();
  }

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
        var mp = document.getElementById("matterportEmailLine");
        if (mp) {
          mp.innerHTML =
            "Compte Matterport / Google recommandé : <strong>" +
            esc(res.matterportAdminEmail || "wendy.buchet.pro@gmail.com") +
            "</strong>" +
            (res.adminEmails && res.adminEmails.length
              ? " · Admins auto (ADMIN_EMAILS) : " + esc(res.adminEmails.join(", "))
              : "");
        }
        var canManage = res.canManage;
        document.getElementById("usersMount").innerHTML =
          "<table><thead><tr><th>Email</th><th>Nom</th><th>Type</th><th>Rôle CRM</th><th>Statut</th>" +
          (canManage ? "<th></th>" : "") +
          "</tr></thead><tbody>" +
          (res.users || [])
            .map(function (u) {
              var actions = "";
              if (canManage) {
                if (u.role !== "admin") {
                  actions =
                    '<td style="white-space:nowrap">' +
                    '<button type="button" class="btn btn-ghost btn-sm" data-promote="' +
                    esc(u.id) +
                    '">Passer co-admin</button> ' +
                    '<button type="button" class="btn btn-ghost btn-sm" data-toggle="' +
                    esc(u.id) +
                    '" data-st="' +
                    esc(u.status === "inactive" ? "active" : "inactive") +
                    '">' +
                    (u.status === "inactive" ? "Réactiver" : "Désactiver") +
                    "</button></td>";
                } else {
                  actions = "<td></td>";
                }
              }
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
                actions +
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
        document.querySelectorAll("[data-promote]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            if (!confirm("Promouvoir ce compte en co-administrateur du CRM ?")) return;
            fetch("/api/crm/users", {
              method: "PATCH",
              headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
              body: JSON.stringify({ id: btn.getAttribute("data-promote"), promoteToSiteAdmin: true }),
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
      var asAdmin = fd.get("accountKind") === "siteAdmin";
      document.getElementById("userMsg").textContent = "Création…";
      fetch("/api/crm/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({
          email: fd.get("email"),
          password: fd.get("password"),
          fullName: fd.get("fullName"),
          crmRole: asAdmin ? "admin" : fd.get("crmRole"),
          siteAdmin: asAdmin,
        }),
      })
        .then(function (r) {
          return r.json();
        })
        .then(function (res) {
          document.getElementById("userMsg").textContent = res.ok
            ? asAdmin
              ? "Co-admin créé — connexion possible aussi via Google avec cet e-mail"
              : "Collaborateur créé — communiquez email + mot de passe"
            : res.error || "Erreur";
          if (res.ok) {
            e.target.reset();
            if (kindEl) {
              kindEl.value = "collaborator";
              kindEl.dispatchEvent(new Event("change"));
            }
            loadUsers();
          }
        })
        .catch(function () {
          document.getElementById("userMsg").textContent = "Erreur réseau.";
        });
    };

  loadUsers();
})();
