(function () {
  var TOKEN_KEY = "lo_token";

  function token() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function api(path, opts) {
    opts = opts || {};
    return fetch(path, {
      method: opts.method || "GET",
      headers: Object.assign(
        { "Content-Type": "application/json" },
        token() ? { Authorization: "Bearer " + token() } : {}
      ),
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    }).then(function (r) {
      return r.json().catch(function () {
        return { error: "Réponse invalide" };
      });
    });
  }

  function banner(cls, html) {
    var el = document.getElementById("tdBanner");
    if (!el) return;
    el.innerHTML = '<div class="td-banner ' + cls + '">' + html + "</div>";
  }

  function dueLabel(due) {
    if (!due) return "";
    return due.string || due.date || "";
  }

  function renderTasks(tasks) {
    var mount = document.getElementById("tdTasks");
    if (!tasks || !tasks.length) {
      mount.innerHTML = '<p class="td-empty">Aucune tâche aujourd’hui. Connectez Todoist ou créez une tâche test.</p>';
      return;
    }
    mount.innerHTML = tasks
      .map(function (t) {
        return (
          '<article class="td-task" data-id="' +
          esc(t.id) +
          '">' +
          '<div style="flex:1">' +
          "<h3>" +
          esc(t.content) +
          "</h3>" +
          '<p class="td-meta">' +
          esc(dueLabel(t.due) || "Sans date") +
          (t.url ? ' · <a href="' + esc(t.url) + '" target="_blank" rel="noopener">Ouvrir</a>' : "") +
          "</p></div>" +
          '<button type="button" class="btn btn-ghost btn-sm" data-close="' +
          esc(t.id) +
          '">Fait</button></article>'
        );
      })
      .join("");
    mount.querySelectorAll("[data-close]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-close");
        api("/api/crm/todoist", { method: "POST", body: { op: "close", taskId: id } }).then(function (res) {
          if (!res.ok) return alert(res.error || "Impossible de cocher");
          load();
        });
      });
    });
  }

  function renderStatus(st) {
    var mount = document.getElementById("tdStatus");
    var setup = document.getElementById("tdSetup");
    var connect = document.getElementById("btnConnect");
    if (connect) {
      connect.style.display = st.oauthReady ? "" : st.connected ? "" : "";
      connect.textContent = st.connected ? "Reconnecter Todoist" : "Connecter Todoist";
    }
    var account = st.account && (st.account.name || st.account.email);
    if (st.connected) {
      mount.innerHTML =
        "<p><strong>Connecté</strong> (" +
        esc(st.source || "oauth") +
        ")" +
        (account ? " — " + esc(account) : "") +
        ".</p>";
    } else {
      mount.innerHTML = "<p>Pas encore connecté.</p>";
    }
    setup.innerHTML =
      '<p style="margin-top:16px;font-size:.85rem;color:#64748b">Deux façons :</p>' +
      "<ol>" +
      "<li><strong>Rapide</strong> — Todoist → Paramètres → Intégrations → Développeur → copier le jeton API → Vercel <code>TODOIST_API_TOKEN</code> → Redeploy.</li>" +
      "<li><strong>OAuth</strong> — <a href=\"https://developer.todoist.com/appconsole.html\" target=\"_blank\" rel=\"noopener\">Créer une app Todoist</a>, redirect <code>" +
      esc(st.redirectUri || "https://www.leadsopportunities.fr/api/auth/todoist-callback") +
      "</code>, puis <code>TODOIST_CLIENT_ID</code> / <code>TODOIST_CLIENT_SECRET</code> sur Vercel. Bouton Connecter ci-dessus.</li>" +
      "</ol>" +
      '<p style="font-size:.82rem"><a href="./docs/TODOIST.md">Documentation</a></p>';
  }

  function renderProjects(st, projects) {
    var sel = document.getElementById("tdProject");
    if (!sel) return;
    var list = projects || [];
    sel.innerHTML =
      '<option value="">Inbox / défaut</option>' +
      list
        .map(function (p) {
          var selAttr = String(p.id) === String(st.projectId || "") ? " selected" : "";
          return '<option value="' + esc(p.id) + '"' + selAttr + ">" + esc(p.name) + "</option>";
        })
        .join("");
  }

  function load() {
    var params = new URLSearchParams(location.search);
    if (params.get("todoist") === "connected") banner("td-ok", "Todoist connecté.");
    if (params.get("todoist_error")) banner("td-err", esc(params.get("todoist_error")));

    Promise.all([
      api("/api/crm/todoist?op=status"),
      api("/api/crm/todoist?op=tasks"),
      api("/api/crm/todoist?op=projects"),
    ]).then(function (arr) {
      var st = arr[0] || {};
      var tasksRes = arr[1] || {};
      var projRes = arr[2] || {};
      if (st.error && !st.connected) banner("td-warn", esc(st.error || tasksRes.error || "Todoist non connecté"));
      renderStatus(st);
      renderProjects(st, projRes.projects);
      if (tasksRes.error && !tasksRes.tasks) {
        document.getElementById("tdTasks").innerHTML =
          '<p class="td-empty">' + esc(tasksRes.error) + "</p>";
        return;
      }
      renderTasks(tasksRes.tasks || []);
    });
  }

  document.getElementById("btnRefresh").addEventListener("click", load);
  document.getElementById("btnConnect").addEventListener("click", function () {
    api("/api/crm/todoist?op=connect&returnTo=/crm-todoist.html").then(function (res) {
      if (res.url) {
        location.href = res.url;
        return;
      }
      alert(res.error || res.hint || "Ajoutez TODOIST_CLIENT_ID / SECRET ou TODOIST_API_TOKEN sur Vercel.");
    });
  });
  document.getElementById("btnTest").addEventListener("click", function () {
    api("/api/crm/todoist", { method: "POST", body: { op: "test" } }).then(function (res) {
      if (!res.ok) return alert(res.error || res.hint || "Échec tâche test");
      banner("td-ok", "Tâche test créée dans Todoist.");
      load();
    });
  });
  var btnSyncEvents = document.getElementById("btnSyncEvents");
  if (btnSyncEvents) {
    btnSyncEvents.addEventListener("click", function () {
      btnSyncEvents.disabled = true;
      api("/api/crm/todoist", { method: "POST", body: { op: "sync-events" } }).then(function (res) {
        btnSyncEvents.disabled = false;
        if (!res.ok) return alert(res.error || res.hint || "Échec sync événements");
        banner(
          "td-ok",
          (res.pushed || 0) +
            " événement(s) envoyé(s) vers Todoist" +
            (res.skipped ? " · " + res.skipped + " déjà liés" : "") +
            (res.errors ? " · " + res.errors + " erreur(s)" : "") +
            "."
        );
        load();
      });
    });
  }
  document.getElementById("btnSaveProject").addEventListener("click", function () {
    var id = document.getElementById("tdProject").value || null;
    api("/api/crm/todoist", { method: "POST", body: { op: "project", projectId: id } }).then(function (res) {
      if (!res.ok) return alert(res.error || "Impossible d’enregistrer le projet (OAuth requis)");
      banner("td-ok", "Projet enregistré.");
    });
  });
  document.getElementById("btnDisconnect").addEventListener("click", function () {
    if (!confirm("Déconnecter Todoist de ce compte CRM ?")) return;
    api("/api/crm/todoist", { method: "POST", body: { op: "disconnect" } }).then(function () {
      banner("td-ok", "Compte déconnecté (le jeton Vercel reste actif s’il est défini).");
      load();
    });
  });

  load();
})();
