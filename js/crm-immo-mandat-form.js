/**
 * Formulaire structuré — mandat de vente sans exclusivité.
 * UX type Favoriz : Article 1 prose + toggles OUI/NON conditionnels + aperçu imprimable.
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

  function blank(v, fallback) {
    var s = String(v == null ? "" : v).trim();
    return s || fallback || "……";
  }

  function mark(v) {
    var s = String(v == null ? "" : v).trim();
    if (!s) return '<span class="mf-blank">……</span>';
    return '<span class="mf-fill">' + esc(s) + "</span>";
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
        if (f.type === "static") return;
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

  function showIfMatch(field, secVals) {
    if (!field.showIf) return true;
    var cur = String((secVals && secVals[field.showIf.field]) || "").toLowerCase();
    var eq = String(field.showIf.eq || "").toLowerCase();
    return cur === eq;
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

  function fieldHtml(f, value, secVals) {
    if (!showIfMatch(f, secVals)) {
      return (
        '<div class="mandat-form-cond" hidden data-show-if-field="' +
        esc(f.showIf.field) +
        '" data-show-if-eq="' +
        esc(f.showIf.eq) +
        '">' +
        (f.type === "static"
          ? '<p class="mandat-form-static">' + esc(f.text || "") + "</p>"
          : fieldInner(f, value)) +
        "</div>"
      );
    }
    if (f.type === "static") {
      return (
        '<div class="mandat-form-cond" data-show-if-field="' +
        (f.showIf ? esc(f.showIf.field) : "") +
        '" data-show-if-eq="' +
        (f.showIf ? esc(f.showIf.eq) : "") +
        '"><p class="mandat-form-static">' +
        esc(f.text || "") +
        "</p></div>"
      );
    }
    if (f.showIf) {
      return (
        '<div class="mandat-form-cond" data-show-if-field="' +
        esc(f.showIf.field) +
        '" data-show-if-eq="' +
        esc(f.showIf.eq) +
        '">' +
        fieldInner(f, value) +
        "</div>"
      );
    }
    return fieldInner(f, value);
  }

  function fieldInner(f, value) {
    var v = value != null ? value : f.default != null ? f.default : "";
    var common =
      ' data-field="' +
      esc(f.id) +
      '" class="mandat-form-input' +
      (f.prose ? " is-prose" : "") +
      (f.toggle ? " is-toggle" : "") +
      '"';

    if (f.type === "ouiNon" || f.toggle) {
      var cur = String(v || f.default || "non").toLowerCase();
      if (cur !== "oui" && cur !== "non") cur = "non";
      return (
        '<div class="mandat-toggle" data-toggle-wrap="' +
        esc(f.id) +
        '">' +
        '<span class="mandat-toggle__q">' +
        esc(f.label) +
        "</span>" +
        '<div class="mandat-toggle__opts">' +
        '<button type="button" class="mandat-toggle__btn' +
        (cur === "oui" ? " is-on" : "") +
        '" data-toggle-set="' +
        esc(f.id) +
        '" data-toggle-val="oui">OUI</button>' +
        '<button type="button" class="mandat-toggle__btn' +
        (cur === "non" ? " is-on" : "") +
        '" data-toggle-set="' +
        esc(f.id) +
        '" data-toggle-val="non">NON</button>' +
        "</div>" +
        '<input type="hidden"' +
        common +
        ' value="' +
        esc(cur) +
        '" />' +
        (f.hint ? '<small class="mandat-form-hint">' + esc(f.hint) + "</small>" : "") +
        "</div>"
      );
    }

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

  function siegeLine(ag) {
    return [ag.adresse, ag.cp, ag.ville].filter(Boolean).join(" ");
  }

  function buildArticle1ProseHtml(ag) {
    ag = ag || {};
    var rcs =
      (ag.rcsVille || ag.rcs || "") +
      (ag.rcsNumero ? " " + ag.rcsNumero : ag.rcs && !ag.rcsVille ? "" : "");
    if (ag.rcsVille && ag.rcsNumero) rcs = ag.rcsVille + " " + ag.rcsNumero;
    else if (ag.rcs) rcs = ag.rcs;

    var html = "<p>L'agence " + mark(ag.enseigne || ag.nom) + ", exploitée par la société ";
    html += mark(ag.societe || ag.nom) + " ";
    html += mark(ag.formeJuridique) + " au capital de " + mark(ag.capital) + ", ";
    html += "ayant son siège social " + mark(siegeLine(ag)) + ", ";
    html += "immatriculée au RCS de " + mark(rcs) + ", ";
    html += "titulaire de la carte professionnelle « " + mark(ag.activiteCarte) + " » ";
    html += "n° " + mark(ag.cartePro) + " délivrée par " + mark(ag.delivreePar) + ", ";
    html += "assurance responsabilité civile professionnelle " + mark(ag.rcp);
    if (ag.tva) html += ", n° de TVA " + mark(ag.tva);
    html += ".</p>";

    html += '<ul class="mf-print-toggles">';
    html +=
      "<li>Établissement secondaire : <strong>" +
      esc((ag.etablissementSecondaire || "non").toUpperCase()) +
      "</strong>";
    if (String(ag.etablissementSecondaire).toLowerCase() === "oui") {
      html +=
        " — " +
        esc([ag.etabSecAdresse, ag.etabSecCp, ag.etabSecVille].filter(Boolean).join(" "));
    }
    html += "</li>";

    html +=
      "<li>Titulaire d'un compte séquestre : <strong>" +
      esc((ag.compteSequestre || "non").toUpperCase()) +
      "</strong>";
    if (String(ag.compteSequestre).toLowerCase() === "oui" && ag.sequestreBanque) {
      html += " — " + esc(ag.sequestreBanque);
    } else if (String(ag.compteSequestre).toLowerCase() !== "oui") {
      html +=
        '<div class="mf-print-notice">NE DEVANT RECEVOIR NI DÉTENIR D\'AUTRES FONDS, EFFETS OU VALEURS QUE CEUX REPRÉSENTATIFS DE SA RÉMUNÉRATION</div>';
    }
    html += "</li>";

    html +=
      "<li>Adhérent d'une caisse de garantie : <strong>" +
      esc((ag.caisseGarantie || "non").toUpperCase()) +
      "</strong>";
    if (String(ag.caisseGarantie).toLowerCase() === "oui") {
      html +=
        "<ul><li>Organisme : " +
        mark(ag.garantieOrganisme) +
        "</li><li>Adresse : " +
        mark(ag.garantieAdresse) +
        "</li><li>N° adhérent : " +
        mark(ag.garantieAdherent) +
        "</li>";
      if (ag.montantGarantie) html += "<li>Montant : " + mark(ag.montantGarantie) + "</li>";
      html += "</ul>";
    }
    html += "</li>";

    html +=
      "<li>Inscrit à l'ORIAS : <strong>" +
      esc((ag.oriasInscrit || "non").toUpperCase()) +
      "</strong>";
    if (String(ag.oriasInscrit).toLowerCase() === "oui" && ag.oriasNumero) {
      html += " — n° " + esc(ag.oriasNumero);
    }
    html += "</li>";

    html +=
      "<li>Liens capitalistiques avec une banque / autre : <strong>" +
      esc((ag.liensBanque || "non").toUpperCase()) +
      "</strong>";
    if (String(ag.liensBanque).toLowerCase() === "oui" && ag.liensBanqueDetail) {
      html += " — " + esc(ag.liensBanqueDetail);
    }
    html += "</li></ul>";

    if (ag.representant) {
      html += "<p>Représentée par " + mark(ag.representant) + ".</p>";
    }
    return html;
  }

  function buildPrintHtml(values, schema) {
    values = values || {};
    var ag = values.agence || {};
    var meta = values.mandatMeta || {};
    var m = values.mandant || {};
    var bien = values.bien || {};
    var prix = values.prix || {};
    var hon = values.honoraires || {};
    var duree = values.duree || {};
    var pouv = values.pouvoirs || {};

    var html = [];
    html.push('<div class="mf-print">');
    html.push('<p class="mf-print-kicker">Désignation des parties</p>');
    html.push("<h2>Mandat de vente sans exclusivité</h2>");
    if (meta.numero) html.push("<p class=\"mf-print-meta\">N° mandat : <strong>" + esc(meta.numero) + "</strong></p>");

    html.push('<section class="mf-print-article">');
    html.push('<div class="mf-print-article__hd"><h3>Article 1 : Désignation du mandataire</h3>');
    html.push('<span class="mf-print-badge">A valider</span></div>');
    html.push(buildArticle1ProseHtml(ag));
    html.push("</section>");

    html.push('<section class="mf-print-article">');
    html.push("<h3>Article 2 : Désignation du mandant</h3>");
    html.push(
      "<p>" +
        mark([m.prenom, m.nom].filter(Boolean).join(" ") || m.nom) +
        (m.qualite ? ", en qualité de " + mark(m.qualite) : "") +
        ", demeurant " +
        mark([m.adresse, m.cp, m.ville].filter(Boolean).join(", ")) +
        ".</p>"
    );
    if (m.coMandants) html.push("<p>Co-mandants : " + mark(m.coMandants) + "</p>");
    if (m.email || m.tel) {
      html.push("<p>" + (m.tel ? "Tél. " + mark(m.tel) + " " : "") + (m.email ? "E-mail " + mark(m.email) : "") + "</p>");
    }
    html.push("</section>");

    html.push('<section class="mf-print-article">');
    html.push("<h3>Article 3 : Désignation du bien</h3>");
    html.push(
      "<p>" +
        mark(bien.typeBien || "Bien") +
        " sis " +
        mark([bien.adresse, bien.cp, bien.ville].filter(Boolean).join(", ")) +
        (bien.surface ? ", d'une surface de " + mark(bien.surface + " m²") : "") +
        (bien.pieces ? ", " + mark(bien.pieces) + " pièces" : "") +
        ".</p>"
    );
    if (bien.lots || bien.cadastre || bien.occupation || bien.designation) {
      html.push("<ul>");
      if (bien.lots) html.push("<li>Lots / dépendances : " + mark(bien.lots) + "</li>");
      if (bien.cadastre) html.push("<li>Cadastre : " + mark(bien.cadastre) + "</li>");
      if (bien.occupation) html.push("<li>Occupation : " + mark(bien.occupation) + "</li>");
      if (bien.designation) html.push("<li>" + mark(bien.designation) + "</li>");
      html.push("</ul>");
    }
    html.push("</section>");

    html.push('<section class="mf-print-article">');
    html.push("<h3>Article 4 : Prix</h3>");
    html.push(
      "<p>Prix net vendeur : " +
        mark(prix.prixNetVendeur ? prix.prixNetVendeur + " €" : "") +
        " — Prix FAI : " +
        mark(prix.prixFai ? prix.prixFai + " €" : "") +
        " — Négociable : <strong>" +
        esc((prix.negociable || "").toUpperCase() || "—") +
        "</strong></p>"
    );
    if (prix.observationsPrix) html.push("<p>" + mark(prix.observationsPrix) + "</p>");
    html.push("</section>");

    html.push('<section class="mf-print-article">');
    html.push("<h3>Article 5 : Rémunération</h3>");
    html.push(
      "<p>" +
        mark(hon.mode) +
        (hon.tauxPct ? " — " + mark(hon.tauxPct + " %") : "") +
        (hon.montantFixe ? " — " + mark(hon.montantFixe + " €") : "") +
        (hon.chargePar ? " — à la charge de " + mark(hon.chargePar) : "") +
        (hon.ttcOuHt ? " (" + esc(hon.ttcOuHt) + ")" : "") +
        ".</p>"
    );
    if (hon.conditions) html.push("<p>" + mark(hon.conditions) + "</p>");
    html.push("</section>");

    html.push('<section class="mf-print-article">');
    html.push("<h3>Article 6 : Durée — sans exclusivité</h3>");
    html.push(
      "<p>Du " +
        mark(duree.dateDebut) +
        " au " +
        mark(duree.dateFin) +
        (duree.preavisJours ? " — préavis " + mark(duree.preavisJours + " jours") : "") +
        (duree.reconduction ? " — " + mark(duree.reconduction) : "") +
        ".</p>"
    );
    html.push(
      "<p>" +
        esc(
          duree.clauseSansExclusivite ||
            "Le présent mandat est conféré SANS EXCLUSIVITÉ."
        ) +
        "</p>"
    );
    html.push("</section>");

    html.push('<section class="mf-print-article">');
    html.push("<h3>Article 7 : Pouvoirs</h3>");
    html.push("<ul class=\"mf-print-toggles\">");
    html.push("<li>Publicité / portails : <strong>" + esc((pouv.pubPortails || "").toUpperCase() || "—") + "</strong></li>");
    html.push("<li>Photos / visite virtuelle : <strong>" + esc((pouv.photos || "").toUpperCase() || "—") + "</strong></li>");
    html.push("<li>Remise des clés : <strong>" + esc((pouv.clefs || "").toUpperCase() || "—") + "</strong></li>");
    html.push("<li>Négociation du prix : <strong>" + esc((pouv.negociation || "").toUpperCase() || "—") + "</strong></li>");
    html.push("</ul>");
    if (pouv.autresPouvoirs) html.push("<p>" + mark(pouv.autresPouvoirs) + "</p>");
    html.push("</section>");

    if (String(meta.horsEtablissement).toLowerCase() === "oui") {
      html.push(
        '<p class="mf-print-notice">Mandat conclu hors établissement — droit de rétractation (Code de la consommation) : formulaire à joindre.</p>'
      );
    }

    html.push(
      "<p class=\"mf-print-sign\">Fait à " +
        mark(meta.lieuSignature) +
        " le " +
        mark(meta.dateSignature) +
        ".</p>"
    );
    html.push(
      '<p class="mf-print-foot">Document de travail CRM — vérifier les mentions obligatoires (loi Hoguet) avant signature / impression.</p>'
    );
    if (schema && schema.inspiredBy) {
      html.push('<p class="mf-print-foot">' + esc(schema.inspiredBy) + "</p>");
    }
    html.push("</div>");
    return html.join("");
  }

  function refreshLivePreview(mount, schema) {
    var box = mount.querySelector("#mfLivePrint");
    if (!box || !schema) return;
    box.innerHTML = buildPrintHtml(readForm(mount), schema);
  }

  function applyConditionals(secEl) {
    if (!secEl) return;
    var vals = {};
    secEl.querySelectorAll("[data-field]").forEach(function (inp) {
      vals[inp.getAttribute("data-field")] = inp.value;
    });
    secEl.querySelectorAll("[data-show-if-field]").forEach(function (el) {
      var field = el.getAttribute("data-show-if-field");
      var eq = String(el.getAttribute("data-show-if-eq") || "").toLowerCase();
      if (!field) {
        el.hidden = false;
        return;
      }
      var cur = String(vals[field] || "").toLowerCase();
      el.hidden = cur !== eq;
    });
  }

  function wireForm(mount, schema, opts) {
    opts = opts || {};
    var agencies = listFeeAgencies();

    mount.querySelectorAll("[data-section]").forEach(function (secEl) {
      applyConditionals(secEl);
      secEl.addEventListener("input", function () {
        applyConditionals(secEl);
        refreshLivePreview(mount, schema);
      });
      secEl.addEventListener("change", function () {
        applyConditionals(secEl);
        refreshLivePreview(mount, schema);
      });
    });

    mount.querySelectorAll("[data-toggle-set]").forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute("data-toggle-set");
        var val = btn.getAttribute("data-toggle-val");
        var wrap = mount.querySelector('[data-toggle-wrap="' + id + '"]');
        if (!wrap) return;
        var hidden = wrap.querySelector("[data-field]");
        if (hidden) hidden.value = val;
        wrap.querySelectorAll("[data-toggle-set]").forEach(function (b) {
          b.classList.toggle("is-on", b.getAttribute("data-toggle-val") === val);
        });
        var secEl = wrap.closest("[data-section]");
        applyConditionals(secEl);
        refreshLivePreview(mount, schema);
      };
    });

    var pick = document.getElementById("mfAgencyPick");
    if (pick) {
      pick.onchange = function () {
        var id = pick.value;
        if (!id) return;
        var ag = agencies.find(function (a) {
          return a.id === id;
        });
        if (!ag) return;
        var enseigne = mount.querySelector('[data-section="agence"] [data-field="enseigne"]');
        var societe = mount.querySelector('[data-section="agence"] [data-field="societe"]');
        if (enseigne && !enseigne.value) enseigne.value = ag.name || "";
        if (societe && !societe.value) societe.value = ag.name || "";
        refreshLivePreview(mount, schema);
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

    var apply = document.getElementById("mfApplyToDoc");
    if (apply && opts.onApply) {
      apply.onclick = function () {
        opts.onApply(readForm(mount));
      };
    }
    var hide = document.getElementById("mfHideForm");
    if (hide && opts.onHide) hide.onclick = opts.onHide;

    var printBtn = document.getElementById("mfPrintPreview");
    if (printBtn) {
      printBtn.onclick = function () {
        var html = buildPrintHtml(readForm(mount), schema);
        var w = window.open("", "_blank", "noopener,noreferrer,width=900,height=1000");
        if (!w) {
          alert("Autorisez les pop-ups pour imprimer l’aperçu.");
          return;
        }
        w.document.write(
          "<!doctype html><html lang=\"fr\"><head><meta charset=\"utf-8\"/><title>Mandat — aperçu impression</title>" +
            "<link rel=\"stylesheet\" href=\"./css/crm-immo-mandats.css\" />" +
            "<style>body{margin:24px;font-family:Georgia,serif;color:#0f172a} .mf-print{max-width:800px;margin:0 auto}</style>" +
            "</head><body>" +
            html +
            "<script>setTimeout(function(){window.print()},300)<\\/script></body></html>"
        );
        w.document.close();
      };
    }

    refreshLivePreview(mount, schema);
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
    html.push("<label><span>Lier à une agence (barèmes) — nom seulement</span>");
    html.push('<select id="mfAgencyPick"><option value="">— Saisie manuelle —</option>');
    agencies.forEach(function (a) {
      var selected =
        values.agence &&
        (values.agence.enseigne === a.name || values.agence.societe === a.name || values.agence.nom === a.name)
          ? " selected"
          : "";
      html.push('<option value="' + esc(a.id) + '"' + selected + ">" + esc(a.name) + "</option>");
    });
    html.push("</select></label>");
    html.push(
      '<button type="button" class="btn btn-ghost btn-sm" id="mfSaveAgenceProfil">Mémoriser cette agence</button>'
    );
    html.push('<a class="btn btn-ghost btn-sm" href="./crm-agency-fees.html">Gérer les agences</a>');
    html.push("</div>");

    html.push('<div class="mandat-form__layout">');
    html.push('<div class="mandat-form__fields">');
    (schema.sections || []).forEach(function (sec) {
      html.push('<section class="mandat-form__section" data-section="' + esc(sec.id) + '">');
      html.push("<h4>" + esc(sec.label) + "</h4>");
      if (sec.hint) html.push('<p class="mandat-form-hint">' + esc(sec.hint) + "</p>");
      html.push('<div class="mandat-form__grid">');
      var secVals = values[sec.id] || {};
      (sec.fields || []).forEach(function (f) {
        html.push(fieldHtml(f, secVals[f.id], secVals));
      });
      html.push("</div></section>");
    });
    html.push('<div class="mandat-form__actions">');
    html.push('<button type="button" class="btn btn-primary" id="mfApplyToDoc">Appliquer au document</button>');
    html.push('<button type="button" class="btn btn-ghost" id="mfPrintPreview">Aperçu / imprimer</button>');
    html.push('<button type="button" class="btn btn-ghost" id="mfHideForm">Masquer le formulaire</button>');
    html.push("</div>");
    html.push("</div>");

    html.push('<aside class="mandat-form__preview-pane">');
    html.push('<div class="mandat-form__preview-hd"><strong>Aperçu type impression</strong>');
    html.push("<span>Ce que donne le mandat rempli</span></div>");
    html.push('<div id="mfLivePrint" class="mandat-form__preview-body"></div>');
    html.push("</aside>");
    html.push("</div>");

    html.push("</div>");

    mount.innerHTML = html.join("");
    mount.hidden = false;
    wireForm(mount, schema, opts);
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
        enseigne: ag.enseigne || ag.nom || "",
        societe: ag.societe || "",
        representant: ag.representant || "",
        cartePro: ag.cartePro || "",
        rcs: [ag.rcsVille, ag.rcsNumero].filter(Boolean).join(" ") || ag.rcs || "",
        adresse: siegeLine(ag),
        garantie: ag.garantieOrganisme || "",
        sequestre: ag.compteSequestre || "non",
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
    lines.push("DÉSIGNATION DES PARTIES");
    lines.push("");
    if (meta.numero) lines.push("N° mandat : " + meta.numero);
    if (meta.lieuSignature || meta.dateSignature) {
      lines.push(
        "Fait à " + blank(meta.lieuSignature, "________") + " le " + blank(meta.dateSignature, "________")
      );
    }

    lines.push("");
    lines.push("ARTICLE 1 — DÉSIGNATION DU MANDATAIRE");
    lines.push(
      "L'agence " +
        blank(ag.enseigne || ag.nom) +
        ", exploitée par la société " +
        blank(ag.societe || ag.nom) +
        " " +
        blank(ag.formeJuridique) +
        " au capital de " +
        blank(ag.capital) +
        ", ayant son siège social " +
        blank(siegeLine(ag)) +
        ", immatriculée au RCS de " +
        blank([ag.rcsVille, ag.rcsNumero].filter(Boolean).join(" ") || ag.rcs) +
        ", titulaire de la carte professionnelle « " +
        blank(ag.activiteCarte) +
        " » n° " +
        blank(ag.cartePro) +
        " délivrée par " +
        blank(ag.delivreePar) +
        ", assurance responsabilité civile professionnelle " +
        blank(ag.rcp) +
        (ag.tva ? ", n° de TVA " + ag.tva : "") +
        "."
    );
    lines.push("Établissement secondaire : " + String(ag.etablissementSecondaire || "non").toUpperCase());
    lines.push("Compte séquestre : " + String(ag.compteSequestre || "non").toUpperCase());
    if (String(ag.compteSequestre).toLowerCase() !== "oui") {
      lines.push(
        "NE DEVANT RECEVOIR NI DÉTENIR D'AUTRES FONDS, EFFETS OU VALEURS QUE CEUX REPRÉSENTATIFS DE SA RÉMUNÉRATION"
      );
    } else if (ag.sequestreBanque) {
      lines.push("Séquestre : " + ag.sequestreBanque);
    }
    lines.push("Caisse de garantie : " + String(ag.caisseGarantie || "non").toUpperCase());
    if (String(ag.caisseGarantie).toLowerCase() === "oui") {
      [
        line("Organisme", ag.garantieOrganisme),
        line("Adresse", ag.garantieAdresse),
        line("N° adhérent", ag.garantieAdherent),
        line("Montant", ag.montantGarantie),
      ].forEach(function (l) {
        if (l) lines.push(l);
      });
    }
    lines.push("ORIAS : " + String(ag.oriasInscrit || "non").toUpperCase() + (ag.oriasNumero ? " — " + ag.oriasNumero : ""));
    lines.push(
      "Liens banque / autre : " +
        String(ag.liensBanque || "non").toUpperCase() +
        (ag.liensBanqueDetail ? " — " + ag.liensBanqueDetail : "")
    );
    if (ag.representant) lines.push("Représenté par : " + ag.representant);

    lines.push("");
    lines.push("ARTICLE 2 — MANDANT");
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
    lines.push("ARTICLE 3 — BIEN");
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
    lines.push("ARTICLE 4 — PRIX");
    [
      line("Net vendeur", prix.prixNetVendeur ? prix.prixNetVendeur + " €" : ""),
      line("FAI", prix.prixFai ? prix.prixFai + " €" : ""),
      line("Négociable", prix.negociable),
      line("Observations", prix.observationsPrix),
    ].forEach(function (l) {
      if (l) lines.push(l);
    });

    lines.push("");
    lines.push("ARTICLE 5 — HONORAIRES");
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
    lines.push("ARTICLE 6 — DURÉE & SANS EXCLUSIVITÉ");
    [
      line("Prise d’effet", duree.dateDebut),
      line("Échéance", duree.dateFin),
      line("Préavis", duree.preavisJours ? duree.preavisJours + " jours" : ""),
      line("Reconduction", duree.reconduction),
    ].forEach(function (l) {
      if (l) lines.push(l);
    });
    lines.push(
      duree.clauseSansExclusivite ||
        "Le présent mandat est conféré SANS EXCLUSIVITÉ. Le mandant conserve la faculté de confier le bien à d’autres intermédiaires et de traiter directement."
    );

    lines.push("");
    lines.push("ARTICLE 7 — POUVOIRS");
    [
      line("Publicité / portails", pouv.pubPortails),
      line("Photos / visite virtuelle", pouv.photos),
      line("Remise des clés", pouv.clefs),
      line("Négociation du prix", pouv.negociation),
      line("Autres", pouv.autresPouvoirs),
    ].forEach(function (l) {
      if (l) lines.push(l);
    });

    if (String(meta.horsEtablissement).toLowerCase() === "oui") {
      lines.push("");
      lines.push(
        "[Hors établissement] Le mandant est informé de son droit de rétractation prévu par le Code de la consommation ; formulaire à joindre."
      );
    }

    lines.push("");
    lines.push("Rappel : document de travail. Mentions obligatoires loi Hoguet à contrôler avant signature / impression.");
    if (schema && schema.inspiredBy) lines.push("Modèle structurel : " + schema.inspiredBy);
    return lines.join("\n");
  }

  function buildTitle(values) {
    var ag = values && values.agence;
    var name = (ag && (ag.enseigne || ag.societe || ag.nom)) || "agence à compléter";
    var bien = values && values.bien;
    var where = bien && (bien.ville || bien.adresse) ? " — " + (bien.ville || bien.adresse) : "";
    return "Mandat de vente sans exclusivité (" + name + ")" + where;
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
    buildPrintHtml: buildPrintHtml,
    buildArticle1ProseHtml: buildArticle1ProseHtml,
  };
});
