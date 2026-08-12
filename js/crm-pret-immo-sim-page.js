(function () {
  "use strict";

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
  var type = String(params.get("type") || "immo").toLowerCase();
  var housing = params.get("housing") || "proprietaire";

  if (type === "pvh") {
    location.href = "./crm-pret-immo-pvh.html";
    return;
  }

  var TITLE_MAP = {
    immo: "Simulateur / Transmettre dossier IMMO",
    sci: "Simulateur / Transmettre dossier SCI",
    scpi: "Simulateur / Transmettre dossier SCPI",
    conso: "Simulateur / Transmettre dossier CONSO",
    hypo: "Simulateur / Transmettre dossier prêt hypothécaire",
    viager: "Simulateur / Transmettre dossier prêt Viager",
    rac: "Simulateur / Transmettre dossier RAC"
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function $(id) {
    return document.getElementById(id);
  }

  function val(id, fallback) {
    var el = $(id);
    if (!el) return fallback == null ? "" : fallback;
    if (el.type === "checkbox") return !!el.checked;
    if (el.type === "number") {
      var n = Number(el.value);
      return isNaN(n) ? 0 : n;
    }
    return String(el.value || "").trim();
  }

  function setVal(id, v) {
    var el = $(id);
    if (!el) return;
    if (el.type === "checkbox") {
      el.checked = !!v;
      return;
    }
    el.value = v == null || v === "" ? "" : String(v);
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
      '<label>Nom de jeune fille<input data-p="' +
      prefix +
      '" data-f="nom_jeune_fille" value="' +
      esc(person.nom_jeune_fille) +
      '" /></label>' +
      '<label>Date de naissance<input type="date" data-p="' +
      prefix +
      '" data-f="birthdate" value="' +
      esc(person.birthdate) +
      '" /></label>' +
      '<label>Lieu de naissance<input data-p="' +
      prefix +
      '" data-f="birthplace" value="' +
      esc(person.birthplace) +
      '" /></label>' +
      '<label>Département<input data-p="' +
      prefix +
      '" data-f="birth_dept" value="' +
      esc(person.birth_dept) +
      '" /></label>' +
      '<label>Pays de naissance<input data-p="' +
      prefix +
      '" data-f="birth_country" value="' +
      esc(person.birth_country || "France") +
      '" /></label>' +
      '<label>Nationalité<input data-p="' +
      prefix +
      '" data-f="nationality" value="' +
      esc(person.nationality || "Française") +
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
      if (!data || data[key] == null) return;
      if (el.type === "checkbox") el.checked = !!data[key];
      else el.value = data[key];
    });
  }

  function readKeyed(attr, root) {
    var out = {};
    (root || document).querySelectorAll("[" + attr + "]").forEach(function (el) {
      var k = el.getAttribute(attr);
      out[k] = el.type === "checkbox" ? el.checked : el.type === "number" ? Number(el.value) || 0 : el.value;
    });
    return out;
  }

  function applyTypeVisibility() {
    document.querySelectorAll(".type-only").forEach(function (el) {
      var show = String(el.getAttribute("data-show") || "");
      var ok = show.split(/[,\s]+/).filter(Boolean).indexOf(type) >= 0;
      el.classList.toggle("is-on", ok);
    });
    var sum = $("sumProjet");
    if (sum) {
      sum.textContent =
        type === "sci" ? "2. Le projet" : type === "rac" ? "1. Le projet (RAC)" : "1. Le projet";
    }
    if ($("simTitle")) $("simTitle").textContent = TITLE_MAP[type] || "Simulateur / Transmettre dossier";
    var nav = $("navSim");
    if (nav) nav.textContent = "Simulation " + Lib.typeLabel(type);

    /* RAC : afficher le bloc crédits pour saisir les prêts à racheter */
    if (type === "rac") {
      setVal("togConso", true);
      if ($("blockCredits")) $("blockCredits").hidden = false;
    }
  }

  function syncTogglesUI() {
    if ($("blockBanque")) $("blockBanque").hidden = !val("togBanque");
    if ($("blockCredits")) $("blockCredits").hidden = !(val("togConso") || type === "rac");
    if ($("blockRetard")) $("blockRetard").hidden = !val("togRetard");
  }

  function projectTypeOptions() {
    var list = Lib.IMMO_PROJECT_TYPES.slice();
    if (type === "sci") list = ["Locatif", "Ancien", "VEFA", "Autre"];
    if (type === "scpi") list = ["SCPI", "Autre"];
    if (type === "conso") list = ["Trésorerie", "Travaux", "Auto", "Autre"];
    return list;
  }

  function initSelects() {
    var pe = $("profE");
    var pc = $("profC");
    var opts = Lib.PROF_SITUATIONS.map(function (s) {
      return "<option>" + esc(s) + "</option>";
    }).join("");
    if (pe) pe.innerHTML = opts;
    if (pc) pc.innerHTML = opts;
    if ($("position")) {
      $("position").innerHTML = Lib.POSITIONS.map(function (p) {
        return '<option value="' + p.id + '">' + esc(p.label) + "</option>";
      }).join("");
    }
    if ($("projetType")) {
      $("projetType").innerHTML = projectTypeOptions()
        .map(function (t) {
          return "<option>" + esc(t) + "</option>";
        })
        .join("");
    }
    if ($("logementType")) {
      $("logementType").innerHTML = Lib.LOGEMENT_TYPES.map(function (t) {
        return "<option>" + esc(t) + "</option>";
      }).join("");
    }
  }

  function collectProjet() {
    var p = Lib.emptyProjet();
    p.type = val("projetType") || p.type;
    p.emprunteur_type = val("emprunteurType") || "physique";
    p.prix_achat = val("prixAchat", 0);
    p.travaux = val("travaux", 0);
    p.frais_notaire = val("fraisNotaire", 0);
    p.frais_garantie = val("fraisGarantie", 0);
    p.frais_dossier = val("fraisDossier", 0);
    p.frais_mandat = val("fraisMandat", 0);
    p.frais_mutation = val("fraisMutation", 0);
    p.frais_divers = val("fraisDivers", 0);
    p.apport = val("apport", 0);
    p.duree_mois = val("dureeMois", 300) || 300;
    p.taux = val("taux", 3.5);
    p.assurance_e_taux = val("assurETaux", 0.34);
    p.assurance_e_quotite = val("assurEQuot", 100);
    p.assurance_c_taux = val("assurCTaux", 0.34);
    p.assurance_c_quotite = val("assurCQuot", 0);
    p.sci_nom = val("sciNom");
    p.sci_rp = val("sciRp");
    p.scpi_nom = val("scpiNom");
    p.scpi_parts = val("scpiParts", 0);
    p.scpi_valeur_part = val("scpiValeur", 0);
    p.objet = val("objetPret");
    p.viager_type_bien = val("viagerType") || "rp";

    var hypoV = val("hypoValeur", 0);
    var hypoM = val("hypoMontant", 0);
    if (type === "hypo") {
      p.hypo_valeur_bien = hypoV;
      p.hypo_montant = hypoM;
    } else if (type === "viager") {
      p.viager_valeur = hypoV;
      p.viager_montant = hypoM;
      p.hypo_valeur_bien = hypoV;
      p.hypo_montant = hypoM;
    }
    if (type === "conso") {
      var cm = val("consoMontant", 0);
      p.prix_achat = cm;
    }
    return p;
  }

  function applyProjet(p) {
    p = p || Lib.emptyProjet();
    setVal("projetType", p.type);
    setVal("emprunteurType", p.emprunteur_type || "physique");
    setVal("prixAchat", p.prix_achat || "");
    setVal("travaux", p.travaux || "");
    setVal("fraisNotaire", p.frais_notaire || "");
    setVal("fraisGarantie", p.frais_garantie || "");
    setVal("fraisDossier", p.frais_dossier || "");
    setVal("fraisMandat", p.frais_mandat || "");
    setVal("fraisMutation", p.frais_mutation || "");
    setVal("fraisDivers", p.frais_divers || "");
    setVal("apport", p.apport || "");
    setVal("dureeMois", p.duree_mois || 300);
    setVal("taux", p.taux != null ? p.taux : 3.5);
    setVal("assurETaux", p.assurance_e_taux != null ? p.assurance_e_taux : 0.34);
    setVal("assurEQuot", p.assurance_e_quotite != null ? p.assurance_e_quotite : 100);
    setVal("assurCTaux", p.assurance_c_taux != null ? p.assurance_c_taux : 0.34);
    setVal("assurCQuot", p.assurance_c_quotite || 0);
    setVal("sciNom", p.sci_nom);
    setVal("sciRp", !!p.sci_rp);
    setVal("scpiNom", p.scpi_nom);
    setVal("scpiParts", p.scpi_parts || "");
    setVal("scpiValeur", p.scpi_valeur_part || "");
    setVal("objetPret", p.objet);
    setVal("viagerType", p.viager_type_bien || "rp");
    setVal("hypoValeur", p.hypo_valeur_bien || p.viager_valeur || "");
    setVal("hypoMontant", p.hypo_montant || p.viager_montant || "");
    setVal("consoMontant", type === "conso" ? p.prix_achat || "" : "");
  }

  function collectInto(d) {
    d.rubrique = type;
    d.housing_status = housing;
    d.has_co = val("hasCo");
    d.emprunteur = readPerson("e");
    d.coemprunteur = d.has_co ? readPerson("c") : Lib.emptyPerson();
    d.emprunteur.profession = val("profE") || d.emprunteur.profession;
    d.coemprunteur.profession = val("profC") || d.coemprunteur.profession;
    d.emprunteur.employeur = val("employeurE");
    d.coemprunteur.employeur = val("employeurC");
    d.enfants_nb = val("enfantsNb", 0);
    d.enfants_ages = String(val("enfantsAges") || "")
      .split(/[,;\s]+/)
      .filter(Boolean);
    d.logement = {
      adresse: val("adr"),
      cp: val("cp"),
      ville: val("ville"),
      type: val("logementType"),
      anciennete: val("anciennete")
    };
    d.projet = collectProjet();
    d.revenus = Object.assign(d.revenus || {}, readKeyed("data-rev"));
    d.charges = Object.assign(d.charges || {}, readKeyed("data-chg"));
    d.credits = Object.assign(d.credits || {}, readKeyed("data-cr"));
    if (type === "conso") {
      d.credits.besoin_client = d.projet.prix_achat;
      d.credits.projet = d.projet.prix_achat;
    }
    var retBool = readKeyed("data-ret");
    var retNum = readKeyed("data-retn");
    d.retards = Object.assign(d.retards || {}, retBool, retNum);
    d.toggles = {
      autres_biens: val("togAutresBiens"),
      biens_sci: val("togBiensSci"),
      credits_conso: val("togConso"),
      epargne: val("togEpargne"),
      banque: val("togBanque"),
      retard: val("togRetard")
    };
    d.epargne = val("epargne", 0);
    d.banque_detail = {
      nom: val("banqueNom"),
      iban: val("banqueIban"),
      bic: val("banqueBic"),
      carte: val("banqueCarte") || "aucune",
      anciennete: ""
    };
    d.simulation = {
      frais_operation: val("fraisOp", 0),
      ira: val("ira", 0),
      honoraires: val("honoraires", 0),
      avec_hypo: $("avecHypo") ? val("avecHypo") : true
    };
    d.position = val("position") || "brouillon";
    d.banque = val("banque");
    d.produit = val("produit");
    d.apporteur = val("apporteur");
    d.reseau = val("reseau");
    d.utilisateur = val("utilisateur");
    d.analyste = val("analyste");
    d.ddp = val("ddp");
    var syn = Lib.synthesize(d);
    d.montant = syn.besoinTotal;
    return d;
  }

  function renderSide(s) {
    var rows = [
      ["Montant achat / projet", Lib.euro(s.prixAchat || s.coutProjet)],
      ["Apport", Lib.euro(s.apport)],
      ["À financer", Lib.euro(s.aFinancer || s.besoinTotal)],
      ["Durée", (s.dureeMois || 0) + " mois"],
      ["Taux d'intérêt", (Number(s.taux) || 0).toFixed(2).replace(".", ",") + " %"],
      ["Mensualité H.A.", Lib.euro(s.mensHa)],
      ["Mensualité A.C.", Lib.euro(s.mensAc)],
      ["DTI avant", (s.dtiAvant || 0).toFixed(1).replace(".", ",") + " %"],
      ["DTI après", (s.dtiApres || 0).toFixed(1).replace(".", ",") + " %"],
      ["Reste à vivre", Lib.euro(s.rav)],
      ["RAV / pers.", Lib.euro(s.ravPers)],
      ["Ratio hypothécaire", (s.ratioHypo || 0).toFixed(1).replace(".", ",") + " %"]
    ];
    if ($("sideRows")) {
      $("sideRows").innerHTML = rows
        .map(function (r) {
          return '<div class="row"><span>' + esc(r[0]) + "</span><strong>" + esc(r[1]) + "</strong></div>";
        })
        .join("");
    }
    var solv = $("sideSolv");
    if (solv) {
      solv.className = "pi-solv " + (s.solvabilite || "ok");
      solv.textContent =
        s.solvabilite === "ok"
          ? "Solvabilité favorable"
          : s.solvabilite === "vigilance"
            ? "Solvabilité limite"
            : "Hors normes (indicatif)";
    }
    if ($("sideBar")) {
      var pct = Math.max(0, Math.min(100, s.ratioHypo || s.dtiApres || 0));
      $("sideBar").style.width = pct + "%";
      $("sideBar").style.background =
        pct > 80 ? "#dc2626" : pct > 60 ? "#f59e0b" : "#7c3aed";
    }
  }

  function renderSynth() {
    collectInto(dossier);
    var s = Lib.synthesize(dossier);
    if ($("totRev")) $("totRev").textContent = Lib.euro(s.totalRevenus);
    if ($("totChg")) $("totChg").textContent = Lib.euro(s.totalCharges);
    renderSide(s);
    if ($("synMount")) {
      $("synMount").innerHTML =
        '<div class="pi-kpi"><strong>' +
        Lib.euro(s.coutProjet) +
        "</strong><span>Coût projet</span></div>" +
        '<div class="pi-kpi"><strong>' +
        Lib.euro(s.aFinancer || s.besoinTotal) +
        "</strong><span>Montant à financer</span></div>" +
        '<div class="pi-kpi"><strong>' +
        Lib.euro(s.mensHa) +
        "</strong><span>Mensualité H.A.</span></div>" +
        '<div class="pi-kpi"><strong>' +
        Lib.euro(s.mensAc) +
        "</strong><span>Mensualité A.C.</span></div>" +
        '<div class="pi-kpi"><strong>' +
        (s.dtiAvant || 0).toFixed(1).replace(".", ",") +
        " %</strong><span>Endettement avant</span></div>" +
        '<div class="pi-kpi"><strong>' +
        (s.dtiApres || 0).toFixed(1).replace(".", ",") +
        " %</strong><span>Endettement après</span></div>" +
        '<div class="pi-kpi"><strong>' +
        Lib.euro(s.rav) +
        "</strong><span>Reste à vivre</span></div>" +
        '<div class="pi-kpi"><strong>' +
        Lib.euro(s.ravPers) +
        "</strong><span>RAV / personne</span></div>" +
        '<div class="pi-kpi"><strong>' +
        (s.ratioHypo || 0).toFixed(1).replace(".", ",") +
        " %</strong><span>Ratio hypothécaire</span></div>" +
        (type === "rac"
          ? '<div class="pi-kpi"><strong>' +
            Lib.euro(s.crd) +
            "</strong><span>CRD racheté</span></div>"
          : "");
    }
  }

  function openConsoModal() {
    collectInto(dossier);
    var d = Lib.consoDetail(dossier);
    var body = $("consoModalBody");
    if (!body) return;
    body.innerHTML =
      "<table><thead><tr><th></th><th>Mensualité projet</th><th>Mens. conservées</th><th>CRD</th></tr></thead><tbody>" +
      "<tr><td>Projet</td><td>" +
      Lib.euro(d.projetMens) +
      "</td><td>—</td><td>" +
      Lib.euro(dossier.montant || 0) +
      "</td></tr>" +
      "<tr><td>Frais de dossier 1%</td><td>—</td><td>—</td><td>" +
      Lib.euro(d.fraisDossier) +
      "</td></tr>" +
      "<tr><td>Mandat obligatoire 1%</td><td>—</td><td>—</td><td>" +
      Lib.euro(d.mandat) +
      "</td></tr>" +
      "<tr><td><strong>Sous-total</strong></td><td><strong>" +
      Lib.euro(d.sousTotalMens) +
      "</strong></td><td>—</td><td><strong>" +
      Lib.euro(d.sousTotalCrd) +
      "</strong></td></tr>" +
      "<tr><td>Crédit résidence principale</td><td>—</td><td>" +
      Lib.euro(d.rpMens) +
      "</td><td>" +
      Lib.euro(d.rpCrd) +
      "</td></tr>" +
      "<tr><td>Crédit consommation existant</td><td>—</td><td>" +
      Lib.euro(d.consoMens) +
      "</td><td>" +
      Lib.euro(d.consoCrd) +
      "</td></tr>" +
      "<tr><td><strong>Total</strong></td><td><strong>" +
      Lib.euro(d.totalMens) +
      "</strong></td><td>—</td><td><strong>" +
      Lib.euro(d.totalCrd) +
      "</strong></td></tr>" +
      "</tbody></table>" +
      '<table style="margin-top:12px;max-width:360px"><tbody>' +
      "<tr><td><strong>Taux d'endettement</strong></td><td>" +
      d.dti.toFixed(1).replace(".", ",") +
      " %</td></tr>" +
      "<tr><td><strong>Reste à vivre</strong></td><td>" +
      Lib.euro(d.rav) +
      "</td></tr>" +
      "<tr><td><strong>Reste à vivre / pers.</strong></td><td>" +
      Lib.euro(d.ravPers) +
      "</td></tr>" +
      "</tbody></table>";
    if ($("consoModal")) $("consoModal").classList.add("open");
  }

  function applyDossier(d) {
    setVal("dossierId", d.id || "");
    setVal("hasCo", !!d.has_co);
    if ($("emprunteurFields")) $("emprunteurFields").innerHTML = personHtml("e", d.emprunteur);
    if ($("coemprunteurFields")) {
      $("coemprunteurFields").innerHTML = personHtml("c", d.coemprunteur);
      $("coemprunteurFields").style.opacity = d.has_co ? "1" : ".45";
    }
    setVal("enfantsNb", d.enfants_nb || 0);
    setVal("enfantsAges", (d.enfants_ages || []).join(", "));
    setVal("adr", (d.logement && d.logement.adresse) || "");
    setVal("cp", (d.logement && d.logement.cp) || "");
    setVal("ville", (d.logement && d.logement.ville) || "");
    setVal("logementType", (d.logement && d.logement.type) || Lib.LOGEMENT_TYPES[0]);
    setVal("anciennete", (d.logement && d.logement.anciennete) || "");
    setVal("profE", (d.emprunteur && d.emprunteur.profession) || Lib.PROF_SITUATIONS[0]);
    setVal("profC", (d.coemprunteur && d.coemprunteur.profession) || Lib.PROF_SITUATIONS[0]);
    setVal("employeurE", (d.emprunteur && d.emprunteur.employeur) || "");
    setVal("employeurC", (d.coemprunteur && d.coemprunteur.employeur) || "");
    applyProjet(d.projet);
    fillKeyed("data-rev", d.revenus || {});
    fillKeyed("data-chg", d.charges || {});
    fillKeyed("data-cr", d.credits || {});
    Object.keys(d.retards || {}).forEach(function (k) {
      var cb = document.querySelector('[data-ret="' + k + '"]');
      if (cb) cb.checked = !!d.retards[k];
      var n = document.querySelector('[data-retn="' + k + '"]');
      if (n && typeof d.retards[k] === "number") n.value = d.retards[k];
    });
    var tog = d.toggles || {};
    setVal("togAutresBiens", !!tog.autres_biens);
    setVal("togBiensSci", !!tog.biens_sci);
    setVal("togConso", !!tog.credits_conso || type === "rac");
    setVal("togEpargne", !!tog.epargne);
    setVal("togBanque", tog.banque !== false);
    setVal("togRetard", !!tog.retard);
    setVal("epargne", d.epargne || "");
    var bd = d.banque_detail || {};
    setVal("banqueNom", bd.nom || "");
    setVal("banqueIban", bd.iban || "");
    setVal("banqueBic", bd.bic || "");
    setVal("banqueCarte", bd.carte || "aucune");
    setVal("fraisOp", (d.simulation && d.simulation.frais_operation) || 0);
    setVal("ira", (d.simulation && d.simulation.ira) || 0);
    setVal("honoraires", (d.simulation && d.simulation.honoraires) || 0);
    setVal("avecHypo", !d.simulation || d.simulation.avec_hypo !== false);
    setVal("position", d.position || "brouillon");
    setVal("banque", d.banque || "");
    setVal("produit", d.produit || "");
    setVal("apporteur", d.apporteur || "");
    setVal("reseau", d.reseau || "");
    setVal("utilisateur", d.utilisateur || "");
    setVal("analyste", d.analyste || "");
    setVal("ddp", !!d.ddp);
    if ($("commentsList")) {
      $("commentsList").innerHTML = (d.comments || [])
        .map(function (c) {
          return (
            "<p style='font-size:.85rem;border-bottom:1px solid #eef2f7;padding:6px 0'><strong>" +
            esc(c.at || "") +
            "</strong> — " +
            esc(c.text) +
            "</p>"
          );
        })
        .join("");
    }
    syncTogglesUI();
    renderSynth();
  }

  function msg(text, color) {
    var el = $("simMsg");
    if (!el) return;
    el.style.color = color || "#64748b";
    el.textContent = text || "";
  }

  function saveDossier(opts) {
    opts = opts || {};
    collectInto(dossier);
    var note = val("newComment");
    if (note) {
      dossier.comments = dossier.comments || [];
      dossier.comments.push({ at: new Date().toLocaleString("fr-FR"), text: note });
      setVal("newComment", "");
    }
    if (opts.asProspect && dossier.position === "brouillon") dossier.position = "simulation";
    if (opts.transmit) {
      dossier.ddp = true;
      dossier.position = "ddp";
    } else if (dossier.position === "brouillon") {
      dossier.position = "simulation";
    }
    dossier = Store.upsert(dossier);
    setVal("dossierId", dossier.id);
    if (!params.get("id")) {
      params.set("id", dossier.id);
      history.replaceState({}, "", "?" + params.toString());
    }
    applyDossier(dossier);
    return dossier;
  }

  /* Boot */
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
      contact_id: params.get("contactId") || ""
    });
    if (Deep && Deep.readParams) {
      var inbound = Deep.readParams();
      if (inbound.propertyPrice) {
        dossier.projet.prix_achat = inbound.propertyPrice;
        dossier.credits.projet = inbound.propertyPrice;
      }
      if (inbound.downPayment != null) dossier.projet.apport = inbound.downPayment;
      if (inbound.loanDuration) dossier.projet.duree_mois = Math.round(inbound.loanDuration * 12);
      if (inbound.income) dossier.revenus.salaire_e = inbound.income;
      if (inbound.propertyId) dossier.property_id = inbound.propertyId;
      if (inbound.contactId) dossier.contact_id = inbound.contactId;
    }
    if (params.get("propertyPrice")) {
      var pp = Number(params.get("propertyPrice")) || 0;
      dossier.projet.prix_achat = pp;
      dossier.credits.projet = pp;
    }
  }

  applyTypeVisibility();
  applyDossier(dossier);

  if ($("hasCo")) {
    $("hasCo").onchange = function () {
      if ($("coemprunteurFields")) $("coemprunteurFields").style.opacity = this.checked ? "1" : ".45";
      renderSynth();
    };
  }

  ["togBanque", "togConso", "togRetard", "togEpargne", "togAutresBiens", "togBiensSci"].forEach(function (id) {
    var el = $(id);
    if (el) {
      el.addEventListener("change", function () {
        syncTogglesUI();
        renderSynth();
      });
    }
  });

  if ($("simForm")) {
    $("simForm").addEventListener("input", renderSynth);
    $("simForm").addEventListener("change", renderSynth);
    $("simForm").onsubmit = function (e) {
      e.preventDefault();
      saveDossier();
      msg("Enregistré — " + dossier.ref, "#065f46");
    };
  }

  if ($("btnSimuler")) {
    $("btnSimuler").onclick = function () {
      renderSynth();
      msg("Synthèse recalculée (indicatif).");
    };
  }

  if ($("btnProspect")) {
    $("btnProspect").onclick = function () {
      saveDossier({ asProspect: true });
      var url =
        Deep && Deep.creditUrl
          ? Deep.creditUrl({
              propertyPrice: dossier.projet.prix_achat || dossier.montant,
              downPayment: dossier.projet.apport || 0,
              loanDuration: Math.round((dossier.projet.duree_mois || 300) / 12),
              income: dossier.revenus.salaire_e,
              propertyId: dossier.property_id,
              contactId: dossier.contact_id,
              utmSource: "crm-pret-immo"
            })
          : "./landings/credit-immo.html#demande";
      window.open(url, "_blank", "noopener");
      msg("Dossier enregistré — ouverture demande publique.", "#ea580c");
    };
  }

  if ($("btnTransmit")) {
    $("btnTransmit").onclick = function () {
      saveDossier({ transmit: true });
      setVal("ddp", true);
      msg("Dossier marqué transmis (DDP) — " + dossier.ref, "#5b21b6");
    };
  }

  if ($("btnConsoDetail")) $("btnConsoDetail").onclick = openConsoModal;
  if ($("btnCloseConso")) {
    $("btnCloseConso").onclick = function () {
      if ($("consoModal")) $("consoModal").classList.remove("open");
    };
  }
  if ($("consoModal")) {
    $("consoModal").addEventListener("click", function (e) {
      if (e.target === $("consoModal")) $("consoModal").classList.remove("open");
    });
  }
})();
