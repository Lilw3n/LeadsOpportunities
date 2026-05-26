(function () {
  var intro = document.getElementById("stepIntro");
  var wizardStep = document.getElementById("stepWizard");
  var analyzing = document.getElementById("stepAnalyzing");
  var results = document.getElementById("stepResults");
  var LAS = window.LeadAnalysisService;

  function show(el) {
    [intro, wizardStep, analyzing, results].forEach(function (node) {
      node.classList.add("hidden");
    });
    el.classList.remove("hidden");
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;");
  }

  function scoreClass(score) {
    if (score >= 80) return "ok";
    if (score >= 60) return "mid";
    return "low";
  }

  function categoryLabel(category) {
    if (category === "hot") return "Dossier prioritaire";
    if (category === "warm") return "Dossier à préparer";
    return "Dossier à qualifier";
  }

  function renderResults(session, feasibility, qualification) {
    var html =
      '<a href="../assurance.html" class="btn btn-ghost">← Espace assurance</a>' +
      '<header class="di-results-hero"><span class="di-status-pill">Pré-analyse indicative</span><h1>Votre dossier est prêt pour une étude conseiller</h1>' +
      "<p>Ce résultat aide à préparer l'échange. Il ne confirme ni tarif, ni acceptation, ni garantie : les pièces et conditions seront vérifiées avant toute proposition.</p>" +
      '<div class="di-score ' +
      scoreClass(feasibility.overallFeasibility) +
      '">' +
      feasibility.overallFeasibility +
      "% préparation</div></header>" +
      '<section class="di-result-grid">' +
      '<article class="di-result-card"><h2>' +
      categoryLabel(qualification.leadCategory) +
      "</h2><p>Priorité interne pour organiser le rappel et les documents à demander.</p></article>" +
      '<article class="di-result-card"><h2>À confirmer</h2><p>Garanties, tarifs, franchises et partenaires restent soumis à l’étude du dossier.</p></article>' +
      '<article class="di-result-card"><h2>Prochaine action</h2><p>Un conseiller reprend votre demande avec les informations transmises.</p></article>' +
      "</section>" +
      "<h2>Points de compatibilité à vérifier</h2>";

    feasibility.insurerAnalysis.forEach(function (a) {
      var label =
        a.acceptanceLevel === "accepted"
          ? "Compatible à confirmer"
          : a.acceptanceLevel === "conditional"
            ? "Sous réserve"
            : a.acceptanceLevel === "needs_review"
              ? "À étudier"
              : "Non compatible à ce stade";
      html +=
        '<div class="insurer-card ' +
        (a.acceptanceLevel === "accepted"
          ? "accepted"
          : a.acceptanceLevel === "conditional"
            ? "conditional"
            : "rejected") +
        '"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">' +
        "<strong>" +
        esc(a.insurerName) +
        "</strong><span>" +
        label +
        " · " +
        a.feasibilityScore +
        "% préparation</span></div>";
      if (a.obstacles.length) {
        html += "<ul style='margin:8px 0 0;font-size:.9rem'>";
        a.obstacles.forEach(function (o) {
          html += "<li>" + esc(o.description) + "</li>";
        });
        html += "</ul>";
      } else {
        html += '<p style="margin:10px 0 0;color:#64748b;font-size:.9rem">Aucun blocage automatique détecté, sous réserve de vérification des pièces.</p>';
      }
      html += "</div>";
    });

    if (feasibility.recommendations.length) {
      html += '<section class="di-result-card"><h2>Recommandations de préparation</h2><ul>';
      feasibility.recommendations.forEach(function (r) {
        html += "<li><strong>" + esc(r.description) + "</strong> — " + esc(r.actionRequired) + "</li>";
      });
      html += "</ul></section>";
    }

    html +=
      '<div class="di-next-panel">' +
      "<h2>Prochaines étapes</h2>" +
      "<p><strong>" +
      categoryLabel(qualification.leadCategory) +
      "</strong> · Pré-analyse enregistrée. Préparez vos documents utiles pour accélérer l'étude.</p>" +
      "<p>Un conseiller vérifiera les garanties, tarifs, exclusions, franchises et conditions réelles avant toute proposition.</p>" +
      '<div class="di-result-actions">' +
      '<button type="button" class="di-btn" id="btnRestart" style="margin-top:0">Nouvelle pré-analyse</button> ' +
      '<button type="button" class="di-btn" id="btnCopyResults" style="margin-top:0;background:#fff;color:#312e81">Copier le résumé</button> ' +
      '<a href="../devis-wizard.html" class="di-btn di-btn-secondary" style="margin-top:0">Questionnaire classique</a></div></div>';

    results.innerHTML = html;

    document.getElementById("btnCopyResults").onclick = function () {
      var txt =
        "Pré-analyse Leads Opportunities\nScore de préparation: " +
        feasibility.overallFeasibility +
        "%\n" +
        "Catégorie: " +
        categoryLabel(qualification.leadCategory) +
        "\n" +
        feasibility.insurerAnalysis
          .map(function (a) {
            return a.insurerName + ": " + a.acceptanceLevel + " " + a.feasibilityScore + "%";
          })
          .join("\n");
      if (navigator.clipboard) navigator.clipboard.writeText(txt);
      else prompt("Copiez :", txt);
    };
    document.getElementById("btnRestart").onclick = function () {
      show(intro);
      results.innerHTML = "";
    };
  }

  function runAnalysis(data, offers, payload) {
    show(analyzing);
    setTimeout(function () {
      var session = LAS.buildSessionFromWizard(data, offers);
      var feasibility = LAS.analyzeFeasibility(session);
      var qualification = LAS.qualifyLead(session, feasibility);
      session.feasibilityAnalysis = feasibility;
      session.leadQualification = qualification;
      LAS.saveSession(session);

      fetch("/api/external/quote-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          Object.assign({}, payload, {
            source: "devis_intelligent",
            leadAnalysis: {
              feasibilityScore: feasibility.overallFeasibility,
              leadCategory: qualification.leadCategory,
              commissionEstimate: null,
            },
          })
        ),
      }).catch(function () {});

      show(results);
      renderResults(session, feasibility, qualification);
    }, 1200);
  }

  document.getElementById("btnStart").onclick = function () {
    show(wizardStep);
    var ocrHint = "";
    var ocrEl = document.getElementById("ocrPaste");
    if (ocrEl && ocrEl.value.trim()) ocrHint = ocrEl.value.trim();
    window.IntelligentQuoteWizard.render(document.getElementById("wizardMount"), {
      skipSubmit: true,
      ocrHint: ocrHint,
      onWizardComplete: runAnalysis,
    });
  };

  document.getElementById("btnBackIntro").onclick = function () {
    show(intro);
    document.getElementById("wizardMount").innerHTML = "";
  };
})();
