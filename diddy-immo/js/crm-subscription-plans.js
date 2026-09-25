(function () {
  var token = localStorage.getItem("lo_token");
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  var canEdit = false;
  var plans = [];
  var statusEl = document.getElementById("plansStatus");
  var listEl = document.getElementById("plansList");
  var btnSave = document.getElementById("btnSavePlans");
  var btnAdd = document.getElementById("btnAddPlan");

  function setStatus(msg, kind) {
    if (!statusEl) return;
    statusEl.textContent = msg || "";
    statusEl.className = "subplans-status" + (kind ? " is-" + kind : "");
  }

  function authHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    };
  }

  function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value : "";
  }

  function setVal(id, value) {
    var el = document.getElementById(id);
    if (el) el.value = value == null ? "" : String(value);
  }

  function emptyPlan() {
    return {
      id: "",
      name: "Nouvelle offre",
      tagline: "",
      badge: "",
      priceMonthly: 0,
      priceYearly: 0,
      ctaLabel: "Choisir",
      ctaMode: "checkout",
      ctaUrl: "",
      features: [],
      highlighted: false,
      enabled: true,
      sortOrder: (plans.length + 1) * 10,
      trialDays: 0,
      stripePriceIdMonthly: "",
      stripePriceIdYearly: "",
      entitlements: { contactsPerMonth: 0, tourViews: 0, modules: [] },
    };
  }

  function escapeAttr(value) {
    return String(value == null ? "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function field(label, key, value, index, wide, type) {
    return (
      "<label" +
      (wide ? ' class="wide"' : "") +
      ">" +
      label +
      '<input class="crm-input" data-index="' +
      index +
      '" data-key="' +
      key +
      '" type="' +
      (type || "text") +
      '" value="' +
      escapeAttr(value) +
      '" /></label>'
    );
  }

  function selectField(label, key, value, index, options) {
    var opts = options
      .map(function (o) {
        return (
          '<option value="' +
          o[0] +
          '"' +
          (o[0] === value ? " selected" : "") +
          ">" +
          o[1] +
          "</option>"
        );
      })
      .join("");
    return (
      "<label>" +
      label +
      '<select class="crm-input" data-index="' +
      index +
      '" data-key="' +
      key +
      '">' +
      opts +
      "</select></label>"
    );
  }

  function render() {
    if (!listEl) return;
    listEl.innerHTML = plans
      .map(function (plan, index) {
        return (
          '<article class="subplan-card' +
          (plan.enabled ? "" : " is-off") +
          '">' +
          '<div class="subplan-grid">' +
          field("ID", "id", plan.id, index) +
          field("Nom", "name", plan.name, index) +
          field("Badge", "badge", plan.badge, index) +
          field("Accroche", "tagline", plan.tagline, index, true) +
          field("Prix mensuel €", "priceMonthly", plan.priceMonthly, index, false, "number") +
          field("Prix annuel €", "priceYearly", plan.priceYearly, index, false, "number") +
          field("Libellé CTA", "ctaLabel", plan.ctaLabel, index) +
          selectField("Mode CTA", "ctaMode", plan.ctaMode, index, [
            ["checkout", "Checkout Stripe"],
            ["link", "Lien"],
            ["contact", "Contact"],
            ["disabled", "Désactivé"],
          ]) +
          field("URL CTA", "ctaUrl", plan.ctaUrl, index, true) +
          field("Essai (jours)", "trialDays", plan.trialDays, index, false, "number") +
          field("Ordre", "sortOrder", plan.sortOrder, index, false, "number") +
          field("Stripe Price mensuel", "stripePriceIdMonthly", plan.stripePriceIdMonthly, index) +
          field("Stripe Price annuel", "stripePriceIdYearly", plan.stripePriceIdYearly, index) +
          '<label class="wide">Features (1 par ligne)<textarea data-index="' +
          index +
          '" data-key="features">' +
          (plan.features || []).join("\n") +
          "</textarea></label>" +
          "</div>" +
          '<div class="subplan-actions">' +
          '<label><input type="checkbox" data-index="' +
          index +
          '" data-key="enabled"' +
          (plan.enabled ? " checked" : "") +
          " /> Active</label>" +
          '<label><input type="checkbox" data-index="' +
          index +
          '" data-key="highlighted"' +
          (plan.highlighted ? " checked" : "") +
          " /> Mise en avant</label>" +
          '<button type="button" class="btn btn-ghost" data-remove="' +
          index +
          '">Supprimer</button>' +
          "</div></article>"
        );
      })
      .join("");
  }

  function readDomIntoPlans() {
    if (!listEl) return;
    listEl.querySelectorAll("[data-index][data-key]").forEach(function (el) {
      var index = Number(el.getAttribute("data-index"));
      var key = el.getAttribute("data-key");
      if (!plans[index]) return;
      if (el.type === "checkbox") {
        plans[index][key] = !!el.checked;
        return;
      }
      if (key === "features") {
        plans[index].features = String(el.value || "")
          .split("\n")
          .map(function (s) {
            return s.trim();
          })
          .filter(Boolean);
        return;
      }
      if (el.type === "number") {
        plans[index][key] = Number(el.value || 0);
        return;
      }
      plans[index][key] = el.value;
    });
  }

  function collectConfig() {
    readDomIntoPlans();
    return {
      pageTitle: getVal("cfgPageTitle"),
      pageSubtitle: getVal("cfgPageSubtitle"),
      currency: "eur",
      billingToggle: !!(document.getElementById("cfgBillingToggle") && document.getElementById("cfgBillingToggle").checked),
      defaultInterval: getVal("cfgDefaultInterval") || "month",
      contactUrl: getVal("cfgContactUrl"),
      successPath: getVal("cfgSuccessPath"),
      cancelPath: getVal("cfgCancelPath"),
      footnote: getVal("cfgFootnote"),
      plans: plans,
    };
  }

  function load() {
    setStatus("Chargement…");
    fetch("/api/crm/subscription-plans", { headers: authHeaders() })
      .then(function (r) {
        return r.json().then(function (data) {
          return { ok: r.ok, status: r.status, data: data };
        });
      })
      .then(function (res) {
        if (res.status === 401) {
          location.href = "./crm.html";
          return;
        }
        if (!res.ok) throw new Error((res.data && res.data.error) || "Chargement impossible");
        canEdit = !!res.data.canEdit;
        var cfg = res.data.config || {};
        setVal("cfgPageTitle", cfg.pageTitle);
        setVal("cfgPageSubtitle", cfg.pageSubtitle);
        setVal("cfgContactUrl", cfg.contactUrl);
        setVal("cfgSuccessPath", cfg.successPath);
        setVal("cfgCancelPath", cfg.cancelPath);
        setVal("cfgFootnote", cfg.footnote);
        setVal("cfgDefaultInterval", cfg.defaultInterval || "month");
        var toggle = document.getElementById("cfgBillingToggle");
        if (toggle) toggle.checked = cfg.billingToggle !== false;
        plans = Array.isArray(cfg.plans) ? cfg.plans.slice() : [];
        render();
        if (btnSave) btnSave.disabled = !canEdit;
        if (btnAdd) btnAdd.disabled = !canEdit;
        setStatus(
          canEdit
            ? "Prêt — " + plans.length + " formule(s). Page : /abonnements/"
            : "Lecture seule (admin requis pour modifier).",
          "ok"
        );
      })
      .catch(function (err) {
        setStatus(err.message || "Erreur", "error");
      });
  }

  function save() {
    if (!canEdit) return;
    setStatus("Enregistrement…");
    fetch("/api/crm/subscription-plans", {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ config: collectConfig() }),
    })
      .then(function (r) {
        return r.json().then(function (data) {
          return { ok: r.ok, data: data };
        });
      })
      .then(function (res) {
        if (!res.ok) throw new Error((res.data && res.data.error) || "Échec enregistrement");
        plans = (res.data.config && res.data.config.plans) || plans;
        render();
        setStatus("Formules enregistrées. Visible sur /abonnements/", "ok");
      })
      .catch(function (err) {
        setStatus(err.message || "Erreur", "error");
      });
  }

  if (btnAdd) {
    btnAdd.addEventListener("click", function () {
      if (!canEdit) return;
      readDomIntoPlans();
      plans.push(emptyPlan());
      render();
    });
  }
  if (btnSave) btnSave.addEventListener("click", save);

  if (listEl) {
    listEl.addEventListener("click", function (ev) {
      var btn = ev.target.closest("[data-remove]");
      if (!btn || !canEdit) return;
      readDomIntoPlans();
      var index = Number(btn.getAttribute("data-remove"));
      plans.splice(index, 1);
      render();
    });
  }

  load();
})();
