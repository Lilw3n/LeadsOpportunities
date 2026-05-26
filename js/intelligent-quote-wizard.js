/**
 * Wizard devis externe — inspire ExternalQuoteWizard + intelligentQuoteService (multisite).
 */
window.IntelligentQuoteWizard = {
  INSURANCE_TYPES: [
    { id: "auto", label: "Automobile", icon: "🚗", desc: "Véhicule personnel ou professionnel" },
    { id: "vtc-taxi", label: "VTC / Taxi", icon: "🚡", desc: "Activité chauffeur, transport ou mobilité" },
    { id: "habitation", label: "Habitation", icon: "🏠", desc: "Logement, PNO, bailleur ou occupant" },
    { id: "sante", label: "Santé / Mutuelle", icon: "❤️", desc: "Complémentaire, famille ou collectif" },
    { id: "rc-pro", label: "RC Professionnelle", icon: "💼", desc: "Activité indépendante ou entreprise" },
    { id: "decennale", label: "Décennale", icon: "🏗️", desc: "Métiers du bâtiment à vérifier" },
  ],

  mockOffers: function (type, budget) {
    var labels = ["Partenaire à vérifier A", "Partenaire à vérifier B", "Partenaire à vérifier C"];
    return labels.map(function (name) {
      return {
        insurer: name,
        premium: null,
        score: null,
        recommended: false,
      };
    });
  },

  buildSteps: function (initialType) {
    var steps = [];
    if (!initialType) {
      steps.push({ id: "insurance-type", title: "Type d'assurance" });
    }
    steps.push(
      { id: "personal", title: "Vos coordonnées" },
      { id: "company", title: "Entreprise (optionnel)" },
      { id: "needs", title: "Vos besoins" },
      { id: "comparison", title: "Comparatif" },
      { id: "summary", title: "Confirmation" }
    );
    return steps;
  },

  esc: function (s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  },

  render: function (container, options) {
    options = options || {};
    var self = this;
    var initialType = options.insuranceType || new URLSearchParams(location.search).get("type") || "";
    var steps = this.buildSteps(initialType);
    var step = 0;
    var data = {
      insuranceType: initialType,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      street: "",
      city: "",
      postalCode: "",
      hasCompany: false,
      companyName: "",
      companySiret: "",
      companyActivity: "",
      vehicleType: "",
      activityType: "",
      propertyType: "",
      propertySurface: "",
      professionalActivity: "",
      coverage: "comprehensive",
      budget: "",
      urgency: "within_month",
    };
    if (options.ocrHint && options.ocrHint.length > 20) {
      data.notes = options.ocrHint;
      if (options.ocrHint.match(/vtc|taxi|chauffeur/i)) data.insuranceType = data.insuranceType || "vtc-taxi";
      if (options.ocrHint.match(/habitation|mrh|pno/i)) data.insuranceType = data.insuranceType || "habitation";
      if (options.ocrHint.match(/sant[eé]|mutuelle/i)) data.insuranceType = data.insuranceType || "sante";
      var immat = options.ocrHint.match(/[A-Z]{2}[-\s]?\d{3}[-\s]?[A-Z]{2}/i);
      if (immat) data.vehicleRegistration = immat[0].replace(/\s/g, "-");
    }
    if (options.prefillData) {
      var ex = options.prefillData.extracted || options.prefillData;
      if (ex.customer) {
        var parts = (ex.customer.fullName || "").trim().split(/\s+/);
        data.firstName = parts[0] || data.firstName;
        data.lastName = parts.slice(1).join(" ") || data.lastName;
        data.email = ex.customer.email || data.email;
        data.phone = ex.customer.phone || data.phone;
        data.street = ex.customer.address || data.street;
      }
      if (ex.company) {
        data.hasCompany = !!(ex.company.name || ex.company.siret);
        data.companyName = ex.company.name || data.companyName;
        data.companySiret = ex.company.siret || data.companySiret;
        data.companyActivity = ex.company.activity || data.companyActivity;
      }
      if (options.prefillData.profileKey && !initialType) {
        var pk = options.prefillData.profileKey;
        if (pk.indexOf("sante") >= 0) data.insuranceType = "sante";
        else if (pk.indexOf("habitat") >= 0) data.insuranceType = "habitation";
        else if (pk.indexOf("mobilite") >= 0) data.insuranceType = "vtc-taxi";
      }
    }
    if (data.insuranceType && !initialType) {
      steps = self.buildSteps("");
      step = 1;
    }
    var offers = [];

    function progressHtml() {
      var pct = Math.round(((step + 1) / steps.length) * 100);
      return (
        '<div class="wizard-progress"><div class="wizard-progress-bar" style="width:' +
        pct +
        '%"></div></div><p class="wizard-step-label">Étape ' +
        (step + 1) +
        " / " +
        steps.length +
        " — " +
        self.esc(steps[step].title) +
        (options.ocrHint && step === 0
          ? ' <span style="font-size:.8rem;color:#6366f1">· extrait document détecté</span>'
          : "") +
        "</p>"
      );
    }

    function stepInsuranceType() {
      return (
        '<div class="wizard-grid type-grid">' +
        self.INSURANCE_TYPES.map(function (t) {
          return (
            '<button type="button" class="type-card' +
            (data.insuranceType === t.id ? " selected" : "") +
            '" data-type="' +
            t.id +
            '"><span class="type-icon">' +
            t.icon +
            "</span><strong>" +
            t.label +
            "</strong><small>" +
            self.esc(t.desc || "Étude selon dossier") +
            "</small></button>"
          );
        }).join("") +
        "</div>"
      );
    }

    function stepPersonal() {
      return (
        '<p class="wizard-help">Ces informations servent au rappel et à l’ouverture du dossier. Elles pourront être corrigées avec le conseiller.</p>' +
        '<div class="form-grid">' +
        '<label>Prénom<input name="firstName" value="' +
        self.esc(data.firstName) +
        '" required /></label>' +
        '<label>Nom<input name="lastName" value="' +
        self.esc(data.lastName) +
        '" required /></label>' +
        '<label>Email<input type="email" name="email" value="' +
        self.esc(data.email) +
        '" required /></label>' +
        '<label>Téléphone<input name="phone" value="' +
        self.esc(data.phone) +
        '" required /></label>' +
        '<label class="full">Adresse<input name="street" value="' +
        self.esc(data.street) +
        '" required /></label>' +
        '<label>Ville<input name="city" value="' +
        self.esc(data.city) +
        '" required /></label>' +
        '<label>Code postal<input name="postalCode" pattern="\\d{5}" value="' +
        self.esc(data.postalCode) +
        '" required /></label>' +
        "</div>"
      );
    }

    function stepCompany() {
      return (
        '<label class="full"><input type="checkbox" id="hasCompany" ' +
        (data.hasCompany ? "checked" : "") +
        " /> Je suis un professionnel / entreprise</label>" +
        '<div id="companyFields" class="form-grid' +
        (data.hasCompany ? "" : " hidden") +
        '">' +
        '<label class="full">Raison sociale<input name="companyName" value="' +
        self.esc(data.companyName) +
        '" /></label>' +
        '<label>SIRET<input name="companySiret" maxlength="14" value="' +
        self.esc(data.companySiret) +
        '" /></label>' +
        '<label>Activité<input name="companyActivity" value="' +
        self.esc(data.companyActivity) +
        '" /></label>' +
        "</div>"
      );
    }

    function stepNeeds() {
      var t = data.insuranceType;
      var extra = "";
      if (t === "auto" || t === "vtc-taxi") {
        extra =
        '<label>Type véhicule<select name="vehicleType"><option value="">À préciser</option><option>VTC</option><option>Berline</option><option>Utilitaire</option><option>Deux-roues</option><option>Autre</option></select></label>' +
          '<label>Usage principal<select name="activityType"><option value="">À préciser</option><option>VTC</option><option>Taxi</option><option>Personnel</option><option>Professionnel</option></select></label>';
      } else if (t === "habitation") {
        extra =
        '<label>Type logement<select name="propertyType"><option>Appartement</option><option>Maison</option><option>Local professionnel</option><option>Autre</option></select></label>' +
          '<label>Surface m²<input name="propertySurface" type="number" /></label>';
      } else if (t === "rc-pro" || t === "decennale") {
        extra =
          '<label class="full">Activité professionnelle<input name="professionalActivity" /></label>';
      }
      return (
        '<p class="wizard-help">Indiquez ce que vous savez déjà. Le budget est facultatif : aucun tarif ne sera inventé.</p>' +
        '<div class="form-grid">' +
        extra +
        '<label>Budget annuel indicatif, si connu (€)<input type="number" name="budget" value="' +
        self.esc(data.budget) +
        '" /></label>' +
        '<label>Délai souhaité<select name="urgency"><option value="immediate">Très rapide</option><option value="within_month" selected>Sous 1 mois</option><option value="flexible">Flexible</option></select></label>' +
        '<label>Niveau souhaité<select name="coverage"><option value="basic">Essentiel</option><option value="comprehensive" selected>Équilibré</option><option value="premium">Renforcé, selon éligibilité</option></select></label>' +
        "</div>"
      );
    }

    function stepComparison() {
      if (!offers.length) offers = self.mockOffers(data.insuranceType, data.budget);
      return (
        '<p class="wizard-help">Pré-analyse indicative : ces pistes servent à préparer le dossier. Les garanties, tarifs, exclusions et partenaires seront confirmés après étude.</p>' +
        '<div class="offers-grid">' +
        offers
          .map(function (o) {
            return (
              '<div class="offer-card' +
              "" +
              '"><h3>' +
              self.esc(o.insurer) +
              "</h3><p>À confirmer selon éligibilité, pièces transmises, zone, activité et disponibilité partenaire.</p></div>"
            );
          })
          .join("") +
        "</div>"
      );
    }

    function stepSummary() {
      return (
        "<ul class=\"summary-list\"><li><strong>Produit :</strong> " +
        self.esc(data.insuranceType) +
        "</li><li><strong>Nom :</strong> " +
        self.esc(data.firstName + " " + data.lastName) +
        "</li><li><strong>Email :</strong> " +
        self.esc(data.email) +
        "</li><li><strong>Tél :</strong> " +
        self.esc(data.phone) +
        "</li></ul><p>En validant, votre demande est transmise au CRM pour une étude humaine. Aucun tarif définitif n'est généré automatiquement.</p>"
      );
    }

    function readForm(root) {
      var fd = new FormData(root.querySelector("form") || root);
      fd.forEach(function (v, k) {
        data[k] = v;
      });
      data.hasCompany = !!root.querySelector("#hasCompany:checked");
    }

    function validate() {
      var id = steps[step].id;
      if (id === "insurance-type" && !data.insuranceType) return "Choisissez un type";
      if (id === "personal") {
        if (!data.firstName || !data.lastName || !data.email || !data.phone) return "Champs requis";
        if (!/^\d{5}$/.test(data.postalCode || "")) return "Code postal invalide";
      }
      if (id === "company" && data.hasCompany && !data.companyName) return "Raison sociale requise";
      return null;
    }

    function paint() {
      var id = steps[step].id;
      var body = "";
      if (id === "insurance-type") body = stepInsuranceType();
      else if (id === "personal") body = stepPersonal();
      else if (id === "company") body = stepCompany();
      else if (id === "needs") body = stepNeeds();
      else if (id === "comparison") body = stepComparison();
      else body = stepSummary();

      container.innerHTML =
        '<div class="wizard-panel panel">' +
        progressHtml() +
        '<form class="wizard-form">' +
        body +
        '<div class="wizard-actions">' +
        (step > 0 ? '<button type="button" class="btn btn-ghost" id="wizPrev">Précédent</button>' : "") +
        '<button type="button" class="btn btn-primary" id="wizNext">' +
        (step < steps.length - 1 ? "Suivant" : "Envoyer ma demande") +
        "</button></div></form></div>";

      container.querySelectorAll(".type-card").forEach(function (btn) {
        btn.onclick = function () {
          data.insuranceType = btn.getAttribute("data-type");
          paint();
        };
      });
      var hc = container.querySelector("#hasCompany");
      if (hc) {
        hc.onchange = function () {
          data.hasCompany = hc.checked;
          var cf = container.querySelector("#companyFields");
          if (cf) cf.classList.toggle("hidden", !hc.checked);
        };
      }
      var prev = container.querySelector("#wizPrev");
      if (prev) prev.onclick = function () {
        readForm(container);
        step--;
        paint();
      };
      container.querySelector("#wizNext").onclick = function () {
        readForm(container);
        var err = validate();
        if (err) return alert(err);
        if (steps[step].id === "needs") offers = [];
        if (step < steps.length - 1) {
          step++;
          paint();
        } else submitQuote();
      };
    }

    function submitQuote() {
      var btn = container.querySelector("#wizNext");
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Envoi...";
      }
      var payload = Object.assign({}, data, {
        insuranceType: data.insuranceType,
        has_company: data.hasCompany,
        company_name: data.companyName,
        company_siret: data.companySiret,
        company_activity: data.companyActivity,
        source: options.crmContactId ? "crm_wizard" : "intelligent_wizard",
        page: location.pathname,
        quoteDetails: { offers: offers, coverage: data.coverage },
      });

      if (options.skipSubmit && options.onWizardComplete) {
        options.onWizardComplete(data, offers, payload);
        if (btn) { btn.disabled = false; btn.textContent = "Envoyer ma demande"; }
        return;
      }

      if (options.crmContactId) {
        var headers = { "Content-Type": "application/json" };
        if (options.token) headers.Authorization = "Bearer " + options.token;
        fetch("/api/crm/quotes", {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            contactId: options.crmContactId,
            productType: data.insuranceType,
            title: "Devis " + (data.insuranceType || "assurance"),
            premiumEstimate: null,
            data: payload,
          }),
        })
          .then(function (r) { return r.json(); })
          .then(function (res) {
            if (res.ok && res.quote) {
              location.href = "./crm-quote-detail.html?id=" + encodeURIComponent(res.quote.id);
            } else alert(res.error || "Erreur");
          })
          .catch(function () { alert("Erreur réseau"); })
          .finally(function () {
            if (btn) { btn.disabled = false; btn.textContent = "Envoyer ma demande"; }
          });
        return;
      }

      fetch("/api/external/quote-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (r) {
          return r.json();
        })
        .then(function (res) {
          if (res.ok) {
            container.innerHTML =
              '<div class="panel success-box"><h2>Demande enregistrée</h2><p>Un conseiller vous recontacte rapidement.</p><p><a href="../index.html">Retour accueil</a></p></div>';
            if (options.onComplete) options.onComplete(res);
          } else alert(res.error || "Erreur");
        })
        .catch(function () {
          alert("Erreur réseau");
        })
        .finally(function () {
          if (btn) btn.disabled = false;
        });
    }

    paint();
  },
};
