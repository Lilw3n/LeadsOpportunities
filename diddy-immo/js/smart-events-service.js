/**
 * SmartEvents — inspire smartEventsService.ts multisite
 */
window.SmartEventsService = {
  AI_KEYWORDS: {
    urgent: ["urgent", "asap", "immédiat", "critique", "emergency"],
    positive: ["excellent", "parfait", "super", "génial", "bravo", "merci"],
    negative: ["problème", "erreur", "plainte", "insatisfait", "réclamation", "sinistre"],
    business: ["contrat", "devis", "facture", "paiement", "signature", "accord"],
  },

  analyzeContent: function (content) {
    var lower = String(content || "").toLowerCase();
    var pos = this.AI_KEYWORDS.positive.filter(function (w) {
      return lower.indexOf(w) >= 0;
    }).length;
    var neg = this.AI_KEYWORDS.negative.filter(function (w) {
      return lower.indexOf(w) >= 0;
    }).length;
    var urgent = this.AI_KEYWORDS.urgent.filter(function (w) {
      return lower.indexOf(w) >= 0;
    }).length;
    var sentiment = "neutral";
    if (pos > neg) sentiment = pos > 2 ? "very_positive" : "positive";
    else if (neg > pos) sentiment = neg > 2 ? "very_negative" : "negative";
    var priority = urgent > 0 ? "urgent" : lower.indexOf("important") >= 0 ? "high" : "medium";
    var keywords = [];
    var self = this;
    Object.keys(this.AI_KEYWORDS).forEach(function (cat) {
      self.AI_KEYWORDS[cat].forEach(function (w) {
        if (lower.indexOf(w) >= 0) keywords.push(w);
      });
    });
    return { sentiment: sentiment, priority: priority, urgency: urgent > 0 ? "asap" : "this_week", keywords: keywords };
  },

  enrichEvent: function (e) {
    var text = (e.title || "") + " " + (e.description || "");
    var analysis = this.analyzeContent(text);
    var riskScore = analysis.sentiment === "very_negative" ? 85 : analysis.sentiment === "negative" ? 55 : 20;
    if (analysis.priority === "urgent") riskScore += 15;
    var recommendations = [];
    if (analysis.sentiment === "very_negative") {
      recommendations.push({ title: "Escalade immédiate", description: "Contact prioritaire sous 30 min" });
    }
    if (analysis.priority === "urgent") {
      recommendations.push({ title: "Réponse dans l'heure", description: "Urgence détectée dans le contenu" });
    }
    if (text.toLowerCase().indexOf("devis") >= 0) {
      recommendations.push({ title: "Opportunité commerciale", description: "Relancer avec comparatif personnalisé" });
    }
    return Object.assign({}, e, {
      smart: analysis,
      riskScore: Math.min(100, riskScore),
      recommendations: recommendations,
    });
  },

  analytics: function (events) {
    events = (events || []).map(this.enrichEvent.bind(this));
    var urgent = 0;
    var negative = 0;
    var opportunities = 0;
    events.forEach(function (e) {
      if (e.smart.priority === "urgent") urgent++;
      if (e.smart.sentiment.indexOf("negative") >= 0) negative++;
      if ((e.title || "").toLowerCase().indexOf("devis") >= 0) opportunities++;
    });
    return { total: events.length, urgent: urgent, negative: negative, opportunities: opportunities, enriched: events };
  },

  renderInsights: function (events, escFn) {
    escFn = escFn || function (s) {
      return s;
    };
    var stats = this.analytics(events);
    var html =
      '<div class="smart-insights-panel" style="background:linear-gradient(135deg,#eef2ff,#f5f3ff);border:1px solid #c7d2fe;border-radius:12px;padding:16px;margin-bottom:16px">' +
      "<h3 style='margin:0 0 12px'>🧠 Insights IA</h3>" +
      '<div style="display:flex;gap:16px;flex-wrap:wrap;font-size:.9rem">' +
      "<span><strong>" +
      stats.total +
      "</strong> événements</span>" +
      "<span>⚡ " +
      stats.urgent +
      " urgents</span>" +
      "<span>⚠️ " +
      stats.negative +
      " négatifs</span>" +
      "<span>💰 " +
      stats.opportunities +
      " opportunités</span></div></div>";
    var topRisk = stats.enriched
      .filter(function (e) {
        return e.riskScore >= 50;
      })
      .sort(function (a, b) {
        return b.riskScore - a.riskScore;
      })
      .slice(0, 3);
    if (topRisk.length) {
      html += "<div class='smart-risk-list' style='margin-bottom:16px'><h4 style='margin:0 0 8px'>Priorités IA</h4>";
      topRisk.forEach(function (e) {
        html +=
          "<div style='padding:10px;border-left:3px solid #ef4444;background:#fef2f2;margin-bottom:8px;border-radius:0 8px 8px 0'>" +
          "<strong>" +
          escFn(e.title || "Événement") +
          "</strong> · risque " +
          e.riskScore +
          "%";
        if (e.recommendations.length) {
          html += "<br><small style='color:#64748b'>" + escFn(e.recommendations[0].title) + "</small>";
        }
        html += "</div>";
      });
      html += "</div>";
    }
    return html;
  },

  renderTimeline: function (events, escFn, period) {
    if (!window.CrmSmartTimeline) return "<p>Timeline indisponible</p>";
    return this.renderInsights(events, escFn) + window.CrmSmartTimeline.render(events, escFn, period);
  },
};
