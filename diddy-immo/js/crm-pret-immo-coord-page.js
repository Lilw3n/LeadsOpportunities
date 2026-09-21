(function () {
  "use strict";

  var Lib = window.CrmPretImmo;
  var Store = window.CrmPretImmoStore;
  if (!Lib || !Store) return;
  if (!localStorage.getItem("lo_token")) {
    location.href = "./crm.html";
    return;
  }

  var params = new URLSearchParams(location.search);
  var dossier = null;

  function $(id) {
    return document.getElementById(id);
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function radio(name, value) {
    var el = document.querySelector('input[name="' + name + '"][value="' + value + '"]');
    if (el) el.checked = true;
  }

  function radioVal(name, fallback) {
    var el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : fallback;
  }

  function initSelects() {
    $("rubrique").innerHTML = Lib.SIM_TYPES.filter(function (t) {
      return t.group === "simulation";
    })
      .map(function (t) {
        return '<option value="' + t.id + '">' + esc(t.label) + " — " + esc(t.desc) + "</option>";
      })
      .join("");

    $("eSituation").innerHTML = Lib.MARITAL.map(function (m) {
      return "<option>" + esc(m) + "</option>";
    }).join("");

    var pro = Lib.PROF_SITUATIONS.map(function (s) {
      return "<option>" + esc(s) + "</option>";
    }).join("");
    $("ePro").innerHTML = pro;
    $("cPro").innerHTML = pro;

    $("logementType").innerHTML = Lib.LOGEMENT_TYPES.map(function (t) {
      return "<option>" + esc(t) + "</option>";
    }).join("");
  }

  function toggleCo() {
    var on = $("hasCo").checked;
    $("coBlock").hidden = !on;
  }

  function apply(d) {
    $("dossierId").value = d.id || "";
    $("delegation").checked = !!d.delegation;
    $("rubrique").value = d.rubrique || "immo";
    $("respNom").value = (d.responsable && d.responsable.nom) || d.utilisateur || "";
    $("respEmail").value = (d.responsable && d.responsable.email) || "";
    $("respTel").value = (d.responsable && d.responsable.tel) || "";

    var e = d.emprunteur || Lib.emptyPerson();
    radio("e_civ", e.civilite || "m");
    $("eNom").value = e.nom || "";
    $("ePrenom").value = e.prenom || "";
    $("eBirth").value = e.birthdate || "";
    $("eBirthplace").value = e.birthplace || "";
    $("ePhone").value = e.phone || "";
    $("eEmail").value = e.email || "";
    $("eProf").value = e.profession || "";
    $("eAnciennete").value = d.emprunteur_anciennete || e.pro_debut || "";
    $("eSituation").value = e.situation || Lib.MARITAL[0];
    $("ePro").value = e.situation_pro || Lib.PROF_SITUATIONS[0];
    $("eEnfants").value = d.enfants_nb || 0;

    $("hasCo").checked = !!d.has_co;
    var c = d.coemprunteur || Lib.emptyPerson();
    radio("c_civ", c.civilite || "m");
    $("cNom").value = c.nom || "";
    $("cPrenom").value = c.prenom || "";
    $("cBirth").value = c.birthdate || "";
    $("cBirthplace").value = c.birthplace || "";
    $("cPhone").value = c.phone || "";
    $("cEmail").value = c.email || "";
    $("cProf").value = c.profession || "";
    $("cAnciennete").value = d.coemprunteur_anciennete || "";
    $("cPro").value = c.situation_pro || Lib.PROF_SITUATIONS[0];
    toggleCo();

    var log = d.logement || {};
    $("adr").value = log.adresse || "";
    $("cp").value = log.cp || "";
    $("ville").value = log.ville || "";
    $("logementType").value = log.type || Lib.LOGEMENT_TYPES[0];
    $("depuis").value = log.anciennete || "";
    $("infos").value = d.infos_complementaires || "";
  }

  function collect() {
    var e = Lib.emptyPerson();
    e.civilite = radioVal("e_civ", "m");
    e.nom = $("eNom").value.trim();
    e.prenom = $("ePrenom").value.trim();
    e.birthdate = $("eBirth").value;
    e.birthplace = $("eBirthplace").value.trim();
    e.phone = $("ePhone").value.trim();
    e.email = $("eEmail").value.trim();
    e.profession = $("eProf").value.trim();
    e.situation_pro = $("ePro").value;
    e.situation = $("eSituation").value;
    e.pro_debut = $("eAnciennete").value.trim();

    var c = Lib.emptyPerson();
    var hasCo = $("hasCo").checked;
    if (hasCo) {
      c.civilite = radioVal("c_civ", "m");
      c.nom = $("cNom").value.trim();
      c.prenom = $("cPrenom").value.trim();
      c.birthdate = $("cBirth").value;
      c.birthplace = $("cBirthplace").value.trim();
      c.phone = $("cPhone").value.trim();
      c.email = $("cEmail").value.trim();
      c.profession = $("cProf").value.trim();
      c.situation_pro = $("cPro").value;
      c.pro_debut = $("cAnciennete").value.trim();
    }

    var base = dossier || Lib.emptyDossier({});
    return Lib.emptyDossier(
      Object.assign({}, base, {
        id: $("dossierId").value || base.id || "",
        mode: "coordonnees",
        position: "coordonnees",
        ddp: true,
        delegation: $("delegation").checked,
        rubrique: $("rubrique").value || "immo",
        responsable: {
          nom: $("respNom").value.trim(),
          email: $("respEmail").value.trim(),
          tel: $("respTel").value.trim()
        },
        utilisateur: $("respNom").value.trim() || base.utilisateur || "",
        emprunteur: e,
        coemprunteur: c,
        has_co: hasCo,
        enfants_nb: Number($("eEnfants").value) || 0,
        emprunteur_anciennete: $("eAnciennete").value.trim(),
        coemprunteur_anciennete: $("cAnciennete").value.trim(),
        logement: {
          adresse: $("adr").value.trim(),
          cp: $("cp").value.trim(),
          ville: $("ville").value.trim(),
          type: $("logementType").value,
          anciennete: $("depuis").value
        },
        infos_complementaires: $("infos").value.trim(),
        housing_status:
          ($("logementType").value || "").toLowerCase().indexOf("propri") >= 0
            ? "proprietaire"
            : ($("logementType").value || "").toLowerCase().indexOf("locat") >= 0
              ? "locataire"
              : "heberge"
      })
    );
  }

  function msg(text, ok) {
    var el = $("coordMsg");
    el.style.color = ok ? "#065f46" : "#b91c1c";
    el.textContent = text || "";
  }

  initSelects();

  if (params.get("id")) {
    dossier = Store.get(params.get("id"));
  }
  if (!dossier) {
    dossier = Lib.emptyDossier({
      mode: "coordonnees",
      position: "coordonnees",
      rubrique: params.get("type") || "immo"
    });
  }
  apply(dossier);

  $("hasCo").addEventListener("change", toggleCo);

  $("coordForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!$("eNom").value.trim() || !$("ePrenom").value.trim() || !$("eEmail").value.trim() || !$("ePhone").value.trim()) {
      msg("Renseignez au minimum nom, prénom, e-mail et téléphone de l’emprunteur.");
      return;
    }
    dossier = collect();
    if (dossier.infos_complementaires) {
      dossier.comments = dossier.comments || [];
      var already = dossier.comments.some(function (c) {
        return c.text === dossier.infos_complementaires;
      });
      if (!already) {
        dossier.comments.push({
          at: new Date().toLocaleString("fr-FR"),
          text: dossier.infos_complementaires
        });
      }
    }
    dossier = Store.upsert(dossier);
    $("dossierId").value = dossier.id;
    if (!params.get("id")) {
      params.set("id", dossier.id);
      history.replaceState({}, "", "?" + params.toString());
    }
    msg(
      "Coordonnées enregistrées — " +
        dossier.ref +
        (dossier.delegation ? " (gestion déléguée)" : "") +
        ". Retrouvez la fiche dans Mes dossiers.",
      true
    );
  });
})();
