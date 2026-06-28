(function () {
  var TOKEN_KEY = "lo_token";
  var token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function authHeaders() {
    return { Authorization: "Bearer " + token, "Content-Type": "application/json" };
  }

  function statusLabel(status) {
    if (status === "eligible") return "OK";
    if (status === "needs_review") return "A verifier";
    return "Non adapte";
  }

  function renderResult(result) {
    var el = document.getElementById("matchResult");
    if (!result) {
      el.innerHTML = "<p>Aucun resultat.</p>";
      return;
    }
    var best = result.bestActor || {};
    var lead = result.lead || {};
    var matches = result.matches || [];
    el.innerHTML =
      '<div class="acq-stats">' +
      '<span class="acq-stat">Acteur recommande : <strong>' +
      esc(best.partnerName || "Aucun") +
      "</strong></span>" +
      '<span class="acq-stat">Priorite : <strong>' +
      esc((result.insights && result.insights.priority) || "medium") +
      "</strong></span>" +
      '<span class="acq-stat">Source : <strong>' +
      esc(lead.platform || "—") +
      "</strong></span>" +
      "</div>" +
      '<p class="acq-match">' +
      esc((result.insights && result.insights.recommendedAction) || "Completer le questionnaire") +
      "</p>" +
      "<table><thead><tr><th>Acteur</th><th>Verdict</th><th>Score</th><th>Pourquoi</th><th>Vigilances</th></tr></thead><tbody>" +
      matches
        .map(function (m) {
          return (
            "<tr><td><strong>" +
            esc(m.partnerName) +
            "</strong></td><td>" +
            esc(statusLabel(m.status)) +
            "</td><td>" +
            esc(m.score) +
            "</td><td>" +
            esc((m.reasons || []).join(" | ") || "—") +
            "</td><td>" +
            esc([].concat(m.warnings || [], m.rejects || []).join(" | ") || "—") +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table>" +
      "<h3>Pieces a demander</h3><p>" +
      esc((result.documentsToRequest || []).join(" · ")) +
      "</p>";
  }

  function showError(msg) {
    document.getElementById("matchResult").innerHTML = '<p style="color:#b91c1c">' + esc(msg) + "</p>";
  }

  function matchLead(leadId) {
    if (!leadId) return showError("Renseignez un ID lead.");
    document.getElementById("matchResult").innerHTML = "<p>Analyse en cours...</p>";
    fetch("/api/crm/private-offer-match?leadId=" + encodeURIComponent(leadId), { headers: authHeaders() })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) return showError(res.error || "Erreur matching");
        renderResult(res.result);
      })
      .catch(function (e) { showError(String(e)); });
  }

  function testPayload() {
    var bsrRaw = document.getElementById("testBsr").value;
    var assrRaw = document.getElementById("testAssr").value;
    var birthYear = Number(document.getElementById("testBirthYear").value || 0);
    var payload = {
      vertical: "vsp",
      vehicleType: "vsp",
      driverAge: Number(document.getElementById("testAge").value || 0),
      birthYear: birthYear > 1900 ? birthYear : null,
      vspBirthEra: birthYear >= 1988 ? "1988 ou après" : birthYear > 0 ? "Avant 1988" : null,
      hasBsrOrAm: bsrRaw === "yes" ? "Oui, obtenu" : bsrRaw === "pending" ? "En cours" : "Non",
      hasAssr: assrRaw === "yes" ? "Oui" : assrRaw === "no" ? "Non" : assrRaw === "na" ? "Pas concerné" : null,
      garageDepartment: document.getElementById("testDept").value,
      vehicleAgeYears: Number(document.getElementById("testVehicleAge").value || 0),
      licenseIssue: document.getElementById("testIssue").value,
      claims24Months: Number(document.getElementById("testClaims").value || 0),
      platform: document.getElementById("testSource").value,
      leadScore: 75,
      phone: "0600000000",
    };
    document.getElementById("matchResult").innerHTML = "<p>Test en cours...</p>";
    fetch("/api/crm/private-offer-match", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ payload: payload }),
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) return showError(res.error || "Erreur matching");
        renderResult(res.result);
      })
      .catch(function (e) { showError(String(e)); });
  }

  function loadInteresting() {
    document.getElementById("matchResult").innerHTML = "<p>Chargement...</p>";
    fetch("/api/crm/leads-acquisition?view=interesting&limit=25", { headers: authHeaders() })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) return showError(res.error || "Erreur");
        var leads = res.leads || [];
        document.getElementById("matchResult").innerHTML =
          "<table><thead><tr><th>Lead</th><th>Source</th><th>Score</th><th>Action</th></tr></thead><tbody>" +
          leads
            .map(function (l) {
              return (
                "<tr><td>" +
                esc(l.full_name || l.email || l.phone || l.id) +
                "</td><td>" +
                esc(l.platform || l.source || "") +
                "</td><td>" +
                esc(l.lead_score || "") +
                "</td><td><button class='btn btn-ghost btn-sm js-match' data-id='" +
                esc(l.id) +
                "'>Analyser</button></td></tr>"
              );
            })
            .join("") +
          "</tbody></table>";
        document.querySelectorAll(".js-match").forEach(function (btn) {
          btn.onclick = function () { matchLead(btn.getAttribute("data-id")); };
        });
      });
  }

  document.getElementById("btnMatchLead").onclick = function () {
    matchLead(document.getElementById("matchLeadId").value.trim());
  };
  document.getElementById("btnTestPayload").onclick = testPayload;
  document.getElementById("btnLoadHot").onclick = loadInteresting;

  var params = new URLSearchParams(location.search);
  if (params.get("leadId")) {
    document.getElementById("matchLeadId").value = params.get("leadId");
    matchLead(params.get("leadId"));
  }
})();
