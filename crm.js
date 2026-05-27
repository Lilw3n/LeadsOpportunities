(function () {
  var TOKEN_KEY = "lo_token";
  var USER_KEY = "lo_user";
  var state = {
    user: null,
    section: "overview",
    contactType: "",
    selectedContactId: null,
    lastContacts: [],
  };

  function token() {
    return localStorage.getItem(TOKEN_KEY);
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
        return { error: "Reponse invalide" };
      });
    });
  }

  function labelType(t) {
    if (t === "client") return "Client";
    if (t === "apporteur") return "Apporteur";
    return "Prospect";
  }

  function badgeClass(t) {
    if (t === "client") return "badge-client";
    if (t === "apporteur") return "badge-apporteur";
    return "badge-prospect";
  }

  function esc(s) {
    if (!s) return "";
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function showAuth() {
    document.getElementById("crmApp").classList.add("hidden");
    document.getElementById("crmAuth").classList.remove("hidden");
  }

  function showApp() {
    document.getElementById("crmAuth").classList.add("hidden");
    document.getElementById("crmApp").classList.remove("hidden");
    mountSidebar();
    window.dispatchEvent(new CustomEvent("lo:crm-app-visible"));
    var name = state.user.fullName || state.user.email;
    document.getElementById("crmUserName").textContent = name;
    document.getElementById("crmUserRole").textContent =
      (state.user.crmRole || state.user.role || "").toUpperCase();
    var av = document.getElementById("crmUserAvatar");
    if (av) av.textContent = (name.charAt(0) || "U").toUpperCase();
  }

  function mountSidebar() {
    var nav = document.getElementById("crmNavMount");
    if (nav && window.CrmSidebar) {
      window.CrmSidebar.mount(nav, { activeSection: state.section });
      if (window.CrmNavUi) window.CrmNavUi.init(nav);
    }
  }

  function setSection(section) {
    state.section = section;
    document.querySelectorAll(".crm-nav-section").forEach(function (a) {
      var id = ((a.getAttribute("href") || "").split("#")[1] || "");
      a.classList.toggle("active", id === section);
    });
    if (location.hash !== "#" + section) {
      history.replaceState(null, "", "./crm.html#" + section);
    }
    document.querySelectorAll("[data-crm-panel]").forEach(function (p) {
      p.classList.toggle("hidden", p.dataset.crmPanel !== section);
    });
    var titles = {
      overview: ["Tableau de bord CRM", "Pilotage, priorités et modules métier"],
      contacts: ["Contacts", "Prospects, clients, apporteurs et dossiers liés"],
      leads: ["Leads web", "Demandes issues du site et passerelle vers l'acquisition"],
      team: ["Équipe", "Staff, commerciaux, apporteurs et accès CRM"],
    };
    var t = titles[section] || titles.overview;
    document.getElementById("crmTitle").textContent = t[0];
    document.getElementById("crmSubtitle").textContent = t[1];
    if (section === "overview") loadOverview();
    if (section === "contacts") loadContacts();
    if (section === "leads") loadLeads();
    if (section === "team") loadTeam();
  }

  function loadOverview() {
    api("/api/crm/overview").then(function (data) {
      var el = document.getElementById("crmStats");
      if (!data.ok) {
        el.innerHTML =
          '<p class="activity">Migration CRM requise : executez database/crm.sql sur Neon. ' +
          esc(data.error || "") +
          "</p>";
        return;
      }
      el.innerHTML =
        '<div class="stat"><strong>' +
        (data.quotesOpen != null ? data.quotesOpen : "—") +
        '</strong><span>Devis</span></div>' +
        '<div class="stat"><strong>' +
        (data.contractsSigned != null ? data.contractsSigned : "—") +
        '</strong><span>Contrats signés</span></div>' +
        '<div class="stat"><strong>' +
        (data.claimsActive != null ? data.claimsActive : "—") +
        '</strong><span>Sinistres actifs</span></div>' +
        '<div class="stat"><strong>' +
        (data.newClients != null ? data.newClients : "—") +
        '</strong><span>Nouveaux clients</span></div>' +
        '<div class="stat"><strong>' +
        data.contactsTotal +
        '</strong><span>Contacts total</span></div>' +
        '<div class="stat"><strong>' +
        data.leadsWeek +
        '</strong><span>Leads 7 jours</span></div>';
      var quick = document.getElementById("crmQuickNav");
      if (quick) quick.classList.remove("hidden");
      loadAlerts();
      loadAiSuggestions();
    });
  }

  function loadAiSuggestions() {
    var box = document.getElementById("crmAiBox");
    if (!box || !window.CrmAiSuggestions) return;
    window.CrmAiSuggestions.load(token(), esc).then(function (html) {
      box.innerHTML = html;
    });
  }

  var lastAlerts = [];

  function loadAlerts() {
    var box = document.getElementById("crmAlertsBox");
    if (!box) return;
    api("/api/crm/alerts").then(function (data) {
      if (!data.ok) {
        box.innerHTML =
          '<p class="alerts-empty">' + esc(data.error || "Alertes indisponibles") + "</p>";
        return;
      }
      lastAlerts = data.alerts || [];
      paintAlerts();
    });
  }

  function paintAlerts() {
    var box = document.getElementById("crmAlertsBox");
    if (!box) return;
    var q = "";
    var searchEl = document.getElementById("crmAlertSearch");
    if (searchEl) q = searchEl.value.trim().toLowerCase();
    var list = lastAlerts;
    if (q) {
      list = lastAlerts.filter(function (a) {
        return (
          String(a.title || "").toLowerCase().indexOf(q) >= 0 ||
          String(a.message || "").toLowerCase().indexOf(q) >= 0
        );
      });
    }
    if (window.CrmAlertsPanel) {
      box.innerHTML = window.CrmAlertsPanel.render(list, esc, { variant: "compact" });
    } else {
      box.innerHTML = "<p>" + list.length + " alerte(s)</p>";
    }
  }

  var alertSearchEl = document.getElementById("crmAlertSearch");
  if (alertSearchEl) alertSearchEl.oninput = paintAlerts;

  function loadContacts() {
    var params = [];
    if (state.contactType) params.push("type=" + encodeURIComponent(state.contactType));
    var searchEl = document.getElementById("contactSearch");
    if (searchEl && searchEl.value.trim().length >= 2) {
      params.push("search=" + encodeURIComponent(searchEl.value.trim()));
    }
    var q = params.length ? "?" + params.join("&") : "";
    api("/api/crm/contacts" + q).then(function (data) {
      var tbody = document.getElementById("contactsTable");
      if (!data.ok || !data.contacts) {
        tbody.innerHTML =
          '<tr><td colspan="6">' + esc(data.error || "Erreur chargement") + "</td></tr>";
        return;
      }
      state.lastContacts = data.contacts || [];
      if (!data.contacts.length) {
        tbody.innerHTML = '<tr><td colspan="6">Aucun contact</td></tr>';
        return;
      }
      tbody.innerHTML = data.contacts
        .map(function (c) {
          var name =
            (c.first_name || "") + " " + (c.last_name || "") || c.email || "—";
          return (
            "<tr data-id=\"" +
            esc(c.id) +
            "\" style=\"cursor:pointer\">" +
            "<td><span class=\"badge " +
            badgeClass(c.contact_type) +
            "\">" +
            labelType(c.contact_type) +
            "</span></td>" +
            "<td>" +
            esc(name.trim()) +
            "</td>" +
            "<td>" +
            esc(c.email || "—") +
            "</td>" +
            "<td>" +
            esc(c.phone || "—") +
            "</td>" +
            "<td>" +
            esc(c.company || "—") +
            "</td>" +
            "<td>" +
            esc(c.status || "") +
            "</td></tr>"
          );
        })
        .join("");
      tbody.querySelectorAll("tr[data-id]").forEach(function (row) {
        row.addEventListener("click", function () {
          openContact(row.getAttribute("data-id"));
        });
      });
    });
  }

  function openContact(id) {
    window.location.href = "./crm-contact.html?id=" + encodeURIComponent(id);
  }

  function loadLeads() {
    api("/api/dashboard/leads?limit=30").then(function (data) {
      var tbody = document.getElementById("leadsTable");
      if (!data.ok || !data.leads) {
        tbody.innerHTML =
          '<tr><td colspan="6">' +
          esc(data.error || "Acces leads refuse ou erreur") +
          ' — <a href="./auth.html">Connexion</a></td></tr>';
        return;
      }
      tbody.innerHTML = data.leads
        .map(function (l) {
          return (
            "<tr>" +
            "<td>" +
            new Date(l.created_at).toLocaleDateString("fr-FR") +
            "</td>" +
            "<td>" +
            esc(l.vertical) +
            "</td>" +
            "<td>" +
            esc(l.email || "—") +
            "</td>" +
            "<td>" +
            esc(l.phone || "—") +
            "</td>" +
            "<td>" +
            esc(l.status || "new") +
            "</td>" +
            "<td><button type=\"button\" class=\"btn btn-ghost btn-convert\" data-id=\"" +
            esc(l.id) +
            "\">→ Contact</button></td></tr>"
          );
        })
        .join("");
      tbody.querySelectorAll(".btn-convert").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          var leadId = btn.getAttribute("data-id");
          api("/api/crm/convert-lead", {
            method: "POST",
            body: { leadId: leadId, contactType: "prospect" },
          }).then(function (res) {
            if (res.ok && res.contactId) {
              if (confirm("Contact cree. Ouvrir la fiche complete ?")) {
                window.location.href =
                  "./crm-contact.html?id=" + encodeURIComponent(res.contactId);
              } else {
                loadLeads();
                loadOverview();
              }
            } else if (res.ok) {
              loadLeads();
              loadOverview();
            } else alert(res.error || "Erreur");
          });
        });
      });
    });
  }

  function loadTeam() {
    api("/api/crm/users").then(function (data) {
      var tbody = document.getElementById("teamTable");
      if (!data.ok) {
        tbody.innerHTML = '<tr><td colspan="5">' + esc(data.error) + "</td></tr>";
        return;
      }
      tbody.innerHTML = (data.users || [])
        .map(function (u) {
          return (
            "<tr><td>" +
            esc(u.full_name || "—") +
            "</td><td>" +
            esc(u.email) +
            "</td><td>" +
            esc(u.crm_role || u.role) +
            "</td><td>" +
            esc(u.status || "active") +
            "</td><td>" +
            (u.last_login_at
              ? new Date(u.last_login_at).toLocaleDateString("fr-FR")
              : "—") +
            "</td></tr>"
          );
        })
        .join("");
    });
  }

  function initAuth() {
    document.getElementById("crmLoginForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      api("/api/auth/login", {
        method: "POST",
        body: { email: fd.get("email"), password: fd.get("password") },
      }).then(function (data) {
        if (!data.ok) {
          document.getElementById("crmAuthMsg").textContent = data.error || "Erreur";
          return;
        }
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        state.user = data.user;
        if (data.user.role !== "admin" && !data.user.crmRole) {
          document.getElementById("crmAuthMsg").textContent =
            "Compte sans acces CRM. Contactez l administrateur.";
          return;
        }
        showApp();
        setSection(sectionFromHash() || "overview");
      });
    });
    document.getElementById("crmLogout").addEventListener("click", function () {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      showAuth();
    });
  }

  function sectionFromHash() {
    var h = (location.hash || "").replace("#", "");
    return ["overview", "contacts", "leads", "team"].indexOf(h) >= 0 ? h : null;
  }

  function initApp() {
    window.addEventListener("hashchange", function () {
      var s = sectionFromHash();
      if (s && !document.getElementById("crmApp").classList.contains("hidden")) setSection(s);
    });
    document.querySelectorAll(".tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        document.querySelectorAll(".tab").forEach(function (t) {
          t.classList.remove("active");
        });
        tab.classList.add("active");
        state.contactType = tab.dataset.type || "";
        loadContacts();
      });
    });
    var contactSearchTimer;
    var cs = document.getElementById("contactSearch");
    if (cs) {
      cs.addEventListener("input", function () {
        clearTimeout(contactSearchTimer);
        contactSearchTimer = setTimeout(loadContacts, 300);
      });
    }
    var btnExpContacts = document.getElementById("btnExportContacts");
    if (btnExpContacts && window.CrmExport) {
      btnExpContacts.addEventListener("click", function () {
        var list = state.lastContacts || [];
        if (!list.length) return alert("Aucun contact a exporter");
        var csv = window.CrmExport.toCsv(list, [
          { label: "Type", value: function (c) { return c.contact_type; } },
          {
            label: "Nom",
            value: function (c) {
              return ((c.first_name || "") + " " + (c.last_name || "")).trim();
            },
          },
          { label: "Email", value: function (c) { return c.email; } },
          { label: "Telephone", value: function (c) { return c.phone; } },
          { label: "Societe", value: function (c) { return c.company; } },
          { label: "Statut", value: function (c) { return c.status; } },
        ]);
        window.CrmExport.download("contacts-crm.csv", csv);
      });
    }
    document.getElementById("contactForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      api("/api/crm/contacts", {
        method: "POST",
        body: {
          contactType: fd.get("contactType"),
          firstName: fd.get("firstName"),
          lastName: fd.get("lastName"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          company: fd.get("company"),
          notes: fd.get("notes"),
        },
      }).then(function (res) {
        if (res.ok) {
          e.target.reset();
          loadContacts();
          loadOverview();
        } else alert(res.error);
      });
    });
    document.getElementById("userForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      api("/api/crm/users", {
        method: "POST",
        body: {
          email: fd.get("email"),
          password: fd.get("password"),
          crmRole: fd.get("crmRole"),
          fullName: fd.get("fullName"),
        },
      }).then(function (res) {
        if (res.ok) {
          e.target.reset();
          loadTeam();
        } else alert(res.error);
      });
    });
  }

  function handleOAuthReturn() {
    var params = new URLSearchParams(window.location.search);
    var token = params.get("token");
    if (params.get("oauth") === "success" && token) {
      fetch("/api/auth/me", {
        headers: { Authorization: "Bearer " + token },
      })
        .then(function (r) {
          return r.json();
        })
        .then(function (data) {
          if (data.ok && data.user) {
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            state.user = data.user;
            window.history.replaceState({}, "", "./crm.html");
            showApp();
            setSection("overview");
          } else {
            document.getElementById("crmAuthMsg").textContent =
              data.error || "Connexion Google incomplete";
          }
        })
        .catch(function () {
          document.getElementById("crmAuthMsg").textContent =
            "Erreur apres connexion Google";
        });
      return true;
    }
    if (params.get("oauth_error")) {
      document.getElementById("crmAuthMsg").textContent = params.get("oauth_error");
    }
    return false;
  }

  document.addEventListener("DOMContentLoaded", function () {
    initAuth();
    initApp();
    if (handleOAuthReturn()) return;
    var saved = localStorage.getItem(USER_KEY);
    if (token() && saved) {
      try {
        state.user = JSON.parse(saved);
      } catch (e) {}
      api("/api/auth/me").then(function (data) {
        if (data.ok && data.user) {
          state.user = data.user;
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          if (data.user.role === "admin" || data.user.crmRole) {
            showApp();
            setSection(sectionFromHash() || "overview");
            return;
          }
        }
        showAuth();
      });
    } else showAuth();
  });
})();
