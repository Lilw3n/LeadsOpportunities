(function () {
  var Lib = window.CrmPretImmo;
  var Store = window.CrmPretImmoStore;
  var Deep = window.FinanceDeepLink;
  if (!Lib || !Store) return;
  if (!localStorage.getItem("lo_token")) {
    location.href = "./crm.html";
    return;
  }

  var params = new URLSearchParams(location.search);
  var dossier = null;
  var type = params.get("type") || "rac";
  var housing = params.get("housing") || "proprietaire";

  if (type === "pvh") {
    location.href = "./crm-pret-immo-pvh.html";
    return;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function personHtml(prefix, person) {
    person = person || Lib.emptyPerson();
    var civ = Lib.CIVILITES.map(function (c) {
      return (
        '<label><input type="radio" name="' +
        prefix +
        '_civ" value="' +
        c.id +
        '"' +
        (person.civilite === c.id ? " checked" : "") +
        " /> " +
        c.label +
        "</label>"
      );
    }).join(" ");
    var sit = Lib.MARITAL.map(function (m) {
      return (
        '<label><input type="radio" name="' +
        prefix +
        '_sit" value="' +
        esc(m) +
        '"' +
        (person.situation === m ? " checked" : "") +
        " /> " +
        esc(m) +
        "</label>"
      );
    }).join(" ");
    return (
      "<h4>" +
      (prefix === "e" ? "Emprunteur" : "Co-emprunteur") +
      "</h4>" +
      '<div class="pi-inline">Civilité ' +
      civ +
      "</div>" +
      '<label>Nom <span class="req">*</span><input data-p="' +
      prefix +
      '" data-f="nom" value="' +
      esc(person.nom) +
      '" required /></label>' +
      '<label>Prénom <span class="req">*</span><input data-p="' +
      prefix +
      '" data-f="prenom" value="' +
      esc(person.prenom) +
      '" required /></label>' +
      '<label>Date de naissance<input type="date" data-p="' +
      prefix +
      '" data-f="birthdate" value="' +
      esc(person.birthdate) +
      '" /></label>' +
      '<label>Tél.<input data-p="' +
      prefix +
      '" data-f="phone" value="' +
      esc(person.phone) +
      '" /></label>' +
      '<label>E-mail<input type="email" data-p="' +
      prefix +
      '" data-f="email" value="' +
      esc(person.email) +
      '" /></label>' +
      '<div class="pi-inline" style="flex-direction:column;align-items:flex-start">Situation ' +
      sit +
      "</div>"
    );
  }

  function readPerson(prefix) {
    var civ = document.querySelector('input[name="' + prefix + '_civ"]:checked');
    var sit = document.querySelector('input[name="' + prefix + '_sit"]:checked');
    var p = Lib.emptyPerson();
    p.civilite = civ ? civ.value : "m";
    p.situation = sit ? sit.value : "Célibataire";
    document.querySelectorAll('[data-p="' + prefix + '"]').forEach(function (el) {
      p[el.getAttribute("data-f")] = el.value;
    });
    return p;
  }

  function fillKeyed(attr, data) {
    document.querySelectorAll("[" + attr + "]").forEach(function (el) {
      var key = el.getAttribute(attr);
      if (data[key] == null) return;
      if (el.type === "checkbox") el.checked = !!data[key];
      else el.value = data[key];
    });
  }

  function readKeyed(attr) {
    var out = {};
    document.querySelectorAll("[" + attr + "]").forEach(function (el) {
      var k = el.getAttribute(attr);
      out[k] = el.type === "checkbox" ? el.checked : el.type === "number" ? Number(el.value) || 0 : el.value;
    });
    return out;
  }

  function syncHousingUI() {
    document.getElementById("secPropriete").hidden = housing !== "proprietaire";
    document.getElementById("secHebergement").hidden = housing !== "heberge";
    var ll = document.getElementById("loyerLabel");
    var input = ll.querySelector("input");
    var text =
      housing === "proprietaire"
        ? "Charges logement / loyer fictif"
        : housing === "heberge"
          ? "Loyer fictif"
          : "Loyer";
    ll.textContent = text;
    if (input) ll.appendChild(input);
  }

  function title() {
    var t = Lib.typeLabel(type);
    var h = type === "rac" ? " - " + Lib.housingLabel(housing) : "";
    document.getElementById("simTitle").textContent = "Simulateur " + t + h;
    document.getElementById("navSimLabel").textContent = "Simulation " + t;
  }

  function renderSynth() {
    collectInto(dossier);
    var s = Lib.synthesize(dossier);
    document.getElementById("totRev").textContent = Lib.euro(s.totalRevenus);
    document.getElementById("totChg").textContent = Lib.euro(s.totalCharges);
    document.getElementById("synMount").innerHTML =
      '<div class="pi-kpi"><strong>' +
      Lib.euro(s.totalRevenus) +
      "</strong><span>Total revenus</span></div>" +
      '<div class="pi-kpi"><strong>' +
      Lib.euro(s.totalCharges) +
      "</strong><span>Total charges</span></div>" +
      '<div class="pi-kpi"><strong>' +
      Lib.euro(s.creditsGardes) +
      "</strong><span>Crédits gardés / mois</span></div>" +
      '<div class="pi-kpi"><strong>' +
      Lib.euro(s.besoinTotal) +
      "</strong><span>Besoin total</span></div>" +
      '<div class="pi-kpi"><strong>' +
      Lib.euro(s.crd) +
      "</strong><span>CRD racheté</span></div>" +
      '<div class="pi-kpi"><strong>' +
      Lib.euro(s.resteAVivre) +
      "</strong><span>Reste à vivre (approx.)</span></div>" +
      '<div class="pi-kpi"><strong>' +
      s.dtiEstime +
      " %</strong><span>Endettement estimé</span></div>" +
      '<div class="pi-kpi"><strong>' +
      (s.avecHypo ? "Avec hypo" : "Sans hypo") +
      "</strong><span>Garantie</span></div>";
  }

  function collectInto(d) {
    d.rubrique = type;
    d.housing_status = housing;
    d.has_co = document.getElementById("hasCo").checked;
    d.emprunteur = readPerson("e");
    d.coemprunteur = d.has_co ? readPerson("c") : Lib.emptyPerson();
    d.emprunteur.profession = document.getElementById("profE").value;
    d.coemprunteur.profession = document.getElementById("profC").value;
    d.enfants_nb = Number(document.getElementById("enfantsNb").value) || 0;
    d.enfants_ages = String(document.getElementById("enfantsAges").value || "")
      .split(/[,;\s]+/)
      .filter(Boolean);
    d.logement = {
      adresse: document.getElementById("adr").value.trim(),
      cp: document.getElementById("cp").value.trim(),
      ville: document.getElementById("ville").value.trim(),
      anciennete: document.getElementById("anciennete").value,
    };
    d.propriete = {
      valeur_bien: Number(document.getElementById("valeurBien").value) || 0,
      depuis: document.getElementById("proprieteDepuis").value,
    };
    var heb = document.querySelector('input[name="hebType"]:checked');
    d.hebergement = {
      type: heb ? heb.value : "parents",
      loyer_partenaire: Number(document.getElementById("loyerPartenaire").value) || 0,
    };
    d.revenus = Object.assign(d.revenus || {}, readKeyed("data-rev"));
    d.charges = Object.assign(d.charges || {}, readKeyed("data-chg"));
    d.credits = Object.assign(d.credits || {}, readKeyed("data-cr"));
    d.credits.deja_rac = document.querySelector('input[name="dejaRac"]:checked').value === "1";
    var retBool = readKeyed("data-ret");
    var retNum = readKeyed("data-retn");
    d.retards = Object.assign(d.retards || {}, retBool, retNum);
    d.retards.fiche_bdf = document.querySelector('input[name="bdf"]:checked').value === "1";
    d.simulation = {
      frais_operation: Number(document.getElementById("fraisOp").value) || 0,
      ira: Number(document.getElementById("ira").value) || 0,
      honoraires: Number(document.getElementById("honoraires").value) || 0,
      avec_hypo: document.querySelector('input[name="garantie"]:checked').value === "1",
    };
    d.position = document.getElementById("position").value;
    d.banque = document.getElementById("banque").value.trim();
    d.produit = document.getElementById("produit").value.trim();
    d.apporteur = document.getElementById("apporteur").value.trim();
    d.reseau = document.getElementById("reseau").value.trim();
    d.utilisateur = document.getElementById("utilisateur").value.trim();
    d.analyste = document.getElementById("analyste").value.trim();
    d.gestionnaire = document.getElementById("gestionnaire").value.trim();
    d.ddp = document.getElementById("ddp").checked;
    var syn = Lib.synthesize(d);
    d.montant = syn.besoinTotal;
    return d;
  }

  function applyDossier(d) {
    document.getElementById("dossierId").value = d.id || "";
    document.getElementById("hasCo").checked = !!d.has_co;
    document.getElementById("emprunteurFields").innerHTML = personHtml("e", d.emprunteur);
    document.getElementById("coemprunteurFields").innerHTML = personHtml("c", d.coemprunteur);
    document.getElementById("coemprunteurFields").style.opacity = d.has_co ? "1" : ".45";
    document.getElementById("enfantsNb").value = d.enfants_nb || 0;
    document.getElementById("enfantsAges").value = (d.enfants_ages || []).join(", ");
    document.getElementById("adr").value = (d.logement && d.logement.adresse) || "";
    document.getElementById("cp").value = (d.logement && d.logement.cp) || "";
    document.getElementById("ville").value = (d.logement && d.logement.ville) || "";
    document.getElementById("anciennete").value = (d.logement && d.logement.anciennete) || "";
    document.getElementById("valeurBien").value = (d.propriete && d.propriete.valeur_bien) || "";
    document.getElementById("proprieteDepuis").value = (d.propriete && d.propriete.depuis) || "";
    document.getElementById("loyerPartenaire").value = (d.hebergement && d.hebergement.loyer_partenaire) || "";
    if (d.hebergement && d.hebergement.type) {
      var hr = document.querySelector('input[name="hebType"][value="' + d.hebergement.type + '"]');
      if (hr) hr.checked = true;
    }
    document.getElementById("profE").value = (d.emprunteur && d.emprunteur.profession) || Lib.PROF_SITUATIONS[0];
    document.getElementById("profC").value = (d.coemprunteur && d.coemprunteur.profession) || Lib.PROF_SITUATIONS[0];
    fillKeyed("data-rev", d.revenus || {});
    fillKeyed("data-chg", d.charges || {});
    fillKeyed("data-cr", d.credits || {});
    document.querySelector('input[name="dejaRac"][value="' + (d.credits && d.credits.deja_rac ? "1" : "0") + '"]').checked = true;
    Object.keys(d.retards || {}).forEach(function (k) {
      var cb = document.querySelector('[data-ret="' + k + '"]');
      if (cb) cb.checked = !!d.retards[k];
      var n = document.querySelector('[data-retn="' + k + '"]');
      if (n && typeof d.retards[k] === "number") n.value = d.retards[k];
    });
    document.querySelector('input[name="bdf"][value="' + (d.retards && d.retards.fiche_bdf ? "1" : "0") + '"]').checked = true;
    document.getElementById("fraisOp").value = (d.simulation && d.simulation.frais_operation) || 0;
    document.getElementById("ira").value = (d.simulation && d.simulation.ira) || 0;
    document.getElementById("honoraires").value = (d.simulation && d.simulation.honoraires) || 0;
    document.querySelector('input[name="garantie"][value="' + (d.simulation && d.simulation.avec_hypo === false ? "0" : "1") + '"]').checked = true;
    document.getElementById("position").value = d.position || "brouillon";
    document.getElementById("banque").value = d.banque || "";
    document.getElementById("produit").value = d.produit || "";
    document.getElementById("apporteur").value = d.apporteur || "";
    document.getElementById("reseau").value = d.reseau || "";
    document.getElementById("utilisateur").value = d.utilisateur || "";
    document.getElementById("analyste").value = d.analyste || "";
    document.getElementById("gestionnaire").value = d.gestionnaire || "";
    document.getElementById("ddp").checked = !!d.ddp;
    document.getElementById("commentsList").innerHTML = (d.comments || [])
      .map(function (c) {
        return "<p style='font-size:.85rem;border-bottom:1px solid #eef2f7;padding:6px 0'><strong>" + esc(c.at || "") + "</strong> — " + esc(c.text) + "</p>";
      })
      .join("");
    renderSynth();
  }

  function initSelects() {
    var pe = document.getElementById("profE");
    var pc = document.getElementById("profC");
    pe.innerHTML = pc.innerHTML = Lib.PROF_SITUATIONS.map(function (s) {
      return "<option>" + esc(s) + "</option>";
    }).join("");
    document.getElementById("position").innerHTML = Lib.POSITIONS.map(function (p) {
      return '<option value="' + p.id + '">' + esc(p.label) + "</option>";
    }).join("");
  }

  // Load or create
  initSelects();
  if (params.get("id")) {
    dossier = Store.get(params.get("id"));
    if (dossier) {
      type = dossier.rubrique || type;
      housing = dossier.housing_status || housing;
    }
  }
  if (!dossier) {
    dossier = Lib.emptyDossier({
      rubrique: type,
      housing_status: housing,
      property_id: params.get("propertyId") || "",
      contact_id: params.get("contactId") || "",
    });
    if (Deep) {
      var inbound = Deep.readParams();
      if (inbound.propertyPrice) dossier.credits.projet = inbound.propertyPrice;
      if (inbound.downPayment) dossier.credits.besoin_client = Math.max(0, (inbound.propertyPrice || 0) - inbound.downPayment);
      if (inbound.income) dossier.revenus.salaire_e = inbound.income;
      if (inbound.propertyId) dossier.property_id = inbound.propertyId;
      if (inbound.contactId) dossier.contact_id = inbound.contactId;
    }
    if (params.get("propertyPrice")) dossier.credits.projet = Number(params.get("propertyPrice")) || 0;
  }

  title();
  syncHousingUI();
  applyDossier(dossier);

  document.getElementById("hasCo").onchange = function () {
    document.getElementById("coemprunteurFields").style.opacity = this.checked ? "1" : ".45";
  };

  document.getElementById("simForm").addEventListener("input", function () {
    renderSynth();
  });
  document.getElementById("simForm").addEventListener("change", function () {
    renderSynth();
  });

  document.getElementById("btnSimuler").onclick = function () {
    renderSynth();
    document.getElementById("simMsg").textContent = "Synthèse recalculée (indicatif).";
  };

  document.getElementById("simForm").onsubmit = function (e) {
    e.preventDefault();
    collectInto(dossier);
    var note = document.getElementById("newComment").value.trim();
    if (note) {
      dossier.comments = dossier.comments || [];
      dossier.comments.push({ at: new Date().toLocaleString("fr-FR"), text: note });
      document.getElementById("newComment").value = "";
    }
    if (dossier.position === "brouillon") dossier.position = "simulation";
    dossier = Store.upsert(dossier);
    document.getElementById("dossierId").value = dossier.id;
    document.getElementById("simMsg").style.color = "#065f46";
    document.getElementById("simMsg").textContent = "Enregistré — " + dossier.ref;
    applyDossier(dossier);
  };

  document.getElementById("btnProspect").onclick = function () {
    collectInto(dossier);
    dossier = Store.upsert(dossier);
    var url =
      Deep && Deep.creditUrl
        ? Deep.creditUrl({
            propertyPrice: dossier.credits.projet || dossier.montant,
            downPayment: 0,
            loanDuration: 25,
            income: dossier.revenus.salaire_e,
            propertyId: dossier.property_id,
            contactId: dossier.contact_id,
            utmSource: "crm-pret-immo",
          })
        : "./landings/credit-immo.html#demande";
    window.open(url, "_blank", "noopener");
  };

  document.getElementById("btnTransmit").onclick = function () {
    collectInto(dossier);
    dossier.ddp = true;
    dossier.position = "ddp";
    dossier = Store.upsert(dossier);
    document.getElementById("ddp").checked = true;
    document.getElementById("simMsg").style.color = "#5b21b6";
    document.getElementById("simMsg").textContent = "Dossier marqué transmis (DDP) — " + dossier.ref;
  };
})();
