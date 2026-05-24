(function () {
  var TOKEN_KEY = "lo_token";
  var SIM_KEY = "crm_simulate_contact";

  function token() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function api(path) {
    return fetch(path, {
      headers: token() ? { Authorization: "Bearer " + token() } : {},
    }).then(function (r) {
      return r.json();
    });
  }

  var allContacts = [];

  function render(list) {
    allContacts = list;
    var el = document.getElementById("simList");
    var kpi = document.getElementById("simKpis");
    if (kpi) {
      kpi.innerHTML =
        '<div class="kpi-card panel"><div class="kpi-label">Contacts</div><div class="kpi-value">' +
        list.length +
        '</div></div><div class="kpi-card panel"><div class="kpi-label">Mode</div><div class="kpi-value" style="font-size:1rem">Vue client</div></div>';
    }
    if (!list.length) {
      el.innerHTML = "<p>Aucun contact</p>";
      return;
    }
    el.innerHTML = list
      .map(function (c) {
        var name = ((c.first_name || "") + " " + (c.last_name || "")).trim() || c.email;
        return (
          '<div class="sim-row-wrap" style="display:flex;gap:8px;align-items:stretch;border-bottom:1px solid var(--line);padding:8px 0">' +
          '<button type="button" class="sim-row" data-id="' +
          esc(c.id) +
          '" style="flex:1;text-align:left;padding:12px;border:1px solid var(--line);border-radius:10px;background:#fff;cursor:pointer">' +
          "<strong>" +
          esc(name) +
          "</strong><br><small>" +
          esc(c.email || c.phone || "") +
          "</small></button>" +
          '<button type="button" class="btn btn-ghost btn-sm btn-portal" data-email="' +
          esc(c.email || "") +
          '" data-id="' +
          esc(c.id) +
          '" style="align-self:center">🌐 Portail</button></div>'
        );
      })
      .join("");

    el.querySelectorAll(".sim-row").forEach(function (btn) {
      btn.onclick = function () {
        openContact(btn.getAttribute("data-id"), false);
      };
    });
    el.querySelectorAll(".btn-portal").forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        openContact(btn.getAttribute("data-id"), true);
      };
    });
  }

  function openContact(id, asPortal) {
    var c = allContacts.find(function (x) {
      return x.id === id;
    });
    if (!c) return;
    localStorage.setItem(
      SIM_KEY,
      JSON.stringify({
        id: id,
        firstName: c.first_name,
        lastName: c.last_name,
        email: c.email,
      })
    );
    if (asPortal && c.email) {
      localStorage.setItem("lo_ext_token", "sim_" + Date.now());
      localStorage.setItem("lo_client_email", c.email);
      localStorage.setItem("lo_ext_simulation", "1");
      window.open("./external/dashboard.html", "_blank");
      return;
    }
    location.href = "./crm-contact.html?id=" + encodeURIComponent(id) + "&simulate=1";
  }

  var timer;
  function load(q) {
    var url = "/api/crm/contacts?limit=80";
    if (q && q.length >= 2) url += "&search=" + encodeURIComponent(q);
    api(url).then(function (res) {
      if (res.ok) render(res.contacts || []);
    });
  }

  if (!token()) location.href = "./crm.html";
  load("");
  document.getElementById("simSearch").oninput = function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      load(document.getElementById("simSearch").value.trim());
    }, 300);
  };
})();
