/**
 * UI CRM — pipeline location + estimation/mandat (CrmImmoOps + PrintDocument).
 */
(function (root) {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function Ops() {
    return root.CrmImmoOps;
  }

  function euro(n) {
    var v = Number(n);
    if (isNaN(v)) return "—";
    try {
      return v.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
    } catch (e) {
      return Math.round(v) + " €";
    }
  }

  function piecesHtml(d) {
    var labels = {
      piece_identite: "Pièce d'identité",
      justificatif_domicile: "Justificatif domicile",
      contrat_travail: "Contrat de travail",
      avis_imposition: "Avis d'imposition",
      bulletins_salaire: "3 bulletins de salaire",
      garant_id: "Garant (pièce)",
    };
    var pieces = (d && d.pieces) || {};
    return Object.keys(labels)
      .map(function (k) {
        return (
          '<label class="ops-check"><input type="checkbox" data-dos-piece="' +
          esc(k) +
          '"' +
          (pieces[k] ? " checked" : "") +
          " /> " +
          esc(labels[k]) +
          "</label>"
        );
      })
      .join("");
  }

  function dossierIdx(ops, id) {
    var i = (ops.dossiers || []).findIndex(function (d) {
      return d.id === id;
    });
    return i < 0 ? "" : String(i);
  }

  function pdfKpis(title, rows, extra) {
    if (!root.PrintDocument || !root.PrintDocument.fromKpis) {
      alert("Module PDF indisponible");
      return;
    }
    root.PrintDocument.fromKpis(title, rows, extra || {});
  }

  function renderLocationPipeline(prop) {
    var O = Ops();
    if (!O) return "<p>Module ops manquant.</p>";
    var ops = O.ensureLocationOpsOnProperty(prop);
    var stats = O.locationPipelineStats(ops);
    var rem = O.computeLocationRemuneration(ops, root.BaremeHonorairesLib);

    var html =
      '<div class="ops-banner"><strong>Pipeline location</strong> — dossiers → visites → bail → rémunération. ' +
      "Dossiers OK : <b>" +
      stats.dossiers_ok +
      "/" +
      stats.dossiers +
      "</b> · Visites : <b>" +
      stats.visites_faites +
      "/" +
      stats.visites +
      "</b> · Baux signés : <b>" +
      stats.baux_signes +
      "/" +
      stats.baux +
      "</b></div>";

    html +=
      '<div class="ops-box"><h4>Rémunération (barème)</h4><div class="ops-grid">' +
      '<label>Surface m²<input type="number" min="0" step="0.1" data-rem="surface_m2" value="' +
      esc(ops.remuneration.surface_m2) +
      '" /></label>' +
      '<label>Zone<select data-rem="zone">' +
      [
        ["tres-tendue", "Très tendue"],
        ["tendue", "Tendue"],
        ["hors", "Hors zone"],
      ]
        .map(function (z) {
          return (
            '<option value="' +
            z[0] +
            '"' +
            (ops.remuneration.zone === z[0] ? " selected" : "") +
            ">" +
            z[1] +
            "</option>"
          );
        })
        .join("") +
      "</select></label>" +
      '<label>Part agent %<input type="number" min="0" max="100" data-rem="part_agent_pct" value="' +
      esc(ops.remuneration.part_agent_pct) +
      '" /></label>' +
      '<label>Override TTC<input type="number" min="0" data-rem="override_ttc" value="' +
      esc(ops.remuneration.override_ttc) +
      '" placeholder="vide = barème" /></label></div>' +
      '<div class="ops-kpis">' +
      '<div class="ops-kpi"><span>Agence TTC</span><strong>' +
      euro(rem.agence_ttc) +
      "</strong></div>" +
      '<div class="ops-kpi"><span>Bailleur</span><strong>' +
      euro(rem.bailleur_ttc) +
      "</strong></div>" +
      '<div class="ops-kpi"><span>Locataire</span><strong>' +
      euro(rem.locataire_ttc) +
      "</strong></div>" +
      '<div class="ops-kpi highlight"><span>Ta part</span><strong>' +
      euro(rem.agent_ttc) +
      "</strong><small>" +
      rem.part_agent_pct +
      "% · " +
      rem.source +
      "</small></div></div>" +
      '<button type="button" class="btn btn-ghost btn-sm" id="btnPdfRemu">PDF rémunération</button></div>';

    html += "<h4>Dossiers locataires</h4>";
    if (!ops.dossiers.length) html += '<p class="ops-empty">Aucun dossier.</p>';
    ops.dossiers.forEach(function (d, i) {
      var c = O.dossierCompleteness(d);
      html +=
        '<div class="ops-card" data-dos-idx="' +
        i +
        '"><div class="ops-card-head"><strong>Dossier #' +
        (i + 1) +
        "</strong> · " +
        c.pct +
        '% pièces <button type="button" class="btn btn-ghost btn-sm" data-del-dos="' +
        i +
        '">Retirer</button></div><div class="ops-grid">' +
        '<label>Nom<input data-dos="candidat_nom" value="' +
        esc(d.candidat_nom) +
        '" /></label>' +
        '<label>Prénom<input data-dos="candidat_prenom" value="' +
        esc(d.candidat_prenom) +
        '" /></label>' +
        '<label>Tél<input data-dos="candidat_tel" value="' +
        esc(d.candidat_tel) +
        '" /></label>' +
        '<label>E-mail<input data-dos="candidat_email" value="' +
        esc(d.candidat_email) +
        '" /></label>' +
        '<label>Revenus €/mois<input type="number" data-dos="revenus_mensuels" value="' +
        esc(d.revenus_mensuels) +
        '" /></label>' +
        '<label>Garant<input data-dos="garant" value="' +
        esc(d.garant) +
        '" /></label>' +
        '<label>Statut<select data-dos="statut">' +
        ["a_completer", "en_cours", "valide", "refuse", "retire"]
          .map(function (s) {
            return '<option value="' + s + '"' + (d.statut === s ? " selected" : "") + ">" + s + "</option>";
          })
          .join("") +
        '</select></label></div><div class="ops-checks">' +
        piecesHtml(d) +
        '</div><label class="ops-full">Notes<textarea data-dos="notes" rows="2">' +
        esc(d.notes) +
        '</textarea></label><button type="button" class="btn btn-ghost btn-sm" data-pdf-dos="' +
        i +
        '">PDF dossier</button></div>';
    });
    html += '<button type="button" class="btn btn-primary btn-sm" id="btnAddDos">+ Dossier</button>';

    html += "<h4>Visites</h4>";
    if (!ops.visites.length) html += '<p class="ops-empty">Aucune visite.</p>';
    ops.visites.forEach(function (v, i) {
      html +=
        '<div class="ops-card" data-vis-idx="' +
        i +
        '"><div class="ops-card-head"><strong>Visite #' +
        (i + 1) +
        '</strong> <button type="button" class="btn btn-ghost btn-sm" data-del-vis="' +
        i +
        '">Retirer</button></div><div class="ops-grid">' +
        '<label>Date<input type="date" data-vis="date" value="' +
        esc(v.date) +
        '" /></label>' +
        '<label>Heure<input type="time" data-vis="heure" value="' +
        esc(v.heure) +
        '" /></label>' +
        '<label>Dossier #<input type="number" min="0" data-vis="dossier_idx" value="' +
        esc(dossierIdx(ops, v.dossier_id)) +
        '" /></label>' +
        '<label>Statut<select data-vis="statut">' +
        ["planifiee", "faite", "annulee", "no_show"]
          .map(function (s) {
            return '<option value="' + s + '"' + (v.statut === s ? " selected" : "") + ">" + s + "</option>";
          })
          .join("") +
        '</select></label><label class="ops-check"><input type="checkbox" data-vis="present"' +
        (v.present ? " checked" : "") +
        ' /> Présent</label></div><label class="ops-full">Notes<textarea data-vis="notes" rows="2">' +
        esc(v.notes) +
        '</textarea></label><button type="button" class="btn btn-ghost btn-sm" data-pdf-vis="' +
        i +
        '">PDF bon de visite</button></div>';
    });
    html += '<button type="button" class="btn btn-primary btn-sm" id="btnAddVis">+ Visite</button>';

    html += "<h4>Baux</h4>";
    if (!ops.baux.length) html += '<p class="ops-empty">Aucun bail.</p>';
    ops.baux.forEach(function (b, i) {
      html +=
        '<div class="ops-card" data-bail-idx="' +
        i +
        '"><div class="ops-card-head"><strong>Bail #' +
        (i + 1) +
        '</strong> <button type="button" class="btn btn-ghost btn-sm" data-del-bail="' +
        i +
        '">Retirer</button></div><div class="ops-grid">' +
        '<label>Type<input data-bail="type_bail" value="' +
        esc(b.type_bail) +
        '" /></label>' +
        '<label>Début<input type="date" data-bail="date_debut" value="' +
        esc(b.date_debut) +
        '" /></label>' +
        '<label>Fin<input type="date" data-bail="date_fin" value="' +
        esc(b.date_fin) +
        '" /></label>' +
        '<label>Loyer HC<input type="number" data-bail="loyer_hc" value="' +
        esc(b.loyer_hc) +
        '" /></label>' +
        '<label>Charges<input type="number" data-bail="charges" value="' +
        esc(b.charges) +
        '" /></label>' +
        '<label>Dépôt<input type="number" data-bail="depot_garantie" value="' +
        esc(b.depot_garantie) +
        '" /></label>' +
        '<label>Dossier #<input type="number" min="0" data-bail="dossier_idx" value="' +
        esc(dossierIdx(ops, b.dossier_id)) +
        '" /></label>' +
        '<label>Statut<select data-bail="statut">' +
        ["brouillon", "envoye", "signe", "actif", "resilie"]
          .map(function (s) {
            return '<option value="' + s + '"' + (b.statut === s ? " selected" : "") + ">" + s + "</option>";
          })
          .join("") +
        '</select></label></div><label class="ops-full">Notes<textarea data-bail="notes" rows="2">' +
        esc(b.notes) +
        '</textarea></label><button type="button" class="btn btn-ghost btn-sm" data-pdf-bail="' +
        i +
        '">PDF projet de bail</button></div>';
    });
    html += '<button type="button" class="btn btn-primary btn-sm" id="btnAddBail">+ Bail</button>';
    return html;
  }

  function collectLocationPipeline(rootEl, prop) {
    var O = Ops();
    if (!O || !rootEl) return;
    var ops = O.ensureLocationOpsOnProperty(prop);
    rootEl.querySelectorAll("[data-rem]").forEach(function (el) {
      ops.remuneration[el.getAttribute("data-rem")] = el.value;
    });
    rootEl.querySelectorAll("[data-dos-idx]").forEach(function (card) {
      var i = Number(card.getAttribute("data-dos-idx"));
      if (!ops.dossiers[i]) return;
      card.querySelectorAll("[data-dos]").forEach(function (el) {
        ops.dossiers[i][el.getAttribute("data-dos")] = el.value;
      });
      card.querySelectorAll("[data-dos-piece]").forEach(function (el) {
        ops.dossiers[i].pieces[el.getAttribute("data-dos-piece")] = el.checked;
      });
    });
    rootEl.querySelectorAll("[data-vis-idx]").forEach(function (card) {
      var i = Number(card.getAttribute("data-vis-idx"));
      if (!ops.visites[i]) return;
      card.querySelectorAll("[data-vis]").forEach(function (el) {
        var k = el.getAttribute("data-vis");
        if (k === "present") ops.visites[i].present = el.checked;
        else if (k === "dossier_idx") {
          var di = Number(el.value);
          ops.visites[i].dossier_id = ops.dossiers[di] ? ops.dossiers[di].id : "";
        } else ops.visites[i][k] = el.value;
      });
    });
    rootEl.querySelectorAll("[data-bail-idx]").forEach(function (card) {
      var i = Number(card.getAttribute("data-bail-idx"));
      if (!ops.baux[i]) return;
      card.querySelectorAll("[data-bail]").forEach(function (el) {
        var k = el.getAttribute("data-bail");
        if (k === "dossier_idx") {
          var di = Number(el.value);
          ops.baux[i].dossier_id = ops.dossiers[di] ? ops.dossiers[di].id : "";
        } else ops.baux[i][k] = el.value;
      });
    });
    prop.details.location_ops = O.normalizeLocationOps(ops);
  }

  function bindLocationPipeline(rootEl, prop, rerender) {
    var O = Ops();
    if (!O || !rootEl) return;

    function add(kind) {
      collectLocationPipeline(rootEl, prop);
      var ops = O.ensureLocationOpsOnProperty(prop);
      if (kind === "dos") ops.dossiers.push(O.emptyDossier());
      if (kind === "vis") ops.visites.push(O.emptyVisite());
      if (kind === "bail") ops.baux.push(O.emptyBail());
      rerender();
    }

    var bd = rootEl.querySelector("#btnAddDos");
    if (bd) bd.onclick = function () { add("dos"); };
    var bv = rootEl.querySelector("#btnAddVis");
    if (bv) bv.onclick = function () { add("vis"); };
    var bb = rootEl.querySelector("#btnAddBail");
    if (bb) bb.onclick = function () { add("bail"); };

    rootEl.querySelectorAll("[data-del-dos]").forEach(function (btn) {
      btn.onclick = function () {
        collectLocationPipeline(rootEl, prop);
        prop.details.location_ops.dossiers.splice(Number(btn.getAttribute("data-del-dos")), 1);
        rerender();
      };
    });
    rootEl.querySelectorAll("[data-del-vis]").forEach(function (btn) {
      btn.onclick = function () {
        collectLocationPipeline(rootEl, prop);
        prop.details.location_ops.visites.splice(Number(btn.getAttribute("data-del-vis")), 1);
        rerender();
      };
    });
    rootEl.querySelectorAll("[data-del-bail]").forEach(function (btn) {
      btn.onclick = function () {
        collectLocationPipeline(rootEl, prop);
        prop.details.location_ops.baux.splice(Number(btn.getAttribute("data-del-bail")), 1);
        rerender();
      };
    });
    rootEl.querySelectorAll("[data-rem]").forEach(function (el) {
      el.onchange = function () {
        collectLocationPipeline(rootEl, prop);
        rerender();
      };
    });

    var br = rootEl.querySelector("#btnPdfRemu");
    if (br) {
      br.onclick = function () {
        collectLocationPipeline(rootEl, prop);
        var rem = O.computeLocationRemuneration(prop.details.location_ops, root.BaremeHonorairesLib);
        pdfKpis(
          "Rémunération location",
          [
            { label: "Surface", value: rem.surface_m2 + " m²" },
            { label: "Zone", value: rem.zone },
            { label: "Agence TTC", value: euro(rem.agence_ttc) },
            { label: "Bailleur", value: euro(rem.bailleur_ttc) },
            { label: "Locataire", value: euro(rem.locataire_ttc) },
            { label: "Part agent (" + rem.part_agent_pct + "%)", value: euro(rem.agent_ttc) },
          ],
          { subtitle: prop.title || "Bien", kind: "estimation", note: "Document de travail — préparation honoraires." }
        );
      };
    }

    rootEl.querySelectorAll("[data-pdf-dos]").forEach(function (btn) {
      btn.onclick = function () {
        collectLocationPipeline(rootEl, prop);
        var d = prop.details.location_ops.dossiers[Number(btn.getAttribute("data-pdf-dos"))];
        if (!d) return;
        var c = O.dossierCompleteness(d);
        pdfKpis(
          "Dossier locataire",
          [
            { label: "Candidat", value: [d.candidat_prenom, d.candidat_nom].filter(Boolean).join(" ") },
            { label: "Contact", value: [d.candidat_tel, d.candidat_email].filter(Boolean).join(" · ") },
            { label: "Revenus", value: d.revenus_mensuels ? d.revenus_mensuels + " €/mois" : "" },
            { label: "Garant", value: d.garant },
            { label: "Statut", value: d.statut },
            { label: "Pièces", value: c.ok + "/" + c.total + " (" + c.pct + "%)" },
            { label: "Notes", value: d.notes },
          ],
          { subtitle: prop.title || "", kind: "bien" }
        );
      };
    });
    rootEl.querySelectorAll("[data-pdf-vis]").forEach(function (btn) {
      btn.onclick = function () {
        collectLocationPipeline(rootEl, prop);
        var v = prop.details.location_ops.visites[Number(btn.getAttribute("data-pdf-vis"))];
        if (!v) return;
        pdfKpis(
          "Bon de visite",
          [
            { label: "Date", value: [v.date, v.heure].filter(Boolean).join(" ") },
            { label: "Statut", value: v.statut },
            { label: "Présent", value: v.present ? "Oui" : "Non" },
            { label: "Notes", value: v.notes },
          ],
          { subtitle: prop.title || "", kind: "bien" }
        );
      };
    });
    rootEl.querySelectorAll("[data-pdf-bail]").forEach(function (btn) {
      btn.onclick = function () {
        collectLocationPipeline(rootEl, prop);
        var b = prop.details.location_ops.baux[Number(btn.getAttribute("data-pdf-bail"))];
        if (!b) return;
        pdfKpis(
          "Projet de bail",
          [
            { label: "Type", value: b.type_bail },
            { label: "Période", value: [b.date_debut, b.date_fin].filter(Boolean).join(" → ") },
            { label: "Loyer HC", value: b.loyer_hc ? b.loyer_hc + " €" : "" },
            { label: "Charges", value: b.charges ? b.charges + " €" : "" },
            { label: "Dépôt", value: b.depot_garantie ? b.depot_garantie + " €" : "" },
            { label: "Statut", value: b.statut },
            { label: "Notes", value: b.notes },
          ],
          { subtitle: prop.title || "", kind: "mandat", note: "Projet non signé." }
        );
      };
    });
  }

  function renderEstimationMandat(prop) {
    var O = Ops();
    if (!O) return "<p>Module ops manquant.</p>";
    var est = O.ensureEstimationMandatOnProperty(prop);
    var hon = O.computeMandatHonoraires(est);
    return (
      '<div class="ops-banner"><strong>Estimation & mandat personnel</strong> — formulaire → honoraires → PDF. ' +
      'Public : <a href="./estimation-mandat.html" target="_blank" rel="noopener">estimation-mandat.html</a></div>' +
      '<div class="ops-grid">' +
      '<label>Client nom<input data-est="client_nom" value="' +
      esc(est.client_nom) +
      '" /></label>' +
      '<label>Prénom<input data-est="client_prenom" value="' +
      esc(est.client_prenom) +
      '" /></label>' +
      '<label>Tél<input data-est="client_tel" value="' +
      esc(est.client_tel) +
      '" /></label>' +
      '<label>E-mail<input data-est="client_email" value="' +
      esc(est.client_email) +
      '" /></label>' +
      '<label>Adresse bien<input data-est="bien_adresse" value="' +
      esc(est.bien_adresse) +
      '" /></label>' +
      '<label>CP<input data-est="bien_cp" value="' +
      esc(est.bien_cp) +
      '" /></label>' +
      '<label>Ville<input data-est="bien_ville" value="' +
      esc(est.bien_ville) +
      '" /></label>' +
      '<label>Type<select data-est="bien_type">' +
      ["appartement", "maison", "terrain", "immeuble", "local", "parking"]
        .map(function (t) {
          return '<option value="' + t + '"' + (est.bien_type === t ? " selected" : "") + ">" + t + "</option>";
        })
        .join("") +
      '</select></label>' +
      '<label>Surface<input type="number" data-est="bien_surface" value="' +
      esc(est.bien_surface) +
      '" /></label>' +
      '<label>Pièces<input type="number" data-est="bien_pieces" value="' +
      esc(est.bien_pieces) +
      '" /></label>' +
      '<label>Transaction<select data-est="transaction">' +
      ["vente", "location"]
        .map(function (t) {
          return '<option value="' + t + '"' + (est.transaction === t ? " selected" : "") + ">" + t + "</option>";
        })
        .join("") +
      '</select></label>' +
      '<label>Mandat<select data-est="type_mandat">' +
      ["simple", "exclusif", "semi-exclusif", "recherche", "gestion"]
        .map(function (t) {
          return '<option value="' + t + '"' + (est.type_mandat === t ? " selected" : "") + ">" + t + "</option>";
        })
        .join("") +
      '</select></label>' +
      '<label>Objet<select data-est="objet_mandat">' +
      ["vente", "location", "gestion", "estimation"]
        .map(function (t) {
          return '<option value="' + t + '"' + (est.objet_mandat === t ? " selected" : "") + ">" + t + "</option>";
        })
        .join("") +
      '</select></label>' +
      '<label>Valeur basse<input type="number" data-est="valeur_estimee_basse" value="' +
      esc(est.valeur_estimee_basse) +
      '" /></label>' +
      '<label>Valeur estimée<input type="number" data-est="valeur_estimee" value="' +
      esc(est.valeur_estimee) +
      '" /></label>' +
      '<label>Valeur haute<input type="number" data-est="valeur_estimee_haute" value="' +
      esc(est.valeur_estimee_haute) +
      '" /></label>' +
      '<label>Prix souhaité<input type="number" data-est="prix_souhaite" value="' +
      esc(est.prix_souhaite) +
      '" /></label>' +
      '<label>Loyer estimé<input type="number" data-est="loyer_estime" value="' +
      esc(est.loyer_estime) +
      '" /></label>' +
      '<label>Mode honoraires<select data-est="honoraires_mode">' +
      '<option value="pourcent"' +
      (est.honoraires_mode === "pourcent" ? " selected" : "") +
      ">%</option>" +
      '<option value="forfait"' +
      (est.honoraires_mode === "forfait" ? " selected" : "") +
      ">Forfait</option></select></label>" +
      '<label>% <input type="number" step="0.1" data-est="honoraires_pct" value="' +
      esc(est.honoraires_pct) +
      '" /></label>' +
      '<label>Forfait TTC<input type="number" data-est="honoraires_forfait" value="' +
      esc(est.honoraires_forfait) +
      '" /></label>' +
      '<label>À charge<select data-est="charge_honoraires">' +
      ["vendeur", "acquereur", "partage", "bailleur", "locataire"]
        .map(function (t) {
          return (
            '<option value="' + t + '"' + (est.charge_honoraires === t ? " selected" : "") + ">" + t + "</option>"
          );
        })
        .join("") +
      '</select></label>' +
      '<label>Durée (mois)<input type="number" data-est="duree_mandat_mois" value="' +
      esc(est.duree_mandat_mois) +
      '" /></label>' +
      '<label>Date<input type="date" data-est="date_estimation" value="' +
      esc(est.date_estimation) +
      '" /></label></div>' +
      '<label class="ops-full">Comparables<textarea data-est="comparables" rows="2">' +
      esc(est.comparables) +
      "</textarea></label>" +
      '<label class="ops-full">Points forts<textarea data-est="points_forts" rows="2">' +
      esc(est.points_forts) +
      "</textarea></label>" +
      '<label class="ops-full">Points faibles<textarea data-est="points_faibles" rows="2">' +
      esc(est.points_faibles) +
      "</textarea></label>" +
      '<label class="ops-full">Recommandation<textarea data-est="recommandation" rows="2">' +
      esc(est.recommandation) +
      "</textarea></label>" +
      '<div class="ops-kpis">' +
      '<div class="ops-kpi"><span>Base</span><strong>' +
      euro(hon.base) +
      "</strong></div>" +
      '<div class="ops-kpi"><span>HT</span><strong>' +
      euro(hon.honoraires_ht) +
      "</strong></div>" +
      '<div class="ops-kpi highlight"><span>TTC</span><strong>' +
      euro(hon.honoraires_ttc) +
      "</strong><small>" +
      esc(hon.charge) +
      "</small></div></div>" +
      '<div class="ops-actions">' +
      '<button type="button" class="btn btn-primary btn-sm" id="btnPdfEst">PDF estimation</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" id="btnPdfMandat">PDF projet mandat</button></div>'
    );
  }

  function collectEstimationMandat(rootEl, prop) {
    var O = Ops();
    if (!O || !rootEl) return;
    var est = O.ensureEstimationMandatOnProperty(prop);
    rootEl.querySelectorAll("[data-est]").forEach(function (el) {
      est[el.getAttribute("data-est")] = el.value;
    });
    prop.details.estimation_mandat = O.normalizeEstimationMandat(est);
  }

  function bindEstimationMandat(rootEl, prop, rerender) {
    var O = Ops();
    if (!O || !rootEl) return;
    rootEl.querySelectorAll("[data-est]").forEach(function (el) {
      el.onchange = function () {
        collectEstimationMandat(rootEl, prop);
        rerender();
      };
    });
    function openPdf(kind) {
      collectEstimationMandat(rootEl, prop);
      var est = prop.details.estimation_mandat;
      var hon = O.computeMandatHonoraires(est);
      if (kind === "estimation") {
        pdfKpis(
          "Rapport d'estimation personnelle",
          [
            { label: "Client", value: [est.client_prenom, est.client_nom].filter(Boolean).join(" ") },
            { label: "Bien", value: [est.bien_adresse, est.bien_cp, est.bien_ville].filter(Boolean).join(", ") },
            { label: "Type", value: est.bien_type + " · " + est.bien_surface + " m²" },
            {
              label: "Fourchette",
              value:
                [est.valeur_estimee_basse, est.valeur_estimee, est.valeur_estimee_haute].filter(Boolean).join(" → ") +
                " €",
            },
            { label: "Honoraires TTC", value: euro(hon.honoraires_ttc) },
            { label: "Comparables", value: est.comparables },
            { label: "Recommandation", value: est.recommandation },
          ],
          { subtitle: prop.title || "Estimation", kind: "estimation", note: "Avis de valeur — hors expertise judiciaire." }
        );
      } else {
        pdfKpis(
          "Projet de mandat " + (est.type_mandat || ""),
          [
            { label: "Mandant", value: [est.client_prenom, est.client_nom].filter(Boolean).join(" ") },
            { label: "Objet", value: est.objet_mandat + " · " + est.transaction },
            { label: "Bien", value: [est.bien_adresse, est.bien_cp, est.bien_ville].filter(Boolean).join(", ") },
            {
              label: "Référence prix/loyer",
              value:
                est.transaction === "location"
                  ? (est.loyer_estime || "") + " €"
                  : (est.valeur_estimee || est.prix_souhaite || "") + " €",
            },
            { label: "Honoraires TTC", value: euro(hon.honoraires_ttc) + " — " + hon.charge },
            { label: "Durée", value: est.duree_mandat_mois + " mois" },
          ],
          { subtitle: "Projet non signé", kind: "mandat", note: "Projet généré depuis le formulaire en ligne." }
        );
      }
    }
    var be = rootEl.querySelector("#btnPdfEst");
    if (be) be.onclick = function () { openPdf("estimation"); };
    var bm = rootEl.querySelector("#btnPdfMandat");
    if (bm) bm.onclick = function () { openPdf("mandat"); };
  }

  root.CrmImmoOpsUi = {
    renderLocationPipeline: renderLocationPipeline,
    collectLocationPipeline: collectLocationPipeline,
    bindLocationPipeline: bindLocationPipeline,
    renderEstimationMandat: renderEstimationMandat,
    collectEstimationMandat: collectEstimationMandat,
    bindEstimationMandat: bindEstimationMandat,
  };
})(typeof window !== "undefined" ? window : globalThis);
