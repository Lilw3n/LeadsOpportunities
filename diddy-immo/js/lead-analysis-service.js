/**
 * Analyse faisabilité & qualification lead — inspire leadAnalysisService.ts multisite
 */
window.LeadAnalysisService = {
  SUBSCRIPTION_CONDITIONS: [
    {
      insurerId: "ASSUREUR_A",
      insurerDisplayName: "Partenaire à étudier A",
      conditions: {
        age: { min: 25, max: 70 },
        geography: { acceptedZones: ["75", "92", "93", "94", "95", "77", "78", "91"], excludedZones: ["971"] },
        budget: { minPremium: 0, maxPremium: null },
        history: { maxClaims: 2 },
      },
      mandate: { commissionRate: null },
    },
    {
      insurerId: "ASSUREUR_B",
      insurerDisplayName: "Partenaire à étudier B",
      conditions: {
        age: { min: 21, max: 75 },
        geography: { acceptedZones: ["all_france"], excludedZones: [] },
        budget: { minPremium: 0, maxPremium: null },
        history: { maxClaims: 3 },
      },
      mandate: { commissionRate: null },
    },
    {
      insurerId: "ASSUREUR_C",
      insurerDisplayName: "Partenaire à étudier C",
      conditions: {
        age: { min: 23, max: 65 },
        geography: { acceptedZones: ["75", "92", "93", "94", "69", "13", "31", "33", "59"], excludedZones: [] },
        budget: { minPremium: 0, maxPremium: null },
        history: { maxClaims: 1 },
      },
      mandate: { commissionRate: null },
    },
  ],

  buildSessionFromWizard: function (data, offers) {
    var age = data.dateOfBirth
      ? new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear()
      : undefined;
    var budget = parseFloat(data.budget) || 0;
    return {
      id: "lead_" + Date.now(),
      sessionData: {
        clientProfile: {
          personalInfo: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            age: age,
            profession: data.professionalActivity || data.companyActivity,
          },
          location: { city: data.city, postalCode: data.postalCode },
        },
        needs: { primaryInsurance: data.insuranceType },
        constraints: {
          budget: { min: Math.round(budget * 0.7), max: budget, preferred: budget },
          timeline: { urgency: data.urgency || "within_month" },
        },
        context: { insuranceHistory: { previousClaims: [] }, offers: offers || [] },
      },
    };
  },

  analyzeFeasibility: function (session) {
    var profile = session.sessionData.clientProfile;
    var constraints = session.sessionData.constraints;
    var self = this;
    var insurerAnalysis = this.SUBSCRIPTION_CONDITIONS.map(function (insurer) {
      return self.analyzeInsurer(insurer, profile, constraints);
    });
    var accepted = insurerAnalysis.filter(function (a) {
      return a.acceptanceLevel === "accepted";
    }).length;
    var conditional = insurerAnalysis.filter(function (a) {
      return a.acceptanceLevel === "conditional";
    }).length;
    var overall = accepted > 0 ? 85 + accepted * 5 : conditional > 0 ? 65 + conditional * 5 : 35;
    return {
      overallFeasibility: Math.min(98, overall),
      insurerAnalysis: insurerAnalysis,
      recommendations: self.buildRecommendations(insurerAnalysis),
      alerts: self.buildAlerts(insurerAnalysis),
    };
  },

  analyzeInsurer: function (insurer, profile, constraints) {
    var score = 100;
    var obstacles = [];
    var metConditions = [];
    var age = profile.personalInfo.age;
    if (age && insurer.conditions.age) {
      if (age < insurer.conditions.age.min) {
        obstacles.push({ type: "profile", description: "Âge minimum " + insurer.conditions.age.min + " ans" });
        score -= 40;
      } else if (age > insurer.conditions.age.max) {
        obstacles.push({ type: "profile", description: "Âge maximum " + insurer.conditions.age.max + " ans" });
        score -= 40;
      } else {
        metConditions.push({ condition: "Âge compatible" });
      }
    }
    var pc = (profile.location.postalCode || "").substring(0, 2);
    var geo = insurer.conditions.geography;
    if (pc && geo && geo.acceptedZones.indexOf("all_france") < 0 && geo.acceptedZones.indexOf(pc) < 0) {
      obstacles.push({ type: "location", description: "Zone " + pc + " non couverte" });
      score -= 25;
    } else if (pc) {
      metConditions.push({ condition: "Zone géographique OK" });
    }
    var budget = constraints.budget.max;
    if (budget > 0) {
      metConditions.push({ condition: "Budget compatible" });
    }
    var level =
      score >= 80 ? "accepted" : score >= 60 ? "conditional" : score >= 40 ? "needs_review" : "rejected";
    return {
      insurerId: insurer.insurerId,
      insurerName: insurer.insurerDisplayName,
      feasibilityScore: Math.max(0, score),
      acceptanceLevel: level,
      metConditions: metConditions,
      obstacles: obstacles,
      adaptations: [],
      priceEstimate: null,
    };
  },

  qualifyLead: function (session, feasibility) {
    var score = 50;
    if (feasibility.overallFeasibility >= 80) score += 25;
    else if (feasibility.overallFeasibility >= 60) score += 15;
    if (session.sessionData.constraints.timeline.urgency === "immediate") score += 15;
    var category = score >= 80 ? "hot" : score >= 60 ? "warm" : score >= 40 ? "cold" : "unqualified";
    var accepted = feasibility.insurerAnalysis.filter(function (a) {
      return a.acceptanceLevel === "accepted" || a.acceptanceLevel === "conditional";
    });
    return {
      qualificationScore: score,
      leadCategory: category,
      conversionProbability: null,
      revenueEstimate: { commission: null, confidence: null },
      recommendedActions: this.buildActions(category),
    };
  },

  buildRecommendations: function (analysis) {
    var recs = [];
    if (analysis.some(function (a) { return a.acceptanceLevel === "accepted"; })) {
      recs.push({
        description: "Profil éligible chez nos partenaires",
        expectedImpact: "Souscription rapide possible",
        actionRequired: "Finaliser le dossier avec un conseiller",
      });
    }
    if (analysis.filter(function (a) {
      return a.obstacles.some(function (o) { return o.type === "budget"; });
    }).length >= 2) {
      recs.push({
        description: "Optimiser le budget ou les garanties",
        expectedImpact: "Plus d'offres disponibles",
        actionRequired: "Revoir franchises et options",
      });
    }
    return recs;
  },

  buildAlerts: function (analysis) {
    var alerts = [];
    if (!analysis.some(function (a) { return a.acceptanceLevel === "accepted"; })) {
      alerts.push({ level: "warning", message: "Profil à adapter pour certains partenaires" });
    }
    return alerts;
  },

  buildActions: function (category) {
    if (category === "hot") {
      return [
        { action: "immediate_call", timing: "Dans les 2 heures", expectedOutcome: "Finalisation dossier" },
        { action: "send_documentation", timing: "Immédiat", expectedOutcome: "Préparation entretien" },
      ];
    }
    if (category === "warm") {
      return [
        { action: "schedule_meeting", timing: "24 heures", expectedOutcome: "Présentation solutions" },
        { action: "email_follow_up", timing: "4 heures", expectedOutcome: "Maintien intérêt" },
      ];
    }
    return [{ action: "email_follow_up", timing: "48 heures", expectedOutcome: "Nurturing prospect" }];
  },

  saveSession: function (session) {
    try {
      var all = JSON.parse(localStorage.getItem("lead_analysis_sessions") || "[]");
      all.unshift(session);
      localStorage.setItem("lead_analysis_sessions", JSON.stringify(all.slice(0, 30)));
    } catch (e) {}
  },
};
