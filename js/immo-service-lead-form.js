/**
 * Formulaire lead location / syndic — POST /api/lead + stockage local.
 */
(function (global) {
  var ROLE_ALIASES = {
    locataire: "locataire",
    tenant: "locataire",
    loc: "locataire",
    bailleur: "bailleur",
    landlord: "bailleur",
    proprio: "gestion",
    proprietaire: "gestion",
    "propriétaire": "gestion",
    owner: "gestion",
    gestion: "gestion",
    gestionnaire: "gestion",
  };

  var SUJET_TO_NEED = {
    irl: "revision_irl",
    revision: "revision_irl",
    "revision-loyer": "revision_irl",
    "revision_loyer": "revision_irl",
    coloc: "colocation",
    colocation: "colocation",
    quittance: "quittances",
    quittances: "quittances",
    conge: "conge",
    conges: "conge",
    preavis: "conge",
    "conge-locataire": "conge",
    "conge-bailleur": "conge",
    "conge-commercial": "conge",
    "par-locataire": "conge",
    "par-le-locataire": "conge",
    "par-bailleur": "conge",
    "par-le-bailleur": "conge",
    "donne-par-locataire": "conge",
    "donne-par-bailleur": "conge",
    preneur: "conge",
    travaux: "travaux",
    visites: "visites",
    acces: "visites",
    locaux: "visites",
    "mise-a-disposition": "visites",
    droits: "visites",
    depot: "depot_garantie",
    dg: "depot_garantie",
    garantie: "depot_garantie",
    vetuste: "depot_garantie",
    cles: "depot_garantie",
    restitution: "depot_garantie",
    provision: "depot_garantie",
    annexes: "annexes",
    pieces: "annexes",
    bail: "annexes",
    "bail-commercial": "annexes",
    meuble: "fiscalite",
    fiscalite: "fiscalite",
    tva: "fiscalite",
    taxes: "fiscalite",
    impot: "fiscalite",
    lmnp: "fiscalite",
    commercial: "fiscalite",
    demeure: "mise_en_demeure",
    "mise-en-demeure": "mise_en_demeure",
    retard: "mise_en_demeure",
    interets: "mise_en_demeure",
    impaye: "impayes",
    impayes: "impayes",
    edl: "etat_des_lieux",
    "etat-des-lieux": "etat_des_lieux",
    encadrement: "encadrement",
    pno: "pno_gli",
    gli: "pno_gli",
    "pno-gli": "pno_gli",
  };

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

  function asList(v) {
    if (v == null || v === "") return "";
    return Array.isArray(v) ? v.filter(Boolean).join(", ") : String(v);
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

  function panelMatches(want, role) {
    if (!want || want === "all") return true;
    return want
      .split(",")
      .map(function (s) {
        return s.trim();
      })
      .indexOf(role) !== -1;
  }

  function syncRolePanels(root) {
    var roleEl = root.querySelector('input[name="locationRole"]:checked');
    var role = roleEl ? roleEl.value : "";
    root.querySelectorAll("[data-role-panel]").forEach(function (panel) {
      var want = panel.getAttribute("data-role-panel");
      panel.hidden = !panelMatches(want, role);
    });
    var needInput = root.querySelector('input[name="need"]');
    if (needInput && needInput.getAttribute("data-need-fixed") !== "syndic") {
      needInput.value = "location";
    }
  }

  function syncColocPanels(root) {
    var colocEl = root.querySelector('[name="locationColoc"]');
    var on = colocEl && String(colocEl.value) === "oui";
    root.querySelectorAll("[data-coloc-panel]").forEach(function (panel) {
      panel.hidden = !on;
    });
  }

  function setRole(root, role) {
    var mapped = ROLE_ALIASES[String(role || "").toLowerCase()] || "";
    if (!mapped) return;
    var radio = root.querySelector('input[name="locationRole"][value="' + mapped + '"]');
    if (radio) {
      radio.checked = true;
      radio.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  function applyRoleFromUrl(root) {
    var q = new URLSearchParams(global.location.search);
    var ville = q.get("ville") || "";
    if (ville) {
      root.querySelectorAll("[data-immo-city]").forEach(function (el) {
        if (!el.value) el.value = ville;
      });
    }
    var role = q.get("role") || "";
    var sujet = String(q.get("sujet") || "").toLowerCase();
    if (!role && sujet && SUJET_TO_NEED[sujet]) role = "gestion";
    if (role) setRole(root, role);
    var syndic = root.querySelector('select[name="syndicRequest"]');
    if (syndic && !syndic.value && role) syndic.value = role;
  }

  function syncNoticePanels(root) {
    var kindEl = root.querySelector('[name="locationNoticeKind"]');
    var kind = kindEl ? kindEl.value : "";
    var roleEl = root.querySelector('input[name="locationRole"]:checked');
    var role = roleEl ? roleEl.value : "";
    root.querySelectorAll("[data-notice-panel]").forEach(function (panel) {
      var want = panel.getAttribute("data-notice-panel");
      var roleWant = panel.getAttribute("data-role-panel");
      var kindOk = panelMatches(want, kind);
      var roleOk = !roleWant || panelMatches(roleWant, role);
      panel.hidden = !(kindOk && roleOk);
    });
  }

    var KIND_TO_AUTEUR = {
      conge_locataire: "locataire",
      conge_bailleur: "bailleur",
      conge_commercial: "commercial",
    };
    var AUTEUR_TO_KIND = {
      locataire: "conge_locataire",
      bailleur: "conge_bailleur",
      commercial: "conge_commercial",
    };

    function applySujetFromUrl(root) {
    var sujet = String(new URLSearchParams(global.location.search).get("sujet") || "").toLowerCase();
    if (!sujet) return;
    var need = SUJET_TO_NEED[sujet];
    if (need) {
      var box = root.querySelector('input[name="locationGestionNeed"][value="' + need + '"]');
      if (box) box.checked = true;
    }
    if (need === "colocation") {
      var coloc = root.querySelector('[name="locationColoc"]');
      if (coloc) coloc.value = "oui";
      var typeEl = root.querySelector('[name="locationType"]');
      if (typeEl && (!typeEl.value || typeEl.value === "appartement")) typeEl.value = "colocation";
    }
    var Droits = global.LocationDroits;
    var notice = Droits && Droits.kindFromSujet ? Droits.kindFromSujet(sujet) : "";
    if (notice) {
      var noticeEl = root.querySelector('[name="locationNoticeKind"]');
      if (noticeEl) noticeEl.value = notice;
      document.querySelectorAll("[data-droits-kind]").forEach(function (el) {
        el.value = notice;
        el.dispatchEvent(new Event("change", { bubbles: true }));
      });
      var auteurEl = root.querySelector('[name="locationCongeAuteur"]');
      if (auteurEl && KIND_TO_AUTEUR[notice]) auteurEl.value = KIND_TO_AUTEUR[notice];
    }
    syncColocPanels(root);
    syncNoticePanels(root);
    var scrollId = "";
    if (need === "revision_irl") scrollId = "irl";
    else if (notice || sujet === "droits" || sujet === "travaux") scrollId = "droits";
    if (scrollId && !global.location.hash) {
      var target = document.getElementById(scrollId);
      if (target && typeof target.scrollIntoView === "function") {
        setTimeout(function () {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      }
    }
  }

  function snapshotIrl() {
    var w = document.querySelector("[data-irl-widget]");
    var Irl = global.IrlRevision;
    if (!w || !Irl) return {};
    var rentEl = w.querySelector("[data-irl-rent]");
    var oldEl = w.querySelector("[data-irl-old]");
    var newEl = w.querySelector("[data-irl-new]");
    var rent = rentEl ? rentEl.value : "";
    var oldId = oldEl ? oldEl.value : "";
    var newId = newEl ? newEl.value : "";
    if (!rent) return {};
    var r = Irl.revise(rent, oldId, newId);
    if (!r.ok) return { irlRent: rent, irlOld: oldId, irlNew: newId };
    return {
      irlRent: rent,
      irlOld: oldId,
      irlNew: newId,
      irlNewRent: r.newRent,
      irlDelta: r.delta,
      irlPct: r.pct,
    };
  }

  function shouldAttachIrl(fields) {
    if (fields.locationRole === "gestion") return true;
    var needs = fields.locationGestionNeed;
    var list = Array.isArray(needs) ? needs : needs ? [needs] : [];
    if (list.indexOf("revision_irl") !== -1) return true;
    var sujet = String(new URLSearchParams(global.location.search).get("sujet") || "").toLowerCase();
    return sujet === "irl" || sujet === "revision" || sujet === "revision-loyer" || sujet === "revision_loyer";
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
        syncNoticePanels(root);
      });
    });
    form.querySelectorAll('[name="locationColoc"]').forEach(function (el) {
      el.addEventListener("change", function () {
        syncColocPanels(root);
      });
    });
    form.querySelectorAll('[name="locationNoticeKind"]').forEach(function (el) {
      el.addEventListener("change", function () {
        syncNoticePanels(root);
        var auteurEl = root.querySelector('[name="locationCongeAuteur"]');
        if (auteurEl && KIND_TO_AUTEUR[el.value]) auteurEl.value = KIND_TO_AUTEUR[el.value];
        document.querySelectorAll("[data-droits-kind]").forEach(function (wsel) {
          if (wsel !== el) {
            wsel.value = el.value;
            wsel.dispatchEvent(new Event("change", { bubbles: true }));
          }
        });
      });
    });
    form.querySelectorAll('[name="locationCongeAuteur"]').forEach(function (el) {
      el.addEventListener("change", function () {
        var kind = AUTEUR_TO_KIND[el.value];
        if (!kind) return;
        var noticeEl = root.querySelector('[name="locationNoticeKind"]');
        if (noticeEl) noticeEl.value = kind;
        document.querySelectorAll("[data-droits-kind]").forEach(function (wsel) {
          wsel.value = kind;
          wsel.dispatchEvent(new Event("change", { bubbles: true }));
        });
        syncNoticePanels(root);
      });
    });
    var typeEl = form.querySelector('[name="locationType"]');
    if (typeEl) {
      typeEl.addEventListener("change", function () {
        if (typeEl.value === "colocation") {
          var coloc = form.querySelector('[name="locationColoc"]');
          if (coloc) coloc.value = "oui";
          syncColocPanels(root);
        }
      });
    }
    applyRoleFromUrl(root);
    applySujetFromUrl(root);
    syncRolePanels(root);
    syncColocPanels(root);
    syncNoticePanels(root);

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
      if (fields.locationType) bits.push("Type : " + fields.locationType);
      if (fields.locationBudget) bits.push("Budget : " + fields.locationBudget + " €");
      if (fields.locationRent) bits.push("Loyer : " + fields.locationRent + " €");
      if (fields.locationColoc && fields.locationColoc !== "non") bits.push("Colocation : " + fields.locationColoc);
      if (fields.locationColocCount) bits.push("Colocataires : " + fields.locationColocCount);
      if (fields.locationColocBail) bits.push("Bail coloc : " + fields.locationColocBail);
      if (fields.locationColocCaution) bits.push("Caution : " + fields.locationColocCaution);
      if (fields.locationGestionNeed) bits.push("Gestion : " + asList(fields.locationGestionNeed));
      if (fields.locationNoticeKind) bits.push("Avis : " + fields.locationNoticeKind);
      if (fields.locationCongeAuteur) bits.push("Congé donné par : " + fields.locationCongeAuteur);
      if (fields.locationCongeEcheance) bits.push("Échéance / effet : " + fields.locationCongeEcheance);
      if (fields.locationTravauxJours) bits.push("Durée travaux : " + fields.locationTravauxJours + " j");
      if (fields.locationTravauxNature) bits.push("Travaux : " + fields.locationTravauxNature);
      if (fields.locationDepotMontant) bits.push("Dépôt garantie : " + fields.locationDepotMontant + " €");
      if (fields.locationProvisionCharges) bits.push("Provision charges : " + fields.locationProvisionCharges + " €");
      if (fields.locationClesNb) bits.push("Clés : " + fields.locationClesNb);
      if (fields.locationImpayeMontant) bits.push("Impayé : " + fields.locationImpayeMontant + " €");
      if (fields.syndicRequest) bits.push("Demande syndic : " + fields.syndicRequest);
      if (fields.locationDetails || fields.syndicDetails) {
        bits.push(fields.locationDetails || fields.syndicDetails);
      }

      var irlSnap = shouldAttachIrl(fields) ? snapshotIrl() : {};
      if (irlSnap.irlNewRent) {
        bits.push(
          "IRL : " +
            irlSnap.irlRent +
            " € → " +
            irlSnap.irlNewRent +
            " € (" +
            (Number(irlSnap.irlPct) >= 0 ? "+" : "") +
            String(irlSnap.irlPct).replace(".", ",") +
            " %, " +
            irlSnap.irlOld +
            " → " +
            irlSnap.irlNew +
            ")"
        );
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
        fields,
        irlSnap
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
