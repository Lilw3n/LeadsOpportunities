/**
 * Formulaire structuré — mandat de vente sans exclusivité.
 * Agence = champs libres (profil local) ; pas de marque réseau en dur.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.CrmImmoMandatForm = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  var FORM_URL = "./data/immo-mandat-vente-simple-form.json";
  var formCache = null;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function loadFormSchema() {
    if (formCache) return Promise.resolve(formCache);
    return fetch(FORM_URL, { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("Schéma formulaire mandat indisponible");
        return r.json();
      })
      .then(function (data) {
        formCache = data;
        return data;
      });
  }

  function emptyValues(schema) {
    var out = { templateId: schema.id, forme: schema.forme || "Simple" };
    (schema.sections || []).forEach(function (sec) {
      out[sec.id] = {};
      (sec.fields || []).forEach(function (f) {
        out[sec.id][f.id] = f.default != null ? f.default : "";
      });
    });
    return out;
  }

  function loadAgencyProfil(schema) {
    var key = (schema && schema.agencyStorageKey) || "lo_immo_mandat_agence_profil_v1";
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveAgencyProfil(schema, agence) {
    var key = (schema && schema.agencyStorageKey) || "lo_immo_mandat_agence_profil_v1";
    try {
      localStorage.setItem(
        key,
        JSON.stringify(Object.assign({}, agence || {}, { savedAt: new Date().toISOString() }))
      );
    } catch (e) {}
  }

  function listFeeAgencies() {
    try {
      if (window.CrmAgencyFees && typeof window.CrmAgencyFees.listAgencies === "function") {
        return window.CrmAgencyFees.listAgencies() || [];
      }
    } catch (e) {}
    return [];
  }

  function mergeFromProperty(values, prop) {
    if (!prop) return values;
    var d = prop.details || {};
    values.mandatMeta = values.mandatMeta || {};
    values.bien = values.bien || {};
    values.prix = values.prix || {};
    values.duree = values.duree || {};
    if (d.n_mandat) values.mandatMeta.numero = d.n_mandat;
    if (d.date_mandat) values.duree.dateDebut = d.date_mandat;
    if (d.date_echeance) values.duree.dateFin = d.date_echeance;
    if (d.mandat_hors_etablissement === true || d.mandat_hors_etablissement === "oui") {
      values.mandatMeta.horsEtablissement = "oui";
    }
    if (d.designation_bien) values.bien.designation = d.designation_bien;
    values.bien.adresse = values.bien.adresse || prop.address || prop.title || "";
    values.bien.cp = values.bien.cp || prop.postal_code || "";
    values.bien.ville = values.bien.ville || prop.city || "";
    values.bien.typeBien = values.bien.typeBien || prop.property_type || "";
    if (prop.surface_m2) values.bien.surface = String(prop.surface_m2);
    if (prop.rooms) values.bien.pieces = String(prop.rooms);
    if (prop.price_net_seller) values.prix.prixNetVendeur = String(prop.price_net_seller);
    if (prop.price_fai) values.prix.prixFai = String(prop.price_fai);
    if (d.section_cadastrale || d.numero_cadastre) {
      values.bien.cadastre = [d.section_cadastrale, d.numero_cadastre, d.lieu_dit_cadastre]
        .filter(Boolean)
        .join(" ");
    }
    return values;
  }

  function readForm(mount) {
    var values = { templateId: "", forme: "Simple" };
    if (!mount) return values;
    var root = mount.querySelector("[data-mandat-form]");
    if (!root) return values;
    values.templateId = root.getAttribute("data-template") || "";
    values.forme = root.getAttribute("data-forme") || "Simple";
    root.querySelectorAll("[data-section]").forEach(function (secEl) {
      var sid = secEl.getAttribute("data-section");
      values[sid] = values[sid] || {};
      secEl.querySelectorAll("[data-field]").forEach(function (inp) {
        var fid = inp.getAttribute("data-field");
        if (inp.type === "checkbox") values[sid][fid] = inp.checked ? "oui" : "non";
        else values[sid][fid] = inp.value;
      });
    });
    return values;
  }

  function fieldHtml(f, value) {
    var v = value != null ? value : f.default != null ? f.default : "";
    var common =
      ' id="mf_' +
      esc(f.id) +
      '" data-field="' +
      esc(f.id) +
      '" class="mandat-form-input"';
    var html = '<label class="mandat-form-label">';
    html += "<span>" + esc(f.label) + (f.required ? " *" : "") + "</span>";
    if (f.type === "textarea") {
      html +=
        "<textarea rows=\"3\"" +
        common +
        (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : "") +
        ">" +
        esc(v) +
        "</textarea>";
    } else if (f.type === "select") {
      html += "<select" + common + ">";
      (f.options || []).forEach(function (opt) {
        html +=
          '<option value="' +
          esc(opt) +
          '"' +
          (String(v) === String(opt) ? " selected" : "") +
          ">" +
          esc(opt || "—") +
          "</option>";
      });
      html += "</select>";
    } else if (f.type === "tri") {
      html += "<select" + common + ">";
      ["", "oui", "non", "nsp"].forEach(function (opt) {
        var lab = opt === "" ? "—" : opt === "nsp" ? "N/S" : opt;
        html +=
          '<option value="' +
          esc(opt) +
          '"' +
          (String(v) === String(opt) ? " selected" : "") +
          ">" +
          esc(lab) +
          "</option>";
      });
      html += "</select>";
    } else {
      html +=
        '<input type="' +
        esc(f.type === "number" ? "number" : f.type === "email" ? "email" : f.type === "date" ? "date" : "text") +
        '"' +
        common +
        ' value="' +
        esc(v) +
        '"' +
        (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : "") +
        " />";
    }
    if (f.hint) html += '<small class="mandat-form-hint">' + esc(f.hint) + "</small>";
    html += "</label>";
    return html;
  }

  function render(mount, schema, values, opts) {
    if (!mount || !schema) return;
    opts = opts || {};
    values = values || emptyValues(schema);
    var agencies = listFeeAgencies();

    var html = [];
    html.push(
      '<div class="mandat-form" data-mandat-form data-template="' +
        esc(schema.id) +
        '" data-forme="' +
        esc(schema.forme || "Simple") +
        '">'
    );
    html.push('<div class="mandat-form__intro">');
    html.push("<h3>" + esc(schema.label) + "</h3>");
    html.push("<p>" + esc(schema.disclaimer) + "</p>");
    html.push("</div>");

    html.push('<div class="mandat-form__agency-pick">');
    html.push("<label><span>Lier à une agence (barèmes)</span>");
    html.push('<select id="mfAgencyPick"><option value="">— Saisie manuelle —</option>');
    agencies.forEach(function (a) {
      var selected = values.agence && values.agence.nom === a.name ? " selected" : "";
      html.push('<option value="' + esc(a.id) + '"' + selected + ">" + esc(a.name) + "</option>");
    });
    html.push("</select></label>");
    html.push(
      '<button type="button" class="btn btn-ghost btn-sm" id="mfSaveAgenceProfil">Mémoriser cette agence</button>'
    );
    html.push(
      '<a class="btn btn-ghost btn-sm" href="./crm-agency-fees.html">Gérer les agences</a>'
    );
    html.push("</div>");

    (schema.sections || []).forEach(function (sec) {
      html.push('<section class="mandat-form__section" data-section="' + esc(sec.id) + '">');
      html.push("<h4>" + esc(sec.label) + "</h4>");
      if (sec.hint) html.push('<p class="mandat-form-hint">' + esc(sec.hint) + "</p>");
      html.push('<div class="mandat-form__grid">');
      var secVals = values[sec.id] || {};
      (sec.fields || []).forEach(function (f) {
        html.push(fieldHtml(f, secVals[f.id]));
      });
      html.push("</div></section>");
    });

    html.push('<div class="mandat-form__actions">');
    html.push(
      '<button type="button" class="btn btn-primary" id="mfApplyToDoc">Appliquer au document</button>'
    );
    html.push(
      '<button type="button" class="btn btn-ghost" id="mfHideForm">Masquer le formulaire</button>'
    );
    html.push("</div>");
    html.push("</div>");

    mount.innerHTML = html.join("");
    mount.hidden = false;

    var pick = document.getElementById("mfAgencyPick");
    if (pick) {
      pick.onchange = function () {
        var id = pick.value;
        if (!id) return;
        var ag = agencies.find(function (a) {
          return a.id === id;
        });
        if (!ag) return;
        var nom = mount.querySelector('[data-section="agence"] [data-field="nom"]');
        if (nom) nom.value = ag.name || "";
      };
    }
    var saveBtn = document.getElementById("mfSaveAgenceProfil");
    if (saveBtn) {
      saveBtn.onclick = function () {
        var current = readForm(mount);
        saveAgencyProfil(schema, current.agence || {});
        alert("Profil agence mémorisé sur cet appareil (pour les prochains mandats).");
      };
    }
    if (opts.onApply) {
      var apply = document.getElementById("mfApplyToDoc");
      if (apply) apply.onclick = function () {
        opts.onApply(readForm(mount));
      };
    }
    if (opts.onHide) {
      var hide = document.getElementById("mfHideForm");
      if (hide) hide.onclick = opts.onHide;
    }
  }

  function line(label, value) {
    if (value == null || String(value).trim() === "") return null;
    return label + " : " + String(value).trim();
  }

  function buildParties(values) {
    var ag = values.agence || {};
    var m = values.mandant || {};
    return {
      mandataire: {
        nom: ag.nom || "",
        representant: ag.representant || "",
        cartePro: ag.cartePro || "",
        siret: ag.siret || "",
        adresse: [ag.adresse, ag.cp, ag.ville].filter(Boolean).join(", "),
      },
      mandant: {
        nom: [m.prenom, m.nom].filter(Boolean).join(" ") || m.nom || "",
        qualite: m.qualite || "",
        adresse: [m.adresse, m.cp, m.ville].filter(Boolean).join(", "),
        email: m.email || "",
        tel: m.tel || "",
        coMandants: m.coMandants || "",
      },
    };
  }

  function buildClauses(values, schema) {
    values = values || {};
    var ag = values.agence || {};
    var meta = values.mandatMeta || {};
    var m = values.mandant || {};
    var bien = values.bien || {};
    var prix = values.prix || {};
    var hon = values.honoraires || {};
    var duree = values.duree || {};
    var pouv = values.pouvoirs || {};
    var lines = [];

    lines.push("MANDAT DE VENTE SANS EXCLUSIVITÉ");
    lines.push("(Formulaire CRM — à faire valider juridiquement)");
    lines.push("");
    if (meta.numero) lines.push("N° mandat : " + meta.numero);
    if (meta.lieuSignature || meta.dateSignature) {
      lines.push(
        "Fait à " + (meta.lieuSignature || "________") + " le " + (meta.dateSignature || "________")
      );
    }
    lines.push("");
    lines.push("=== MANDATAIRE (AGENCE) ===");
    [
      line("Raison sociale", ag.nom),
      line("Forme", ag.formeJuridique),
      line("Capital", ag.capital),
      line("Adresse", [ag.adresse, ag.cp, ag.ville].filter(Boolean).join(", ")),
      line("SIRET", ag.siret),
      line("RCS", ag.rcs),
      line("Carte professionnelle T", ag.cartePro),
      line("Délivrée par", ag.delivreePar),
      line("Garantie financière", ag.garantieFinanciere),
      line("Montant garantie", ag.montantGarantie),
      line("RCP", ag.rcp),
      line("Représenté par", ag.representant),
      line("Tél", ag.tel),
      line("E-mail", ag.email),
    ].forEach(function (l) {
      if (l) lines.push(l);
    });
    if (!ag.nom) {
      lines.push("(À compléter : agence mandataire de votre choix — aucun réseau prérempli.)");
    }

    lines.push("");
    lines.push("=== MANDANT ===");
    [
      line("Qualité", m.qualite),
      line("Nom", [m.prenom, m.nom].filter(Boolean).join(" ")),
      line("Adresse", [m.adresse, m.cp, m.ville].filter(Boolean).join(", ")),
      line("E-mail", m.email),
      line("Tél", m.tel),
      line("Co-mandants", m.coMandants),
    ].forEach(function (l) {
      if (l) lines.push(l);
    });

    lines.push("");
    lines.push("=== BIEN ===");
    [
      line("Type", bien.typeBien),
      line("Adresse", [bien.adresse, bien.cp, bien.ville].filter(Boolean).join(", ")),
      line("Surface", bien.surface ? bien.surface + " m²" : ""),
      line("Pièces", bien.pieces),
      line("Lots", bien.lots),
      line("Cadastre", bien.cadastre),
      line("Occupation", bien.occupation),
      line("Désignation", bien.designation),
    ].forEach(function (l) {
      if (l) lines.push(l);
    });

    lines.push("");
    lines.push("=== PRIX ===");
    [
      line("Net vendeur", prix.prixNetVendeur ? prix.prixNetVendeur + " €" : ""),
      line("FAI", prix.prixFai ? prix.prixFai + " €" : ""),
      line("Négociable", prix.negociable),
      line("Observations", prix.observationsPrix),
    ].forEach(function (l) {
      if (l) lines.push(l);
    });

    lines.push("");
    lines.push("=== HONORAIRES ===");
    [
      line("Mode", hon.mode),
      line("Taux", hon.tauxPct ? hon.tauxPct + " %" : ""),
      line("Forfait", hon.montantFixe ? hon.montantFixe + " €" : ""),
      line("Charge", hon.chargePar),
      line("Affichage", hon.ttcOuHt),
      line("Conditions", hon.conditions),
    ].forEach(function (l) {
      if (l) lines.push(l);
    });

    lines.push("");
    lines.push("=== DURÉE & SANS EXCLUSIVITÉ ===");
    [
      line("Prise d’effet", duree.dateDebut),
      line("Échéance", duree.dateFin),
      line("Préavis", duree.preavisJours ? duree.preavisJours + " jours" : ""),
      line("Reconduction", duree.reconduction),
    ].forEach(function (l) {
      if (l) lines.push(l);
    });
    lines.push("");
    lines.push(
      duree.clauseSansExclusivite ||
        "Le présent mandat est conféré SANS EXCLUSIVITÉ. Le mandant conserve la faculté de confier le bien à d’autres intermédiaires et de traiter directement."
    );

    lines.push("");
    lines.push("=== POUVOIRS ===");
    [
      line("Publicité / portails", pouv.pubPortails),
      line("Photos / visite virtuelle", pouv.photos),
      line("Remise des clés", pouv.clefs),
      line("Négociation du prix", pouv.negociation),
      line("Autres", pouv.autresPouvoirs),
    ].forEach(function (l) {
      if (l) lines.push(l);
    });

    if (meta.horsEtablissement === "oui") {
      lines.push("");
      lines.push(
        "[Hors établissement] Le mandant est informé de son droit de rétractation prévu par le Code de la consommation ; formulaire à joindre."
      );
    }

    lines.push("");
    lines.push(
      "Rappel : document de travail. Mentions obligatoires loi Hoguet à contrôler avant signature."
    );
    if (schema && schema.inspiredBy) {
      lines.push("Modèle structurel : " + schema.inspiredBy);
    }
    return lines.join("\n");
  }

  function buildTitle(values) {
    var ag = (values && values.agence && values.agence.nom) || "agence à compléter";
    var bien = values && values.bien;
    var where = bien && (bien.ville || bien.adresse) ? " — " + (bien.ville || bien.adresse) : "";
    return "Mandat de vente sans exclusivité (" + ag + ")" + where;
  }

  return {
    FORM_URL: FORM_URL,
    loadFormSchema: loadFormSchema,
    emptyValues: emptyValues,
    loadAgencyProfil: loadAgencyProfil,
    saveAgencyProfil: saveAgencyProfil,
    mergeFromProperty: mergeFromProperty,
    readForm: readForm,
    render: render,
    buildParties: buildParties,
    buildClauses: buildClauses,
    buildTitle: buildTitle,
  };
});
