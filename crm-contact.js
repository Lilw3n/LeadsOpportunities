(function () {
  var TOKEN_KEY = "lo_token";
  var contactId = new URLSearchParams(location.search).get("id");
  var data = {
    contact: null,
    events: [],
    claims: [],
    vehicles: [],
    drivers: [],
    contracts: [],
    insuranceRequests: [],
    activities: [],
    leads: [],
    meta: {},
  };
  var modal = { resource: null, itemId: null };
  var profileKey = "generic";

  function parseMeta(contact) {
    if (!contact || !contact.metadata) return {};
    try {
      return typeof contact.metadata === "string" ? JSON.parse(contact.metadata) : contact.metadata;
    } catch (e) {
      return {};
    }
  }

  function token() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function esc(s) {
    if (s == null) return "";
    var d = document.createElement("div");
    d.textContent = String(s);
    return d.innerHTML;
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

  function eventTypeLabel(t) {
    var m = { call: "Appel", email: "Email", meeting: "RDV", task: "Tache", note: "Note", document: "Document" };
    return m[t] || t;
  }

  function showError(msg) {
    document.getElementById("contactLoading").classList.add("hidden");
    document.getElementById("contactError").textContent = msg;
    document.getElementById("contactError").classList.remove("hidden");
  }

  function loadContact() {
    if (!contactId) {
      showError("Identifiant contact manquant");
      return;
    }
    if (!token()) {
      location.href = "./crm.html";
      return;
    }
    api("/api/crm/contact?id=" + encodeURIComponent(contactId)).then(function (res) {
      if (!res.ok) {
        showError(res.error || "Contact introuvable");
        return;
      }
      data.contact = res.contact;
      data.meta = parseMeta(res.contact);
      data.events = res.events || [];
      data.claims = res.claims || [];
      data.vehicles = res.vehicles || [];
      data.drivers = res.drivers || [];
      data.contracts = res.contracts || [];
      data.insuranceRequests = res.insuranceRequests || [];
      data.activities = res.activities || [];
      data.leads = res.leads || [];
      if (window.CrmContactProfiles) {
        profileKey = window.CrmContactProfiles.resolve({
          meta: data.meta,
          leads: data.leads,
          vehicles: data.vehicles,
          drivers: data.drivers,
          contracts: data.contracts,
        });
        if (!data.meta.profileKey) {
          data.meta.profileKey = profileKey;
        }
      }
      render();
      document.getElementById("contactLoading").classList.add("hidden");
      document.getElementById("contactApp").classList.remove("hidden");
      if (window.CrmModuleEventBus) {
        window.CrmModuleEventBus.emit("refresh", { contactId: contactId });
      }
    });
  }

  if (window.CrmModuleEventBus) {
    window.CrmModuleEventBus.on("refresh", function () {
      if (data.contact) render();
    });
  }

  function renderHeader() {
    var c = data.contact;
    var name = ((c.first_name || "") + " " + (c.last_name || "")).trim() || c.email || "Contact";
    document.getElementById("contactName").textContent = name;
    document.title = name + " | CRM";
    var prof = window.CrmContactProfiles ? window.CrmContactProfiles.get(profileKey) : null;
    var role = (data.meta && data.meta.userRole) || localStorage.getItem("lo_role") || "staff";
    var emailHtml = window.SecureContact
      ? window.SecureContact.renderField("email", c.email, role)
      : esc(c.email || "—");
    var phoneHtml = window.SecureContact
      ? window.SecureContact.renderField("phone", c.phone, role)
      : esc(c.phone || "—");
    document.getElementById("contactMeta").innerHTML =
      '<span class="badge badge-' +
      (c.contact_type === "client" ? "client" : c.contact_type === "apporteur" ? "apporteur" : "prospect") +
      '">' +
      labelType(c.contact_type) +
      "</span>" +
      (prof
        ? ' <span class="badge badge-profile">' + esc(prof.label) + "</span>"
        : "") +
      " · " +
      emailHtml +
      " · " +
      phoneHtml +
      (c.company ? " · " + esc(c.company) : "");
    if (window.SecureContact) window.SecureContact.bindReveal(document.getElementById("contactMeta"));
  }

  function priorityBadge(p) {
    var C = window.CrmConstants || {};
    var cls = (C.PRIORITY_CLASS && C.PRIORITY_CLASS[p]) || "";
    var lbl = (C.PRIORITY_LABELS && C.PRIORITY_LABELS[p]) || p;
    return '<span class="badge ' + cls + '">' + esc(lbl) + "</span>";
  }

  function filteredEvents() {
    var q = (document.getElementById("eventSearch").value || "").toLowerCase();
    var type = document.getElementById("eventTypeFilter").value;
    var status = document.getElementById("eventStatusFilter").value;
    var priority = document.getElementById("eventPriorityFilter").value;
    var sort = document.getElementById("eventSort").value || "date-desc";
    var list = data.events.filter(function (e) {
      if (type && e.event_type !== type) return false;
      if (status && e.status !== status) return false;
      if (priority && e.priority !== priority) return false;
      if (q) {
        var ai = document.getElementById("eventAiSearch") && document.getElementById("eventAiSearch").checked;
        if (ai && window.CrmEventSearch) {
          if (!window.CrmEventSearch.match(e, q)) return false;
        } else {
          var hay = ((e.title || "") + " " + (e.description || "")).toLowerCase();
          if (hay.indexOf(q) === -1) return false;
        }
      }
      return true;
    });
    var dir = sort.indexOf("asc") !== -1 ? 1 : -1;
    list.sort(function (a, b) {
      var av =
        sort.indexOf("created") === 0
          ? new Date(a.created_at).getTime()
          : new Date(a.event_date || a.created_at).getTime();
      var bv =
        sort.indexOf("created") === 0
          ? new Date(b.created_at).getTime()
          : new Date(b.event_date || b.created_at).getTime();
      return (av - bv) * dir;
    });
    return list;
  }

  function parseEventExtra(e) {
    if (!e.extra_data) return {};
    try {
      return JSON.parse(e.extra_data);
    } catch (err) {
      return {};
    }
  }

  function renderSmartTimeline() {
    var box = document.getElementById("smartTimelineBox");
    if (!box) return;
    var period = sessionStorage.getItem("crm_timeline_period") || "all";
    if (window.SmartEventsService) {
      box.innerHTML = window.SmartEventsService.renderTimeline(filteredEvents(), esc, period);
    } else if (window.CrmSmartTimeline) {
      box.innerHTML = window.CrmSmartTimeline.render(filteredEvents(), esc, period);
    }
    var sel = document.getElementById("smartTimelinePeriod");
    if (sel) {
      sel.onchange = function () {
        sessionStorage.setItem("crm_timeline_period", sel.value);
        renderSmartTimeline();
      };
    }
  }

  function renderEvents() {
    var list = filteredEvents();
    renderSmartTimeline();
    var el = document.getElementById("eventsList");
    if (!list.length) {
      el.innerHTML = '<p class="empty-module">Aucun evenement</p>';
      return;
    }
    el.innerHTML = list
      .map(function (e) {
        var dateStr = e.event_date
          ? new Date(e.event_date).toLocaleDateString("fr-FR")
          : new Date(e.created_at).toLocaleDateString("fr-FR");
        var extra = parseEventExtra(e);
        var parts = (extra.participants || [])
          .map(function (p) {
            return (p.name || p.email || "").trim();
          })
          .filter(Boolean);
        var att = (extra.attachments || []).length;
        var links = (extra.links || []).length;
        return (
          '<article class="event-card" data-id="' +
          esc(e.id) +
          '">' +
          "<h4>" +
          esc(e.title) +
          "</h4>" +
          '<p class="meta">' +
          eventTypeLabel(e.event_type) +
          " · " +
          priorityBadge(e.priority) +
          " · " +
          esc(e.status) +
          " · " +
          dateStr +
          (e.event_time ? " " + esc(e.event_time) : "") +
          "</p>" +
          (parts.length
            ? '<p class="meta">Participants : ' + esc(parts.join(", ")) + "</p>"
            : "") +
          (att || links
            ? '<p class="meta">' +
              (att ? att + " PJ" : "") +
              (att && links ? " · " : "") +
              (links ? links + " lien(s)" : "") +
              "</p>"
            : "") +
          (e.description ? "<p>" + esc(e.description) + "</p>" : "") +
          '<div class="actions">' +
          '<button type="button" class="btn btn-ghost btn-xs btn-edit-event" data-id="' +
          esc(e.id) +
          '">Modifier</button>' +
          '<button type="button" class="btn btn-ghost btn-xs btn-dup-event" data-id="' +
          esc(e.id) +
          '">Dupliquer</button>' +
          '<button type="button" class="btn btn-ghost btn-xs btn-del-event" data-id="' +
          esc(e.id) +
          '">Supprimer</button>' +
          "</div></article>"
        );
      })
      .join("");
    el.querySelectorAll(".btn-edit-event").forEach(function (btn) {
      btn.onclick = function () {
        openModal("events", data.events.find(function (x) {
          return x.id === btn.getAttribute("data-id");
        }));
      };
    });
    el.querySelectorAll(".btn-dup-event").forEach(function (btn) {
      btn.onclick = function () {
        api("/api/crm/duplicate-event", {
          method: "POST",
          body: { eventId: btn.getAttribute("data-id") },
        }).then(function (res) {
          if (res.ok) loadContact();
          else alert(res.error || "Erreur");
        });
      };
    });
    el.querySelectorAll(".btn-del-event").forEach(function (btn) {
      btn.onclick = function () {
        if (!confirm("Supprimer cet evenement ?")) return;
        delModule("events", btn.getAttribute("data-id"));
      };
    });
  }

  function renderCompanyFamily() {
    var cbox = document.getElementById("companyBox");
    var fbox = document.getElementById("familyBox");
    if (!cbox || !fbox) return;
    var co = data.meta.company || {};
    if (co.name) {
      cbox.innerHTML =
        "<p><strong>" +
        esc(co.name) +
        "</strong></p><p>SIRET " +
        esc(co.siret || "—") +
        " · " +
        esc(co.activity || "") +
        "</p><p>" +
        esc(co.address || "") +
        "</p>";
    } else {
      cbox.innerHTML = "<p>Aucune fiche entreprise — cliquez Modifier.</p>";
    }
    var fa = data.meta.family || {};
    var ec = fa.emergencyContact || {};
    var sp = fa.spouse || {};
    var kids = (fa.children || [])
      .map(function (ch) {
        return esc((ch.firstName || "") + " " + (ch.lastName || ""));
      })
      .filter(Boolean)
      .join(", ");
    fbox.innerHTML =
      "<p><strong>Conjoint :</strong> " +
      esc((sp.firstName || "") + " " + (sp.lastName || "") || "—") +
      "</p><p><strong>Enfants :</strong> " +
      (kids || "—") +
      "</p><p><strong>Urgence :</strong> " +
      esc((ec.firstName || "") + " " + (ec.lastName || "")) +
      " · " +
      esc(ec.phone || "—") +
      "</p>";
  }

  function renderActivities() {
    var el = document.getElementById("activitiesList");
    if (!data.activities.length) {
      el.innerHTML = "<p class=\"empty-module\">—</p>";
      return;
    }
    el.innerHTML = data.activities
      .map(function (a) {
        return (
          '<div class="activity"><strong>' +
          esc(a.title || a.activity_type) +
          "</strong> — " +
          esc(a.body || "") +
          " <em>" +
          new Date(a.created_at).toLocaleString("fr-FR") +
          "</em></div>"
        );
      })
      .join("");
  }

  function cardActions(resource, id) {
    return (
      '<div class="actions">' +
      '<button type="button" class="btn btn-ghost btn-xs btn-edit-mod" data-resource="' +
      resource +
      '" data-id="' +
      esc(id) +
      '">Modifier</button>' +
      '<button type="button" class="btn btn-ghost btn-xs btn-transfer-mod" data-resource="' +
      resource +
      '" data-id="' +
      esc(id) +
      '">Transférer</button>' +
      '<button type="button" class="btn btn-ghost btn-xs btn-del-mod" data-resource="' +
      resource +
      '" data-id="' +
      esc(id) +
      '">Supprimer</button>' +
      "</div>"
    );
  }

  var transferState = { resource: null, itemId: null };

  function renderClaims() {
    var el = document.getElementById("claimsCards");
    if (!data.claims.length) {
      el.innerHTML = '<p class="empty-module">Aucun sinistre</p>';
      return;
    }
    el.innerHTML = data.claims
      .map(function (c) {
        return (
          '<article class="module-card claims" data-id="' +
          esc(c.id) +
          '"><h4>' +
          esc(c.claim_type || "Sinistre") +
          " — " +
          esc(c.status) +
          "</h4>" +
          "<p>" +
          (c.claim_date ? new Date(c.claim_date).toLocaleDateString("fr-FR") : "—") +
          (c.amount != null ? " · " + c.amount + " €" : "") +
          "</p>" +
          "<p>" +
          esc(c.insurer || "") +
          "</p>" +
          (c.description ? "<p>" + esc(c.description) + "</p>" : "") +
          cardActions("claims", c.id) +
          "</article>"
        );
      })
      .join("");
  }

  function renderVehicles() {
    var el = document.getElementById("vehiclesCards");
    if (!data.vehicles.length) {
      el.innerHTML = '<p class="empty-module">Aucun vehicule</p>';
      return;
    }
    el.innerHTML = data.vehicles
      .map(function (v) {
        return (
          '<article class="module-card vehicles"><h4>' +
          esc(v.registration || v.brand + " " + v.model) +
          "</h4><p>" +
          esc(v.brand) +
          " " +
          esc(v.model) +
          (v.year ? " (" + v.year + ")" : "") +
          " · " +
          esc(v.status) +
          "</p>" +
          cardActions("vehicles", v.id) +
          "</article>"
        );
      })
      .join("");
  }

  function renderDrivers() {
    var el = document.getElementById("driversCards");
    if (!data.drivers.length) {
      el.innerHTML = '<p class="empty-module">Aucun conducteur</p>';
      return;
    }
    el.innerHTML = data.drivers
      .map(function (d) {
        return (
          '<article class="module-card drivers"><h4>' +
          esc((d.first_name || "") + " " + (d.last_name || "")) +
          "</h4><p>Permis " +
          esc(d.license_type || "—") +
          " " +
          esc(d.license_number || "") +
          " · " +
          esc(d.status) +
          "</p>" +
          cardActions("drivers", d.id) +
          "</article>"
        );
      })
      .join("");
  }

  function renderContracts() {
    var el = document.getElementById("contractsCards");
    if (!data.contracts.length) {
      el.innerHTML = '<p class="empty-module">Aucun contrat</p>';
      return;
    }
    el.innerHTML = data.contracts
      .map(function (c) {
        return (
          '<article class="module-card contracts"><h4>' +
          esc(c.insurer || c.contract_type) +
          " — " +
          esc(c.status) +
          "</h4><p>N° " +
          esc(c.policy_number || "—") +
          (c.premium != null ? " · " + c.premium + " €/an" : "") +
          "</p>" +
          cardActions("contracts", c.id) +
          "</article>"
        );
      })
      .join("");
  }

  function renderRequests() {
    var el = document.getElementById("requestsCards");
    if (!data.insuranceRequests.length) {
      el.innerHTML = '<p class="empty-module">Aucune demande</p>';
      return;
    }
    el.innerHTML = data.insuranceRequests
      .map(function (r) {
        return (
          '<article class="module-card requests"><h4>' +
          esc(r.request_type) +
          " — " +
          esc(r.status) +
          "</h4><p>Priorite " +
          esc(r.priority) +
          (r.amount != null ? " · " + r.amount + " €" : "") +
          "</p>" +
          (r.description ? "<p>" + esc(r.description) + "</p>" : "") +
          cardActions("insurance-requests", r.id) +
          "</article>"
        );
      })
      .join("");
  }

  function renderLeads() {
    var el = document.getElementById("leadsList");
    if (!data.leads.length) {
      el.innerHTML = '<p class="empty-module">Aucun lead lie</p>';
      return;
    }
    el.innerHTML =
      "<table><thead><tr><th>Date</th><th>Vertical</th><th>Email</th><th>Statut</th></tr></thead><tbody>" +
      data.leads
        .map(function (l) {
          return (
            "<tr><td>" +
            new Date(l.created_at).toLocaleDateString("fr-FR") +
            "</td><td>" +
            esc(l.vertical) +
            "</td><td>" +
            esc(l.email) +
            "</td><td>" +
            esc(l.status) +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table>";
  }

  function bindModuleButtons() {
    document.querySelectorAll(".btn-edit-mod").forEach(function (btn) {
      btn.onclick = function () {
        var res = btn.getAttribute("data-resource");
        var id = btn.getAttribute("data-id");
        var item = findItem(res, id);
        openModal(res, item);
      };
    });
    document.querySelectorAll(".btn-del-mod").forEach(function (btn) {
      btn.onclick = function () {
        if (!confirm("Supprimer cet element ?")) return;
        delModule(btn.getAttribute("data-resource"), btn.getAttribute("data-id"));
      };
    });
    document.querySelectorAll(".btn-transfer-mod").forEach(function (btn) {
      btn.onclick = function () {
        transferState.resource = btn.getAttribute("data-resource");
        transferState.itemId = btn.getAttribute("data-id");
        document.getElementById("transferTargetId").value = "";
        document.getElementById("transferOverlay").classList.remove("hidden");
      };
    });
  }

  function findItem(resource, id) {
    var map = {
      claims: data.claims,
      vehicles: data.vehicles,
      drivers: data.drivers,
      contracts: data.contracts,
      "insurance-requests": data.insuranceRequests,
      events: data.events,
    };
    return (map[resource] || []).find(function (x) {
      return x.id === id;
    });
  }

  function renderKpis() {
    var el = document.getElementById("contactKpis");
    if (!el) return;
    var cfg = window.CrmContactProfiles ? window.CrmContactProfiles.get(profileKey) : null;
    var keys = (cfg && cfg.kpis) || ["events", "contracts", "requests"];
    var defs = {
      events: { n: data.events.length, label: "Événements" },
      claims: { n: data.claims.length, label: "Sinistres" },
      vehicles: { n: data.vehicles.length, label: "Véhicules" },
      contracts: { n: data.contracts.length, label: "Contrats" },
      requests: { n: data.insuranceRequests.length, label: "Demandes" },
    };
    el.innerHTML = keys
      .map(function (k) {
        var d = defs[k];
        if (!d) return "";
        return '<div class="kpi"><strong>' + d.n + "</strong><span>" + d.label + "</span></div>";
      })
      .join("");
  }

  function renderQuoteDetails() {
    var box = document.getElementById("quoteDetailsBox");
    if (!box) return;
    var lines = [];
    if (data.meta.serviceLabel) lines.push("<p><strong>Produit :</strong> " + esc(data.meta.serviceLabel) + "</p>");
    if (data.meta.primaryNeed) lines.push("<p><strong>Besoin :</strong> " + esc(data.meta.primaryNeed) + "</p>");
    if (data.meta.vertical) lines.push("<p><strong>Vertical :</strong> " + esc(data.meta.vertical) + "</p>");
    if (data.meta.quoteDetails && typeof data.meta.quoteDetails === "object") {
      Object.keys(data.meta.quoteDetails).forEach(function (k) {
        var v = data.meta.quoteDetails[k];
        if (v != null && v !== "") {
          lines.push("<p><strong>" + esc(k) + " :</strong> " + esc(String(v)) + "</p>");
        }
      });
    }
    if (data.leads.length) {
      data.leads.forEach(function (l) {
        lines.push(
          "<p><strong>Lead " +
            esc(l.vertical || "") +
            "</strong> — score " +
            esc(l.lead_score != null ? l.lead_score : "—") +
            " · " +
            new Date(l.created_at).toLocaleDateString("fr-FR") +
            "</p>"
        );
      });
    }
    box.innerHTML = lines.length
      ? lines.join("")
      : "<p>Aucune information de devis — renseignez le type de fiche dans « Modifier profil ».</p>";
  }

  function renderEligibility() {
    var box = document.getElementById("eligibilityBox");
    if (!box) return;
    if (profileKey !== "mobilite-vtc" && profileKey !== "mobilite") return;
    var payload = { claims: data.claims, drivers: data.drivers, vehicles: data.vehicles };
    var html = "";
    if (window.PartnerEligibility) {
      html +=
        "<h3 class=\"sub-title\">Partenaires grossistes</h3>" +
        window.PartnerEligibility.renderForm() +
        '<div id="partnerEligResults"></div>';
    }
    if (window.CrmEligibility) {
      html +=
        "<h3 class=\"sub-title\">Produits VTC</h3>" +
        window.CrmEligibility.renderQuickForm() +
        '<div id="eligibilityResults">' +
        window.CrmEligibility.renderHtml(payload) +
        "</div>";
    }
    box.innerHTML = html;
    var btnP = document.getElementById("btnPartnerElig");
    if (btnP && window.PartnerEligibility) {
      btnP.onclick = function () {
        document.getElementById("partnerEligResults").innerHTML =
          window.PartnerEligibility.renderResults(
            window.PartnerEligibility.checkAll(
              document.getElementById("peProduct").value,
              {
                age: document.getElementById("peAge").value,
                licenseYears: document.getElementById("peLicense").value,
                bonusMalus: document.getElementById("peBonus").value,
              },
              payload
            )
          );
      };
    }
    var btn = document.getElementById("btnEligCheck");
    if (btn && window.CrmEligibility) {
      btn.onclick = function () {
        document.getElementById("eligibilityResults").innerHTML = window.CrmEligibility.renderHtml(
          payload,
          window.CrmEligibility.quickCheck(
            { age: document.getElementById("eligAge").value, bonusMalus: document.getElementById("eligBonus").value },
            payload
          )
        );
      };
    }
  }

  function renderDocuments() {
    var mount = document.getElementById("contactDocumentsMount");
    if (!mount || !contactId) return;
    mount.innerHTML = "<p style='color:var(--muted)'>Chargement…</p>";
    api("/api/crm/contact-documents?contactId=" + encodeURIComponent(contactId)).then(function (res) {
      if (!res.ok) {
        mount.innerHTML = "<p>" + esc(res.error || "Erreur") + "</p>";
        return;
      }
      var docs = res.documents || [];
      if (!docs.length) {
        mount.innerHTML =
          "<p style='color:var(--muted)'>Aucune pièce déposée via le parcours devis ou le portail client.</p>";
        return;
      }
      mount.innerHTML =
        '<div class="crm-docs-grid">' +
        docs
          .map(function (d) {
            var preview =
              d.thumbnailLink || (d.mimeType && d.mimeType.indexOf("image") !== -1 && d.webViewLink)
                ? '<img src="' + esc(d.thumbnailLink || d.webViewLink) + '" alt="" />'
                : '<span style="font-size:2.2rem">' +
                  (d.mimeType && d.mimeType.indexOf("pdf") !== -1 ? "📕" : "📄") +
                  "</span>";
            var drive =
              d.webViewLink && d.driveFileId
                ? '<a href="' + esc(d.webViewLink) + '" target="_blank" rel="noopener">Ouvrir Drive</a>'
                : d.driveFileId
                  ? "<span>ID " + esc(d.driveFileId) + "</span>"
                  : "<span>Archivé CRM</span>";
            return (
              '<article class="crm-doc-tile">' +
              '<div class="crm-doc-tile-preview">' +
              preview +
              "</div>" +
              '<div class="crm-doc-tile-body"><strong>' +
              esc(d.name) +
              "</strong><br><span style='color:var(--muted)'>" +
              esc(d.type) +
              " · " +
              esc(d.status) +
              "</span><br>" +
              drive +
              "</div></article>"
            );
          })
          .join("") +
        "</div>";
    });
  }

  function renderQuotes() {
    var box = document.getElementById("quotesList");
    if (!box) return;
    box.innerHTML = "<p>Chargement…</p>";
    api("/api/crm/quotes?contactId=" + encodeURIComponent(contactId)).then(function (res) {
      if (!res.ok || !res.quotes || !res.quotes.length) {
        box.innerHTML =
          '<p>Aucun devis — <a href="./crm-quote-wizard.html?contactId=' +
          encodeURIComponent(contactId) +
          '">Créer avec le wizard</a></p>';
        return;
      }
      box.innerHTML =
        "<ul>" +
        res.quotes
          .map(function (q) {
            return (
              "<li><a href=\"./crm-quote-detail.html?id=" +
              encodeURIComponent(q.id) +
              '">' +
              esc(q.title || q.product_type) +
              "</a> — " +
              esc(q.status) +
              " · " +
              new Date(q.created_at).toLocaleDateString("fr-FR") +
              "</li>"
            );
          })
          .join("") +
        "</ul>";
    });
  }

  function renderModuleLinks() {
    var box = document.getElementById("moduleLinksBox");
    if (!box) return;
    api("/api/crm/module-link?contactId=" + encodeURIComponent(contactId)).then(function (res) {
      var links = (res.ok && res.links) || [];
      var mig =
        res.migration
          ? '<p style="font-size:.85rem;color:#b45309">Table <code>crm_module_links</code> : exécutez <code>database/crm-module-links.sql</code> sur Neon.</p>'
          : "";
      var html =
        '<p style="font-size:.85rem;color:var(--muted)">Lier un module de <strong>ce contact</strong> vers un autre dossier — inspire <code>UniversalModuleLinker</code> multisite (recherche + liste modules).</p>' +
        mig +
        '<div class="form-grid" style="margin-top:12px">' +
        '<label>Type<select id="linkModuleType" name="moduleType">' +
        '<option value="vehicles">Véhicule</option>' +
        '<option value="drivers">Conducteur</option>' +
        '<option value="contracts">Contrat</option>' +
        '<option value="claims">Sinistre</option>' +
        '<option value="events">Événement</option>' +
        '<option value="insurance-requests">Demande assurance</option>' +
        "</select></label>" +
        '<label>Module du contact<select id="linkModulePick"><option value="">— Choisir —</option></select></label>' +
        '<label>ID module (saisie manuelle)<input type="text" id="linkModuleId" name="moduleId" placeholder="veh_… evt_…" /></label>' +
        "</div>" +
        '<div style="margin-top:12px;padding:12px;background:#f8fafc;border-radius:8px;border:1px solid var(--line)">' +
        "<strong>Contact cible</strong>" +
        '<input type="search" id="linkTargetSearch" placeholder="Nom ou email (2 car. min)" style="width:100%;margin-top:8px;padding:8px 10px;border:1px solid var(--line);border-radius:8px" />' +
        '<div id="linkTargetResults" style="margin-top:8px"></div>' +
        '<label style="margin-top:10px;display:block">ID contact cible<input type="text" id="linkTargetContactId" name="targetContactId" placeholder="ct_…" required /></label>' +
        "</div>" +
        '<label style="margin-top:12px;display:block">Libellé (optionnel)<input type="text" id="linkLabel" name="label" placeholder="Réf. dossier conjoint…" /></label>' +
        '<button type="button" class="btn btn-primary btn-sm" id="btnModuleLinkSubmit" style="margin-top:12px">Lier</button>';
      if (links.length) {
        html += '<ul style="margin-top:12px;padding-left:18px">';
        links.forEach(function (l) {
          html +=
            "<li>" +
            esc(l.module_type) +
            " " +
            esc(l.module_id) +
            " → " +
            esc(((l.target_first_name || "") + " " + (l.target_last_name || "")).trim() || l.target_contact_id) +
            ' <button type="button" class="btn-unlink" data-link-id="' +
            esc(l.id) +
            '">Supprimer</button></li>';
        });
        html += "</ul>";
      } else {
        html += '<p style="margin-top:12px;color:var(--muted)">Aucun lien.</p>';
      }
      box.innerHTML = html;

      function loadModulePicklist() {
        var resName = document.getElementById("linkModuleType").value;
        var pick = document.getElementById("linkModulePick");
        var manual = document.getElementById("linkModuleId");
        pick.innerHTML = '<option value="">Chargement…</option>';
        api("/api/crm/modules?resource=" + encodeURIComponent(resName) + "&contactId=" + encodeURIComponent(contactId)).then(function (mr) {
          pick.innerHTML = '<option value="">— Choisir un module —</option>';
          if (!mr.ok || !mr.items || !mr.items.length) {
            pick.innerHTML += '<option value="" disabled>Aucun élément</option>';
            return;
          }
          mr.items.forEach(function (it) {
            var lbl = it.id;
            if (resName === "vehicles" && it.registration) lbl = it.registration + " · " + it.id;
            if (resName === "contracts" && it.policy_number) lbl = it.policy_number + " · " + it.id;
            if (resName === "claims" && it.claim_type) lbl = it.claim_type + " · " + it.id;
            if (resName === "drivers" && it.first_name) lbl = it.first_name + " " + (it.last_name || "") + " · " + it.id;
            if (resName === "events" && it.title) lbl = it.title + " · " + it.id;
            if (resName === "insurance-requests" && it.request_type) lbl = it.request_type + " · " + it.id;
            pick.innerHTML += "<option value=\"" + esc(it.id) + "\">" + esc(lbl) + "</option>";
          });
        });
      }

      document.getElementById("linkModuleType").onchange = function () {
        loadModulePicklist();
      };
      document.getElementById("linkModulePick").onchange = function () {
        var v = this.value;
        if (v) document.getElementById("linkModuleId").value = v;
      };
      loadModulePicklist();

      var searchTimer;
      var inp = document.getElementById("linkTargetSearch");
      if (inp) {
        inp.addEventListener("input", function () {
          clearTimeout(searchTimer);
          var q = inp.value.trim();
          var out = document.getElementById("linkTargetResults");
          if (q.length < 2) {
            out.innerHTML = "";
            return;
          }
          searchTimer = setTimeout(function () {
            api("/api/crm/universal-search?q=" + encodeURIComponent(q) + "&entity=contacts").then(function (sr) {
              if (!sr.ok || !sr.results || !sr.results.contacts || !sr.results.contacts.length) {
                out.innerHTML = "<span style=\"color:var(--muted)\">Aucun résultat</span>";
                return;
              }
              out.innerHTML = sr.results.contacts
                .slice(0, 8)
                .map(function (c) {
                  var name = ((c.first_name || "") + " " + (c.last_name || "")).trim() || c.email || c.id;
                  return (
                    '<button type="button" class="btn btn-ghost btn-sm link-pick-ct" data-ct-id="' +
                    esc(c.id) +
                    '" style="margin:4px 4px 0 0">' +
                    esc(name) +
                    (c.email ? " · " + esc(c.email) : "") +
                    "</button>"
                  );
                })
                .join("");
              out.querySelectorAll(".link-pick-ct").forEach(function (b) {
                b.onclick = function () {
                  document.getElementById("linkTargetContactId").value = b.getAttribute("data-ct-id");
                  out.innerHTML = "<span style=\"color:#059669\">✓ Contact sélectionné</span>";
                };
              });
            });
          }, 350);
        });
      }

      document.getElementById("btnModuleLinkSubmit").onclick = function () {
        var moduleId = (document.getElementById("linkModuleId").value || "").trim();
        var targetContactId = (document.getElementById("linkTargetContactId").value || "").trim();
        var label = (document.getElementById("linkLabel").value || "").trim();
        if (!moduleId) {
          alert("Choisissez un module dans la liste ou saisissez son ID.");
          return;
        }
        if (!targetContactId) {
          alert("Contact cible requis.");
          return;
        }
        api("/api/crm/module-link", {
          method: "POST",
          body: {
            sourceContactId: contactId,
            moduleType: document.getElementById("linkModuleType").value,
            moduleId: moduleId,
            targetContactId: targetContactId,
            label: label || undefined,
          },
        }).then(function (r2) {
          if (r2.ok) renderModuleLinks();
          else alert(r2.error || "Erreur");
        });
      };

      box.querySelectorAll(".btn-unlink").forEach(function (btn) {
        btn.onclick = function () {
          if (!confirm("Supprimer ce lien ?")) return;
          api("/api/crm/module-link?id=" + encodeURIComponent(btn.getAttribute("data-link-id")), {
            method: "DELETE",
          }).then(function (r3) {
            if (r3.ok) renderModuleLinks();
            else alert(r3.error || "Erreur");
          });
        };
      });
    });
  }

  function renderSimulateBanner() {
    var sim =
      new URLSearchParams(location.search).get("simulate") === "1" ||
      localStorage.getItem("crm_simulate_contact");
    var existing = document.getElementById("simulateBanner");
    if (!sim) {
      if (existing) existing.remove();
      return;
    }
    if (existing) return;
    var bar = document.createElement("div");
    bar.id = "simulateBanner";
    bar.className = "simulate-banner";
    bar.innerHTML =
      '<strong>Mode simulation client</strong> — vue lecture seule conseillée. ' +
      '<a href="./crm-simulate.html">Changer de contact</a> · ' +
      '<button type="button" id="btnExitSimulate" class="btn btn-ghost btn-sm">Quitter</button>';
    document.body.insertBefore(bar, document.body.firstChild);
    document.getElementById("btnExitSimulate").onclick = function () {
      localStorage.removeItem("crm_simulate_contact");
      location.href = "./crm-contact.html?id=" + encodeURIComponent(contactId);
    };
  }

  function render() {
    renderSimulateBanner();
    if (window.CrmContactActions) {
      window.CrmContactActions.render(document.getElementById("contactActionsMount"), contactId);
    }
    if (window.CrmContactProfiles) {
      window.CrmContactProfiles.applyLayout(profileKey);
    }
    renderHeader();
    renderKpis();
    renderDocuments();
    renderEligibility();
    renderQuoteDetails();
    renderCompanyFamily();
    renderEvents();
    renderActivities();
    renderClaims();
    renderVehicles();
    renderDrivers();
    renderContracts();
    renderRequests();
    renderQuotes();
    renderModuleLinks();
    renderLeads();
    bindModuleButtons();
  }

  var FORM_SCHEMAS = {
    events: {
      title: "Evenement",
      fields: [
        { name: "event_type", label: "Type", type: "select", options: ["call", "email", "meeting", "task", "note", "document"] },
        { name: "title", label: "Titre", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "event_date", label: "Date", type: "date" },
        { name: "event_time", label: "Heure", type: "time" },
        { name: "status", label: "Statut", type: "select", options: ["pending", "completed", "cancelled"] },
        { name: "priority", label: "Priorite", type: "select", options: ["low", "medium", "high", "urgent"] },
        { name: "participant_name", label: "Participant principal", type: "text" },
      ],
    },
    claims: {
      title: "Sinistre",
      fields: [
        { name: "claim_date", label: "Date", type: "date" },
        { name: "amount", label: "Montant", type: "number" },
        { name: "insurer", label: "Assureur", type: "text" },
        { name: "status", label: "Statut", type: "select", options: ["En attente", "En cours", "Resolu", "Refuse"] },
        { name: "description", label: "Description", type: "textarea" },
        { name: "percentage", label: "Responsabilite %", type: "number" },
      ],
    },
    vehicles: {
      title: "Vehicule",
      fields: [
        { name: "registration", label: "Immatriculation", type: "text" },
        { name: "brand", label: "Marque", type: "text" },
        { name: "model", label: "Modele", type: "text" },
        { name: "year", label: "Annee", type: "number" },
        {
          name: "vehicle_type",
          label: "Type",
          type: "select",
          options: (window.CrmConstants && window.CrmConstants.VEHICLE_TYPES) || [
            "Voiture particuliere",
            "VTC / Taxi",
          ],
        },
        { name: "status", label: "Statut", type: "select", options: ["Assure", "En attente", "Expire"] },
      ],
    },
    drivers: {
      title: "Conducteur",
      fields: [
        { name: "first_name", label: "Prenom", type: "text" },
        { name: "last_name", label: "Nom", type: "text" },
        { name: "license_number", label: "N° permis", type: "text" },
        { name: "license_type", label: "Type permis", type: "text" },
        { name: "status", label: "Statut", type: "select", options: ["Actif", "En attente", "Expire"] },
      ],
    },
    contracts: {
      title: "Contrat",
      fields: [
        { name: "contract_type", label: "Type", type: "select", options: ["assurance", "transport", "maintenance", "autre"] },
        { name: "insurer", label: "Assureur", type: "text" },
        { name: "policy_number", label: "N° police", type: "text" },
        { name: "premium", label: "Prime annuelle", type: "number" },
        { name: "start_date", label: "Debut", type: "date" },
        { name: "end_date", label: "Fin", type: "date" },
        { name: "status", label: "Statut", type: "select", options: ["En cours", "Expire", "Resilie", "En attente"] },
        { name: "description", label: "Description", type: "textarea" },
      ],
    },
    "insurance-requests": {
      title: "Demande d'assurance",
      fields: [
        { name: "request_type", label: "Type", type: "select", options: ["devis", "souscription", "modification", "resiliation"] },
        { name: "status", label: "Statut", type: "select", options: ["En attente", "En cours", "Accepte", "Refuse", "Expire"] },
        { name: "priority", label: "Priorite", type: "select", options: ["Faible", "Moyenne", "Elevee", "Urgente"] },
        { name: "requested_date", label: "Date demande", type: "date" },
        { name: "amount", label: "Montant", type: "number" },
        { name: "description", label: "Description", type: "textarea" },
      ],
    },
    profile: {
      title: "Profil contact",
      fields: [
        { name: "contact_type", label: "Type", type: "select", options: ["prospect", "client", "apporteur"] },
        { name: "first_name", label: "Prenom", type: "text" },
        { name: "last_name", label: "Nom", type: "text" },
        { name: "email", label: "Email", type: "email" },
        { name: "phone", label: "Telephone", type: "text" },
        { name: "company", label: "Societe", type: "text" },
        { name: "status", label: "Statut", type: "select", options: ["active", "inactive"] },
        { name: "notes", label: "Notes", type: "textarea" },
      ],
    },
  };

  function openCompanyModal() {
    modal.resource = "company";
    modal.itemId = null;
    document.getElementById("modalTitle").textContent = "Fiche entreprise";
    document.getElementById("modalForm").innerHTML =
      window.CrmFormHelpers.companyFields(data.meta.company);
    document.getElementById("modalOverlay").classList.remove("hidden");
  }

  function openFamilyModal() {
    modal.resource = "family";
    modal.itemId = null;
    document.getElementById("modalTitle").textContent = "Fiche famille";
    var formEl = document.getElementById("modalForm");
    formEl.innerHTML = window.CrmFormHelpers.familyFields(data.meta.family);
    window.CrmFormHelpers.bindFamilyForm(formEl);
    document.getElementById("modalOverlay").classList.remove("hidden");
  }

  function openModal(resource, item) {
    modal.resource = resource;
    modal.itemId = item ? item.id : null;
    if (resource === "events" && window.CrmEventForm) {
      document.getElementById("modalTitle").textContent =
        (item ? "Modifier " : "Ajouter ") + "evenement";
      var formEl = document.getElementById("modalForm");
      formEl.innerHTML = window.CrmEventForm.build(item);
      window.CrmEventForm.bindDynamic(formEl);
      document.getElementById("modalOverlay").classList.remove("hidden");
      return;
    }
    var schema = FORM_SCHEMAS[resource];
    if (!schema) return;
    document.getElementById("modalTitle").textContent =
      (item ? "Modifier " : "Ajouter ") + schema.title;
    var form = document.getElementById("modalForm");
    var html = schema.fields
      .map(function (f) {
        var val = item ? item[f.name] : "";
        if (f.type === "textarea") {
          return (
            '<label class="full">' +
            f.label +
            '<textarea name="' +
            f.name +
            '" rows="3">' +
            esc(val || "") +
            "</textarea></label>"
          );
        }
        if (f.type === "select") {
          return (
            '<label>' +
            f.label +
            '<select name="' +
            f.name +
            '">' +
            f.options
              .map(function (o) {
                return (
                  '<option value="' +
                  o +
                  '"' +
                  (val === o ? " selected" : "") +
                  ">" +
                  o +
                  "</option>"
                );
              })
              .join("") +
            "</select></label>"
          );
        }
        return (
          '<label>' +
          f.label +
          '<input name="' +
          f.name +
          '" type="' +
          f.type +
          '" value="' +
          esc(val != null ? val : "") +
          '"' +
          (f.required ? " required" : "") +
          " /></label>"
        );
      })
      .join("");
    if (resource === "claims" && window.CrmFormHelpers) {
      html =
        window.CrmFormHelpers.claimContractParentField(
          data.contracts,
          item && item.parent_id
        ) +
        window.CrmFormHelpers.claimExtraFields(item, data.vehicles, data.drivers) +
        html;
    }
    if (resource === "insurance-requests" && window.CrmFormHelpers) {
      html =
        window.CrmFormHelpers.insuranceRequestExtraFields(
          item,
          data.vehicles,
          data.drivers,
          data.contracts
        ) + html;
    }
    if (resource === "vehicles" && window.CrmFormHelpers) {
      html =
        window.CrmFormHelpers.vehicleParentField(
          data.contracts,
          item && item.parent_id
        ) + html;
    }
    form.innerHTML = html;
    if (resource === "claims" && item && item.claim_type) {
      var sel = form.querySelector('[name="claim_type"]');
      if (sel) sel.value = item.claim_type;
    }
    document.getElementById("modalOverlay").classList.remove("hidden");
  }

  function closeModal() {
    document.getElementById("modalOverlay").classList.add("hidden");
    modal.resource = null;
    modal.itemId = null;
  }

  function saveModal(e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    var body = {};
    fd.forEach(function (v, k) {
      body[k] = v;
    });
    if (modal.resource === "profile") {
      var metaPatch = Object.assign({}, data.meta);
      if (window.CrmContactProfiles) {
        metaPatch = window.CrmContactProfiles.mergeProfileMeta(metaPatch, fd);
      }
      api("/api/crm/contact?id=" + encodeURIComponent(contactId), {
        method: "PATCH",
        body: Object.assign({}, body, { metadata: metaPatch }),
      }).then(function (res) {
        if (res.ok) {
          closeModal();
          loadContact();
        } else alert(res.error || "Erreur");
      });
      return;
    }
    if (modal.resource === "company") {
      var companyData = window.CrmFormHelpers.parseCompanyForm(fd);
      if (window.CrmValidation) {
        var v = window.CrmValidation.validateCompany(companyData);
        if (!v.ok) return alert(v.error);
      }
      api("/api/crm/contact?id=" + encodeURIComponent(contactId), {
        method: "PATCH",
        body: { companyData: companyData },
      }).then(function (res) {
        if (res.ok) {
          closeModal();
          loadContact();
        } else alert(res.error || "Erreur");
      });
      return;
    }
    if (modal.resource === "family") {
      api("/api/crm/contact?id=" + encodeURIComponent(contactId), {
        method: "PATCH",
        body: { familyData: window.CrmFormHelpers.parseFamilyForm(fd) },
      }).then(function (res) {
        if (res.ok) {
          closeModal();
          loadContact();
        } else alert(res.error || "Erreur");
      });
      return;
    }
    if (modal.resource === "events" && window.CrmEventForm) {
      body = window.CrmEventForm.parse(fd);
      if (body.error) return alert(body.error);
      var url =
        "/api/crm/modules?resource=events&contactId=" + encodeURIComponent(contactId);
      if (modal.itemId) url += "&id=" + encodeURIComponent(modal.itemId);
      api(url, {
        method: modal.itemId ? "PATCH" : "POST",
        body: body,
      }).then(function (res) {
        if (res.ok) {
          closeModal();
          loadContact();
        } else alert(res.error || "Erreur");
      });
      return;
    }
    if (modal.resource === "claims" && fd.get("responsible") === "true") {
      body.responsible = true;
    }
    var url =
      "/api/crm/modules?resource=" +
      encodeURIComponent(modal.resource) +
      "&contactId=" +
      encodeURIComponent(contactId);
    if (modal.itemId) url += "&id=" + encodeURIComponent(modal.itemId);
    api(url, {
      method: modal.itemId ? "PATCH" : "POST",
      body: body,
    }).then(function (res) {
      if (res.ok) {
        closeModal();
        loadContact();
      } else alert(res.error || "Erreur");
    });
  }

  function delModule(resource, id) {
    api(
      "/api/crm/modules?resource=" +
        encodeURIComponent(resource) +
        "&id=" +
        encodeURIComponent(id),
      { method: "DELETE" }
    ).then(function (res) {
      if (res.ok) loadContact();
      else alert(res.error || "Erreur");
    });
  }

  document.getElementById("modalForm").addEventListener("submit", saveModal);
  document.getElementById("modalClose").onclick = closeModal;
  document.getElementById("modalCancel").onclick = closeModal;
  document.getElementById("btnAddEvent").onclick = function () {
    openModal("events", null);
  };
  document.querySelectorAll(".btn-add-module").forEach(function (btn) {
    btn.onclick = function () {
      openModal(btn.getAttribute("data-resource"), null);
    };
  });
  document.getElementById("btnEditProfile").onclick = function () {
    modal.resource = "profile";
    modal.itemId = null;
    document.getElementById("modalTitle").textContent = "Modifier profil";
    var html = "";
    if (window.CrmContactProfiles) {
      html += window.CrmContactProfiles.buildProfileFields(data.meta);
    }
    var schema = FORM_SCHEMAS.profile;
    html += schema.fields
      .map(function (f) {
        var val = data.contact[f.name] || data.contact[f.name.replace(/_([a-z])/g, function (_, c) { return c.toUpperCase(); })] || "";
        if (f.name === "contact_type") val = data.contact.contact_type;
        if (f.type === "textarea") {
          return (
            '<label class="full">' +
            f.label +
            '<textarea name="' +
            f.name +
            '" rows="3">' +
            esc(val || "") +
            "</textarea></label>"
          );
        }
        if (f.type === "select") {
          return (
            '<label>' +
            f.label +
            '<select name="' +
            f.name +
            '">' +
            f.options
              .map(function (o) {
                return (
                  '<option value="' +
                  o +
                  '"' +
                  (val === o ? " selected" : "") +
                  ">" +
                  o +
                  "</option>"
                );
              })
              .join("") +
            "</select></label>"
          );
        }
        return (
          '<label>' +
          f.label +
          '<input name="' +
          f.name +
          '" type="' +
          f.type +
          '" value="' +
          esc(val != null ? val : "") +
          '" /></label>'
        );
      })
      .join("");
    document.getElementById("modalForm").innerHTML = html;
    document.getElementById("modalOverlay").classList.remove("hidden");
  };
  var btnCo = document.getElementById("btnEditCompany");
  if (btnCo) btnCo.onclick = openCompanyModal;
  var btnFam = document.getElementById("btnEditFamily");
  if (btnFam) btnFam.onclick = openFamilyModal;
  var btnTree = document.getElementById("btnModulesTree");
  if (btnTree) {
    btnTree.href = "./crm-contact-modules.html?id=" + encodeURIComponent(contactId);
  }

  var transferTimer;
  document.getElementById("transferSearch").addEventListener("input", function () {
    clearTimeout(transferTimer);
    var q = this.value.trim();
    var box = document.getElementById("transferResults");
    if (q.length < 2) {
      box.innerHTML = "";
      return;
    }
    transferTimer = setTimeout(function () {
      api("/api/crm/contacts?search=" + encodeURIComponent(q) + "&limit=8").then(function (res) {
        if (!res.ok || !res.contacts) {
          box.innerHTML = "<p>Aucun resultat</p>";
          return;
        }
        box.innerHTML = res.contacts
          .filter(function (c) {
            return c.id !== contactId;
          })
          .map(function (c) {
            var name =
              ((c.first_name || "") + " " + (c.last_name || "")).trim() || c.email || c.id;
            return (
              '<button type="button" data-id="' +
              c.id +
              '">' +
              esc(name) +
              " · " +
              esc(c.email || "") +
              "</button>"
            );
          })
          .join("");
        box.querySelectorAll("button").forEach(function (btn) {
          btn.onclick = function () {
            box.querySelectorAll("button").forEach(function (b) {
              b.classList.remove("selected");
            });
            btn.classList.add("selected");
            document.getElementById("transferTargetId").value = btn.getAttribute("data-id");
          };
        });
      });
    }, 300);
  });
  document.getElementById("btnDeleteContact").onclick = function () {
    if (!confirm("Supprimer ce contact et tous ses modules ?")) return;
    api("/api/crm/contact?id=" + encodeURIComponent(contactId), { method: "DELETE" }).then(
      function (res) {
        if (res.ok) location.href = "./crm.html";
        else alert(res.error || "Erreur");
      }
    );
  };
  var aiEl = document.getElementById("eventAiSearch");
  if (aiEl) {
    aiEl.addEventListener("change", renderEvents);
  }
  ["eventSearch", "eventTypeFilter", "eventStatusFilter", "eventPriorityFilter", "eventSort"].forEach(
    function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", renderEvents);
      el.addEventListener("change", renderEvents);
    }
  );

  document.getElementById("transferClose").onclick = function () {
    document.getElementById("transferOverlay").classList.add("hidden");
  };
  document.getElementById("transferCancel").onclick = function () {
    document.getElementById("transferOverlay").classList.add("hidden");
  };
  document.getElementById("transferConfirm").onclick = function () {
    var target = document.getElementById("transferTargetId").value.trim();
    if (!target) return alert("ID contact requis");
    api("/api/crm/transfer", {
      method: "POST",
      body: {
        resource: transferState.resource,
        itemId: transferState.itemId,
        targetContactId: target,
      },
    }).then(function (res) {
      if (res.ok) {
        document.getElementById("transferOverlay").classList.add("hidden");
        if (transferState.resource === "events" || transferState.resource === "claims") {
          loadContact();
        } else {
          location.href = "./crm-contact.html?id=" + encodeURIComponent(target);
        }
      } else alert(res.error || "Erreur");
    });
  };

  function exportContactCsv() {
    if (!window.CrmExport || !data.contact) return;
    var c = data.contact;
    var rows = [
      {
        section: "Profil",
        label: "Nom",
        value: ((c.first_name || "") + " " + (c.last_name || "")).trim(),
      },
      { section: "Profil", label: "Email", value: c.email },
      { section: "Profil", label: "Telephone", value: c.phone },
    ];
    (data.events || []).forEach(function (e) {
      rows.push({
        section: "Evenement",
        label: e.title,
        value: (e.event_date || "") + " " + (e.status || ""),
      });
    });
    (data.claims || []).forEach(function (cl) {
      rows.push({
        section: "Sinistre",
        label: cl.claim_type,
        value: cl.status,
      });
    });
    var csv = window.CrmExport.toCsv(rows, [
      { label: "Section", value: function (r) { return r.section; } },
      { label: "Libelle", value: function (r) { return r.label; } },
      { label: "Valeur", value: function (r) { return r.value; } },
    ]);
    window.CrmExport.download(
      "contact-" + (c.last_name || c.id) + ".csv",
      csv
    );
  }

  var btnExp = document.getElementById("btnExportContact");
  if (btnExp) btnExp.onclick = exportContactCsv;
  var btnPrint = document.getElementById("btnPrintContact");
  if (btnPrint) btnPrint.onclick = function () {
    window.print();
  };
  var btnNewQuote = document.getElementById("btnNewQuote");
  if (btnNewQuote) {
    btnNewQuote.onclick = function () {
      location.href = "./crm-quote-wizard.html?contactId=" + encodeURIComponent(contactId);
    };
  }
  var btnAllQuotes = document.getElementById("btnAllQuotes");
  if (btnAllQuotes) {
    btnAllQuotes.onclick = function (e) {
      e.preventDefault();
      location.href = "./crm-quotes.html";
    };
  }

  loadContact();
})();
