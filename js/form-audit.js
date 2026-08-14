/**
 * Contrôle admin des formulaires : barre toujours visible pour un compte admin.
 * Case cochée = parcourir sans remplir (envoi bloqué).
 * Case décochée = validation réelle et création d’un lead de test.
 *
 * Activation barre : compte admin (lo_user), ?audit=1
 * Préférence : localStorage lo_form_audit = 1 | 0
 */
(function () {
  var STORAGE_KEY = "lo_form_audit";

  function isAdminUser() {
    try {
      var u = JSON.parse(localStorage.getItem("lo_user") || "{}");
      return u.role === "admin";
    } catch (e) {
      return false;
    }
  }

  function canUseAudit() {
    if (isAdminUser()) return true;
    return new URLSearchParams(window.location.search).get("audit") === "1";
  }

  function auditEnabledByDefault() {
    var params = new URLSearchParams(window.location.search);
    if (params.get("audit") === "1") return true;
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function setAuditPreference(on) {
    try {
      localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
    } catch (e) {}
  }

  function fieldRules(el) {
    var tags = [];
    var name = (el.name || "").trim();
    var type = (el.type || "").toLowerCase();
    var tag = el.tagName;

    if (el.hasAttribute("data-optional")) {
      tags.push({ kind: "optional", text: "Facultatif" });
    } else if (el.hasAttribute("required") || el.getAttribute("aria-required") === "true") {
      if (type === "checkbox" || type === "radio") {
        tags.push({ kind: "choice", text: "Choix obligatoire" });
      } else if (tag === "SELECT") {
        tags.push({ kind: "choice", text: "Choix obligatoire" });
      } else {
        tags.push({ kind: "required", text: "Obligatoire" });
      }
    }

    if (type === "email") tags.push({ kind: "rule", text: "Format @email" });
    if (type === "tel" || name === "phone" || name === "mobile") {
      tags.push({ kind: "rule", text: "Téléphone" });
    }
    if (name === "postalCode" || name === "postalProject") {
      tags.push({ kind: "rule", text: "CP 5 chiffres" });
    }
    if (name === "companySiret") {
      tags.push({ kind: "rule", text: "SIRET 14 chiffres" });
    }
    if (type === "date" || name.indexOf("Dob") !== -1 || name.indexOf("Birth") !== -1) {
      tags.push({ kind: "rule", text: "Date valide" });
    }
    if (name === "petChipNumber") {
      tags.push({ kind: "rule", text: "Puce 15 chiffres (si renseigné)" });
    }
    if (el.pattern) {
      tags.push({ kind: "rule", text: "Pattern HTML" });
    }
    if (el.minLength > 0) {
      tags.push({ kind: "rule", text: "Min. " + el.minLength + " car." });
    }
    if (el.maxLength > 0 && el.maxLength < 500) {
      tags.push({ kind: "rule", text: "Max. " + el.maxLength + " car." });
    }

    return tags;
  }

  function renderTags(tags) {
    if (!tags.length) return "";
    var seen = {};
    var html = '<span class="audit-tag">';
    tags.forEach(function (t) {
      var key = t.kind + ":" + t.text;
      if (seen[key]) return;
      seen[key] = true;
      html += '<span class="audit-tag--' + t.kind + '">' + t.text + "</span>";
    });
    html += "</span>";
    return html;
  }

  function annotateForm(form) {
    var fields = form.querySelectorAll("input, select, textarea");
    fields.forEach(function (el) {
      if (el.disabled || el.type === "button" || el.type === "submit" || el.type === "hidden") return;
      if (el.name === "_hp" || el.id === "hp_q") return;

      var label = form.querySelector('label[for="' + el.id + '"]');
      if (!label) {
        label = el.closest("label");
      }
      if (!label) return;

      label.classList.add("form-audit-field");
      var existing = label.querySelector(".audit-tag");
      if (existing) existing.remove();

      var tags = fieldRules(el);
      if (!tags.length) return;
      label.insertAdjacentHTML("beforeend", renderTags(tags));
    });
  }

  function fieldLabelText(el) {
    var lbl = el.closest("label");
    if (lbl) {
      var clone = lbl.cloneNode(true);
      clone.querySelectorAll("input, select, textarea, .audit-tag").forEach(function (n) {
        n.remove();
      });
      var t = (clone.textContent || "").replace(/\s+/g, " ").trim();
      if (t) return t.slice(0, 80);
    }
    if (el.id) {
      var forLbl = el.form && el.form.querySelector('label[for="' + el.id + '"]');
      if (forLbl) {
        var ft = (forLbl.textContent || "").replace(/\s+/g, " ").trim();
        if (ft) return ft.slice(0, 80);
      }
    }
    var fs = el.closest("fieldset");
    if (fs) {
      var legend = fs.querySelector("legend");
      if (legend) {
        var lt = (legend.textContent || "").replace(/\s+/g, " ").trim();
        if (lt) return lt.slice(0, 80);
      }
    }
    return "";
  }

  function buildStepPanel(form, step, index) {
    var title = step.querySelector("h3");
    var name =
      step.getAttribute("data-step-name") ||
      step.getAttribute("data-step") ||
      "Étape " + (index + 1);
    var seenGroups = {};
    var inputs = [];
    step.querySelectorAll("input, select, textarea").forEach(function (el) {
      if (el.disabled || el.type === "hidden" || el.type === "submit" || el.type === "button") return;
      if (el.name === "_hp") return;

      // Cases à cocher / radios : une seule ligne par groupe, libellés humains
      if ((el.type === "checkbox" || el.type === "radio") && el.name) {
        if (seenGroups[el.name]) return;
        seenGroups[el.name] = true;
        var opts = [];
        step.querySelectorAll('input[name="' + el.name + '"]').forEach(function (cb) {
          var ot = fieldLabelText(cb) || cb.value;
          if (ot && opts.indexOf(ot) === -1) opts.push(ot);
        });
        var rules = fieldRules(el)
          .map(function (t) {
            return t.text;
          })
          .join(" · ");
        var legend = el.closest("fieldset") && el.closest("fieldset").querySelector("legend");
        var legendText = legend ? (legend.textContent || "").replace(/\s+/g, " ").trim() : "";
        var groupTitle =
          legendText ||
          (el.name === "buyerNeeds" ? "Besoins sélectionnés" : fieldLabelText(el) || el.name);
        inputs.push(
          "<li><strong>" +
            groupTitle +
            "</strong>" +
            (rules ? " — " + rules : "") +
            (opts.length ? "<br><span class='muted'>" + opts.join(" · ") + "</span>" : "") +
            "</li>"
        );
        return;
      }

      var labelText = fieldLabelText(el) || el.name || el.id || "Champ";
      var rules = fieldRules(el)
        .map(function (t) {
          return t.text;
        })
        .join(" · ");
      inputs.push("<li><strong>" + labelText + "</strong>" + (rules ? " — " + rules : "") + "</li>");
    });
    return (
      "<h4>" +
      (title ? title.textContent : name) +
      "</h4><ul>" +
      (inputs.length ? inputs.join("") : "<li class='muted'>Aucun champ saisissable</li>") +
      "</ul>"
    );
  }

  function getWizardSteps(form) {
    return Array.prototype.slice.call(form.querySelectorAll(".wizard-step"));
  }

  function goToWizardStep(form, index) {
    var steps = getWizardSteps(form);
    if (!steps.length) return;
    var i = Math.max(0, Math.min(index, steps.length - 1));
    try {
      form.dispatchEvent(
        new CustomEvent("lo-audit-goto", { bubbles: false, detail: { index: i } })
      );
    } catch (e) {
      steps.forEach(function (s, j) {
        s.hidden = j !== i;
      });
    }
    refreshStepUi(form, i);
  }

  function refreshStepUi(form, index) {
    var steps = getWizardSteps(form);
    if (!steps.length) return;
    var i = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach(function (s, j) {
      s.classList.toggle("form-audit-step-active", j === i);
    });
    var bar = form._auditBar;
    var panel = form.querySelector("[data-audit-step-summary]");
    if (bar) {
      var sel = bar.querySelector("[data-audit-step-select]");
      if (sel) sel.value = String(i);
    }
    if (panel) panel.innerHTML = buildStepPanel(form, steps[i], i);
    form.dataset.auditStep = String(i + 1);
  }

  function auditFormSelector() {
    return "form[data-quote-wizard], form[data-pet-journey-form], form[data-track-form], form[data-quick-devis]";
  }

  function allAuditForms() {
    return document.querySelectorAll(auditFormSelector());
  }

  function ensureRealHint(form) {
    var hint = form.querySelector("[data-audit-real-hint]");
    if (hint) return hint;
    hint = document.createElement("p");
    hint.setAttribute("data-audit-real-hint", "");
    hint.className = "form-audit-real-hint";
    hint.hidden = true;
    var actions = form.querySelector(".wizard-actions");
    if (actions && actions.parentNode) {
      actions.parentNode.insertBefore(hint, actions);
    } else {
      form.insertBefore(hint, form.firstChild);
    }
    return hint;
  }

  function applyModeToForms(checked) {
    allAuditForms().forEach(function (form) {
      form.dataset.auditMode = checked ? "1" : "0";
      var blocked = form.querySelector("[data-audit-submit-hint]");
      if (blocked) blocked.hidden = !checked;
      var real = ensureRealHint(form);
      real.hidden = checked;
      real.textContent = checked
        ? ""
        : "Mode test réel : remplissez les champs obligatoires à chaque étape, puis envoyez. Un lead sera créé (page Leads formulaires + messagerie).";
    });
    document.body.classList.toggle("form-audit-active", true);
    document.body.classList.toggle("form-audit-skip", checked);
    document.body.classList.toggle("form-audit-real", !checked);
  }

  function mountToolbar(form, startOn) {
    var existing = document.getElementById("formAuditBar");
    if (existing) {
      form._auditBar = existing;
      applyModeToForms(startOn);
      return;
    }
    var steps = getWizardSteps(form);
    var bar = document.createElement("div");
    bar.id = "formAuditBar";
    bar.className = "form-audit-bar";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Contrôle admin formulaire");

    var stepOptions = steps
      .map(function (s, i) {
        var n =
          s.getAttribute("data-step-name") ||
          s.getAttribute("data-step") ||
          "étape " + (i + 1);
        var h = s.querySelector("h3");
        var label = i + 1 + ". " + n + (h ? " — " + h.textContent : "");
        return '<option value="' + i + '">' + label + "</option>";
      })
      .join("");

    bar.innerHTML =
      "<strong>Contrôle admin</strong>" +
      '<label class="form-audit-toggle"><input type="checkbox" data-audit-active /> Mode contrôle (sans remplir)</label>' +
      '<span class="form-audit-status" data-audit-status></span>' +
      (steps.length
        ? '<label>Aller à <select data-audit-step-select>' + stepOptions + "</select></label>" +
          '<button type="button" data-audit-prev>◀ Étape</button>' +
          '<button type="button" data-audit-next>Étape ▶</button>' +
          '<label class="form-audit-toggle"><input type="checkbox" data-audit-show-fields /> Liste des champs</label>'
        : "") +
      '<div class="form-audit-legend">' +
      '<span class="audit-tag--required">Obligatoire</span>' +
      '<span class="audit-tag--choice">Choix obligatoire</span>' +
      '<span class="audit-tag--rule">Règle</span>' +
      '<span class="audit-tag--optional">Facultatif</span>' +
      "</div>";

    document.body.insertBefore(bar, document.body.firstChild);
    form._auditBar = bar;

    var panel = document.createElement("div");
    panel.className = "form-audit-step-panel";
    panel.setAttribute("data-audit-step-summary", "");
    panel.hidden = true;
    var mount = form.querySelector("#wizardStepsMount") || form.querySelector("[data-pet-journey]") || form.firstElementChild;
    if (mount && mount.parentNode) {
      mount.parentNode.insertBefore(panel, mount);
    } else {
      form.insertBefore(panel, form.firstChild);
    }

    function syncActive(checked) {
      applyModeToForms(checked);
      setAuditPreference(checked);
      var showFields = bar.querySelector("[data-audit-show-fields]");
      panel.hidden = !checked || !(showFields && showFields.checked);
      var status = bar.querySelector("[data-audit-status]");
      if (status) {
        status.textContent = checked
          ? "Parcours libre · envoi de lead bloqué"
          : "Validation réelle · l’envoi crée un lead";
      }
    }

    var toggle = bar.querySelector("[data-audit-active]");
    toggle.checked = !!startOn;
    toggle.addEventListener("change", function () {
      syncActive(toggle.checked);
    });
    var showFields = bar.querySelector("[data-audit-show-fields]");
    if (showFields) {
      showFields.addEventListener("change", function () {
        panel.hidden = !toggle.checked || !showFields.checked;
      });
    }
    syncActive(toggle.checked);

    if (steps.length) {
      var sel = bar.querySelector("[data-audit-step-select]");
      sel.addEventListener("change", function () {
        goToWizardStep(form, parseInt(sel.value, 10));
      });
      bar.querySelector("[data-audit-prev]").addEventListener("click", function () {
        var cur = parseInt(form.dataset.auditStep || "1", 10) - 1;
        goToWizardStep(form, cur - 1);
      });
      bar.querySelector("[data-audit-next]").addEventListener("click", function () {
        var cur = parseInt(form.dataset.auditStep || "1", 10) - 1;
        goToWizardStep(form, cur + 1);
      });
      goToWizardStep(form, 0);
    }

    panel.innerHTML = steps.length ? buildStepPanel(form, steps[0], 0) : "";

    form.addEventListener("lo:wizard_step", function () {
      var cur = parseInt(form.dataset.currentStep || "1", 10) - 1;
      refreshStepUi(form, cur);
      if (bar) {
        var sel = bar.querySelector("[data-audit-step-select]");
        if (sel) sel.value = String(cur);
      }
    });
  }

  function initForm(form, forceOn) {
    if (!canUseAudit()) return;
    annotateForm(form);
    var on = forceOn === true ? true : forceOn === false ? false : auditEnabledByDefault();
    mountToolbar(form, on);
  }

  function initAll(forceOn) {
    var forms = allAuditForms();
    if (!forms.length) return;
    Array.prototype.forEach.call(forms, function (form) {
      initForm(form, forceOn);
    });
  }

  function skipValidation(form) {
    return !!(form && form.dataset.auditMode === "1");
  }

  window.FormAudit = {
    canUseAudit: canUseAudit,
    isAdminUser: isAdminUser,
    skipValidation: skipValidation,
    isActive: skipValidation,
    refresh: function () {
      initAll(true);
    },
  };

  document.addEventListener(
    "submit",
    function (e) {
      var form = e.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (!skipValidation(form)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      var msg = form.querySelector("[data-audit-submit-hint]");
      if (!msg) {
        msg = document.createElement("p");
        msg.setAttribute("data-audit-submit-hint", "");
        msg.className = "form-audit-step-panel form-audit-blocked";
        var actions = form.querySelector(".wizard-actions");
        if (actions && actions.parentNode) actions.parentNode.insertBefore(msg, actions);
        else form.appendChild(msg);
      }
      msg.hidden = false;
      msg.textContent =
        "Mode contrôle actif : décochez « Mode contrôle (sans remplir) » dans la barre en haut, remplissez les champs, puis renvoyez pour créer un vrai lead.";
      msg.scrollIntoView({ behavior: "smooth", block: "nearest" });
    },
    true
  );

  document.addEventListener("DOMContentLoaded", function () {
    if (!canUseAudit()) return;
    if (!allAuditForms().length) return;
    setTimeout(function () {
      initAll();
    }, 0);
  });
})();
