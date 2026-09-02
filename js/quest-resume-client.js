/**
 * Reprise questionnaire via lien personnel (?qr=) : confirmation e-mail ou téléphone.
 */
(function (global) {
  function getToken() {
    try {
      return new URLSearchParams(window.location.search).get("qr") || "";
    } catch (e) {
      return "";
    }
  }

  function ensureStyles() {
    if (document.getElementById("lo-quest-resume-css")) return;
    var s = document.createElement("style");
    s.id = "lo-quest-resume-css";
    s.textContent =
      ".lo-qr-overlay{position:fixed;inset:0;z-index:9999;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:16px}" +
      ".lo-qr-card{background:#fff;border-radius:14px;max-width:420px;width:100%;padding:22px 20px;box-shadow:0 18px 50px rgba(15,23,42,.25);font-family:Inter,system-ui,sans-serif}" +
      ".lo-qr-card h2{margin:0 0 8px;font-size:1.15rem;color:#0f766e}" +
      ".lo-qr-card p{margin:0 0 12px;color:#475569;font-size:.92rem;line-height:1.45}" +
      ".lo-qr-card label{display:block;font-weight:700;font-size:.8rem;margin:8px 0 4px;color:#334155}" +
      ".lo-qr-card input{width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:1rem}" +
      ".lo-qr-err{color:#b91c1c;font-size:.85rem;min-height:1.2em}" +
      ".lo-qr-actions{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}" +
      ".lo-qr-actions button{border:0;border-radius:8px;padding:10px 14px;font-weight:700;cursor:pointer}" +
      ".lo-qr-actions .primary{background:#0d9488;color:#fff}" +
      ".lo-qr-actions .ghost{background:#f1f5f9;color:#334155}";
    document.head.appendChild(s);
  }

  function findForm() {
    return (
      document.querySelector("[data-quote-wizard]") ||
      document.querySelector("[data-listing-url-capture]") ||
      document.querySelector("form[data-track-form]") ||
      document.querySelector("#devisForm") ||
      document.querySelector("form")
    );
  }

  function applyPayload(data) {
    try {
      if (data.leadId && global.QuoteIntelligence && global.QuoteIntelligence.setDraftLeadId) {
        global.QuoteIntelligence.setDraftLeadId(data.leadId);
      }
      if (data.contactId) localStorage.setItem("lo_draft_contact_id", data.contactId);
      if (data.leadId) {
        localStorage.setItem("lo_draft_lead_id", data.leadId);
        localStorage.setItem("lo_immo_deposit_lead_id", data.leadId);
      }
    } catch (e) {}

    var form = findForm();
    var values = {};
    var payload = data.payload || {};
    if (payload.questionnaireDraft && typeof payload.questionnaireDraft === "object") {
      Object.assign(values, payload.questionnaireDraft);
    }
    Object.keys(payload).forEach(function (k) {
      var v = payload[k];
      if (v == null || typeof v === "object") return;
      if (values[k] == null || values[k] === "") values[k] = v;
    });
    ["email", "phone", "firstName", "lastName"].forEach(function (k) {
      if (data[k] && (values[k] == null || values[k] === "")) values[k] = data[k];
    });
    if (form && global.QuoteIntelligence && global.QuoteIntelligence.applyPartialToForm) {
      global.QuoteIntelligence.applyPartialToForm(form, values);
    }

    if (data.draft && global.AcheteurImmoDepositGuide && global.AcheteurImmoDepositGuide.tryRestoreFromServer) {
      var root = document.querySelector("[data-listing-url-capture]") || form;
      if (data.leadId && global.AcheteurImmoDepositGuide.rememberLeadId) {
        /* rememberLeadId may not be exported — localStorage already set */
      }
      global.AcheteurImmoDepositGuide.tryRestoreFromServer(root, {
        silent: false,
        creds: { leadId: data.leadId, email: data.email, phone: data.phone },
      });
    }
  }

  function showGate(token) {
    ensureStyles();
    var overlay = document.createElement("div");
    overlay.className = "lo-qr-overlay";
    overlay.innerHTML =
      '<div class="lo-qr-card" role="dialog" aria-modal="true" aria-labelledby="loQrTitle">' +
      '<h2 id="loQrTitle">Confirmez votre identité</h2>' +
      "<p>Ce lien est personnel. Saisissez l’<strong>e-mail</strong> ou le <strong>téléphone</strong> du dossier pour éviter d’ouvrir le questionnaire d’un autre client.</p>" +
      '<label for="loQrEmail">E-mail</label>' +
      '<input id="loQrEmail" type="email" autocomplete="email" placeholder="ex. marie@dupont.fr" />' +
      '<label for="loQrPhone">Téléphone</label>' +
      '<input id="loQrPhone" type="tel" autocomplete="tel" placeholder="ex. 06 12 34 56 78" />' +
      '<p class="lo-qr-err" data-qr-err></p>' +
      '<div class="lo-qr-actions">' +
      '<button type="button" class="primary" data-qr-ok>Ouvrir mon dossier</button>' +
      '<button type="button" class="ghost" data-qr-cancel>Annuler</button>' +
      "</div></div>";
    document.body.appendChild(overlay);
    var errEl = overlay.querySelector("[data-qr-err]");
    overlay.querySelector("[data-qr-cancel]").addEventListener("click", function () {
      overlay.remove();
    });
    overlay.querySelector("[data-qr-ok]").addEventListener("click", function () {
      var email = overlay.querySelector("#loQrEmail").value.trim();
      var phone = overlay.querySelector("#loQrPhone").value.trim();
      if (!email && !phone) {
        errEl.textContent = "Indiquez l’e-mail ou le téléphone du dossier.";
        return;
      }
      errEl.textContent = "Vérification…";
      fetch("/api/external/quest-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ token: token, email: email || null, phone: phone || null }),
      })
        .then(function (r) {
          return r.json().then(function (data) {
            return { ok: r.ok, data: data };
          });
        })
        .then(function (res) {
          if (!res.ok || !res.data || !res.data.ok) {
            throw new Error((res.data && res.data.error) || "Vérification refusée");
          }
          overlay.remove();
          applyPayload(res.data);
        })
        .catch(function (e) {
          errEl.textContent = e.message || "Vérification impossible.";
        });
    });
  }

  function boot() {
    var token = getToken();
    if (!token) return;
    showGate(token);
  }

  global.QuestResumeClient = { boot: boot, getToken: getToken };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : this);
