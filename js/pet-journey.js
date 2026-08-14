/**
 * Parcours assurance animaux (3 etapes) — tarifs depuis data/niche-tariffs-animaux.json
 * Montage : <div data-pet-journey></div> dans un <form data-track-form>
 */
(function (global) {
  var CONFIG_URL = "/data/niche-tariffs-animaux.json";
  var state = {
    step: 0,
    config: null,
    pets: [
      {
        type: "Chien",
        name: "",
        breed: "",
        age: "4-7",
        birthDate: "",
        sex: "Mâle",
        identification: "puce",
        chipNumber: "",
        sterilized: "non",
        vaccinated: "oui",
        priorInsurance: "aucune",
        healthHistory: "aucun",
      },
    ],
    effectDate: "",
    formulaId: "zen80",
    franchise: "franchise20",
    prevention: "0",
    fraction: "mensuelle",
  };

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fmtEuro(n) {
    return (Math.round(n * 100) / 100).toFixed(2).replace(".", ",") + " €";
  }

  function ageFactor(cfg, ageKey) {
    return (cfg.ageFactors && cfg.ageFactors[ageKey]) || 1;
  }

  function baseMonthly(cfg, formula, pet) {
    var isChat = pet.type === "Chat";
    return isChat ? formula.minMonthlyChat : formula.minMonthlyChien;
  }

  function petMonthly(cfg, pet, formulaId, opts) {
    opts = opts || {};
    var formula = cfg.formulas.find(function (f) {
      return f.id === formulaId;
    });
    if (!formula) return 0;
    var m =
      baseMonthly(cfg, formula, pet) *
      ageFactor(cfg, pet.age) *
      (opts.fractionFactor || 1);
    var fr = cfg.modifiers[opts.franchise || "franchise20"];
    if (fr) m += fr.monthlyAdd || 0;
    var prev = cfg.modifiers.prevention[opts.prevention || "0"];
    if (prev) m += prev.monthlyAdd || 0;
    return Math.max(0, m);
  }

  function computeTotal(cfg) {
    var frac = cfg.modifiers.fraction[state.fraction] || { factor: 1 };
    var total = 0;
    state.pets.forEach(function (pet, i) {
      var m = petMonthly(cfg, pet, state.formulaId, {
        franchise: state.franchise,
        prevention: state.prevention,
        fractionFactor: frac.factor,
      });
      if (i === 1) m *= 1 - (cfg.multiPetDiscountPercent || 0) / 100;
      total += m;
    });
    return total;
  }

  function teaserPrice(cfg, teaser) {
    if (teaser.overrideFrom != null) return teaser.overrideFrom;
    var formula = cfg.formulas.find(function (f) {
      return f.id === teaser.formulaId;
    });
    if (!formula) return 0;
    var pet = { type: teaser.petType === "chat" ? "Chat" : "Chien", age: "4-7" };
    return petMonthly(cfg, pet, teaser.formulaId, {
      franchise: "franchise20",
      prevention: "0",
      fractionFactor: 1,
    });
  }

  function renderTeasers(cfg, mount) {
    var teasers = cfg.teasers || [];
    if (!teasers.length) return;
    mount.innerHTML =
      '<div class="pet-teaser-grid">' +
      teasers
        .map(function (t) {
          var price = teaserPrice(cfg, t);
          return (
            '<article class="pet-teaser-card">' +
            "<h3>" +
            esc(t.title) +
            "</h3>" +
            '<p class="pet-teaser-sub">' +
            esc(t.subtitle) +
            "</p>" +
            '<p class="pet-teaser-price">' +
            esc(fmtEuro(price)) +
            " <span style='font-size:.85rem;font-weight:600'>/ mois</span></p>" +
            '<button type="button" class="btn btn-primary" data-pet-teaser-start data-pet-type="' +
            esc(t.petType === "chat" ? "Chat" : "Chien") +
            '">Demander un devis</button></article>'
          );
        })
        .join("") +
      "</div>";
    mount.querySelectorAll("[data-pet-teaser-start]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.pets[0].type = btn.getAttribute("data-pet-type") || "Chien";
        var journey = document.querySelector("[data-pet-journey]");
        if (journey) journey.scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  function renderProgress() {
    var labels = ["Vos animaux", "Votre tarif", "Vos coordonnees"];
    return (
      '<div class="pet-progress">' +
      labels
        .map(function (lab, i) {
          var cls = "pet-progress-step";
          if (i === state.step) cls += " is-active";
          if (i < state.step) cls += " is-done";
          return '<div class="' + cls + '">' + (i + 1) + ". " + esc(lab) + "</div>";
        })
        .join("") +
      "</div>"
    );
  }

  function renderStepAnimals(cfg) {
    var blocks = state.pets
      .map(function (pet, i) {
        return (
          '<details class="pet-animal-block" open>' +
          "<summary>Animal " +
          (i + 1) +
          "</summary>" +
          '<div class="pet-type-picker" style="margin-top:12px">' +
          ["Chien", "Chat"]
            .map(function (t) {
              return (
                '<button type="button" class="pet-type-btn' +
                (pet.type === t ? " is-selected" : "") +
                '" data-pet-idx="' +
                i +
                '" data-pet-type="' +
                t +
                '"><span>' +
                (t === "Chien" ? "🐕" : "🐈") +
                "</span>" +
                t +
                "</button>"
              );
            })
            .join("") +
          "</div>" +
          '<div class="pet-grid">' +
          '<label>Prenom (facultatif) <input data-pet-field="name" data-pet-idx="' +
          i +
          '" value="' +
          esc(pet.name || "") +
          '" placeholder="Ex : Max" /></label>' +
          '<label>Race <input data-pet-field="breed" data-pet-idx="' +
          i +
          '" value="' +
          esc(pet.breed) +
          '" placeholder="Ex : Labrador" required /></label>' +
          '<label>Date de naissance <input type="date" data-pet-field="birthDate" data-pet-idx="' +
          i +
          '" value="' +
          esc(pet.birthDate || "") +
          '" /></label>' +
          '<label>Age <select data-pet-field="age" data-pet-idx="' +
          i +
          '">' +
          [
            ["moins-1", "Moins de 1 an"],
            ["1-3", "1 à 3 ans"],
            ["4-7", "4 à 7 ans"],
            ["8-10", "8 à 10 ans"],
            ["plus-10", "Plus de 10 ans"],
          ]
            .map(function (pair) {
              return (
                '<option value="' +
                pair[0] +
                '"' +
                (pet.age === pair[0] ? " selected" : "") +
                ">" +
                esc(pair[1]) +
                "</option>"
              );
            })
            .join("") +
          "</select></label>" +
          '<label>Sexe <select data-pet-field="sex" data-pet-idx="' +
          i +
          '"><option' +
          (pet.sex === "Mâle" ? " selected" : "") +
          '>Mâle</option><option' +
          (pet.sex === "Femelle" ? " selected" : "") +
          ">Femelle</option></select></label>" +
          '<label>Identification <select data-pet-field="identification" data-pet-idx="' +
          i +
          '" required>' +
          [
            ["puce", "Puce electronique"],
            ["tatouage", "Tatouage"],
            ["en_cours", "En cours (chiot/chaton)"],
            ["aucun", "Aucune pour l instant"],
          ]
            .map(function (pair) {
              return (
                '<option value="' +
                pair[0] +
                '"' +
                (pet.identification === pair[0] ? " selected" : "") +
                ">" +
                esc(pair[1]) +
                "</option>"
              );
            })
            .join("") +
          "</select></label>" +
          '<label data-pet-chip-wrap data-pet-idx="' +
          i +
          '"' +
          (pet.identification === "puce" ? "" : ' hidden') +
          '>Numero de puce <input data-pet-field="chipNumber" data-pet-idx="' +
          i +
          '" value="' +
          esc(pet.chipNumber || "") +
          '" inputmode="numeric" maxlength="15" placeholder="15 chiffres" /></label>' +
          '<label>Sterilise / castre <select data-pet-field="sterilized" data-pet-idx="' +
          i +
          '">' +
          [
            ["oui", "Oui"],
            ["non", "Non"],
            ["ns", "Je ne sais pas"],
          ]
            .map(function (pair) {
              return (
                '<option value="' +
                pair[0] +
                '"' +
                (pet.sterilized === pair[0] ? " selected" : "") +
                ">" +
                esc(pair[1]) +
                "</option>"
              );
            })
            .join("") +
          "</select></label>" +
          '<label>Vaccins a jour <select data-pet-field="vaccinated" data-pet-idx="' +
          i +
          '">' +
          [
            ["oui", "Oui"],
            ["non", "Non"],
            ["en_cours", "Carnet en cours"],
          ]
            .map(function (pair) {
              return (
                '<option value="' +
                pair[0] +
                '"' +
                (pet.vaccinated === pair[0] ? " selected" : "") +
                ">" +
                esc(pair[1]) +
                "</option>"
              );
            })
            .join("") +
          "</select></label>" +
          '<label>Assurance actuelle <select data-pet-field="priorInsurance" data-pet-idx="' +
          i +
          '">' +
          [
            ["aucune", "Aucune"],
            ["en_cours", "Contrat en cours"],
            ["resiliation", "Resiliation / changement"],
          ]
            .map(function (pair) {
              return (
                '<option value="' +
                pair[0] +
                '"' +
                (pet.priorInsurance === pair[0] ? " selected" : "") +
                ">" +
                esc(pair[1]) +
                "</option>"
              );
            })
            .join("") +
          "</select></label>" +
          '<label>Antecedents sante <select data-pet-field="healthHistory" data-pet-idx="' +
          i +
          '">' +
          [
            ["aucun", "Aucun connu"],
            ["chronique", "Maladie chronique"],
            ["operation", "Operation recente"],
            ["ns", "Je ne sais pas"],
          ]
            .map(function (pair) {
              return (
                '<option value="' +
                pair[0] +
                '"' +
                (pet.healthHistory === pair[0] ? " selected" : "") +
                ">" +
                esc(pair[1]) +
                "</option>"
              );
            })
            .join("") +
          "</select></label>" +
          "</div></details>"
        );
      })
      .join("");

    return (
      '<div class="pet-panel">' +
      "<h3>Vos animaux</h3>" +
      blocks +
      '<p class="pet-hint">Bonne nouvelle ! À partir du 2<sup>e</sup> animal assuré : <strong>-' +
      (cfg.multiPetDiscountPercent || 20) +
      "%</strong> sur le 2<sup>e</sup> contrat et les suivants.</p>" +
      (state.pets.length < 3
        ? '<button type="button" class="btn btn-soft" data-add-pet>+ Assurer un autre animal</button>'
        : "") +
      '<div class="pet-grid" style="margin-top:16px">' +
      '<label style="grid-column:1/-1">Date d\'effet souhaitée <input type="date" name="effectDate" id="petEffectDate" value="' +
      esc(state.effectDate) +
      '" required /></label>' +
      "</div></div>"
    );
  }

  function renderStepTarif(cfg) {
    var formulas = cfg.formulas;
    var head =
      "<tr><th></th>" +
      formulas
        .map(function (f) {
          return (
            '<th class="pet-formula-pick' +
            (f.id === state.formulaId ? " is-selected" : "") +
            '" data-formula-id="' +
            f.id +
            '">' +
            esc(f.name) +
            "</th>"
          );
        })
        .join("") +
      "</tr>";

    function row(label, key) {
      return (
        "<tr><td><strong>" +
        esc(label) +
        "</strong></td>" +
        formulas
          .map(function (f) {
            return (
              '<td class="' +
              (f.id === state.formulaId ? "is-selected" : "") +
              '">' +
              esc(f[key] || "—") +
              "</td>"
            );
          })
          .join("") +
        "</tr>"
      );
    }

    var priceRow =
      "<tr><td><strong>Tarif indicatif</strong></td>" +
      formulas
        .map(function (f) {
          var m = petMonthly(cfg, state.pets[0], f.id, {
            franchise: state.franchise,
            prevention: state.prevention,
            fractionFactor: (cfg.modifiers.fraction[state.fraction] || {}).factor || 1,
          });
          return (
            '<td class="pet-formula-pick' +
            (f.id === state.formulaId ? " is-selected" : "") +
            '" data-formula-id="' +
            f.id +
            '"><span class="pet-formula-price">' +
            esc(fmtEuro(m)) +
            "</span> / mois</td>"
          );
        })
        .join("") +
      "</tr>";

    var fr = cfg.modifiers;
    var total = computeTotal(cfg);
    var annual = total * 12;

    return (
      '<div class="pet-panel"><h3>Choix de la formule</h3>' +
      '<div class="pet-formulas-scroll"><table class="pet-formulas-table">' +
      head +
      row("Frais médicaux courants", "medicalPct") +
      row("Chirurgie", "surgeryPct") +
      row("Plafond annuel", "plafond") +
      row("Assistance", "assistance") +
      row("Frais de pension", "boarding") +
      priceRow +
      "</table></div>" +
      '<div class="pet-options-row">' +
      '<div class="pet-option-group"><span class="group-label">Franchise</span><div class="pet-toggle-group">' +
      ['franchise20', "franchiseNone"]
        .map(function (k) {
          return (
            '<button type="button" class="pet-toggle' +
            (state.franchise === k ? " is-on" : "") +
            '" data-franchise="' +
            k +
            '">' +
            esc(fr[k].label) +
            "</button>"
          );
        })
        .join("") +
      "</div></div>" +
      '<div class="pet-option-group"><span class="group-label">Prévention</span><div class="pet-toggle-group">' +
      ["0", "30", "50", "100"]
        .map(function (k) {
          return (
            '<button type="button" class="pet-toggle' +
            (state.prevention === k ? " is-on" : "") +
            '" data-prevention="' +
            k +
            '">' +
            esc(fr.prevention[k].label) +
            "</button>"
          );
        })
        .join("") +
      "</div></div>" +
      '<div class="pet-option-group"><span class="group-label">Fractionnement</span><div class="pet-toggle-group">' +
      Object.keys(fr.fraction)
        .map(function (k) {
          return (
            '<button type="button" class="pet-toggle' +
            (state.fraction === k ? " is-on" : "") +
            '" data-fraction="' +
            k +
            '">' +
            esc(fr.fraction[k].label) +
            "</button>"
          );
        })
        .join("") +
      "</div></div></div>" +
      '<div class="pet-summary-box">' +
      '<div><strong>Rappel projet</strong><p style="margin:6px 0 0;font-size:.85rem">' +
      state.pets
        .map(function (p, i) {
          var line = "Animal " + (i + 1) + " : " + p.type + (p.breed ? " — " + p.breed : "");
          if (p.identification) line += " | ID : " + p.identification;
          if (p.sterilized) line += " | Sterilise : " + p.sterilized;
          return line;
        })
        .join("<br>") +
      "</p></div>" +
      '<div><strong>Votre sélection</strong><p style="margin:6px 0 0;font-size:.85rem">' +
      esc((formulas.find(function (f) { return f.id === state.formulaId; }) || {}).name || "") +
      " · Franchise " +
      esc(fr[state.franchise].label) +
      "</p></div>" +
      '<div class="pet-summary-total"><span style="font-size:.85rem">Total indicatif</span><strong>' +
      esc(fmtEuro(total)) +
      ' / mois</strong><span style="font-size:.85rem;color:#64748b">soit ' +
      esc(fmtEuro(annual)) +
      " / an</span></div></div>" +
      (cfg.promoLabel
        ? '<p class="pet-hint" style="text-align:center"><strong>' + esc(cfg.promoLabel) + "</strong></p>"
        : "") +
      "</div>"
    );
  }

  function renderStepContact() {
    return (
      '<div class="pet-panel"><h3>Vos coordonnées</h3>' +
      '<p class="pet-hint">Un conseiller vous rappelle pour confirmer le tarif définitif auprès de nos partenaires (Santévet, Bulle Bleue, Kozoo…).</p>' +
      '<div class="pet-grid">' +
      '<label>Nom complet <input name="fullName" required autocomplete="name" /></label>' +
      '<label>Téléphone <input name="phone" type="tel" required autocomplete="tel" /></label>' +
      '<label>Email <input name="email" type="email" required autocomplete="email" /></label>' +
      '<label>Code postal <input name="postalCode" inputmode="numeric" maxlength="5" required /></label>' +
      '<label style="grid-column:1/-1" class="checkbox-row"><input type="checkbox" name="consent" required /> J\'accepte d\'être contacté (voir <a href="../politique-confidentialite.html" target="_blank" rel="noopener">confidentialité</a>).</label>' +
      "</div></div>"
    );
  }

  function syncHiddenFields(form, cfg) {
    var total = computeTotal(cfg);
    var formula = cfg.formulas.find(function (f) {
      return f.id === state.formulaId;
    });
    var set = function (name, val) {
      var el = form.querySelector('[name="' + name + '"]');
      if (!el) {
        el = document.createElement("input");
        el.type = "hidden";
        el.name = name;
        form.appendChild(el);
      }
      el.value = val;
    };
    set("need", "animaux");
    set("serviceLabel", "Assurance animaux");
    set("serviceCategory", "animaux");
    set("petFormula", state.formulaId);
    set("petFormulaLabel", formula ? formula.name : "");
    set("petMonthlyIndicative", String(total.toFixed(2)));
    set("petFranchise", state.franchise);
    set("petPrevention", state.prevention);
    set("petFraction", state.fraction);
    set("effectDate", state.effectDate);
    set(
      "message",
      "Parcours animaux | " +
        state.pets.length +
        " animal(s) | " +
        (formula ? formula.name : "") +
        " | " +
        fmtEuro(total) +
        "/mois indicatif"
    );
    set("petsJson", JSON.stringify(state.pets));
    set("questionnaire_step", String(state.step + 1));
    set("questionnaire_total", "3");
  }

  function bindStepEvents(root, cfg, form) {
    root.querySelectorAll("[data-pet-type]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var i = parseInt(btn.getAttribute("data-pet-idx"), 10);
        state.pets[i].type = btn.getAttribute("data-pet-type");
        render(root, cfg, form);
      });
    });
    root.querySelectorAll("[data-pet-field]").forEach(function (el) {
      el.addEventListener("change", function () {
        var i = parseInt(el.getAttribute("data-pet-idx"), 10);
        var field = el.getAttribute("data-pet-field");
        state.pets[i][field] = el.value;
        if (field === "identification") {
          var chipWrap = root.querySelector('[data-pet-chip-wrap][data-pet-idx="' + i + '"]');
          if (chipWrap) chipWrap.hidden = state.pets[i].identification !== "puce";
        }
        if (state.step === 1) render(root, cfg, form);
      });
      el.addEventListener("input", function () {
        var i = parseInt(el.getAttribute("data-pet-idx"), 10);
        var field = el.getAttribute("data-pet-field");
        state.pets[i][field] = el.value;
      });
    });
    var addBtn = root.querySelector("[data-add-pet]");
    if (addBtn) {
      addBtn.addEventListener("click", function () {
        state.pets.push({
          type: "Chat",
          name: "",
          breed: "",
          age: "1-3",
          birthDate: "",
          sex: "Femelle",
          identification: "puce",
          chipNumber: "",
          sterilized: "non",
          vaccinated: "oui",
          priorInsurance: "aucune",
          healthHistory: "aucun",
        });
        render(root, cfg, form);
      });
    }
    var dateEl = root.querySelector("#petEffectDate");
    if (dateEl) {
      dateEl.addEventListener("change", function () {
        state.effectDate = dateEl.value;
      });
    }
    root.querySelectorAll("[data-formula-id]").forEach(function (cell) {
      cell.addEventListener("click", function () {
        state.formulaId = cell.getAttribute("data-formula-id");
        render(root, cfg, form);
      });
    });
    ["franchise", "prevention", "fraction"].forEach(function (attr) {
      root.querySelectorAll("[data-" + attr + "]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          state[attr] = btn.getAttribute("data-" + attr);
          render(root, cfg, form);
        });
      });
    });
  }

  function validateStep() {
    if (state.step === 0) {
      if (!state.effectDate) return false;
      for (var i = 0; i < state.pets.length; i++) {
        var p = state.pets[i];
        if (!(p.breed || "").trim()) return false;
        if (!p.identification) return false;
        if (p.identification === "puce" && (p.chipNumber || "").trim()) {
          var chip = p.chipNumber.replace(/\s/g, "");
          if (chip.length !== 15 || !/^[0-9]+$/.test(chip)) return false;
        }
      }
      return true;
    }
    if (state.step === 2) {
      var form = document.querySelector("form[data-pet-journey-form]");
      if (!form) return false;
      var required = form.querySelectorAll(
        'input[required]:not([type="hidden"]), select[required]'
      );
      var ok = true;
      required.forEach(function (el) {
        if (el.type === "checkbox" && !el.checked) ok = false;
        else if (el.type !== "checkbox" && !(el.value || "").trim()) ok = false;
      });
      return ok;
    }
    return true;
  }

  function render(root, cfg, form) {
    syncHiddenFields(form, cfg);
    var body = renderProgress();
    if (state.step === 0) body += renderStepAnimals(cfg);
    else if (state.step === 1) body += renderStepTarif(cfg);
    else body += renderStepContact();

    body +=
      '<div class="pet-journey-actions">' +
      (state.step > 0
        ? '<button type="button" class="btn btn-soft" data-pet-prev>Précédent</button>'
        : "<span></span>") +
      (state.step < 2
        ? '<button type="button" class="btn btn-primary" data-pet-next>Suivant ›</button>'
        : '<button type="submit" class="btn btn-primary" data-track="cta_click">Envoyer ma demande</button>') +
      "</div>" +
      '<p class="pet-disclaimer">Tarifs indicatifs modifiables dans <code>data/niche-tariffs-animaux.json</code> — devis définitif par conseiller ORIAS.</p>';

    root.innerHTML = '<div class="pet-journey-wrap">' + body + "</div>";
    bindStepEvents(root, cfg, form);

    var prev = root.querySelector("[data-pet-prev]");
    var next = root.querySelector("[data-pet-next]");
    if (prev) {
      prev.addEventListener("click", function () {
        state.step--;
        render(root, cfg, form);
        if (window.QuoteIntelligence) {
          window.QuoteIntelligence.saveProgress(form, state.step + 1, "pet_step", "wizard_step");
        }
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        if (!validateStep()) {
          alert("Merci de compléter les champs obligatoires.");
          return;
        }
        state.step++;
        render(root, cfg, form);
        try {
          window.dispatchEvent(
            new CustomEvent("lo:wizard_step", {
              detail: {
                step_number: state.step + 1,
                step_total: 3,
                step_name: ["animaux", "tarif", "contact"][state.step],
                vertical: "animaux",
              },
            })
          );
        } catch (e) {}
        if (window.QuoteIntelligence) {
          window.QuoteIntelligence.saveProgress(
            form,
            state.step,
            ["animaux", "tarif", "contact"][state.step],
            "wizard_step"
          );
        }
      });
    }
  }

  function defaultEffectDate() {
    var d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }

  function init() {
    var journeyRoot = document.querySelector("[data-pet-journey]");
    var teaserRoot = document.querySelector("[data-pet-teaser]");
    var form = document.querySelector("form[data-pet-journey-form]");
    if (!journeyRoot && !teaserRoot) return;

    fetch(CONFIG_URL)
      .then(function (r) {
        return r.json();
      })
      .then(function (cfg) {
        state.config = cfg;
        if (!state.effectDate) state.effectDate = defaultEffectDate();
        var def = cfg.formulas.find(function (f) {
          return f.recommended;
        });
        if (def) state.formulaId = def.id;

        if (teaserRoot) renderTeasers(cfg, teaserRoot);
        if (journeyRoot && form) {
          render(journeyRoot, cfg, form);
          if (window.QuoteIntelligence) window.QuoteIntelligence.bindAbandon(form);
        }
      })
      .catch(function () {
        if (journeyRoot) {
          journeyRoot.innerHTML =
            "<p>Impossible de charger les tarifs. <a href=\"./animaux-express.html\">Devis express</a>.</p>";
        }
      });
  }

  global.PetJourney = {
    state: state,
    computeTotal: function () {
      return state.config ? computeTotal(state.config) : 0;
    },
    reload: init,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(typeof window !== "undefined" ? window : globalThis);
