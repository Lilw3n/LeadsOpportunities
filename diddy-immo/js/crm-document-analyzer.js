/**
 * Analyseur documentaire — inspire DocumentAnalyzer.tsx multisite
 */
window.CrmDocumentAnalyzer = {
  esc: function (s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  },

  renderForm: function (mount) {
    mount.innerHTML =
      '<div class="panel"><h3>Analyse IA (Gemini)</h3>' +
      '<p style="color:var(--muted);font-size:.9rem">Collez le texte d\'un RIB, carte grise, permis ou sinistre.</p>' +
      '<label>Type de document<select id="aiDocType">' +
      '<option value="bank_details">RIB / Coordonnées bancaires</option>' +
      '<option value="vehicle_info">Carte grise / Véhicule</option>' +
      '<option value="driver_info">Permis / Conducteur</option>' +
      '<option value="contract_info">Contrat</option>' +
      '<option value="claim_info">Sinistre</option>' +
      '<option value="generic">Autre</option>' +
      '</select></label>' +
      '<textarea id="aiDocText" rows="8" style="width:100%;margin-top:10px;padding:12px;border:1px solid var(--line);border-radius:10px" placeholder="Collez le contenu OCR ou texte extrait…"></textarea>' +
      '<div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap">' +
      '<button type="button" class="btn btn-primary" id="btnAiAnalyze">Analyser</button>' +
      '<button type="button" class="btn btn-ghost" id="btnAiSummarize">Résumer</button>' +
      '<button type="button" class="btn btn-ghost" id="btnAiAsk">Poser une question</button>' +
      "</div>" +
      '<label style="margin-top:12px;display:block">Question sur le document<input type="text" id="aiDocQuestion" placeholder="Ex: Quel est l\'IBAN ?" style="width:100%;padding:10px;margin-top:4px;border:1px solid var(--line);border-radius:8px" /></label>' +
      "</div><div id='aiResult' style='margin-top:16px'></div>";

    var self = this;
    document.getElementById("btnAiAnalyze").onclick = function () {
      self.analyze(localStorage.getItem("lo_token"));
    };
    document.getElementById("btnAiSummarize").onclick = function () {
      self.summarize(localStorage.getItem("lo_token"));
    };
    document.getElementById("btnAiAsk").onclick = function () {
      self.ask(localStorage.getItem("lo_token"));
    };
  },

  analyze: function (token) {
    var text = document.getElementById("aiDocText").value.trim();
    var type = document.getElementById("aiDocType").value;
    var out = document.getElementById("aiResult");
    if (!text) {
      out.innerHTML = "<p class='alert-item'>Texte requis</p>";
      return;
    }
    out.innerHTML = "<p>Analyse en cours…</p>";
    fetch("/api/ai/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ text: text, documentType: type }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok) {
          out.innerHTML =
            "<div class='panel'><p style='color:#b91c1c'>" +
            this.esc(res.error || "Erreur IA — vérifiez GEMINI_API_KEY sur Vercel") +
            "</p></div>";
          return;
        }
        out.innerHTML =
          "<div class='panel'><h4>Résultat (" +
          this.esc(res.type) +
          ") — confiance " +
          Math.round((res.confidence || 0) * 100) +
          "%</h4><pre style='background:#f8fafc;padding:12px;border-radius:8px;overflow:auto;font-size:.85rem'>" +
          this.esc(JSON.stringify(res.extractedData, null, 2)) +
          "</pre>" +
          (res.suggestions && res.suggestions.length
            ? "<p><strong>Suggestions :</strong> " + this.esc(res.suggestions.join(" · ")) + "</p>"
            : "") +
          "</div>";
      }.bind(this));
  },

  summarize: function (token) {
    var text = document.getElementById("aiDocText").value.trim();
    var out = document.getElementById("aiResult");
    if (!text) {
      out.innerHTML = "<p class='alert-item'>Texte requis</p>";
      return;
    }
    out.innerHTML = "<p>Résumé en cours…</p>";
    fetch("/api/ai/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ text: text }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok) {
          out.innerHTML = "<div class='panel'><p style='color:#b91c1c'>" + this.esc(res.error) + "</p></div>";
          return;
        }
        out.innerHTML = "<div class='panel'><h4>Résumé</h4><p>" + this.esc(res.summary) + "</p></div>";
      }.bind(this));
  },

  ask: function (token) {
    var text = document.getElementById("aiDocText").value.trim();
    var question = document.getElementById("aiDocQuestion").value.trim();
    var out = document.getElementById("aiResult");
    if (!text || !question) {
      out.innerHTML = "<p class='alert-item'>Texte et question requis</p>";
      return;
    }
    out.innerHTML = "<p>Réponse en cours…</p>";
    fetch("/api/ai/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ text: text, question: question }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok) {
          out.innerHTML = "<div class='panel'><p style='color:#b91c1c'>" + this.esc(res.error) + "</p></div>";
          return;
        }
        out.innerHTML = "<div class='panel'><h4>Réponse</h4><p>" + this.esc(res.answer) + "</p></div>";
      }.bind(this));
  },
};
