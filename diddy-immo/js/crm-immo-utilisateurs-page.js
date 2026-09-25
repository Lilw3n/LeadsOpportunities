(function () {
  if (!localStorage.getItem("lo_token")) {
    location.href = "./crm.html";
    return;
  }

  var Users = window.ImmoMarcheUsers;
  var state = { users: [], stats: {}, canBulk: false, selected: {} };

  function token() {
    return localStorage.getItem("lo_token") || "";
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function $(id) {
    return document.getElementById(id);
  }
  function roleLabel(role) {
    return Users && Users.roleLabel ? Users.roleLabel(role) : role || "—";
  }
  function selectedList() {
    return state.users.filter(function (u) {
      return state.selected[u.id];
    });
  }
  function setStatus(el, text, kind) {
    el.hidden = !text;
    el.textContent = text || "";
    el.classList.remove("is-ok", "is-err");
    if (kind) el.classList.add(kind);
  }
  function updateSelCount() {
    $("imuSelCount").textContent = String(selectedList().length);
  }
  function renderStats(stats) {
    var items = [
      ["total", "Contacts"],
      ["email", "E-mails"],
      ["callable", "Tél."],
      ["acheteur", "Acquéreurs"],
      ["vendeur", "Vendeurs"],
      ["visiteur", "Visites"],
    ];
    $("imuStats").innerHTML = items
      .map(function (it) {
        return (
          '<div class="imu-stat"><strong>' +
          esc(stats[it[0]] || 0) +
          "</strong><span>" +
          esc(it[1]) +
          "</span></div>"
        );
      })
      .join("");
  }
  function renderTable() {
    var body = $("imuBody");
    if (!state.users.length) {
      body.innerHTML =
        '<tr><td colspan="5" style="padding:18px;color:var(--muted)">Aucun utilisateur pour ces filtres.</td></tr>';
      return;
    }
    body.innerHTML = state.users
      .map(function (u) {
        var roles = String(u.roles || "")
          .split(",")
          .filter(Boolean)
          .map(function (r) {
            return '<span class="imu-role">' + esc(roleLabel(r)) + "</span>";
          })
          .join(" ");
        var cities = (u.cities || []).slice(0, 3).join(", ");
        return (
          "<tr>" +
          '<td><input type="checkbox" data-imu-id="' +
          esc(u.id) +
          '"' +
          (state.selected[u.id] ? " checked" : "") +
          " /></td>" +
          "<td><strong>" +
          esc(u.name || "Sans nom") +
          "</strong>" +
          (cities ? '<div style="color:var(--muted);font-size:.8rem">' + esc(cities) + "</div>" : "") +
          "</td>" +
          "<td>" +
          roles +
          "</td>" +
          "<td>" +
          (u.email
            ? '<div><a href="mailto:' + esc(u.email) + '">' + esc(u.email) + "</a></div>"
            : "") +
          (u.phone
            ? '<div><a href="tel:' + esc(u.phone) + '">' + esc(u.phone_display || u.phone) + "</a></div>"
            : "") +
          "</td>" +
          '<td style="font-size:.8rem;color:var(--muted)">' +
          esc((u.sources || []).join(", ")) +
          (u.last_activity_at
            ? "<br>" + esc(new Date(u.last_activity_at).toLocaleDateString("fr-FR"))
            : "") +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function load() {
    var url =
      "/api/crm/immo-users-contact?q=" +
      encodeURIComponent($("imuQ").value.trim()) +
      "&role=" +
      encodeURIComponent($("imuRole").value) +
      "&channel=" +
      encodeURIComponent($("imuChannel").value);
    setStatus($("imuMeta"), "Chargement…");
    return fetch(url, { headers: { Authorization: "Bearer " + token() } })
      .then(function (r) {
        return r.json().then(function (data) {
          return { ok: r.ok, data: data };
        });
      })
      .then(function (res) {
        if (!res.ok || !res.data || res.data.ok === false) {
          throw new Error((res.data && res.data.error) || "Chargement impossible");
        }
        state.users = res.data.users || [];
        state.stats = res.data.stats || {};
        state.canBulk = !!res.data.canBulkContact;
        $("imuAdminGate").hidden = state.canBulk;
        $("imuSendSel").disabled = !state.canBulk;
        $("imuSendAll").disabled = !state.canBulk;
        renderStats(state.stats);
        renderTable();
        updateSelCount();
        setStatus(
          $("imuMeta"),
          state.users.length +
            " contact(s)" +
            (res.data.offline ? " — hors-ligne (pas de base)" : "")
        );
      })
      .catch(function (err) {
        setStatus($("imuMeta"), err.message || "Erreur", "is-err");
      });
  }

  function send(payload) {
    setStatus($("imuSendStatus"), "Envoi en cours…");
    return fetch("/api/crm/immo-users-contact", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(function (r) {
        return r.json().then(function (data) {
          return { ok: r.ok, data: data };
        });
      })
      .then(function (res) {
        if (!res.ok || !res.data || res.data.ok === false) {
          throw new Error((res.data && res.data.error) || "Envoi échoué");
        }
        setStatus(
          $("imuSendStatus"),
          "Envoyés : " + (res.data.sent || 0) + " · échecs : " + (res.data.failed || 0),
          res.data.failed ? "is-err" : "is-ok"
        );
      })
      .catch(function (err) {
        setStatus($("imuSendStatus"), err.message || "Erreur d’envoi", "is-err");
      });
  }

  $("imuBody").addEventListener("click", function (e) {
    var cb = e.target.closest("input[data-imu-id]");
    if (!cb) return;
    var id = cb.getAttribute("data-imu-id");
    if (cb.checked) state.selected[id] = true;
    else delete state.selected[id];
    updateSelCount();
  });

  $("imuCheckAll").addEventListener("change", function () {
    var on = $("imuCheckAll").checked;
    state.users.forEach(function (u) {
      if (on) state.selected[u.id] = true;
      else delete state.selected[u.id];
    });
    renderTable();
    updateSelCount();
  });

  $("imuSelectVisible").addEventListener("click", function () {
    state.users.forEach(function (u) {
      state.selected[u.id] = true;
    });
    $("imuCheckAll").checked = true;
    renderTable();
    updateSelCount();
  });

  $("imuClearSel").addEventListener("click", function () {
    state.selected = {};
    $("imuCheckAll").checked = false;
    renderTable();
    updateSelCount();
  });

  $("imuReload").addEventListener("click", load);
  ["imuQ", "imuRole", "imuChannel"].forEach(function (id) {
    $(id).addEventListener("change", load);
  });
  $("imuQ").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      load();
    }
  });

  $("imuExport").addEventListener("click", function () {
    if (!Users || !Users.toCsv) return;
    var blob = new Blob([Users.toCsv(state.users)], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "immo-utilisateurs.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  $("imuMailto").addEventListener("click", function () {
    var list = selectedList().length
      ? selectedList()
      : state.users.filter(function (u) {
          return u.emailable;
        });
    var href = Users.mailtoBcc(list, $("imuSubject").value, $("imuMessage").value);
    if (!href) {
      setStatus($("imuSendStatus"), "Aucun e-mail à ouvrir", "is-err");
      return;
    }
    location.href = href;
  });

  $("imuSendSel").addEventListener("click", function () {
    var list = selectedList().filter(function (u) {
      return u.emailable;
    });
    if (!list.length) {
      setStatus($("imuSendStatus"), "Sélectionne au moins un contact avec e-mail", "is-err");
      return;
    }
    if (!confirm("Envoyer l’e-mail à " + list.length + " contact(s) ?")) return;
    send({
      ids: list.map(function (u) {
        return u.id;
      }),
      subject: $("imuSubject").value,
      body: $("imuMessage").value,
    });
  });

  $("imuSendAll").addEventListener("click", function () {
    var n = state.users.filter(function (u) {
      return u.emailable;
    }).length;
    if (!n) {
      setStatus($("imuSendStatus"), "Aucun e-mail dans le filtre", "is-err");
      return;
    }
    if (!confirm("Envoyer à tout le filtre (" + n + ", max 40) ?")) return;
    send({
      all: true,
      confirm: $("imuConfirm").value,
      q: $("imuQ").value.trim(),
      role: $("imuRole").value,
      subject: $("imuSubject").value,
      body: $("imuMessage").value,
    });
  });

  load();
})();
