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

  function renderResults(session, feasibility, qualification) {
    var html =
      '<a href="../assurance.html" class="btn btn-ghost">← Assurance</a>' +
      '<header style="margin:24px 0"><h1>Résultats de votre analyse IA</h1>' +
      '<div class="di-score ' +
      scoreClass(feasibility.overallFeasibility) +
      '">' +
      feasibility.overallFeasibility +
      "% faisabilité</div></header>" +
      "<h2>Analyse par partenaires</h2>";

    feasibility.insurerAnalysis.forEach(function (a) {
      var label =
        a.acceptanceLevel === "accepted"
          ? "✅ Accepté"
          : a.acceptanceLevel === "conditional"
            ? "⚠️ Conditionnel"
            : a.acceptanceLevel === "needs_review"
              ? "🔍 À étudier"
              : "❌ Non éligible";
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
        "%</span></div>";
      if (a.priceEstimate) {
        html +=
          '<p style="margin:12px 0 0"><strong>Estimation :</strong> ' +
          a.priceEstimate.min +
          " € – " +
          a.priceEstimate.max +
          " € / an</p>";
      }
      if (a.obstacles.length) {
        html += "<ul style='margin:8px 0 0;font-size:.9rem'>";
        a.obstacles.forEach(function (o) {
          html += "<li>" + esc(o.description) + "</li>";
        });
        html += "</ul>";
      }
      html += "</div>";
    });

    if (feasibility.recommendations.length) {
      html += "<h2>Recommandations</h2><ul>";
      feasibility.recommendations.forEach(function (r) {
        html += "<li><strong>" + esc(r.description) + "</strong> — " + esc(r.actionRequired) + "</li>";
      });
      html += "</ul>";
    }

    html +=
      '<div class="panel" style="margin-top:24px;padding:20px;background:linear-gradient(135deg,#2563eb,#6366f1);color:#fff;border-radius:16px">' +
      "<h2 style='color:#fff'>Prochaines étapes</h2>" +
      "<p>Catégorie : <strong>" +
      (qualification.leadCategory === "hot"
        ? "🔥 Prioritaire"
        : qualification.leadCategory === "warm"
          ? "⭐ Qualifié"
          : "📋 Standard") +
      "</strong> · Conversion estimée " +
      qualification.conversionProbability +
      "% · Commission ~" +
      qualification.revenueEstimate.commission +
      " €</p>" +
      "<p>Un conseiller vous recontacte sous " +
      (qualification.leadCategory === "hot" ? "2 heures" : "24 heures") +
      ".</p>" +
      '<p style="margin-top:16px;display:flex;flex-wrap:wrap;gap:8px">' +
      '<button type="button" class="di-btn" id="btnRestart" style="margin-top:0">Nouvelle analyse</button> ' +
      '<button type="button" class="di-btn" id="btnCopyResults" style="margin-top:0;background:#fff;color:#312e81">Copier résumé</button> ' +
      '<a href="../devis-wizard.html" class="di-btn" style="margin-top:0;display:inline-block;text-decoration:none;background:#10b981;color:#fff">Devis transparent →</a></p></div>';

    results.innerHTML = html;

    document.getElementById("btnCopyResults").onclick = function () {
      var txt =
        "Analyse IA Leads Opportunities\nFaisabilité: " +
        feasibility.overallFeasibility +
        "%\n" +
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
              commissionEstimate: qualification.revenueEstimate.commission,
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
