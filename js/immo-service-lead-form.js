/**
 * Formulaire lead location / syndic — POST /api/lead + stockage local.
 */
(function (global) {
  function getAttr() {
    if (global.Attribution && typeof global.Attribution.get === "function") {
      try {
        return global.Attribution.get() || {};
      } catch (e) {
        return {};
      }
    }
    return {};
  }

  function getUtmParams() {
    var q = new URLSearchParams(global.location.search);
    var out = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid", "ttclid"].forEach(
      function (k) {
        var v = q.get(k);
        if (v) out[k] = v;
      }
    );
    return out;
  }

  function collect(form) {
    var fd = new FormData(form);
    var o = {};
    fd.forEach(function (v, k) {
      if (Object.prototype.hasOwnProperty.call(o, k)) {
        if (!Array.isArray(o[k])) o[k] = [o[k]];
        o[k].push(v);
      } else {
        o[k] = v;
      }
    });
    return o;
  }

  function postLead(body) {
    return fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(function (r) {
        return r.json().catch(function () {
          return null;
        });
      })
      .catch(function () {
        return null;
      });
  }

  function applyRoleFromUrl(root) {
    var role = new URLSearchParams(global.location.search).get("role") || "";
    var ville = new URLSearchParams(global.location.search).get("ville") || "";
    if (ville) {
      root.querySelectorAll("[data-immo-city]").forEach(function (el) {
        if (!el.value) el.value = ville;
      });
    }
    if (!role) return;
    var radio = root.querySelector('input[name="locationRole"][value="' + role + '"]');
    if (radio) {
      radio.checked = true;
      radio.dispatchEvent(new Event("change", { bubbles: true }));
    }
    var syndic = root.querySelector('select[name="syndicRequest"]');
    if (syndic && !syndic.value && role) syndic.value = role;
  }

  function syncRolePanels(root) {
    var roleEl = root.querySelector('input[name="locationRole"]:checked');
    var role = roleEl ? roleEl.value : "";
    root.querySelectorAll("[data-role-panel]").forEach(function (panel) {
      var want = panel.getAttribute("data-role-panel");
      panel.hidden = want !== "all" && want !== role;
    });
    var needInput = root.querySelector('input[name="need"]');
    if (needInput && needInput.getAttribute("data-need-fixed") !== "syndic") {
      needInput.value = "location";
    }
  }

  function wire(form) {
    if (!form || form._immoServiceWired) return;
    form._immoServiceWired = true;
    var root = form.closest("[data-immo-service-form]") || form;
    var errorEl = root.querySelector("[data-immo-form-error]");
    var successEl = root.querySelector("[data-immo-form-success]");

    form.querySelectorAll('input[name="locationRole"]').forEach(function (r) {
      r.addEventListener("change", function () {
        syncRolePanels(root);
      });
    });
    applyRoleFromUrl(root);
    syncRolePanels(root);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (errorEl) errorEl.hidden = true;

      var fields = collect(form);
      if (fields._hp) return;

      var phone = String(fields.phone || "").replace(/\s/g, "");
      var email = String(fields.email || "").trim();
      if (phone.length < 10 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (errorEl) {
          errorEl.textContent = "Indiquez un téléphone et un e-mail valides.";
          errorEl.hidden = false;
        }
        return;
      }

      var need = fields.need || "location";
      var catalog = global.SERVICE_CATALOG;
      var svc = catalog && catalog.getService ? catalog.getService(need) : null;
      var bits = [];
      if (fields.locationRole) bits.push("Rôle : " + fields.locationRole);
      if (fields.locationCity || fields.syndicCity) bits.push("Ville : " + (fields.locationCity || fields.syndicCity));
      if (fields.locationBudget) bits.push("Budget/loyer : " + fields.locationBudget + " €");
      if (fields.syndicRequest) bits.push("Demande syndic : " + fields.syndicRequest);
      if (fields.locationDetails || fields.syndicDetails) {
        bits.push(fields.locationDetails || fields.syndicDetails);
      }

      var payload = Object.assign(
        {
          source: form.getAttribute("data-lead-source") || "immo_service_landing",
          journey: "landing",
          callbackRequested: true,
          vertical: (svc && svc.vertical) || need,
          serviceNeed: (svc && svc.need) || need,
          serviceLabel: (svc && svc.label) || "",
          serviceCategory: (svc && svc.category) || "finance",
          page: global.location.pathname + global.location.search,
          message: bits.join(" — ") || "Demande immobilier (location / syndic).",
        },
        getUtmParams(),
        getAttr(),
        fields
      );
      delete payload.consent;

      if (typeof global.saveLeadRequest === "function") {
        global.saveLeadRequest(payload);
      }

      var btn = form.querySelector('button[type="submit"]');
      var submitLabel = btn ? btn.textContent : "Envoyer";
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Envoi…";
      }

      postLead(payload).then(function (result) {
        if (global.loTrackingCorrelation && global.loTrackingCorrelation.fireConversion) {
          global.loTrackingCorrelation.fireConversion(result, payload);
        } else if (typeof global.gtag === "function") {
          global.gtag("event", "generate_lead", {
            event_category: "lead_generation",
            event_label: need,
            value: 1,
          });
        }
        global.dispatchEvent(
          new CustomEvent("lo:lead-sent", { detail: { payload: payload, result: result || {} } })
        );

        if (result && result.error === "geo_out_of_scope") {
          if (errorEl) {
            errorEl.textContent = result.message || "Service réservé aux résidents en France.";
            errorEl.hidden = false;
          }
          if (btn) {
            btn.disabled = false;
            btn.textContent = submitLabel;
          }
          return;
        }

        if (result && result.ok) {
          form.hidden = true;
          if (successEl) successEl.hidden = false;
          return;
        }

        if (errorEl) {
          errorEl.textContent = "Envoi impossible pour le moment. Réessayez ou demandez un rappel.";
          errorEl.hidden = false;
        }
        if (btn) {
          btn.disabled = false;
          btn.textContent = submitLabel;
        }
      });
    });
  }

  function boot() {
    document.querySelectorAll("form[data-immo-service-form], [data-immo-service-form] form").forEach(wire);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(typeof window !== "undefined" ? window : global);
